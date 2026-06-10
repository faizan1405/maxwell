/* Proof-of-Payment Upload API — POST (customer or admin auth) */
const { put, del }              = require('@vercel/blob');
const { verifySession, cors }   = require('./_auth');
const { verifyCustomerSession } = require('./_customers');
const { readBlob, writeBlob }   = require('./_blob');

const ORDERS_PATH     = 'data/maxwell-orders.json';
const MAX_PROOF_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf',
]);
const EXT_FOR_TYPE = {
  'image/jpeg':      'jpg',
  'image/jpg':       'jpg',
  'image/png':       'png',
  'image/webp':      'webp',
  'application/pdf': 'pdf',
};

/* Payment statuses that allow a customer to upload (or replace) proof */
const UPLOAD_ALLOWED_STATUSES = new Set([
  'Awaiting EFT Payment',
  'Proof of Payment Submitted',
  'Payment Verification Required',
  'Corrected Proof Requested',
  'Payment Rejected',
]);

/* ── Money formatter ─────────────────────────────────────────────────────────── */
function R(n) {
  const abs = Math.abs(n || 0).toFixed(2);
  const [int, dec] = abs.split('.');
  return 'R ' + int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + dec;
}

/* ── Email helpers ───────────────────────────────────────────────────────────── */
async function sendProofAdminEmail(order) {
  const KEY  = process.env.RESEND_API_KEY;
  const FROM = process.env.FROM_EMAIL || 'Amahle Blue <noreply@amahle-blue.co.za>';
  const to   = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
  if (!KEY || !to) return;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Helvetica,Arial,sans-serif;">
<div style="max-width:540px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(11,37,69,.10);">
  <div style="background:linear-gradient(135deg,#1E50E0,#0B2545);padding:28px 36px;text-align:center;">
    <h1 style="color:#fff;font-size:20px;font-weight:800;margin:0;">&#128190; Proof of Payment Submitted</h1>
    <p style="color:#bfdbfe;font-size:13px;margin:6px 0 0;">${order.customer?.name || 'A customer'} · ${order.orderNumber}</p>
  </div>
  <div style="padding:28px 36px;">
    <p style="font-size:14px;color:#334155;margin:0 0 16px;line-height:1.6;">
      <strong>${order.customer?.name}</strong> (${order.customer?.email}) has uploaded a proof of payment for
      order <strong>${order.orderNumber}</strong> totalling <strong>${R(order.total)}</strong>.
    </p>
    <div style="background:#eff6ff;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="font-size:13px;font-weight:700;color:#1E50E0;margin:0 0 4px;">${order.orderNumber} — ${R(order.total)}</p>
      <p style="font-size:12px;color:#64748b;margin:0;">EFT Reference: <strong>${order.eftReference || order.orderNumber}</strong></p>
    </div>
    <p style="font-size:13px;color:#64748b;margin:0;">Log in to the admin panel to view the proof and verify or reject the payment.</p>
  </div>
  <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 36px;text-align:center;">
    <p style="color:#cbd5e1;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Amahle Blue Cleaning Solutions</p>
  </div>
</div>
</body></html>`;

  try {
    await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ from: FROM, to: [to], subject: `Proof of Payment — ${order.orderNumber} (${R(order.total)})`, html }),
    });
  } catch (e) {
    console.error('[proof] admin email error:', e.message);
  }
}

async function sendProofCustomerEmail(order) {
  const KEY  = process.env.RESEND_API_KEY;
  const FROM = process.env.FROM_EMAIL || 'Amahle Blue <noreply@amahle-blue.co.za>';
  if (!KEY || !order?.customer?.email) return;

  const firstName = (order.customer.name || 'there').split(' ')[0];
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Helvetica,Arial,sans-serif;">
<div style="max-width:540px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(11,37,69,.10);">
  <div style="background:linear-gradient(135deg,#1E50E0,#0B2545);padding:32px 36px;text-align:center;">
    <p style="color:#7FC4FF;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Amahle Blue</p>
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">Proof Received!</h1>
    <p style="color:#bfdbfe;font-size:14px;margin:0;">Hi ${firstName}, we've received your proof of payment.</p>
  </div>
  <div style="padding:32px 36px;">
    <div style="background:#eff6ff;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="font-size:13px;font-weight:700;color:#1E50E0;margin:0 0 3px;">${order.orderNumber}</p>
      <p style="font-size:12px;color:#64748b;margin:0;">Status: <span style="color:#d97706;font-weight:600;">Proof of Payment Submitted</span></p>
    </div>
    <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 16px;">
      Your proof of payment is being reviewed. We will verify your payment and confirm your order within 1–2 business days.
    </p>
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;margin-bottom:16px;">
      <p style="font-size:12px;color:#92400e;margin:0;line-height:1.5;">
        Please ensure the payment reference on your proof of payment matches your order number: <strong>${order.eftReference || order.orderNumber}</strong>
      </p>
    </div>
    <p style="font-size:13px;color:#64748b;margin:0;">Questions? Email us at
      <a href="mailto:info@amahle-blue.co.za" style="color:#1E50E0;">info@amahle-blue.co.za</a>
    </p>
  </div>
  <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 36px;text-align:center;">
    <p style="color:#cbd5e1;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Amahle Blue Cleaning Solutions &middot; Made in &#x1F1FF;&#x1F1E6;</p>
  </div>
</div>
</body></html>`;

  try {
    await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ from: FROM, to: [order.customer.email], subject: `Proof of payment received — ${order.orderNumber}`, html }),
    });
  } catch (e) {
    console.error('[proof] customer email error:', e.message);
  }
}

