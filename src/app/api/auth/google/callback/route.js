import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { connectToDatabase } from '../../../../../lib/mongoose';
import { Customer, CustomerSession, Order } from '../../../../../lib/models';
import {
  generateSessionToken, hashSessionToken, setSessionCookie, verifyCustomerCookie,
} from '../../../../../lib/customerAuth';
import {
  STATE_COOKIE, NONCE_COOKIE, VERIFIER_COOKIE, RETURN_COOKIE, OAUTH_COOKIES,
  oauthOrigin, appOrigin, safeReturnTo, isSecureEnv,
} from '../route';

/**
 * GOOGLE OAUTH — STEP 2: handle Google's redirect back to our app.
 *
 *   1. Validate `state` (CSRF) FIRST — before trusting any other query param,
 *      including Google's own `error`.
 *   2. Exchange the code for tokens using the PKCE code_verifier.
 *   3. CRYPTOGRAPHICALLY VERIFY the ID token (signature via Google JWKS, plus
 *      iss / aud / exp) using google-auth-library — never a bare decode.
 *   4. Verify the nonce (replay protection) and email_verified.
 *   5. Resolve the customer by the permanent Google `sub`. Auto-link an existing
 *      account by email only when Google is authoritative for that email
 *      (@gmail.com, or verified + Workspace `hd`) or the request is already
 *      authenticated as that customer — via an atomic, race-safe update.
 *   6. Mint a CustomerSession and set the shared `ab_cust_session` cookie.
 *
 * All temporary OAuth cookies are cleared on every outcome; every response is
 * `Cache-Control: no-store`. No codes, tokens, verifiers or nonces are logged.
 */

function timingSafeEqualStr(a, b) {
  const ab = Buffer.from(String(a || ''));
  const bb = Buffer.from(String(b || ''));
  if (ab.length === 0 || ab.length !== bb.length) return false; // length checked before compare
  return crypto.timingSafeEqual(ab, bb);
}

// Google is authoritative for the mailbox when it owns the domain: consumer
// Gmail, or a Workspace domain (the `hd` claim) with a verified email. For any
// other verified email we must NOT silently trust ownership.
function isGoogleAuthoritative(email, payload) {
  if (payload.email_verified !== true) return false;
  if (email.endsWith('@gmail.com') || email.endsWith('@googlemail.com')) return true;
  if (payload.hd && String(payload.hd).trim().length > 0) return true;
  return false;
}

// Atomic conditional link: set googleSub ONLY when it is currently absent, and
// fill name/avatar only if blank (never overwrite user-edited data). Returns the
// updated doc, or null if another concurrent request already claimed it.
function linkGoogleSub(email, sub, payload, now) {
  return Customer.findOneAndUpdate(
    { email, $or: [{ googleSub: { $exists: false } }, { googleSub: null }] },
    [{
      $set: {
        googleSub: sub,
        name:      { $cond: [{ $in: ['$name', [null, '']] }, payload.name || '', '$name'] },
        avatar:    { $cond: [{ $in: ['$avatar', [null, '']] }, payload.picture || '', '$avatar'] },
        updatedAt: now,
      },
    }],
    { new: true }
  );
}

