/* Admin Panel — Reports & Analytics Page */

function ReportsPage() {
  const { orders, products, stats, fmtMoney } = useAdmin();
  const [range, setRange] = React.useState('30d'); // today, 7d, 30d, all, custom
  const [customStart, setCustomStart] = React.useState('');
  const [customEnd, setCustomEnd] = React.useState('');

  // ── Date Filtering ────────────────────────────────────────────────────────
  const filteredOrders = React.useMemo(() => {
    const now = new Date();
    let start = new Date(0);
    let end = new Date();
    
    if (range === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === '7d') {
      start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0,0,0,0);
    } else if (range === '30d') {
      start = new Date(now);
      start.setDate(now.getDate() - 29);
      start.setHours(0,0,0,0);
    } else if (range === 'custom') {
      start = customStart ? new Date(customStart) : new Date(0);
      end = customEnd ? new Date(customEnd) : new Date();
      if (customEnd) end.setHours(23, 59, 59, 999);
    }

    return (orders || []).filter(o => {
      const d = new Date(o.createdAt);
      return d >= start && d <= end;
    });
  }, [orders, range, customStart, customEnd]);

  // ── Aggregation ───────────────────────────────────────────────────────────
  const {
    totalSales,
    totalOrders,
    pendingOrders,
    codSales,
    eftSales,
    codCount,
    eftCount,
    productSales,
    salesByDay
  } = React.useMemo(() => {
    let ts = 0, to = 0, po = 0, cs = 0, es = 0, cc = 0, ec = 0;
    const pSales = {}; // { productId: { units: 0, revenue: 0, name: '' } }
    const sDay = {};   // { 'YYYY-MM-DD': revenue }

    filteredOrders.forEach(o => {
      const isCancelled = o.status === 'cancelled';
      
      // We still might want to count pending orders in total orders, but maybe not in total sales if they are not paid?
      // Wait, standard practice: if it's not cancelled, it's counted as an order.
      // The prompt said: "Verify that cancelled orders are not counted as completed sales."
      
      if (o.status === 'pending') po++;

      if (!isCancelled) {
        to++;
        ts += o.total;

        if (o.payment?.method === 'cod') {
          cs += o.total;
          cc++;
        } else {
          es += o.total;
          ec++;
        }

        const dateKey = new Date(o.createdAt).toISOString().split('T')[0];
        sDay[dateKey] = (sDay[dateKey] || 0) + o.total;

        (o.items || []).forEach(item => {
          if (!pSales[item.id]) pSales[item.id] = { units: 0, revenue: 0, name: item.name };
          pSales[item.id].units += item.qty;
          pSales[item.id].revenue += (item.price * item.qty);
        });
      }
    });

    const bestSelling = Object.values(pSales).sort((a,b) => b.units - a.units).slice(0, 10);
    
    // Sort sales by day for the chart
    const salesByDayArr = Object.entries(sDay).map(([date, revenue]) => ({ date, revenue })).sort((a,b) => a.date.localeCompare(b.date));

    return { totalSales: ts, totalOrders: to, pendingOrders: po, codSales: cs, eftSales: es, codCount: cc, eftCount: ec, productSales: bestSelling, salesByDay: salesByDayArr };
  }, [filteredOrders]);

  // ── Exports ───────────────────────────────────────────────────────────────
  const downloadCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportOrders = () => {
    const headers = ["Order Number", "Date", "Customer", "Email", "Total", "Payment Method", "Status"];
    const rows = filteredOrders.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleString(),
      `"${o.customer?.name || ''}"`,
      `"${o.customer?.email || ''}"`,
      o.total,
      o.payment?.method === 'cod' ? 'COD' : 'EFT',
      o.status
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    downloadCSV(csv, `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportSales = () => {
    const headers = ["Product Name", "Units Sold", "Revenue"];
    const rows = productSales.map(p => [
      `"${p.name}"`,
      p.units,
      p.revenue
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    downloadCSV(csv, `product_sales_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <select value={range} onChange={(e) => setRange(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-600 text-slate-700 bg-slate-50 outline-none focus:border-cobalt">
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
            <option value="custom">Custom Range</option>
          </select>
          {range === 'custom' && (
            <div className="flex items-center gap-2">
              <input type="date" value={customStart} onChange={e=>setCustomStart(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"/>
              <span className="text-slate-400">to</span>
              <input type="date" value={customEnd} onChange={e=>setCustomEnd(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"/>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Btn variant="outline" size="sm" onClick={exportOrders}><Icon.Download /> Orders CSV</Btn>
          <Btn variant="outline" size="sm" onClick={exportSales}><Icon.Download /> Sales CSV</Btn>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="💰" label="Total Sales" value={fmtMoney(totalSales)} color="cobalt" sub="Excludes cancelled" />
        <StatCard icon="📦" label="Valid Orders" value={totalOrders} color="green" sub="Excludes cancelled" />
        <StatCard icon="⏳" label="Pending Orders" value={pendingOrders} color="amber" sub="Awaiting processing" />
        <StatCard icon="💳" label="COD vs EFT" value={codCount > eftCount ? 'COD Preferred' : (eftCount > codCount ? 'EFT Preferred' : 'Balanced')} color="purple" sub={`${codCount} COD, ${eftCount} EFT`} />
      </div>

      {/* Charts & Split Views */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Payment Methods Split */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-700 text-slate-700 mb-5">Revenue by Payment Method</h3>
          <div className="flex items-center gap-6 mb-4">
            <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs font-600 text-slate-500 uppercase tracking-wide">Cash on Delivery</p>
              <p className="text-2xl font-800 text-cobalt mt-1">{fmtMoney(codSales)}</p>
              <p className="text-sm font-500 text-slate-500 mt-1">{codCount} orders</p>
            </div>
            <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-xs font-600 text-slate-500 uppercase tracking-wide">EFT / Transfer</p>
              <p className="text-2xl font-800 text-purple-600 mt-1">{fmtMoney(eftSales)}</p>
              <p className="text-sm font-500 text-slate-500 mt-1">{eftCount} orders</p>
            </div>
          </div>
          {/* Simple progress bar representation */}
          <div className="h-4 rounded-full flex overflow-hidden bg-slate-100">
            <div style={{ width: `${totalSales > 0 ? (codSales/totalSales)*100 : 50}%` }} className="bg-cobalt h-full transition-all"/>
            <div style={{ width: `${totalSales > 0 ? (eftSales/totalSales)*100 : 50}%` }} className="bg-purple-600 h-full transition-all"/>
          </div>
          <div className="flex justify-between text-xs font-600 text-slate-400 mt-2">
            <span>{totalSales > 0 ? Math.round((codSales/totalSales)*100) : 0}% COD</span>
            <span>{totalSales > 0 ? Math.round((eftSales/totalSales)*100) : 0}% EFT</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-700 text-slate-700">Low Stock Products</h3>
            <span className="text-xs font-700 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{stats.lowStockCount} items</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[220px] space-y-3 pr-2">
            {stats.lowStockProducts.length === 0 ? (
              <p className="text-sm text-slate-400">Inventory levels are healthy.</p>
            ) : (
              stats.lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-amber-100 bg-amber-50/30">
                  <div className="flex items-center gap-3">
                    <img src={p.img} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100"/>
                    <p className="text-sm font-600 text-slate-700">{p.name}</p>
                  </div>
                  <span className={`text-sm font-800 ${p.stock === 0 ? 'text-red-500' : 'text-amber-600'}`}>{p.stock} left</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Best Selling Products */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-sm font-700 text-slate-700 mb-5">Best-Selling Products (in range)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-4 py-3 text-xs font-600 text-slate-500 uppercase">Product</th>
                <th className="text-right px-4 py-3 text-xs font-600 text-slate-500 uppercase">Units Sold</th>
                <th className="text-right px-4 py-3 text-xs font-600 text-slate-500 uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {productSales.length === 0 ? (
                <tr><td colSpan="3" className="px-4 py-6 text-center text-slate-400">No sales data in this range.</td></tr>
              ) : (
                productSales.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/30">
                    <td className="px-4 py-3.5 font-600 text-slate-700">{p.name}</td>
                    <td className="px-4 py-3.5 text-right font-600 text-cobalt">{p.units}</td>
                    <td className="px-4 py-3.5 text-right font-600 text-slate-700">{fmtMoney(p.revenue)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

window.ReportsPage = ReportsPage;
