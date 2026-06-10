/* Header (scroll-aware sticky) + Hero + Trust bar */

"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var WA_LINK = "https://wa.me/27671014345";

var NAV = [{ label: "Home", href: "#top" }, { label: "Products", href: "#products" }, { label: "About", href: "#about" }, { label: "Markets", href: "#markets" }, { label: "Contact", href: "#stockist" }];

var Wordmark = function Wordmark(_ref) {
  var _ref$className = _ref.className;
  var className = _ref$className === undefined ? "" : _ref$className;
  return React.createElement(
    "a",
    { href: "#top", className: "group flex items-center gap-2.5 " + className },
    React.createElement(
      "span",
      { className: "grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-electric to-blue shadow-[0_8px_24px_-8px_rgba(30,144,255,0.8)]" },
      React.createElement(IconDroplet, { size: 18, className: "text-white", strokeWidth: 2.4 })
    ),
    React.createElement(
      "span",
      { className: "font-display text-[19px] font-extrabold uppercase leading-none tracking-[0.04em] text-white" },
      "Amahle ",
      React.createElement(
        "span",
        { className: "text-electric" },
        "Blue"
      )
    )
  );
};

var Header = function Header() {
  var _React$useState = React.useState(false);

  var _React$useState2 = _slicedToArray(_React$useState, 2);

  var scrolled = _React$useState2[0];
  var setScrolled = _React$useState2[1];

  var _React$useState3 = React.useState(false);

  var _React$useState32 = _slicedToArray(_React$useState3, 2);

  var open = _React$useState32[0];
  var setOpen = _React$useState32[1];

  React.useEffect(function () {
    var onScroll = function onScroll() {
      return setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return function () {
      return window.removeEventListener("scroll", onScroll);
    };
  }, []);
  React.useEffect(function () {
    document.body.style.overflow = open ? "hidden" : "";
    return function () {
      document.body.style.overflow = "";
    };
  }, [open]);

  return React.createElement(
    "header",
    {
      className: "fixed inset-x-0 top-0 z-50 transition-all duration-300",
      style: {
        background: scrolled ? "rgba(10,25,41,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent"
      }
    },
    React.createElement(
      "div",
      { className: "mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 py-4" },
      React.createElement(Wordmark, null),
      React.createElement(
        "nav",
        { className: "hidden items-center gap-9 lg:flex" },
        NAV.map(function (n) {
          return React.createElement(
            "a",
            { key: n.href, href: n.href, className: "text-sm font-semibold text-silver transition-colors hover:text-white" },
            n.label
          );
        })
      ),
      React.createElement(
        "div",
        { className: "flex items-center gap-3" },
        React.createElement(
          "a",
          {
            href: "#stockist",
            className: "hidden sm:inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-whatsapp px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(37,211,102,0.9)] transition-transform hover:-translate-y-0.5"
          },
          React.createElement(IconWhatsapp, { size: 16 }),
          "Get Bulk Quote"
        ),
        React.createElement(
          "button",
          {
            onClick: function () {
              return setOpen(function (v) {
                return !v;
              });
            },
            className: "grid h-10 w-10 place-items-center rounded-lg border border-white/12 bg-white/5 text-white lg:hidden",
            "aria-label": "Menu"
          },
          open ? React.createElement(IconX, { size: 20 }) : React.createElement(IconMenu, { size: 20 })
        )
      )
    ),
    React.createElement(
      "div",
      {
        className: "lg:hidden overflow-hidden transition-[max-height] duration-300",
        style: { maxHeight: open ? 420 : 0, background: "rgba(10,25,41,0.97)", backdropFilter: "blur(14px)" }
      },
      React.createElement(
        "nav",
        { className: "flex flex-col gap-1 px-5 pb-6 pt-2" },
        NAV.map(function (n) {
          return React.createElement(
            "a",
            { key: n.href, href: n.href, onClick: function () {
                return setOpen(false);
              }, className: "rounded-lg px-3 py-3 text-base font-semibold text-silver hover:bg-white/5 hover:text-white" },
            n.label
          );
        }),
        React.createElement(
          "a",
          { href: "#stockist", onClick: function () {
              return setOpen(false);
            }, className: "mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-whatsapp px-5 py-3 text-base font-bold text-white" },
          React.createElement(IconWhatsapp, { size: 18 }),
          " Get Bulk Quote"
        )
      )
    )
  );
};

var Hero = function Hero() {
  return React.createElement(
    "section",
    { id: "top", className: "relative isolate min-h-[100svh] overflow-hidden" },
    React.createElement(
      "div",
      { className: "absolute inset-0" },
      React.createElement(Placeholder, { dark: true, label: "HERO · CAR DETAILING / PRODUCT LINE-UP", rounded: "rounded-none", className: "h-full w-full" })
    ),
    React.createElement("div", { className: "absolute inset-0", style: { background: "linear-gradient(100deg, #0A1929 18%, rgba(10,25,41,0.92) 46%, rgba(10,25,41,0.45) 78%, rgba(10,25,41,0.2) 100%)" } }),
    React.createElement("div", { className: "absolute inset-0", style: { background: "radial-gradient(80% 60% at 12% 0%, rgba(30,144,255,0.22), transparent 55%)" } }),
    React.createElement("div", { className: "pointer-events-none absolute -left-40 top-1/3 h-[520px] w-[520px] rounded-full", style: { background: "radial-gradient(circle, rgba(37,99,235,0.35), transparent 65%)", filter: "blur(40px)" } }),
    React.createElement(
      "div",
      { className: "relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-5 sm:px-8 pt-28 pb-16" },
      React.createElement(
        "div",
        { className: "max-w-3xl" },
        React.createElement(
          Reveal,
          null,
          React.createElement(
            Pill,
            null,
            React.createElement("span", { className: "h-1.5 w-1.5 rounded-full bg-electric" }),
            " Locally manufactured · Gauteng, SA"
          )
        ),
        React.createElement(
          Reveal,
          { delay: 80 },
          React.createElement(
            "h1",
            { className: "mt-6 font-display text-[clamp(2.6rem,7.5vw,5.4rem)] font-black uppercase leading-[0.92] tracking-[-0.02em] text-white" },
            "Expect clean.",
            React.createElement("br", null),
            React.createElement(
              "span",
              { className: "text-electric" },
              "Accept"
            ),
            " nothing",
            React.createElement("br", { className: "hidden sm:block" }),
            " else."
          )
        ),
        React.createElement(
          Reveal,
          { delay: 160 },
          React.createElement(
            "p",
            { className: "mt-7 max-w-xl text-lg leading-relaxed text-silver sm:text-xl" },
            "Premium cleaning & car-care chemicals, manufactured in Gauteng since 2019 — formulated to perform for the businesses that depend on clean."
          )
        ),
        React.createElement(
          Reveal,
          { delay: 240 },
          React.createElement(
            "div",
            { className: "mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" },
            React.createElement(
              "a",
              { href: "#products", className: "group inline-flex items-center justify-center gap-2 rounded-full bg-blue px-7 py-3.5 text-base font-bold text-white shadow-[0_18px_40px_-14px_rgba(37,99,235,0.95)] transition-all hover:-translate-y-0.5 hover:bg-electric" },
              "Browse Products",
              React.createElement(IconArrowRight, { size: 18, className: "transition-transform group-hover:translate-x-1" })
            ),
            React.createElement(
              "a",
              { href: WA_LINK, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-base font-bold text-white backdrop-blur-sm transition-colors hover:border-whatsapp hover:text-whatsapp" },
              React.createElement(IconWhatsapp, { size: 18 }),
              "Request Bulk Quote"
            )
          )
        )
      )
    ),
    React.createElement(
      "div",
      { className: "absolute bottom-6 right-6 hidden font-mono text-[10px] uppercase tracking-[0.25em] text-white/30 md:block" },
      "scroll ↓"
    )
  );
};

var TRUST = [{ icon: IconFactory, label: "Locally Manufactured", sub: "Proudly made in SA 🇿🇦" }, { icon: IconCalendar, label: "Established 2019", sub: "Boksburg, Gauteng" }, { icon: IconTruck, label: "Bulk Supply Across SA", sub: "Reliable, scalable volumes" }, { icon: IconShieldCheck, label: "Quality & Compliance", sub: "Consistent, tested batches" }];

var STATS = [{ to: 5, suffix: "+", label: "Years manufacturing", tail: "since 2019" }, { to: 50, suffix: "+", label: "Products & formulations", tail: "across 7 categories" }, { to: 100, suffix: "%", label: "Local production", tail: "made in Gauteng" }];

var TrustBar = function TrustBar() {
  return React.createElement(
    "section",
    { className: "relative border-y border-white/8 bg-navy" },
    React.createElement(
      "div",
      { className: "mx-auto max-w-7xl px-5 sm:px-8" },
      React.createElement(
        "div",
        { className: "grid grid-cols-2 gap-px overflow-hidden lg:grid-cols-4", style: { background: "rgba(255,255,255,0.06)" } },
        TRUST.map(function (t, i) {
          return React.createElement(
            Reveal,
            { key: t.label, delay: i * 70, className: "bg-navy" },
            React.createElement(
              "div",
              { className: "flex items-center gap-4 px-5 py-7 sm:px-7" },
              React.createElement(
                "span",
                { className: "grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-electric" },
                React.createElement(t.icon, { size: 22 })
              ),
              React.createElement(
                "div",
                null,
                React.createElement(
                  "div",
                  { className: "font-display text-sm font-bold uppercase tracking-wide text-white" },
                  t.label
                ),
                React.createElement(
                  "div",
                  { className: "text-[13px] text-silver" },
                  t.sub
                )
              )
            )
          );
        })
      ),
      React.createElement(
        "div",
        { className: "grid gap-px overflow-hidden border-t border-white/8 sm:grid-cols-3", style: { background: "rgba(255,255,255,0.06)" } },
        STATS.map(function (s, i) {
          return React.createElement(
            Reveal,
            { key: s.label, delay: i * 90, className: "bg-navy" },
            React.createElement(
              "div",
              { className: "px-6 py-10 text-center" },
              React.createElement(
                "div",
                { className: "font-display text-5xl font-black tracking-tight text-white sm:text-6xl" },
                React.createElement(Counter, { to: s.to, suffix: s.suffix })
              ),
              React.createElement(
                "div",
                { className: "mt-2 font-display text-sm font-bold uppercase tracking-wide text-electric" },
                s.label
              ),
              React.createElement(
                "div",
                { className: "text-[13px] text-silver" },
                s.tail
              )
            )
          );
        })
      )
    )
  );
};

Object.assign(window, { Header: Header, Hero: Hero, TrustBar: TrustBar, WA_LINK: WA_LINK });
/* Mobile drawer */ /* Background image placeholder + overlays */ /* corner label for the hero photo zone */