export async function GET(req) {
  const secure   = isSecureEnv();
  const base     = appOrigin(req);
  const returnTo = safeReturnTo(req.cookies.get(RETURN_COOKIE)?.value);

  // Every outcome routes through here: clears all temporary OAuth cookies and
  // is never cached.
  const redirectTo = (path) => {
    const res = NextResponse.redirect(`${base}${path}`);
    res.headers.set('Cache-Control', 'no-store');
    for (const c of OAUTH_COOKIES) {
      res.cookies.set(c, '', { httpOnly: true, secure, sameSite: 'lax', maxAge: 0, path: '/' });
    }
    return res;
  };
  const fail    = (reason) => redirectTo(`/account?auth_error=${encodeURIComponent(reason)}`);
  const success = () => {
    const sep = returnTo.includes('?') ? '&' : '?';
    return redirectTo(`${returnTo}${sep}login=google`);
  };

  const url   = req.nextUrl;
  const code  = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  // (7) Validate state BEFORE trusting Google's `error` or anything else.
  const stateCookie = req.cookies.get(STATE_COOKIE)?.value;
  if (!timingSafeEqualStr(stateCookie, state)) return fail('bad_state');

  // Only now is it safe to act on the provider-supplied error param.
  const providerErr = url.searchParams.get('error');
  if (providerErr) return fail(providerErr === 'access_denied' ? 'access_denied' : 'provider_error');
  if (!code) return fail('missing_code');

  const verifier    = req.cookies.get(VERIFIER_COOKIE)?.value;
  const nonceCookie = req.cookies.get(NONCE_COOKIE)?.value;
  if (!verifier || !nonceCookie) return fail('bad_state');

  const clientId     = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  const origin       = oauthOrigin(req);
  if (!clientId || !clientSecret || !origin) return fail('not_configured');

  const redirectUri = `${origin}/api/auth/google/callback`;
  const client = new OAuth2Client({ clientId, clientSecret, redirectUri });

  // Exchange the authorization code (with PKCE verifier) for tokens.
  let idToken;
  try {
    const { tokens } = await client.getToken({ code, codeVerifier: verifier });
    idToken = tokens?.id_token;
    if (!idToken) throw new Error('no id_token');
  } catch {
    console.error('[google] token exchange failed'); // never log the code/tokens
    return fail('token_exchange');
  }

  // Cryptographically verify the ID token: signature (Google JWKS), iss, aud, exp.
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    payload = ticket.getPayload();
  } catch {
    console.error('[google] id_token verification failed');
    return fail('bad_token');
  }
  if (!payload) return fail('bad_token');

  const iss = payload.iss || '';
  if (iss !== 'https://accounts.google.com' && iss !== 'accounts.google.com') return fail('bad_token');
  if (!timingSafeEqualStr(payload.nonce, nonceCookie)) return fail('bad_state');

  const sub = payload.sub;
  if (!sub) return fail('bad_token');
  const email = String(payload.email || '').trim().toLowerCase();
  if (!email || payload.email_verified !== true) return fail('email_unverified');

  try {
    await connectToDatabase();
  } catch {
    console.error('[google] db connect failed');
    return fail('db_error');
  }

  const now = Date.now();
  let customer   = null;
  let firstLink  = false; // true only when the Google identity is newly attached
  let mayClaim   = false; // whether we're allowed to inherit this email's guest data

  try {
    // 1) Primary lookup: permanent Google identity.
    customer = await Customer.findOne({ googleSub: sub });

    if (customer) {
      // Returning login — never mutate profile data.
      mayClaim = false;
    } else {
      const byEmail = await Customer.findOne({ email });

      if (byEmail && byEmail.googleSub) {
        // Already linked to some Google identity.
        if (timingSafeEqualStr(byEmail.googleSub, sub)) {
          customer = byEmail; // race: linked concurrently to the same sub
        } else {
          return fail('account_conflict'); // genuine identity collision
        }
      } else if (byEmail) {
        // (1) An existing legacy account with the same email but no Google link.
        // Only link when Google is authoritative for the email, OR the caller is
        // already authenticated as this exact customer.
        const authoritative = isGoogleAuthoritative(email, payload);
        let alreadyAuthedSame = false;
        if (!authoritative) {
          const authed = await verifyCustomerCookie(req);
          alreadyAuthedSame = !!authed && authed.customerId === byEmail.id;
        }
        if (!authoritative && !alreadyAuthedSame) {
          // Never silently take over a legacy account we can't attribute.
          return fail('account_exists');
        }

        const linked = await linkGoogleSub(email, sub, payload, now);
        if (linked) {
          customer  = linked;
          firstLink = true;
          mayClaim  = true;
        } else {
          // Lost the race — re-read and validate the winner.
          customer = await Customer.findOne({ googleSub: sub });
          if (!customer) customer = await Customer.findOne({ email });
          if (customer?.googleSub && !timingSafeEqualStr(customer.googleSub, sub)) {
            return fail('account_conflict');
          }
        }
      } else {
        // 3) Brand-new customer. Role is left to the schema default ('user') —
        //    Google claims never grant admin.
        customer = await Customer.create({
          id:        `cust_${now}_${crypto.randomBytes(4).toString('hex')}`,
          email,
          googleSub: sub,
          name:      payload.name    || '',
          phone:     '',
          avatar:    payload.picture || '',
          addresses: [],
        });
        firstLink = true;
        // Only inherit guest orders for a brand-new account when Google is
        // authoritative for the email — otherwise leave them unlinked.
        mayClaim = isGoogleAuthoritative(email, payload);
      }
    }
  } catch (e) {
    if (e && e.code === 11000) {
      // Duplicate-key race (email or googleSub) — the row now exists; adopt it.
      try {
        customer = await Customer.findOne({ googleSub: sub }) || await Customer.findOne({ email });
      } catch { /* ignore */ }
      firstLink = false;
      mayClaim  = false;
      if (!customer) return fail('db_error');
      if (customer.googleSub && !timingSafeEqualStr(customer.googleSub, sub)) return fail('account_conflict');
    } else {
      console.error('[google] customer resolve failed:', e?.code || e?.name || 'error');
      return fail('db_error');
    }
  }

  if (!customer) return fail('db_error');

  /* Guest-order backfill — ONLY on first link/creation, ONLY when we may claim
   * the email (authoritative or already-authenticated), matched on the verified
   * email, and ONLY for orders with no owner. Never reassigns another
   * customer's orders and never re-scans on repeat logins. */
  if (firstLink && mayClaim) {
    try {
      await Order.updateMany(
        {
          $and: [
            { $or: [{ customerId: null }, { customerId: { $exists: false } }] },
            { $or: [{ 'customer.email': email }, { customerEmail: email }] },
          ],
        },
        { $set: { customerId: customer.id, 'customer.id': customer.id, updatedAt: now } }
      );
    } catch {
      console.error('[google] guest-order backfill failed');
    }
  }

  // Mint a fresh session (rotates on every successful login) and set the cookie.
  let rawToken;
  try {
    rawToken = generateSessionToken();
    const tokenHash = hashSessionToken(rawToken);
    await CustomerSession.create({
      id:         `sess_${now}_${crypto.randomBytes(4).toString('hex')}`,
      customerId: customer.id,
      email:      customer.email,
      tokenHash,
      expiresAt:  now + 30 * 24 * 60 * 60 * 1000,
      createdAt:  now,
    });
  } catch {
    console.error('[google] session create failed');
    return fail('session_error');
  }

  const res = success();
  setSessionCookie(res, rawToken);
  return res;
}
