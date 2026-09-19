/* Amahle Blue Store — Manufacturing Process & Capability Page
 * Showcasing Ribbon Blender, Cage Mill, washing powder manufacturing capability & bulk supply.
 * 
 * MACHINE IMAGES:
 * Photos can be placed in assets/machines/:
 *   1. Ribbon Blender: assets/machines/ribbon-blender.jpg
 *   2. Cage Mill:      assets/machines/cage-mill.jpg
 * If the files are not yet present, a graceful, high-end industrial visual placeholder is shown.
 */

const MACHINE_IMAGES = {
  ribbonBlender: (window.__resources || {}).ribbonBlender || "assets/machines/ribbon-blender.jpg",
  cageMill: (window.__resources || {}).cageMill || "assets/machines/cage-mill.jpg",
};

/* ── Specialized Industrial Icons ────────────────────────────────────────────── */
const IconBlender = ({ size = 22, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M4 4h16l-1.5 10a5 5 0 0 1-5 4.3h-3a5 5 0 0 1-5-4.3L4 4z" />
    <path d="M9 4v4" />
    <path d="M15 4v4" />
    <path d="M7 21h10" />
    <path d="M12 18v3" />
    <path d="m9 9 6 3" />
    <path d="m15 9-6 3" />
  </svg>
);

const IconMill = ({ size = 22, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v5" />
    <path d="M12 16v5" />
    <path d="M3 12h5" />
    <path d="M16 12h5" />
    <path d="m5.6 5.6 3.6 3.6" />
    <path d="m14.8 14.8 3.6 3.6" />
    <path d="m18.4 5.6-3.6 3.6" />
    <path d="m9.2 14.8-3.6 3.6" />
  </svg>
);

const IconFactory = ({ size = 22, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4H2v16z" />
    <path d="M17 18h1" />
    <path d="M12 18h1" />
    <path d="M7 18h1" />
  </svg>
);

const IconLayers = ({ size = 22, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const IconCheckmark = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconScale = ({ size = 22, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);

const IconTarget = ({ size = 22, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const IconZap = ({ size = 22, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconBox = ({ size = 22, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

/* ── High-Impact Machine Image Viewer with Elegant Fallback ─────────────────── */
function MachinePhoto({ src, alt, title, subtitle, badgeText, machineType = "blender" }) {
  const [loadFailed, setLoadFailed] = React.useState(false);

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-900 shadow-2xl transition-all duration-300 hover:shadow-indigo-500/10">
      {/* Top status bar */}
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-ink/80 px-3.5 py-1.5 backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-grass animate-pulse" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-white/90">
          {badgeText}
        </span>
      </div>

      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-slate-900 via-ink to-slate-950 sm:aspect-[16/11]">
        {!loadFailed ? (
          <img
            src={src}
            alt={alt}
            onError={() => setLoadFailed(true)}
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          /* Graceful industrial blueprint illustration when photo file is awaiting upload */
          <div className="relative flex h-full w-full flex-col items-center justify-center p-8 text-center">
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-sky-300 shadow-inner backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
              {machineType === "blender" ? <IconBlender size={40} /> : <IconMill size={40} />}
            </div>
            <div className="relative z-10 mt-4 max-w-sm">
              <p className="font-display text-[18px] font-bold text-white tracking-wide">{title}</p>
              <p className="mt-1 text-[13px] text-sky-200/70">{subtitle}</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-mono text-slate-300">
                <span>Place file at:</span>
                <code className="text-sky-300">{src}</code>
              </div>
            </div>
          </div>
        )}

        {/* Subtle gradient vignette at bottom */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
      </div>

      {/* Caption strip */}
      <div className="flex items-center justify-between border-t border-white/10 bg-ink/95 px-6 py-3.5 text-[12.5px] text-slate-300 backdrop-blur-md">
        <span className="font-semibold text-white flex items-center gap-1.5">
          <Award size={14} className="text-sky-400" /> Amahle Blue Production Equipment
        </span>
        <span className="font-mono text-[11.5px] text-slate-400">Gauteng Manufacturing Unit</span>
      </div>
    </div>
  );
}

/* ── 8 Core Capabilities Data ────────────────────────────────────────────────── */
const CAPABILITIES = [
  {
    icon: IconBlender,
    title: "Consistent Batch Mixing",
    text: "Uniform distribution of active surfactants, builders, and fragrances throughout every production cycle, eliminating weak or uneven spots.",
    accent: "#1E50E0",
  },
  {
    icon: IconMill,
    title: "Better Material Uniformity",
    text: "Mechanical particle breakdown ensures uniform granulation, smooth texture, and identical bulk density from top to bottom of each batch.",
    accent: "#0EA5E9",
  },
  {
    icon: IconZap,
    title: "Efficient Powder Processing",
    text: "High-throughput industrial equipment minimizes batch transition intervals, reducing cycle times and optimizing manufacturing productivity.",
    accent: "#159A4C",
  },
  {
    icon: IconFactory,
    title: "Suitable for Bulk Production",
    text: "Robust machinery sized and calibrated to handle wholesale volumes, commercial laundry contracts, and continuous production demands.",
    accent: "#1A40B5",
  },
  {
    icon: IconLayers,
    title: "Reliable Manufacturing Workflow",
    text: "Standardized multi-stage processing from raw powder pre-screening through mill breakdown, ribbon blending, and controlled packaging.",
    accent: "#0B2545",
  },
  {
    icon: IconScale,
    title: "Focus on Quality & Consistency",
    text: "Strict monitoring of particle fineness, blend homogeneity, and moisture stability ensures dependable performance in every wash cycle.",
    accent: "#D97706",
  },
  {
    icon: IconBox,
    title: "Scalable Production Support",
    text: "Flexible batch capacity built to accommodate growing product lines, customized bulk client formulations, and rapid delivery timelines.",
    accent: "#2563EB",
  },
  {
    icon: IconTarget,
    title: "Better Operational Efficiency",
    text: "Optimized mechanical processing reduces energy usage, prevents raw material waste, and delivers exceptional value for trade partners.",
    accent: "#10B981",
  },
];

/* ── 5-Step Process Pipeline Data ────────────────────────────────────────────── */
const PROCESS_STEPS = [
  {
    step: "01",
    title: "Raw Material Preparation",
    desc: "Careful grading and pre-screening of raw washing powder constituents, active cleaning agents, and specialized additives.",
    highlight: "Quality Ingestion",
  },
  {
    step: "02",
    title: "Cage Mill Delumping & Sizing",
    desc: "Materials pass through high-speed counter-rotating cages to break down aggregates and achieve optimal particle fineness.",
    highlight: "Cage Mill Processing",
  },
  {
    step: "03",
    title: "Precision Ribbon Blending",
    desc: "The double-spiral ribbon agitator thoroughly folds and mixes the powder, ensuring completely homogeneous formulation.",
    highlight: "Ribbon Blender Agitation",
  },
  {
    step: "04",
    title: "Quality & Dissolution Check",
    desc: "Batch sampling verifies solubility speed, fragrance dispersion, moisture level, and active detergent consistency.",
    highlight: "Quality Verification",
  },
  {
    step: "05",
    title: "Commercial Packaging & Dispatch",
    desc: "Finished powder is carefully weighed and packaged in moisture-protected bags or bulk containers ready for supply across SA.",
    highlight: "Bulk & Retail Ready",
  },
];

/* ── Main Manufacturing Page Component ───────────────────────────────────────── */
function ManufacturingPage({ onGoHome }) {
  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      {/* ──────────────── 1. HERO SECTION ──────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-ink via-slate-900 to-ink text-white">
        {/* Subtle industrial background graphics */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="pointer-events-none absolute -right-36 -top-36 h-[560px] w-[560px] rounded-full bg-cobalt/20 blur-[120px]" />
        <div className="pointer-events-none absolute -left-36 bottom-0 h-[440px] w-[440px] rounded-full bg-grass/15 blur-[120px]" />

        <div className="relative mx-auto max-w-[1280px] px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-14">
          {/* Breadcrumb / Back button */}
          <button
            onClick={onGoHome}
            className="group mb-8 inline-flex items-center gap-2 text-[13.5px] font-semibold text-slate-300 transition-colors hover:text-white"
            aria-label="Back to store"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white transition-transform group-hover:-translate-x-1">
              <ArrowLeft size={15} />
            </span>
            <span>Back to Store</span>
          </button>

          <div className="max-w-3xl">
            {/* Pill */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-[12px] font-bold uppercase tracking-[0.2em] text-sky-300">
              <IconFactory size={15} className="text-sky-400" />
              <span>Industrial Manufacturing &amp; Quality</span>
            </div>

            {/* Headline */}
            <h1 className="mt-5 font-display text-[clamp(2.4rem,5.5vw,4.2rem)] font-extrabold leading-[1.03] tracking-tight text-white">
              How We Manufacture <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-200 to-white">
                Quality Washing Powder
              </span>
            </h1>

            {/* Subtext */}
            <p className="mt-6 text-[17.5px] leading-relaxed text-slate-300 sm:text-[19px]">
              Our production process is supported by reliable machinery and practical manufacturing methods that help us maintain better mixing, consistency, and efficient output.
            </p>

            {/* Quick metrics grid */}
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 border-t border-white/10 pt-8">
              <div>
                <p className="font-display text-[26px] sm:text-[30px] font-extrabold text-white">100%</p>
                <p className="text-[12.5px] font-semibold text-slate-400">Uniform Batch Mixing</p>
              </div>
              <div>
                <p className="font-display text-[26px] sm:text-[30px] font-extrabold text-sky-300">Cage Mill</p>
                <p className="text-[12.5px] font-semibold text-slate-400">Particle Breakdown</p>
              </div>
              <div>
                <p className="font-display text-[26px] sm:text-[30px] font-extrabold text-white">Ribbon</p>
                <p className="text-[12.5px] font-semibold text-slate-400">Spiral Blender Unit</p>
              </div>
              <div>
                <p className="font-display text-[26px] sm:text-[30px] font-extrabold text-grass">Gauteng</p>
                <p className="text-[12.5px] font-semibold text-slate-400">Proudly South African</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── 2. MACHINE SHOWCASE SECTION ──────────────── */}
      <section className="relative mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:py-24">
        {/* Section title */}
        <div className="max-w-3xl">
          <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-cobalt">
            Core Production Machinery
          </span>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold tracking-tight text-ink">
            Engineered Equipment for Superior Consistency
          </h2>
          <p className="mt-4 text-[16.5px] leading-relaxed text-slate-600">
            High-grade washing powder requires two fundamental mechanical stages: thorough particle de-lumping and exhaustive homogeneous blending. We utilize dedicated industrial machinery calibrated specifically to achieve these standards.
          </p>
        </div>

        {/* Machine 1: Ribbon Blender */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_8px_30px_rgb(11,37,69,0.05)] sm:p-10 lg:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Machine Photo */}
            <div className="lg:col-span-6">
              <MachinePhoto
                src={MACHINE_IMAGES.ribbonBlender}
                alt="Ribbon Blender used in washing powder manufacturing"
                title="Ribbon Blender"
                subtitle="High-Efficiency Spiral Agitator for Uniform Blending"
                badgeText="Mixing & Homogenization"
                machineType="blender"
              />
            </div>

            {/* Machine Copy & Specs */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-[12px] font-bold uppercase tracking-wider text-cobalt">
                <IconBlender size={15} /> Machine 01
              </div>

              <h3 className="mt-3 font-display text-[28px] font-extrabold text-ink sm:text-[34px]">
                Ribbon Blender
              </h3>
              <p className="text-[15px] font-semibold text-cobalt">
                Thorough &amp; Uniform Batch Mixing
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-[15.5px] leading-relaxed text-slate-700 border border-slate-100">
                <p className="font-medium">
                  “Our ribbon blender is used for thorough and uniform mixing of raw materials. It helps us achieve better consistency throughout the batch, ensuring that the washing powder is blended properly for reliable quality.”
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  {
                    title: "Counter-Directional Spiral Mixing",
                    desc: "Inner and outer helical ribbons move powder in opposite directions, producing complete 3D distribution without stagnant zones.",
                  },
                  {
                    title: "Identical Active Ingredient Dispersion",
                    desc: "Guarantees that cleaning surfactants, enzymes, brightening agents, and fresh fragrances are evenly distributed through every scoop.",
                  },
                  {
                    title: "Repeatable Batch Consistency",
                    desc: "Engineered agitation eliminates formulation variance between initial and final portions of a batch.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-grass/15 text-grass">
                      <IconCheckmark size={13} />
                    </span>
                    <div className="text-[14px]">
                      <span className="font-bold text-ink">{item.title}: </span>
                      <span className="text-slate-600">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-2.5">
                <span className="rounded-full bg-slate-100 px-3.5 py-1.5 text-[12px] font-semibold text-slate-700">
                  Zero Dead-Zone Trough
                </span>
                <span className="rounded-full bg-slate-100 px-3.5 py-1.5 text-[12px] font-semibold text-slate-700">
                  High-Capacity Mixing
                </span>
                <span className="rounded-full bg-slate-100 px-3.5 py-1.5 text-[12px] font-semibold text-slate-700">
                  Balanced Bulk Density
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Machine 2: Cage Mill */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-[0_8px_30px_rgb(11,37,69,0.05)] sm:p-10 lg:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Machine Copy & Specs (reversed on desktop for visual rhythm) */}
            <div className="order-2 lg:order-1 lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3.5 py-1 text-[12px] font-bold uppercase tracking-wider text-sky-700">
                <IconMill size={15} /> Machine 02
              </div>

              <h3 className="mt-3 font-display text-[28px] font-extrabold text-ink sm:text-[34px]">
                Cage Mill
              </h3>
              <p className="text-[15px] font-semibold text-sky-700">
                Particle Breakdown &amp; Material Refinement
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 p-5 text-[15.5px] leading-relaxed text-slate-700 border border-slate-100">
                <p className="font-medium">
                  “Our cage mill supports particle processing and material breakdown, helping improve the fineness and uniformity of the washing powder. This contributes to a more refined production process and better overall product preparation.”
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  {
                    title: "High-Impact Particle Delumping",
                    desc: "Rotational impact pins efficiently shatter compact granules and clumps before blending, preventing dense lumps in the final powder.",
                  },
                  {
                    title: "Rapid Water Dissolution",
                    desc: "Refined particle sizing allows the washing powder to dissolve rapidly in cold or warm wash cycles without leaving grimy residue on fabrics.",
                  },
                  {
                    title: "Smooth Flow & Free-Pouring Texture",
                    desc: "Provides a light, free-flowing powder texture that pours cleanly and packs securely into consumer and commercial packaging.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sky-600/15 text-sky-700">
                      <IconCheckmark size={13} />
                    </span>
                    <div className="text-[14px]">
                      <span className="font-bold text-ink">{item.title}: </span>
                      <span className="text-slate-600">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-2.5">
                <span className="rounded-full bg-slate-100 px-3.5 py-1.5 text-[12px] font-semibold text-slate-700">
                  Micro-Mesh Particle Fineness
                </span>
                <span className="rounded-full bg-slate-100 px-3.5 py-1.5 text-[12px] font-semibold text-slate-700">
                  De-Lumping Efficiency
                </span>
                <span className="rounded-full bg-slate-100 px-3.5 py-1.5 text-[12px] font-semibold text-slate-700">
                  High-Speed Impact Breakdown
                </span>
              </div>
            </div>

            {/* Machine Photo */}
            <div className="order-1 lg:order-2 lg:col-span-6">
              <MachinePhoto
                src={MACHINE_IMAGES.cageMill}
                alt="Cage Mill used in washing powder manufacturing"
                title="Cage Mill"
                subtitle="High-Velocity Pin Mill for Particle Refinement & Delumping"
                badgeText="Particle Sizing & Breakdown"
                machineType="mill"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── 3. CAPABILITIES SECTION ──────────────── */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-20 sm:py-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-cobalt">
              Manufacturing Capabilities
            </span>
            <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold tracking-tight text-ink">
              Built for Scale, Uniformity &amp; Output
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-slate-600">
              Our setup is specifically structured to meet the demands of regular commercial supply, bulk trade contracts, and consistent washing powder specifications.
            </p>
          </div>

          {/* 8-Card Capabilities Grid */}
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CAPABILITIES.map((cap, i) => (
              <div
                key={cap.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cobalt/30 hover:shadow-xl"
              >
                <div>
                  <div
                    className="grid h-12 w-12 place-items-center rounded-xl text-white transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${cap.accent}, ${cap.accent}dd)` }}
                  >
                    <cap.icon size={22} />
                  </div>
                  <h3 className="mt-5 font-display text-[17px] font-extrabold text-ink leading-snug">
                    {cap.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600">
                    {cap.text}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-cobalt opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span>Standard Standardized</span> <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── 4. PROCESS / STRENGTH SECTION ──────────────── */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 items-start">
            {/* Left Column: Strengths & Copy */}
            <div className="lg:col-span-5">
              <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-cobalt">
                Manufacturing Strengths
              </span>
              <h2 className="mt-3 font-display text-[clamp(1.85rem,3.8vw,2.7rem)] font-extrabold leading-tight tracking-tight text-ink">
                Practical Manufacturing with Dependable Output
              </h2>

              <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-slate-600">
                <p>
                  Our setup is designed to support efficient washing powder production with a focus on consistency, practical manufacturing, and dependable output. By using the right equipment in the process, we are able to improve blending quality, material handling, and production readiness for business requirements.
                </p>
                <p className="rounded-2xl border-l-4 border-cobalt bg-slate-50 p-4 font-medium text-slate-700">
                  “This helps us serve business needs more professionally, whether the requirement is for regular production, bulk supply, or a growing product line.”
                </p>
              </div>

              {/* Strength Highlights */}
              <div className="mt-8 space-y-3.5 border-t border-slate-100 pt-6">
                {[
                  "Practical, industrial machinery tailored for detergent manufacturing",
                  "Formulated for fast dissolution and high cleaning efficiency",
                  "Ready for commercial laundries, retailers & wholesale partners",
                  "Direct manufacturing facility based in Gauteng, South Africa",
                ].map((txt, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cobalt/10 text-cobalt">
                      <IconCheckmark size={12} />
                    </span>
                    <span className="text-[14px] font-medium text-slate-700">{txt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: 5-Step Process Pipeline */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white p-6 shadow-md sm:p-8">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <h3 className="font-display text-[19px] font-extrabold text-ink">
                    5-Stage Production Workflow
                  </h3>
                  <span className="rounded-full bg-cobalt/10 px-3 py-1 font-mono text-[11px] font-bold text-cobalt uppercase">
                    Continuous QC
                  </span>
                </div>

                <div className="mt-6 space-y-6">
                  {PROCESS_STEPS.map((step, i) => (
                    <div key={step.step} className="relative flex items-start gap-4">
                      {/* Step Number Circle */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink font-display text-[15px] font-extrabold text-white shadow-md">
                        {step.step}
                      </div>

                      {/* Content */}
                      <div className="flex-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="font-display text-[15.5px] font-extrabold text-ink">
                            {step.title}
                          </h4>
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                            {step.highlight}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── 5. TRUST / IMPRESSION SECTION ──────────────── */}
      <section className="bg-gradient-to-b from-sky-50/50 via-white to-white py-20 border-t border-slate-100">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-cobalt">
              Why Our Process Matters
            </span>
            <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold tracking-tight text-ink">
              Manufacturing with Practical Capability
            </h2>
            <p className="mt-4 text-[16.5px] leading-relaxed text-slate-600">
              The right machinery plays an important role in achieving reliable product quality. Our process is built around practical manufacturing capability, helping us deliver washing powder production with better consistency, efficiency, and confidence.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-cobalt">
                <Shield size={26} />
              </span>
              <h3 className="mt-5 font-display text-[18px] font-extrabold text-ink">
                Built for Better Consistency
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
                Every batch is mechanically regulated through precision blending and particle breakdown, eliminating formulation variances.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-grass">
                <Truck size={26} />
              </span>
              <h3 className="mt-5 font-display text-[18px] font-extrabold text-ink">
                Ready for Bulk &amp; Trade
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
                Whether you need regular wholesale supply, commercial laundry containers, or retail packaging, our setup is equipped to deliver.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sky-50 text-sky-600">
                <Award size={26} />
              </span>
              <h3 className="mt-5 font-display text-[18px] font-extrabold text-ink">
                Local South African Production
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
                Manufactured locally in Boksburg, Gauteng, giving you direct factory access, fast fulfillment, and responsive customer service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── 6. CTA SECTION ──────────────── */}
      <section className="bg-white pb-20 sm:pb-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-slate-900 to-cobalt px-6 py-14 text-center sm:px-12 sm:py-16 text-white shadow-2xl">
            {/* Pattern */}
            <div
              className="pointer-events-none absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            <div className="relative mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-[12px] font-bold uppercase tracking-wider text-sky-200">
                <Whatsapp size={15} /> Manufacturing Inquiries
              </span>

              <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-tight text-white">
                Want to Know More About Our Manufacturing Capability?
              </h2>

              <p className="mt-4 text-[16.5px] leading-relaxed text-sky-100/90">
                Looking to work with us? Get in touch with us for product specifications, bulk trade pricing, or washing powder contract supply.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
                <a
                  href={`${BRAND.wa}?text=${encodeURIComponent(
                    "Hi Amahle Blue, I'm interested in learning more about your washing powder manufacturing capability and bulk supply."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-full bg-grass px-8 py-4 text-[15px] font-bold text-white shadow-[0_12px_28px_rgba(21,154,76,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-600 active:scale-95"
                >
                  <Whatsapp size={20} />
                  <span>Inquire on WhatsApp</span>
                </a>

                <a
                  href={`tel:${BRAND.phoneRaw}`}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-4 text-[15px] font-bold text-white transition-all duration-200 hover:bg-white/20 hover:border-white/30 active:scale-95"
                >
                  <Phone size={17} />
                  <span>Call {BRAND.phone}</span>
                </a>

                <a
                  href={`mailto:${BRAND.email}?subject=${encodeURIComponent(
                    "Washing Powder Manufacturing Inquiry"
                  )}`}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-7 py-4 text-[15px] font-bold text-white transition-all duration-200 hover:bg-white/20 hover:border-white/30 active:scale-95"
                >
                  <Mail size={17} />
                  <span>Email Us</span>
                </a>
              </div>

              <p className="mt-6 text-[13px] text-slate-300">
                Facility address: {BRAND.address}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* Export to global window so it is accessible to StoreRouter */
Object.assign(window, { ManufacturingPage, MACHINE_IMAGES });