/* ── Main handler ────────────────────────────────────────────────────────────── */
module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  /* Auth: customer session OR admin session */
  const adminSession    = verifySession(req);
  const customerSession = adminSession ? null : verifyCustomerSession(req);
  if (!adminSession && !customerSession) return res.status(401).json({ error: 'Unauthorized' });

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: 'Storage not configured.' });

  /* orderId from query string (?orderId=ORD-...) */
  const urlObj  = new URL(req.url || '', `https://${req.headers.host || 'x'}`);
  const orderId = urlObj.searchParams.get('orderId') || '';
  if (!orderId) return res.status(400).json({ error: 'Missing orderId query parameter.' });

  /* Load order */
  const orders = await readBlob(ORDERS_PATH);
  if (!Array.isArray(orders)) return res.status(500).json({ error: 'Could not load orders.' });

  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) return res.status(404).json({ error: 'Order not found.' });

  const order = orders[idx];

  /* Customer ownership check */
  if (customerSession && !adminSession) {
    const isOwner =
      (order.customerId && order.customerId === customerSession.customerId) ||
      (order.customer?.email && order.customer.email.toLowerCase() === customerSession.email.toLowerCase());
    if (!isOwner) return res.status(403).json({ error: 'Forbidden.' });
  }

  /* EFT orders only */
  const payMethod = order.paymentMethod || order.payment?.method;
  if (payMethod !== 'EFT') {
    return res.status(400).json({ error: 'Proof of payment upload is only available for EFT orders.' });
  }

  /* Check current status allows upload */
  const currentPayStatus = order.paymentStatus || (order.payment?.status === 'paid' ? 'Paid' : 'Awaiting EFT Payment');
  if (!UPLOAD_ALLOWED_STATUSES.has(currentPayStatus)) {
    return res.status(400).json({ error: `Cannot upload proof for an order with payment status: ${currentPayStatus}.` });
  }

  /* File type validation */
  const rawContentType = (req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  const contentType    = rawContentType === 'image/jpg' ? 'image/jpeg' : rawContentType;
  if (!ALLOWED_TYPES.has(contentType) && !ALLOWED_TYPES.has(rawContentType)) {
    return res.status(415).json({ error: 'Unsupported file type. Allowed: PDF, JPG, JPEG, PNG, WEBP.' });
  }
  const effectiveType = ALLOWED_TYPES.has(contentType) ? contentType : rawContentType;

  try {
    const rawName = String(req.headers['x-filename'] || `proof.${EXT_FOR_TYPE[effectiveType] || 'bin'}`).slice(0, 200);
    const chunks  = [];
    let received  = 0;

    for await (const chunk of req) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      received += buf.length;
      if (received > MAX_PROOF_BYTES) {
        return res.status(413).json({ error: 'File exceeds the 5 MB size limit.' });
      }
      chunks.push(buf);
    }

    const buffer = Buffer.concat(chunks);
    if (!buffer.length) return res.status(400).json({ error: 'Empty file received.' });

    /* Magic-byte validation — defeats Content-Type spoofing */
    const head  = buffer.slice(0, 12);
    let   valid = false;
    if (effectiveType === 'application/pdf') {
      valid = head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46; // %PDF
    } else if (effectiveType === 'image/jpeg') {
      valid = head[0] === 0xFF && head[1] === 0xD8 && head[2] === 0xFF;
    } else if (effectiveType === 'image/png') {
      valid = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4E && head[3] === 0x47;
    } else if (effectiveType === 'image/webp') {
      valid = head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 && head[8] === 0x57;
    }
    if (!valid) {
      return res.status(415).json({ error: 'File content does not match its declared type.' });
    }

    /* Storage path */
    const safeBase   = rawName.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
    const ext        = EXT_FOR_TYPE[effectiveType] || 'bin';
    const storageKey = `proofs/${orderId}/${Date.now()}-${safeBase.slice(0, 40)}.${ext}`;

    const blob = await put(storageKey, buffer, { access: 'public', contentType: effectiveType, token });

    /* Update order record */
    const prevHistory    = Array.isArray(order.paymentStatusHistory) ? order.paymentStatusHistory : [];
    const prevPayStatus  = order.paymentStatus || 'Awaiting EFT Payment';
    const newPayStatus   = 'Proof of Payment Submitted';
    const changedBy      = adminSession
      ? (adminSession.user?.username || adminSession.username || 'admin')
      : (customerSession?.email || 'customer');

    const updatedOrder = {
      ...order,
      proofOfPaymentUrl:        blob.url,
      proofOfPaymentStorageKey: storageKey,
      proofOfPaymentMetadata: {
        filename:   rawName,
        mimeType:   effectiveType,
        fileSize:   buffer.length,
        uploadedAt: Date.now(),
        orderId,
      },
      paymentStatus: newPayStatus,
      payment:       { ...(order.payment || {}), status: 'pending' },
      paymentStatusHistory: [
        ...prevHistory,
        {
          previousStatus: prevPayStatus,
          newStatus:      newPayStatus,
          changedBy,
          note:           'Proof of payment uploaded',
          createdAt:      Date.now(),
        },
      ],
      updatedAt: Date.now(),
    };

    const newList = [...orders];
    newList[idx]  = updatedOrder;
    await writeBlob(ORDERS_PATH, newList);

    /* Delete old proof file to save space */
    const oldStorageKey = order.proofOfPaymentStorageKey;
    if (oldStorageKey) {
      try {
        await del(oldStorageKey, { token });
      } catch (delErr) {
        console.error('[proof] Failed to delete old proof:', oldStorageKey, delErr);
      }
    }

    /* Send emails (non-blocking) */
    sendProofAdminEmail(updatedOrder).catch(() => {});
    sendProofCustomerEmail(updatedOrder).catch(() => {});

    /* Return order safe for customer (strip internal fields) */
    const { internalNotes: _n, idempotencyKey: _k, ...safeOrder } = updatedOrder;

    return res.status(200).json({
      success:       true,
      proofUrl:      blob.url,
      paymentStatus: newPayStatus,
      order:         safeOrder,
    });
  } catch (err) {
    console.error('[/api/proof]', err);
    return res.status(500).json({ error: 'Upload failed. Please try again.' });
  }
};
