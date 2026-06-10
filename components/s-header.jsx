/* Amahle Blue Store — Wordmark, Announcement bar, Header, Cart drawer, Toast */

const Wordmark = ({ className = "", light = false, compact = false, onClick }) => (
  <a href="#home" onClick={onClick || ((e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('ab:go-page', { detail: 'home' })); })} className={`flex items-center ${className}`} aria-label="Amahle Blue home">
    <img
      src="assets/amahle-blue-logo.jpg"
      alt="Amahle Blue"
      style={{
        height: compact ? 36 : 48,
        width: 'auto',
        objectFit: 'contain',
        ...(light && { background: 'rgba(255,255,255,0.92)', borderRadius: 8, padding: '4px 10px' }),
      }}
    />
  </a>
);

const ANNOUNCEMENTS = [
  { icon: Truck, text: "Free delivery in Gauteng on orders over R750" },
  { icon: Award, text: "Proudly manufactured in South Africa 🇿🇦" },
  { icon: Tag, text: "Bulk & trade pricing available — ask about wholesale" },
];

const AnnouncementBar = () => {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % ANNOUNCEMENTS.length), 4000);
    return () => clearInterval(t);
  }, []);
  const A = ANNOUNCEMENTS[i];
  return (
    <div className="bg-ink text-white">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 sm:px-6">
        <div className="hidden flex-1 items-center gap-2 text-[12px] text-slate-300 sm:flex">
          <Phone size={13} /> <a href={`tel:${BRAND.phoneRaw}`} className="hover:text-white">{BRAND.phone}</a>
        </div>
        <div className="flex h-9 flex-1 items-center justify-center gap-2 overflow-hidden text-center text-[12.5px] font-medium">
          <A.icon size={14} className="shrink-0 text-sky-300" />
          <span key={i} className="truncate" style={{ animation: "abfade .5s ease" }}>{A.text}</span>
        </div>
        <div className="hidden flex-1 items-center justify-end gap-3 text-slate-300 sm:flex">
          <button onClick={() => { window.dispatchEvent(new CustomEvent('ab:account-tab', { detail: 'orders' })); window.dispatchEvent(new CustomEvent('ab:go-page', { detail: 'account' })); }} className="text-[12px] hover:text-white">My Orders</button>
          <span className="text-slate-600">|</span>
          <a href="#contact" className="text-[12px] hover:text-white">Help</a>
        </div>
      </div>
    </div>
  );
};

const NAV = [
  { label: "Home", href: "#home", page: "home" },
  { label: "Shop", href: "#shop", page: "shop" },
  { label: "Household", href: "#shop", cat: "household", page: "shop" },
  { label: "Car Care", href: "#shop", cat: "car", page: "shop" },
  { label: "Sanitisers", href: "#shop", cat: "sanitiser", page: "shop" },
  { label: "About", href: "#about", page: "home" },
  { label: "Contact", href: "#contact", page: "home" },
];

