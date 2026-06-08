/* Orders API — GET (admin or customer), POST (public), PATCH (admin + customer cancel) */
const { verifySession, cors }                = require('./_auth');
const { verifyCustomerSession }              = require('./_customers');
const { readBlob, writeBlob }                = require('./_blob');
const { getSettings }                        = require('./settings');
const { getCoupons, calcDiscount }           = require('./coupons');

const ORDERS_PATH   = 'data/maxwell-orders.json';
const PRODUCTS_PATH = 'data/maxwell-products.json';
const SETTINGS_PATH = 'data/maxwell-settings.json';

/* ── Money formatter (South African: R 1,250.00) ─────────────────────────────── */
function R(n) {
  const abs = Math.abs(n || 0).toFixed(2);
  const [int, dec] = abs.split('.');
  const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return 'R ' + formatted + '.' + dec;
}

/* ── Seed data (used only until first real order) ────────────────────────────── */
const SEED_ORDERS = [
  { id:'ORD-001', orderNumber:'#10001', invoiceNumber:'INV-2024-0001', customer:{id:'C001',name:'Thabo Nkosi',email:'thabo.nkosi@gmail.com',phone:'083 456 7890'}, items:[{productId:'all-purpose-cleaner',name:'All Purpose Cleaner (500ml)',qty:2,price:89.99},{productId:'carpet-upholstery-shampoo',name:'Carpet & Upholstery Shampoo (5L)',qty:1,price:129.99}], subtotal:309.97, delivery:0, couponDiscount:0, couponCode:null, total:309.97, status:'delivered', payment:{method:'EFT',status:'paid'}, address:'12 Sunflower Street, Soweto, Gauteng, 1804', notes:'', createdAt:new Date('2024-11-15').getTime(), updatedAt:new Date('2024-11-18').getTime() },
  { id:'ORD-002', orderNumber:'#10002', invoiceNumber:'INV-2024-0002', customer:{id:'C002',name:'Priya Govender',email:'priya.g@webmail.co.za',phone:'071 234 5678'}, items:[{productId:'hand-surface-sanitiser',name:'Hand & Surface Sanitiser (5L)',qty:3,price:149.99}], subtotal:449.97, delivery:85, couponDiscount:0, couponCode:null, total:534.97, status:'shipped', payment:{method:'Card',status:'paid'}, address:'45 Phoenix Road, Durban North, KZN, 4051', notes:'Please leave at gate', createdAt:new Date('2024-11-20').getTime(), updatedAt:new Date('2024-11-22').getTime() },
  { id:'ORD-003', orderNumber:'#10003', invoiceNumber:'INV-2024-0003', customer:{id:'C003',name:'Amara Dlamini',email:'amara.d@outlook.com',phone:'082 765 4321'}, items:[{productId:'tyre-shine',name:'Tyre Shine (5L)',qty:2,price:119.99},{productId:'tyre-dash-shine',name:'Tyre & Dash Shine (5L)',qty:1,price:129.99}], subtotal:369.97, delivery:0, couponDiscount:0, couponCode:null, total:369.97, status:'processing', payment:{method:'EFT',status:'paid'}, address:'8 Oak Avenue, Centurion, Gauteng, 0157', notes:'Business delivery', createdAt:new Date('2024-11-25').getTime(), updatedAt:new Date('2024-11-25').getTime() },
  { id:'ORD-004', orderNumber:'#10004', invoiceNumber:'INV-2024-0004', customer:{id:'C004',name:'Sipho Mahlangu',email:'sipho.m@icloud.com',phone:'079 876 5432'}, items:[{productId:'isopropyl-alcohol',name:'Isopropyl Alcohol 99.99% (5L)',qty:4,price:179.99}], subtotal:719.96, delivery:0, couponDiscount:0, couponCode:null, total:719.96, status:'delivered', payment:{method:'Card',status:'paid'}, address:'23 Industrial Park, Johannesburg, Gauteng, 2092', notes:'For lab use', createdAt:new Date('2024-11-10').getTime(), updatedAt:new Date('2024-11-14').getTime() },
  { id:'ORD-005', orderNumber:'#10005', invoiceNumber:'INV-2024-0005', customer:{id:'C005',name:'Fatima Cassim',email:'fatima.c@gmail.com',phone:'076 543 2109'}, items:[{productId:'all-purpose-cleaner',name:'All Purpose Cleaner (500ml)',qty:1,price:89.99},{productId:'linen-spray',name:'Linen Spray (500ml)',qty:2,price:99.99}], subtotal:289.97, delivery:85, couponDiscount:0, couponCode:null, total:374.97, status:'pending', payment:{method:'COD',status:'pending'}, address:'67 Main Road, Cape Town, Western Cape, 8001', notes:'', createdAt:new Date('2024-11-28').getTime(), updatedAt:new Date('2024-11-28').getTime() },
];

