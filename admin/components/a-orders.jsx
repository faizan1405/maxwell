/* Admin Panel — Orders Management */

const ORDER_STATUSES  = ['all','pending','processing','shipped','delivered','cancelled'];
const ORDERS_PER_PAGE = 10;

const STATUS_FLOW = {
  pending:    { next:'processing', label:'Mark Processing',   icon:'Truck' },
  processing: { next:'shipped',    label:'Mark Shipped',      icon:'Truck' },
  shipped:    { next:'delivered',  label:'Mark Delivered',    icon:'Check' },
  delivered:  { next:null,         label:'Delivered',         icon:'Check' },
  cancelled:  { next:null,         label:'Cancelled',         icon:null    },
};

function OrderDetail({ order, onClose, onStatusChange, onNoteChange }) {
  const { fmtMoney, fmtDateTime } = useAdmin();
  const [noteEdit, setNoteEdit] = React.useState(false);
  const [note,     setNote]     = React.useState(order?.notes || '');

  if (!order) return null;
  const flow = STATUS_FLOW[order.status];

  function saveNote() {
    onNoteChange(order.id, note);
    setNoteEdit(false);
  }

  const payColor = order.payment.status === 'paid' ? 'text-green-600' : order.payment.status === 'refunded' ? 'text-purple-600' : 'text-amber-600';

  return (
    <Modal open={!!order} onClose={onClose} size="lg" title={`Order ${order.orderNumber}`}
      footer={
        <div className="flex items-center gap-2 w-full">
          <div className="flex-1">
            {flow?.next && (
              <Btn variant="success" onClick={() => { onStatusChange(order.id, flow.next); onClose(); }}>
                {flow.label}
              </Btn>
            )}
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <Btn variant="ghost" size="sm" className="ml-2" onClick={() => { onStatusChange(order.id,'cancelled'); onClose(); }}>
                Cancel Order
              </Btn>
            )}
          </div>
          <Btn variant="secondary" onClick={onClose}>Close</Btn>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Status + payment */}
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
          <div className="flex justify-between font-700 text-base pt-1 border-t border-slate-200"><span>Total</span><span className="text-cobalt">{fmtMoney(order.total)}</span></div>
        </div>

        {/* Notes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-600 text-slate-500 uppercase tracking-wide">Order Notes</p>
            {!noteEdit && <button onClick={()=>setNoteEdit(true)} className="text-xs text-cobalt hover:underline">Edit</button>}
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
  const { orders, updateOrderStatus, updateOrderNote, fmtMoney, fmtDate } = useAdmin();

  const [tab,     setTab]     = React.useState('all');
  const [search,  setSearch]  = React.useState('');
  const [sort,    setSort]    = React.useState('newest');
  const [page,    setPage]    = React.useState(1);
  const [viewing, setViewing] = React.useState(null);
  const [toast,   setToast]   = React.useState({ visible:false, msg:'', type:'success' });

  function showToast(msg, type='success') {
    setToast({ visible:true, msg, type });
    setTimeout(() => setToast(t=>({...t,visible:false})), 3000);
  }

  const filtered = React.useMemo(() => {
    let list = [...orders];
    if (tab !== 'all') list = list.filter(o => o.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o => o.orderNumber.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q) || o.customer.email.toLowerCase().includes(q));
    }
    list.sort((a,b) => sort==='oldest' ? a.createdAt-b.createdAt : b.createdAt-a.createdAt);
    return list;
  }, [orders, tab, search, sort]);

  const paged = filtered.slice((page-1)*ORDERS_PER_PAGE, page*ORDERS_PER_PAGE);
  React.useEffect(() => setPage(1), [tab, search, sort]);

  const tabCounts = React.useMemo(() => {
    const c = {};
    ORDER_STATUSES.forEach(s => { c[s] = s==='all' ? orders.length : orders.filter(o=>o.status===s).length; });
    return c;
  }, [orders]);

  function handleStatusChange(id, status) {
    updateOrderStatus(id, status);
    showToast(`Order status updated to ${status}`);
    // Refresh viewing order
    setViewing(v => v ? {...v, status, updatedAt:Date.now()} : null);
  }

  function handleNoteChange(id, notes) {
    updateOrderNote(id, notes);
    setViewing(v => v ? {...v, notes} : null);
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
      />
    </div>
  );
}

window.OrdersPage = OrdersPage;
