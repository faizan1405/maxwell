/* Amahle Blue Store — Hero, Trust strip, Category showcase */

const Hero = ({ onShopCat }) => {
  const { add, setOpen } = useCart();
  const apc = PRODUCTS.find((p) => p.id === "all-purpose-cleaner");
  const san = PRODUCTS.find((p) => p.id === "hand-surface-sanitiser");
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white">
      {/* decorative */}
      <div className="pointer-events-none absolute -right-32 -top-24 h-[560px] w-[560px] rounded-full opacity-70" style={{ background: "radial-gradient(circle, rgba(125,196,255,0.45), transparent 62%)" }} />
      <div className="pointer-events-none absolute -left-24 top-40 h-[360px] w-[360px] rounded-full opacity-60" style={{ background: "radial-gradient(circle, rgba(21,154,76,0.16), transparent 60%)" }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.55]" style={{ backgroundImage: "radial-gradient(rgba(37,99,235,0.07) 1px, transparent 1px)", backgroundSize: "26px 26px" }} />

      <div className="relative mx-auto grid max-w-[1280px] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:py-20">
        <div className="max-w-xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-cobalt/15 bg-white px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-cobalt shadow-sm">
              <Sparkles size={14} className="text-sky-500" /> Proudly made in South Africa
            </span>
          </Reveal>
          <Reveal delay={70}>
            <h1 className="mt-5 font-display text-[clamp(2.5rem,6vw,4.25rem)] font-extrabold leading-[0.98] tracking-tight text-ink">
              A cleaner home,<br /><span className="text-cobalt">car &amp; everything</span><br />in between.
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-slate-500">
              Premium cleaning, car-care &amp; sanitising solutions — formulated and bottled in Gauteng. Powerful results, fresh finish, delivered to your door.
            </p>
          </Reveal>
          <Reveal delay={210}>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#shop" className="group inline-flex items-center justify-center gap-2 rounded-full bg-cobalt px-7 py-3.5 text-[15px] font-bold text-white shadow-[0_16px_34px_-14px_rgba(37,99,235,0.9)] transition hover:-translate-y-0.5 hover:bg-cobalt-700">
                Shop the range <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </a>
              <button onClick={() => onShopCat && onShopCat("car")} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 py-3.5 text-[15px] font-bold text-ink transition hover:border-cobalt hover:text-cobalt">
                <Car size={18} /> Explore car care
              </button>
            </div>
          </Reveal>
          <Reveal delay={280}>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
              <div className="flex items-center gap-2">
                <Stars value={4.8} size={16} />
                <span className="text-[13.5px] font-semibold text-ink">4.8/5</span>
                <span className="text-[13px] text-slate-400">· 900+ reviews</span>
              </div>
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-slate-600"><Shield size={16} className="text-grass" /> Kills 99.9% of germs</div>
            </div>
          </Reveal>
        </div>

        {/* product showcase */}
        <Reveal delay={120} className="relative">
          <div className="relative mx-auto flex max-w-[520px] items-end justify-center gap-4 lg:max-w-none">
            <div className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-cobalt to-sky-400 opacity-90" style={{ filter: "blur(2px)" }} />
            <div className="absolute left-1/2 top-1/2 h-[88%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40" />

            <div className="relative z-10 mb-8 w-[44%] -rotate-6 overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-20px_rgba(11,46,107,0.55)] ring-1 ring-black/5 transition-transform duration-500 hover:-translate-y-2 hover:rotate-0">
              <img src={san.img} alt={san.name} className="h-full w-full object-cover" />
            </div>
            <div className="relative z-20 w-[50%] rotate-3 overflow-hidden rounded-2xl bg-white shadow-[0_36px_70px_-20px_rgba(11,46,107,0.6)] ring-1 ring-black/5 transition-transform duration-500 hover:-translate-y-2 hover:rotate-0">
              <img src={apc.img} alt={apc.name} className="h-full w-full object-cover" />
              <button onClick={() => { add(apc); }} className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/95 px-4 py-2 text-[12.5px] font-bold text-cobalt shadow-lg backdrop-blur transition hover:bg-cobalt hover:text-white">
                <Plus size={14} /> Quick add
              </button>
            </div>

            {/* floating chips */}
            <div className="absolute -left-1 top-4 z-30 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl ring-1 ring-black/5" style={{ animation: "abfloat 5s ease-in-out infinite" }}>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-grass/12 text-grass"><Leaf size={18} /></span>
              <div className="leading-tight"><p className="text-[12px] font-extrabold text-ink">Eco-conscious</p><p className="text-[10.5px] text-slate-400">Responsibly made</p></div>
            </div>
            <div className="absolute -right-1 bottom-2 z-30 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl ring-1 ring-black/5" style={{ animation: "abfloat 5s ease-in-out infinite", animationDelay: "1.4s" }}>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-cobalt/10 text-cobalt"><Truck size={18} /></span>
              <div className="leading-tight"><p className="text-[12px] font-extrabold text-ink">Fast delivery</p><p className="text-[10.5px] text-slate-400">Across South Africa</p></div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const TRUST = [
  { icon: Award, title: "Locally Manufactured", sub: "Made in Gauteng, SA" },
  { icon: Truck, title: "Free Delivery over R750", sub: "Fast nationwide shipping" },
  { icon: Shield, title: "Kills 99.9% of Germs", sub: "High-purity sanitisers" },
  { icon: Tag, title: "Bulk & Trade Pricing", sub: "Wholesale volumes welcome" },
];

const TrustStrip = () => (
  <section className="border-y border-slate-100 bg-white">
    <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-x-4 gap-y-5 px-4 py-7 sm:px-6 lg:grid-cols-4 lg:py-6">
      {TRUST.map((t, i) => (
        <Reveal key={t.title} delay={i * 60} className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-50 text-cobalt"><t.icon size={21} /></span>
          <div className="leading-tight">
            <p className="text-[13.5px] font-extrabold text-ink">{t.title}</p>
            <p className="text-[12px] text-slate-400">{t.sub}</p>
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);

const CategoryShowcase = ({ onShopCat }) => (
  <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:py-20">
    <div className="flex flex-col items-center text-center">
      <Reveal><span className="text-[12px] font-bold uppercase tracking-[0.2em] text-cobalt">Shop by category</span></Reveal>
      <Reveal delay={60}><h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-extrabold tracking-tight text-ink">Find your clean</h2></Reveal>
      <Reveal delay={110}><p className="mt-3 max-w-lg text-[16px] text-slate-500">Three ranges, one standard of quality — built for homes, vehicles and busy hands.</p></Reveal>
    </div>

    <div className="mt-11 grid gap-5 md:grid-cols-3">
      {CATEGORIES.map((c, i) => {
        const n = PRODUCTS.filter((p) => p.cat === c.id).length;
        return (
          <Reveal key={c.id} delay={i * 80}>
            <button onClick={() => onShopCat && onShopCat(c.id)} className="group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white p-7 text-left shadow-[0_2px_10px_rgba(11,46,107,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(11,46,107,0.4)]">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-150" style={{ background: c.accent, filter: "blur(8px)" }} />
              <span className="relative grid h-14 w-14 place-items-center rounded-2xl text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.accent}cc)` }}><CatIcon name={c.icon} size={26} /></span>
              <h3 className="relative mt-5 font-display text-[20px] font-extrabold text-ink">{c.name}</h3>
              <p className="relative mt-2 flex-1 text-[14.5px] leading-relaxed text-slate-500">{c.blurb}</p>
              <span className="relative mt-5 inline-flex items-center gap-2 text-[14px] font-bold text-cobalt">
                Shop {n} products <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </Reveal>
        );
      })}
    </div>
  </section>
);

Object.assign(window, { Hero, TrustStrip, CategoryShowcase });
