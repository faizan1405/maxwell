/* Admin Panel — Customers Management */

const CUST_PER_PAGE = 10;

function CustomerDetail({ customer, onClose }) {
  const { fmtMoney, fmtDate } = useAdmin();
  const [tab, setTab] = React.useState('orders');
  if (!customer) return null;

  return (
    <Modal open={!!customer} onClose={onClose} size="lg" title={
      <div className="flex items-center gap-3">
        <Avatar name={customer.name} size={36}/>
        <div>
          <p className="font-700 text-slate-800">{customer.name}</p>
          <p className="text-xs text-slate-400">{customer.email}</p>
        </div>
        {customer.hasAccount && (
          <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-700 bg-cobalt/10 text-cobalt">
            ✓ Account
          </span>
        )}
      </div>
    }
    footer={<Btn variant="secondary" onClick={onClose}>Close</Btn>}>
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-cobalt/5 rounded-xl px-4 py-3 text-center">
            <div className="text-xl font-800 text-cobalt">{customer.orderCount}</div>
            <div className="text-xs text-slate-500 mt-0.5">Orders</div>
          </div>
          <div className="bg-green-50 rounded-xl px-4 py-3 text-center">
            <div className="text-xl font-800 text-green-600">{fmtMoney(customer.totalSpent)}</div>
            <div className="text-xs text-slate-500 mt-0.5">Total Spent</div>
          </div>
          <div className="bg-slate-50 rounded-xl px-4 py-3 text-center">
            <div className="text-xl font-800 text-slate-700">
              {customer.orderCount > 0 && customer.totalSpent > 0
                ? fmtMoney(customer.totalSpent / customer.orders.filter(o=>o.payment?.status==='paid').length || 1)
                : 'R0.00'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Avg. Order</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-50 rounded-xl p-1 w-fit">
          {[
            { id:'orders',    label:'Orders' },
            { id:'contact',   label:'Contact' },
            { id:'addresses', label:'Addresses', hidden: !customer.hasAccount },
          ].filter(t => !t.hidden).map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-600 transition-all ${tab===t.id?'bg-white text-slate-800 shadow-sm':'text-slate-500 hover:text-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Contact tab */}
        {tab === 'contact' && (
          <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">✉</span>
              <a href={`mailto:${customer.email}`} className="text-cobalt hover:underline">{customer.email}</a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">📞</span>
              <span className="text-slate-700">{customer.phone || '—'}</span>
            </div>
            {customer.orders?.[0]?.address && (
              <div className="flex items-start gap-2 text-sm">
                <span className="text-slate-400 mt-0.5">📍</span>
                <span className="text-slate-600">{customer.orders[0].address}</span>
              </div>
            )}
            {customer.hasAccount && (
              <div className="flex items-center gap-2 text-sm border-t border-slate-200 pt-2.5 mt-2.5">
                <span className="text-slate-400">🗓</span>
                <span className="text-slate-500">Account registered {fmtDate(customer.accountSince)}</span>
              </div>
            )}
          </div>
        )}

        {/* Addresses tab */}
        {tab === 'addresses' && (
          <div className="space-y-2">
            {!customer.savedAddresses?.length ? (
              <p className="text-sm text-slate-400 text-center py-4">No saved addresses</p>
            ) : customer.savedAddresses.map((addr, i) => (
              <div key={addr.id || i} className={`rounded-xl px-4 py-3 border ${addr.isDefault ? 'border-cobalt/30 bg-cobalt/3' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-700 text-slate-700">{addr.label || 'Address'}</span>
                  {addr.isDefault && <span className="text-[10px] font-700 text-cobalt bg-cobalt/10 px-1.5 py-0.5 rounded-full">Default</span>}
                </div>
                <p className="text-xs text-slate-500">{[addr.line, addr.city, addr.province, addr.postalCode].filter(Boolean).join(', ')}</p>
              </div>
            ))}
          </div>
        )}

        {/* Orders tab */}
        {tab === 'orders' && (
          <div>
            {customer.orders.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-2">
                {[...customer.orders].sort((a,b)=>b.createdAt-a.createdAt).map(o => (
                  <div key={o.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-700 text-cobalt">{o.orderNumber}</span>
                        <Badge label={o.status} variant={o.status}/>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{o.items?.length} item{o.items?.length!==1?'s':''} · {fmtDate(o.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-700 text-slate-800">{fmtMoney(o.total)}</p>
                      <p className={`text-xs font-500 ${o.payment?.status==='paid'?'text-green-600':'text-amber-600'}`}>{o.payment?.method}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function CustomersPage() {
  const { customers, fmtMoney, fmtDate, registeredCustomers } = useAdmin();

  const [search,  setSearch]  = React.useState('');
  const [sort,    setSort]    = React.useState('spent_desc');
  const [filter,  setFilter]  = React.useState('all'); // 'all' | 'account' | 'guest'
  const [page,    setPage]    = React.useState(1);
  const [viewing, setViewing] = React.useState(null);

  const filtered = React.useMemo(() => {
    let list = [...customers];

    if (filter === 'account') list = list.filter(c => c.hasAccount);
    if (filter === 'guest')   list = list.filter(c => !c.hasAccount);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        (c.name||'').toLowerCase().includes(q) ||
        (c.email||'').toLowerCase().includes(q) ||
        (c.phone||'').includes(q)
      );
    }
    list.sort((a,b) => {
      if (sort==='name')        return (a.name||'').localeCompare(b.name||'');
      if (sort==='spent_asc')   return a.totalSpent - b.totalSpent;
      if (sort==='spent_desc')  return b.totalSpent - a.totalSpent;
      if (sort==='orders_desc') return b.orderCount - a.orderCount;
      if (sort==='recent')      return b.lastOrderAt - a.lastOrderAt;
      return 0;
    });
    return list;
  }, [customers, search, sort, filter]);

  const paged = filtered.slice((page-1)*CUST_PER_PAGE, page*CUST_PER_PAGE);
  React.useEffect(() => setPage(1), [search, sort, filter]);

  const totalRevenue  = customers.reduce((s,c) => s+c.totalSpent, 0);
  const avgSpend      = customers.length ? totalRevenue / customers.length : 0;
  const accountCount  = customers.filter(c => c.hasAccount).length;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-800 text-slate-800">Customers</h2>
        <p className="text-sm text-slate-400 mt-0.5">{customers.length} customers · {accountCount} registered accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon="👥" label="Total Customers"     value={customers.length}      color="cobalt"/>
        <StatCard icon="🔑" label="Registered Accounts" value={accountCount}          color="cobalt"/>
        <StatCard icon="💰" label="Total Revenue"       value={`R${(totalRevenue/1000).toFixed(1)}k`} color="green"/>
        <StatCard icon="🧾" label="Avg. Order Value"    value={fmtMoney(avgSpend)}   color="amber"/>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search customers…"/>
        {/* Account filter */}
        <div className="flex gap-1 bg-slate-50 rounded-xl p-1">
          {[['all','All'],['account','Has Account'],['guest','Guest']].map(([v,l]) => (
            <button key={v} onClick={()=>setFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-600 transition-all ${filter===v?'bg-white text-slate-800 shadow-sm':'text-slate-500 hover:text-slate-700'}`}>
              {l}
            </button>
          ))}
        </div>
        <select value={sort} onChange={e=>setSort(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-cobalt bg-white">
          <option value="spent_desc">Highest spend</option>
          <option value="spent_asc">Lowest spend</option>
          <option value="orders_desc">Most orders</option>
          <option value="recent">Most recent</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <Empty icon="👥" title="No customers found" description="No customers match your search."/>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Customer</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide hidden sm:table-cell">Phone</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Orders</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Total Spent</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide hidden md:table-cell">Last Order</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide hidden lg:table-cell">Account</th>
                    <th className="px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paged.map(c => (
                    <tr key={c.accountId || c.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={()=>setViewing(c)}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={c.name} size={34}/>
                          <div>
                            <p className="font-600 text-slate-800">{c.name || '—'}</p>
                            <p className="text-xs text-slate-400">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 hidden sm:table-cell">{c.phone || '—'}</td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-cobalt/10 text-cobalt text-xs font-700">{c.orderCount}</span>
                      </td>
                      <td className="px-4 py-3.5 font-700 text-slate-800">{fmtMoney(c.totalSpent)}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-400 hidden md:table-cell">{c.lastOrderAt ? fmtDate(c.lastOrderAt) : '—'}</td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        {c.hasAccount ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-700 bg-cobalt/10 text-cobalt">✓ Account</span>
                        ) : (
                          <span className="text-xs text-slate-400">Guest</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5" onClick={e=>e.stopPropagation()}>
                        <button onClick={()=>setViewing(c)} className="p-1.5 text-slate-400 hover:text-cobalt hover:bg-cobalt/10 rounded-lg transition-colors"><Icon.Eye/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 pb-4 pt-1">
              <Pagination page={page} total={filtered.length} pageSize={CUST_PER_PAGE} onChange={setPage}/>
            </div>
          </>
        )}
      </div>

      <CustomerDetail customer={viewing} onClose={()=>setViewing(null)}/>
    </div>
  );
}

window.CustomersPage = CustomersPage;
