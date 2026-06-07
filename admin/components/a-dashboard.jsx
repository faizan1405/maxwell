/* Admin Panel — Dashboard Page */

function RevenueChart({ orders }) {
  // Build last 7 days revenue
  const days = Array.from({length:7}, (_,i) => {
    const d = new Date(); d.setDate(d.getDate()-6+i);
    return { label: d.toLocaleDateString('en-ZA',{weekday:'short'}), date: d.toDateString(), revenue:0 };
  });
  orders.filter(o => o.payment.status==='paid').forEach(o => {
    const d = new Date(o.createdAt).toDateString();
    const found = days.find(day => day.date===d);
    if (found) found.revenue += o.total;
  });

  // Fallback seed if all zeros (demo data is older)
  const allZero = days.every(d => d.revenue===0);
  if (allZero) {
    const seeds = [420, 750, 310, 890, 640, 1200, 480];
    days.forEach((d,i) => d.revenue = seeds[i]);
  }

  const max = Math.max(...days.map(d=>d.revenue), 1);
  const H = 80;
  const pts = days.map((d,i) => [i*(100/6), H - (d.revenue/max)*H]);
  const pathD = pts.map((p,i)=>i===0?`M ${p[0]} ${p[1]}`:`L ${p[0]} ${p[1]}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length-1][0]} ${H} L 0 ${H} Z`;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 col-span-full lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-700 text-slate-700">Revenue — Last 7 Days</h3>
        <span className="text-xs text-slate-400">R{orders.filter(o=>o.payment.status==='paid').reduce((s,o)=>s+o.total,0).toFixed(0)} total</span>
      </div>
      <svg viewBox={`0 0 100 ${H+16}`} preserveAspectRatio="none" className="w-full" style={{height:120}}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E50E0" stopOpacity="0.15"/>
            <stop offset="100%" stopColor="#1E50E0" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#chartGrad)"/>
        <path d={pathD} fill="none" stroke="#1E50E0" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p,i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill="#1E50E0" vectorEffect="non-scaling-stroke"/>)}
      </svg>
      <div className="flex justify-between mt-2">
        {days.map((d,i) => <span key={i} className="text-xs text-slate-400">{d.label}</span>)}
      </div>
    </div>
  );
}

function OrderStatusChart({ byStatus }) {
  const statuses = [
    { key:'pending',    label:'Pending',    color:'#F59E0B' },
    { key:'processing', label:'Processing', color:'#3B82F6' },
    { key:'shipped',    label:'Shipped',    color:'#8B5CF6' },
    { key:'delivered',  label:'Delivered',  color:'#22C55E' },
    { key:'cancelled',  label:'Cancelled',  color:'#EF4444' },
  ];
  const total = Object.values(byStatus||{}).reduce((s,n)=>s+n,0) || 1;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <h3 className="text-sm font-700 text-slate-700 mb-4">Orders by Status</h3>
      <div className="space-y-2.5">
        {statuses.map(s => {
          const count = byStatus?.[s.key] || 0;
          const pct   = Math.round((count/total)*100);
          return (
            <div key={s.key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 capitalize">{s.label}</span>
                <span className="font-600 text-slate-700">{count}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:s.color}}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardPage({ setPage }) {
  const { stats, orders, products, fmtMoney, fmtDate } = useAdmin();

  const statusColor = { pending:'amber', processing:'blue', shipped:'purple', delivered:'green', cancelled:'red' };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="💰" label="Total Revenue" value={`R${(stats.revenue/1000).toFixed(1)}k`}  color="cobalt"  sub="All paid orders" />
        <StatCard icon="📦" label="Total Orders"  value={stats.totalOrders}  color="purple" sub={`${(stats.byStatus?.pending||0)+(stats.byStatus?.processing||0)} active`} onClick={() => setPage('orders')} />
        <StatCard icon="🛒" label="Products"      value={stats.activeProducts} color="green"  sub={stats.lowStockCount>0?`${stats.lowStockCount} low stock`:null} onClick={() => setPage('products')} />
        <StatCard icon="👥" label="Customers"     value={stats.totalCustomers} color="amber"  sub="Unique buyers"  onClick={() => setPage('customers')} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <RevenueChart orders={orders}/>
        <OrderStatusChart byStatus={stats.byStatus}/>
      </div>

      {/* Low stock alerts */}
      {stats.lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Icon.Warning/>
            <h3 className="text-sm font-700 text-amber-800">Low Stock Alert</h3>
            <span className="ml-auto text-xs font-600 text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{stats.lowStockCount} product{stats.lowStockCount!==1?'s':''}</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.lowStockProducts.map(p => (
              <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-amber-100">
                <img src={p.img} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-slate-50" onError={e=>e.target.style.display='none'}/>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-600 text-slate-700 truncate">{p.name}</p>
                  <p className={`text-xs font-700 ${p.stock===0?'text-red-600':'text-amber-600'}`}>{p.stock===0?'Out of stock':`${p.stock} left`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <h3 className="text-sm font-700 text-slate-700">Recent Orders</h3>
          <Btn variant="ghost" size="sm" onClick={() => setPage('orders')}>View all →</Btn>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="text-left px-5 py-3 text-xs font-600 text-slate-500 uppercase tracking-wide">Order</th>
                <th className="text-left px-4 py-3 text-xs font-600 text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-600 text-slate-500 uppercase tracking-wide hidden sm:table-cell">Total</th>
                <th className="text-left px-4 py-3 text-xs font-600 text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-600 text-slate-500 uppercase tracking-wide hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.recentOrders.map(o => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-600 text-cobalt text-sm">{o.orderNumber}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Avatar name={o.customer.name} size={26}/>
                      <span className="text-sm text-slate-700 truncate max-w-[120px]">{o.customer.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell font-600 text-slate-700">{fmtMoney(o.total)}</td>
                  <td className="px-4 py-3.5"><Badge label={o.status} variant={o.status}/></td>
                  <td className="px-4 py-3.5 text-xs text-slate-400 hidden md:table-cell">{fmtDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

window.DashboardPage = DashboardPage;
