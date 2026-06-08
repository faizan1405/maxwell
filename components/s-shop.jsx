/* Amahle Blue Store — ProductCard, Featured, Shop (filter/sort), BulkPromo, QuickView */

const openQuickView = (product) => window.dispatchEvent(new CustomEvent("ab:quickview", { detail: product }));

const BadgeChip = ({ badge }) => {
  if (!badge) return null;
  const map = {
    "Bestseller": "bg-amber-400 text-amber-950",
    "New": "bg-grass text-white",
    "High Purity": "bg-cobalt text-white",
  };
  return <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wide ${map[badge] || "bg-ink text-white"}`}>{badge}</span>;
};

const ProductCard = ({ p }) => {
  const { add } = useCart();
  const c = catOf(p.cat);
  const outOfStock  = typeof p.stock === 'number' && p.stock === 0;
  const lowStock    = typeof p.stock === 'number' && p.stock > 0 && p.stock <= (p.lowStockThreshold || 10);
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(11,46,107,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-200 hover:shadow-[0_28px_55px_-28px_rgba(11,46,107,0.45)]">
      <div className="relative overflow-hidden bg-slate-50">
        <button onClick={() => openQuickView(p)} className="block w-full" aria-label={`Quick view ${p.name}`}>
          <img src={p.img} alt={p.name} className={`aspect-[3/4] w-full object-contain bg-white transition-transform duration-500 group-hover:scale-[1.03] ${outOfStock ? 'opacity-50' : ''}`} loading="lazy" />
        </button>
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <span className="rounded-full bg-slate-800 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-white shadow-lg">Out of Stock</span>
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {!outOfStock && <BadgeChip badge={p.badge} />}
          {p.was && !outOfStock && <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wide text-white">Save {money(p.was - p.price)}</span>}
        </div>
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-500 shadow-md hover:text-red-500" aria-label="Add to wishlist"><Heart size={17} /></button>
          <button onClick={() => openQuickView(p)} className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-500 shadow-md hover:text-cobalt" aria-label="Quick view"><Eye size={17} /></button>
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">{p.size}</span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: c.accent }}>{c.short}</span>
        <h3 className="mt-1 font-display text-[16px] font-extrabold leading-snug text-ink">
          <button onClick={() => openQuickView(p)} className="text-left hover:text-cobalt">{p.name}</button>
        </h3>
        <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-slate-400">{p.sub}</p>
        <div className="mt-2 flex items-center gap-1.5">
          <Stars value={p.rating} size={13} />
          <span className="text-[12px] font-semibold text-slate-500">{p.rating}</span>
          <span className="text-[12px] text-slate-300">({p.reviews})</span>
        </div>
        <div className="mt-3 flex items-end justify-between gap-2 pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[20px] font-extrabold text-ink">{money(p.price)}</span>
            {p.was && <span className="text-[13px] font-medium text-slate-300 line-through">{money(p.was)}</span>}
          </div>
          {lowStock && <span className="text-[11px] font-bold text-amber-600">Only {p.stock} left</span>}
        </div>
        <button onClick={() => add(p)} disabled={outOfStock}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[13.5px] font-bold text-white transition ${outOfStock ? 'bg-slate-300 cursor-not-allowed' : 'bg-ink hover:bg-cobalt'}`}>
          {outOfStock ? 'Out of Stock' : <><Plus size={16} /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
};

const Featured = () => {
  const best = PRODUCTS.filter((p) => ["all-purpose-cleaner", "hand-surface-sanitiser", "carpet-upholstery-shampoo", "tyre-dash-shine"].includes(p.id));
  return (
    <section className="bg-slate-50/70">
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex flex-col items-end justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Reveal><span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-cobalt"><Sparkles size={14} className="text-amber-400" /> Customer favourites</span></Reveal>
            <Reveal delay={60}><h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-extrabold tracking-tight text-ink">Bestsellers</h2></Reveal>
          </div>
          <Reveal delay={100}><a href="#shop" className="group inline-flex items-center gap-2 text-[14px] font-bold text-cobalt">View all products <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" /></a></Reveal>
        </div>
        <div className="mt-9 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {best.map((p, i) => <Reveal key={p.id} delay={(i % 4) * 70}><ProductCard p={p} /></Reveal>)}
        </div>
      </div>
    </section>
  );
};

