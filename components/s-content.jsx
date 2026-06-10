/* Amahle Blue Store — Why Us, Reviews, Newsletter */

const WHY = [
  { icon: Award, title: "Locally manufactured", body: "Formulated and bottled in Boksburg, Gauteng since 2019 — proudly South African.", color: "#1D4ED8" },
  { icon: Sparkles, title: "Powerful, fresh results", body: "High-active formulations that cut grease, lift stains and leave a clean, fresh finish.", color: "#0EA5E9" },
  { icon: Shield, title: "Tested & trusted", body: "Every batch is quality-checked for consistent performance you can rely on.", color: "#159A4C" },
  { icon: Leaf, title: "Eco-conscious", body: "Responsible raw materials and biodegradable options — strong on dirt, kinder to the planet.", color: "#0B2E6B" },
];

const WhyUs = () => (
  <section id="about" className="scroll-mt-24 bg-white">
    <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
      <div>
        <Reveal><span className="text-[12px] font-bold uppercase tracking-[0.2em] text-cobalt">Why Amahle Blue</span></Reveal>
        <Reveal delay={60}><h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.02] tracking-tight text-ink">Premium clean, made right here at home.</h2></Reveal>
        <Reveal delay={120}><p className="mt-5 text-[16.5px] leading-relaxed text-slate-500">Amahle Blue was founded to give South African homes and businesses cleaning products they can genuinely trust — powerful, consistent and fairly priced. From everyday surfaces to showroom car care, every bottle is held to the same standard.</p></Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={i * 70}>
              <div className="h-full rounded-2xl border border-slate-100 bg-slate-50/60 p-5 transition hover:border-slate-200 hover:bg-white hover:shadow-lg">
                <span className="grid h-11 w-11 place-items-center rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${w.color}, ${w.color}cc)` }}><w.icon size={20} /></span>
                <h3 className="mt-4 font-display text-[16px] font-extrabold text-ink">{w.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-500">{w.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal delay={120} className="relative">
        <div className="relative grid grid-cols-2 gap-4">
          <div className="overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5"><img src={(window.__resources||{}).allPurposeCleaner || "assets/products/all-purpose-cleaner.jpg"} alt="All Purpose Cleaner" className="h-full w-full object-cover" /></div>
          <div className="mt-8 overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5"><img src={(window.__resources||{}).tyreShine || "assets/products/tyre-shine.jpg"} alt="Tyre Shine" className="h-full w-full object-cover" /></div>
          <div className="overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5 -mt-4"><img src={(window.__resources||{}).carpetShampoo || "assets/products/carpet-upholstery-shampoo.png"} alt="Carpet Shampoo" className="h-full w-full object-cover" /></div>
          <div className="overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5 mt-4"><img src={(window.__resources||{}).handSanitiser || "assets/products/hand-surface-sanitiser.jpg"} alt="Sanitiser" className="h-full w-full object-cover" /></div>
        </div>
        <div className="absolute -bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-white px-5 py-3.5 shadow-xl ring-1 ring-black/5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-cobalt/10 text-cobalt"><Award size={22} /></span>
          <div className="leading-tight"><p className="font-display text-[15px] font-extrabold text-ink">Made in South Africa</p><p className="text-[12px] text-slate-400">Est. 2019 · Gauteng</p></div>
        </div>
      </Reveal>
    </div>
  </section>
);

const REVIEWS = [
  { name: "Thandi M.", role: "Verified buyer · Pretoria", initials: "TM", rating: 5, product: "All Purpose Cleaner", text: "Cuts through kitchen grease like nothing else I've tried, and the fresh smell lingers for hours. Repurchasing for sure." },
  { name: "Riaan D.", role: "Verified buyer · Boksburg", initials: "RD", rating: 5, product: "Tyre & Dash Shine", text: "My car looks like it just left the dealership. Deep gloss on the tyres, non-greasy dash. Brilliant value at 5L." },
  { name: "Naledi K.", role: "Carwash owner · Johannesburg", initials: "NK", rating: 5, product: "Bulk supply", text: "We switched our whole wash bay to Amahle Blue. Consistent quality, great bulk pricing and delivery is always on time." },
  { name: "Sarah P.", role: "Verified buyer · Centurion", initials: "SP", rating: 4, product: "Carpet & Upholstery Shampoo", text: "Lifted years-old stains off my couch. Low foam so it dries quickly too. Would love a bigger range of scents." },
];

const Reviews = () => (
  <section className="bg-gradient-to-b from-sky-50/70 to-white">
    <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 lg:py-20">
      <div className="flex flex-col items-center text-center">
        <Reveal><span className="text-[12px] font-bold uppercase tracking-[0.2em] text-cobalt">Loved by customers</span></Reveal>
        <Reveal delay={60}><h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-extrabold tracking-tight text-ink">Real reviews, real results</h2></Reveal>
        <Reveal delay={110}>
          <div className="mt-4 flex items-center gap-3">
            <Stars value={4.8} size={20} />
            <span className="font-display text-[18px] font-extrabold text-ink">4.8 out of 5</span>
            <span className="text-[14px] text-slate-400">· 900+ verified reviews</span>
          </div>
        </Reveal>
      </div>
      <div className="mt-11 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {REVIEWS.map((r, i) => (
          <Reveal key={r.name} delay={i * 70}>
            <figure className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_10px_rgba(11,46,107,0.04)]">
              <Stars value={r.rating} size={15} />
              <blockquote className="mt-3 flex-1 text-[14.5px] leading-relaxed text-ink">"{r.text}"</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-cobalt to-sky-400 font-display text-[13px] font-bold text-white">{r.initials}</span>
                <div className="leading-tight">
                  <p className="text-[13.5px] font-extrabold text-ink">{r.name}</p>
                  <p className="text-[11.5px] text-slate-400">{r.role}</p>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
      <Reveal delay={120}><p className="mt-7 text-center text-[12.5px] text-slate-400">Sample reviews shown for demonstration — ready to connect to your live review platform.</p></Reveal>
    </div>
  </section>
);

const Newsletter = () => {
  const [done, setDone] = React.useState(false);
  return (
    <section id="contact" className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-ink to-cobalt px-7 py-12 text-center sm:px-12">
            <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="relative mx-auto max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-white"><Mail size={14} /> Join the list</span>
              <h2 className="mt-4 font-display text-[clamp(1.7rem,3.5vw,2.5rem)] font-extrabold leading-tight tracking-tight text-white">Be the first to hear about deals</h2>
              <p className="mt-3 text-[15.5px] text-sky-100/90">Subscribe for cleaning tips, new product drops and subscriber-only deals.</p>
              {done ? (
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-bold text-cobalt"><CheckCircle size={18} className="text-grass" /> Thanks for subscribing!</div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
                  <input type="email" required placeholder="you@email.co.za" className="h-[52px] flex-1 rounded-full border border-white/20 bg-white/10 px-5 text-[15px] text-white placeholder-white/55 outline-none focus:border-white focus:bg-white/15" />
                  <button type="submit" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-7 py-3.5 text-[15px] font-bold text-cobalt transition hover:bg-sky-50">Subscribe <ArrowRight size={17} /></button>
                </form>
              )}
              <p className="mt-3 text-[12px] text-sky-200/70">No spam. Unsubscribe anytime.</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

Object.assign(window, { WhyUs, Reviews, Newsletter });