/*
 * getOrders returns the live order list.
 * SEED_ORDERS is only used on the very first read (no blob exists at all) so the
 * admin dashboard has something to look at; once persisted, we never reseed.
 * Returning [] when admin has intentionally cleared everything is correct.
 */
async function getOrders() {
  const stored = await readBlob(ORDERS_PATH);
  if (Array.isArray(stored)) return stored;
  await writeBlob(ORDERS_PATH, SEED_ORDERS);
  return SEED_ORDERS;
}

async function getProducts() {
  return (await readBlob(PRODUCTS_PATH)) || [];
}

/* ── Next invoice + order number (single counter, collision-safe) ────────────── */
async function nextInvoiceAndOrderNumber() {
  const s = (await readBlob(SETTINGS_PATH)) || {};
  const invoiceCounter = (s.invoiceCounter || 1000) + 1;
  const orderCounter   = (s.orderCounter   || 10000) + 1;
  const year = new Date().getFullYear();
  await writeBlob(SETTINGS_PATH, { ...s, invoiceCounter, orderCounter });
  return {
    invoiceNumber: `INV-${year}-${String(invoiceCounter).padStart(4, '0')}`,
    orderNumber:   `#${orderCounter}`,
  };
}

/* ── Compute shipping fee ────────────────────────────────────────────────────── */
async function computeShipping(subtotal, province) {
  const settings = await getSettings();
  const threshold = settings.shipping?.freeThreshold ?? 750;
  if (subtotal >= threshold) return 0;
  const rates = settings.shipping?.provinceRates || {};
  return rates[province] ?? (settings.shipping?.flatFee ?? 85);
}

