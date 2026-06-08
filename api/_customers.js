/* Customer auth helpers — OTP JWT, session JWT, Blob CRUD, Resend/Gmail email */
const crypto     = require('crypto');
const nodemailer = require('nodemailer');
const { readBlob, writeBlob } = require('./_blob');

/*
 * CUSTOMER_JWT_SECRET — required in production.
 * In dev (NODE_ENV !== 'production') a stable per-process fallback is used so the
 * dev server keeps working without setup, but production deploys MUST set this
 * env var or the API will reject all auth.
 */
const IS_PROD          = process.env.NODE_ENV === 'production' || !!process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'development';
const CUSTOMER_SECRET  = process.env.CUSTOMER_JWT_SECRET
  || (IS_PROD ? null : 'dev-customer-secret-' + (process.env.VERCEL_URL || 'local'));
const OTP_SECRET       = CUSTOMER_SECRET ? CUSTOMER_SECRET + '_otp_v1' : null;
const CUSTOMERS_PATH   = 'data/maxwell-customers.json';

function assertSecret() {
  if (!CUSTOMER_SECRET) {
    const err = new Error('CUSTOMER_JWT_SECRET is not configured');
    err.code = 'MISSING_SECRET';
    throw err;
  }
}

// ── JWT helpers ───────────────────────────────────────────────────────────────
function b64url(buf) { return Buffer.from(buf).toString('base64url'); }

function sign(payload, secret) {
  const h = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const b = b64url(JSON.stringify(payload));
  const s = crypto.createHmac('sha256', secret).update(`${h}.${b}`).digest('base64url');
  return `${h}.${b}.${s}`;
}

