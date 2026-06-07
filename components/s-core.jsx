/* Amahle Blue Store — data, cart context, primitives */

const BRAND = {
  name: "Amahle Blue",
  tagline: "Cleaning Solutions",
  phone: "067 101 4345",
  phoneRaw: "+27671014345",
  email: "info@amahle-blue.co.za",
  address: "Unit H, 13 Main Reef Road, Dunswart, Boksburg, Gauteng, South Africa",
  wa: "https://wa.me/27671014345",
};

const CATEGORIES = [
  { id: "household", name: "Household Cleaning", short: "Household", icon: "Home", blurb: "Everyday surfaces, floors, fabrics & fresh-smelling rooms.", accent: "#1D4ED8" },
  { id: "car", name: "Car Care", short: "Car Care", icon: "Car", blurb: "Showroom shine for tyres, dashboards & trim.", accent: "#0B2E6B" },
  { id: "sanitiser", name: "Sanitisers & Disinfectants", short: "Sanitisers", icon: "Shield", blurb: "High-purity protection that kills 99.9% of germs.", accent: "#159A4C" },
];

const PRODUCTS_DEFAULT = [
  {
    id: "all-purpose-cleaner", name: "All Purpose Cleaner", cat: "household",
    sub: "Versatile Multi-Surface Cleaning Solution", price: 89.99, was: 109.99,
    size: "500ml", rating: 4.8, reviews: 124, badge: "Bestseller",
    img: (window.__resources||{}).allPurposeCleaner || "assets/products/all-purpose-cleaner.jpg",
    benefits: ["Cuts grease & grime", "Cleans kitchens, bathrooms & counters", "Leaves surfaces fresh & streak-free", "Safe on tiles, stainless steel & sealed surfaces"],
    desc: "A versatile multi-surface cleaning solution designed to cut through grease, dirt and grime — leaving every washable surface sparkling clean and fresh every time.",
    scent: "Fresh Clean",
  },
  {
    id: "tile-cleaner", name: "Tile Cleaner", cat: "household",
    sub: "Powerful Floor & Tile Cleaning Solution", price: 94.99,
    size: "5L", rating: 4.7, reviews: 98, badge: null,
    img: (window.__resources||{}).tileCleaner || "assets/products/tile-cleaner.jpg",
    benefits: ["Removes tough stains", "Cuts grease & grime", "Fresh clean finish", "Suitable for ceramic & porcelain tiles"],
    desc: "Powerful cleaning solution formulated to remove tough stains, dirt, grease and soap scum from floor and wall tiles — leaving surfaces sparkling with a fresh finish.",
    scent: "Sparkling Fresh",
  },
  {
    id: "carpet-upholstery-shampoo", name: "Carpet & Upholstery Shampoo", cat: "household",
    sub: "Deep Cleaning Fabric & Carpet Care", price: 129.99, was: 149.99,
    size: "5L", rating: 4.9, reviews: 76, badge: "Bestseller",
    img: (window.__resources||{}).carpetShampoo || "assets/products/carpet-upholstery-shampoo.png",
    benefits: ["Lifts dirt & stubborn stains", "Refreshes carpets & upholstery", "Low-foam fresh clean finish", "Suitable for rugs, sofas & fabric seats"],
    desc: "A powerful shampoo specially formulated to remove dirt, stains and embedded grime from carpets, rugs and upholstered surfaces — leaving them cleaner, brighter and fresh-smelling.",
    scent: "Fresh Linen",
  },
  {
    id: "linen-spray", name: "Linen Spray", cat: "household",
    sub: "Fresh Linen Fragrance & Fabric Refresh", price: 99.99,
    size: "500ml", rating: 4.8, reviews: 61, badge: "New",
    img: (window.__resources||{}).linenSpray || "assets/products/linen-spray.jpg",
    benefits: ["Refreshes linen & fabrics instantly", "Helps neutralize unwanted odours", "Long-lasting fresh scent", "For bedding, curtains & upholstery"],
    desc: "A fabric freshening spray formulated to refresh linen, bedding, curtains and soft furnishings — eliminating odours while leaving fabrics smelling clean, crisp and pleasantly fresh.",
    scent: "Fresh Linen",
  },
  {
    id: "hand-surface-sanitiser", name: "Hand & Surface Sanitiser", cat: "sanitiser",
    sub: "Isopropyl Alcohol 85% — Kills 99.9% of germs", price: 149.99,
    size: "5L", rating: 4.9, reviews: 210, badge: "Bestseller",
    img: (window.__resources||{}).handSanitiser || "assets/products/hand-surface-sanitiser.jpg",
    benefits: ["Kills 99.9% of germs & bacteria", "Fast drying & non-sticky", "No-rinse formula", "Surface friendly"],
    desc: "High-strength hand and surface sanitiser formulated with 85% Isopropyl Alcohol to kill 99.9% of germs and bacteria. Fast-drying and non-sticky — suitable for hands and a wide range of hard surfaces.",
    scent: "85% IPA",
  },
  {
    id: "isopropyl-alcohol", name: "Isopropyl Alcohol 99.99%", cat: "sanitiser",
    sub: "Fast Drying Cleaning & Disinfecting Solution", price: 179.99, was: 199.99,
    size: "5L", rating: 4.9, reviews: 143, badge: "High Purity",
    img: (window.__resources||{}).isopropylAlcohol || "assets/products/isopropyl-alcohol.jpg",
    benefits: ["Quick evaporation & fast drying", "Removes grease, dirt & residue", "Safe for glass, electronics & equipment", "Leaves a clean streak-free finish"],
    desc: "A fast-evaporating 99.99% Isopropyl Alcohol cleaning solution that removes grease, grime and residue from hard surfaces and equipment — drying quickly without leaving heavy residue.",
    scent: "99.99% IPA",
  },
  {
    id: "tyre-shine", name: "Tyre Shine", cat: "car",
    sub: "Deep Black Shine & Long-Lasting Protection", price: 119.99,
    size: "5L", rating: 4.7, reviews: 88, badge: null,
    img: (window.__resources||{}).tyreShine || "assets/products/tyre-shine.jpg",
    benefits: ["Restores deep black tyre finish", "Instant glossy shine", "Helps protect against cracking & fading", "Repels dust & road grime"],
    desc: "A premium tyre dressing formulated to restore a rich black appearance and a clean, glossy finish — enhancing the look of tyres while protecting against dryness, dullness and everyday road grime.",
    scent: "Gloss Finish",
  },
  {
    id: "tyre-dash-shine", name: "Tyre & Dash Shine", cat: "car",
    sub: "High Gloss Tyre & Dashboard Care", price: 124.99,
    size: "5L", rating: 4.8, reviews: 72, badge: "New",
    img: (window.__resources||{}).tyreDashShine || "assets/products/tyre-dash-shine.jpg",
    benefits: ["Restores shine to tyres & dashboards", "Helps protect against dust & fading", "Rich, non-greasy finish", "For tyres, dashboards & vinyl trim"],
    desc: "A quality car-care formula designed to clean, shine and refresh tyres, dashboards and vinyl or plastic surfaces — restoring a neat, glossy appearance that looks well maintained.",
    scent: "High Gloss",
  },
];

