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
  { id:'ORD-001', orderNumber:'#10001', invoiceNumber:'INV-2024-0001', customer:{id:'C001',name:'Thabo Nkosi',email:'thabo.nkosi@gmail.com',phone:'083 456 7890'}, items:[{productId:'all-purpose-cleaner',name:'All Purpose Cleaner (500ml)',qty:2,price:89.99},{productId:'carpet-upholstery-shampoo',name:'Carpet & Upholstery Shampoo (5L)',qty:1,price:129.99}], subtotal:309.97, delivery:0, couponDiscount:0, couponCode:null, codFee:0, total:309.97, status:'delivered', orderStatus:'Delivered', paymentMethod:'EFT', paymentStatus:'Paid', payment:{method:'EFT',status:'paid'}, address:'12 Sunflower Street, Soweto, Gauteng, 1804', notes:'', createdAt:new Date('2024-11-15').getTime(), updatedAt:new Date('2024-11-18').getTime() },
  { id:'ORD-002', orderNumber:'#10002', invoiceNumber:'INV-2024-0002', customer:{id:'C002',name:'Priya Govender',email:'priya.g@webmail.co.za',phone:'071 234 5678'}, items:[{productId:'hand-surface-sanitiser',name:'Hand & Surface Sanitiser (5L)',qty:3,price:149.99}], subtotal:449.97, delivery:85, couponDiscount:0, couponCode:null, codFee:0, total:534.97, status:'shipped', orderStatus:'Dispatched', paymentMethod:'EFT', paymentStatus:'Paid', payment:{method:'EFT',status:'paid'}, address:'45 Phoenix Road, Durban North, KZN, 4051', notes:'Please leave at gate', createdAt:new Date('2024-11-20').getTime(), updatedAt:new Date('2024-11-22').getTime() },
  { id:'ORD-003', orderNumber:'#10003', invoiceNumber:'INV-2024-0003', customer:{id:'C003',name:'Amara Dlamini',email:'amara.d@outlook.com',phone:'082 765 4321'}, items:[{productId:'tyre-shine',name:'Tyre Shine (5L)',qty:2,price:119.99},{productId:'tyre-dash-shine',name:'Tyre & Dash Shine (5L)',qty:1,price:129.99}], subtotal:369.97, delivery:0, couponDiscount:0, couponCode:null, codFee:0, total:369.97, status:'processing', orderStatus:'Processing', paymentMethod:'EFT', paymentStatus:'Paid', payment:{method:'EFT',status:'paid'}, address:'8 Oak Avenue, Centurion, Gauteng, 0157', notes:'Business delivery', createdAt:new Date('2024-11-25').getTime(), updatedAt:new Date('2024-11-25').getTime() },
  { id:'ORD-004', orderNumber:'#10004', invoiceNumber:'INV-2024-0004', customer:{id:'C004',name:'Sipho Mahlangu',email:'sipho.m@icloud.com',phone:'079 876 5432'}, items:[{productId:'isopropyl-alcohol',name:'Isopropyl Alcohol 99.99% (5L)',qty:4,price:179.99}], subtotal:719.96, delivery:0, couponDiscount:0, couponCode:null, codFee:0, total:719.96, status:'delivered', orderStatus:'Delivered', paymentMethod:'EFT', paymentStatus:'Paid', payment:{method:'EFT',status:'paid'}, address:'23 Industrial Park, Johannesburg, Gauteng, 2092', notes:'For lab use', createdAt:new Date('2024-11-10').getTime(), updatedAt:new Date('2024-11-14').getTime() },
  { id:'ORD-005', orderNumber:'#10005', invoiceNumber:'INV-2024-0005', customer:{id:'C005',name:'Fatima Cassim',email:'fatima.c@gmail.com',phone:'076 543 2109'}, items:[{productId:'all-purpose-cleaner',name:'All Purpose Cleaner (500ml)',qty:1,price:89.99},{productId:'linen-spray',name:'Linen Spray (500ml)',qty:2,price:99.99}], subtotal:289.97, delivery:85, couponDiscount:0, couponCode:null, codFee:0, total:374.97, status:'pending', orderStatus:'Order Placed', paymentMethod:'COD', paymentStatus:'Cash Payment Pending', payment:{method:'COD',status:'pending'}, address:'67 Main Road, Cape Town, Western Cape, 8001', notes:'', createdAt:new Date('2024-11-28').getTime(), updatedAt:new Date('2024-11-28').getTime() },
];

async function getOrders() {
  const stored = await readBlob(ORDERS_PATH);
  if (Array.isArray(stored)) return stored;
  await writeBlob(ORDERS_PATH, SEED_ORDERS);
  return SEED_ORDERS;
}

async function getProducts() {
  return (await readBlob(PRODUCTS_PATH)) || [];
}

/* ── Next invoice + order number ─────────────────────────────────────────────── */
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

/* ── Province-based shipping ─────────────────────────────────────────────────── */
async function computeShipping(subtotal, province) {
  const settings  = await getSettings();
  const threshold = settings.shipping?.freeThreshold ?? 750;
  if (subtotal >= threshold) return 0;
  const rates = settings.shipping?.provinceRates || {};
  return rates[province] ?? (settings.shipping?.flatFee ?? 85);
}

/* ── Payment label ───────────────────────────────────────────────────────────── */
function payLabel(method) {
  return method === 'COD' ? 'Cash on Delivery' : method === 'EFT' ? 'EFT / Bank Transfer' : (method || '');
}

/* ════════════════════════════════════════════════════════════════════════════════
   EMAIL FUNCTIONS
   ════════════════════════════════════════════════════════════════════════════════ */

