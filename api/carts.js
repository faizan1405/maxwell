/* Carts API — guest/customer cart persistence + abandoned cart tracking for admin */
const { verifySession, cors } = require('./_auth');
const { verifyCustomerSession } = require('./_customers');
const { readBlob, writeBlob }   = require('./_blob');

const CARTS_PATH          = 'data/maxwell-carts.json';
const ABANDONED_THRESHOLD = 24 * 60 * 60 * 1000;   // 24 h
const GUEST_TTL           = 10 * 24 * 60 * 60 * 1000; // 10 days

async function getCarts() { return (await readBlob(CARTS_PATH)) || []; }

function mergeItems(existing, incoming) {
  const map = {};
  [...(existing || []), ...(incoming || [])].forEach(item => {
    if (map[item.id]) map[item.id] = { ...map[item.id], qty: map[item.id].qty + item.qty };
    else              map[item.id] = { ...item };
  });
  return Object.values(map);
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  /* ── POST — save / merge / convert ──────────────────────────────────────────── */
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

    const custSession = verifyCustomerSession(req);
    const { guestId, items, email, action } = body;
    const now = Date.now();

    /* Merge guest cart into customer cart on login */
    if (action === 'merge') {
      if (!custSession) return res.status(401).json({ error: 'Unauthorized' });
      const carts      = await getCarts();
      const guestCart  = guestId ? carts.find(c => c.guestId === guestId && !c.converted) : null;
      const custCart   = carts.find(c => c.customerId === custSession.customerId && !c.converted);

      if (guestCart) {
        const mergedItems = mergeItems(custCart?.items || [], guestCart.items || []);
        const newCarts    = carts.map(c => {
          if (c.id === guestCart.id) return { ...c, converted: true, updatedAt: now };
          if (custCart && c.id === custCart.id) return { ...c, items: mergedItems, updatedAt: now };
          return c;
        });
        if (!custCart) {
          newCarts.push({ id: `cart_${now}`, guestId: null, customerId: custSession.customerId, email: custSession.email, items: mergedItems, createdAt: now, updatedAt: now, converted: false });
        }
        await writeBlob(CARTS_PATH, newCarts);
        return res.status(200).json({ items: mergedItems });
      }
      return res.status(200).json({ items: custCart?.items || [] });
    }

    /* Mark cart as converted after order placed */
    if (action === 'convert') {
      const carts = await getCarts();
      const updated = carts.map(c => {
        if (c.converted) return c;
        if (custSession && c.customerId === custSession.customerId) return { ...c, converted: true, updatedAt: now };
        if (guestId     && c.guestId    === guestId)               return { ...c, converted: true, updatedAt: now };
        return c;
      });
      await writeBlob(CARTS_PATH, updated);
      return res.status(200).json({ ok: true });
    }

    /* Save / update cart state */
    const carts = await getCarts();

    const existingIdx = carts.findIndex(c => !c.converted && (
      (custSession && c.customerId === custSession.customerId) ||
      (!custSession && guestId && c.guestId === guestId)
    ));

    if (existingIdx !== -1) {
      carts[existingIdx] = {
        ...carts[existingIdx],
        items:     items || [],
        email:     email || carts[existingIdx].email || custSession?.email || null,
        updatedAt: now,
      };
      await writeBlob(CARTS_PATH, carts);
      return res.status(200).json(carts[existingIdx]);
    }

    if (!items?.length) return res.status(200).json({ ok: true }); // don't create empty carts

    const newCart = {
      id:         `cart_${now}`,
      guestId:    custSession ? null : (guestId || null),
      customerId: custSession?.customerId || null,
      email:      email || custSession?.email || null,
      items:      items || [],
      createdAt:  now,
      updatedAt:  now,
      converted:  false,
    };

    /* Prune carts older than TTL (keep last 1000) */
    const pruned = carts
      .filter(c => c.converted || (now - c.updatedAt < GUEST_TTL))
      .slice(-999);

    await writeBlob(CARTS_PATH, [...pruned, newCart]);
    return res.status(200).json(newCart);
  }

  /* ── GET — admin: list abandoned carts ──────────────────────────────────────── */
  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const carts = await getCarts();
    const now   = Date.now();
    const abandoned = carts
      .filter(c => !c.converted && c.items?.length > 0 && (now - c.updatedAt) > ABANDONED_THRESHOLD)
      .sort((a, b) => b.updatedAt - a.updatedAt);
    return res.status(200).json(abandoned);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
