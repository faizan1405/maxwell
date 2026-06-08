/* Store Settings API — GET (public), PATCH (admin only) */
const { verifySession, cors } = require('./_auth');
const { readBlob, writeBlob } = require('./_blob');

const SETTINGS_PATH = 'data/maxwell-settings.json';

const DEFAULT_SETTINGS = {
  cod: { enabled: true },
  eft: { enabled: true },
  shipping: {
    freeThreshold: 750,
    flatFee: 85,
    provinceRates: {
      'Gauteng':       75,
      'Western Cape':  120,
      'KwaZulu-Natal': 120,
      'Eastern Cape':  130,
      'Mpumalanga':    100,
      'Limpopo':       110,
      'North West':    100,
      'Free State':    110,
      'Northern Cape': 140,
    },
  },
  business: {
    name:    'Amahle Blue',
    tagline: 'Cleaning Solutions',
    vatNumber: '4930324332',
    email:   'info@amahle-blue.co.za',
    phone:   '067 101 4345',
    address: 'Unit H, 13 Main Reef Road, Dunswart, Boksburg, Gauteng, South Africa',
  },
  invoiceCounter: 1000,
};

function deepMerge(target, source) {
  const out = { ...target };
  for (const key of Object.keys(source || {})) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      out[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

async function getSettings() {
  const stored = await readBlob(SETTINGS_PATH);
  if (!stored) {
    await writeBlob(SETTINGS_PATH, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  return deepMerge(DEFAULT_SETTINGS, stored);
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    const s = await getSettings();
    return res.status(200).json({
      cod:      s.cod,
      eft:      s.eft,
      shipping: s.shipping,
      business: s.business,
    });
  }

  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'PATCH') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    /* Admin can edit business/shipping/cod/eft only. Block invoiceCounter etc. */
    const allowed = {};
    if (body.business) allowed.business = body.business;
    if (body.shipping) {
      allowed.shipping = {};
      if (body.shipping.freeThreshold !== undefined) allowed.shipping.freeThreshold = Math.max(0, Number(body.shipping.freeThreshold) || 0);
      if (body.shipping.flatFee       !== undefined) allowed.shipping.flatFee       = Math.max(0, Number(body.shipping.flatFee) || 0);
      if (body.shipping.provinceRates && typeof body.shipping.provinceRates === 'object') {
        allowed.shipping.provinceRates = {};
        for (const [k, v] of Object.entries(body.shipping.provinceRates)) {
          allowed.shipping.provinceRates[String(k)] = Math.max(0, Number(v) || 0);
        }
      }
    }
    if (body.cod && typeof body.cod.enabled === 'boolean') allowed.cod = { enabled: body.cod.enabled };
    if (body.eft && typeof body.eft.enabled === 'boolean') allowed.eft = { enabled: body.eft.enabled };

    const current  = await getSettings();
    const updated  = deepMerge(current, allowed);
    await writeBlob(SETTINGS_PATH, updated);
    return res.status(200).json({
      cod:      updated.cod,
      eft:      updated.eft,
      shipping: updated.shipping,
      business: updated.business,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

module.exports.getSettings = getSettings;
