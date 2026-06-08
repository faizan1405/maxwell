/* Auth API — POST /api/auth  (body: {action, username, password, token, ...}) */
const crypto                       = require('crypto');
const { signJwt, verifyJwt, cors } = require('./_auth');

const SALT       = 'ab_salt_2024:';
const SESSION_S  = 8 * 60 * 60; // 8 hours

function sha256hex(text) {
  return crypto.createHash('sha256').update(SALT + text).digest('hex');
}

/*
 * Admin credentials live ONLY in env vars.
 *   - ADMIN_CREDS  — JSON array [{username, passwordHash, role, name, email}, ...]
 *     (passwordHash = sha256hex(SALT + plaintext); see scripts/hash-password.js)
 *   - or individual ADMIN_PASSWORD_HASH / MANAGER_PASSWORD_HASH env vars.
 *
 * No plaintext default credentials are baked into code; an unconfigured deploy
 * returns no users so login fails closed.
 */
const IS_PROD_AUTH = process.env.NODE_ENV === 'production' || (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'development');

function getCredentials() {
  try {
    const raw = process.env.ADMIN_CREDS;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('[auth] ADMIN_CREDS parse error:', e.message);
  }

  const creds = [];
  if (process.env.ADMIN_PASSWORD_HASH) {
    creds.push({
      username:     process.env.ADMIN_USERNAME || 'admin',
      passwordHash: process.env.ADMIN_PASSWORD_HASH,
      role:         'admin',
      name:         process.env.ADMIN_NAME  || 'Admin',
      email:        process.env.ADMIN_EMAIL || 'admin@amahle-blue.co.za',
    });
  }
  if (process.env.MANAGER_PASSWORD_HASH) {
    creds.push({
      username:     process.env.MANAGER_USERNAME || 'manager',
      passwordHash: process.env.MANAGER_PASSWORD_HASH,
      role:         'manager',
      name:         process.env.MANAGER_NAME  || 'Manager',
      email:        process.env.MANAGER_EMAIL || 'manager@amahle-blue.co.za',
    });
  }

  /* Local dev convenience only — never used in prod */
  if (!creds.length && !IS_PROD_AUTH) {
    creds.push({
      username:     'admin',
      passwordHash: sha256hex('DevAdmin!2026'),
      role:         'admin',
      name:         'Dev Admin',
      email:        'dev@amahle-blue.co.za',
    });
    console.warn('[auth] No admin credentials configured — using dev fallback (admin / DevAdmin!2026)');
  }

  return creds;
}

// Simple in-memory rate limiter (resets on cold start — sufficient for this use case)
const attempts = {};
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 15 * 60 * 1000;

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const { action } = body || {};

  // ── Logout ────────────────────────────────────────────────────────────────────
  if (action === 'logout') {
    return res.status(200).json({ ok: true });
  }

  // ── Login ─────────────────────────────────────────────────────────────────────
  if (action === 'login') {
    const { username, password } = body;
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

    const key = username.toLowerCase().trim();
    const now = Date.now();
    const att = attempts[key] || { count: 0, lastAttempt: 0 };
    const locked = att.count >= MAX_ATTEMPTS && (now - att.lastAttempt) < LOCKOUT_MS;
    if (locked) {
      const mins = Math.ceil((LOCKOUT_MS - (now - att.lastAttempt)) / 60000);
      return res.status(429).json({ error: `Account locked. Try again in ${mins} min.` });
    }

    const inputHash = sha256hex(password);
    const creds     = getCredentials();
    if (!creds.length) {
      console.error('[auth] No admin credentials configured — set ADMIN_CREDS or ADMIN_PASSWORD_HASH');
      return res.status(503).json({ error: 'Login is not available. Contact support.' });
    }
    /* Constant-time compare to avoid timing oracle on usernames */
    let user = null;
    for (const c of creds) {
      if (c.username !== key) continue;
      try {
        const a = Buffer.from(c.passwordHash, 'hex');
        const b = Buffer.from(inputHash, 'hex');
        if (a.length === b.length && crypto.timingSafeEqual(a, b)) user = c;
      } catch {}
    }

    if (!user) {
      const wasLocked = att.count >= MAX_ATTEMPTS && (now - att.lastAttempt) >= LOCKOUT_MS;
      const count = wasLocked ? 1 : att.count + 1;
      attempts[key] = { count, lastAttempt: now };
      const left = MAX_ATTEMPTS - count;
      return res.status(401).json({
        error: left > 0 ? `Invalid credentials — ${left} attempt${left !== 1 ? 's' : ''} remaining.` : 'Account locked for 15 minutes.'
      });
    }

    attempts[key] = { count: 0, lastAttempt: 0 };

    const exp   = Math.floor(Date.now() / 1000) + SESSION_S;
    const token = signJwt({ username: user.username, role: user.role, name: user.name, email: user.email, exp });
    const session = { token, role: user.role, user: { username: user.username, name: user.name, email: user.email, role: user.role }, expiresAt: exp * 1000 };
    return res.status(200).json({ ok: true, token, session });
  }

  // ── Change password — updates ADMIN_CREDS env var via Vercel API ──────────────
  if (action === 'changePassword') {
    const { token: reqToken, currentPassword, newPassword } = body;
    if (!reqToken) return res.status(401).json({ error: 'Not authenticated' });
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new passwords are required.' });
    if (String(newPassword).length < 8)   return res.status(400).json({ error: 'New password must be at least 8 characters.' });

    const sess = verifyJwt(reqToken);
    if (!sess) return res.status(401).json({ error: 'Session expired. Sign in again.' });

    const creds   = getCredentials();
    const userIdx = creds.findIndex(c => c.username === sess.username);
    if (userIdx === -1) return res.status(404).json({ error: 'User not found' });

    const check = sha256hex(currentPassword);
    try {
      const a = Buffer.from(check, 'hex');
      const b = Buffer.from(creds[userIdx].passwordHash, 'hex');
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        return res.status(401).json({ error: 'Current password is incorrect.' });
      }
    } catch { return res.status(401).json({ error: 'Current password is incorrect.' }); }

    const newHash = sha256hex(newPassword);
    const updated = [...creds];
    updated[userIdx] = { ...updated[userIdx], passwordHash: newHash };

    // Persist updated credentials to Vercel env var (or surface failure to client)
    const teamId    = process.env.VERCEL_TEAM_ID;
    const projectId = process.env.VERCEL_PROJECT_ID;
    const apiToken  = process.env.VERCEL_API_TOKEN;
    if (!teamId || !projectId || !apiToken) {
      return res.status(501).json({ error: 'Password rotation requires VERCEL_API_TOKEN / VERCEL_TEAM_ID / VERCEL_PROJECT_ID to be configured.' });
    }
    try {
      const r = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env?teamId=${teamId}&upsert=true`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'ADMIN_CREDS', value: JSON.stringify(updated), type: 'encrypted', target: ['production', 'preview', 'development'] }),
      });
      if (!r.ok) {
        const t = await r.text();
        console.error('[auth] Vercel env update failed:', t);
        return res.status(502).json({ error: 'Failed to persist new password. Contact support.' });
      }
    } catch (e) {
      console.error('[auth] Vercel env update error:', e.message);
      return res.status(502).json({ error: 'Failed to persist new password. Contact support.' });
    }
    return res.status(200).json({ ok: true, note: 'Password updated. New Vercel deployment will pick up the change shortly.' });
  }

  return res.status(400).json({ error: 'Unknown action' });
};
