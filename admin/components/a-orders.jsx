/* Admin Panel — Orders Management */

const ORDER_STATUSES   = ['all','pending','confirmed','processing','shipped','delivered','cancelled'];

function printInvoice(order) {
  const items = (order.items||[]).map(item => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">${item.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right">${item.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right">R ${(item.price||0).toFixed(2)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600">R ${((item.qty||1)*(item.price||0)).toFixed(2)}</td>
    </tr>`).join('');
  const couponRow = order.couponDiscount > 0 ? `
    <tr><td colspan="3" style="padding:8px 12px;text-align:right;color:#159A4C">Coupon (${order.couponCode||''})</td>
    <td style="padding:8px 12px;text-align:right;color:#159A4C;font-weight:600">−R ${(order.couponDiscount||0).toFixed(2)}</td></tr>` : '';
  /* SA VAT — embedded in the VAT-inclusive total (R is gross). */
  const vatRate     = 0.15;
  const vatAmount   = (order.total||0) - (order.total||0) / (1 + vatRate);
  const vatNumber   = (window.__settings && window.__settings.business && window.__settings.business.vatNumber) || '';
  const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-ZA',{day:'numeric',month:'long',year:'numeric'}) : '';
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ${order.invoiceNumber||order.orderNumber}</title>
<style>body{font-family:Arial,sans-serif;color:#0B2545;margin:0;padding:24px;font-size:13px}h1{margin:0;font-size:22px;color:#1E50E0}
table{width:100%;border-collapse:collapse;margin-top:16px}th{background:#f8fafc;padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#64748b}
.hdr{display:flex;justify-content:space-between;margin-bottom:32px;border-bottom:2px solid #1E50E0;padding-bottom:20px}
@media print{button{display:none}}</style></head><body>
<div class="hdr"><div><h1>Amahle Blue</h1>
<p style="margin:4px 0;color:#64748b;font-size:12px">Unit H, 13 Main Reef Road, Dunswart, Boksburg, Gauteng, South Africa</p>
<p style="margin:2px 0;color:#64748b;font-size:12px">067 101 4345 · info@amahle-blue.co.za</p>${vatNumber?`<p style="margin:2px 0;color:#64748b;font-size:11px">VAT No: ${vatNumber}</p>`:''}</div>
<div style="text-align:right"><p style="font-size:18px;font-weight:700;margin:0">${order.invoiceNumber||order.orderNumber}</p>
<p style="color:#64748b;margin:4px 0;font-size:12px">Date: ${date}</p>
<p style="color:#64748b;margin:2px 0;font-size:12px">Order: ${order.orderNumber}</p></div></div>
<div style="display:flex;gap:32px;margin-bottom:24px">
<div><p style="font-weight:700;margin-bottom:4px">Bill To</p><p style="margin:2px 0">${order.customer?.name||''}</p>
<p style="margin:2px 0;color:#64748b">${order.customer?.email||''}</p><p style="margin:2px 0;color:#64748b">${order.customer?.phone||''}</p></div>
<div><p style="font-weight:700;margin-bottom:4px">Deliver To</p><p style="margin:2px 0;color:#64748b">${order.address||''}</p></div></div>
<table><thead><tr><th>Item</th><th style="text-align:right">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
<tbody>${items}
<tr><td colspan="3" style="padding:8px 12px;text-align:right;color:#64748b">Subtotal</td><td style="padding:8px 12px;text-align:right">R ${(order.subtotal||0).toFixed(2)}</td></tr>
<tr><td colspan="3" style="padding:8px 12px;text-align:right;color:#64748b">Delivery</td><td style="padding:8px 12px;text-align:right">${order.delivery===0?'Free':'R '+((order.delivery||0).toFixed(2))}</td></tr>
${couponRow}
<tr><td colspan="3" style="padding:8px 12px;text-align:right;color:#94a3b8;font-size:11px">VAT (15%, included in total)</td><td style="padding:8px 12px;text-align:right;color:#94a3b8;font-size:11px">R ${vatAmount.toFixed(2)}</td></tr>
<tr style="font-weight:700;font-size:15px;color:#1E50E0;border-top:2px solid #e2e8f0">
<td colspan="3" style="padding:10px 12px;text-align:right">Total (incl. VAT)</td><td style="padding:10px 12px;text-align:right">R ${(order.total||0).toFixed(2)}</td></tr>
</tbody></table>
<p style="margin-top:32px;font-size:11px;color:#94a3b8;text-align:center">Thank you for your purchase · Amahle Blue · info@amahle-blue.co.za</p>
<script>window.onload=function(){window.print();}<\/script></body></html>`;
  const w = window.open('','_blank','width=820,height=640');
  if (!w) { alert('Allow popups to download invoice.'); return; }
  w.document.open(); w.document.write(html); w.document.close();
}
const PAYMENT_STATUSES = ['pending','paid','failed','refunded'];
const ORDERS_PER_PAGE  = 10;

const STATUS_FLOW = {
  pending:    { next:'confirmed',  label:'Confirm Order',   icon:'Check'  },
  confirmed:  { next:'processing', label:'Mark Processing', icon:'Truck'  },
  processing: { next:'shipped',    label:'Mark Shipped',    icon:'Truck'  },
  shipped:    { next:'delivered',  label:'Mark Delivered',  icon:'Check'  },
  delivered:  { next:null,         label:'Delivered',       icon:'Check'  },
  cancelled:  { next:null,         label:'Cancelled',       icon:null     },
};

function OrderDetail({ order, onClose, onStatusChange, onNoteChange, onPaymentStatusChange, onTrackingChange }) {
  const { fmtMoney, fmtDateTime } = useAdmin();
  const { isAdmin } = useAuth();
  const [noteEdit,    setNoteEdit]    = React.useState(false);
  const [note,        setNote]        = React.useState(order?.notes || '');
  const [trackEdit,   setTrackEdit]   = React.useState(false);
  const [trackNum,    setTrackNum]    = React.useState(order?.trackingNumber || '');
  const [carrier,     setCarrier]     = React.useState(order?.carrier || '');

  React.useEffect(() => {
    if (order) {
      setNote(order.notes || '');
      setTrackNum(order.trackingNumber || '');
      setCarrier(order.carrier || '');
      setNoteEdit(false);
      setTrackEdit(false);
    }
  }, [order?.id]);

  if (!order) return null;
  const flow = STATUS_FLOW[order.status];

  function saveNote() { onNoteChange(order.id, note); setNoteEdit(false); }
  function saveTracking() { onTrackingChange(order.id, trackNum.trim(), carrier.trim()); setTrackEdit(false); }

  const payColor = order.payment.status === 'paid' ? 'text-green-600' : order.payment.status === 'refunded' ? 'text-purple-600' : order.payment.status === 'failed' ? 'text-red-500' : 'text-amber-600';

  return (
    <Modal open={!!order} onClose={onClose} size="lg"
      title={`${order.orderNumber}${order.invoiceNumber ? ` · ${order.invoiceNumber}` : ''}`}
      footer={
        <div className="flex items-center gap-2 w-full flex-wrap">
          <div className="flex-1 flex items-center gap-2 flex-wrap">
            {flow?.next && (
              <Btn variant="success" onClick={() => { onStatusChange(order.id, flow.next); onClose(); }}>
                {flow.label}
              </Btn>
            )}
            {isAdmin && order.status !== 'cancelled' && order.status !== 'delivered' && (
              <Btn variant="ghost" size="sm" onClick={() => { onStatusChange(order.id,'cancelled'); onClose(); }}>
                Cancel Order
              </Btn>
            )}
            <Btn variant="secondary" size="sm" onClick={() => printInvoice(order)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print Invoice
            </Btn>
          </div>
          <Btn variant="secondary" onClick={onClose}>Close</Btn>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Status + payment overview */}
        <div className="flex flex-wrap gap-3 items-center">
          <Badge label={order.status} variant={order.status}/>
          <span className={`text-sm font-600 capitalize ${payColor}`}>
            {order.payment.method} · {order.payment.status}
          </span>
          <span className="text-xs text-slate-400 ml-auto">{fmtDateTime(order.createdAt)}</span>
        </div>

        {/* Customer & delivery */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-600 text-slate-500 uppercase tracking-wide mb-2">Customer</p>
            <div className="flex items-center gap-2 mb-2">
              <Avatar name={order.customer.name} size={32}/>
              <div>
                <p className="text-sm font-600 text-slate-800">{order.customer.name}</p>
                <p className="text-xs text-slate-400">{order.customer.email}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">{order.customer.phone}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-600 text-slate-500 uppercase tracking-wide mb-2">Delivery Address</p>
            <p className="text-sm text-slate-600 leading-relaxed">{order.address}</p>
          </div>
        </div>

        {/* Items */}
        <div>
          <p className="text-xs font-600 text-slate-500 uppercase tracking-wide mb-2">Items</p>
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            {order.items.map((item,i) => (
              <div key={i} className={`flex items-center justify-between px-4 py-3 ${i>0?'border-t border-slate-50':''}`}>
                <div>
                  <p className="text-sm font-500 text-slate-700">{item.name}</p>
                  <p className="text-xs text-slate-400">Qty: {item.qty} × {fmtMoney(item.price)}</p>
                </div>
                <p className="font-600 text-slate-800">{fmtMoney(item.qty*item.price)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-1.5">
          <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-500">{fmtMoney(order.subtotal)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-500">Delivery</span><span className="font-500">{order.delivery===0?'Free':fmtMoney(order.delivery)}</span></div>
          {order.couponDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-grass">Coupon {order.couponCode ? `(${order.couponCode})` : ''}</span>
              <span className="font-500 text-grass">−{fmtMoney(order.couponDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between font-700 text-base pt-1 border-t border-slate-200"><span>Total</span><span className="text-cobalt">{fmtMoney(order.total)}</span></div>
        </div>

        {/* Payment status */}
        <div>
          <p className="text-xs font-600 text-slate-500 uppercase tracking-wide mb-2">Payment Status</p>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_STATUSES.map(ps => (
              <button key={ps} type="button"
                onClick={() => onPaymentStatusChange(order.id, ps)}
                className={`px-3 py-1.5 rounded-full text-xs font-700 border-2 capitalize transition ${
                  order.payment.status === ps
                    ? ps === 'paid'     ? 'border-green-500  bg-green-50  text-green-600'
                    : ps === 'refunded' ? 'border-purple-400 bg-purple-50 text-purple-600'
                    : ps === 'failed'   ? 'border-red-400    bg-red-50    text-red-500'
                    : 'border-amber-400 bg-amber-50 text-amber-600'
                    : 'border-slate-200 text-slate-400 hover:border-slate-300'
                }`}>
                {ps}
              </button>
            ))}
          </div>
        </div>

        {/* Tracking info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-600 text-slate-500 uppercase tracking-wide">Tracking Info</p>
            {!trackEdit && <button onClick={() => setTrackEdit(true)} className="text-xs text-cobalt hover:underline">Edit</button>}
          </div>
          {trackEdit ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-600 text-slate-500 mb-1">Tracking Number</label>
                  <input value={trackNum} onChange={e=>setTrackNum(e.target.value)}
                    placeholder="e.g. FADX123456789"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20"/>
                </div>
                <div>
                  <label className="block text-[11px] font-600 text-slate-500 mb-1">Carrier</label>
                  <input value={carrier} onChange={e=>setCarrier(e.target.value)}
                    placeholder="e.g. Courier Guy"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20"/>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Btn variant="ghost" size="sm" onClick={() => { setTrackEdit(false); setTrackNum(order.trackingNumber||''); setCarrier(order.carrier||''); }}>Cancel</Btn>
                <Btn size="sm" onClick={saveTracking}>Save</Btn>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-600 leading-relaxed min-h-[40px]">
              {order.trackingNumber ? (
                <span><span className="font-600">{order.carrier || 'Carrier'}</span> · {order.trackingNumber}</span>
              ) : (
                <span className="italic text-slate-300">No tracking info</span>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-600 text-slate-500 uppercase tracking-wide">Order Notes</p>
            {!noteEdit && <button onClick={() => setNoteEdit(true)} className="text-xs text-cobalt hover:underline">Edit</button>}
          </div>
          {noteEdit ? (
            <div className="space-y-2">
              <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20 resize-none"/>
              <div className="flex gap-2 justify-end">
                <Btn variant="ghost" size="sm" onClick={()=>{ setNoteEdit(false); setNote(order.notes||''); }}>Cancel</Btn>
                <Btn size="sm" onClick={saveNote}>Save</Btn>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-3 min-h-[40px]">
              {order.notes || <span className="italic text-slate-300">No notes</span>}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

function OrdersPage() {
  const { orders, updateOrderStatus, updateOrderNote, updatePaymentStatus, updateTracking, fmtMoney, fmtDate } = useAdmin();

  const [tab,        setTab]       = React.useState('all');
  const [payTab,     setPayTab]    = React.useState('all');
  const [search,     setSearch]    = React.useState('');
  const [sort,       setSort]      = React.useState('newest');
  const [page,       setPage]      = React.useState(1);
  const [viewing,    setViewing]   = React.useState(null);
  const [toast,      setToast]     = React.useState({ visible:false, msg:'', type:'success' });

  function showToast(msg, type='success') {
    setToast({ visible:true, msg, type });
    setTimeout(() => setToast(t=>({...t,visible:false})), 3000);
  }

  const filtered = React.useMemo(() => {
    let list = [...orders];
    if (tab !== 'all') list = list.filter(o => o.status === tab);
    if (payTab !== 'all') list = list.filter(o => o.payment.status === payTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.email.toLowerCase().includes(q)
      );
    }
    list.sort((a,b) => sort==='oldest' ? a.createdAt-b.createdAt : b.createdAt-a.createdAt);
    return list;
  }, [orders, tab, payTab, search, sort]);

  const paged = filtered.slice((page-1)*ORDERS_PER_PAGE, page*ORDERS_PER_PAGE);
  React.useEffect(() => setPage(1), [tab, payTab, search, sort]);

  const tabCounts = React.useMemo(() => {
    const c = {};
    ORDER_STATUSES.forEach(s => { c[s] = s==='all' ? orders.length : orders.filter(o=>o.status===s).length; });
    return c;
  }, [orders]);

  function handleStatusChange(id, status) {
    updateOrderStatus(id, status);
    showToast(`Order status updated to ${status}`);
    setViewing(v => v ? {...v, status, updatedAt:Date.now()} : null);
  }

  function handleNoteChange(id, notes) {
    updateOrderNote(id, notes);
    setViewing(v => v ? {...v, notes} : null);
  }

  function handlePaymentStatusChange(id, paymentStatus) {
    updatePaymentStatus(id, paymentStatus);
    showToast(`Payment status updated to ${paymentStatus}`);
    setViewing(v => v ? {...v, payment:{...v.payment, status:paymentStatus}} : null);
  }

  function handleTrackingChange(id, trackingNumber, carrier) {
    updateTracking(id, trackingNumber, carrier);
    showToast('Tracking info saved');
    setViewing(v => v ? {...v, trackingNumber, carrier} : null);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <AdminToast message={toast.msg} type={toast.type} visible={toast.visible}/>

      {/* Header */}
      <div>
        <h2 className="text-xl font-800 text-slate-800">Orders</h2>
        <p className="text-sm text-slate-400 mt-0.5">{orders.length} total orders</p>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm">
        {ORDER_STATUSES.map(s => (
          <button key={s} onClick={()=>setTab(s)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-500 transition-all capitalize ${tab===s?'bg-cobalt text-white shadow-sm':'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
            {s==='all'?'All Orders':s}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-700 ${tab===s?'bg-white/20 text-white':'bg-slate-100 text-slate-500'}`}>{tabCounts[s]}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by order # or customer…"/>
        <select value={payTab} onChange={e=>setPayTab(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-cobalt bg-white capitalize">
          <option value="all">All payments</option>
          {PAYMENT_STATUSES.map(ps => <option key={ps} value={ps}>{ps}</option>)}
        </select>
        <select value={sort} onChange={e=>setSort(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-cobalt bg-white">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <Empty icon="📦" title="No orders found" description="Try adjusting your search or filter."/>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Order</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Customer</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide hidden sm:table-cell">Items</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Total</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide hidden md:table-cell">Payment</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                    <th className="px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paged.map(o => {
                    const flow = STATUS_FLOW[o.status];
                    return (
                      <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-700 text-cobalt text-sm">{o.orderNumber}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <Avatar name={o.customer.name} size={28}/>
                            <div className="min-w-0">
                              <p className="font-500 text-slate-700 truncate max-w-[120px]">{o.customer.name}</p>
                              <p className="text-xs text-slate-400 truncate max-w-[120px]">{o.customer.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-slate-500">{o.items.length} item{o.items.length!==1?'s':''}</td>
                        <td className="px-4 py-3.5 font-700 text-slate-800">{fmtMoney(o.total)}</td>
                        <td className="px-4 py-3.5 hidden md:table-cell"><Badge label={o.payment.status} variant={o.payment.status}/></td>
                        <td className="px-4 py-3.5"><Badge label={o.status} variant={o.status}/></td>
                        <td className="px-4 py-3.5 text-xs text-slate-400 hidden lg:table-cell">{fmtDate(o.createdAt)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button onClick={()=>setViewing(o)} title="View details"
                              className="p-1.5 text-slate-400 hover:text-cobalt hover:bg-cobalt/10 rounded-lg transition-colors"><Icon.Eye/></button>
                            {flow?.next && (
                              <button onClick={()=>{ handleStatusChange(o.id, flow.next); }}
                                title={flow.label}
                                className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                {Icon[flow.icon]?.() || null}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 pb-4 pt-1">
              <Pagination page={page} total={filtered.length} pageSize={ORDERS_PER_PAGE} onChange={setPage}/>
            </div>
          </>
        )}
      </div>

      <OrderDetail
        order={viewing}
        onClose={() => setViewing(null)}
        onStatusChange={handleStatusChange}
        onNoteChange={handleNoteChange}
        onPaymentStatusChange={handlePaymentStatusChange}
        onTrackingChange={handleTrackingChange}
      />
    </div>
  );
}

window.OrdersPage = OrdersPage;
