import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * GOOGLE OAUTH — STEP 1: redirect the user to Google's consent screen.
 *
 * OAuth 2.0 Authorization Code flow + PKCE (S256) + OIDC nonce, implemented
 * directly to fit this app's cookie-based CustomerSession infrastructure.
 *
 * Four short-lived, HTTP-only cookies bind this transaction to the initiating
 * browser and are validated (and cleared) by the callback:
 *   - state    : CSRF protection (echoed back by Google)
 *   - nonce    : replay protection, verified inside the signed ID token
 *   - verifier : PKCE code_verifier (S256 challenge sent to Google)
 *   - return   : validated same-origin path to return to after sign-in
 */

export const STATE_COOKIE    = 'ab_oauth_state';
export const NONCE_COOKIE    = 'ab_oauth_nonce';
export const VERIFIER_COOKIE = 'ab_oauth_verifier';
export const RETURN_COOKIE   = 'ab_oauth_return';
export const OAUTH_COOKIES   = [STATE_COOKIE, NONCE_COOKIE, VERIFIER_COOKIE, RETURN_COOKIE];

export function isSecureEnv() {
  return process.env.NODE_ENV === 'production' || !!process.env.VERCEL_ENV;
}

/**
 * Canonical origin used to build the Google redirect_uri. This MUST exactly
 * match a URI registered in the Google Cloud console, so in production we only
 * trust an explicit AUTH_URL / NEXT_PUBLIC_SITE_URL — never an arbitrary,
 * client-supplied Host / X-Forwarded-Host header. Returns null if production is
 * misconfigured (the caller then fails closed with `not_configured`).
 */
export function oauthOrigin(req) {
  const env = process.env.AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/+$/, '');
  const host = req.headers.get('host') || '';
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) return `http://${host}`;
  return null;
}

/** Same-origin base for user-facing UX redirects (safe to fall back to the
 *  request's own origin — that's where the browser already is). */
export function appOrigin(req) {
  return oauthOrigin(req) || req.nextUrl.origin;
}

/**
 * Restrict post-login redirects to same-origin relative paths only. Rejects
 * absolute URLs, protocol-relative (`//evil.com`) and backslash tricks to
 * prevent open redirects. Also strips our own auth markers. Defaults to /account.
 */
export function safeReturnTo(raw) {
  if (typeof raw !== 'string') return '/account';
  let p = raw.trim();
  if (!p.startsWith('/')) return '/account';
  if (p.startsWith('//') || p.includes('\\') || p.includes('://')) return '/account';
  if (p.length > 512) return '/account';
  try {
    // Drop any pre-existing auth markers so they don't accumulate.
    const u = new URL(p, 'http://localhost');
    u.searchParams.delete('login');
    u.searchParams.delete('auth_error');
    return `${u.pathname}${u.search}` || '/account';
  } catch {
    return '/account';
  }
}

export async function GET(req) {
  const clientId = process.env.AUTH_GOOGLE_ID;
  const origin   = oauthOrigin(req);
  if (!clientId || !origin) {
    return NextResponse.json(
      { error: 'Google sign-in is not configured.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const redirectUri = `${origin}/api/auth/google/callback`;
  const state     = crypto.randomBytes(32).toString('base64url');
  const nonce     = crypto.randomBytes(32).toString('base64url');
  const verifier  = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  const returnTo  = safeReturnTo(req.nextUrl.searchParams.get('returnTo'));

  const params = new URLSearchParams({
    client_id:             clientId,
    redirect_uri:          redirectUri,
    response_type:         'code',
    scope:                 'openid email profile',
    state,
    nonce,
    code_challenge:        challenge,
    code_challenge_method: 'S256',
    prompt:                'select_account',
  });

  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  res.headers.set('Cache-Control', 'no-store');

  const opts = { httpOnly: true, secure: isSecureEnv(), sameSite: 'lax', maxAge: 600, path: '/' };
  res.cookies.set(STATE_COOKIE,    state,    opts);
  res.cookies.set(NONCE_COOKIE,    nonce,    opts);
  res.cookies.set(VERIFIER_COOKIE, verifier, opts);
  res.cookies.set(RETURN_COOKIE,   returnTo, opts);
  return res;
}