const BulkPromo = () => {
  const { setOpen } = useCart();
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-4 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cobalt via-cobalt to-ink px-7 py-10 sm:px-12 sm:py-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
          <div className="relative grid items-center gap-7 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-white"><Tag size={14} /> For businesses</span>
              <h2 className="mt-4 font-display text-[clamp(1.7rem,3.5vw,2.6rem)] font-extrabold leading-tight tracking-tight text-white">Buying in bulk? Unlock wholesale pricing.</h2>
              <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-sky-100/90">Carwashes, laundromats, contract cleaners and resellers — get trade rates on 5L and bulk drum volumes, supplied reliably across South Africa.</p>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <a href={BRAND.wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-[15px] font-bold text-cobalt transition hover:-translate-y-0.5 hover:bg-sky-50">
                <Whatsapp size={18} className="text-grass" /> Request a bulk quote
              </a>
              <a href="#contact" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-[15px] font-bold text-white transition hover:bg-white/10">
                Contact sales <ArrowRight size={17} />
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
];

const Shop = ({ activeCat, setActiveCat, query, setQuery }) => {
  const [sort, setSort] = React.useState("featured");
  const tabs = [{ id: "all", short: "All Products" }, ...CATEGORIES];

  let list = PRODUCTS.filter((p) => (activeCat === "all" || !activeCat ? true : p.cat === activeCat));
  if (query && query.trim()) {
    const q = query.toLowerCase();
    list = list.filter((p) => (p.name + " " + p.sub + " " + p.desc + " " + catOf(p.cat).name).toLowerCase().includes(q));
  }
  list = [...list];
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);

  return (
    <section id="shop" className="scroll-mt-32 bg-white">
      <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex flex-col items-center text-center">
          <Reveal><span className="text-[12px] font-bold uppercase tracking-[0.2em] text-cobalt">The full range</span></Reveal>
          <Reveal delay={60}><h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-extrabold tracking-tight text-ink">Shop all products</h2></Reveal>
        </div>

        {/* controls */}
        <div className="mt-9 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setActiveCat(t.id)} className={`rounded-full px-4 py-2.5 text-[13.5px] font-bold transition ${(activeCat || "all") === t.id ? "bg-cobalt text-white shadow-[0_10px_24px_-12px_rgba(37,99,235,0.9)]" : "border border-slate-200 bg-white text-slate-600 hover:border-cobalt hover:text-cobalt"}`}>
                {t.short}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {query && query.trim() && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[12.5px] font-semibold text-slate-600">
                "{query}" <button onClick={() => setQuery("")} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
              </span>
            )}
            <div className="relative">
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none rounded-full border border-slate-200 bg-white py-2.5 pl-4 pr-9 text-[13.5px] font-semibold text-ink outline-none focus:border-cobalt">
                {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="mt-14 flex flex-col items-center text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400"><Search size={28} /></span>
            <p className="mt-4 font-display text-lg font-extrabold text-ink">No products found</p>
            <p className="mt-1 text-[14px] text-slate-500">Try a different category or clear your search.</p>
            <button onClick={() => { setActiveCat("all"); setQuery(""); }} className="mt-5 rounded-full bg-cobalt px-6 py-2.5 text-[14px] font-bold text-white">Reset filters</button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {list.map((p, i) => <Reveal key={p.id} delay={(i % 4) * 60}><ProductCard p={p} /></Reveal>)}
          </div>
        )}
      </div>
    </section>
  );
};

