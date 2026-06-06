/* Amahle Blue Store — Footer + floating WhatsApp + App composition */

const Footer = ({ onShopCat }) => (
  <footer className="bg-ink text-slate-300">
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
      {/* mini trust row */}
      <div className="grid gap-5 border-b border-white/10 py-9 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Truck, t: "Nationwide delivery", s: "Free over R750 in Gauteng" },
          { icon: Lock, t: "Secure checkout", s: "Your details stay protected" },
          { icon: Award, t: "Quality guaranteed", s: "Consistent, tested batches" },
          { icon: Whatsapp, t: "Talk to us", s: "Quick help on WhatsApp" },
        ].map((x) => (
          <div key={x.t} className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/8 text-sky-300"><x.icon size={20} /></span>
            <div className="leading-tight"><p className="text-[14px] font-bold text-white">{x.t}</p><p className="text-[12.5px] text-slate-400">{x.s}</p></div>
          </div>
        ))}
      </div>

      <div className="grid gap-10 py-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Wordmark light />
          <p className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-slate-400">Premium, locally-manufactured cleaning, car-care and sanitising solutions. Powerful results with a fresh, clean finish — delivered across South Africa.</p>
          <div className="mt-5 flex gap-2.5">
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center rounded-xl bg-white/8 text-white transition hover:bg-cobalt" aria-label="Facebook"><Facebook size={18} /></a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center rounded-xl bg-white/8 text-white transition hover:bg-cobalt" aria-label="Instagram"><Instagram size={18} /></a>
            <a href={BRAND.wa} target="_blank" rel="noopener noreferrer" className="grid h-10 w-10 place-items-center rounded-xl bg-white/8 text-white transition hover:bg-grass" aria-label="WhatsApp"><Whatsapp size={18} /></a>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h4 className="font-display text-[13px] font-extrabold uppercase tracking-wide text-white">Shop</h4>
          <ul className="mt-4 space-y-2.5 text-[14px]">
            {CATEGORIES.map((c) => (
              <li key={c.id}><a href="#shop" onClick={() => onShopCat && onShopCat(c.id)} className="text-slate-400 transition hover:text-white">{c.name}</a></li>
            ))}
            <li><a href="#shop" onClick={() => onShopCat && onShopCat("all")} className="text-slate-400 transition hover:text-white">All Products</a></li>
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h4 className="font-display text-[13px] font-extrabold uppercase tracking-wide text-white">Company</h4>
          <ul className="mt-4 space-y-2.5 text-[14px]">
            <li><a href="#about" className="text-slate-400 transition hover:text-white">About us</a></li>
            <li><a href="#contact" className="text-slate-400 transition hover:text-white">Contact</a></li>
            <li><a href={BRAND.wa} target="_blank" rel="noopener noreferrer" className="text-slate-400 transition hover:text-white">Bulk &amp; trade</a></li>
            <li><a href="#shop" className="text-slate-400 transition hover:text-white">Delivery &amp; returns</a></li>
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h4 className="font-display text-[13px] font-extrabold uppercase tracking-wide text-white">Get in touch</h4>
          <ul className="mt-4 space-y-3 text-[14px]">
            <li className="flex items-start gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-sky-300" /> <span className="text-slate-400">{BRAND.address}</span></li>
            <li className="flex items-center gap-3"><Phone size={18} className="shrink-0 text-sky-300" /> <a href={`tel:${BRAND.phoneRaw}`} className="text-slate-400 hover:text-white">{BRAND.phone}</a></li>
            <li className="flex items-center gap-3"><Mail size={18} className="shrink-0 text-sky-300" /> <a href={`mailto:${BRAND.email}`} className="text-slate-400 hover:text-white">{BRAND.email}</a></li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-[12.5px] text-slate-500 sm:flex-row">
        <span>© 2026 Amahle Blue Cleaning Solutions. All rights reserved.</span>
        <span className="flex items-center gap-4">
          <span>Secure payments</span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-400"><Lock size={13} /> SSL encrypted</span>
          <span className="font-mono uppercase tracking-wide text-slate-600">Made in 🇿🇦</span>
        </span>
      </div>
    </div>
  </footer>
);

const WhatsappFab = () => (
  <a href={BRAND.wa} target="_blank" rel="noopener noreferrer" className="group fixed bottom-5 right-5 z-30 inline-flex items-center gap-0 overflow-hidden rounded-full bg-grass px-4 py-4 text-white shadow-[0_16px_40px_-10px_rgba(21,154,76,0.8)] transition-all hover:px-5" aria-label="Chat on WhatsApp">
    <Whatsapp size={26} />
    <span className="max-w-0 overflow-hidden whitespace-nowrap text-[14px] font-bold opacity-0 transition-all duration-300 group-hover:ml-2.5 group-hover:max-w-[120px] group-hover:opacity-100">Need help?</span>
  </a>
);

/* ---------------- App ---------------- */
function StoreApp() {
  const [activeCat, setActiveCat] = React.useState("all");
  const [query, setQuery] = React.useState("");

  const scrollToShop = () => {
    const el = document.getElementById("shop");
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: "smooth" });
  };
  const onNavCat = (cat, q) => {
    if (cat) setActiveCat(cat);
    if (typeof q === "string") { setQuery(q); setActiveCat("all"); }
    setTimeout(scrollToShop, 60);
  };
  const onShopCat = (cat, q) => { onNavCat(cat || "all", q); };

  return (
    <CartProvider>
      <Header onNavCat={onNavCat} />
      <main>
        <Hero onShopCat={onShopCat} />
        <TrustStrip />
        <CategoryShowcase onShopCat={onShopCat} />
        <Featured />
        <BulkPromo />
        <Shop activeCat={activeCat} setActiveCat={setActiveCat} query={query} setQuery={setQuery} />
        <WhyUs />
        <Reviews />
        <Newsletter />
      </main>
      <Footer onShopCat={onShopCat} />
      <CartDrawer />
      <QuickView />
      <Toast />
      <WhatsappFab />
    </CartProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<StoreApp />);