// If the admin panel has published product changes, prefer those over the hardcoded list
const PRODUCTS = (() => {
  try {
    const raw = localStorage.getItem("ab_products");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return PRODUCTS_DEFAULT;
})();

const money = (n) => "R" + n.toFixed(2);
const catOf = (id) => CATEGORIES.find((c) => c.id === id);

/* ---------------- Cart context ---------------- */
const CartContext = React.createContext(null);
const useCart = () => React.useContext(CartContext);

function CartProvider({ children }) {
  const [items, setItems] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("ab_cart") || "[]"); } catch { return []; }
  });
  const [open, setOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const toastTimer = React.useRef(null);

  React.useEffect(() => {
    try { localStorage.setItem("ab_cart", JSON.stringify(items)); } catch {}
  }, [items]);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const add = (product, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === product.id);
      if (found) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { id: product.id, qty }];
    });
    showToast(`${product.name} added to cart`);
  };
  const setQty = (id, qty) => setItems((prev) => qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => i.id === id ? { ...i, qty } : i));
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  const detailed = items.map((i) => ({ ...i, product: PRODUCTS.find((p) => p.id === i.id) })).filter((i) => i.product);
  const count = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = detailed.reduce((s, i) => s + i.product.price * i.qty, 0);

  const value = { items, detailed, count, subtotal, add, setQty, remove, clear, open, setOpen, toast };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/* ---------------- Primitives ---------------- */

/* Rise-in on view. Only translates (never fades opacity) so content is always visible. */
function useInView(threshold = 1.0, safety = 1400) {
  const ref = React.useRef(null);
  const [v, setV] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(true); return; }
    let done = false;
    const arm = () => { if (done) return; done = true; setV(true); teardown(); };
    const check = () => {
      if (done || !ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh * threshold && r.bottom > -40) arm();
    };
    const timers = [requestAnimationFrame(check), setTimeout(check, 120), setTimeout(check, 450), setTimeout(arm, safety)];
    function teardown() { timers.forEach((t) => { cancelAnimationFrame(t); clearTimeout(t); }); window.removeEventListener("scroll", check); window.removeEventListener("resize", check); }
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(check);
    return teardown;
  }, [threshold, safety]);
  return [ref, v];
}

const Reveal = ({ children, className = "", delay = 0, y = 20, as = "div" }) => {
  const [ref, v] = useInView();
  const Tag = as;
  return (
    <Tag ref={ref} className={className} style={{ transition: "transform .7s cubic-bezier(.16,1,.3,1), opacity .7s ease", transitionDelay: `${delay}ms`, transform: v ? "translateY(0)" : `translateY(${y}px)`, opacity: v ? 1 : 0.001 }}>
      {children}
    </Tag>
  );
};

const Stars = ({ value, size = 14, className = "" }) => (
  <span className={`relative inline-flex ${className}`} style={{ lineHeight: 0 }} aria-label={`${value} out of 5`}>
    <span className="flex text-slate-200">{[0,1,2,3,4].map((i) => <Star key={i} size={size} fill="currentColor" strokeWidth={0} />)}</span>
    <span className="absolute inset-0 flex overflow-hidden text-amber-400" style={{ width: `${(value / 5) * 100}%` }}>
      {[0,1,2,3,4].map((i) => <Star key={i} size={size} fill="currentColor" strokeWidth={0} />)}
    </span>
  </span>
);

const CatIcon = ({ name, ...rest }) => {
  const map = { Home: window.Home, Car: window.Car, Shield: window.Shield, Spray: window.Spray };
  const C = map[name] || window.Sparkles;
  return <C {...rest} />;
};

Object.assign(window, { BRAND, CATEGORIES, PRODUCTS, money, catOf, CartContext, CartProvider, useCart, useInView, Reveal, Stars, CatIcon });
