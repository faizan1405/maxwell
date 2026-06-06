/* Header (scroll-aware sticky) + Hero + Trust bar */

const WA_LINK = "https://wa.me/27671014345";

const NAV = [
  { label: "Home", href: "#top" },
  { label: "Products", href: "#products" },
  { label: "About", href: "#about" },
  { label: "Markets", href: "#markets" },
  { label: "Contact", href: "#stockist" },
];

const Wordmark = ({ className = "" }) => (
  <a href="#top" className={`group flex items-center gap-2.5 ${className}`}>
    <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-electric to-blue shadow-[0_8px_24px_-8px_rgba(30,144,255,0.8)]">
      <IconDroplet size={18} className="text-white" strokeWidth={2.4} />
    </span>
    <span className="font-display text-[19px] font-extrabold uppercase leading-none tracking-[0.04em] text-white">
      Amahle <span className="text-electric">Blue</span>
    </span>
  </a>
);

const Header = () => {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(10,25,41,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 py-4">
        <Wordmark />
        <nav className="hidden items-center gap-9 lg:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-sm font-semibold text-silver transition-colors hover:text-white">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="#stockist"
            className="hidden sm:inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-whatsapp px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(37,211,102,0.9)] transition-transform hover:-translate-y-0.5"
          >
            <IconWhatsapp size={16} />
            Get Bulk Quote
          </a>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/12 bg-white/5 text-white lg:hidden"
            aria-label="Menu"
          >
            {open ? <IconX size={20} /> : <IconMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className="lg:hidden overflow-hidden transition-[max-height] duration-300"
        style={{ maxHeight: open ? 420 : 0, background: "rgba(10,25,41,0.97)", backdropFilter: "blur(14px)" }}
      >
        <nav className="flex flex-col gap-1 px-5 pb-6 pt-2">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-base font-semibold text-silver hover:bg-white/5 hover:text-white">
              {n.label}
            </a>
          ))}
          <a href="#stockist" onClick={() => setOpen(false)} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp px-5 py-3 text-base font-bold text-white">
            <IconWhatsapp size={18} /> Get Bulk Quote
          </a>
        </nav>
      </div>
    </header>
  );
};

const Hero = () => (
  <section id="top" className="relative isolate min-h-[100svh] overflow-hidden">
    {/* Background image placeholder + overlays */}
    <div className="absolute inset-0">
      <Placeholder dark label="HERO · CAR DETAILING / PRODUCT LINE-UP" rounded="rounded-none" className="h-full w-full" />
    </div>
    <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, #0A1929 18%, rgba(10,25,41,0.92) 46%, rgba(10,25,41,0.45) 78%, rgba(10,25,41,0.2) 100%)" }} />
    <div className="absolute inset-0" style={{ background: "radial-gradient(80% 60% at 12% 0%, rgba(30,144,255,0.22), transparent 55%)" }} />
    <div className="pointer-events-none absolute -left-40 top-1/3 h-[520px] w-[520px] rounded-full" style={{ background: "radial-gradient(circle, rgba(37,99,235,0.35), transparent 65%)", filter: "blur(40px)" }} />

    <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-5 sm:px-8 pt-28 pb-16">
      <div className="max-w-3xl">
        <Reveal>
          <Pill><span className="h-1.5 w-1.5 rounded-full bg-electric" /> Locally manufactured · Gauteng, SA</Pill>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 font-display text-[clamp(2.6rem,7.5vw,5.4rem)] font-black uppercase leading-[0.92] tracking-[-0.02em] text-white">
            Expect clean.<br />
            <span className="text-electric">Accept</span> nothing<br className="hidden sm:block" /> else.
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-silver sm:text-xl">
            Premium cleaning &amp; car-care chemicals, manufactured in Gauteng since 2019 — formulated to perform for the businesses that depend on clean.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="#products" className="group inline-flex items-center justify-center gap-2 rounded-full bg-blue px-7 py-3.5 text-base font-bold text-white shadow-[0_18px_40px_-14px_rgba(37,99,235,0.95)] transition-all hover:-translate-y-0.5 hover:bg-electric">
              Browse Products
              <IconArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-base font-bold text-white backdrop-blur-sm transition-colors hover:border-whatsapp hover:text-whatsapp">
              <IconWhatsapp size={18} />
              Request Bulk Quote
            </a>
          </div>
        </Reveal>
      </div>
    </div>

    {/* corner label for the hero photo zone */}
    <div className="absolute bottom-6 right-6 hidden font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 md:block">
      scroll ↓
    </div>
  </section>
);

const TRUST = [
  { icon: IconFactory, label: "Locally Manufactured", sub: "Proudly made in SA 🇿🇦" },
  { icon: IconCalendar, label: "Established 2019", sub: "Boksburg, Gauteng" },
  { icon: IconTruck, label: "Bulk Supply Across SA", sub: "Reliable, scalable volumes" },
  { icon: IconShieldCheck, label: "Quality & Compliance", sub: "Consistent, tested batches" },
];

const STATS = [
  { to: 5, suffix: "+", label: "Years manufacturing", tail: "since 2019" },
  { to: 50, suffix: "+", label: "Products & formulations", tail: "across 7 categories" },
  { to: 100, suffix: "%", label: "Local production", tail: "made in Gauteng" },
];

const TrustBar = () => (
  <section className="relative border-y border-white/8 bg-navy">
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <div className="grid grid-cols-2 gap-px overflow-hidden lg:grid-cols-4" style={{ background: "rgba(255,255,255,0.06)" }}>
        {TRUST.map((t, i) => (
          <Reveal key={t.label} delay={i * 70} className="bg-navy">
            <div className="flex items-center gap-4 px-5 py-7 sm:px-7">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-electric">
                <t.icon size={22} />
              </span>
              <div>
                <div className="font-display text-sm font-bold uppercase tracking-wide text-white">{t.label}</div>
                <div className="text-[13px] text-silver">{t.sub}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-px overflow-hidden border-t border-white/8 sm:grid-cols-3" style={{ background: "rgba(255,255,255,0.06)" }}>
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 90} className="bg-navy">
            <div className="px-6 py-10 text-center">
              <div className="font-display text-5xl font-black tracking-tight text-white sm:text-6xl">
                <Counter to={s.to} suffix={s.suffix} />
              </div>
              <div className="mt-2 font-display text-sm font-bold uppercase tracking-wide text-electric">{s.label}</div>
              <div className="text-[13px] text-silver">{s.tail}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

Object.assign(window, { Header, Hero, TrustBar, WA_LINK });
