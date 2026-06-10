const { verifySession } = require('./_auth');
const { readBlob, writeBlob } = require('./_blob');

const SHIPPING_PATH = 'data/maxwell-shipping.json';

const DEFAULT_SHIPPING = [
  {
    id: 'default-rate',
    name: 'Standard Flat Rate',
    country: 'South Africa',
    region: '',
    charge: 85,
    minOrderAmount: 0,
    freeThreshold: 750,
    estimatedTime: '2-5 Business Days',
    status: 'active',
    isDefault: true,
    displayPriority: 999,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];

async function getShippingRates() {
  const stored = await readBlob(SHIPPING_PATH);
  if (!stored) {
    await writeBlob(SHIPPING_PATH, DEFAULT_SHIPPING);
    return DEFAULT_SHIPPING;
  }
  return stored;
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const rates = await getShippingRates();
    // Public endpoint: only return active rates to regular users.
    // If admin, they need to see all rates.
    const adminSession = verifySession(req);
    if (adminSession) {
      return res.status(200).json(rates);
    }
    return res.status(200).json(rates.filter(r => r.status === 'active'));
  }

  // All mutating methods require admin session
  const adminSession = verifySession(req);
  if (!adminSession) return res.status(401).json({ error: 'Unauthorized' });

  let rates = await getShippingRates();

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') try { body = JSON.parse(body); } catch { body = {}; }
    
    const newRate = {
      id: 'rate_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
      name: body.name || 'New Rate',
      country: body.country || 'South Africa',
      region: body.region || '',
      charge: Number(body.charge) || 0,
      minOrderAmount: Number(body.minOrderAmount) || 0,
      freeThreshold: Number(body.freeThreshold) || 0,
      estimatedTime: body.estimatedTime || '',
      status: body.status === 'inactive' ? 'inactive' : 'active',
      isDefault: Boolean(body.isDefault),
      displayPriority: Number(body.displayPriority) || 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    if (newRate.charge < 0) return res.status(400).json({ error: 'Charge cannot be negative' });

    // Ensure only one default exists if this is marked as default
    if (newRate.isDefault) {
      rates = rates.map(r => ({ ...r, isDefault: false }));
    }

    rates.push(newRate);
    await writeBlob(SHIPPING_PATH, rates);
    return res.status(201).json(newRate);
  }

  if (req.method === 'PATCH') {
    let body = req.body;
    if (typeof body === 'string') try { body = JSON.parse(body); } catch { body = {}; }
    
    const { id } = body;
    if (!id) return res.status(400).json({ error: 'Missing shipping rate ID' });

    const idx = rates.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Shipping rate not found' });

    const updated = { ...rates[idx], updatedAt: Date.now() };
    if (body.name !== undefined) updated.name = body.name;
    if (body.country !== undefined) updated.country = body.country;
    if (body.region !== undefined) updated.region = body.region;
    if (body.charge !== undefined) updated.charge = Math.max(0, Number(body.charge) || 0);
    if (body.minOrderAmount !== undefined) updated.minOrderAmount = Number(body.minOrderAmount) || 0;
    if (body.freeThreshold !== undefined) updated.freeThreshold = Number(body.freeThreshold) || 0;
    if (body.estimatedTime !== undefined) updated.estimatedTime = body.estimatedTime;
    if (body.status !== undefined) updated.status = body.status;
    if (body.displayPriority !== undefined) updated.displayPriority = Number(body.displayPriority) || 0;
    
    if (body.isDefault !== undefined) {
      updated.isDefault = Boolean(body.isDefault);
      if (updated.isDefault) {
        rates = rates.map(r => ({ ...r, isDefault: false }));
      }
    }

    rates[idx] = updated;
    await writeBlob(SHIPPING_PATH, rates);
    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    let body = req.body;
    if (typeof body === 'string') try { body = JSON.parse(body); } catch { body = {}; }
    
    const { id } = body;
    if (!id) return res.status(400).json({ error: 'Missing shipping rate ID' });

    const idx = rates.findIndex(r => r.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Shipping rate not found' });

    rates.splice(idx, 1);
    await writeBlob(SHIPPING_PATH, rates);
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