/* ── Customer confirmation email ─────────────────────────────────────────────── */
async function sendOrderEmail(order, isAdmin = false) {
  const KEY  = process.env.RESEND_API_KEY;
  const FROM = process.env.FROM_EMAIL || 'Amahle Blue <noreply@amahle-blue.co.za>';
  if (!KEY) return;

  const to      = isAdmin ? (process.env.ADMIN_EMAIL || process.env.FROM_EMAIL) : order?.customer?.email;
  if (!to) return;

  const greet = isAdmin
    ? `New order received from ${order.customer?.name || 'a customer'}!`
    : (order.customer?.name ? `Hi ${order.customer.name.split(' ')[0]},` : 'Hi there,');

  const subject = isAdmin
    ? `New Order ${order.orderNumber} — ${R(order.total)}`
    : `Order ${order.orderNumber} confirmed — Amahle Blue`;

  const rows = (order.items || []).map(i =>
    `<tr>
      <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;">${i.name}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;text-align:center;font-size:13px;color:#64748b;">${i.qty}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:14px;font-weight:700;color:#0B2545;">${R(i.price * i.qty)}</td>
    </tr>`
  ).join('');

  const couponRow = order.couponDiscount > 0
    ? `<tr><td style="padding:10px 16px;font-size:14px;color:#64748b;">Coupon (${order.couponCode})</td><td style="padding:10px 16px;font-size:14px;font-weight:600;text-align:right;color:#159A4C;">−${R(order.couponDiscount)}</td></tr>`
    : '';

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Helvetica,Arial,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(11,37,69,.10);">
  <div style="background:linear-gradient(135deg,#1E50E0,#0B2545);padding:32px 40px;text-align:center;">
    <p style="color:#7FC4FF;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Amahle Blue</p>
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">${isAdmin ? '🛍️ New Order Received' : 'Order Confirmed!'}</h1>
    <p style="color:#bfdbfe;font-size:14px;margin:0;">${greet}</p>
  </div>
  <div style="padding:32px 40px;">
    <div style="background:#eff6ff;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
      <p style="font-size:13px;font-weight:700;color:#1E50E0;margin:0 0 3px;">${order.orderNumber} · ${order.invoiceNumber || ''}</p>
      <p style="font-size:12px;color:#64748b;margin:0;">Payment: <strong>${order.payment?.method}</strong></p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;border:1px solid #f1f5f9;border-radius:8px;overflow:hidden;">
      <thead><tr style="background:#f8fafc;">
        <th style="padding:9px 16px;text-align:left;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Product</th>
        <th style="padding:9px 16px;text-align:center;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Qty</th>
        <th style="padding:9px 16px;text-align:right;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Total</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#f8fafc;border-radius:8px;overflow:hidden;">
      <tr><td style="padding:10px 16px;font-size:14px;color:#64748b;">Subtotal</td><td style="padding:10px 16px;font-size:14px;font-weight:600;text-align:right;">${R(order.subtotal)}</td></tr>
      ${couponRow}
      <tr><td style="padding:10px 16px;font-size:14px;color:#64748b;">Delivery</td><td style="padding:10px 16px;font-size:14px;font-weight:600;text-align:right;color:${order.delivery===0?'#159A4C':'#0B2545'}">${order.delivery===0?'FREE':R(order.delivery)}</td></tr>
      <tr style="border-top:2px solid #e2e8f0;"><td style="padding:14px 16px;font-size:16px;font-weight:800;color:#0B2545;">Total</td><td style="padding:14px 16px;font-size:16px;font-weight:800;text-align:right;color:#1E50E0;">${R(order.total)}</td></tr>
    </table>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;margin-bottom:16px;">
      <p style="font-size:11px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Delivery Address</p>
      <p style="font-size:14px;color:#166534;margin:0;">${order.address}</p>
    </div>
    ${order.notes ? `<p style="font-size:13px;color:#64748b;font-style:italic;margin:0;padding:12px 16px;background:#f8fafc;border-radius:8px;">Note: ${order.notes}</p>` : ''}
  </div>
  <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 40px;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">Questions? Email us at <a href="mailto:info@amahle-blue.co.za" style="color:#1E50E0;">info@amahle-blue.co.za</a></p>
    <p style="color:#cbd5e1;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Amahle Blue Cleaning Solutions &middot; Made in &#x1F1FF;&#x1F1E6;</p>
  </div>
</div>
</body></html>`;

  try {
    await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ from: FROM, to: [to], subject, html }),
    });
  } catch (e) {
    console.error('[orders] email error:', e.message);
  }
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  /* ── POST — create order (public) ────────────────────────────────────────────── */
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

    const custSession = verifyCustomerSession(req);

    /* Idempotency — prevent double-clicks */
    const idemKey = (body.idempotencyKey || '').trim();
    const orders  = await getOrders();
    if (idemKey) {
      const existing = orders.find(o => o.idempotencyKey === idemKey);
      if (existing) return res.status(200).json(existing);
    }

    /* Required fields */
    const customer = body.customer || {};
    if (!customer.name?.trim())  return res.status(400).json({ error: 'Customer name is required.' });
    if (!customer.email?.trim()) return res.status(400).json({ error: 'Customer email is required.' });
    if (!body.address?.trim())   return res.status(400).json({ error: 'Delivery address is required.' });

    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) return res.status(400).json({ error: 'Cart is empty.' });

    /* Server-side price & stock validation */
    const products = await getProducts();
    const settings = await getSettings();

    const validatedItems = [];
    for (const item of items) {
      const product = products.find(p => p.id === item.productId && p.status === 'active');
      if (!product) return res.status(400).json({ error: 'One or more products are unavailable.' });

      const qty = parseInt(item.qty, 10);
      if (!qty || qty < 1) return res.status(400).json({ error: `Invalid quantity for "${product.name}".` });

      const stockAvail = typeof product.stock === 'number' ? product.stock : 999;
      if (stockAvail < qty) {
        return res.status(400).json({
          error: `Only ${stockAvail} unit${stockAvail === 1 ? '' : 's'} of "${product.name}" available.`,
        });
      }

      validatedItems.push({
        productId: product.id,
        name:      `${product.name} (${product.size})`,
        qty,
        price:     product.price, // always use server-side price
      });
    }

    /* Subtotal */
    const subtotal = Math.round(validatedItems.reduce((s, i) => s + i.price * i.qty, 0) * 100) / 100;

    /* Province-based shipping */
    const province = body.addressDetails?.province || '';
    const delivery = await computeShipping(subtotal, province);

    /* Coupon validation */
    let couponDiscount = 0;
    let couponCode     = null;
    let couponId       = null;

    if (body.couponCode) {
      const coupons = await getCoupons();
      const code    = (body.couponCode || '').toUpperCase().trim();
      const c       = coupons.find(cp => cp.code === code);

      if (c && c.active && !(c.expiresAt && Date.now() > c.expiresAt) && !(c.maxUses > 0 && c.usedCount >= c.maxUses)) {
        if (subtotal >= (c.minOrderValue || 0)) {
          couponDiscount = calcDiscount(c, subtotal);
          couponCode     = c.code;
          couponId       = c.id;
        }
      }
    }

    const total = Math.round((subtotal + delivery - couponDiscount) * 100) / 100;

    /* Payment method validation */
    const VALID_PAY = ['EFT', 'Card', 'COD'];
    let payMethod   = VALID_PAY.includes(body.payment?.method) ? body.payment.method : 'COD';

    /* Check if COD is enabled */
    if (payMethod === 'COD' && settings.cod?.enabled === false) {
      payMethod = 'EFT';
    }

    /* Order + invoice numbers from persistent counter */
    const { invoiceNumber, orderNumber } = await nextInvoiceAndOrderNumber();

    const newOrder = {
      id:             `ORD-${Date.now()}`,
      orderNumber,
      invoiceNumber,
      customer: {
        name:  customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: (customer.phone || '').trim(),
        id:    custSession?.customerId || null,
      },
      addressDetails: body.addressDetails || null,
      address:        body.address.trim(),
      items:          validatedItems,
      subtotal,
      delivery,
      couponDiscount,
      couponCode,
      couponId,
      total,
      status:         'pending',
      payment:        { method: payMethod, status: 'pending' },
      notes:          (body.notes || '').trim(),
      idempotencyKey: idemKey || null,
      customerId:     custSession?.customerId || null,
      createdAt:      Date.now(),
      updatedAt:      Date.now(),
    };

    /* Write order */
    await writeBlob(ORDERS_PATH, [...orders, newOrder]);

    /* Reduce stock */
    const updatedProducts = products.map(p => {
      const item = validatedItems.find(i => i.productId === p.id);
      return item ? { ...p, stock: Math.max(0, (p.stock || 0) - item.qty), updatedAt: Date.now() } : p;
    });
    await writeBlob(PRODUCTS_PATH, updatedProducts);

    /* Increment coupon usage */
    if (couponId) {
      const { getCoupons: gc } = require('./coupons');
      const coupons = await gc();
      const idx = coupons.findIndex(c => c.id === couponId);
      if (idx !== -1) {
        coupons[idx] = { ...coupons[idx], usedCount: (coupons[idx].usedCount || 0) + 1, updatedAt: Date.now() };
        const { writeBlob: wb } = require('./_blob');
        await wb('data/maxwell-coupons.json', coupons);
      }
    }

    /* Emails: customer confirmation + admin notification */
    sendOrderEmail(newOrder, false).catch(() => {});
    sendOrderEmail(newOrder, true).catch(() => {});

    return res.status(201).json(newOrder);
  }

  /* ── Auth check ──────────────────────────────────────────────────────────────── */
  const adminSession    = verifySession(req);
  const customerSession = adminSession ? null : verifyCustomerSession(req);
  if (!adminSession && !customerSession) return res.status(401).json({ error: 'Unauthorized' });

  /* ── GET — list orders ───────────────────────────────────────────────────────── */
  if (req.method === 'GET') {
    const orders = await getOrders();
    if (adminSession) return res.status(200).json(orders);
    const { customerId, email } = customerSession;
    const mine = orders
      .filter(o =>
        o.customerId === customerId ||
        (o.customer?.email && o.customer.email.toLowerCase() === email.toLowerCase())
      )
      /* Strip admin-only fields before sending to the customer */
      .map(({ internalNotes, idempotencyKey, ...safe }) => safe);
    return res.status(200).json(mine);
  }

  /* ── PATCH ───────────────────────────────────────────────────────────────────── */
  if (req.method === 'PATCH') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

    const { id, status, notes, internalNotes, paymentStatus, trackingNumber, carrier } = body;
    if (!id) return res.status(400).json({ error: 'Missing order id' });

    const orders = await getOrders();
    const idx    = orders.findIndex(o => o.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Order not found' });

    const prev = orders[idx];

    const isCustomerOnly = customerSession && !adminSession;

    /* Customer: can only cancel their own pending/confirmed/processing orders */
    if (isCustomerOnly) {
      const isOwner = prev.customerId === customerSession.customerId ||
        prev.customer?.email?.toLowerCase() === customerSession.email.toLowerCase();
      if (!isOwner) return res.status(403).json({ error: 'Forbidden' });
      if (status !== 'cancelled') return res.status(403).json({ error: 'Customers can only cancel orders.' });
      const cancellable = ['pending', 'confirmed', 'processing'];
      if (!cancellable.includes(prev.status)) {
        return res.status(400).json({ error: 'This order can no longer be cancelled.' });
      }
    } else if (!adminSession) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    /* Admin can touch any field; customers may only set status. This guards
       against a customer slipping `paymentStatus: 'paid'` or `internalNotes`
       into the cancel request body. */
    const patch = { updatedAt: Date.now() };
    if (status !== undefined) patch.status = status;
    if (!isCustomerOnly) {
      const VALID_STATUS = ['pending','confirmed','processing','packed','shipped','delivered','cancelled'];
      if (status !== undefined && !VALID_STATUS.includes(status)) {
        return res.status(400).json({ error: 'Invalid order status.' });
      }
      if (notes          !== undefined) patch.notes          = String(notes).slice(0, 2000);
      if (internalNotes  !== undefined) patch.internalNotes  = String(internalNotes).slice(0, 4000);
      if (trackingNumber !== undefined) patch.trackingNumber = String(trackingNumber).slice(0, 80);
      if (carrier        !== undefined) patch.carrier        = String(carrier).slice(0, 80);
      if (paymentStatus  !== undefined) {
        const VALID_PAY_STATUS = ['pending','paid','failed','refunded'];
        if (!VALID_PAY_STATUS.includes(paymentStatus)) {
          return res.status(400).json({ error: 'Invalid payment status.' });
        }
        patch.payment = { ...(prev.payment || {}), status: paymentStatus };
      }
    }

    /* Restore stock on cancellation */
    if (status === 'cancelled' && prev.status !== 'cancelled') {
      const products        = await getProducts();
      const updatedProducts = products.map(p => {
        const item = (prev.items || []).find(i => i.productId === p.id);
        return item ? { ...p, stock: (p.stock || 0) + item.qty, updatedAt: Date.now() } : p;
      });
      await writeBlob(PRODUCTS_PATH, updatedProducts);

      /* Restore coupon usage on cancel */
      if (prev.couponId) {
        const { getCoupons: gc } = require('./coupons');
        const coupons = await gc();
        const ci = coupons.findIndex(c => c.id === prev.couponId);
        if (ci !== -1 && coupons[ci].usedCount > 0) {
          coupons[ci] = { ...coupons[ci], usedCount: coupons[ci].usedCount - 1, updatedAt: Date.now() };
          await writeBlob('data/maxwell-coupons.json', coupons);
        }
      }
    }

    const updated  = { ...prev, ...patch };
    const newList  = [...orders]; newList[idx] = updated;
    await writeBlob(ORDERS_PATH, newList);
    return res.status(200).json(updated);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
