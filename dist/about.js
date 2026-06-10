/* About / Why Us  +  Filterable Product Categories grid */

"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var USPS = [{ icon: IconFlask, title: "Market-leading formulations", body: "Chemistry built to outperform — high actives, real results, batch after batch." }, { icon: IconShieldCheck, title: "Strict quality control", body: "Every batch is tested for consistency, safety and performance before it ships." }, { icon: IconHeadphones, title: "Technical support & advice", body: "Dilution ratios, application methods and product selection — we guide your team." }, { icon: IconTruck, title: "Flexible bulk supply", body: "From 5L to bulk drums and IBCs, scaled to your operation and topped up on time." }, { icon: IconLeaf, title: "Environmentally conscious R&D", body: "Responsible raw materials and biodegradable options, without compromising power." }];

var About = function About() {
  return React.createElement(
    "section",
    { id: "about", className: "relative overflow-hidden bg-midnight py-24 sm:py-32" },
    React.createElement("div", { className: "pointer-events-none absolute right-0 top-0 h-[420px] w-[420px]", style: { background: "radial-gradient(circle at 70% 30%, rgba(30,144,255,0.14), transparent 60%)" } }),
    React.createElement(
      "div",
      { className: "mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-12 lg:gap-16" },
      React.createElement(
        "div",
        { className: "lg:col-span-5" },
        React.createElement(
          Reveal,
          null,
          React.createElement(
            Pill,
            null,
            "Why Amahle Blue"
          )
        ),
        React.createElement(
          Reveal,
          { delay: 70 },
          React.createElement(
            "h2",
            { className: "mt-5 font-display text-[clamp(2rem,4.5vw,3.1rem)] font-black uppercase leading-[0.98] tracking-[-0.01em] text-white" },
            "Chemistry that earns its place on the shelf."
          )
        ),
        React.createElement(
          Reveal,
          { delay: 140 },
          React.createElement(
            "p",
            { className: "mt-6 text-lg leading-relaxed text-silver" },
            "Founded in 2019 in Boksburg, Gauteng, Amahle Blue manufactures premium cleaning and car-care chemicals for businesses and households across South Africa. We exist because \"good enough\" never built a reputation — so we formulate, test and bottle products our customers can trust on every job."
          )
        ),
        React.createElement(
          Reveal,
          { delay: 200 },
          React.createElement(
            "p",
            { className: "mt-4 text-lg leading-relaxed text-silver" },
            "Locally made, rigorously controlled and supplied at scale — that's the standard behind the name."
          )
        ),
        React.createElement(
          Reveal,
          { delay: 260 },
          React.createElement(
            "div",
            { className: "mt-8" },
            React.createElement(Placeholder, { dark: true, label: "FACILITY · MANUFACTURING / BLENDING LINE", className: "aspect-[16/10] w-full" })
          )
        )
      ),
      React.createElement(
        "div",
        { className: "lg:col-span-7" },
        React.createElement(
          "div",
          { className: "grid gap-4 sm:grid-cols-2" },
          USPS.map(function (u, i) {
            return React.createElement(
              Reveal,
              { key: u.title, delay: i * 80 },
              React.createElement(
                "div",
                { className: "group h-full rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-electric/40 hover:bg-white/[0.06]" },
                React.createElement(
                  "span",
                  { className: "grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue/25 to-electric/15 text-electric ring-1 ring-white/10" },
                  React.createElement(u.icon, { size: 24 })
                ),
                React.createElement(
                  "h3",
                  { className: "mt-5 font-display text-lg font-bold text-white" },
                  u.title
                ),
                React.createElement(
                  "p",
                  { className: "mt-2 text-[15px] leading-relaxed text-silver" },
                  u.body
                )
              )
            );
          }),
          React.createElement(
            Reveal,
            { delay: USPS.length * 80 },
            React.createElement(
              "a",
              { href: "#stockist", className: "group flex h-full min-h-[140px] flex-col justify-between rounded-2xl bg-gradient-to-br from-blue to-electric p-6 text-white shadow-[0_24px_60px_-26px_rgba(37,99,235,0.9)]" },
              React.createElement(
                "span",
                { className: "font-display text-lg font-bold leading-snug" },
                "Need volume pricing for your business?"
              ),
              React.createElement(
                "span",
                { className: "inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide" },
                "Become a stockist ",
                React.createElement(IconArrowRight, { size: 16, className: "transition-transform group-hover:translate-x-1" })
              )
            )
          )
        )
      )
    )
  );
};

/* ---------------- Products ---------------- */

