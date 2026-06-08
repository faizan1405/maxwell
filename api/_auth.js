/* Shared auth helper — JWT verification + CORS headers */
const crypto = require('crypto');

/*
 * ADMIN_JWT_SECRET — required in production.
 * The fallback is only used in true local dev (no VERCEL_ENV, NODE_ENV!=production)
 * so a deploy without the env var fails closed instead of silently accepting
 * forged tokens signed with a public string.
 */
const IS_PROD = process.env.NODE_ENV === 'production' || (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'development');
const SECRET  = process.env.ADMIN_JWT_SECRET
  || (IS_PROD ? null : 'dev-admin-secret-' + (process.env.VERCEL_URL || 'local'));

function b64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

function signJwt(payload) {
  if (!SECRET) throw new Error('ADMIN_JWT_SECRET is not configured');
  const header  = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body    = b64url(JSON.stringify(payload));
  const sig     = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

function verifyJwt(token) {
  if (!SECRET) return null;
  try {
    const [header, body, sig] = (token || '').split('.');
    if (!header || !body || !sig) return null;
    const expected = crypto.createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url');
    const sigBuf = Buffer.from(sig, 'base64url');
    const expBuf = Buffer.from(expected, 'base64url');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function verifySession(req) {
  const header = req.headers['authorization'] || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7).trim() : null;
  if (!token) return null;
  return verifyJwt(token);
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-filename');
}

module.exports = { signJwt, verifyJwt, verifySession, cors };
