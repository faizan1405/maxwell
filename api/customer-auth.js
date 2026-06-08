/* Customer Auth API — sendOtp, verifyOtp, logout, profile, addresses */
const { cors } = require('./_auth');
const {
  createOtpToken, verifyOtpToken,
  createSessionToken, verifyCustomerSession,
  checkRateLimit,
  getCustomers, findByEmail, findById, createCustomer, updateCustomer,
  sendOtpEmail,
} = require('./_customers');

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  // ── GET — return customer profile ─────────────────────────────────────────
  if (req.method === 'GET') {
    const session = verifyCustomerSession(req);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });
    const customer = await findById(session.customerId);
    if (!customer) return res.status(404).json({ error: 'Account not found' });
    return res.status(200).json({ ok: true, customer });
  }

  // ── PATCH — update profile ────────────────────────────────────────────────
  if (req.method === 'PATCH') {
    const session = verifyCustomerSession(req);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

    const patch = {};
    if (body.name  !== undefined) patch.name  = String(body.name).trim().slice(0, 100);
    if (body.phone !== undefined) patch.phone = String(body.phone).trim().slice(0, 30);

    const updated = await updateCustomer(session.customerId, patch);
    if (!updated) return res.status(404).json({ error: 'Account not found' });
    return res.status(200).json({ ok: true, customer: updated });
  }

  // ── POST — auth actions ───────────────────────────────────────────────────
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

    const { action } = body;

    // sendOtp ─────────────────────────────────────────────────────────────────
    if (action === 'sendOtp') {
      const email = (body.email || '').trim().toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'A valid email address is required.' });
      }

      const rl = checkRateLimit(email);
      if (rl.limited) {
        return res.status(429).json({
          error: `Too many requests. Try again in ${rl.retryAfter} minute${rl.retryAfter !== 1 ? 's' : ''}.`,
        });
      }

      const existing = await findByEmail(email);
      const otp      = generateOtp();
      const otpToken = createOtpToken(email, otp);
      const sent     = await sendOtpEmail(email, otp, existing?.name || '');

      if (!sent.ok && !sent.dev) {
        return res.status(500).json({ error: 'Failed to send sign-in code. Please try again.' });
      }

      return res.status(200).json({
        ok: true,
        otpToken,
        isNew: !existing,
        ...(sent.dev ? { devOtp: sent.devOtp } : {}),
      });
    }

    // verifyOtp ───────────────────────────────────────────────────────────────
    if (action === 'verifyOtp') {
      const { otpToken, otp } = body;
      if (!otpToken || !otp) {
        return res.status(400).json({ error: 'OTP token and code are required.' });
      }

      const payload = verifyOtpToken(otpToken, String(otp).trim());
      if (!payload) {
        return res.status(400).json({ error: 'Invalid or expired code. Please try again.' });
      }

      let customer = await findByEmail(payload.email);
      const isNew  = !customer;
      if (!customer) customer = await createCustomer(payload.email);

      const sessionToken = createSessionToken(customer);
      const expiresAt    = Date.now() + 30 * 24 * 60 * 60 * 1000;

      return res.status(200).json({ ok: true, customer, sessionToken, expiresAt, isNew });
    }

    // logout ──────────────────────────────────────────────────────────────────
    if (action === 'logout') {
      return res.status(200).json({ ok: true });
    }

    // addAddress ──────────────────────────────────────────────────────────────
    if (action === 'addAddress') {
      const session = verifyCustomerSession(req);
      if (!session) return res.status(401).json({ error: 'Unauthorized' });

      const { address } = body;
      if (!address || !address.line || !address.city) {
        return res.status(400).json({ error: 'Address line and city are required.' });
      }

      const customer = await findById(session.customerId);
      if (!customer) return res.status(404).json({ error: 'Account not found' });

      const newAddr = {
        id: `addr_${Date.now()}`,
        label: String(address.label || 'Home').trim(),
        line: String(address.line).trim(),
        city: String(address.city).trim(),
        province: String(address.province || '').trim(),
        postalCode: String(address.postalCode || '').trim(),
        isDefault: customer.addresses.length === 0 || !!address.isDefault,
      };

      // If new address is default, clear other defaults
      let addresses = customer.addresses.map(a => newAddr.isDefault ? { ...a, isDefault: false } : a);
      addresses = [...addresses, newAddr];

      const updated = await updateCustomer(session.customerId, { addresses });
      return res.status(200).json({ ok: true, customer: updated });
    }

    // updateAddress ───────────────────────────────────────────────────────────
    if (action === 'updateAddress') {
      const session = verifyCustomerSession(req);
      if (!session) return res.status(401).json({ error: 'Unauthorized' });

      const { addressId, address } = body;
      if (!addressId) return res.status(400).json({ error: 'addressId is required.' });

      const customer = await findById(session.customerId);
      if (!customer) return res.status(404).json({ error: 'Account not found' });

      let addresses = customer.addresses.map(a => {
        if (a.id !== addressId) return address?.isDefault ? { ...a, isDefault: false } : a;
        return {
          ...a,
          label:      address.label      !== undefined ? String(address.label).trim() : a.label,
          line:       address.line       !== undefined ? String(address.line).trim() : a.line,
          city:       address.city       !== undefined ? String(address.city).trim() : a.city,
          province:   address.province   !== undefined ? String(address.province).trim() : a.province,
          postalCode: address.postalCode !== undefined ? String(address.postalCode).trim() : a.postalCode,
          isDefault:  address.isDefault  !== undefined ? !!address.isDefault : a.isDefault,
        };
      });

      const updated = await updateCustomer(session.customerId, { addresses });
      return res.status(200).json({ ok: true, customer: updated });
    }

    // deleteAddress ───────────────────────────────────────────────────────────
    if (action === 'deleteAddress') {
      const session = verifyCustomerSession(req);
      if (!session) return res.status(401).json({ error: 'Unauthorized' });

      const { addressId } = body;
      if (!addressId) return res.status(400).json({ error: 'addressId is required.' });

      const customer = await findById(session.customerId);
      if (!customer) return res.status(404).json({ error: 'Account not found' });

      let addresses = customer.addresses.filter(a => a.id !== addressId);
      if (addresses.length > 0 && !addresses.some(a => a.isDefault)) {
        addresses[0] = { ...addresses[0], isDefault: true };
      }

      const updated = await updateCustomer(session.customerId, { addresses });
      return res.status(200).json({ ok: true, customer: updated });
    }

    // setDefaultAddress ───────────────────────────────────────────────────────
    if (action === 'setDefaultAddress') {
      const session = verifyCustomerSession(req);
      if (!session) return res.status(401).json({ error: 'Unauthorized' });

      const { addressId } = body;
      if (!addressId) return res.status(400).json({ error: 'addressId is required.' });

      const customer = await findById(session.customerId);
      if (!customer) return res.status(404).json({ error: 'Account not found' });

      const addresses = customer.addresses.map(a => ({ ...a, isDefault: a.id === addressId }));
      const updated   = await updateCustomer(session.customerId, { addresses });
      return res.status(200).json({ ok: true, customer: updated });
    }

    return res.status(400).json({ error: 'Unknown action.' });
  }

  return res.status(405).json({ error: 'Method not allowed.' });
};
