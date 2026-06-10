/* Stockist / Bulk Buyer CTA form  +  Footer  +  Floating WhatsApp */

"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var PRODUCT_INTEREST = ["Household Products", "Industrial Cleaners & Degreasers", "Car Shampoo", "Car Polish", "Interior Car Products", "Exterior Car Products", "Tyres & Wheels Products", "Full range / not sure yet"];

var Field = function Field(_ref) {
  var label = _ref.label;
  var children = _ref.children;
  var full = _ref.full;
  return React.createElement(
    "label",
    { className: "flex flex-col gap-2 " + (full ? "sm:col-span-2" : "") },
    React.createElement(
      "span",
      { className: "text-[13px] font-bold uppercase tracking-wide text-white/80" },
      label
    ),
    children
  );
};

var inputCls = "w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-[15px] text-white placeholder-white/45 outline-none transition focus:border-white focus:bg-white/15";

var Stockist = function Stockist() {
  var _React$useState = React.useState(false);

  var _React$useState2 = _slicedToArray(_React$useState, 2);

  var sent = _React$useState2[0];
  var setSent = _React$useState2[1];

  var submit = function submit(e) {
    e.preventDefault();setSent(true);
  };

  return React.createElement(
    "section",
    { id: "stockist", className: "relative overflow-hidden py-24 sm:py-32", style: { background: "linear-gradient(135deg,#2563EB 0%,#1E90FF 55%,#1567c9 100%)" } },
    React.createElement("div", { className: "pointer-events-none absolute inset-0 opacity-40", style: { backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0 14px, transparent 14px 28px)" } }),
    React.createElement("div", { className: "pointer-events-none absolute -right-32 -top-32 h-[460px] w-[460px] rounded-full bg-white/10 blur-3xl" }),
    React.createElement(
      "div",
      { className: "relative mx-auto grid max-w-7xl items-start gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16" },
      React.createElement(
        "div",
        { className: "lg:pt-6" },
        React.createElement(
          Reveal,
          null,
          React.createElement(
            "span",
            { className: "inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white" },
            "Become a stockist"
          )
        ),
        React.createElement(
          Reveal,
          { delay: 70 },
          React.createElement(
            "h2",
            { className: "mt-5 font-display text-[clamp(2rem,4.8vw,3.4rem)] font-black uppercase leading-[0.98] tracking-[-0.01em] text-white" },
            "Let's talk bulk pricing."
          )
        ),
        React.createElement(
          Reveal,
          { delay: 130 },
          React.createElement(
            "p",
            { className: "mt-5 max-w-md text-lg leading-relaxed text-white/85" },
            "Tell us about your operation and what you're looking to stock. Our team will come back with bulk pricing and the right products for your volumes — fast."
          )
        ),
        React.createElement(
          Reveal,
          { delay: 190 },
          React.createElement(
            "div",
            { className: "mt-8 space-y-3" },
            [{ icon: IconPhone, text: "067 101 4345", href: "tel:+27671014345" }, { icon: IconMail, text: "info@amahle-blue.co.za", href: "mailto:info@amahle-blue.co.za" }, { icon: IconMapPin, text: "Unit H, 13 Main Reef Rd, Boksburg, Johannesburg, 1619", href: null }].map(function (c, i) {
              return React.createElement(
                "div",
                { key: i, className: "flex items-center gap-3 text-white" },
                React.createElement(
                  "span",
                  { className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15" },
                  React.createElement(c.icon, { size: 18 })
                ),
                c.href ? React.createElement(
                  "a",
                  { href: c.href, className: "font-semibold hover:underline" },
                  c.text
                ) : React.createElement(
                  "span",
                  { className: "font-semibold" },
                  c.text
                )
              );
            })
          )
        )
      ),
      React.createElement(
        Reveal,
        { delay: 120 },
        React.createElement(
          "div",
          { className: "rounded-3xl border border-white/15 bg-white/[0.08] p-6 backdrop-blur-md sm:p-8" },
          sent ? React.createElement(
            "div",
            { className: "flex min-h-[420px] flex-col items-center justify-center text-center" },
            React.createElement(
              "span",
              { className: "grid h-16 w-16 place-items-center rounded-full bg-white text-blue" },
              React.createElement(IconCheckCircle, { size: 34 })
            ),
            React.createElement(
              "h3",
              { className: "mt-6 font-display text-2xl font-black uppercase text-white" },
              "Request received"
            ),
            React.createElement(
              "p",
              { className: "mt-3 max-w-xs text-white/85" },
              "Thanks — our team will be in touch shortly with bulk pricing tailored to your business."
            ),
            React.createElement(
              "button",
              { onClick: function () {
                  return setSent(false);
                }, className: "mt-7 rounded-full bg-white px-6 py-3 text-sm font-bold text-blue" },
              "Send another request"
            )
          ) : React.createElement(
            "form",
            { onSubmit: submit, className: "grid gap-4 sm:grid-cols-2" },
            React.createElement(
              Field,
              { label: "Name" },
              React.createElement("input", { required: true, className: inputCls, placeholder: "Your full name" })
            ),
            React.createElement(
              Field,
              { label: "Business" },
              React.createElement("input", { className: inputCls, placeholder: "Company / trading name" })
            ),
            React.createElement(
              Field,
              { label: "Email" },
              React.createElement("input", { type: "email", required: true, className: inputCls, placeholder: "you@business.co.za" })
            ),
            React.createElement(
              Field,
              { label: "Phone" },
              React.createElement("input", { className: inputCls, placeholder: "067 000 0000" })
            ),
            React.createElement(
              Field,
              { label: "Product interest", full: true },
              React.createElement(
                "div",
                { className: "relative" },
                React.createElement(
                  "select",
                  { required: true, defaultValue: "", className: inputCls + " appearance-none pr-10" },
                  React.createElement(
                    "option",
                    { value: "", disabled: true, className: "text-slate-500" },
                    "Select a category…"
                  ),
                  PRODUCT_INTEREST.map(function (p) {
                    return React.createElement(
                      "option",
                      { key: p, value: p, className: "text-midnight" },
                      p
                    );
                  })
                ),
                React.createElement(IconChevronDown, { size: 18, className: "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/70" })
              )
            ),
            React.createElement(
              Field,
              { label: "Message", full: true },
              React.createElement("textarea", { rows: 4, className: inputCls + " resize-none", placeholder: "Volumes, current products, delivery area…" })
            ),
            React.createElement(
              "button",
              { type: "submit", className: "group sm:col-span-2 mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-midnight px-7 py-4 text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-navy" },
              "Request Bulk Pricing",
              React.createElement(IconArrowRight, { size: 18, className: "transition-transform group-hover:translate-x-1" })
            )
          )
        )
      )
    )
  );
};

var Footer = function Footer() {
  return React.createElement(
    "footer",
    { className: "bg-[#06121f] pt-16" },
    React.createElement(
      "div",
      { className: "mx-auto max-w-7xl px-5 sm:px-8" },
      React.createElement(
        "div",
        { className: "grid gap-10 border-b border-white/8 pb-12 lg:grid-cols-12" },
        React.createElement(
          "div",
          { className: "lg:col-span-5" },
          React.createElement(Wordmark, null),
          React.createElement(
            "p",
            { className: "mt-5 max-w-sm text-[15px] leading-relaxed text-silver" },
            "Premium, locally-manufactured cleaning & car-care chemicals. Expect clean — accept nothing else."
          ),
          React.createElement(
            "p",
            { className: "mt-5 font-display text-sm font-bold uppercase tracking-wide text-electric" },
            "Expect clean. Accept nothing else."
          )
        ),
        React.createElement(
          "div",
          { className: "lg:col-span-3" },
          React.createElement(
            "h4",
            { className: "font-display text-sm font-bold uppercase tracking-wide text-white" },
            "Explore"
          ),
          React.createElement(
            "ul",
            { className: "mt-4 space-y-2.5" },
            NAV.map(function (n) {
              return React.createElement(
                "li",
                { key: n.href },
                React.createElement(
                  "a",
                  { href: n.href, className: "text-[15px] text-silver transition-colors hover:text-white" },
                  n.label
                )
              );
            })
          )
        ),
        React.createElement(
          "div",
          { className: "lg:col-span-4" },
          React.createElement(
            "h4",
            { className: "font-display text-sm font-bold uppercase tracking-wide text-white" },
            "Get in touch"
          ),
          React.createElement(
            "ul",
            { className: "mt-4 space-y-3 text-[15px] text-silver" },
            React.createElement(
              "li",
              { className: "flex items-start gap-3" },
              React.createElement(IconMapPin, { size: 18, className: "mt-0.5 shrink-0 text-electric" }),
              " Unit H, 13 Main Reef Rd, Boksburg, Johannesburg, 1619"
            ),
            React.createElement(
              "li",
              { className: "flex items-center gap-3" },
              React.createElement(IconPhone, { size: 18, className: "shrink-0 text-electric" }),
              " ",
              React.createElement(
                "a",
                { href: "tel:+27671014345", className: "hover:text-white" },
                "067 101 4345"
              )
            ),
            React.createElement(
              "li",
              { className: "flex items-center gap-3" },
              React.createElement(IconMail, { size: 18, className: "shrink-0 text-electric" }),
              " ",
              React.createElement(
                "a",
                { href: "mailto:info@amahle-blue.co.za", className: "hover:text-white" },
                "info@amahle-blue.co.za"
              )
            )
          ),
          React.createElement(
            "a",
            { href: "https://www.facebook.com/share/17sDJXMKSz/", target: "_blank", rel: "noopener noreferrer", className: "mt-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-white/5 text-white transition-colors hover:border-electric hover:text-electric", "aria-label": "Facebook" },
            React.createElement(IconFacebook, { size: 20 })
          )
        )
      ),
      React.createElement(
        "div",
        { className: "flex flex-col items-center justify-between gap-3 py-7 text-[13px] text-silver sm:flex-row" },
        React.createElement(
          "span",
          null,
          "© 2026 Amahle Blue. All rights reserved."
        ),
        React.createElement(
          "span",
          { className: "font-mono uppercase tracking-[0.15em] text-white/30" },
          "Made in Gauteng, South Africa 🇿🇦"
        )
      )
    )
  );
};

var WhatsappFloat = function WhatsappFloat() {
  return React.createElement(
    "a",
    {
      href: WA_LINK,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "group fixed bottom-5 right-5 z-50 inline-flex items-center gap-0 overflow-hidden rounded-full bg-whatsapp px-4 py-4 text-white shadow-[0_16px_40px_-10px_rgba(37,211,102,0.8)] transition-all hover:px-5",
      "aria-label": "Chat on WhatsApp"
    },
    React.createElement(IconWhatsapp, { size: 26 }),
    React.createElement(
      "span",
      { className: "max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold opacity-0 transition-all duration-300 group-hover:ml-2.5 group-hover:max-w-[140px] group-hover:opacity-100" },
      "Chat with us"
    )
  );
};

Object.assign(window, { Stockist: Stockist, Footer: Footer, WhatsappFloat: WhatsappFloat });