function verify(token, secret) {
  try {
    const [h, b, s] = (token || '').split('.');
    const expected = crypto.createHmac('sha256', secret).update(`${h}.${b}`).digest('base64url');
    if (s !== expected) return null;
    const payload = JSON.parse(Buffer.from(b, 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

// ── OTP token (stateless — 10 min) ───────────────────────────────────────────
function createOtpToken(email, otp) {
  assertSecret();
  return sign({
    email: email.toLowerCase(),
    otpHash: crypto.createHash('sha256').update(otp).digest('hex'),
    type: 'otp_verify',
    exp: Math.floor(Date.now() / 1000) + 600,
    iat: Math.floor(Date.now() / 1000),
  }, OTP_SECRET);
}

function verifyOtpToken(token, otp) {
  if (!OTP_SECRET) return null;
  const p = verify(token, OTP_SECRET);
  if (!p || p.type !== 'otp_verify') return null;
  const expected = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
  // Constant-time compare to avoid timing leaks
  try {
    const a = Buffer.from(p.otpHash, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  } catch { return null; }
  return p;
}

// ── Session token (30 days) ───────────────────────────────────────────────────
function createSessionToken(customer) {
  assertSecret();
  return sign({
    customerId: customer.id,
    email: customer.email,
    type: 'customer_session',
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    iat: Math.floor(Date.now() / 1000),
  }, CUSTOMER_SECRET);
}

function verifySessionToken(token) {
  if (!CUSTOMER_SECRET) return null;
  const p = verify(token, CUSTOMER_SECRET);
  if (!p || p.type !== 'customer_session') return null;
  return p;
}

function verifyCustomerSession(req) {
  const h = req.headers['authorization'] || '';
  const t = h.startsWith('Bearer ') ? h.slice(7).trim() : null;
  if (!t) return null;
  return verifySessionToken(t);
}

// ── Rate limiting (best-effort in-memory) ─────────────────────────────────────
const _rateLimits = new Map();
const RL_MAX = 3, RL_WINDOW = 15 * 60 * 1000;

function checkRateLimit(email) {
  const now = Date.now();
  const key = email.toLowerCase();
  const hits = (_rateLimits.get(key) || []).filter(t => now - t < RL_WINDOW);
  if (hits.length >= RL_MAX) {
    const retryAfter = Math.ceil((hits[0] + RL_WINDOW - now) / 60000);
    return { limited: true, retryAfter };
  }
  hits.push(now);
  _rateLimits.set(key, hits);
  return { limited: false };
}

// ── Customer data (Vercel Blob) ───────────────────────────────────────────────
async function getCustomers()               { return (await readBlob(CUSTOMERS_PATH)) || []; }
async function saveCustomers(list)          { await writeBlob(CUSTOMERS_PATH, list); }

async function findByEmail(email) {
  const list = await getCustomers();
  return list.find(c => c.email === email.toLowerCase()) || null;
}

async function findById(id) {
  const list = await getCustomers();
  return list.find(c => c.id === id) || null;
}

async function createCustomer(email) {
  const list = await getCustomers();
  const c = {
    id: `cust_${Date.now()}`,
    email: email.toLowerCase(),
    name: '',
    phone: '',
    addresses: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await saveCustomers([...list, c]);
  return c;
}

async function updateCustomer(id, patch) {
  const list = await getCustomers();
  const idx = list.findIndex(c => c.id === id);
  if (idx === -1) return null;
  const updated = { ...list[idx], ...patch, updatedAt: Date.now() };
  const next = [...list]; next[idx] = updated;
  await saveCustomers(next);
  return updated;
}

// ── Email helpers ─────────────────────────────────────────────────────────────
function buildOtpHtml(otp, name) {
  const hi = name ? `Hi ${name.split(' ')[0]},` : 'Hi there,';
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Helvetica,Arial,sans-serif;">
<div style="max-width:500px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(11,37,69,.10);">
  <div style="background:linear-gradient(135deg,#1E50E0,#0B2545);padding:32px 40px;text-align:center;">
    <p style="color:#7FC4FF;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Amahle Blue</p>
    <h1 style="color:#fff;font-size:20px;font-weight:800;margin:0;">Your sign-in code</h1>
  </div>
  <div style="padding:36px 40px;">
    <p style="color:#0B2545;font-size:15px;font-weight:600;margin:0 0 6px;">${hi}</p>
    <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 28px;">Use the code below to sign in to your Amahle Blue account. It expires in <strong>10 minutes</strong>.</p>
    <div style="background:#f1f5f9;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <p style="color:#64748b;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 10px;">Sign-in code</p>
      <div style="font-size:44px;font-weight:800;color:#1E50E0;letter-spacing:12px;font-family:monospace;">${otp}</div>
    </div>
    <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:0;">Didn't request this? You can safely ignore this email — your account is secure.</p>
  </div>
  <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 40px;text-align:center;">
    <p style="color:#94a3b8;font-size:11px;margin:0;">© 2026 Amahle Blue Cleaning Solutions · Made in 🇿🇦</p>
  </div>
</div>
</body>
</html>`;
}

async function sendOtpEmail(email, otp, name) {
  const RESEND_KEY  = process.env.RESEND_API_KEY;
  const GMAIL_USER  = process.env.GMAIL_USER;
  const GMAIL_PASS  = process.env.GMAIL_APP_PASSWORD;
  const subject     = `${otp} — Your Amahle Blue sign-in code`;
  const html        = buildOtpHtml(otp, name);

  /*
   * OTP leak policy
   * ───────────────
   * The `devOtp` field is ONLY ever returned to the client when:
   *   - We are running locally (no Vercel env), AND
   *   - No email provider is configured.
   * Production deploys (VERCEL_ENV=production|preview) NEVER receive devOtp,
   * even if email delivery fails — that would let an attacker who exhausts the
   * Resend quota mint sign-in codes for any email.
   */
  const isLocal = !process.env.VERCEL_ENV && process.env.NODE_ENV !== 'production';

  /* No credentials at all */
  if (!RESEND_KEY && !GMAIL_USER) {
    if (isLocal) {
      console.log(`[DEV] OTP for ${email}: ${otp}`);
      return { ok: true, dev: true, devOtp: otp };
    }
    console.error('[OTP] No email provider configured in production');
    return { ok: false };
  }

  /* 1. Try Resend */
  if (RESEND_KEY) {
    try {
      const FROM = process.env.FROM_EMAIL || 'Amahle Blue <noreply@amahle-blue.co.za>';
      const res  = await fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ from: FROM, to: [email], subject, html }),
      });
      if (res.ok) return { ok: true };
      const errText = await res.text();
      console.warn('Resend failed:', errText);
    } catch (e) {
      console.warn('Resend fetch error:', e.message);
    }
  }

  /* 2. Try Gmail SMTP */
  if (GMAIL_USER && GMAIL_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: GMAIL_USER, pass: GMAIL_PASS },
      });
      await transporter.sendMail({
        from:    `Amahle Blue <${GMAIL_USER}>`,
        to:      email,
        subject,
        html,
      });
      return { ok: true };
    } catch (e) {
      console.error('Gmail SMTP error:', e.message);
    }
  }

  /* 3. All providers failed — log only, never return OTP to client in prod */
  console.error(`[OTP-FAILED] All email providers failed for ${email}`);
  return { ok: false };
}

module.exports = {
  createOtpToken, verifyOtpToken,
  createSessionToken, verifySessionToken, verifyCustomerSession,
  checkRateLimit,
  getCustomers, saveCustomers, findByEmail, findById, createCustomer, updateCustomer,
  sendOtpEmail,
};
