/* Shared UI primitives: Reveal (rise-in), Counter (count-up), Placeholder image, Pill,
   FadeReveal (opacity+rise), SkeletonBox (shimmer loader), PageEnter (page transition) */

/* Robust in-view arming. Content is ALWAYS rendered opaque (see Reveal); this hook
   only decides when to play the gentle rise. Multiple initial checks + scroll/resize
   + fonts.ready + a safety timeout guarantee nothing ever stays in its pre-animation
   offset, and screenshots/headless captures always show opaque content. */
function useInView(threshold = 1.0, safety = 1400) {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    let done = false;
    const arm = () => { if (done) return; done = true; setInView(true); teardown(); };
    const check = () => {
      if (done || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh * threshold && r.bottom > -40) arm();
    };
    const timers = [requestAnimationFrame(check), setTimeout(check, 120), setTimeout(check, 450), setTimeout(arm, safety)];
    function teardown() {
      timers.forEach((t) => { cancelAnimationFrame(t); clearTimeout(t); });
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    }
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(check);
    return teardown;
  }, [threshold, safety]);
  return [ref, inView];
}

/* Gentle entrance: NEVER fades opacity (so content is always visible in any capture);
   only a small vertical rise that settles to 0. */
const Reveal = ({ children, className = "", delay = 0, y = 22, as = "div" }) => {
  const [ref, vis] = useInView();
  const Tag = as;
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        transition: "transform .7s cubic-bezier(.16,1,.3,1)",
        transitionDelay: `${delay}ms`,
        transform: vis ? "translateY(0)" : `translateY(${y}px)`,
      }}
    >
      {children}
    </Tag>
  );
};

const Counter = ({ to, duration = 1700, prefix = "", suffix = "" }) => {
  const [ref, vis] = useInView();
  const [val, setVal] = React.useState(0);
  const started = React.useRef(false);
  React.useEffect(() => {
    if (!vis || started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // Safety: guarantee the final value lands even if rAF is throttled (headless/offscreen)
    const safe = setTimeout(() => setVal(to), duration + 250);
    return () => clearTimeout(safe);
  }, [vis, to, duration]);
  return <span ref={ref}>{prefix}{val}{suffix}</span>;
};

/* Honest placeholder zone for where real studio photography goes */
const Placeholder = ({ label, className = "", dark = true, rounded = "rounded-2xl" }) => (
  <div
    className={`relative overflow-hidden ${rounded} ${className}`}
    style={{ background: dark ? "linear-gradient(135deg,#0F2C50 0%,#0A1929 100%)" : "linear-gradient(135deg,#dde7f1 0%,#c4d3e2 100%)" }}
  >
    <div
      className="absolute inset-0"
      style={{ backgroundImage: `repeating-linear-gradient(45deg, ${dark ? "rgba(255,255,255,0.045)" : "rgba(13,36,64,0.06)"} 0 12px, transparent 12px 24px)` }}
    />
    {dark && (
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 70% 0%, rgba(30,144,255,0.18), transparent 60%)" }} />
    )}
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <span
        className="font-mono text-[10px] sm:text-[11px] tracking-[0.28em] uppercase px-3 py-1.5 rounded-full backdrop-blur-sm text-center"
        style={dark
          ? { color: "rgba(186,210,236,0.85)", background: "rgba(10,25,41,0.45)", border: "1px solid rgba(255,255,255,0.12)" }
          : { color: "rgba(31,52,77,0.7)", background: "rgba(255,255,255,0.55)", border: "1px solid rgba(13,36,64,0.12)" }}
      >
        {label}
      </span>
    </div>
  </div>
);

const Pill = ({ children, className = "" }) => (
  <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/12 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-electric ${className}`}>
    {children}
  </span>
);

/* FadeReveal: opacity + rise for non-critical decorative elements.
   Unlike Reveal, starts at opacity:0 — do NOT use for primary text content
   that must be visible to crawlers before JS executes. */
const FadeReveal = ({ children, className = "", delay = 0, y = 16, as = "div" }) => {
  const [ref, vis] = useInView();
  const Tag = as;
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        transition: `opacity .55s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)`,
        transitionDelay: `${delay}ms`,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : `translateY(${y}px)`,
      }}
    >
      {children}
    </Tag>
  );
};

/* SkeletonBox: shimmer loading placeholder */
const SkeletonBox = ({ className = "", rounded = "rounded-xl" }) => (
  <div className={`ab-skeleton ${rounded} ${className}`} aria-hidden="true" />
);

/* ProductCardSkeleton: matches ProductCard dimensions */
const ProductCardSkeleton = () => (
  <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(11,46,107,0.04)]">
    <SkeletonBox className="aspect-[3/4] w-full" rounded="rounded-none" />
    <div className="flex flex-col p-4 gap-3">
      <SkeletonBox className="h-3 w-16" />
      <SkeletonBox className="h-5 w-4/5" />
      <SkeletonBox className="h-3 w-full" />
      <SkeletonBox className="h-3 w-3/5" />
      <div className="mt-2 flex items-end justify-between">
        <SkeletonBox className="h-7 w-20" />
        <SkeletonBox className="h-5 w-14" />
      </div>
      <SkeletonBox className="h-10 w-full rounded-full" />
    </div>
  </div>
);

/* PageEnter: wraps page content with entrance animation */
const PageEnter = ({ children, className = "" }) => (
  <div className={`ab-page-enter ${className}`}>
    {children}
  </div>
);

Object.assign(window, { Reveal, Counter, Placeholder, Pill, useInView, FadeReveal, SkeletonBox, ProductCardSkeleton, PageEnter });
