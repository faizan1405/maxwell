const { verifySession, cors } = require('./_auth');
const { writeBlob } = require('./_blob');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const adminSession = verifySession(req);
  if (!adminSession) return res.status(401).json({ error: 'Unauthorized' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

  const { products, orders, settings, coupons, categories, shipping } = body;

  try {
    if (Array.isArray(products)) {
      await writeBlob('data/maxwell-products.json', products);
    }
    if (Array.isArray(orders)) {
      await writeBlob('data/maxwell-orders.json', orders);
    }
    if (settings) {
      await writeBlob('data/maxwell-settings.json', settings);
    }
    if (Array.isArray(coupons)) {
      await writeBlob('data/maxwell-coupons.json', coupons);
    }
    if (Array.isArray(categories)) {
      await writeBlob('data/maxwell-categories.json', categories);
    }
    if (Array.isArray(shipping)) {
      await writeBlob('data/maxwell-shipping.json', shipping);
    }
    return res.status(200).json({ success: true, message: 'Database successfully restored.' });
  } catch (err) {
    console.error('[restore] Error during database restore:', err.message);
    return res.status(500).json({ error: 'Failed to restore database: ' + err.message });
  }
};