/* ── Account menu (logged-in dropdown) ──────────────────────────────────────── */
function AccountMenu({ customer, onAccount, onOrders, onLogout }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayName = customer?.name || customer?.email?.split('@')[0] || 'Account';

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className="hidden sm:flex items-center gap-2 h-10 px-3 rounded-full border border-slate-200 hover:border-cobalt/40 hover:bg-cobalt/5 transition text-[13px] font-semibold text-ink">
        <User size={16} className="text-cobalt" />
        <span className="max-w-[100px] truncate">{displayName}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[200px] bg-white rounded-2xl border border-slate-100 shadow-xl py-1.5 z-50" style={{ animation: 'abmodal .22s cubic-bezier(.16,1,.3,1)' }}>
          <div className="px-4 py-2.5 border-b border-slate-100">
            <p className="text-[12px] font-700 text-slate-700 truncate">{customer?.email}</p>
          </div>
          <button onClick={() => { setOpen(false); onAccount(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-600 text-slate-700 hover:bg-slate-50 transition text-left">
            <User size={15} className="text-slate-400" /> My Profile
          </button>
          <button onClick={() => { setOpen(false); onOrders(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-600 text-slate-700 hover:bg-slate-50 transition text-left">
            <Package size={15} className="text-slate-400" /> My Orders
          </button>
          <div className="border-t border-slate-100 mt-1 pt-1">
            <button onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-600 text-red-500 hover:bg-red-50 transition text-left">
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const Header = ({ onNavCat }) => {
  const { count, setOpen } = useCart();
  const { customer, isLoggedIn, openAuth, logout, setPage } = useCustomer();
  const [scrolled, setScrolled] = React.useState(false);
  const [menu,     setMenu]     = React.useState(false);
  const [q,        setQ]        = React.useState("");

  React.useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  React.useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menu]);

  const go = (e, item) => {
    e.preventDefault();
    setMenu(false);
    
    if (item.page && item.page !== page) {
      setPage(item.page);
    }
    
    if (item.cat && onNavCat) {
      onNavCat(item.cat);
    } else if (item.href.startsWith("#") && item.href.length > 1) {
      setTimeout(() => {
        const el = document.getElementById(item.href.substring(1));
        if (el) {
          window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: "smooth" });
        } else {
          window.scrollTo(0, 0);
        }
      }, 50);
    } else {
      window.scrollTo(0, 0);
    }
  };

  const goAccount = () => { setPage('account'); setMenu(false); window.scrollTo(0, 0); };
  const goOrders  = () => {
    window.dispatchEvent(new CustomEvent('ab:account-tab', { detail: 'orders' }));
    setPage('account');
    setMenu(false);
    window.scrollTo(0, 0);
  };

  return (
    <div id="top" className="sticky top-0 z-40">
      <AnnouncementBar />
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all duration-300"
        style={{ boxShadow: scrolled ? "0 8px 30px -18px rgba(11,46,107,0.35)" : "none" }}>
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 sm:px-6 transition-[padding] duration-300"
          style={{ paddingTop: scrolled ? '10px' : '14px', paddingBottom: scrolled ? '10px' : '14px' }}>
          <button onClick={() => setMenu(true)} className="grid h-10 w-10 place-items-center rounded-xl text-ink hover:bg-slate-100 lg:hidden" aria-label="Open menu">
            <Menu size={22} />
          </button>
          <Wordmark onClick={(e) => { e.preventDefault(); setPage('home'); window.scrollTo(0, 0); }} className="shrink-0" />

          {/* search */}
          <form onSubmit={(e) => { e.preventDefault(); if (onNavCat) onNavCat(null, q); }}
            className="relative ml-2 hidden flex-1 items-center md:flex">
            <Search size={18} className="pointer-events-none absolute left-4 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cleaning products, car care, sanitisers…"
              className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-[14px] text-ink outline-none transition focus:border-cobalt focus:bg-white focus:ring-4 focus:ring-cobalt/10" />
          </form>

          <div className="ml-auto flex items-center gap-2">
            {isLoggedIn ? (
              <AccountMenu customer={customer} onAccount={goAccount} onOrders={goOrders} onLogout={logout} />
            ) : (
              <button onClick={openAuth}
                className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-full border border-slate-200 text-[13px] font-semibold text-ink hover:border-cobalt/40 hover:bg-cobalt/5 transition">
                <User size={16} className="text-cobalt" /> Sign in
              </button>
            )}
            <button onClick={() => setOpen(true)}
              className="relative grid h-11 w-11 place-items-center rounded-full bg-cobalt text-white transition-all duration-200 hover:bg-cobalt-700 hover:scale-105 active:scale-95" aria-label="Open cart">
              <Cart size={20} />
              {count > 0 && (
                <span key={count} className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-grass px-1 text-[11px] font-bold text-white ring-2 ring-white"
                  style={{ animation: 'abpop .35s cubic-bezier(.36,.07,.19,.97)' }}>
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* category nav */}
        <nav className="mx-auto hidden max-w-[1280px] items-center gap-7 px-6 pb-3 lg:flex">
          {NAV.map((n) => {
            const isActive = n.page === page && (n.page === 'shop' ? (!n.cat || n.cat === window.location.hash.split('=')[1]) : true);
            return (
              <a key={n.label} href={n.href} onClick={(e) => go(e, n)} className={`group relative text-[14px] font-semibold transition-colors hover:text-cobalt ${n.page === page && !n.cat ? 'text-cobalt' : 'text-slate-600'}`}>
                {n.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-cobalt transition-all duration-300 ${n.page === page && !n.cat ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </a>
            );
          })}
          <span className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-grass">
            <Truck size={16} /> Fast nationwide delivery
          </span>
        </nav>
      </header>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-50 lg:hidden ${menu ? "" : "pointer-events-none"}`}>
        <div onClick={() => setMenu(false)} className="absolute inset-0 bg-ink/50 transition-opacity duration-300" style={{ opacity: menu ? 1 : 0 }} />
        <div className="absolute left-0 top-0 h-full w-[82%] max-w-[340px] bg-white shadow-2xl transition-transform duration-350 ease-[cubic-bezier(.16,1,.3,1)]" style={{ transform: menu ? "translateX(0)" : "translateX(-100%)" }}>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <Wordmark onClick={(e) => { e.preventDefault(); setPage('home'); window.scrollTo(0, 0); }} />
            <button onClick={() => setMenu(false)} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-100"><X size={22} /></button>
          </div>
          <div className="px-5 py-3 overflow-y-auto h-[calc(100%-73px)]">
            <form onSubmit={(e) => { e.preventDefault(); setMenu(false); if (onNavCat) onNavCat(null, q); }} className="relative mb-3 flex items-center">
              <Search size={18} className="pointer-events-none absolute left-4 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…"
                className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-[14px] outline-none focus:border-cobalt" />
            </form>
            <nav className="flex flex-col">
              {NAV.map((n) => (
                <a key={n.label} href={n.href} onClick={(e) => go(e, n)}
                  className={`flex items-center justify-between border-b border-slate-50 py-3.5 text-[15px] font-semibold ${n.page === page && !n.cat ? 'text-cobalt' : 'text-ink'}`}>
                  {n.label} <ChevronRight size={18} className="text-slate-300" />
                </a>
              ))}
              <div className="border-b border-slate-50 py-3.5">
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <button onClick={goAccount} className="flex w-full items-center gap-2 text-[14px] font-semibold text-cobalt">
                      <User size={16} /> My Account
                    </button>
                    <button onClick={goOrders} className="flex w-full items-center gap-2 text-[14px] font-semibold text-cobalt">
                      <Package size={16} /> My Orders
                    </button>
                    <button onClick={() => { logout(); setMenu(false); }} className="flex w-full items-center gap-2 text-[14px] font-semibold text-red-500">
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { setMenu(false); openAuth(); }}
                    className="flex items-center gap-2 text-[14px] font-semibold text-cobalt">
                    <User size={16} /> Sign in / Create account
                  </button>
                )}
              </div>
            </nav>
            <a href={`tel:${BRAND.phoneRaw}`} className="mt-5 flex items-center gap-2 text-[14px] font-semibold text-cobalt">
              <Phone size={16} /> {BRAND.phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Cart Drawer ────────────────────────────────────────────────────────────── */
const FREE_SHIP = 750;

const CartDrawer = () => {
  const { open, setOpen, detailed, subtotal, setQty, remove, count, clear } = useCart();
  const { setPage } = useCustomer();

  const [shippingRates, setShippingRates] = React.useState([]);
  React.useEffect(() => {
    setShippingRates(window.SHIPPING_RATES || []);
    const onShipping = () => setShippingRates(window.SHIPPING_RATES || []);
    window.addEventListener('ab:shipping-loaded', onShipping);
    return () => window.removeEventListener('ab:shipping-loaded', onShipping);
  }, []);

  React.useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);

  const defaultRate = shippingRates.find(r => r.isDefault);
  const FREE_SHIP_DYN = defaultRate?.freeThreshold > 0 ? defaultRate.freeThreshold : FREE_SHIP;

  const remaining = Math.max(0, FREE_SHIP_DYN - subtotal);
  const pct       = Math.min(100, (subtotal / FREE_SHIP_DYN) * 100);

  const goCart     = () => { setOpen(false); setPage('cart');     window.scrollTo(0, 0); };
  const goCheckout = () => { setOpen(false); setPage('checkout'); window.scrollTo(0, 0); };

  return (
    <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={() => setOpen(false)} className="absolute inset-0 bg-ink/55 backdrop-blur-[2px] transition-opacity duration-300" style={{ opacity: open ? 1 : 0 }} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-white shadow-2xl transition-transform duration-350 ease-[cubic-bezier(.16,1,.3,1)]" style={{ transform: open ? "translateX(0)" : "translateX(100%)" }}>

        {/* Cart header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Cart size={20} className="text-cobalt" />
            <h2 className="font-display text-[17px] font-extrabold text-ink">Your Cart</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[12px] font-bold text-slate-500">{count}</span>
          </div>
          <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-100" aria-label="Close cart"><X size={20} /></button>
        </div>

        {detailed.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400"><Bag size={30} /></span>
            <h3 className="mt-5 font-display text-lg font-extrabold text-ink">Your cart is empty</h3>
            <p className="mt-2 text-[14px] text-slate-500">Browse our cleaning, car-care and sanitiser range.</p>
            <button onClick={() => setOpen(false)} className="mt-6 rounded-full bg-cobalt px-6 py-3 text-[14px] font-bold text-white hover:bg-cobalt-700">Start shopping</button>
          </div>
        ) : (
          <React.Fragment>
            {/* Free shipping bar */}
            <div className="border-b border-slate-100 px-5 py-3">
              {remaining > 0 ? (
                <p className="text-[12.5px] text-slate-500">Add <span className="font-bold text-cobalt">{money(remaining)}</span> more for <span className="font-semibold text-ink">free Gauteng delivery</span></p>
              ) : (
                <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-grass"><CheckCircle size={15} /> You've unlocked free delivery!</p>
              )}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-cobalt to-sky-400 transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="flex flex-col gap-4">
                {detailed.map(({ product, qty }) => (
                  <li key={product.id} className="flex gap-3">
                    <div className="h-[88px] w-[72px] shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                      <img src={getPrimaryImg(product)} alt={product.name} className="h-full w-full object-cover" onError={e=>{e.target.onerror=null;e.target.src='assets/products/placeholder.svg'}} />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[14px] font-bold leading-snug text-ink">{product.name}</p>
                          <p className="text-[12px] text-slate-400">{product.size} · {catOf(product.cat).short}</p>
                        </div>
                        <button onClick={() => remove(product.id)} className="text-slate-300 hover:text-red-500"><Trash size={16} /></button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center rounded-full border border-slate-200">
                          <button onClick={() => setQty(product.id, qty - 1)} className="grid h-8 w-8 place-items-center text-slate-500 hover:text-cobalt"><Minus size={14} /></button>
                          <span className="w-7 text-center text-[14px] font-bold text-ink">{qty}</span>
                          <button onClick={() => setQty(product.id, qty + 1)} disabled={qty >= (typeof product.stock === 'number' ? product.stock : Infinity)} className="grid h-8 w-8 place-items-center text-slate-500 hover:text-cobalt disabled:opacity-40 disabled:cursor-not-allowed"><Plus size={14} /></button>
                        </div>
                        <span className="text-[15px] font-extrabold text-ink">{money(product.price * qty)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between">
                <button onClick={goCart} className="text-[12.5px] font-semibold text-cobalt hover:underline">View full cart</button>
                <button onClick={clear} className="text-[12.5px] font-semibold text-slate-400 hover:text-red-500">Clear cart</button>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold text-ink">{money(subtotal)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[14px]">
                <span className="text-slate-500">Delivery</span>
                <span className={`font-bold ${remaining > 0 ? "text-slate-400" : "text-grass"}`}>
                  {remaining > 0 ? "Calculated at checkout" : "FREE"}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-dashed border-slate-200 pt-3">
                <span className="font-display text-[15px] font-extrabold text-ink">
                  {remaining > 0 ? "Subtotal" : "Total"}
                </span>
                <span className="font-display text-[20px] font-extrabold text-ink">{money(subtotal)}</span>
              </div>
              <p className="mt-1 text-[10.5px] text-slate-400">Prices include 15% VAT.</p>
              <button onClick={goCheckout}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-cobalt py-3.5 text-[15px] font-bold text-white transition hover:bg-cobalt-700">
                <Lock size={16} /> Proceed to Checkout
              </button>
              <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11.5px] text-slate-400"><Shield size={13} /> Secure checkout · SSL encrypted</p>
            </div>
          </React.Fragment>
        )}
      </aside>
    </div>
  );
};

const Toast = () => {
  const { toast } = useCart();
  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[70] -translate-x-1/2"
      style={{ transition: "opacity .3s cubic-bezier(.16,1,.3,1), transform .35s cubic-bezier(.16,1,.3,1)", opacity: toast ? 1 : 0, transform: `translate(-50%, ${toast ? 0 : 20}px)` }}>
      {toast && (
        <div className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-[13.5px] font-semibold text-white shadow-2xl">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-grass text-white ab-succ-enter"><Check size={15} /></span>
          {toast}
        </div>
      )}
    </div>
  );
};

Object.assign(window, { Wordmark, Header, CartDrawer, Toast, FREE_SHIP });
