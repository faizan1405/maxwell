/* Stockist / Bulk Buyer CTA form  +  Footer  +  Floating WhatsApp */

const PRODUCT_INTEREST = [
  "Household Products",
  "Industrial Cleaners & Degreasers",
  "Car Shampoo",
  "Car Polish",
  "Interior Car Products",
  "Exterior Car Products",
  "Tyres & Wheels Products",
  "Full range / not sure yet",
];

const Field = ({ label, children, full }) => (
  <label className={`flex flex-col gap-2 ${full ? "sm:col-span-2" : ""}`}>
    <span className="text-[13px] font-bold uppercase tracking-wide text-white/80">{label}</span>
    {children}
  </label>
);

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-[15px] text-white placeholder-white/45 outline-none transition focus:border-white focus:bg-white/15";

const Stockist = () => {
  const [sent, setSent] = React.useState(false);
  const submit = (e) => { e.preventDefault(); setSent(true); };

  return (
    <section id="stockist" className="relative overflow-hidden py-24 sm:py-32" style={{ background: "linear-gradient(135deg,#2563EB 0%,#1E90FF 55%,#1567c9 100%)" }}>
      <div className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 14px, transparent 14px 28px)" }} />
      <div className="pointer-events-none absolute -right-32 -top-32 h-[460px] w-[460px] rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-start gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div className="lg:pt-6">
          <Reveal>
            <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              Become a stockist
            </span>
          </Reveal>
          <Reveal delay={70}>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.8vw,3.4rem)] font-black uppercase leading-[0.98] tracking-[-0.01em] text-white">
              Let's talk bulk pricing.
            </h2>
          </Reveal>
          <Reveal delay={130}>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/85">
              Tell us about your operation and what you're looking to stock. Our team will come back with bulk pricing and the right products for your volumes — fast.
            </p>
          </Reveal>
          <Reveal delay={190}>
            <div className="mt-8 space-y-3">
              {[
                { icon: IconPhone, text: "067 101 4345", href: "tel:+27671014345" },
                { icon: IconMail, text: "info@amahle-blue.co.za", href: "mailto:info@amahle-blue.co.za" },
                { icon: IconMapPin, text: "Unit H, 13 Main Reef Rd, Boksburg, Johannesburg, 1619", href: null },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-3 text-white">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15"><c.icon size={18} /></span>
                  {c.href ? <a href={c.href} className="font-semibold hover:underline">{c.text}</a> : <span className="font-semibold">{c.text}</span>}
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="rounded-3xl border border-white/15 bg-white/[0.08] p-6 backdrop-blur-md sm:p-8">
            {sent ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-blue">
                  <IconCheckCircle size={34} />
                </span>
                <h3 className="mt-6 font-display text-2xl font-black uppercase text-white">Request received</h3>
                <p className="mt-3 max-w-xs text-white/85">Thanks — our team will be in touch shortly with bulk pricing tailored to your business.</p>
                <button onClick={() => setSent(false)} className="mt-7 rounded-full bg-white px-6 py-3 text-sm font-bold text-blue">Send another request</button>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                <Field label="Name"><input required className={inputCls} placeholder="Your full name" /></Field>
                <Field label="Business"><input className={inputCls} placeholder="Company / trading name" /></Field>
                <Field label="Email"><input type="email" required className={inputCls} placeholder="you@business.co.za" /></Field>
                <Field label="Phone"><input className={inputCls} placeholder="067 000 0000" /></Field>
                <Field label="Product interest" full>
                  <div className="relative">
                    <select required defaultValue="" className={`${inputCls} appearance-none pr-10`}>
                      <option value="" disabled className="text-slate-500">Select a category…</option>
                      {PRODUCT_INTEREST.map((p) => <option key={p} value={p} className="text-midnight">{p}</option>)}
                    </select>
                    <IconChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/70" />
                  </div>
                </Field>
                <Field label="Message" full>
                  <textarea rows={4} className={`${inputCls} resize-none`} placeholder="Volumes, current products, delivery area…" />
                </Field>
                <button type="submit" className="group sm:col-span-2 mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-midnight px-7 py-4 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-navy">
                  Request Bulk Pricing
                  <IconArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-[#06121f] pt-16">
    <div className="mx-auto max-w-7xl px-5 sm:px-8">
      <div className="grid gap-10 border-b border-white/8 pb-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Wordmark />
          <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-silver">
            Premium, locally-manufactured cleaning &amp; car-care chemicals. Expect clean — accept nothing else.
          </p>
          <p className="mt-5 font-display text-sm font-bold uppercase tracking-wide text-electric">
            Expect clean. Accept nothing else.
          </p>
        </div>

        <div className="lg:col-span-3">
          <h4 className="font-display text-sm font-bold uppercase tracking-wide text-white">Explore</h4>
          <ul className="mt-4 space-y-2.5">
            {NAV.map((n) => (
              <li key={n.href}><a href={n.href} className="text-[15px] text-silver transition-colors hover:text-white">{n.label}</a></li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-4">
          <h4 className="font-display text-sm font-bold uppercase tracking-wide text-white">Get in touch</h4>
          <ul className="mt-4 space-y-3 text-[15px] text-silver">
            <li className="flex items-start gap-3"><IconMapPin size={18} className="mt-0.5 shrink-0 text-electric" /> Unit H, 13 Main Reef Rd, Boksburg, Johannesburg, 1619</li>
            <li className="flex items-center gap-3"><IconPhone size={18} className="shrink-0 text-electric" /> <a href="tel:+27671014345" className="hover:text-white">067 101 4345</a></li>
            <li className="flex items-center gap-3"><IconMail size={18} className="shrink-0 text-electric" /> <a href="mailto:info@amahle-blue.co.za" className="hover:text-white">info@amahle-blue.co.za</a></li>
          </ul>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-white/5 text-white transition-colors hover:border-electric hover:text-electric" aria-label="Facebook">
            <IconFacebook size={20} />
          </a>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 py-7 text-[13px] text-silver sm:flex-row">
        <span>© 2026 Amahle Blue. All rights reserved.</span>
        <span className="font-mono uppercase tracking-[0.15em] text-white/30">Made in Gauteng, South Africa 🇿🇦</span>
      </div>
    </div>
  </footer>
);

const WhatsappFloat = () => (
  <a
    href={WA_LINK}
    target="_blank"
    rel="noopener noreferrer"
    className="group fixed bottom-5 right-5 z-50 inline-flex items-center gap-0 overflow-hidden rounded-full bg-whatsapp px-4 py-4 text-white shadow-[0_16px_40px_-10px_rgba(37,211,102,0.8)] transition-all hover:px-5"
    aria-label="Chat on WhatsApp"
  >
    <IconWhatsapp size={26} />
    <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold opacity-0 transition-all duration-300 group-hover:ml-2.5 group-hover:max-w-[140px] group-hover:opacity-100">
      Chat with us
    </span>
  </a>
);

Object.assign(window, { Stockist, Footer, WhatsappFloat });
