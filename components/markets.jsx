/* Target Markets (B2B)  +  Testimonials (placeholder) */

const MARKETS = [
  { icon: IconCar, title: "Carwashes & Detailing Centres", body: "High-foam shampoos, polishes and tyre shine that move volume and keep customers coming back." },
  { icon: IconShirt, title: "Laundromats & Industrial Laundry", body: "Powerful, fabric-safe detergents and boosters formulated for heavy daily loads." },
  { icon: IconBuilding, title: "Contract Cleaning Companies", body: "Dependable, cost-effective cleaners and degreasers across every site you service." },
  { icon: IconHome, title: "Households & General Cleaning", body: "Premium everyday cleaners that bring professional results into the home." },
];

const Markets = () => (
  <section id="markets" className="relative overflow-hidden bg-midnight py-24 sm:py-32">
    <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2" style={{ background: "radial-gradient(50% 100% at 50% 0%, rgba(37,99,235,0.18), transparent 70%)" }} />
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal className="flex justify-center"><Pill>Built for business</Pill></Reveal>
        <Reveal delay={70}>
          <h2 className="mt-5 font-display text-[clamp(2rem,4.8vw,3.4rem)] font-black uppercase leading-[0.98] tracking-[-0.01em] text-white">
            Built for businesses that<br className="hidden sm:block" /> depend on clean.
          </h2>
        </Reveal>
        <Reveal delay={130}>
          <p className="mt-5 text-lg leading-relaxed text-silver">
            When clean is your reputation, your chemicals can't be the weak link. We supply the operations that can't afford to compromise.
          </p>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {MARKETS.map((m, i) => (
          <Reveal key={m.title} delay={i * 80}>
            <div className="group relative h-full overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-electric/40">
              <div className="absolute inset-x-0 -top-px h-px scale-x-0 bg-gradient-to-r from-transparent via-electric to-transparent transition-transform duration-500 group-hover:scale-x-100" />
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue/30 to-electric/10 text-electric ring-1 ring-white/10">
                <m.icon size={28} />
              </span>
              <h3 className="mt-6 font-display text-lg font-bold leading-tight text-white">{m.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-silver">{m.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ---------------- Testimonials (placeholder) ---------------- */

const QUOTES = [
  { quote: "Switched our whole wash bay over and the foam and finish speak for themselves. Bulk delivery has never let us down.", name: "Carwash Owner", role: "Detailing Centre · Gauteng", initials: "CW" },
  { quote: "Consistent batches and a detergent that handles our daily load volumes. Exactly what an industrial laundry needs.", name: "Laundromat Manager", role: "Industrial Laundry · Gauteng", initials: "LM" },
  { quote: "Their degreasers cut our product spend without cutting performance, and the technical advice is genuinely useful.", name: "Operations Lead", role: "Contract Cleaning Co. · Gauteng", initials: "CC" },
];

const Testimonials = () => (
  <section className="bg-offwhite py-24 sm:py-32">
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-blue/20 bg-blue/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue">
            Social Proof
          </span>
        </Reveal>
        <Reveal delay={70}>
          <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-black uppercase leading-[1.02] tracking-[-0.01em] text-midnight">
            Trusted by businesses across Gauteng
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <span className="rounded-full bg-amber-100 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-700">
            Placeholder testimonials — to be replaced with real client quotes
          </span>
        </Reveal>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {QUOTES.map((q, i) => (
          <Reveal key={q.name} delay={i * 90}>
            <figure className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_1px_2px_rgba(13,36,64,0.04)]">
              <IconQuote size={34} className="text-blue/25" />
              <blockquote className="mt-4 flex-1 text-[17px] leading-relaxed text-midnight">"{q.quote}"</blockquote>
              <div className="mt-5 flex items-center gap-2 text-amber-400">
                {[0, 1, 2, 3, 4].map((s) => <IconStar key={s} size={16} />)}
              </div>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-blue to-electric font-display text-sm font-bold text-white">
                  {q.initials}
                </span>
                <span>
                  <span className="block font-display text-sm font-bold text-midnight">{q.name}</span>
                  <span className="block text-[13px] text-slate-500">{q.role}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

Object.assign(window, { Markets, Testimonials });
