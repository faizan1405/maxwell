import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '../../../../../lib/mongoose';
import { Customer, CustomerSession, Order } from '../../../../../lib/models';
import { generateSessionToken, hashSessionToken, setSessionCookie } from '../../../../../lib/customerAuth';
import { saPhoneRegexes, saPhoneVariants } from '../../../../../utils/phone';
import { baseUrl } from '../route';

/**
 * GOOGLE OAUTH — STEP 2: handle Google's redirect back to our app.
 *
 * Flow:
 *   1. Validate the `state` (CSRF) against the cookie set in step 1.
 *   2. Exchange the authorization `code` for tokens at Google's token endpoint.
 *   3. Decode the `id_token` (a Google-signed JWT delivered over TLS straight
 *      from the token endpoint) to read the verified email + profile.
 *   4. Upsert a Customer, mint a CustomerSession, and set the same
 *      `ab_cust_session` cookie the rest of the app already understands.
 *
 * On any failure we redirect to /account with an `auth_error` query param so
 * the storefront can surface a friendly message.
 */

const STATE_COOKIE = 'ab_oauth_state';

function decodeJwtPayload(idToken) {
  const part = (idToken || '').split('.')[1];
  if (!part) return null;
  try { return JSON.parse(Buffer.from(part, 'base64url').toString()); }
  catch { return null; }
}

export async function GET(req) {
  const url  = req.nextUrl;
  const base = baseUrl(req);
  const secure = process.env.NODE_ENV === 'production' || !!process.env.VERCEL_ENV;

  const fail = (reason) => {
    const res = NextResponse.redirect(`${base}/account?auth_error=${encodeURIComponent(reason)}`);
    res.cookies.set(STATE_COOKIE, '', { httpOnly: true, secure, sameSite: 'lax', maxAge: 0, path: '/' });
    return res;
  };

  const code  = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (url.searchParams.get('error')) return fail(url.searchParams.get('error'));
  if (!code) return fail('missing_code');

  // CSRF: returned state must match the state cookie from step 1.
  const stateCookie = req.cookies.get(STATE_COOKIE)?.value;
  if (!stateCookie || !state || stateCookie !== state) return fail('bad_state');

  const clientId     = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  if (!clientId || !clientSecret) return fail('not_configured');

  const redirectUri = `${base}/api/auth/google/callback`;

  // Exchange the authorization code for tokens.
  let tokenData;
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
      }),
    });
    tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error('[google] token exchange failed:', tokenData);
      return fail('token_exchange');
    }
  } catch (e) {
    console.error('[google] token fetch error:', e.message);
    return fail('token_network');
  }

  // The id_token comes directly from Google's token endpoint over TLS, so
  // decoding (rather than full JWKS verification) is safe here. We still check
  // the audience and that the email is verified.
  const profile = decodeJwtPayload(tokenData.id_token);
  if (!profile || profile.aud !== clientId) return fail('bad_token');

  const email = String(profile.email || '').trim().toLowerCase();
  if (!email || profile.email_verified === false) return fail('email_unverified');

  await connectToDatabase();
  const now = Date.now();

  let customer = await Customer.findOne({ email });
  if (!customer) {
    customer = await Customer.create({
      id:        `cust_${now}_${crypto.randomBytes(4).toString('hex')}`,
      email,
      name:      profile.name    || '',
      phone:     '',
      avatar:    profile.picture || '',
      addresses: [],
    });
  } else {
    // Backfill name/avatar from Google only when we don't already have them.
    let dirty = false;
    if (!customer.name   && profile.name)    { customer.name   = profile.name;    dirty = true; }
    if (!customer.avatar && profile.picture) { customer.avatar = profile.picture; dirty = true; }
    if (dirty) { customer.updatedAt = now; await customer.save(); }
  }

  /* Link any guest orders placed with this email (or this customer's phone)
   * back to the now-authenticated customer — same behaviour as the previous
   * email-OTP sign-in. Best-effort: failures here must not block sign-in. */
  try {
    const phone = String(customer.phone || '').trim();
    const phoneMatches = [
      ...saPhoneVariants(phone).map(v => ({ 'customer.phone': v })),
      ...saPhoneRegexes(phone).map(regex => ({ 'customer.phone': regex })),
    ];
    const orMatch = [
      { 'customer.email': email },
      { customerEmail: email },
      ...phoneMatches,
    ];
    await Order.updateMany(
      {
        $and: [
          { $or: [{ customerId: null }, { customerId: { $exists: false } }] },
          { $or: orMatch },
        ],
      },
      { $set: { customerId: customer.id, 'customer.id': customer.id, updatedAt: now } }
    );
  } catch (e) {
    console.error('[google] guest-order backfill failed:', e.message);
  }

  // Mint a session and set the shared customer-session cookie.
  const rawToken  = generateSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = now + 30 * 24 * 60 * 60 * 1000;

  await CustomerSession.create({
    id:         `sess_${now}_${crypto.randomBytes(4).toString('hex')}`,
    customerId: customer.id,
    email:      customer.email,
    tokenHash,
    expiresAt,
    createdAt:  now,
  });

  const res = NextResponse.redirect(`${base}/account?login=google`);
  setSessionCookie(res, rawToken);
  res.cookies.set(STATE_COOKIE, '', { httpOnly: true, secure, sameSite: 'lax', maxAge: 0, path: '/' });
  return res;
}
