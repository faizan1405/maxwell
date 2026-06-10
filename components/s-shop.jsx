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
  const outOfStock      = typeof p.stock === 'number' && p.stock === 0;
  const lowStock        = typeof p.stock === 'number' && p.stock > 0 && p.stock <= (p.lowStockThreshold || 10);
  const contactForPrice = !p.price || p.price <= 0;

  const primaryImgUrl = getPrimaryImg(p);
  const secondImgUrl  = getSecondImg(p);

  const [wished,    setWished]    = React.useState(false);
  const [heartAnim, setHeartAnim] = React.useState(false);
  const [added,     setAdded]     = React.useState(false);

  function handleWish(e) {
    e.stopPropagation();
    setWished(v => !v);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 600);
  }

  function handleAdd() {
    if (outOfStock || added) return;
    add(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(11,46,107,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-200 hover:shadow-[0_28px_55px_-28px_rgba(11,46,107,0.45)]">
      <div className="relative overflow-hidden bg-slate-50">
        <button onClick={() => openQuickView(p)} className="relative block w-full" aria-label={`Quick view ${p.name}`}>
          {/* Primary image */}
          <img
            src={primaryImgUrl}
            alt={p.name}
            className={`aspect-[3/4] w-full object-contain bg-white transition-all duration-500 group-hover:scale-[1.04] ${secondImgUrl ? 'group-hover:opacity-0' : ''} ${outOfStock ? 'opacity-50' : ''}`}
            loading="lazy"
            onError={e => { e.target.onerror = null; e.target.src = 'assets/products/placeholder.svg'; }}
          />
          {/* Second image — crossfades in on hover (desktop) */}
          {secondImgUrl && (
            <img
              src={secondImgUrl}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 aspect-[3/4] w-full object-contain bg-white opacity-0 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-500 ${outOfStock ? 'opacity-50' : ''}`}
              loading="lazy"
              onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
            />
          )}
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
        {/* Hover action buttons */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-all duration-250 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
          <button onClick={handleWish}
            className={`grid h-9 w-9 place-items-center rounded-full bg-white shadow-md transition-colors ${wished ? 'text-red-500' : 'text-slate-400 hover:text-red-400'}`}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}>
            <Heart size={17} fill={wished ? 'currentColor' : 'none'}
              style={{ animation: heartAnim ? 'abheart .45s ease' : 'none' }} />
          </button>
          <button onClick={() => openQuickView(p)}
            className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-400 shadow-md hover:text-cobalt transition-colors"
            aria-label="Quick view">
            <Eye size={17} />
          </button>
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">{p.size}</span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: c.accent }}>{c.short}</span>
        <h3 className="mt-1 font-display text-[16px] font-extrabold leading-snug text-ink">
          <button onClick={() => openQuickView(p)} className="text-left hover:text-cobalt transition-colors duration-200">{p.name}</button>
        </h3>
        <p className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-slate-400">{p.sub}</p>
        <div className="mt-2 flex items-center gap-1.5">
          <Stars value={p.rating} size={13} />
          <span className="text-[12px] font-semibold text-slate-500">{p.rating}</span>
          <span className="text-[12px] text-slate-300">({p.reviews})</span>
        </div>
        <div className="mt-3 flex items-end justify-between gap-2 pt-1">
          <div className="flex items-baseline gap-1.5">
            {contactForPrice
              ? <span className="font-display text-[15px] font-extrabold text-slate-500">Contact for price</span>
              : <><span className="font-display text-[20px] font-extrabold text-ink">{money(p.price)}</span>
                  {p.was && <span className="text-[13px] font-medium text-slate-300 line-through">{money(p.was)}</span>}</>
            }
          </div>
          {lowStock && <span className="text-[11px] font-bold text-amber-600">Only {p.stock} left</span>}
        </div>
        {contactForPrice ? (
          <a href={`${BRAND.wa}?text=${encodeURIComponent(`Hi Amahle Blue, I would like to get a quote for the ${p.name}.`)}`} target="_blank" rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[13.5px] font-bold text-white bg-grass hover:bg-emerald-600 transition-all duration-200 active:scale-95">
            <Whatsapp size={16} /> Get a quote
          </a>
        ) : (
          <button onClick={handleAdd} disabled={outOfStock}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-[13.5px] font-bold text-white transition-all duration-200 active:scale-95 ${
              outOfStock ? 'bg-slate-300 cursor-not-allowed' :
              added      ? 'bg-grass scale-[0.98]' :
                           'bg-ink hover:bg-cobalt'
            }`}>
            {outOfStock ? 'Out of Stock' : added ? <><Check size={16} /> Added!</> : <><Plus size={16} /> Add to Cart</>}
          </button>
        )}
      </div>
    </div>
  );
};

