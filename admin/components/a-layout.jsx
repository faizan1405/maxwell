/* Admin Panel — Layout: Sidebar + TopBar + AdminLayout */

const NAV = [
  { id:'dashboard',  label:'Dashboard',  icon:'Dashboard',    badge:null },
  { id:'products',   label:'Products',   icon:'Box',          badge:null },
  { id:'orders',     label:'Orders',     icon:'ShoppingBag',  badge:'orders' },
  { id:'customers',  label:'Customers',  icon:'Users',        badge:null },
];

const NAV_ADMIN = [
  { id:'coupons',   label:'Coupons',        icon:'Tag',     badge:null },
  { id:'reviews',   label:'Reviews',        icon:'Star',    badge:'reviews' },
  { id:'abandoned', label:'Abandoned Carts',icon:'Cart',    badge:null },
  { id:'settings',  label:'Settings',       icon:'Settings',badge:null },
];

function Sidebar({ page, setPage, open, onClose, stats }) {
  const { session, logout, isAdmin } = useAuth();
  const { reviews } = useAdmin();
  const pendingReviews = React.useMemo(() => (reviews||[]).filter(r=>r.status==='pending').length, [reviews]);

  function navItem(item) {
    const active = page === item.id;
    const badgeCount = item.badge === 'orders' ? (stats?.byStatus?.pending||0) + (stats?.byStatus?.processing||0) : 0;
    return (
      <button key={item.id} onClick={() => { setPage(item.id); onClose?.(); }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-500 transition-all text-left group ${active ? 'bg-white/15 text-white font-600' : 'text-white/60 hover:bg-white/8 hover:text-white/90'}`}>
        <span className={`transition-colors ${active?'text-white':'text-white/50 group-hover:text-white/80'}`}>
          {Icon[item.icon]?.()}
        </span>
        <span className="flex-1">{item.label}</span>
        {badgeCount > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 bg-cobalt rounded-full text-xs font-700 text-white flex items-center justify-center">{badgeCount}</span>
        )}
      </button>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose}/>}

      <aside className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300
        w-64 bg-ink border-r border-white/8
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{boxShadow:'4px 0 24px rgba(0,0,0,0.15)'}}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cobalt flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" fill="white" fillOpacity=".15"/>
                <path d="M10 16c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M13 20c0-1.66 1.34-3 3-3s3 1.34 3 3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="16" cy="22" r="1.5" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="text-white font-700 text-sm leading-tight">Amahle Blue</div>
              <div className="text-white/40 text-xs">Admin Panel</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-white/40 hover:text-white transition-colors"><Icon.Close/></button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto sidebar-nav px-3 py-4 space-y-0.5">
          <p className="px-3 text-white/30 text-xs font-600 uppercase tracking-widest mb-2">Menu</p>
          {NAV.map(navItem)}

          {isAdmin && (
            <>
              <p className="px-3 text-white/30 text-xs font-600 uppercase tracking-widest mb-2 mt-5">Admin</p>
              {NAV_ADMIN.map(item => {
                const active = page === item.id;
                const badgeCount = item.badge === 'reviews' ? pendingReviews : 0;
                return (
                  <button key={item.id} onClick={() => { setPage(item.id); onClose?.(); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-500 transition-all text-left group ${active?'bg-white/15 text-white font-600':'text-white/60 hover:bg-white/8 hover:text-white/90'}`}>
                    <span className={`transition-colors ${active?'text-white':'text-white/50 group-hover:text-white/80'}`}>
                      {Icon[item.icon]?.()}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {badgeCount > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 bg-cobalt rounded-full text-xs font-700 text-white flex items-center justify-center">{badgeCount}</span>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/8">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <Avatar name={session?.user?.name} size={32}/>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-600 text-white truncate">{session?.user?.name}</div>
              <div className="text-xs text-white/40 truncate capitalize">{session?.role}</div>
            </div>
            <button onClick={logout} title="Sign out" className="p-1.5 text-white/40 hover:text-red-400 transition-colors rounded-lg hover:bg-white/8">
              <Icon.Logout/>
            </button>
          </div>
          <a href="index.html" target="_blank" rel="noopener"
            className="mt-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/40 hover:text-white/70 hover:bg-white/8 transition-all">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            View Storefront
          </a>
        </div>
      </aside>
    </>
  );
}

function TopBar({ page, onMenuClick, stats, setPage }) {
  const { session, logout } = useAuth();
  const [userOpen, setUserOpen] = React.useState(false);
  const alertCount = (stats?.byStatus?.pending||0) + (stats?.byStatus?.processing||0);

  const labels = { dashboard:'Dashboard', products:'Products', orders:'Orders', customers:'Customers', settings:'Settings', coupons:'Coupons', reviews:'Reviews', abandoned:'Abandoned Carts' };
  const label  = labels[page] || page;

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center gap-4 px-4 lg:px-6 sticky top-0 z-20 shadow-sm">
      {/* Hamburger */}
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
        <Icon.Menu/>
      </button>

      {/* Breadcrumb */}
      <div className="flex-1">
        <h1 className="text-base font-700 text-slate-800">{label}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Low stock alert */}
        {stats?.lowStockCount > 0 && (
          <button onClick={() => setPage('products')} title={`${stats.lowStockCount} product${stats.lowStockCount!==1?'s':''} low on stock`}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-600 hover:bg-amber-100 transition-colors border border-amber-200">
            <Icon.Warning/>
            {stats.lowStockCount} low stock
          </button>
        )}

        {/* Notifications bell */}
        <div className="relative">
          <button onClick={() => setPage('orders')} className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
            <Icon.Bell/>
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-700 rounded-full flex items-center justify-center" style={{fontSize:9}}>{alertCount}</span>
            )}
          </button>
        </div>

        {/* User menu */}
        <div className="relative">
          <button onClick={() => setUserOpen(!userOpen)} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <Avatar name={session?.user?.name} size={28}/>
            <span className="hidden sm:block text-sm font-600 text-slate-700">{session?.user?.name}</span>
            <Icon.ChevronDown/>
          </button>
          {userOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserOpen(false)}/>
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1 z-20 animate-fadein">
                <div className="px-4 py-3 border-b border-slate-50">
                  <p className="text-sm font-600 text-slate-800">{session?.user?.name}</p>
                  <p className="text-xs text-slate-400">{session?.user?.email}</p>
                </div>
                <button onClick={() => { logout(); setUserOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                  <Icon.Logout/> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function AdminLayout({ children, page, setPage, stats }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar page={page} setPage={setPage} open={sidebarOpen} onClose={() => setSidebarOpen(false)} stats={stats}/>
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar page={page} onMenuClick={() => setSidebarOpen(true)} stats={stats} setPage={setPage}/>
        <main className="flex-1 p-4 lg:p-6 animate-fadein">
          {children}
        </main>
      </div>
    </div>
  );
}

window.AdminLayout = AdminLayout;
