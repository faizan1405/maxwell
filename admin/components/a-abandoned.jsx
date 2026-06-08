/* Admin Panel — Abandoned Carts */

const ABANDONED_PAGE_SIZE = 15;

function AbandonedPage() {
  const { abandonedCarts, fmtMoney, fmtDateTime } = useAdmin();
  const [search,    setSearch]    = React.useState('');
  const [page,      setPage]      = React.useState(1);
  const [expanded,  setExpanded]  = React.useState(null);

  const carts = abandonedCarts || [];

  const filtered = React.useMemo(() => {
    if (!search.trim()) return carts;
    const q = search.toLowerCase();
    return carts.filter(c =>
      (c.email||'').toLowerCase().includes(q) ||
      (c.guestId||'').toLowerCase().includes(q)
    );
  }, [carts, search]);

  const paged = filtered.slice((page-1)*ABANDONED_PAGE_SIZE, page*ABANDONED_PAGE_SIZE);
  React.useEffect(() => setPage(1), [search]);

  const totalValue = carts.reduce((s, c) =>
    s + (c.items||[]).reduce((sv, i) => sv + (i.price||0)*(i.qty||1), 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-800 text-slate-800">Abandoned Carts</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          {carts.length} cart{carts.length!==1?'s':''} · {fmtMoney(totalValue)} potential revenue
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard icon="🛒" label="Abandoned Carts" value={carts.length} color="amber"/>
        <StatCard icon="💸" label="Potential Revenue" value={fmtMoney(totalValue)} color="cobalt"/>
        <StatCard icon="👤" label="With Email" value={carts.filter(c=>c.email).length} color="green" className="hidden sm:block"/>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-50">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by email or guest ID…"/>
        </div>

        {filtered.length === 0 ? (
          <Empty icon="🛒" title="No abandoned carts"
            description={search ? 'No carts match your search.' : 'All carts have been converted or are still active.'}/>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="text-left px-4 py-3 text-xs font-600 text-slate-400 uppercase tracking-wide">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-600 text-slate-400 uppercase tracking-wide hidden sm:table-cell">Items</th>
                    <th className="text-left px-4 py-3 text-xs font-600 text-slate-400 uppercase tracking-wide hidden md:table-cell">Value</th>
                    <th className="text-left px-4 py-3 text-xs font-600 text-slate-400 uppercase tracking-wide hidden lg:table-cell">Last Seen</th>
                    <th className="px-4 py-3"/>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paged.map(cart => {
                    const cartKey    = cart.guestId || cart.email || cart.id || Math.random();
                    const cartValue  = (cart.items||[]).reduce((s,i)=>s+(i.price||0)*(i.qty||1),0);
                    const itemCount  = (cart.items||[]).reduce((s,i)=>s+(i.qty||1),0);
                    const isExpanded = expanded === cartKey;

                    return (
                      <React.Fragment key={cartKey}>
                        <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                          onClick={() => setExpanded(isExpanded ? null : cartKey)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Avatar name={cart.email||cart.guestId||'?'} size={28}/>
                              <div className="min-w-0">
                                <p className="text-sm font-600 text-slate-700 truncate max-w-[180px]">
                                  {cart.email || <span className="text-slate-400 italic">Guest</span>}
                                </p>
                                <p className="text-xs text-slate-400 truncate max-w-[180px]">{cart.guestId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                            {itemCount} item{itemCount!==1?'s':''}
                          </td>
                          <td className="px-4 py-3 font-600 text-slate-700 hidden md:table-cell">
                            {fmtMoney(cartValue)}
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">
                            {fmtDateTime(cart.updatedAt)}
                          </td>
                          <td className="px-4 py-3">
                            <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded?'rotate-180':''}`}
                              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="6 9 12 15 18 9"/>
                            </svg>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={5} className="px-4 pb-4 pt-0">
                              <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                                <p className="text-xs font-600 text-slate-500 uppercase tracking-wide mb-2">Cart Items</p>
                                {(cart.items||[]).map((item, i) => (
                                  <div key={i} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                      {item.img && <img src={item.img} alt="" className="w-8 h-8 rounded-lg object-cover bg-slate-100" onError={e=>e.target.style.display='none'}/>}
                                      <span className="text-slate-600">{item.name||item.id}</span>
                                      <span className="text-slate-400">× {item.qty||1}</span>
                                    </div>
                                    <span className="font-600 text-slate-700">{fmtMoney((item.price||0)*(item.qty||1))}</span>
                                  </div>
                                ))}
                                {cart.email && (
                                  <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                                    <a href={`mailto:${cart.email}?subject=Your cart at Amahle Blue&body=Hi! You left some items in your cart. Come back and complete your purchase.`}
                                      className="text-xs text-cobalt hover:underline font-600 flex items-center gap-1">
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                      Email customer
                                    </a>
                                    <span className="text-xs text-slate-400">{fmtDateTime(cart.updatedAt)}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-4">
              <Pagination page={page} total={filtered.length} pageSize={ABANDONED_PAGE_SIZE} onChange={setPage}/>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

window.AbandonedPage = AbandonedPage;