/* ---------------- Quick View Modal ---------------- */
const QuickView = () => {
  const { add, setOpen } = useCart();
  const [product, setProduct] = React.useState(null);
  const [qty, setQty] = React.useState(1);
  React.useEffect(() => {
    const h = (e) => { setProduct(e.detail); setQty(1); };
    window.addEventListener("ab:quickview", h);
    return () => window.removeEventListener("ab:quickview", h);
  }, []);
  React.useEffect(() => { document.body.style.overflow = product ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [product]);
  React.useEffect(() => {
    const k = (e) => { if (e.key === "Escape") setProduct(null); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);

  const c = product && catOf(product.cat);
  return (
    <div className={`fixed inset-0 z-[65] flex items-center justify-center p-4 ${product ? "" : "pointer-events-none"}`}>
      <div onClick={() => setProduct(null)} className="absolute inset-0 bg-ink/55 backdrop-blur-[2px] transition-opacity duration-300" style={{ opacity: product ? 1 : 0 }} />
      <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300" style={{ opacity: product ? 1 : 0, transform: product ? "scale(1) translateY(0)" : "scale(.96) translateY(12px)" }}>
        {product && (
          <div className="grid sm:grid-cols-2">
            <button onClick={() => setProduct(null)} className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-md hover:bg-white" aria-label="Close"><X size={20} /></button>
            <div className="relative bg-slate-50">
              <img src={product.img} alt={product.name} className="h-full max-h-[420px] w-full object-contain bg-white sm:max-h-none" />
              <div className="absolute left-3 top-3 flex gap-1.5"><BadgeChip badge={product.badge} /></div>
            </div>
            <div className="flex flex-col p-6 sm:p-7">
              <span className="text-[11.5px] font-bold uppercase tracking-wide" style={{ color: c.accent }}>{c.name}</span>
              <h3 className="mt-1.5 font-display text-[20px] sm:text-[24px] font-extrabold leading-tight text-ink">{product.name}</h3>
              <div className="mt-2 flex items-center gap-2">
                <Stars value={product.rating} size={15} />
                <span className="text-[13px] font-semibold text-slate-500">{product.rating}</span>
                <span className="text-[13px] text-slate-300">· {product.reviews} reviews</span>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-slate-500">{product.desc}</p>
              <ul className="mt-4 grid gap-2">
                {product.benefits.slice(0, 4).map((b) => (
                  <li key={b} className="flex items-start gap-2 text-[13.5px] text-ink"><Check size={16} className="mt-0.5 shrink-0 text-grass" /> {b}</li>
                ))}
              </ul>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-display text-[24px] sm:text-[28px] font-extrabold text-ink">{money(product.price)}</span>
                {product.was && <span className="text-[15px] font-medium text-slate-300 line-through">{money(product.was)}</span>}
                <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-[12px] font-bold text-slate-500">{product.size}</span>
              </div>
              {(() => {
                const outOfStock = typeof product.stock === 'number' && product.stock === 0;
                const lowStock   = typeof product.stock === 'number' && product.stock > 0 && product.stock <= (product.lowStockThreshold || 10);
                const maxQty     = typeof product.stock === 'number' ? product.stock : 99;
                return (
                  <React.Fragment>
                    {lowStock && <p className="mt-3 text-[12.5px] font-bold text-amber-600">Only {product.stock} unit{product.stock === 1 ? '' : 's'} left — order soon!</p>}
                    <div className="mt-5 flex items-center gap-3">
                      {!outOfStock && (
                        <div className="flex items-center rounded-full border border-slate-200">
                          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center text-slate-500 hover:text-cobalt" aria-label="Decrease"><Minus size={16} /></button>
                          <span className="w-8 text-center font-display text-[16px] font-extrabold text-ink">{qty}</span>
                          <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} className="grid h-11 w-11 place-items-center text-slate-500 hover:text-cobalt" aria-label="Increase"><Plus size={16} /></button>
                        </div>
                      )}
                      <button disabled={outOfStock} onClick={() => { if (!outOfStock) { add(product, qty); setProduct(null); setTimeout(() => setOpen(true), 150); } }}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-bold text-white transition ${outOfStock ? 'bg-slate-300 cursor-not-allowed' : 'bg-cobalt hover:bg-cobalt-700'}`}>
                        {outOfStock ? 'Out of Stock' : <><Cart size={18} /> Add to Cart</>}
                      </button>
                    </div>
                  </React.Fragment>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { ProductCard, Featured, BulkPromo, Shop, QuickView, openQuickView });
