/* Amahle Blue Store — Customer Account Dashboard */

const ORDER_STATUSES = ['pending','confirmed','processing','packed','shipped','delivered'];

const STATUS_META = {
  pending:    { label:'Pending',    color:'text-amber-600',  bg:'bg-amber-50',  ring:'ring-amber-200' },
  confirmed:  { label:'Confirmed',  color:'text-blue-600',   bg:'bg-blue-50',   ring:'ring-blue-200' },
  processing: { label:'Processing', color:'text-indigo-600', bg:'bg-indigo-50', ring:'ring-indigo-200' },
  packed:     { label:'Packed',     color:'text-violet-600', bg:'bg-violet-50', ring:'ring-violet-200' },
  shipped:    { label:'Shipped',    color:'text-sky-600',    bg:'bg-sky-50',    ring:'ring-sky-200' },
  delivered:  { label:'Delivered',  color:'text-grass',      bg:'bg-green-50',  ring:'ring-green-200' },
  cancelled:  { label:'Cancelled',  color:'text-red-600',    bg:'bg-red-50',    ring:'ring-red-200' },
};

function fmtOrderDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-ZA', { day:'numeric', month:'short', year:'numeric' });
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-700 ${m.color} ${m.bg} ring-1 ${m.ring} capitalize`}>
      {m.label}
    </span>
  );
}

function CustomerAvatar({ name, size = 48 }) {
  const COLORS = ['#1E50E0','#0B2545','#159A4C','#7C3AED','#0E7490','#B45309'];
  const bg  = COLORS[(name || '?').charCodeAt(0) % COLORS.length];
  const txt = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:bg, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.38, fontWeight:700, flexShrink:0 }}>
      {txt}
    </div>
  );
}

/* ─── Order Status Tracker ──────────────────────────────────────────────────── */
function OrderTracker({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
        <X size={16} className="text-red-500" />
        <span className="text-sm font-600 text-red-600">Order Cancelled</span>
      </div>
    );
  }
  const activeIdx = ORDER_STATUSES.indexOf(status);
  return (
    <div className="relative">
      <div className="flex items-center">
        {ORDER_STATUSES.map((s, i) => {
          const done    = i < activeIdx;
          const current = i === activeIdx;
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1">
                <div className={`grid h-7 w-7 place-items-center rounded-full ring-2 transition-colors ${
                  done    ? 'bg-cobalt ring-cobalt text-white' :
                  current ? 'bg-cobalt ring-cobalt ring-offset-2 text-white' :
                            'bg-white ring-slate-200 text-slate-300'
                }`}>
                  {done ? <Check size={13} /> : <span className="text-[10px] font-700">{i+1}</span>}
                </div>
                <span className={`text-[9.5px] font-600 text-center leading-tight capitalize ${
                  done || current ? 'text-cobalt' : 'text-slate-400'
                }`} style={{ maxWidth:44 }}>{s}</span>
              </div>
              {i < ORDER_STATUSES.length - 1 && (
                <div className={`mb-4 flex-1 h-0.5 mx-1 ${i < activeIdx ? 'bg-cobalt' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

const CANCELLABLE_STATUSES = ['pending', 'confirmed', 'processing'];

/* ─── Order Detail Modal ────────────────────────────────────────────────────── */
function OrderDetailModal({ order, onClose, onReorder, onCancel }) {
  const [cancelling, setCancelling] = React.useState(false);
  const [cancelError, setCancelError] = React.useState('');

  if (!order) return null;

  async function handleCancel() {
    if (!confirm('Cancel this order? This cannot be undone.')) return;
    setCancelling(true); setCancelError('');
    const result = await onCancel(order.id);
    setCancelling(false);
    if (result?.error) { setCancelError(result.error); return; }
    onClose();
  }

  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-16 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-ink/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-[560px] rounded-2xl bg-white shadow-2xl" style={{ animation:'abfade .2s ease' }}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-extrabold text-ink">{order.orderNumber}</h3>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-[12.5px] text-slate-400 mt-0.5">
              {fmtOrderDate(order.createdAt)}
              {order.invoiceNumber && <span className="ml-2 text-slate-300">· {order.invoiceNumber}</span>}
            </p>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-slate-100 text-slate-400"><X size={18}/></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Tracker */}
          <div>
            <p className="text-[11px] font-700 uppercase tracking-wide text-slate-400 mb-3">Order Status</p>
            <OrderTracker status={order.status} />
          </div>

          {/* Items */}
          <div>
            <p className="text-[11px] font-700 uppercase tracking-wide text-slate-400 mb-2">Items Ordered</p>
            <div className="space-y-2">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-[13.5px] font-600 text-ink leading-snug">{item.name}</p>
                    <p className="text-[12px] text-slate-400">Qty: {item.qty}</p>
                  </div>
                  <span className="font-bold text-ink text-[14px]">{money(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-1.5">
            <div className="flex justify-between text-[13px]"><span className="text-slate-500">Subtotal</span><span className="font-600 text-ink">{money(order.subtotal)}</span></div>
            {order.couponDiscount > 0 && (
              <div className="flex justify-between text-[13px]"><span className="text-grass font-600">Coupon ({order.couponCode})</span><span className="font-700 text-grass">−{money(order.couponDiscount)}</span></div>
            )}
            <div className="flex justify-between text-[13px]"><span className="text-slate-500">Delivery</span><span className={`font-600 ${order.delivery === 0 ? 'text-grass' : 'text-ink'}`}>{order.delivery === 0 ? 'FREE' : money(order.delivery)}</span></div>
            <div className="flex justify-between text-[14px] border-t border-slate-200 pt-2 mt-1"><span className="font-700 text-ink">Total</span><span className="font-800 text-ink">{money(order.total)}</span></div>
          </div>

          {/* Delivery address */}
          {order.address && (
            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="text-cobalt mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-700 uppercase tracking-wide text-slate-400 mb-0.5">Delivery Address</p>
                <p className="text-[13px] text-slate-600">{order.address}</p>
              </div>
            </div>
          )}

          {/* Tracking info */}
          {order.trackingNumber && (
            <div className="flex items-start gap-2.5">
              <Truck size={16} className="text-cobalt mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-700 uppercase tracking-wide text-slate-400 mb-0.5">Tracking</p>
                <p className="text-[13px] text-slate-600">{order.carrier ? `${order.carrier} · ` : ''}{order.trackingNumber}</p>
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-[11px] font-700 uppercase tracking-wide text-slate-400">Payment</p>
              <p className="text-[13px] font-600 text-slate-700">{order.payment?.method === 'COD' ? 'Cash on Delivery' : order.payment?.method}</p>
            </div>
            <div>
              <p className="text-[11px] font-700 uppercase tracking-wide text-slate-400">Status</p>
              <p className={`text-[13px] font-600 capitalize ${order.payment?.status === 'paid' ? 'text-grass' : 'text-amber-600'}`}>{order.payment?.status}</p>
            </div>
          </div>

          {order.notes && <p className="text-[12.5px] text-slate-400 italic">Note: {order.notes}</p>}
          {cancelError && <p className="text-[12.5px] text-red-500 font-600">{cancelError}</p>}
        </div>

        <div className="border-t border-slate-100 px-6 py-4 flex flex-wrap gap-3">
          {canCancel && (
            <button onClick={handleCancel} disabled={cancelling}
              className="h-11 px-4 rounded-xl border border-red-200 text-red-600 text-[13px] font-700 hover:bg-red-50 disabled:opacity-60 transition flex items-center gap-1.5">
              {cancelling ? <AccSpinner /> : <XCircle size={15} />}
              {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}
          <button onClick={() => printInvoice(order)}
            className="h-11 px-4 rounded-xl border border-slate-200 text-[13px] font-600 text-slate-600 hover:bg-slate-50 transition flex items-center gap-1.5">
            <FileText size={15} /> Invoice
          </button>
          <button onClick={onClose} className="h-11 px-4 rounded-xl border border-slate-200 text-[13.5px] font-600 text-slate-600 hover:bg-slate-50 transition">Close</button>
          <button onClick={() => { onReorder(order); onClose(); }}
            className="flex-1 h-11 rounded-xl bg-cobalt text-white text-[13.5px] font-700 hover:bg-cobalt-700 transition flex items-center justify-center gap-2">
            <RefreshCw size={15} /> Reorder
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Orders Tab ────────────────────────────────────────────────────────────── */
function OrdersTab({ sessionToken, apiBase, onReorder }) {
  const [orders,  setOrders]  = React.useState(null);
  const [error,   setError]   = React.useState('');
  const [viewing, setViewing] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${apiBase}/api/orders`, {
          headers: { 'Authorization': `Bearer ${sessionToken}` },
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Failed to load orders.'); setOrders([]); return; }
        setOrders(Array.isArray(data) ? [...data].sort((a, b) => b.createdAt - a.createdAt) : []);
      } catch { setError('Network error. Please try again.'); setOrders([]); }
    })();
  }, [sessionToken, apiBase]);

  async function cancelOrder(orderId) {
    try {
      const res  = await fetch(`${apiBase}/api/orders`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
        body:    JSON.stringify({ id: orderId, status: 'cancelled' }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Failed to cancel order.' };
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      return {};
    } catch { return { error: 'Network error. Please try again.' }; }
  }

  if (orders === null) return (
    <div className="flex justify-center py-16"><span className="w-8 h-8 rounded-full border-[3px] border-cobalt/20 border-t-cobalt" style={{ animation:'spin .7s linear infinite', display:'inline-block' }}/></div>
  );

  if (error) return <p className="text-center py-10 text-sm text-red-500">{error}</p>;

  if (orders.length === 0) return (
    <div className="text-center py-16">
      <div className="grid h-16 w-16 mx-auto place-items-center rounded-2xl bg-cobalt/8 text-cobalt mb-4"><Package size={28} /></div>
      <p className="font-700 text-ink">No orders yet</p>
      <p className="text-sm text-slate-400 mt-1">Your orders will appear here once you place one.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {orders.map(order => (
        <div key={order.id} onClick={() => setViewing(order)}
          className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 px-5 py-4 hover:border-cobalt/30 hover:shadow-sm cursor-pointer transition-all">
          <div className="flex items-center gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-cobalt/8 text-cobalt">
              <Package size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-700 text-ink text-[14px]">{order.orderNumber}</span>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-[12px] text-slate-400 mt-0.5">{fmtOrderDate(order.createdAt)} · {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-800 text-ink text-[15px]">{money(order.total)}</p>
            <ChevronRight size={16} className="text-slate-300 ml-auto mt-1" />
          </div>
        </div>
      ))}
      <OrderDetailModal order={viewing} onClose={() => setViewing(null)} onReorder={onReorder} onCancel={cancelOrder} />
    </div>
  );
}

/* ─── Profile Tab ───────────────────────────────────────────────────────────── */
function ProfileTab({ customer, sessionToken, apiBase, onUpdate }) {
  const [form,    setForm]    = React.useState({ name: customer?.name || '', phone: customer?.phone || '' });
  const [saving,  setSaving]  = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error,   setError]   = React.useState('');

  React.useEffect(() => {
    setForm({ name: customer?.name || '', phone: customer?.phone || '' });
  }, [customer?.id]);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess(false);
    try {
      const res = await fetch(`${apiBase}/api/customer-auth`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
        body: JSON.stringify({ name: form.name.trim(), phone: form.phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save.'); setSaving(false); return; }
      onUpdate(data.customer);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch { setError('Network error. Please try again.'); }
    setSaving(false);
  }

  return (
    <form onSubmit={saveProfile} className="space-y-5 max-w-md">
      <div>
        <label className="block text-[13px] font-700 text-slate-700 mb-1.5">Email address</label>
        <div className="flex items-center gap-3 h-11 rounded-xl border border-slate-200 bg-slate-50 px-4">
          <Mail size={15} className="text-slate-400 shrink-0" />
          <span className="text-[13.5px] text-slate-500">{customer?.email}</span>
          <span className="ml-auto text-[11px] font-700 text-grass bg-green-50 px-2 py-0.5 rounded-full ring-1 ring-green-200">Verified</span>
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-700 text-slate-700 mb-1.5">Full name</label>
        <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Your full name"
          className="w-full h-11 rounded-xl border border-slate-200 px-4 text-[13.5px] outline-none transition focus:border-cobalt focus:ring-4 focus:ring-cobalt/10" />
      </div>
      <div>
        <label className="block text-[13px] font-700 text-slate-700 mb-1.5">Phone number</label>
        <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          placeholder="e.g. 067 101 4345"
          className="w-full h-11 rounded-xl border border-slate-200 px-4 text-[13.5px] outline-none transition focus:border-cobalt focus:ring-4 focus:ring-cobalt/10" />
      </div>
      {error   && <p className="text-[12.5px] text-red-500">{error}</p>}
      {success && <p className="flex items-center gap-1.5 text-[12.5px] text-grass font-600"><Check size={14}/> Changes saved!</p>}
      <button type="submit" disabled={saving}
        className="h-11 px-6 rounded-xl bg-cobalt text-white font-700 text-[13.5px] transition hover:bg-cobalt-700 disabled:opacity-60 flex items-center gap-2">
        {saving ? <><AccSpinner />Saving…</> : 'Save changes'}
      </button>
    </form>
  );
}

/* ─── Addresses Tab ─────────────────────────────────────────────────────────── */
function AddressesTab({ customer, sessionToken, apiBase, onUpdate }) {
  const [adding,   setAdding]   = React.useState(false);
  const [editing,  setEditing]  = React.useState(null);
  const [saving,   setSaving]   = React.useState(false);
  const [error,    setError]    = React.useState('');
  const blankAddr = { label:'Home', line:'', city:'', province:'', postalCode:'', isDefault:false };
  const [form, setForm] = React.useState(blankAddr);

  function startAdd()      { setForm(blankAddr); setEditing(null); setAdding(true); setError(''); }
  function startEdit(addr) { setForm({ ...addr }); setEditing(addr.id); setAdding(true); setError(''); }
  function cancelForm()    { setAdding(false); setEditing(null); setError(''); }

  async function submitForm(e) {
    e.preventDefault();
    if (!form.line.trim() || !form.city.trim()) { setError('Street address and city are required.'); return; }
    setSaving(true); setError('');
    try {
      const action = editing ? 'updateAddress' : 'addAddress';
      const body   = editing ? { action, addressId: editing, address: form } : { action, address: form };
      const res  = await fetch(`${apiBase}/api/customer-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save address.'); setSaving(false); return; }
      onUpdate(data.customer);
      cancelForm();
    } catch { setError('Network error. Please try again.'); }
    setSaving(false);
  }

  async function deleteAddress(addressId) {
    if (!confirm('Remove this address?')) return;
    try {
      const res  = await fetch(`${apiBase}/api/customer-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
        body: JSON.stringify({ action: 'deleteAddress', addressId }),
      });
      const data = await res.json();
      if (res.ok) onUpdate(data.customer);
    } catch {}
  }

  async function setDefault(addressId) {
    try {
      const res  = await fetch(`${apiBase}/api/customer-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
        body: JSON.stringify({ action: 'setDefaultAddress', addressId }),
      });
      const data = await res.json();
      if (res.ok) onUpdate(data.customer);
    } catch {}
  }

  const addresses = customer?.addresses || [];

  return (
    <div className="space-y-4 max-w-lg">
      {addresses.length === 0 && !adding && (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl">
          <MapPin size={28} className="mx-auto text-slate-300 mb-3" />
          <p className="font-700 text-slate-600">No saved addresses</p>
          <p className="text-sm text-slate-400 mt-1">Add your delivery address for faster checkout.</p>
        </div>
      )}

      {addresses.map(addr => (
        <div key={addr.id} className={`rounded-2xl border p-4 transition ${addr.isDefault ? 'border-cobalt/40 bg-cobalt/3' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`grid h-9 w-9 place-items-center rounded-xl ${addr.isDefault ? 'bg-cobalt/10 text-cobalt' : 'bg-slate-100 text-slate-400'}`}>
                <MapPin size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-700 text-[13.5px] text-ink">{addr.label || 'Address'}</span>
                  {addr.isDefault && <span className="text-[10.5px] font-700 text-cobalt bg-cobalt/10 px-2 py-0.5 rounded-full">Default</span>}
                </div>
                <p className="text-[12.5px] text-slate-500 mt-0.5 leading-relaxed">{addr.line}{addr.city ? `, ${addr.city}` : ''}{addr.province ? `, ${addr.province}` : ''}{addr.postalCode ? ` ${addr.postalCode}` : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!addr.isDefault && (
                <button onClick={() => setDefault(addr.id)} className="text-[11px] text-cobalt font-600 px-2 py-1 rounded-lg hover:bg-cobalt/10 transition">Set default</button>
              )}
              <button onClick={() => startEdit(addr)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:text-cobalt hover:bg-cobalt/10 transition"><Pencil size={14}/></button>
              <button onClick={() => deleteAddress(addr.id)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"><Trash size={14}/></button>
            </div>
          </div>
        </div>
      ))}

      {!adding && (
        <button onClick={startAdd}
          className="flex items-center gap-2 h-11 px-5 rounded-xl border-2 border-dashed border-cobalt/40 text-cobalt font-700 text-[13.5px] hover:bg-cobalt/5 transition w-full justify-center">
          <Plus size={18} /> Add address
        </button>
      )}

      {adding && (
        <form onSubmit={submitForm} className="rounded-2xl border border-cobalt/30 bg-cobalt/3 p-5 space-y-3">
          <h4 className="font-700 text-[14px] text-ink">{editing ? 'Edit Address' : 'New Address'}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[12px] font-700 text-slate-600 mb-1">Label</label>
              <select value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-[13px] bg-white outline-none focus:border-cobalt">
                <option>Home</option><option>Work</option><option>Other</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[12px] font-700 text-slate-600 mb-1">Street address *</label>
              <input type="text" value={form.line} onChange={e => setForm(f => ({ ...f, line: e.target.value }))}
                placeholder="12 Main Street, Unit 4" required autoFocus
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-[13px] outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/10" />
            </div>
            <div>
              <label className="block text-[12px] font-700 text-slate-600 mb-1">City *</label>
              <input type="text" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="Johannesburg" required
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-[13px] outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/10" />
            </div>
            <div>
              <label className="block text-[12px] font-700 text-slate-600 mb-1">Province</label>
              <select value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-[13px] bg-white outline-none focus:border-cobalt">
                <option value="">Select…</option>
                {['Gauteng','Western Cape','KwaZulu-Natal','Eastern Cape','Mpumalanga','Limpopo','North West','Free State','Northern Cape'].map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-700 text-slate-600 mb-1">Postal code</label>
              <input type="text" value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))}
                placeholder="2000"
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-[13px] outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/10" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} className="w-4 h-4 accent-cobalt rounded" />
              <label htmlFor="isDefault" className="text-[12.5px] text-slate-600 font-600">Set as default</label>
            </div>
          </div>
          {error && <p className="text-[12px] text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={cancelForm}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-[13px] font-600 text-slate-600 hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 h-10 rounded-xl bg-cobalt text-white text-[13px] font-700 hover:bg-cobalt-700 disabled:opacity-60 flex items-center justify-center gap-2 transition">
              {saving ? <><AccSpinner />Saving…</> : (editing ? 'Save changes' : 'Add address')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ─── Reviews Tab ───────────────────────────────────────────────────────────── */
function ReviewsTab({ customer, sessionToken, apiBase }) {
  const [orders,  setOrders]  = React.useState(null);
  const [reviews, setReviews] = React.useState(null);

  React.useEffect(() => {
    if (!sessionToken) return;
    (async () => {
      try {
        const [ordRes, revRes] = await Promise.all([
          fetch(`${apiBase}/api/orders`,  { headers: { 'Authorization': `Bearer ${sessionToken}` } }),
          fetch(`${apiBase}/api/reviews`, { headers: { 'Authorization': `Bearer ${sessionToken}` } }),
        ]);
        const ordData = ordRes.ok  ? await ordRes.json()  : [];
        const revData = revRes.ok  ? await revRes.json()  : [];
        setOrders(Array.isArray(ordData) ? ordData : []);
        setReviews(Array.isArray(revData) ? revData.filter(r => r.customerId === customer?.id || r.email === customer?.email) : []);
      } catch { setOrders([]); setReviews([]); }
    })();
  }, [sessionToken, apiBase, customer?.id]);

  /* Collect reviewable products (from completed orders) */
  const reviewableProducts = React.useMemo(() => {
    if (!orders) return [];
    const map = {};
    orders.filter(o => ['processing','shipped','delivered'].includes(o.status)).forEach(o => {
      o.items?.forEach(item => {
        if (!map[item.productId]) map[item.productId] = item;
      });
    });
    return Object.values(map);
  }, [orders]);

  const myReviewMap = React.useMemo(() => {
    const m = {};
    (reviews || []).forEach(r => { m[r.productId] = r; });
    return m;
  }, [reviews]);

  const loading = orders === null || reviews === null;

  if (loading) return (
    <div className="flex justify-center py-12">
      <span className="w-8 h-8 rounded-full border-[3px] border-cobalt/20 border-t-cobalt" style={{ animation:'spin .7s linear infinite', display:'inline-block' }}/>
    </div>
  );

  if (reviewableProducts.length === 0) return (
    <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-2xl">
      <Star size={32} className="mx-auto text-slate-300 mb-3" />
      <p className="font-700 text-slate-600">No products to review yet</p>
      <p className="text-sm text-slate-400 mt-1">Purchase and receive products to unlock reviews.</p>
    </div>
  );

  return (
    <div className="space-y-4 max-w-lg">
      {reviewableProducts.map(item => {
        const product = (window.PRODUCTS || []).find(p => p.id === item.productId);
        const myReview = myReviewMap[item.productId];
        return (
          <div key={item.productId} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              {product?.img && (
                <img src={product.img} alt={product?.name || item.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-100 bg-slate-50" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-700 text-[14px] text-ink truncate">{product?.name || item.name}</p>
                <p className="text-[12px] text-slate-400">{product?.size || ''}</p>
                {myReview && (
                  <div className="flex items-center gap-1 mt-1">
                    <Stars value={myReview.rating} size={12} />
                    <span className="text-[11px] font-600 text-slate-500 capitalize">{myReview.status}</span>
                  </div>
                )}
              </div>
            </div>
            <ProductReviews productId={item.productId} />
          </div>
        );
      })}
    </div>
  );
}

/* ─── Account Page ──────────────────────────────────────────────────────────── */
function AccountPage({ onGoHome }) {
  const { customer, sessionToken, logout, updateCustomerData, apiBase, openAuth } = useCustomer();
  const { add, setOpen: openCart } = useCart();
  const [tab, setTab] = React.useState('profile');

  if (!customer) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-cobalt/10 text-cobalt mb-5">
          <User size={36} />
        </div>
        <h2 className="font-display text-2xl font-extrabold text-ink">Sign in to your account</h2>
        <p className="mt-2 text-slate-500 text-[15px] max-w-xs">Track your orders, manage addresses, and speed up checkout.</p>
        <div className="mt-6 flex gap-3">
          <button onClick={openAuth} className="h-12 px-6 rounded-full bg-cobalt text-white font-bold hover:bg-cobalt-700 transition">Sign in</button>
          <button onClick={onGoHome} className="h-12 px-6 rounded-full border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition">Continue shopping</button>
        </div>
      </div>
    );
  }

  async function handleReorder(order) {
    if (!order.items?.length) return;
    for (const item of order.items) {
      const product = PRODUCTS.find(p => p.id === item.productId);
      if (product) add(product, item.qty);
    }
    openCart(true);
    onGoHome();
  }

  const displayName = customer.name || customer.email.split('@')[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-5">
          <button onClick={onGoHome} className="flex items-center gap-1.5 text-[13px] font-600 text-slate-500 hover:text-cobalt transition mb-5">
            <ArrowLeft size={16} /> Back to store
          </button>
          <div className="flex items-center gap-4">
            <CustomerAvatar name={displayName} size={52} />
            <div>
              <h1 className="font-display text-xl font-extrabold text-ink leading-tight">{customer.name || 'My Account'}</h1>
              <p className="text-[13px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Mail size={12} />{customer.email}
                <span className="text-grass font-600">· Verified</span>
              </p>
            </div>
            <button onClick={logout}
              className="ml-auto flex items-center gap-2 h-9 px-4 rounded-xl border border-slate-200 text-[13px] font-600 text-slate-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition">
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm w-fit mb-8">
          {[
            { id:'profile',   icon:<User size={15}/>,    label:'Profile' },
            { id:'orders',    icon:<Package size={15}/>, label:'My Orders' },
            { id:'addresses', icon:<MapPin size={15}/>,  label:'Addresses' },
            { id:'reviews',   icon:<Star size={15}/>,    label:'Reviews' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13.5px] font-600 transition-all ${tab===t.id?'bg-cobalt text-white shadow-sm':'text-slate-500 hover:bg-slate-50'}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        <div className="animate-fadein">
          {tab === 'profile' && (
            <ProfileTab customer={customer} sessionToken={sessionToken} apiBase={apiBase} onUpdate={updateCustomerData} />
          )}
          {tab === 'orders' && (
            <OrdersTab sessionToken={sessionToken} apiBase={apiBase} onReorder={handleReorder} />
          )}
          {tab === 'addresses' && (
            <AddressesTab customer={customer} sessionToken={sessionToken} apiBase={apiBase} onUpdate={updateCustomerData} />
          )}
          {tab === 'reviews' && (
            <ReviewsTab customer={customer} sessionToken={sessionToken} apiBase={apiBase} />
          )}
        </div>
      </div>
    </div>
  );
}

function AccSpinner() {
  return <span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', flexShrink:0, display:'inline-block', animation:'spin .7s linear infinite' }} />;
}

window.AccountPage = AccountPage;
