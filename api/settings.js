/* Store Settings API — GET (public / admin), PATCH (admin only) */
const { verifySession, cors } = require('./_auth');
const { readBlob, writeBlob } = require('./_blob');

const SETTINGS_PATH = 'data/maxwell-settings.json';

const DEFAULT_SETTINGS = {
  cod: {
    enabled: true,
    description: 'Pay in cash when your order is delivered.',
    minOrderAmount: 0,
    maxOrderAmount: 0,
    codFee: 0,
    locationRestrictions: [],
    productRestrictions: [],
  },
  eft: {
    enabled: true,
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    branchCode: '',
    accountType: 'Current',
    swiftCode: '',
    instructions: '',
    allowProofUpload: false,
  },
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
    name:      'Amahle Blue',
    tagline:   'Cleaning Solutions',
    vatNumber: '4930324332',
    email:     'info@amahle-blue.co.za',
    phone:     '067 101 4345',
    address:   'Unit H, 13 Main Reef Road, Dunswart, Boksburg, Gauteng, South Africa',
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

  if (req.query.resource === 'categories') {
    return require('./_categories')(req, res);
  }

  /* ── GET ─────────────────────────────────────────────────────────────────────── */
  if (req.method === 'GET') {
    const s            = await getSettings();
    const adminSession = verifySession(req);

    if (adminSession) {
      /* Admin gets the full settings including bank details */
      return res.status(200).json({
        cod:      s.cod,
        eft:      s.eft,
        shipping: s.shipping,
        business: s.business,
      });
    }

    /* Public response — strip bank details and internal restrictions */
    return res.status(200).json({
      cod: {
        enabled:        s.cod.enabled,
        description:    s.cod.description,
        codFee:         s.cod.codFee,
        minOrderAmount: s.cod.minOrderAmount,
        maxOrderAmount: s.cod.maxOrderAmount,
      },
      eft: {
        enabled: s.eft.enabled,
      },
      shipping: s.shipping,
      business: s.business,
    });
  }

  /* ── Auth guard for all write operations ─────────────────────────────────────── */
  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  /* ── PATCH ───────────────────────────────────────────────────────────────────── */
  if (req.method === 'PATCH') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

    const allowed = {};

    if (body.business) allowed.business = body.business;

    if (body.shipping) {
      allowed.shipping = {};
      if (body.shipping.freeThreshold !== undefined)
        allowed.shipping.freeThreshold = Math.max(0, Number(body.shipping.freeThreshold) || 0);
      if (body.shipping.flatFee !== undefined)
        allowed.shipping.flatFee = Math.max(0, Number(body.shipping.flatFee) || 0);
      if (body.shipping.provinceRates && typeof body.shipping.provinceRates === 'object') {
        allowed.shipping.provinceRates = {};
        for (const [k, v] of Object.entries(body.shipping.provinceRates)) {
          allowed.shipping.provinceRates[String(k)] = Math.max(0, Number(v) || 0);
        }
      }
    }

    if (body.cod) {
      allowed.cod = {};
      if (typeof body.cod.enabled        === 'boolean') allowed.cod.enabled        = body.cod.enabled;
      if (body.cod.description           !== undefined) allowed.cod.description    = String(body.cod.description    || '').slice(0, 500);
      if (body.cod.codFee                !== undefined) allowed.cod.codFee         = Math.max(0, Number(body.cod.codFee)         || 0);
      if (body.cod.minOrderAmount        !== undefined) allowed.cod.minOrderAmount = Math.max(0, Number(body.cod.minOrderAmount) || 0);
      if (body.cod.maxOrderAmount        !== undefined) allowed.cod.maxOrderAmount = Math.max(0, Number(body.cod.maxOrderAmount) || 0);
      if (Array.isArray(body.cod.locationRestrictions)) allowed.cod.locationRestrictions = body.cod.locationRestrictions;
      if (Array.isArray(body.cod.productRestrictions))  allowed.cod.productRestrictions  = body.cod.productRestrictions;
    }

    if (body.eft) {
      allowed.eft = {};
      if (typeof body.eft.enabled          === 'boolean') allowed.eft.enabled          = body.eft.enabled;
      if (body.eft.bankName                !== undefined) allowed.eft.bankName         = String(body.eft.bankName        || '').slice(0, 100);
      if (body.eft.accountHolder           !== undefined) allowed.eft.accountHolder    = String(body.eft.accountHolder   || '').slice(0, 100);
      if (body.eft.accountNumber           !== undefined) allowed.eft.accountNumber    = String(body.eft.accountNumber   || '').slice(0, 50);
      if (body.eft.branchCode              !== undefined) allowed.eft.branchCode       = String(body.eft.branchCode      || '').slice(0, 20);
      if (body.eft.accountType             !== undefined) allowed.eft.accountType      = String(body.eft.accountType     || '').slice(0, 50);
      if (body.eft.swiftCode               !== undefined) allowed.eft.swiftCode        = String(body.eft.swiftCode       || '').slice(0, 20);
      if (body.eft.instructions            !== undefined) allowed.eft.instructions     = String(body.eft.instructions    || '').slice(0, 1000);
      if (typeof body.eft.allowProofUpload === 'boolean') allowed.eft.allowProofUpload = body.eft.allowProofUpload;
    }

    const current = await getSettings();
    const updated = deepMerge(current, allowed);
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