/* ── Shared email variables ──────────────────────────────────────────────────── */
function emailEnv() {
  return {
    KEY:  process.env.RESEND_API_KEY,
    FROM: process.env.FROM_EMAIL || 'Amahle Blue <noreply@amahle-blue.co.za>',
  };
}

async function sendEmail(to, subject, html) {
  const { KEY, FROM } = emailEnv();
  if (!KEY || !to) return;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ from: FROM, to: Array.isArray(to) ? to : [to], subject, html }),
    });
    if (!res.ok) {
      const err = await res.text().catch(() => '');
      console.error('[orders] email send failed:', res.status, err.slice(0, 200));
    }
  } catch (e) {
    console.error('[orders] email error:', e.message);
  }
}

/* ── Shared item rows + totals table ─────────────────────────────────────────── */
function buildItemRows(order) {
  return (order.items || []).map(i =>
    `<tr>
      <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;">${i.name}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;text-align:center;font-size:13px;color:#64748b;">${i.qty}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:14px;font-weight:700;color:#0B2545;">${R(i.price * i.qty)}</td>
    </tr>`
  ).join('');
}

function buildTotalsTable(order) {
  const couponRow = (order.couponDiscount || 0) > 0
    ? `<tr><td style="padding:8px 16px;font-size:13px;color:#64748b;">Coupon (${order.couponCode})</td><td></td><td style="padding:8px 16px;text-align:right;font-size:13px;font-weight:600;color:#159A4C;">−${R(order.couponDiscount)}</td></tr>`
    : '';
  const codFeeRow = (order.codFee || 0) > 0
    ? `<tr><td style="padding:8px 16px;font-size:13px;color:#64748b;">COD Fee</td><td></td><td style="padding:8px 16px;text-align:right;font-size:13px;font-weight:600;">${R(order.codFee)}</td></tr>`
    : '';
  return `
    <tr><td style="padding:10px 16px;font-size:14px;color:#64748b;">Subtotal</td><td></td><td style="padding:10px 16px;font-size:14px;font-weight:600;text-align:right;">${R(order.subtotal)}</td></tr>
    ${couponRow}
    <tr><td style="padding:10px 16px;font-size:14px;color:#64748b;">Delivery</td><td></td><td style="padding:10px 16px;font-size:14px;font-weight:600;text-align:right;color:${order.delivery===0?'#159A4C':'#0B2545'}">${order.delivery===0?'FREE':R(order.delivery)}</td></tr>
    ${codFeeRow}
    <tr style="border-top:2px solid #e2e8f0;"><td style="padding:14px 16px;font-size:16px;font-weight:800;color:#0B2545;">Total</td><td></td><td style="padding:14px 16px;font-size:16px;font-weight:800;text-align:right;color:#1E50E0;">${R(order.total)}</td></tr>
  `;
}

function emailWrapper(headerHtml, bodyHtml) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Helvetica,Arial,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(11,37,69,.10);">
  ${headerHtml}
  <div style="padding:32px 40px;">${bodyHtml}</div>
  <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 40px;text-align:center;">
    <p style="color:#94a3b8;font-size:12px;margin:0 0 4px;">Questions? Email us at <a href="mailto:info@amahle-blue.co.za" style="color:#1E50E0;">info@amahle-blue.co.za</a></p>
    <p style="color:#cbd5e1;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} Amahle Blue Cleaning Solutions &middot; Made in &#x1F1FF;&#x1F1E6;</p>
  </div>
