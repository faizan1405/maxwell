/* About / Why Us  +  Filterable Product Categories grid */

const USPS = [
  { icon: IconFlask, title: "Market-leading formulations", body: "Chemistry built to outperform — high actives, real results, batch after batch." },
  { icon: IconShieldCheck, title: "Strict quality control", body: "Every batch is tested for consistency, safety and performance before it ships." },
  { icon: IconHeadphones, title: "Technical support & advice", body: "Dilution ratios, application methods and product selection — we guide your team." },
  { icon: IconTruck, title: "Flexible bulk supply", body: "From 5L to bulk drums and IBCs, scaled to your operation and topped up on time." },
  { icon: IconLeaf, title: "Environmentally conscious R&D", body: "Responsible raw materials and biodegradable options, without compromising power." },
];

const About = () => (
  <section id="about" className="relative overflow-hidden bg-midnight py-24 sm:py-32">
    <div className="pointer-events-none absolute right-0 top-0 h-[420px] w-[420px]" style={{ background: "radial-gradient(circle at 70% 30%, rgba(30,144,255,0.14), transparent 60%)" }} />
    <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16">
      {/* Left: story + visual */}
      <div className="lg:col-span-5">
        <Reveal><Pill>Why Amahle Blue</Pill></Reveal>
        <Reveal delay={70}>
          <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.1rem)] font-black uppercase leading-[0.98] tracking-[-0.01em] text-white">
            Chemistry that earns its place on the shelf.
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="mt-6 text-lg leading-relaxed text-silver">
            Founded in 2019 in Boksburg, Gauteng, Amahle Blue manufactures premium cleaning and car-care chemicals for businesses and households across South Africa. We exist because "good enough" never built a reputation — so we formulate, test and bottle products our customers can trust on every job.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-4 text-lg leading-relaxed text-silver">
            Locally made, rigorously controlled and supplied at scale — that's the standard behind the name.
          </p>
        </Reveal>
        <Reveal delay={260}>
          <div className="mt-8">
            <Placeholder dark label="FACILITY · MANUFACTURING / BLENDING LINE" className="aspect-[16/10] w-full" />
          </div>
        </Reveal>
      </div>

      {/* Right: USP list */}
      <div className="lg:col-span-7">
        <div className="grid gap-4 sm:grid-cols-2">
          {USPS.map((u, i) => (
            <Reveal key={u.title} delay={i * 80}>
              <div className="group h-full rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-electric/40 hover:bg-white/[0.06]">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue/25 to-electric/15 text-electric ring-1 ring-white/10">
                  <u.icon size={24} />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-white">{u.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-silver">{u.body}</p>
              </div>
            </Reveal>
          ))}
          <Reveal delay={USPS.length * 80}>
            <a href="#stockist" className="group flex h-full min-h-[140px] flex-col justify-between rounded-2xl bg-gradient-to-br from-blue to-electric p-6 text-white shadow-[0_24px_60px_-26px_rgba(37,99,235,0.9)]">
              <span className="font-display text-lg font-bold leading-snug">Need volume pricing for your business?</span>
              <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                Become a stockist <IconArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
);

/* ---------------- Products ---------------- */

const PRODUCTS = [
  { name: "Household Products", group: "Household", icon: IconHome, benefit: "Surface, floor & multi-purpose cleaners that actually perform.", tag: "Everyday clean" },
  { name: "Industrial Cleaners & Degreasers", group: "Industrial", icon: IconFactory, benefit: "Heavy-duty degreasing power for workshops, plants & fleets.", tag: "Heavy duty" },
  { name: "Car Shampoo", group: "Car Care", icon: IconDroplet, benefit: "High-foam, pH-balanced wash that lifts grime without stripping wax.", tag: "Wash" },
  { name: "Car Polish", group: "Car Care", icon: IconSparkles, benefit: "Showroom-grade gloss and paint protection in every bottle.", tag: "Gloss" },
  { name: "Interior Car Products", group: "Car Care", icon: IconCar, benefit: "Dashboards, trim & upholstery cleaned, conditioned and protected.", tag: "Interior" },
  { name: "Exterior Car Products", group: "Car Care", icon: IconBeaker, benefit: "Bug, tar and traffic-film removal for a flawless finish.", tag: "Exterior" },
  { name: "Tyres & Wheels Products", group: "Car Care", icon: IconShieldCheck, benefit: "Deep-clean wheels and rich, long-lasting tyre shine.", tag: "Wheels" },
];

const TABS = ["All", "Household", "Industrial", "Car Care"];

const ProductCard = ({ p }) => (
  <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(13,36,64,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(13,36,64,0.4)]">
    <div className="relative">
      <Placeholder dark={false} rounded="rounded-none" label={`PRODUCT · ${p.tag.toUpperCase()}`} className="aspect-[4/3] w-full" />
      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-midnight/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-electric backdrop-blur-sm">
        {p.group}
      </span>
      <span className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-xl bg-white/90 text-blue shadow-sm backdrop-blur-sm">
        <p.icon size={20} />
      </span>
    </div>
    <div className="flex flex-1 flex-col p-6">
      <h3 className="font-display text-lg font-extrabold leading-tight text-midnight">{p.name}</h3>
      <p className="mt-2 flex-1 text-[15px] leading-relaxed text-slate-500">{p.benefit}</p>
      <a href="#stockist" className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border-2 border-blue px-5 py-2.5 text-sm font-bold text-blue transition-all group-hover:bg-blue group-hover:text-white">
        Get Quote <IconArrowRight size={16} />
      </a>
    </div>
  </div>
);

const Products = () => {
  const [tab, setTab] = React.useState("All");
  const shown = tab === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.group === tab);
  return (
    <section id="products" className="bg-offwhite py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <Reveal><span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-blue/20 bg-blue/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue">Our Range</span></Reveal>
            <Reveal delay={70}>
              <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.2rem)] font-black uppercase leading-[0.98] tracking-[-0.01em] text-midnight">
                A full range, one standard.
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="mt-4 text-lg leading-relaxed text-slate-500">
                Seven categories spanning home, industry and the complete car-care line — every product engineered to the same premium benchmark.
              </p>
            </Reveal>
          </div>
          <Reveal delay={120} className="w-full md:w-auto">
            <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1.5">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${tab === t ? "bg-blue text-white shadow-[0_10px_24px_-12px_rgba(37,99,235,0.9)]" : "text-slate-500 hover:bg-slate-100 hover:text-midnight"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p, i) => (
            <Reveal key={p.name} delay={(i % 3) * 80}>
              <ProductCard p={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

Object.assign(window, { About, Products });
