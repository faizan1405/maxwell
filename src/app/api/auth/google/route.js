import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * GOOGLE OAUTH — STEP 1: redirect the user to Google's consent screen.
 *
 * We implement the OAuth 2.0 Authorization Code flow directly (no NextAuth),
 * to fit this app's existing cookie-based CustomerSession infrastructure.
 *
 * A random `state` value is generated for CSRF protection: it is stored in an
 * HTTP-only cookie AND sent to Google. The callback rejects the request unless
 * the returned `state` matches the cookie.
 */

const STATE_COOKIE = 'ab_oauth_state';

// Builds the public origin of this deployment (e.g. https://amahle-blue.co.za).
// Honours AUTH_URL / NEXT_PUBLIC_SITE_URL when set, else derives from request
// headers. Falls back to http for localhost so dev redirect URIs match.
export function baseUrl(req) {
  const envUrl = process.env.AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');
  const host  = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  const proto = req.headers.get('x-forwarded-proto') || (isLocal ? 'http' : 'https');
  return `${proto}://${host}`;
}

export async function GET(req) {
  const clientId = process.env.AUTH_GOOGLE_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'Google sign-in is not configured.' }, { status: 500 });
  }

  const redirectUri = `${baseUrl(req)}/api/auth/google/callback`;
  const state = crypto.randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'openid email profile',
    state,
    prompt:        'select_account',
  });

  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  const secure = process.env.NODE_ENV === 'production' || !!process.env.VERCEL_ENV;
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge:   600, // 10 minutes to complete the consent flow
    path:     '/',
  });
  return res;
}