const Featured = () => {
  const bestIds = ["all-purpose-cleaner", "hand-surface-sanitiser", "carpet-upholstery-shampoo", "tyre-dash-shine"];
  let best = PRODUCTS.filter((p) => p.badge === "Bestseller" || bestIds.includes(p.id));
  if (best.length < 4) {
    const remaining = PRODUCTS.filter((p) => !best.includes(p) && (typeof p.stock !== 'number' || p.stock > 0));
    best = [...best, ...remaining];
  }
  best = best.slice(0, 4);

  const goShop = (e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('ab:go-page', { detail: 'shop' })); window.scrollTo(0, 0); };
  
  return (
    <section className="bg-slate-50/70">
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6 lg:py-16">
        <div className="flex flex-col items-center text-center">
          <Reveal><span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.2em] text-cobalt"><Sparkles size={14} className="text-amber-400" /> Customer favourites</span></Reveal>
          <Reveal delay={60}><h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-extrabold tracking-tight text-ink">Bestsellers</h2></Reveal>
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {best.map((p, i) => <Reveal key={p.id} delay={(i % 4) * 70}><ProductCard p={p} /></Reveal>)}
        </div>
        <div className="mt-10 flex justify-center">
          <button onClick={goShop} className="rounded-full bg-ink px-8 py-3.5 text-[15px] font-bold text-white transition-all duration-200 hover:bg-cobalt hover:-translate-y-0.5 shadow-lg">View All Products</button>
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
  const [visibleCount, setVisibleCount] = React.useState(8);
  const tabs = [{ id: "all", short: "All Products" }, ...CATEGORIES];

  React.useEffect(() => {
    setVisibleCount(8);
  }, [activeCat, query, sort]);

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
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {list.slice(0, visibleCount).map((p, i) => <Reveal key={p.id} delay={(i % 4) * 60}><ProductCard p={p} /></Reveal>)}
          </div>
        )}
        {list.length > visibleCount && (
          <div className="mt-12 flex justify-center">
            <button onClick={() => setVisibleCount(v => v + 8)} className="rounded-full border border-slate-200 bg-white px-8 py-3.5 text-[14px] font-bold text-ink hover:border-cobalt hover:text-cobalt transition-colors shadow-sm">
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

/* ─────────────────────── Quick View / Product Gallery Modal ──────────────────────── */
const QuickView = () => {
  const { add, setOpen } = useCart();
  const [product,      setProduct]      = React.useState(null);
  const [mediaIdx,     setMediaIdx]     = React.useState(0);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isZoomed,     setIsZoomed]     = React.useState(false);
  const [zoomPos,      setZoomPos]      = React.useState({ x: 50, y: 50 });
  const [qty,          setQty]          = React.useState(1);
  const touchStartX = React.useRef(null);
  const videoRef    = React.useRef(null);

  /* Derive media list */
  const media = React.useMemo(() => {
    if (!product) return [];
    if (product.media && product.media.length > 0) return product.media;
    if (product.img) return [{ id: 'single', type: 'image', url: product.img, isPrimary: true, altText: product.name }];
    return [];
  }, [product]);

  const currentMedia = media[mediaIdx] || null;

  /* Open/close */
  React.useEffect(() => {
    const h = (e) => {
      setProduct(e.detail);
      setQty(1);
      setIsFullscreen(false);
      setIsZoomed(false);
      /* Start on primary image */
      if (e.detail && e.detail.media && e.detail.media.length > 0) {
        const pi = e.detail.media.findIndex(m => m.isPrimary);
        setMediaIdx(Math.max(0, pi));
      } else {
        setMediaIdx(0);
      }
    };
    window.addEventListener("ab:quickview", h);
    return () => window.removeEventListener("ab:quickview", h);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = product ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [product]);

  React.useEffect(() => {
    const k = (e) => {
      if (!product) return;
      if (e.key === "Escape") { if (isFullscreen) setIsFullscreen(false); else setProduct(null); }
      if (e.key === "ArrowLeft")  goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [product, isFullscreen, mediaIdx, media.length]);

  function goTo(idx) {
    if (videoRef.current) videoRef.current.pause();
    setMediaIdx(Math.max(0, Math.min(media.length - 1, idx)));
    setIsZoomed(false);
  }
  function goPrev() { goTo(mediaIdx > 0 ? mediaIdx - 1 : media.length - 1); }
  function goNext() { goTo(mediaIdx < media.length - 1 ? mediaIdx + 1 : 0); }

  /* Touch swipe */
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
    touchStartX.current = null;
  };

  /* Zoom on image hover */
  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: Math.round(((e.clientX - rect.left) / rect.width)  * 100),
      y: Math.round(((e.clientY - rect.top)  / rect.height) * 100),
    });
  }

  const c = product && catOf(product.cat);

  return (
    <div className={`fixed inset-0 z-[65] flex items-center justify-center p-4 ${product ? "" : "pointer-events-none"}`}>
      {/* Backdrop */}
      <div
        onClick={() => setProduct(null)}
        className="absolute inset-0 bg-ink/55 backdrop-blur-[2px] transition-opacity duration-300"
        style={{ opacity: product ? 1 : 0 }}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-3xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl bg-white shadow-2xl transition-all duration-350 flex flex-col sm:block"
        style={{ opacity: product ? 1 : 0, transform: product ? "scale(1) translateY(0)" : "scale(.95) translateY(14px)" }}
      >
        {product && (
          <div className="grid sm:grid-cols-2">
            {/* Close button */}
            <button
              onClick={() => setProduct(null)}
              className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-md hover:bg-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* ── LEFT: Gallery viewer ── */}
            <div className="relative bg-slate-50 flex flex-col select-none">
              {/* Main viewer */}
              <div
                className="relative flex-1"
                style={{ minHeight: '260px' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {currentMedia && currentMedia.type === 'video' ? (
                  <video
                    ref={videoRef}
                    src={currentMedia.url}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-contain bg-black"
                    style={{ maxHeight: 420 }}
                    aria-label={`Video: ${product.name}`}
                  />
                ) : (
                  <div
                    className="overflow-hidden h-full"
                    style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setIsZoomed(false)}
                    onClick={() => setIsZoomed(z => !z)}
                    role="button"
                    aria-label={isZoomed ? 'Click to zoom out' : 'Click to zoom in'}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setIsZoomed(z => !z)}
                  >
                    <img
                      src={currentMedia ? currentMedia.url : 'assets/products/placeholder.svg'}
                      alt={currentMedia?.altText || product.name}
                      className="h-full w-full object-contain bg-white transition-transform duration-200"
                      style={{
                        maxHeight: 420,
                        transform:       isZoomed ? 'scale(2.2)' : 'scale(1)',
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      }}
                      onError={e => { e.target.onerror = null; e.target.src = 'assets/products/placeholder.svg'; }}
                    />
                  </div>
                )}

                {/* Badge top-left */}
                <div className="absolute left-3 top-3 flex gap-1.5 pointer-events-none">
                  <BadgeChip badge={product.badge} />
                </div>

                {/* Navigation arrows */}
                {media.length > 1 && (
                  <>
                    <button
                      onClick={goPrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink shadow-md hover:bg-white hover:scale-110 transition-all"
                      aria-label="Previous media"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={goNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink shadow-md hover:bg-white hover:scale-110 transition-all"
                      aria-label="Next media"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                {/* Media counter (mobile) + fullscreen button */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 z-10">
                  {media.length > 1 && (
                    <span className="rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white font-bold sm:hidden">
                      {mediaIdx + 1}/{media.length}
                    </span>
                  )}
                  {currentMedia && currentMedia.type === 'image' && (
                    <button
                      onClick={() => setIsFullscreen(true)}
                      className="hidden sm:grid h-7 w-7 place-items-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      title="Fullscreen"
                      aria-label="View fullscreen"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Thumbnail strip */}
              {media.length > 1 && (
                <div
                  className="flex gap-1.5 p-2 overflow-x-auto bg-white border-t border-slate-100"
                  style={{ scrollbarWidth: 'none' }}
                  role="list"
                  aria-label="Media thumbnails"
                >
                  {media.map((m, i) => (
                    <button
                      key={m.id || i}
                      onClick={() => goTo(i)}
                      role="listitem"
                      aria-label={`${m.type === 'video' ? 'Video' : 'Image'} ${i + 1}`}
                      aria-pressed={i === mediaIdx}
                      className="relative flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-cobalt focus:ring-offset-1"
                      style={{
                        border: i === mediaIdx ? '2px solid #1E50E0' : '2px solid transparent',
                        opacity: i === mediaIdx ? 1 : 0.6,
                      }}
                    >
                      {m.type === 'video' ? (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                      ) : (
                        <img
                          src={m.url}
                          alt={`${product.name} ${i + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={e => { e.target.onerror = null; e.target.src = 'assets/products/placeholder.svg'; }}
                        />
                      )}
                      {m.type === 'video' && (
                        <span className="absolute bottom-0.5 left-0.5 bg-slate-700/80 text-white text-[7px] font-bold px-1 py-0.5 rounded">▶</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Product details ── */}
            <div className="flex flex-col p-6 sm:p-7 overflow-y-auto" style={{ maxHeight: 'min(90vh, 600px)' }}>
              <span className="text-[11.5px] font-bold uppercase tracking-wide" style={{ color: c.accent }}>{c.name}</span>
              <h3 className="mt-1.5 font-display text-[20px] sm:text-[24px] font-extrabold leading-tight text-ink">{product.name}</h3>
              <div className="mt-2 flex items-center gap-2">
                <Stars value={product.rating} size={15} />
                <span className="text-[13px] font-semibold text-slate-500">{product.rating}</span>
                <span className="text-[13px] text-slate-300">· {product.reviews} reviews</span>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-slate-500">{product.desc}</p>
              <ul className="mt-4 grid gap-2">
                {(product.benefits || []).slice(0, 4).map((b) => (
                  <li key={b} className="flex items-start gap-2 text-[13.5px] text-ink">
                    <Check size={16} className="mt-0.5 shrink-0 text-grass" /> {b}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-baseline gap-2">
                {(!product.price || product.price <= 0)
                  ? <span className="font-display text-[20px] font-extrabold text-slate-500">Contact for price</span>
                  : <><span className="font-display text-[24px] sm:text-[28px] font-extrabold text-ink">{money(product.price)}</span>
                      {product.was && <span className="text-[15px] font-medium text-slate-300 line-through">{money(product.was)}</span>}</>
                }
                <span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-[12px] font-bold text-slate-500">{product.size}</span>
              </div>
              {(!product.price || product.price <= 0) ? (
                <a href={`${BRAND.wa}?text=${encodeURIComponent(`Hi Amahle Blue, I would like to get a quote for the ${product.name}.`)}`} target="_blank" rel="noopener noreferrer"
                  className="mt-5 flex items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-bold text-white bg-grass hover:bg-emerald-600 transition">
                  <Whatsapp size={18} /> Get a quote on WhatsApp
                </a>
              ) : (() => {
                const outOfStock = typeof product.stock === 'number' && product.stock === 0;
                const lowStock   = typeof product.stock === 'number' && product.stock > 0 && product.stock <= (product.lowStockThreshold || 10);
                const maxQty     = typeof product.stock === 'number' ? product.stock : 99;
                return (
                  <React.Fragment>
                    {lowStock && <p className="mt-3 text-[12.5px] font-bold text-amber-600">Only {product.stock} unit{product.stock === 1 ? '' : 's'} left — order soon!</p>}
                    <div className="mt-5 flex items-center gap-3">
                      {!outOfStock && (
                        <div className="flex items-center rounded-full border border-slate-200">
                          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center text-slate-500 hover:text-cobalt" aria-label="Decrease quantity"><Minus size={16} /></button>
                          <span className="w-8 text-center font-display text-[16px] font-extrabold text-ink">{qty}</span>
                          <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} className="grid h-11 w-11 place-items-center text-slate-500 hover:text-cobalt" aria-label="Increase quantity"><Plus size={16} /></button>
                        </div>
                      )}
                      <button
                        disabled={outOfStock}
                        onClick={() => { if (!outOfStock) { add(product, qty); setProduct(null); setTimeout(() => setOpen(true), 150); } }}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-bold text-white transition ${outOfStock ? 'bg-slate-300 cursor-not-allowed' : 'bg-cobalt hover:bg-cobalt-700'}`}
                      >
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

      {/* ── Fullscreen overlay ── */}
      {isFullscreen && product && currentMedia && (
        <div
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/95"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Close fullscreen"
          >
            <X size={20} />
          </button>

          {/* Arrows */}
          {media.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
                aria-label="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
                aria-label="Next"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Main image */}
          <div className="relative max-w-[90vw] max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <img
              src={currentMedia.url}
              alt={product.name}
              className="max-w-full max-h-[80vh] object-contain"
              onError={e => { e.target.onerror = null; e.target.src = 'assets/products/placeholder.svg'; }}
            />
          </div>

          {/* Thumbnails + counter */}
          {media.length > 1 && (
            <div className="flex gap-2 mt-4 max-w-[90vw] overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {media.filter(m => m.type === 'image').map((m, i) => {
                const realIdx = media.indexOf(m);
                return (
                  <button
                    key={m.id || i}
                    onClick={e => { e.stopPropagation(); goTo(realIdx); }}
                    aria-label={`Image ${i + 1}`}
                    className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all"
                    style={{
                      border: realIdx === mediaIdx ? '2px solid white' : '2px solid transparent',
                      opacity: realIdx === mediaIdx ? 1 : 0.45,
                    }}
                  >
                    <img src={m.url} className="w-full h-full object-cover" alt="" />
                  </button>
                );
              })}
            </div>
          )}
          <p className="mt-3 text-white/40 text-xs">{mediaIdx + 1} / {media.length}</p>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { ProductCard, Featured, BulkPromo, Shop, QuickView, openQuickView });