</div>
</body></html>`;
}

/* ── COD order placed email ──────────────────────────────────────────────────── */
async function sendCODEmail(order) {
  if (!order?.customer?.email) return;
  const firstName = (order.customer.name || 'there').split(' ')[0];
  const header = `<div style="background:linear-gradient(135deg,#159A4C,#047857);padding:32px 40px;text-align:center;">
    <p style="color:#bbf7d0;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Amahle Blue</p>
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">Order Placed!</h1>
    <p style="color:#d1fae5;font-size:14px;margin:0;">Hi ${firstName}, your order has been placed successfully.</p>
  </div>`;
  const body = `
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:16px 18px;margin-bottom:24px;">
      <p style="font-size:14px;font-weight:700;color:#92400e;margin:0 0 6px;">&#128181; Cash on Delivery</p>
      <p style="font-size:13px;color:#78350f;margin:0;line-height:1.5;">Please keep the required cash amount ready when your order is delivered. Our delivery team will collect payment on arrival.</p>
    </div>
    <div style="background:#eff6ff;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
      <p style="font-size:13px;font-weight:700;color:#1E50E0;margin:0 0 3px;">${order.orderNumber} · ${order.invoiceNumber || ''}</p>
      <p style="font-size:12px;color:#64748b;margin:0;">Payment: Cash on Delivery · <span style="color:#d97706;font-weight:600;">Cash Payment Pending</span></p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;border:1px solid #f1f5f9;border-radius:8px;overflow:hidden;">
      <thead><tr style="background:#f8fafc;">
        <th style="padding:9px 16px;text-align:left;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Product</th>
        <th style="padding:9px 16px;text-align:center;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Qty</th>
        <th style="padding:9px 16px;text-align:right;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Total</th>
      </tr></thead>
      <tbody>${buildItemRows(order)}</tbody>
    </table>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#f8fafc;border-radius:8px;overflow:hidden;">
      ${buildTotalsTable(order)}
    </table>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;margin-bottom:16px;">
      <p style="font-size:11px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Delivery Address</p>
      <p style="font-size:14px;color:#166534;margin:0;">${order.address}</p>
    </div>
    ${order.notes ? `<p style="font-size:13px;color:#64748b;font-style:italic;margin:0;padding:12px 16px;background:#f8fafc;border-radius:8px;">Note: ${order.notes}</p>` : ''}
  `;
  await sendEmail(order.customer.email, `Order ${order.orderNumber} confirmed — Amahle Blue`, emailWrapper(header, body));
}

/* ── EFT order placed email ──────────────────────────────────────────────────── */
async function sendEFTEmail(order) {
  if (!order?.customer?.email) return;
  const firstName = (order.customer.name || 'there').split(' ')[0];
  const bank      = order.eftBankDetails || {};
  const ref       = order.eftReference   || order.orderNumber;

  const bankRows = [
    bank.accountHolder && `<tr><td style="padding:8px 16px;font-size:13px;color:#64748b;width:50%;">Account Holder</td><td style="padding:8px 16px;font-size:13px;font-weight:700;color:#0B2545;">${bank.accountHolder}</td></tr>`,
    bank.bankName      && `<tr><td style="padding:8px 16px;font-size:13px;color:#64748b;">Bank</td><td style="padding:8px 16px;font-size:13px;font-weight:700;color:#0B2545;">${bank.bankName}</td></tr>`,
    bank.accountNumber && `<tr><td style="padding:8px 16px;font-size:13px;color:#64748b;">Account Number</td><td style="padding:8px 16px;font-size:13px;font-weight:700;color:#0B2545;font-family:monospace;">${bank.accountNumber}</td></tr>`,
    bank.branchCode    && `<tr><td style="padding:8px 16px;font-size:13px;color:#64748b;">Branch Code</td><td style="padding:8px 16px;font-size:13px;font-weight:700;color:#0B2545;font-family:monospace;">${bank.branchCode}</td></tr>`,
    bank.accountType   && `<tr><td style="padding:8px 16px;font-size:13px;color:#64748b;">Account Type</td><td style="padding:8px 16px;font-size:13px;font-weight:700;color:#0B2545;">${bank.accountType}</td></tr>`,
    bank.swiftCode     && `<tr><td style="padding:8px 16px;font-size:13px;color:#64748b;">SWIFT Code</td><td style="padding:8px 16px;font-size:13px;font-weight:700;color:#0B2545;font-family:monospace;">${bank.swiftCode}</td></tr>`,
  ].filter(Boolean).join('');

  const header = `<div style="background:linear-gradient(135deg,#1E50E0,#0B2545);padding:32px 40px;text-align:center;">
    <p style="color:#7FC4FF;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Amahle Blue</p>
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">Order Received!</h1>
    <p style="color:#bfdbfe;font-size:14px;margin:0;">Hi ${firstName}, please complete your EFT payment to confirm your order.</p>
  </div>`;
  const body = `
    <div style="background:#eff6ff;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
      <p style="font-size:13px;font-weight:700;color:#1E50E0;margin:0 0 3px;">${order.orderNumber} · ${order.invoiceNumber || ''}</p>
      <p style="font-size:12px;color:#64748b;margin:0;">Payment: EFT / Bank Transfer · <span style="color:#d97706;font-weight:600;">Awaiting EFT Payment</span></p>
    </div>
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin-bottom:16px;text-align:center;">
      <p style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px;">Your Payment Reference</p>
      <p style="font-size:22px;font-weight:800;color:#1E50E0;margin:0 0 4px;font-family:monospace;">${ref}</p>
      <p style="font-size:12px;color:#78350f;margin:0;">Use this reference when making your EFT payment.</p>
    </div>
    ${bankRows ? `
    <div style="margin-bottom:24px;">
      <p style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Bank Details</p>
      <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;"><tbody>${bankRows}</tbody></table>
      <div style="background:#1E50E0;color:#fff;padding:12px 16px;border-radius:8px;margin-top:8px;text-align:center;">
        <p style="font-size:13px;font-weight:700;margin:0;">Amount Payable: ${R(order.total)}</p>
      </div>
    </div>` : ''}
    <p style="font-size:13px;color:#64748b;margin:0 0 24px;line-height:1.6;background:#f8fafc;border-radius:8px;padding:14px 16px;">
      Please use your order number as the payment reference. Your order will be processed after the payment has been verified.
      ${bank.instructions ? `<br/><br/><em>${bank.instructions}</em>` : ''}
    </p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;border:1px solid #f1f5f9;border-radius:8px;overflow:hidden;">
      <thead><tr style="background:#f8fafc;">
        <th style="padding:9px 16px;text-align:left;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Product</th>
        <th style="padding:9px 16px;text-align:center;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Qty</th>
        <th style="padding:9px 16px;text-align:right;font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Total</th>
      </tr></thead>
      <tbody>${buildItemRows(order)}</tbody>
    </table>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#f8fafc;border-radius:8px;overflow:hidden;">
      ${buildTotalsTable(order)}
    </table>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;margin-bottom:16px;">
      <p style="font-size:11px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Delivery Address</p>
      <p style="font-size:14px;color:#166534;margin:0;">${order.address}</p>
    </div>
  `;
  await sendEmail(order.customer.email, `Order ${order.orderNumber} received — please complete your EFT payment`, emailWrapper(header, body));
}

/* ── Admin new-order notification ────────────────────────────────────────────── */
async function sendAdminEmail(order) {
  const to = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;
  if (!to) return;
  const header = `<div style="background:linear-gradient(135deg,#1E50E0,#0B2545);padding:28px 40px;text-align:center;">
    <h1 style="color:#fff;font-size:20px;font-weight:800;margin:0;">&#x1F6CD; New Order Received</h1>
    <p style="color:#bfdbfe;font-size:13px;margin:4px 0 0;">From ${order.customer?.name || 'a customer'}</p>
  </div>`;
  const body = `
    <div style="background:#eff6ff;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="font-size:14px;font-weight:700;color:#1E50E0;margin:0 0 3px;">${order.orderNumber} · ${order.invoiceNumber || ''}</p>
      <p style="font-size:12px;color:#64748b;margin:0;">${order.customer?.name} · ${order.customer?.email}${order.customer?.phone ? ` · ${order.customer.phone}` : ''}</p>
      <p style="font-size:12px;color:#64748b;margin:4px 0 0;">Payment: <strong>${payLabel(order.paymentMethod || order.payment?.method)}</strong> · <strong>${order.paymentStatus || order.payment?.status}</strong></p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;border:1px solid #f1f5f9;border-radius:8px;overflow:hidden;">
      <thead><tr style="background:#f8fafc;">
        <th style="padding:9px 16px;text-align:left;font-size:11px;color:#64748b;">Product</th>
        <th style="padding:9px 16px;text-align:center;font-size:11px;color:#64748b;">Qty</th>
        <th style="padding:9px 16px;text-align:right;font-size:11px;color:#64748b;">Total</th>
      </tr></thead>
      <tbody>${buildItemRows(order)}</tbody>
    </table>
    <p style="font-size:15px;font-weight:800;color:#1E50E0;text-align:right;margin:0 0 12px;">Order Total: ${R(order.total)}</p>
    <div style="background:#f8fafc;border-radius:8px;padding:12px 16px;">
      <p style="font-size:12px;color:#64748b;margin:0;">Delivery to: ${order.address}</p>
    </div>
  `;
  await sendEmail(to, `New Order ${order.orderNumber} — ${R(order.total)} (${payLabel(order.paymentMethod || order.payment?.method)})`, emailWrapper(header, body));
}

/* ── Order status change emails ──────────────────────────────────────────────── */
async function sendOrderConfirmedEmail(order) {
  if (!order?.customer?.email) return;
  const firstName = (order.customer.name || 'there').split(' ')[0];
  const isCOD     = (order.paymentMethod || order.payment?.method) === 'COD';
  const header    = `<div style="background:linear-gradient(135deg,#1E50E0,#0B2545);padding:32px 40px;text-align:center;">
    <p style="color:#7FC4FF;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Amahle Blue</p>
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">Order Confirmed!</h1>
    <p style="color:#bfdbfe;font-size:14px;margin:0;">Hi ${firstName}, your order has been confirmed and is being prepared.</p>
  </div>`;
  const body = `
    <div style="background:#eff6ff;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="font-size:13px;font-weight:700;color:#1E50E0;margin:0 0 3px;">${order.orderNumber}</p>
      <p style="font-size:12px;color:#64748b;margin:0;">Status: <span style="color:#2563eb;font-weight:600;">Confirmed</span> · Payment: <span style="color:#16a34a;font-weight:600;">${order.paymentStatus || 'Paid'}</span></p>
    </div>
    ${isCOD ? `<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="font-size:13px;font-weight:700;color:#92400e;margin:0 0 4px;">&#128181; Cash on Delivery</p>
      <p style="font-size:13px;color:#78350f;margin:0;line-height:1.5;">Please have <strong>${R(order.total)}</strong> in cash ready when your order is delivered.</p>
    </div>` : ''}
    <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 20px;">Your order has been confirmed and is being prepared for dispatch. We'll send you another email when it's on its way.</p>
    <div style="background:#f8fafc;border-radius:8px;padding:12px 16px;">
      <p style="font-size:12px;color:#64748b;margin:0;">Delivering to: ${order.address}</p>
    </div>
  `;
  await sendEmail(order.customer.email, `Order ${order.orderNumber} confirmed — Amahle Blue`, emailWrapper(header, body));
}

async function sendOrderDispatchedEmail(order) {
  if (!order?.customer?.email) return;
  const firstName = (order.customer.name || 'there').split(' ')[0];
  const isCOD     = (order.paymentMethod || order.payment?.method) === 'COD';
  const header    = `<div style="background:linear-gradient(135deg,#0E7490,#164E63);padding:32px 40px;text-align:center;">
    <p style="color:#a5f3fc;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Amahle Blue</p>
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">&#x1F69A; Order Dispatched!</h1>
    <p style="color:#cffafe;font-size:14px;margin:0;">Hi ${firstName}, your order is on its way!</p>
  </div>`;
  const body = `
    <div style="background:#ecfeff;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="font-size:13px;font-weight:700;color:#0E7490;margin:0 0 3px;">${order.orderNumber}</p>
      <p style="font-size:12px;color:#64748b;margin:0;">Status: <span style="color:#0E7490;font-weight:600;">Dispatched</span></p>
    </div>
    ${isCOD ? `<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="font-size:13px;font-weight:700;color:#92400e;margin:0 0 4px;">&#128181; Cash Payment Reminder</p>
      <p style="font-size:13px;color:#78350f;margin:0;line-height:1.5;">Please have <strong>${R(order.total)}</strong> in cash ready for the delivery driver.</p>
    </div>` : ''}
    <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 20px;">Your order is on its way to you. ${order.trackingNumber ? `Tracking: <strong>${order.carrier || ''} ${order.trackingNumber}</strong>` : ''}</p>
    <div style="background:#f8fafc;border-radius:8px;padding:12px 16px;">
      <p style="font-size:12px;color:#64748b;margin:0;">Delivering to: ${order.address}</p>
    </div>
  `;
  await sendEmail(order.customer.email, `Your order ${order.orderNumber} is on its way — Amahle Blue`, emailWrapper(header, body));
}

async function sendOrderDeliveredEmail(order) {
  if (!order?.customer?.email) return;
  const firstName = (order.customer.name || 'there').split(' ')[0];
  const isCOD     = (order.paymentMethod || order.payment?.method) === 'COD';
  const header    = `<div style="background:linear-gradient(135deg,#159A4C,#047857);padding:32px 40px;text-align:center;">
    <p style="color:#bbf7d0;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Amahle Blue</p>
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">&#x2705; Order Delivered!</h1>
    <p style="color:#d1fae5;font-size:14px;margin:0;">Hi ${firstName}, your order has been delivered.</p>
  </div>`;
  const body = `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="font-size:13px;font-weight:700;color:#159A4C;margin:0 0 3px;">${order.orderNumber}</p>
      <p style="font-size:12px;color:#64748b;margin:0;">Status: <span style="color:#159A4C;font-weight:600;">Delivered</span></p>
    </div>
    ${isCOD ? `<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="font-size:13px;font-weight:700;color:#92400e;margin:0 0 4px;">&#128181; Cash Payment Due</p>
      <p style="font-size:13px;color:#78350f;margin:0;line-height:1.5;">Please pay <strong>${R(order.total)}</strong> in cash to the delivery driver.</p>
    </div>` : ''}
    <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 20px;">Thank you for shopping with Amahle Blue! We hope you enjoy your order. If you have any questions, please don't hesitate to contact us.</p>
  `;
  await sendEmail(order.customer.email, `Order ${order.orderNumber} delivered — Amahle Blue`, emailWrapper(header, body));
}

async function sendCashCollectedEmail(order) {
  if (!order?.customer?.email) return;
  const firstName = (order.customer.name || 'there').split(' ')[0];
  const header    = `<div style="background:linear-gradient(135deg,#159A4C,#047857);padding:32px 40px;text-align:center;">
    <p style="color:#bbf7d0;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Amahle Blue</p>
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">&#x2705; Payment Received!</h1>
    <p style="color:#d1fae5;font-size:14px;margin:0;">Hi ${firstName}, your cash payment has been collected.</p>
  </div>`;
  const body = `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="font-size:13px;font-weight:700;color:#159A4C;margin:0 0 3px;">${order.orderNumber} — ${R(order.total)}</p>
      <p style="font-size:12px;color:#64748b;margin:0;">Payment: <span style="color:#159A4C;font-weight:700;">Paid (Cash Collected)</span></p>
    </div>
    <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 20px;">Thank you for your payment of <strong>${R(order.total)}</strong>. Your transaction is now complete.</p>
  `;
  await sendEmail(order.customer.email, `Payment received for order ${order.orderNumber} — Amahle Blue`, emailWrapper(header, body));
}

async function sendPaymentVerifiedEmail(order) {
  if (!order?.customer?.email) return;
  const firstName = (order.customer.name || 'there').split(' ')[0];
  const header    = `<div style="background:linear-gradient(135deg,#159A4C,#047857);padding:32px 40px;text-align:center;">
    <p style="color:#bbf7d0;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Amahle Blue</p>
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">&#x2705; Payment Verified!</h1>
    <p style="color:#d1fae5;font-size:14px;margin:0;">Hi ${firstName}, your EFT payment has been verified.</p>
  </div>`;
  const body = `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="font-size:13px;font-weight:700;color:#159A4C;margin:0 0 3px;">${order.orderNumber} — ${R(order.total)}</p>
      <p style="font-size:12px;color:#64748b;margin:0;">Payment: <span style="color:#159A4C;font-weight:700;">Paid · Verified</span></p>
    </div>
    <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 20px;">
      We have verified your EFT payment of <strong>${R(order.total)}</strong>. Your order has been confirmed and is being prepared for dispatch.
      You will receive another email when your order is on its way.
    </p>
  `;
  await sendEmail(order.customer.email, `EFT payment verified — Order ${order.orderNumber} confirmed`, emailWrapper(header, body));
}

async function sendPaymentRejectedEmail(order, note) {
  if (!order?.customer?.email) return;
  const firstName = (order.customer.name || 'there').split(' ')[0];
  const header    = `<div style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:32px 40px;text-align:center;">
    <p style="color:#fecaca;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Amahle Blue</p>
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">Payment Rejected</h1>
    <p style="color:#fecaca;font-size:14px;margin:0;">Hi ${firstName}, there was an issue with your proof of payment.</p>
  </div>`;
  const body = `
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="font-size:13px;font-weight:700;color:#dc2626;margin:0 0 3px;">${order.orderNumber}</p>
      <p style="font-size:12px;color:#64748b;margin:0;">Payment Status: <span style="color:#dc2626;font-weight:600;">Payment Rejected</span></p>
    </div>
    ${note ? `<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="font-size:12px;font-weight:700;color:#92400e;margin:0 0 4px;">Reason:</p>
      <p style="font-size:13px;color:#78350f;margin:0;">${note}</p>
    </div>` : ''}
    <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 20px;">
      Unfortunately, we could not verify your proof of payment for order <strong>${order.orderNumber}</strong>.
      Please upload a new, clear proof of payment to your account dashboard, or contact us for assistance.
    </p>
    <p style="font-size:13px;color:#64748b;margin:0;">The EFT reference for your order is: <strong style="font-family:monospace;">${order.eftReference || order.orderNumber}</strong></p>
  `;
  await sendEmail(order.customer.email, `Action required — Proof of payment rejected for ${order.orderNumber}`, emailWrapper(header, body));
}

async function sendCorrectedProofEmail(order, note) {
  if (!order?.customer?.email) return;
  const firstName = (order.customer.name || 'there').split(' ')[0];
  const header    = `<div style="background:linear-gradient(135deg,#d97706,#92400e);padding:32px 40px;text-align:center;">
    <p style="color:#fef3c7;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 6px;">Amahle Blue</p>
    <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0 0 6px;">Proof Correction Required</h1>
    <p style="color:#fef3c7;font-size:14px;margin:0;">Hi ${firstName}, we need a corrected proof of payment.</p>
  </div>`;
  const body = `
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="font-size:13px;font-weight:700;color:#92400e;margin:0 0 3px;">${order.orderNumber}</p>
      <p style="font-size:12px;color:#64748b;margin:0;">Status: <span style="color:#d97706;font-weight:600;">Corrected Proof Requested</span></p>
    </div>
    ${note ? `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 18px;margin-bottom:20px;">
      <p style="font-size:12px;font-weight:700;color:#c2410c;margin:0 0 4px;">Correction Needed:</p>
      <p style="font-size:13px;color:#7c2d12;margin:0;">${note}</p>
    </div>` : ''}
    <p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 20px;">
      Please log in to your account and upload a corrected proof of payment. Make sure your proof clearly shows the payment amount of
      <strong>${R(order.total)}</strong> and the reference <strong style="font-family:monospace;">${order.eftReference || order.orderNumber}</strong>.
    </p>
  `;
  await sendEmail(order.customer.email, `Corrected proof of payment needed — ${order.orderNumber}`, emailWrapper(header, body));
}

/* ════════════════════════════════════════════════════════════════════════════════
   REQUEST HANDLER
   ════════════════════════════════════════════════════════════════════════════════ */
module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  /* ── POST — create order ─────────────────────────────────────────────────────── */
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

    const custSession = verifyCustomerSession(req);

    /* Idempotency */
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

    /* Payment method — only COD and EFT */
    const VALID_PAY = ['EFT', 'COD'];
    const payMethod = VALID_PAY.includes(body.payment?.method) ? body.payment.method : null;
    if (!payMethod) return res.status(400).json({ error: 'Please select a valid payment method (COD or EFT).' });

    const products = await getProducts();
    const settings = await getSettings();

    if (payMethod === 'COD' && settings.cod?.enabled === false) {
      return res.status(400).json({ error: 'Cash on Delivery is currently unavailable. Please select EFT / Bank Transfer.' });
    }
    if (payMethod === 'EFT' && settings.eft?.enabled === false) {
      return res.status(400).json({ error: 'EFT / Bank Transfer is currently unavailable. Please select Cash on Delivery.' });
    }

    /* COD amount restrictions */
    if (payMethod === 'COD') {
      const cartSubtotal = items.reduce((s, i) => {
        const p = products.find(pr => pr.id === i.productId);
        return s + (p ? p.price * (parseInt(i.qty, 10) || 0) : 0);
      }, 0);
      const minCOD = settings.cod?.minOrderAmount || 0;
      const maxCOD = settings.cod?.maxOrderAmount || 0;
      if (minCOD > 0 && cartSubtotal < minCOD) {
        return res.status(400).json({ error: `Cash on Delivery requires a minimum order of ${R(minCOD)}.` });
      }
      if (maxCOD > 0 && cartSubtotal > maxCOD) {
        return res.status(400).json({ error: `Cash on Delivery is only available for orders up to ${R(maxCOD)}.` });
      }
    }

    /* Server-side stock + price validation */
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
      validatedItems.push({ productId: product.id, name: `${product.name} (${product.size})`, qty, price: product.price });
    }

    const subtotal = Math.round(validatedItems.reduce((s, i) => s + i.price * i.qty, 0) * 100) / 100;

    const province = body.addressDetails?.province || '';
    const delivery = await computeShipping(subtotal, province);

    /* Coupon */
    let couponDiscount = 0, couponCode = null, couponId = null;
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

    const codFee = payMethod === 'COD' ? Math.round((settings.cod?.codFee || 0) * 100) / 100 : 0;
    const total  = Math.round((subtotal + delivery - couponDiscount + codFee) * 100) / 100;

    const paymentStatus = payMethod === 'COD' ? 'Cash Payment Pending' : 'Awaiting EFT Payment';
    const orderStatus   = payMethod === 'COD' ? 'Order Placed'         : 'Awaiting Payment';

    const eftBankDetails = payMethod === 'EFT' ? {
      bankName:      settings.eft?.bankName      || '',
      accountHolder: settings.eft?.accountHolder || '',
      accountNumber: settings.eft?.accountNumber || '',
      branchCode:    settings.eft?.branchCode    || '',
      accountType:   settings.eft?.accountType   || '',
      swiftCode:     settings.eft?.swiftCode     || '',
      instructions:  settings.eft?.instructions  || '',
    } : null;

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
      codFee,
      total,
      currency:       'ZAR',
      paymentMethod:  payMethod,
      paymentStatus,
      orderStatus,
      eftReference:   payMethod === 'EFT' ? orderNumber : null,
      eftBankDetails,
      proofOfPaymentUrl:        null,
      proofOfPaymentStorageKey: null,
      proofOfPaymentMetadata:   null,
      invoiceUrl:               null,
      internalNotes:            '',
      /* Backward-compat */
      status:  'pending',
      payment: { method: payMethod, status: 'pending' },
      paymentStatusHistory: [{
        previousStatus: null,
        newStatus:      paymentStatus,
        changedBy:      'system',
        note:           'Order created',
        createdAt:      Date.now(),
      }],
      notes:          (body.notes || '').trim(),
      idempotencyKey: idemKey || null,
      customerId:     custSession?.customerId || null,
      createdAt:      Date.now(),
      updatedAt:      Date.now(),
    };

    await writeBlob(ORDERS_PATH, [...orders, newOrder]);

    /* Reduce stock */
    const updatedProducts = products.map(p => {
      const item = validatedItems.find(i => i.productId === p.id);
      return item ? { ...p, stock: Math.max(0, (p.stock || 0) - item.qty), updatedAt: Date.now() } : p;
    });
    await writeBlob(PRODUCTS_PATH, updatedProducts);

    /* Coupon usage */
    if (couponId) {
      const { getCoupons: gc } = require('./coupons');
      const allCoupons = await gc();
      const idx = allCoupons.findIndex(c => c.id === couponId);
      if (idx !== -1) {
        allCoupons[idx] = { ...allCoupons[idx], usedCount: (allCoupons[idx].usedCount || 0) + 1, updatedAt: Date.now() };
        const { writeBlob: wb } = require('./_blob');
        await wb('data/maxwell-coupons.json', allCoupons);
      }
    }

    if (payMethod === 'COD') { sendCODEmail(newOrder).catch(() => {}); }
    else                     { sendEFTEmail(newOrder).catch(() => {}); }
    sendAdminEmail(newOrder).catch(() => {});

    return res.status(201).json(newOrder);
  }

  /* ── Auth check ──────────────────────────────────────────────────────────────── */
  const adminSession    = verifySession(req);
  const customerSession = adminSession ? null : verifyCustomerSession(req);
  if (!adminSession && !customerSession) return res.status(401).json({ error: 'Unauthorized' });

  /* ── GET ─────────────────────────────────────────────────────────────────────── */
  if (req.method === 'GET') {
    const orders = await getOrders();
    if (adminSession) return res.status(200).json(orders);
    const { customerId, email } = customerSession;
    const mine = orders
      .filter(o =>
        o.customerId === customerId ||
        (o.customer?.email && o.customer.email.toLowerCase() === email.toLowerCase())
      )
      .map(({ internalNotes, idempotencyKey, eftBankDetails: _b, ...safe }) => {
        if (safe.paymentMethod === 'EFT' || safe.payment?.method === 'EFT') {
          safe.eftBankDetails = _b;
        }
        return safe;
      });
    return res.status(200).json(mine);
  }

  /* ── PATCH ───────────────────────────────────────────────────────────────────── */
  if (req.method === 'PATCH') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

    const { id, status, orderStatus, notes, internalNotes, paymentStatus, trackingNumber, carrier, statusNote } = body;
    if (!id) return res.status(400).json({ error: 'Missing order id' });

    const orders = await getOrders();
    const idx    = orders.findIndex(o => o.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Order not found' });

    const prev          = orders[idx];
    const isCustomerOnly = customerSession && !adminSession;

    /* ── Customer: can only cancel their own pending orders ── */
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

    const patch = { updatedAt: Date.now() };

    /* ── Simple old status (backward-compat) ── */
    if (status !== undefined && !isCustomerOnly) {
      const VALID_STATUS = ['pending','confirmed','processing','packed','shipped','delivered','cancelled'];
      if (!VALID_STATUS.includes(status)) return res.status(400).json({ error: 'Invalid order status.' });
      const STATUS_TO_DESCRIPTIVE = {
        pending:    (prev.paymentMethod === 'EFT' || prev.payment?.method === 'EFT') ? 'Awaiting Payment' : 'Order Placed',
        confirmed:  'Confirmed',
        processing: 'Processing',
        packed:     'Processing',
        shipped:    'Dispatched',
        delivered:  'Delivered',
        cancelled:  'Cancelled',
      };
      patch.status      = status;
      patch.orderStatus = STATUS_TO_DESCRIPTIVE[status] || status;
    } else if (status !== undefined && isCustomerOnly) {
      patch.status      = status;
      patch.orderStatus = 'Cancelled';
    }

    /* ── Descriptive orderStatus ── */
    if (!isCustomerOnly && orderStatus !== undefined) {
      const ORDER_STATUS_MAP = {
        'Order Placed':     'pending',
        'Awaiting Payment': 'pending',
        'Confirmed':        'confirmed',
        'Processing':       'processing',
        'Dispatched':       'shipped',
        'Delivered':        'delivered',
        'Cancelled':        'cancelled',
      };
      if (!ORDER_STATUS_MAP.hasOwnProperty(orderStatus)) {
        return res.status(400).json({ error: 'Invalid order status.' });
      }
      patch.orderStatus = orderStatus;
      patch.status      = ORDER_STATUS_MAP[orderStatus];
    }

    if (!isCustomerOnly) {
      if (notes !== undefined) patch.notes = String(notes).slice(0, 2000);
      if (internalNotes !== undefined) {
        const noteText = String(internalNotes).slice(0, 4000).trim();
        if (noteText) {
          const existing = Array.isArray(prev.internalNotes) ? prev.internalNotes : [];
          patch.internalNotes = [...existing, {
            note:      noteText,
            addedBy:   adminSession?.user?.username || adminSession?.username || 'admin',
            createdAt: Date.now(),
          }];
        }
      }
      if (trackingNumber !== undefined) patch.trackingNumber = String(trackingNumber).slice(0, 80);
      if (carrier        !== undefined) patch.carrier        = String(carrier).slice(0, 80);

      if (paymentStatus !== undefined) {
        const VALID_PAY_STATUS = [
          'pending', 'paid', 'failed', 'refunded',
          'Cash Payment Pending', 'Awaiting EFT Payment',
          'Proof of Payment Submitted', 'Payment Verification Required',
          'Paid', 'Refunded', 'Failed',
          'Payment Rejected', 'Corrected Proof Requested',
        ];
        if (!VALID_PAY_STATUS.includes(paymentStatus)) {
          return res.status(400).json({ error: 'Invalid payment status.' });
        }

        const simpleStatus = (() => {
          if (paymentStatus === 'paid'     || paymentStatus === 'Paid')     return 'paid';
          if (paymentStatus === 'failed'   || paymentStatus === 'Failed')   return 'failed';
          if (paymentStatus === 'refunded' || paymentStatus === 'Refunded') return 'refunded';
          return 'pending';
        })();

        const descriptiveStatus = (() => {
          if (paymentStatus === 'paid')     return 'Paid';
          if (paymentStatus === 'failed')   return 'Failed';
          if (paymentStatus === 'refunded') return 'Refunded';
          if (paymentStatus === 'pending') {
            const method = prev.paymentMethod || prev.payment?.method || '';
            return method === 'EFT' ? 'Awaiting EFT Payment' : 'Cash Payment Pending';
          }
          return paymentStatus;
        })();

        patch.payment       = { ...(prev.payment || {}), status: simpleStatus };
        patch.paymentStatus = descriptiveStatus;

        /* Auto-transition: EFT verified → confirm order if still awaiting */
        if (descriptiveStatus === 'Paid' && (prev.paymentMethod === 'EFT' || prev.payment?.method === 'EFT')) {
          if (!patch.orderStatus && (prev.orderStatus === 'Awaiting Payment' || prev.status === 'pending')) {
            patch.orderStatus = 'Confirmed';
            patch.status      = 'confirmed';
          }
        }

        const prevHistory   = Array.isArray(prev.paymentStatusHistory) ? prev.paymentStatusHistory : [];
        const prevPayStatus = prev.paymentStatus || prev.payment?.status || 'pending';
        patch.paymentStatusHistory = [
          ...prevHistory,
          {
            previousStatus: prevPayStatus,
            newStatus:      descriptiveStatus,
            changedBy:      adminSession?.user?.username || adminSession?.username || 'admin',
            note:           statusNote || '',
            createdAt:      Date.now(),
          },
        ];
      }
    }

    /* Stock and Coupon adjustment on status change */
    const effectiveNewStatus = patch.status ?? prev.status;
    
    if (prev.status !== 'cancelled' && effectiveNewStatus === 'cancelled') {
      // Transition: Active -> Cancelled (Restore stock and coupon)
      const allProducts = await getProducts();
      const updatedProducts = allProducts.map(p => {
        const item = (prev.items || []).find(i => i.productId === p.id);
        return item ? { ...p, stock: (p.stock || 0) + item.qty, updatedAt: Date.now() } : p;
      });
      await writeBlob(PRODUCTS_PATH, updatedProducts);

      if (prev.couponId) {
        const { getCoupons: gc } = require('./coupons');
        const allCoupons = await gc();
        const ci = allCoupons.findIndex(c => c.id === prev.couponId);
        if (ci !== -1 && allCoupons[ci].usedCount > 0) {
          allCoupons[ci] = { ...allCoupons[ci], usedCount: allCoupons[ci].usedCount - 1, updatedAt: Date.now() };
          await writeBlob('data/maxwell-coupons.json', allCoupons);
        }
      }
    } else if (prev.status === 'cancelled' && effectiveNewStatus !== 'cancelled') {
      // Transition: Cancelled -> Active (Check & Deduct stock and coupon)
      const allProducts = await getProducts();
      
      // 1. Verify stock availability before committing to anything
      for (const item of (prev.items || [])) {
        const product = allProducts.find(p => p.id === item.productId);
        if (!product) continue;
        const stockAvail = typeof product.stock === 'number' ? product.stock : 999;
        if (stockAvail < item.qty) {
          return res.status(400).json({ error: `Cannot reactivate order: Only ${stockAvail} unit(s) of "${product.name}" available, but ${item.qty} required.` });
        }
      }

      // 2. Deduct stock safely
      const updatedProducts = allProducts.map(p => {
        const item = (prev.items || []).find(i => i.productId === p.id);
        return item ? { ...p, stock: Math.max(0, (p.stock || 0) - item.qty), updatedAt: Date.now() } : p;
      });
      await writeBlob(PRODUCTS_PATH, updatedProducts);

      // 3. Re-apply coupon usage
      if (prev.couponId) {
        const { getCoupons: gc } = require('./coupons');
        const allCoupons = await gc();
        const ci = allCoupons.findIndex(c => c.id === prev.couponId);
        if (ci !== -1) {
          allCoupons[ci] = { ...allCoupons[ci], usedCount: (allCoupons[ci].usedCount || 0) + 1, updatedAt: Date.now() };
          await writeBlob('data/maxwell-coupons.json', allCoupons);
        }
      }
    }

    const updated = { ...prev, ...patch };
    const newList = [...orders]; newList[idx] = updated;
    await writeBlob(ORDERS_PATH, newList);

    /* ── Trigger status-change emails (non-blocking) ── */
    if (!isCustomerOnly) {
      const prevOrderStatus = prev.orderStatus || prev.status;
      const newOrderStatus  = updated.orderStatus || updated.status;
      const prevPayStatus   = prev.paymentStatus  || prev.payment?.status;
      const newPayStatus    = updated.paymentStatus;
      const payMethod       = updated.paymentMethod || updated.payment?.method;

      /* Order status emails */
      if (newOrderStatus !== prevOrderStatus) {
        if (newOrderStatus === 'Confirmed')  sendOrderConfirmedEmail(updated).catch(() => {});
        if (newOrderStatus === 'Dispatched') sendOrderDispatchedEmail(updated).catch(() => {});
        if (newOrderStatus === 'Delivered')  sendOrderDeliveredEmail(updated).catch(() => {});
      }

      /* Payment status emails */
      if (newPayStatus && newPayStatus !== prevPayStatus) {
        if (newPayStatus === 'Paid' && payMethod === 'COD') {
          sendCashCollectedEmail(updated).catch(() => {});
        } else if (newPayStatus === 'Paid' && payMethod === 'EFT') {
          sendPaymentVerifiedEmail(updated).catch(() => {});
        } else if (newPayStatus === 'Payment Rejected') {
          sendPaymentRejectedEmail(updated, statusNote || '').catch(() => {});
        } else if (newPayStatus === 'Corrected Proof Requested') {
          sendCorrectedProofEmail(updated, statusNote || '').catch(() => {});
        }
      }
    }

    return res.status(200).json(updated);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
