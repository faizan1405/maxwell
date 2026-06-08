/* Auth API — POST /api/auth  (body: {action, username, password, token, ...}) */
const crypto          = require('crypto');
const { signJwt, cors } = require('./_auth');

const SALT       = 'ab_salt_2024:';
const SESSION_S  = 8 * 60 * 60; // 8 hours

function sha256hex(text) {
  return crypto.createHash('sha256').update(SALT + text).digest('hex');
}

function getCredentials() {
  // Credentials stored as env vars (set via Vercel dashboard or API)
  // ADMIN_CREDS = JSON array: [{username, passwordHash, role, name, email}, ...]
  try {
    const raw = process.env.ADMIN_CREDS;
    if (raw) return JSON.parse(raw);
  } catch {}
  // Fallback to individual env vars
  return [
    {
      username:     'admin',
      passwordHash: process.env.ADMIN_PASSWORD_HASH || sha256hex('AmahleAdmin2024!'),
      role:         'admin',
      name:         'Admin User',
      email:        'admin@amahle-blue.co.za',
    },
    {
      username:     'manager',
      passwordHash: process.env.MANAGER_PASSWORD_HASH || sha256hex('AmahleManager2024!'),
      role:         'manager',
      name:         'Store Manager',
      email:        'manager@amahle-blue.co.za',
    },
  ];
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
    const user      = creds.find(c => c.username === key && c.passwordHash === inputHash);

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

    const { verifyJwt } = require('./_auth');
    const sess = verifyJwt(reqToken);
    if (!sess) return res.status(401).json({ error: 'Session expired' });

    const creds   = getCredentials();
    const userIdx = creds.findIndex(c => c.username === sess.username);
    if (userIdx === -1) return res.status(404).json({ error: 'User not found' });

    const check = sha256hex(currentPassword);
    if (check !== creds[userIdx].passwordHash) return res.status(401).json({ error: 'Current password incorrect' });

    const newHash = sha256hex(newPassword);
    const updated = [...creds];
    updated[userIdx] = { ...updated[userIdx], passwordHash: newHash };

    // Persist updated credentials to Vercel env var
    const teamId    = process.env.VERCEL_TEAM_ID;
    const projectId = process.env.VERCEL_PROJECT_ID;
    const apiToken  = process.env.VERCEL_API_TOKEN;

    if (teamId && projectId && apiToken) {
      try {
        await fetch(`https://api.vercel.com/v9/projects/${projectId}/env?teamId=${teamId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'ADMIN_CREDS', value: JSON.stringify(updated), type: 'encrypted', target: ['production', 'preview', 'development'] }),
        });
      } catch {}
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Unknown action' });
};
