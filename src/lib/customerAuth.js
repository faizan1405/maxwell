import crypto from 'crypto';
import { connectToDatabase } from './mongoose';
import { CustomerSession } from './models';

const COOKIE = 'ab_cust_session';
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

/**
 * Centralised retrieval + validation of the customer session secret.
 *
 * SESSION_SECRET is REQUIRED. There is deliberately NO fallback to an unsalted
 * SHA-256 hash: an attacker who could predict/compute an unsalted token hash
 * could forge sessions. If the secret is missing we fail closed so the
 * misconfiguration is obvious rather than silently insecure.
 *
 * @throws {Error} when SESSION_SECRET is not configured.
 */
function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not configured');
  return secret;
}

export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * HMAC-SHA256 of the opaque session token, keyed by SESSION_SECRET. The token
 * format is unchanged from before — the same secret produces the same hash, so
 * sessions minted while SESSION_SECRET was configured remain valid.
 */
export function hashSessionToken(raw) {
  return crypto.createHmac('sha256', getSessionSecret()).update(raw).digest('hex');
}

// Environment-aware Secure flag: HTTPS-only cookies in production / on Vercel.
function isSecureEnv() {
  return process.env.NODE_ENV === 'production' || !!process.env.VERCEL_ENV;
}

/**
 * Single source of truth for the ab_cust_session cookie attributes. Both the
 * set and clear paths use this so path / SameSite / Secure never diverge.
 */
function sessionCookieOptions(maxAge) {
  return { httpOnly: true, secure: isSecureEnv(), sameSite: 'lax', path: '/', maxAge };
}

export function setSessionCookie(res, rawToken) {
  res.cookies.set(COOKIE, rawToken, sessionCookieOptions(SESSION_TTL_SECONDS));
}

export function clearSessionCookie(res) {
  res.cookies.set(COOKIE, '', sessionCookieOptions(0));
}

export async function verifyCustomerCookie(req) {
  const cookie = req.cookies.get(COOKIE);
  if (!cookie?.value) return null;

  // Fail closed: if the secret is missing, hashSessionToken throws. We never
  // fall back to a weaker comparison — an unverifiable cookie grants no access.
  let tokenHash;
  try {
    tokenHash = hashSessionToken(cookie.value);
  } catch (e) {
    console.error('[customerAuth] session verification unavailable:', e.message);
    return null;
  }

  await connectToDatabase();

  const session = await CustomerSession.findOne({
    tokenHash,
    expiresAt: { $gt: Date.now() },
  }).lean();

  if (!session) return null;
  return { customerId: session.customerId, email: session.email };
}
