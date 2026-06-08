/* Amahle Blue Store — CartPage, CheckoutPage, OrderConfirmedPage */

const PROVINCES = [
  'Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape',
  'Mpumalanga','Limpopo','North West','Free State','Northern Cape',
];

/* ── Shared helpers ──────────────────────────────────────────────────────────── */
function CkField({ label, className = '', as: As = 'input', ...props }) {
  return (
    <div className={className}>
      <label className="block text-[12px] font-700 text-slate-600 mb-1.5">{label}</label>
      <As {...props} className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-[13px] outline-none transition focus:border-cobalt focus:ring-2 focus:ring-cobalt/10 bg-white" />
    </div>
  );
}

function CkSpinner() {
  return <span style={{width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',flexShrink:0,display:'inline-block',animation:'spin .7s linear infinite'}} />;
}

/* ── Invoice generator ───────────────────────────────────────────────────────── */
function printInvoice(order) {
  const R = (n) => {
    const abs  = Math.abs(n || 0).toFixed(2);
    const [int, dec] = abs.split('.');
    return 'R ' + int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + dec;
  };

  /* South African VAT is 15% and our displayed prices are VAT-inclusive,
     so we show the embedded VAT amount on the invoice for the buyer's
     SARS record-keeping. */
  const VAT_RATE     = 0.15;
  const taxableTotal = (order.total || 0); // VAT-inclusive
  const vatExcl      = taxableTotal / (1 + VAT_RATE);
  const vatAmount    = taxableTotal - vatExcl;
  const vatNumber    = (window.__settings && window.__settings.business && window.__settings.business.vatNumber) || '';

  const rows = (order.items || []).map(i => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#334155;">${i.name}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;text-align:center;font-size:13px;color:#64748b;">${i.qty}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px;color:#64748b;">${R(i.price)}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px;font-weight:700;color:#0B2545;">${R(i.price * i.qty)}</td>
    </tr>`).join('');

  const couponRow = order.couponDiscount > 0 ? `
    <tr><td colspan="3" style="padding:8px 14px;text-align:right;font-size:13px;color:#64748b;">Coupon (${order.couponCode})</td>
    <td style="padding:8px 14px;text-align:right;font-size:13px;font-weight:600;color:#159A4C;">−${R(order.couponDiscount)}</td></tr>` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width"/>
  <title>Invoice ${order.invoiceNumber || order.orderNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Helvetica, Arial, sans-serif; background: #fff; color: #0B2545; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { max-width: 720px; margin: 0 auto; padding: 40px 40px 60px; }
    @media print {
      body { background: #fff; }
      .no-print { display: none !important; }
      .page { padding: 20px; }
    }
    h1 { font-size: 28px; font-weight: 800; color: #0B2545; }
    .badge { display:inline-block; padding:4px 12px; border-radius:99px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; }
    .badge-pending  { background:#fef3c7; color:#d97706; }
    .badge-paid     { background:#dcfce7; color:#16a34a; }
    .badge-cod      { background:#e0f2fe; color:#0369a1; }
    table { width:100%; border-collapse:collapse; }
    th { background:#f8fafc; padding:9px 14px; text-align:left; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1px; }
    th:last-child, td:last-child { text-align:right; }
    td.center, th.center { text-align:center; }
  </style>
</head>
<body>
<div class="page">
  <!-- Print button -->
  <div class="no-print" style="text-align:right; margin-bottom:24px;">
    <button onclick="window.print()" style="background:#1E50E0;color:#fff;border:none;padding:10px 22px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">
      🖨️ Print / Save PDF
    </button>
  </div>

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1E50E0,#0B2545);padding:32px 36px;border-radius:16px;margin-bottom:32px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
      <div>
        <div style="color:#7FC4FF;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:4px;">Amahle Blue</div>
        <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0;">TAX INVOICE</h1>
      </div>
      <div style="text-align:right;">
        <div style="color:#bfdbfe;font-size:13px;">${order.invoiceNumber || order.orderNumber}</div>
        <div style="color:#7FC4FF;font-size:12px;margin-top:2px;">${new Date(order.createdAt).toLocaleDateString('en-ZA',{day:'numeric',month:'long',year:'numeric'})}</div>
      </div>
    </div>
  </div>

  <!-- From / To -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px;">
    <div>
      <p style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">From</p>
      <p style="font-weight:700;font-size:15px;color:#0B2545;margin-bottom:4px;">Amahle Blue</p>
      <p style="font-size:13px;color:#64748b;line-height:1.6;">Unit H, 13 Main Reef Road<br>Dunswart, Boksburg<br>Gauteng, South Africa</p>
      <p style="font-size:12px;color:#94a3b8;margin-top:6px;">info@amahle-blue.co.za</p>
      ${vatNumber ? `<p style="font-size:12px;color:#94a3b8;margin-top:2px;">VAT No: ${vatNumber}</p>` : ''}
    </div>
    <div>
      <p style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Bill / Ship To</p>
      <p style="font-weight:700;font-size:15px;color:#0B2545;margin-bottom:4px;">${order.customer?.name || ''}</p>
      <p style="font-size:13px;color:#64748b;margin-bottom:2px;">${order.customer?.email || ''}</p>
      <p style="font-size:13px;color:#64748b;margin-bottom:4px;">${order.customer?.phone || ''}</p>
      <p style="font-size:13px;color:#64748b;line-height:1.6;">${(order.address || '').replace(/,\s*/g, ',<br>')}</p>
    </div>
  </div>

  <!-- Order meta -->
  <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px;">
    <div style="background:#f8fafc;border-radius:10px;padding:12px 18px;flex:1;min-width:160px;">
      <p style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Order Number</p>
      <p style="font-size:15px;font-weight:700;color:#1E50E0;">${order.orderNumber}</p>
    </div>
    <div style="background:#f8fafc;border-radius:10px;padding:12px 18px;flex:1;min-width:160px;">
      <p style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Payment Method</p>
      <p style="font-size:14px;font-weight:600;color:#0B2545;">${order.payment?.method === 'COD' ? 'Cash on Delivery' : order.payment?.method === 'EFT' ? 'Bank Transfer (EFT)' : (order.payment?.method || '')}</p>
    </div>
    <div style="background:#f8fafc;border-radius:10px;padding:12px 18px;flex:1;min-width:160px;">
      <p style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Payment Status</p>
      <p style="font-size:14px;font-weight:700;color:${order.payment?.status==='paid'?'#159A4C':'#d97706'};text-transform:capitalize;">${order.payment?.status || 'Pending'}</p>
    </div>
    <div style="background:#f8fafc;border-radius:10px;padding:12px 18px;flex:1;min-width:160px;">
      <p style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;">Order Status</p>
      <p style="font-size:14px;font-weight:700;color:#0B2545;text-transform:capitalize;">${order.status || ''}</p>
    </div>
  </div>

  <!-- Items table -->
  <table style="margin-bottom:4px;">
    <thead>
      <tr>
        <th>Product</th>
        <th class="center">Qty</th>
        <th>Unit Price</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <!-- Totals -->
  <table style="margin-bottom:32px;">
    <tbody>
      <tr><td colspan="3" style="padding:10px 14px;text-align:right;font-size:13px;color:#64748b;">Subtotal</td>
          <td style="padding:10px 14px;text-align:right;font-size:13px;font-weight:600;">${R(order.subtotal)}</td></tr>
      ${couponRow}
      <tr><td colspan="3" style="padding:10px 14px;text-align:right;font-size:13px;color:#64748b;">Delivery</td>
          <td style="padding:10px 14px;text-align:right;font-size:13px;font-weight:600;color:${order.delivery===0?'#159A4C':'#0B2545'}">${order.delivery===0?'FREE':R(order.delivery)}</td></tr>
      <tr><td colspan="3" style="padding:10px 14px;text-align:right;font-size:12px;color:#94a3b8;">VAT (15%, included in total)</td>
          <td style="padding:10px 14px;text-align:right;font-size:12px;color:#94a3b8;">${R(vatAmount)}</td></tr>
      <tr style="border-top:2px solid #e2e8f0;">
        <td colspan="3" style="padding:14px 14px;text-align:right;font-size:16px;font-weight:800;color:#0B2545;">Total (incl. VAT)</td>
        <td style="padding:14px 14px;text-align:right;font-size:18px;font-weight:800;color:#1E50E0;">${R(order.total)}</td>
      </tr>
    </tbody>
  </table>

  ${order.notes ? `<div style="background:#f8fafc;border-radius:10px;padding:14px 18px;margin-bottom:20px;"><p style="font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Order Notes</p><p style="font-size:13px;color:#64748b;font-style:italic;">${order.notes}</p></div>` : ''}

  <div style="border-top:2px solid #f1f5f9;padding-top:20px;text-align:center;color:#94a3b8;font-size:12px;">
    <p>Thank you for your business — Amahle Blue Cleaning Solutions</p>
    <p style="margin-top:4px;">info@amahle-blue.co.za · 067 101 4345 · Made in 🇿🇦</p>
  </div>
</div>
</body></html>`;

  const win = window.open('', '_blank', 'width=800,height=900,scrollbars=yes');
  if (!win) { alert('Please allow pop-ups to download the invoice.'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { try { win.print(); } catch {} }, 600);
}

/* ── CartPage ────────────────────────────────────────────────────────────────── */
function CartPage({ onGoHome, onCheckout }) {
  const { detailed, count, subtotal, setQty, remove, clear } = useCart();

  const delivery  = count > 0 ? (subtotal >= FREE_SHIP ? 0 : 85) : 0;
  const total     = subtotal + delivery;
  const remaining = Math.max(0, FREE_SHIP - subtotal);
  const pct       = Math.min(100, (subtotal / FREE_SHIP) * 100);

  if (count === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-slate-100 text-slate-400 mb-5">
          <Bag size={36} />
        </div>
        <h2 className="font-display text-2xl font-extrabold text-ink">Your cart is empty</h2>
        <p className="mt-2 text-slate-500 text-[15px] max-w-xs">Browse our cleaning, car-care and sanitiser range.</p>
        <button onClick={onGoHome} className="mt-6 h-12 px-8 rounded-full bg-cobalt text-white font-bold hover:bg-cobalt-700 transition">
          Start shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-5">
          <button onClick={onGoHome} className="flex items-center gap-1.5 text-[13px] font-600 text-slate-500 hover:text-cobalt transition mb-4">
            <ArrowLeft size={16} /> Continue Shopping
          </button>
          <div className="flex items-center gap-3">
            <Cart size={22} className="text-cobalt" />
            <h1 className="font-display text-xl font-extrabold text-ink">Your Cart</h1>
            <span className="rounded-full bg-cobalt/10 text-cobalt px-2.5 py-0.5 text-[12.5px] font-700">
              {count} item{count !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="space-y-4">
            {/* Free shipping progress */}
            <div className="bg-white rounded-2xl border border-slate-100 px-5 py-4">
              {remaining > 0 ? (
                <p className="text-[13px] text-slate-600">
                  Add <span className="font-700 text-cobalt">{money(remaining)}</span> more for{' '}
                  <span className="font-600 text-ink">free Gauteng delivery</span>
                </p>
              ) : (
                <p className="flex items-center gap-2 text-[13px] font-600 text-grass">
                  <CheckCircle size={16} /> You've unlocked free delivery!
                </p>
              )}
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-cobalt to-sky-400 transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Cart items */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
              {detailed.map(({ product, qty }) => {
                const maxStock = typeof product.stock === 'number' ? product.stock : 99;
                return (
                  <div key={product.id} className="flex gap-4 p-5">
                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                      <img src={product.img} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-700 text-[15px] text-ink leading-snug truncate">{product.name}</p>
                          <p className="text-[12px] text-slate-400 mt-0.5">{product.size} · {catOf(product.cat)?.short}</p>
                          <p className="text-[13.5px] font-700 text-cobalt mt-1">{money(product.price)} each</p>
                        </div>
                        <button onClick={() => remove(product.id)} className="shrink-0 text-slate-300 hover:text-red-500 transition" aria-label="Remove">
                          <Trash size={17} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-1">
                        <div className="flex items-center rounded-full border border-slate-200">
                          <button onClick={() => setQty(product.id, qty - 1)} className="grid h-9 w-9 place-items-center text-slate-500 hover:text-cobalt transition" aria-label="Decrease"><Minus size={14} /></button>
                          <span className="w-8 text-center text-[14px] font-700 text-ink">{qty}</span>
                          <button onClick={() => setQty(product.id, qty + 1)} disabled={qty >= maxStock}
                            className="grid h-9 w-9 place-items-center text-slate-500 hover:text-cobalt transition disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Increase">
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-800 text-[16px] text-ink">{money(product.price * qty)}</span>
                      </div>
                      {typeof product.stock === 'number' && product.stock > 0 && product.stock <= 10 && (
                        <p className="text-[11.5px] text-amber-600 font-600">Only {product.stock} left in stock</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between px-1">
              <button onClick={onGoHome} className="flex items-center gap-2 text-[13px] font-600 text-slate-500 hover:text-cobalt transition">
                <ArrowLeft size={15} /> Continue Shopping
              </button>
              <button onClick={clear} className="text-[12.5px] font-600 text-slate-400 hover:text-red-500 transition">
                Clear cart
              </button>
            </div>
          </div>

          {/* Summary sidebar */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 sticky top-28">
            <h3 className="font-display text-[16px] font-extrabold text-ink">Order Summary</h3>
            <div className="space-y-2 text-[13px]">
              {detailed.map(({ product, qty }) => (
                <div key={product.id} className="flex justify-between text-slate-600">
                  <span className="truncate max-w-[190px]">{product.name} ×{qty}</span>
                  <span className="font-600 shrink-0 ml-2">{money(product.price * qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-slate-200 pt-3 space-y-2 text-[13.5px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-600 text-ink">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery</span>
                <span className={`font-600 ${delivery === 0 ? 'text-grass' : 'text-ink'}`}>
                  {delivery === 0 ? 'FREE' : money(delivery)}
                </span>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
              <span className="font-display text-[16px] font-extrabold text-ink">Total</span>
              <span className="font-display text-[22px] font-extrabold text-ink">{money(total)}</span>
            </div>
            <button onClick={onCheckout}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-cobalt py-3.5 text-[15px] font-bold text-white hover:bg-cobalt-700 transition">
              <Lock size={16} /> Proceed to Checkout
            </button>
            <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-slate-400">
              <Shield size={13} /> Secure checkout · SSL encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── CheckoutPage ────────────────────────────────────────────────────────────── */
function CheckoutPage({ onBack, onSuccess }) {
  const { customer, sessionToken, isLoggedIn, openAuth, apiBase } = useCustomer();
  const { detailed, subtotal, count, clear, coupon, setCoupon } = useCart();

  const [form, setForm] = React.useState({
    name: customer?.name || '', email: customer?.email || '', phone: customer?.phone || '',
    addrLine: '', addrCity: '', addrProvince: '', addrPostal: '', addrCountry: 'South Africa',
    payment: 'COD', notes: '',
  });
  const [selectedAddr, setSelectedAddr] = React.useState('');
  const [placing,      setPlacing]      = React.useState(false);
  const [error,        setError]        = React.useState('');

  /* Coupon state */
  const [couponInput,   setCouponInput]   = React.useState(coupon?.code || '');
  const [couponLoading, setCouponLoading] = React.useState(false);
  const [couponError,   setCouponError]   = React.useState('');

  /* Province-aware shipping */
  const [delivery, setDelivery] = React.useState(subtotal >= FREE_SHIP ? 0 : 85);
  const [settings, setSettings] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${apiBase}/api/settings`);
        if (res.ok) setSettings(await res.json());
      } catch {}
    })();
  }, []);

  React.useEffect(() => {
    if (!settings) return;
    const threshold = settings.shipping?.freeThreshold ?? FREE_SHIP;
    if (subtotal >= threshold) { setDelivery(0); return; }
    const rate = settings.shipping?.provinceRates?.[form.addrProvince] ?? (settings.shipping?.flatFee ?? 85);
    setDelivery(rate);
  }, [form.addrProvince, subtotal, settings]);

  const couponDiscount = coupon?.discount || 0;
  const total          = Math.max(0, subtotal + delivery - couponDiscount);

  const idemKey = React.useRef(`idem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

  React.useEffect(() => {
    if (!customer) return;
    setForm(f => ({ ...f, name: customer.name || f.name, email: customer.email || f.email, phone: customer.phone || f.phone }));
    const def = customer.addresses?.find(a => a.isDefault);
    if (def) applyAddress(def);
  }, [customer?.id]);

  function applyAddress(addr) {
    setSelectedAddr(addr.id);
    setForm(f => ({ ...f, addrLine: addr.line || '', addrCity: addr.city || '', addrProvince: addr.province || '', addrPostal: addr.postalCode || '' }));
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  async function applyCoupon(e) {
    if (e) e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true); setCouponError('');
    try {
      const res  = await fetch(`${apiBase}/api/coupons`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'validate', code, cartTotal: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) { setCouponError(data.error || 'Invalid coupon code.'); setCoupon(null); setCouponLoading(false); return; }
      setCoupon({ code: data.code, discount: data.discount, type: data.type, value: data.value });
      setCouponError('');
    } catch { setCouponError('Network error. Please try again.'); }
    setCouponLoading(false);
  }

  function removeCoupon() { setCoupon(null); setCouponInput(''); setCouponError(''); }

  /* Validate SA phone numbers: accepts 067 101 4345 / 0671014345 / +27 67 101 4345. */
  function isValidSaPhone(raw) {
    if (!raw) return true; // optional field
    const digits = String(raw).replace(/[^\d+]/g, '');
    return /^(\+?27|0)[6-8]\d{8}$/.test(digits);
  }

  async function placeOrder(e) {
    e.preventDefault();
    if (!form.name.trim())     { setError('Please enter your full name.'); return; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
                               { setError('Please enter a valid email address.'); return; }
    if (form.phone.trim() && !isValidSaPhone(form.phone))
                               { setError('Please enter a valid South African phone number (e.g. 067 101 4345).'); return; }
    if (!form.addrLine.trim()) { setError('Please enter your street address.'); return; }
    if (!form.addrCity.trim()) { setError('Please enter your city or town.'); return; }
    if (!form.addrProvince)    { setError('Please select a province so we can calculate delivery.'); return; }

    setPlacing(true); setError('');

    const addrString = [form.addrLine, form.addrCity, form.addrProvince, form.addrPostal, form.addrCountry]
      .filter(Boolean).join(', ');

    const payload = {
      customer:       { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() },
      address:        addrString,
      addressDetails: { line: form.addrLine.trim(), city: form.addrCity.trim(), province: form.addrProvince, postalCode: form.addrPostal.trim(), country: form.addrCountry },
      items:          detailed.map(({ product, qty }) => ({ productId: product.id, name: `${product.name} (${product.size})`, qty, price: product.price })),
      subtotal, delivery, couponCode: coupon?.code || null, total,
      payment:        { method: form.payment, status: 'pending' },
      notes:          form.notes.trim(),
      idempotencyKey: idemKey.current,
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;
      const res  = await fetch(`${apiBase}/api/orders`, { method: 'POST', headers, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to place order. Please try again.'); setPlacing(false); return; }
      clear();
      try { localStorage.removeItem('ab_products'); } catch {}
      onSuccess(data);
    } catch { setError('Network error. Please check your connection and try again.'); }
    setPlacing(false);
  }

  if (count === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
        <p className="text-slate-500 text-[15px]">
          Your cart is empty.{' '}
          <button onClick={onBack} className="text-cobalt font-700 hover:underline">Go back</button>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-5">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] font-600 text-slate-500 hover:text-cobalt transition mb-4">
            <ArrowLeft size={16} /> Back to cart
          </button>
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-cobalt" />
            <h1 className="font-display text-xl font-extrabold text-ink">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">

          <form id="ck-form" onSubmit={placeOrder} className="space-y-5">
            {/* Sign-in prompt */}
            {!isLoggedIn && (
              <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-700 text-[14px] text-ink">Sign in for faster checkout</p>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">Save addresses, track orders, and speed up future checkouts</p>
                </div>
                <button type="button" onClick={openAuth}
                  className="shrink-0 h-9 px-4 rounded-full bg-cobalt text-white text-[13px] font-700 hover:bg-cobalt-700 transition">
                  Sign in
                </button>
              </div>
            )}

            {/* Customer details */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <h3 className="font-display text-[15px] font-extrabold text-ink flex items-center gap-2">
                <User size={17} className="text-cobalt" /> Customer Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <CkField label="Full name *" value={form.name} onChange={f('name')} placeholder="Your full name" required className="sm:col-span-2" />
                <CkField label="Email address *" type="email" value={form.email} onChange={f('email')} placeholder="your@email.com" required />
                <CkField label="Phone number" type="tel" value={form.phone} onChange={f('phone')} placeholder="067 000 0000" />
              </div>
            </div>

            {/* Saved addresses */}
            {isLoggedIn && customer?.addresses?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
                <h3 className="font-display text-[14px] font-extrabold text-ink flex items-center gap-2">
                  <MapPin size={16} className="text-cobalt" /> Saved Addresses
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {customer.addresses.map(addr => (
                    <button key={addr.id} type="button" onClick={() => applyAddress(addr)}
                      className={`flex items-start gap-3 rounded-xl px-3.5 py-3 border text-left transition ${selectedAddr === addr.id ? 'border-cobalt bg-cobalt/5' : 'border-slate-200 hover:border-cobalt/40'}`}>
                      <div className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${selectedAddr === addr.id ? 'border-cobalt bg-cobalt' : 'border-slate-300'}`}>
                        {selectedAddr === addr.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-700 text-ink">{addr.label}</p>
                        <p className="text-[11.5px] text-slate-400 truncate">{addr.line}{addr.city ? `, ${addr.city}` : ''}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery address */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <h3 className="font-display text-[15px] font-extrabold text-ink flex items-center gap-2">
                <MapPin size={17} className="text-cobalt" /> Delivery Address
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <CkField label="Street address *" value={form.addrLine} onChange={f('addrLine')} placeholder="12 Main Street, Unit 4" required className="sm:col-span-2" />
                <CkField label="City / Town *" value={form.addrCity} onChange={f('addrCity')} placeholder="Johannesburg" required />
                <div>
                  <label className="block text-[12px] font-700 text-slate-600 mb-1.5">Province</label>
                  <select value={form.addrProvince} onChange={f('addrProvince')}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-[13px] bg-white outline-none transition focus:border-cobalt focus:ring-2 focus:ring-cobalt/10">
                    <option value="">Select province…</option>
                    {PROVINCES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <CkField label="Postal code" value={form.addrPostal} onChange={f('addrPostal')} placeholder="2000" />
                <div>
                  <label className="block text-[12px] font-700 text-slate-600 mb-1.5">Country</label>
                  <select value={form.addrCountry} onChange={f('addrCountry')}
                    className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-[13px] bg-white outline-none transition focus:border-cobalt focus:ring-2 focus:ring-cobalt/10">
                    {['South Africa','Zimbabwe','Mozambique','Botswana','Namibia','Lesotho','Eswatini','Zambia','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
              <h3 className="font-display text-[15px] font-extrabold text-ink flex items-center gap-2">
                <CreditCard size={17} className="text-cobalt" /> Payment Method
              </h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { id: 'COD',  label: 'Cash on Delivery', emoji: '💵', desc: 'Pay when you receive' },
                  { id: 'EFT',  label: 'Bank Transfer',    emoji: '🏦', desc: 'EFT via bank' },
                  { id: 'Card', label: 'Online Payment',   emoji: '💳', desc: 'Coming soon', disabled: true },
                ].filter(m => {
                  if (m.id === 'COD' && settings?.cod?.enabled === false) return false;
                  return true;
                }).map(m => (
                  <button key={m.id} type="button"
                    onClick={() => !m.disabled && setForm(p => ({ ...p, payment: m.id }))}
                    disabled={m.disabled}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-4 text-center transition ${m.disabled ? 'opacity-50 cursor-not-allowed border-slate-100 bg-slate-50' : form.payment === m.id ? 'border-cobalt bg-cobalt/5' : 'border-slate-200 hover:border-cobalt/40'}`}>
                    <span className="text-2xl">{m.emoji}</span>
                    <span className={`text-[12.5px] font-700 ${form.payment === m.id ? 'text-cobalt' : 'text-ink'}`}>{m.label}</span>
                    <span className="text-[11px] text-slate-400 leading-tight">{m.desc}</span>
                  </button>
                ))}
              </div>
              {form.payment === 'EFT' && (
                <div className="rounded-xl bg-sky-50 border border-sky-200 px-4 py-3 text-[12.5px] text-sky-700">
                  <strong>EFT instructions</strong> will be emailed after your order is confirmed.
                </div>
              )}
            </div>

            {/* Coupon code */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
              <h3 className="font-display text-[14px] font-extrabold text-ink flex items-center gap-2">
                <Tag size={16} className="text-cobalt" /> Coupon Code
              </h3>
              {coupon ? (
                <div className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3 ring-1 ring-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-grass shrink-0" />
                    <div>
                      <p className="text-[13px] font-700 text-grass">{coupon.code} applied</p>
                      <p className="text-[12px] text-green-600">
                        {coupon.type === 'percentage' ? `${coupon.value}% off` : `${money(coupon.value)} off`} — saving {money(coupon.discount)}
                      </p>
                    </div>
                  </div>
                  <button type="button" onClick={removeCoupon} className="text-slate-400 hover:text-red-500 transition">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={couponInput} onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon(e); } }}
                    placeholder="Enter coupon code"
                    className={`flex-1 h-10 rounded-xl border px-3.5 text-[13px] font-mono outline-none transition focus:border-cobalt focus:ring-2 focus:ring-cobalt/10 ${couponError ? 'border-red-300' : 'border-slate-200'}`} />
                  <button type="button" onClick={applyCoupon} disabled={couponLoading || !couponInput.trim()}
                    className="h-10 px-4 rounded-xl bg-cobalt text-white text-[13px] font-700 hover:bg-cobalt-700 disabled:opacity-50 transition whitespace-nowrap">
                    {couponLoading ? 'Checking…' : 'Apply'}
                  </button>
                </div>
              )}
              {couponError && <p className="text-[12px] text-red-500">{couponError}</p>}
            </div>

            {/* Order notes */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <label className="block font-display text-[14px] font-extrabold text-ink mb-3">Order Notes (optional)</label>
              <textarea value={form.notes} onChange={f('notes')} rows={3}
                placeholder="Special instructions, delivery notes, or any other requests…"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-[13px] outline-none transition focus:border-cobalt focus:ring-2 focus:ring-cobalt/10 resize-none" />
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5">
                <AlertCircle size={17} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-[13px] text-red-600 leading-snug">{error}</p>
              </div>
            )}
          </form>

          {/* Summary sidebar */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 sticky top-28">
            <h3 className="font-display text-[16px] font-extrabold text-ink">Order Summary</h3>
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {detailed.map(({ product, qty }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                    <img src={product.img} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-600 text-ink truncate">{product.name}</p>
                    <p className="text-[11.5px] text-slate-400">{product.size} × {qty}</p>
                  </div>
                  <span className="text-[13px] font-700 text-ink shrink-0">{money(product.price * qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-3 space-y-2 text-[13.5px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-600 text-ink">{money(subtotal)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-grass font-600">Coupon ({coupon.code})</span>
                  <span className="font-700 text-grass">−{money(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery</span>
                <span className={`font-600 ${delivery === 0 ? 'text-grass' : 'text-ink'}`}>
                  {delivery === 0 ? 'FREE' : money(delivery)}
                </span>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
              <span className="font-display text-[15px] font-extrabold text-ink">Total</span>
              <span className="font-display text-[20px] font-extrabold text-ink">{money(total)}</span>
            </div>
            <p className="text-[11px] text-slate-400">Prices include 15% VAT.</p>
            <button form="ck-form" type="submit" disabled={placing}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-cobalt py-3.5 text-[15px] font-bold text-white hover:bg-cobalt-700 transition disabled:opacity-60">
              {placing ? <><CkSpinner /> Placing order…</> : <><Lock size={16} /> Place Order · {money(total)}</>}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-slate-400">
              <Shield size={13} /> Your details are secured and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── OrderConfirmedPage ──────────────────────────────────────────────────────── */
function OrderConfirmedPage({ order, onGoHome, onGoOrders }) {
  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <button onClick={onGoHome} className="h-12 px-6 rounded-full bg-cobalt text-white font-bold">Continue Shopping</button>
      </div>
    );
  }

  const PAY_LABELS = { COD: 'Cash on Delivery', EFT: 'Bank Transfer (EFT)', Card: 'Online Payment' };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center pt-12 pb-16 px-4">
      <div className="w-full max-w-[580px]">
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-lg">
          {/* Header */}
          <div className="bg-gradient-to-br from-grass to-emerald-600 px-8 py-10 text-center">
            <div className="inline-grid h-16 w-16 place-items-center rounded-full bg-white/20 mb-4">
              <CheckCircle size={34} className="text-white" />
            </div>
            <h2 className="font-display text-[24px] font-extrabold text-white">Order Placed!</h2>
            <p className="text-emerald-100 mt-1.5 text-[14px]">
              Thanks for your order — we'll get it processed shortly.
            </p>
          </div>

          <div className="p-7 sm:p-8 space-y-5">
            {/* Order number + total */}
            <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-5 py-4">
              <div>
                <p className="text-[11px] font-700 text-slate-400 uppercase tracking-wide mb-0.5">Order Number</p>
                <p className="font-display text-[20px] font-extrabold text-ink">{order.orderNumber}</p>
                {order.invoiceNumber && <p className="text-[11px] text-slate-400 mt-0.5">{order.invoiceNumber}</p>}
              </div>
              <div className="text-right">
                <p className="text-[11px] font-700 text-slate-400 uppercase tracking-wide mb-0.5">Total</p>
                <p className="font-display text-[20px] font-extrabold text-cobalt">{money(order.total)}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-[11px] font-700 text-slate-400 uppercase tracking-wide mb-2.5">Items Ordered</p>
              <div className="space-y-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-50 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-[13.5px] font-600 text-ink leading-snug">{item.name}</p>
                      <p className="text-[12px] text-slate-400">Qty: {item.qty} × {money(item.price)}</p>
                    </div>
                    <span className="font-700 text-ink text-[14px]">{money(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-slate-50 rounded-xl px-4 py-3.5 space-y-2 text-[13.5px]">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-600">{money(order.subtotal)}</span></div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between"><span className="text-grass font-600">Coupon ({order.couponCode})</span><span className="font-700 text-grass">−{money(order.couponDiscount)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-slate-500">Delivery</span><span className={`font-600 ${order.delivery === 0 ? 'text-grass' : ''}`}>{order.delivery === 0 ? 'FREE' : money(order.delivery)}</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-2 mt-1">
                <span className="font-700 text-ink">Total</span>
                <span className="font-800 text-cobalt text-[15px]">{money(order.total)}</span>
              </div>
            </div>

            {/* Delivery + payment */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl px-4 py-3.5">
                <p className="text-[11px] font-700 text-slate-400 uppercase tracking-wide mb-1">Delivery Address</p>
                <p className="text-[13px] text-slate-600 leading-relaxed">{order.address}</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-4 py-3.5">
                <p className="text-[11px] font-700 text-slate-400 uppercase tracking-wide mb-1">Payment</p>
                <p className="text-[13px] font-600 text-ink">{PAY_LABELS[order.payment?.method] || order.payment?.method}</p>
                <p className="text-[12px] font-600 text-amber-600 capitalize mt-0.5">{order.payment?.status}</p>
              </div>
            </div>

            {order.notes && (
              <p className="text-[12.5px] text-slate-400 italic bg-slate-50 rounded-xl px-4 py-3">Note: {order.notes}</p>
            )}

            <p className="text-[12.5px] text-center text-slate-400">
              A confirmation email has been sent to <strong>{order.customer?.email}</strong>
            </p>
          </div>

          <div className="border-t border-slate-100 px-7 sm:px-8 py-5 flex flex-col sm:flex-row gap-3">
            <button onClick={() => printInvoice(order)}
              className="flex-1 h-11 rounded-full border border-slate-200 text-slate-600 text-[14px] font-600 hover:bg-slate-50 transition flex items-center justify-center gap-2">
              <FileText size={16} /> Download Invoice
            </button>
            {onGoOrders && (
              <button onClick={onGoOrders}
                className="flex-1 h-11 rounded-full border border-cobalt text-cobalt text-[14px] font-700 hover:bg-cobalt/5 transition flex items-center justify-center gap-2">
                <Package size={16} /> View My Orders
              </button>
            )}
            <button onClick={onGoHome}
              className="flex-1 h-11 rounded-full bg-cobalt text-white text-[14px] font-bold hover:bg-cobalt-700 transition flex items-center justify-center gap-2">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CartPage, CheckoutPage, OrderConfirmedPage, CkField, CkSpinner, printInvoice });
