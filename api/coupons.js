/* Coupons API — admin CRUD + public validate */
const { verifySession, cors } = require('./_auth');
const { readBlob, writeBlob } = require('./_blob');

const COUPONS_PATH = 'data/maxwell-coupons.json';

async function getCoupons() {
  return (await readBlob(COUPONS_PATH)) || [];
}

function calcDiscount(coupon, cartTotal) {
  if (coupon.type === 'percentage') {
    return Math.round(cartTotal * (coupon.value / 100) * 100) / 100;
  }
  return Math.min(coupon.value, cartTotal);
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  /* ── GET — admin list all coupons ───────────────────────────────────────────── */
  if (req.method === 'GET') {
    const session = verifySession(req);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });
    return res.status(200).json(await getCoupons());
  }

  /* ── POST — admin create OR public validate ──────────────────────────────────── */
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

    /* Public validate action — no auth required */
    if (body.action === 'validate') {
      const code      = (body.code || '').toUpperCase().trim();
      const cartTotal = Number(body.cartTotal) || 0;
      if (!code) return res.status(400).json({ error: 'Coupon code required.' });

      const coupons = await getCoupons();
      const c = coupons.find(cp => cp.code === code);

      if (!c || !c.active) return res.status(404).json({ error: 'Invalid or expired coupon code.' });
      if (c.expiresAt && Date.now() > c.expiresAt) return res.status(400).json({ error: 'This coupon has expired.' });
      if (c.maxUses > 0 && c.usedCount >= c.maxUses) return res.status(400).json({ error: 'This coupon has reached its usage limit.' });
      if (c.minOrderValue > 0 && cartTotal < c.minOrderValue) {
        return res.status(400).json({ error: `Minimum order value of R ${c.minOrderValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} required.` });
      }

      const discount = calcDiscount(c, cartTotal);
      return res.status(200).json({
        valid:    true,
        couponId: c.id,
        code:     c.code,
        type:     c.type,
        value:    c.value,
        discount,
      });
    }

    /* Admin create */
    const session = verifySession(req);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const code = (body.code || '').toUpperCase().trim();
    if (!code) return res.status(400).json({ error: 'Coupon code is required.' });

    const coupons  = await getCoupons();
    const existing = coupons.find(c => c.code === code);
    if (existing) return res.status(400).json({ error: 'Coupon code already exists.' });

    const coupon = {
      id:                   `coup_${Date.now()}`,
      code,
      type:                 body.type === 'fixed' ? 'fixed' : 'percentage',
      value:                Math.max(0, Number(body.value) || 0),
      minOrderValue:        Math.max(0, Number(body.minOrderValue) || 0),
      maxUses:              Math.max(0, Number(body.maxUses) || 0),
      usedCount:            0,
      expiresAt:            body.expiresAt ? Number(body.expiresAt) : null,
      active:               body.active !== false,
      restrictToProducts:   Array.isArray(body.restrictToProducts)   ? body.restrictToProducts   : [],
      restrictToCategories: Array.isArray(body.restrictToCategories) ? body.restrictToCategories : [],
      createdAt:            Date.now(),
      updatedAt:            Date.now(),
    };
    await writeBlob(COUPONS_PATH, [...coupons, coupon]);
    return res.status(201).json(coupon);
  }

  /* ── Require admin session for PATCH / DELETE ────────────────────────────────── */
  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

  /* ── PATCH — update ─────────────────────────────────────────────────────────── */
  if (req.method === 'PATCH') {
    const { id, ...patch } = body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const coupons = await getCoupons();
    const idx     = coupons.findIndex(c => c.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Coupon not found' });
    if (patch.code) patch.code = patch.code.toUpperCase().trim();
    const updated  = { ...coupons[idx], ...patch, id, updatedAt: Date.now() };
    const newList  = [...coupons]; newList[idx] = updated;
    await writeBlob(COUPONS_PATH, newList);
    return res.status(200).json(updated);
  }

  /* ── DELETE ─────────────────────────────────────────────────────────────────── */
  if (req.method === 'DELETE') {
    const { id } = body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const coupons = await getCoupons();
    await writeBlob(COUPONS_PATH, coupons.filter(c => c.id !== id));
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

module.exports.getCoupons    = getCoupons;
module.exports.calcDiscount  = calcDiscount;
