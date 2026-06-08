/* Reviews API — public read, customer create (verified purchase), admin moderate */
const { verifySession, cors } = require('./_auth');
const { verifyCustomerSession, findById } = require('./_customers');
const { readBlob, writeBlob } = require('./_blob');

const REVIEWS_PATH  = 'data/maxwell-reviews.json';
const ORDERS_PATH   = 'data/maxwell-orders.json';

async function getReviews() { return (await readBlob(REVIEWS_PATH)) || []; }
async function getOrders()  { return (await readBlob(ORDERS_PATH))  || []; }

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  /* ── GET — admin (all) | customer (own + approved) | public (approved only) ── */
  if (req.method === 'GET') {
    const reviews = await getReviews();
    const admin   = verifySession(req);
    if (admin) return res.status(200).json(reviews);

    const stripPii = r => ({
      id: r.id, productId: r.productId, customerName: r.customerName,
      rating: r.rating, text: r.text, status: r.status,
      createdAt: r.createdAt, updatedAt: r.updatedAt,
    });

    const cust = verifyCustomerSession(req);
    const productId = req.query.productId;
    let visible = reviews.filter(r =>
      r.status === 'approved' ||
      (cust && (r.customerId === cust.customerId || (r.email && cust.email && r.email.toLowerCase() === cust.email.toLowerCase())))
    );
    if (productId) visible = visible.filter(r => r.productId === productId);
    /* Strip PII from everyone else's reviews; let the customer keep their own. */
    visible = visible.map(r => {
      const isOwn = cust && (r.customerId === cust.customerId || (r.email && cust.email && r.email.toLowerCase() === cust.email.toLowerCase()));
      return isOwn ? r : stripPii(r);
    });
    return res.status(200).json(visible);
  }

  /* ── POST — customer submit review ─────────────────────────────────────────── */
  if (req.method === 'POST') {
    const custSession = verifyCustomerSession(req);
    if (!custSession) return res.status(401).json({ error: 'You must be signed in to leave a review.' });

    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

    const { productId, rating, text } = body;
    if (!productId) return res.status(400).json({ error: 'Product ID required.' });
    const r = Number(rating);
    if (!r || r < 1 || r > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });

    /* Verify purchase — customer must have a delivered/processing/shipped order with this product */
    const orders = await getOrders();
    const hasPurchased = orders.some(o =>
      ['processing', 'shipped', 'delivered'].includes(o.status) &&
      (o.customerId === custSession.customerId ||
        o.customer?.email?.toLowerCase() === custSession.email.toLowerCase()) &&
      o.items?.some(i => i.productId === productId)
    );
    if (!hasPurchased) {
      return res.status(403).json({ error: 'Only verified buyers can review this product.' });
    }

    /* Lookup customer name */
    const customer = await findById(custSession.customerId);

    const reviews    = await getReviews();
    const existingIdx = reviews.findIndex(
      r => r.customerId === custSession.customerId && r.productId === productId
    );

    if (existingIdx !== -1) {
      /* Update existing review — reset to pending for re-moderation */
      const updated = {
        ...reviews[existingIdx],
        rating:    r,
        text:      (text || '').trim().slice(0, 2000),
        status:    'pending',
        updatedAt: Date.now(),
      };
      const newList = [...reviews]; newList[existingIdx] = updated;
      await writeBlob(REVIEWS_PATH, newList);
      return res.status(200).json(updated);
    }

    const review = {
      id:           `rev_${Date.now()}`,
      productId,
      customerId:   custSession.customerId,
      email:        custSession.email,
      customerName: customer?.name || custSession.email.split('@')[0],
      rating:       r,
      text:         (text || '').trim().slice(0, 2000),
      status:       'pending',
      createdAt:    Date.now(),
      updatedAt:    Date.now(),
    };
    await writeBlob(REVIEWS_PATH, [...reviews, review]);
    return res.status(201).json(review);
  }

  /* ── Require admin for PATCH / DELETE ───────────────────────────────────────── */
  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

  /* ── PATCH — moderate (admin only; allowlisted fields) ─────────────────────── */
  if (req.method === 'PATCH') {
    const { id, status } = body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const VALID = ['pending', 'approved', 'rejected', 'hidden'];
    if (status && !VALID.includes(status)) return res.status(400).json({ error: 'Invalid status.' });

    const reviews = await getReviews();
    const idx     = reviews.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Review not found' });

    /* Only allow status moderation here — never let body spread overwrite
       createdAt, customerId, rating, etc. */
    const patch = { updatedAt: Date.now() };
    if (status !== undefined) patch.status = status;
    const updated = { ...reviews[idx], ...patch };
    const newList = [...reviews]; newList[idx] = updated;
    await writeBlob(REVIEWS_PATH, newList);
    return res.status(200).json(updated);
  }

  /* ── DELETE ─────────────────────────────────────────────────────────────────── */
  if (req.method === 'DELETE') {
    const { id } = body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const reviews = await getReviews();
    await writeBlob(REVIEWS_PATH, reviews.filter(r => r.id !== id));
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
