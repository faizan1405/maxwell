const { verifySession } = require('./_auth');
const { readBlob, writeBlob } = require('./_blob');

const HISTORY_PATH = 'data/maxwell-stock-history.json';

async function handler(req, res) {
  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const history = await readBlob(HISTORY_PATH) || [];
      const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);
      return res.status(200).json(sorted);
    } catch (err) {
      console.error('[stock history GET] error:', err);
      return res.status(500).json({ error: 'Failed to read stock history' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function logStockChange(productId, productName, variation, prevStock, newStock, reason, orderId = null) {
  try {
    const history = await readBlob(HISTORY_PATH) || [];
    const entry = {
      id: `STK-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId,
      productName,
      variation: variation || null,
      prevStock: parseInt(prevStock, 10) || 0,
      updatedStock: parseInt(newStock, 10) || 0,
      reason: reason || 'Adjustment',
      timestamp: Date.now(),
      orderId: orderId || null
    };
    await writeBlob(HISTORY_PATH, [...history, entry]);
    console.log(`[stock-history] Logged stock change for ${productName}: ${prevStock} -> ${newStock} (${reason})`);
  } catch (err) {
    console.error('[stock-history] Failed to log stock change:', err.message);
  }
}

module.exports = handler;
module.exports.logStockChange = logStockChange;
