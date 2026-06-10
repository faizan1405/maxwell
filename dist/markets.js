/* Target Markets (B2B)  +  Testimonials (placeholder) */

"use strict";

var MARKETS = [{ icon: IconCar, title: "Carwashes & Detailing Centres", body: "High-foam shampoos, polishes and tyre shine that move volume and keep customers coming back." }, { icon: IconShirt, title: "Laundromats & Industrial Laundry", body: "Powerful, fabric-safe detergents and boosters formulated for heavy daily loads." }, { icon: IconBuilding, title: "Contract Cleaning Companies", body: "Dependable, cost-effective cleaners and degreasers across every site you service." }, { icon: IconHome, title: "Households & General Cleaning", body: "Premium everyday cleaners that bring professional results into the home." }];

var Markets = function Markets() {
  return React.createElement(
    "section",
    { id: "markets", className: "relative overflow-hidden bg-midnight py-24 sm:py-32" },
    React.createElement("div", { className: "pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2", style: { background: "radial-gradient(50% 100% at 50% 0%, rgba(37,99,235,0.18), transparent 70%)" } }),
    React.createElement(
      "div",
      { className: "mx-auto max-w-7xl px-5 sm:px-8" },
      React.createElement(
        "div",
        { className: "mx-auto max-w-3xl text-center" },
        React.createElement(
          Reveal,
          { className: "flex justify-center" },
          React.createElement(
            Pill,
            null,
            "Built for business"
          )
        ),
        React.createElement(
          Reveal,
          { delay: 70 },
          React.createElement(
            "h2",
            { className: "mt-5 font-display text-[clamp(2rem,4.8vw,3.4rem)] font-black uppercase leading-[0.98] tracking-[-0.01em] text-white" },
            "Built for businesses that",
            React.createElement("br", { className: "hidden sm:block" }),
            " depend on clean."
          )
        ),
        React.createElement(
          Reveal,
          { delay: 130 },
          React.createElement(
            "p",
            { className: "mt-5 text-lg leading-relaxed text-silver" },
            "When clean is your reputation, your chemicals can't be the weak link. We supply the operations that can't afford to compromise."
          )
        )
      ),
      React.createElement(
        "div",
        { className: "mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" },
        MARKETS.map(function (m, i) {
          return React.createElement(
            Reveal,
            { key: m.title, delay: i * 80 },
            React.createElement(
              "div",
              { className: "group relative h-full overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-electric/40" },
              React.createElement("div", { className: "absolute inset-x-0 -top-px h-px scale-x-0 bg-gradient-to-r from-transparent via-electric to-transparent transition-transform duration-500 group-hover:scale-x-100" }),
              React.createElement(
                "span",
                { className: "grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue/30 to-electric/10 text-electric ring-1 ring-white/10" },
                React.createElement(m.icon, { size: 28 })
              ),
              React.createElement(
                "h3",
                { className: "mt-6 font-display text-lg font-bold leading-tight text-white" },
                m.title
              ),
              React.createElement(
                "p",
                { className: "mt-3 text-[15px] leading-relaxed text-silver" },
                m.body
              )
            )
          );
        })
      )
    )
  );
};

/* ---------------- Testimonials (placeholder) ---------------- */

var QUOTES = [{ quote: "Switched our whole wash bay over and the foam and finish speak for themselves. Bulk delivery has never let us down.", name: "Carwash Owner", role: "Detailing Centre · Gauteng", initials: "CW" }, { quote: "Consistent batches and a detergent that handles our daily load volumes. Exactly what an industrial laundry needs.", name: "Laundromat Manager", role: "Industrial Laundry · Gauteng", initials: "LM" }, { quote: "Their degreasers cut our product spend without cutting performance, and the technical advice is genuinely useful.", name: "Operations Lead", role: "Contract Cleaning Co. · Gauteng", initials: "CC" }];

var Testimonials = function Testimonials() {
  return React.createElement(
    "section",
    { className: "bg-offwhite py-24 sm:py-32" },
    React.createElement(
      "div",
      { className: "mx-auto max-w-7xl px-5 sm:px-8" },
      React.createElement(
        "div",
        { className: "flex flex-col items-center gap-4 text-center" },
        React.createElement(
          Reveal,
          null,
          React.createElement(
            "span",
            { className: "inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-blue/20 bg-blue/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue" },
            "Social Proof"
          )
        ),
        React.createElement(
          Reveal,
          { delay: 70 },
          React.createElement(
            "h2",
            { className: "font-display text-[clamp(1.8rem,4vw,2.8rem)] font-black uppercase leading-[1.02] tracking-[-0.01em] text-midnight" },
            "Trusted by businesses across Gauteng"
          )
        ),
        React.createElement(
          Reveal,
          { delay: 120 },
          React.createElement(
            "span",
            { className: "rounded-full bg-amber-100 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-700" },
            "Placeholder testimonials — to be replaced with real client quotes"
          )
        )
      ),
      React.createElement(
        "div",
        { className: "mt-12 grid gap-6 lg:grid-cols-3" },
        QUOTES.map(function (q, i) {
          return React.createElement(
            Reveal,
            { key: q.name, delay: i * 90 },
            React.createElement(
              "figure",
              { className: "flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_1px_2px_rgba(13,36,64,0.04)]" },
              React.createElement(IconQuote, { size: 34, className: "text-blue/25" }),
              React.createElement(
                "blockquote",
                { className: "mt-4 flex-1 text-[17px] leading-relaxed text-midnight" },
                "\"",
                q.quote,
                "\""
              ),
              React.createElement(
                "div",
                { className: "mt-5 flex items-center gap-2 text-amber-400" },
                [0, 1, 2, 3, 4].map(function (s) {
                  return React.createElement(IconStar, { key: s, size: 16 });
                })
              ),
              React.createElement(
                "figcaption",
                { className: "mt-5 flex items-center gap-3 border-t border-slate-100 pt-5" },
                React.createElement(
                  "span",
                  { className: "grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-blue to-electric font-display text-sm font-bold text-white" },
                  q.initials
                ),
                React.createElement(
                  "span",
                  null,
                  React.createElement(
                    "span",
                    { className: "block font-display text-sm font-bold text-midnight" },
                    q.name
                  ),
                  React.createElement(
                    "span",
                    { className: "block text-[13px] text-slate-500" },
                    q.role
                  )
                )
              )
            )
          );
        })
      )
    )
  );
};

Object.assign(window, { Markets: Markets, Testimonials: Testimonials });