var PRODUCTS = [{ name: "Household Products", group: "Household", icon: IconHome, benefit: "Surface, floor & multi-purpose cleaners that actually perform.", tag: "Everyday clean" }, { name: "Industrial Cleaners & Degreasers", group: "Industrial", icon: IconFactory, benefit: "Heavy-duty degreasing power for workshops, plants & fleets.", tag: "Heavy duty" }, { name: "Car Shampoo", group: "Car Care", icon: IconDroplet, benefit: "High-foam, pH-balanced wash that lifts grime without stripping wax.", tag: "Wash" }, { name: "Car Polish", group: "Car Care", icon: IconSparkles, benefit: "Showroom-grade gloss and paint protection in every bottle.", tag: "Gloss" }, { name: "Interior Car Products", group: "Car Care", icon: IconCar, benefit: "Dashboards, trim & upholstery cleaned, conditioned and protected.", tag: "Interior" }, { name: "Exterior Car Products", group: "Car Care", icon: IconBeaker, benefit: "Bug, tar and traffic-film removal for a flawless finish.", tag: "Exterior" }, { name: "Tyres & Wheels Products", group: "Car Care", icon: IconShieldCheck, benefit: "Deep-clean wheels and rich, long-lasting tyre shine.", tag: "Wheels" }];

var TABS = ["All", "Household", "Industrial", "Car Care"];

var ProductCard = function ProductCard(_ref) {
  var p = _ref.p;
  return React.createElement(
    "div",
    { className: "group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(13,36,64,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(13,36,64,0.4)]" },
    React.createElement(
      "div",
      { className: "relative" },
      React.createElement(Placeholder, { dark: false, rounded: "rounded-none", label: "PRODUCT · " + p.tag.toUpperCase(), className: "aspect-[4/3] w-full" }),
      React.createElement(
        "span",
        { className: "absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-midnight/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-electric backdrop-blur-sm" },
        p.group
      ),
      React.createElement(
        "span",
        { className: "absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-xl bg-white/90 text-blue shadow-sm backdrop-blur-sm" },
        React.createElement(p.icon, { size: 20 })
      )
    ),
    React.createElement(
      "div",
      { className: "flex flex-1 flex-col p-6" },
      React.createElement(
        "h3",
        { className: "font-display text-lg font-extrabold leading-tight text-midnight" },
        p.name
      ),
      React.createElement(
        "p",
        { className: "mt-2 flex-1 text-[15px] leading-relaxed text-slate-500" },
        p.benefit
      ),
      React.createElement(
        "a",
        { href: "#stockist", className: "mt-5 inline-flex items-center justify-center gap-2 rounded-full border-2 border-blue px-5 py-2.5 text-sm font-bold text-blue transition-all group-hover:bg-blue group-hover:text-white" },
        "Get Quote ",
        React.createElement(IconArrowRight, { size: 16 })
      )
    )
  );
};

var Products = function Products() {
  var _React$useState = React.useState("All");

  var _React$useState2 = _slicedToArray(_React$useState, 2);

  var tab = _React$useState2[0];
  var setTab = _React$useState2[1];

  var shown = tab === "All" ? PRODUCTS : PRODUCTS.filter(function (p) {
    return p.group === tab;
  });
  return React.createElement(
    "section",
    { id: "products", className: "bg-offwhite py-24 sm:py-32" },
    React.createElement(
      "div",
      { className: "mx-auto max-w-7xl px-5 sm:px-8" },
      React.createElement(
        "div",
        { className: "flex flex-col items-start justify-between gap-8 md:flex-row md:items-end" },
        React.createElement(
          "div",
          { className: "max-w-2xl" },
          React.createElement(
            Reveal,
            null,
            React.createElement(
              "span",
              { className: "inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-blue/20 bg-blue/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-blue" },
              "Our Range"
            )
          ),
          React.createElement(
            Reveal,
            { delay: 70 },
            React.createElement(
              "h2",
              { className: "mt-5 font-display text-[clamp(2rem,4.5vw,3.2rem)] font-black uppercase leading-[0.98] tracking-[-0.01em] text-midnight" },
              "A full range, one standard."
            )
          ),
          React.createElement(
            Reveal,
            { delay: 130 },
            React.createElement(
              "p",
              { className: "mt-4 text-lg leading-relaxed text-slate-500" },
              "Seven categories spanning home, industry and the complete car-care line — every product engineered to the same premium benchmark."
            )
          )
        ),
        React.createElement(
          Reveal,
          { delay: 120, className: "w-full md:w-auto" },
          React.createElement(
            "div",
            { className: "flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-1.5" },
            TABS.map(function (t) {
              return React.createElement(
                "button",
                {
                  key: t,
                  onClick: function () {
                    return setTab(t);
                  },
                  className: "rounded-xl px-4 py-2.5 text-sm font-bold transition-all " + (tab === t ? "bg-blue text-white shadow-[0_10px_24px_-12px_rgba(37,99,235,0.9)]" : "text-slate-500 hover:bg-slate-100 hover:text-midnight")
                },
                t
              );
            })
          )
        )
      ),
      React.createElement(
        "div",
        { className: "mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" },
        shown.map(function (p, i) {
          return React.createElement(
            Reveal,
            { key: p.name, delay: i % 3 * 80 },
            React.createElement(ProductCard, { p: p })
          );
        })
      )
    )
  );
};

Object.assign(window, { About: About, Products: Products });
/* Left: story + visual */ /* Right: USP list */