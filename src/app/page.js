'use client';

import React, { useState, useEffect, useReducer } from 'react';
import dynamic from 'next/dynamic';
import { ProductsProvider, CustomerProvider, CartProvider, useCustomer, useCart } from '../lib/storeContext';
import { Header } from '../components/store/Header';
import { Hero, TrustStrip, CategoryShowcase, IndustrialBanner } from '../components/store/HeroSection';
import { Footer, WhatsappFab } from '../components/store/Footer';

/* ── Code-splitting ───────────────────────────────────────────────────────────
 * Only the header, above-the-fold hero sections and the footer ship in the
 * initial storefront bundle. Everything else — the shop grid, quick view, cart,
 * checkout, order confirmation, account, auth modal, marketing sections, FAQ
 * and policy pages — is dynamically imported so it is fetched on demand
 * (route-specific pages) or lazily below the fold (home page sections),
 * dramatically shrinking the first-load JavaScript. */
function PageLoader() {
  // Reserves vertical space so route swaps don't collapse the layout.
  return <div aria-hidden="true" style={{ minHeight: '70vh' }} />;
}

const Featured           = dynamic(() => import('../components/store/ShopPage').then(m => ({ default: m.Featured })));
const BulkPromo          = dynamic(() => import('../components/store/ShopPage').then(m => ({ default: m.BulkPromo })));
const Shop               = dynamic(() => import('../components/store/ShopPage').then(m => ({ default: m.Shop })));
const QuickView          = dynamic(() => import('../components/store/ShopPage').then(m => ({ default: m.QuickView })));
const CartPage           = dynamic(() => import('../components/store/CartComponents').then(m => ({ default: m.CartPage })), { loading: PageLoader });
const CheckoutPage       = dynamic(() => import('../components/store/CartComponents').then(m => ({ default: m.CheckoutPage })), { loading: PageLoader });
const OrderConfirmedPage = dynamic(() => import('../components/store/CartComponents').then(m => ({ default: m.OrderConfirmedPage })), { loading: PageLoader });
const AuthModal          = dynamic(() => import('../components/store/AuthModal').then(m => ({ default: m.AuthModal })));
const WhyUs              = dynamic(() => import('../components/store/ContentSections').then(m => ({ default: m.WhyUs })));
const Reviews            = dynamic(() => import('../components/store/ContentSections').then(m => ({ default: m.Reviews })));
const Contact            = dynamic(() => import('../components/store/ContentSections').then(m => ({ default: m.Contact })));
const Newsletter         = dynamic(() => import('../components/store/ContentSections').then(m => ({ default: m.Newsletter })));
const FaqPage            = dynamic(() => import('../components/store/FaqPage').then(m => ({ default: m.FaqPage })), { loading: PageLoader });
const HomepageFaqSection = dynamic(() => import('../components/store/FaqPage').then(m => ({ default: m.HomepageFaqSection })));
const PolicyPage         = dynamic(() => import('../components/store/PolicyPages').then(m => ({ default: m.PolicyPage })), { loading: PageLoader });
const AccountPage        = dynamic(() => import('../components/store/AccountPage'), { loading: PageLoader });



/* ── Toast ────────────────────────────────────────────────────────────────── */
function Toast() {
  const { toast } = useCart();
  if (!toast) return null;
  return (
    <div className="ab-fade-in" style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 100, background: '#111111', color: 'white', padding: '12px 24px',
      borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: '0 8px 30px rgba(17,17,17,0.3)',
    }}>
      {toast}
    </div>
  );
}

/* ── Store Router ─────────────────────────────────────────────────────────── */
function StoreRouter() {
  const { page, setPage } = useCustomer();
  const [activeCat, setActiveCat] = useState("all");
  const [query, setQuery] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [urlTick, bumpUrlTick] = useReducer(n => n + 1, 0);

  const getShopUrl = (cat = "all", q = "") => {
    const params = new URLSearchParams();
    if (cat && cat !== "all") params.set("category", cat);
    if (q && q.trim()) params.set("q", q.trim());
    const search = params.toString();
    return search ? `/shop?${search}` : "/shop";
  };

  const syncShopFiltersFromUrl = () => {
    if (typeof window === 'undefined') return;
    const isShopPath = window.location.pathname.replace(/^\/+/, '').split('/')[0] === 'shop';
    if (!isShopPath) return;
    const params = new URLSearchParams(window.location.search);
    setActiveCat(params.get("category") || "all");
    setQuery(params.get("q") || "");
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const h = (e) => {
      const detail = typeof e.detail === 'string' ? { page: e.detail } : (e.detail || {});
      setPage(detail.page || 'home', detail.url ? { url: detail.url } : undefined);
      if (detail.category || typeof detail.query === 'string') {
        const nextCat = detail.category || "all";
        const nextQuery = typeof detail.query === 'string' ? detail.query : "";
        setActiveCat(nextCat);
        setQuery(nextQuery);
      }
      window.scrollTo(0, 0);
    };
    window.addEventListener("ab:go-page", h);
    return () => window.removeEventListener("ab:go-page", h);
  }, [setPage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const h = () => {
      syncShopFiltersFromUrl();
      bumpUrlTick();
      setTimeout(syncShopFiltersFromUrl, 0);
    };
    h();
    window.addEventListener("ab:url-change", h);
    window.addEventListener("popstate", h);
    return () => {
      window.removeEventListener("ab:url-change", h);
      window.removeEventListener("popstate", h);
    };
  }, []);

  useEffect(() => {
    if (page === "shop") syncShopFiltersFromUrl();
  }, [page, urlTick]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (page !== 'home') return;
    const hash = window.location.hash ? window.location.hash.slice(1) : '';
    if (!hash) return;
    let attempts = 0;
    let cancelled = false;
    const tryScroll = () => {
      if (cancelled) return;
      const el = document.getElementById(hash);
      if (el) {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' });
        return;
      }
      attempts += 1;
      if (attempts < 12) setTimeout(tryScroll, 90);
    };
    setTimeout(tryScroll, 50);
    return () => { cancelled = true; };
  }, [page, urlTick]);

  const onNavCat = (cat, q) => {
    const nextCat = typeof q === "string" ? "all" : (cat || "all");
    const nextQuery = typeof q === "string" ? q : "";
    setActiveCat(nextCat);
    setQuery(nextQuery);
    setPage("shop", { url: getShopUrl(nextCat, nextQuery) });
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  };
  const onShopCat = (cat, q) => { onNavCat(cat || "all", q); };

  const goHome = () => { setPage("home"); if (typeof window !== 'undefined') window.scrollTo(0, 0); };
  const goOrders = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent("ab:account-tab", { detail: "orders" }));
    }
    setPage("account");
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  };

  // Page-level rendering
  if (page === "cart") {
    return (
      <>
        <Header onNavCat={onNavCat} activeCat={activeCat} />
        <main className="ab-page-enter">
          <CartPage onGoHome={goHome} onCheckout={() => setPage('checkout')} />
        </main>
        <Toast />
      </>
    );
  }

  if (page === "checkout") {
    return (
      <>
        <Header onNavCat={onNavCat} activeCat={activeCat} />
        <main className="ab-page-enter">
          <CheckoutPage onBack={() => setPage('cart')} onSuccess={(o) => { setConfirmedOrder(o); setPage('order-confirmed'); }} />
        </main>
        <Toast />
      </>
    );
  }

  if (page === "order-confirmed") {
    return (
      <>
        <Header onNavCat={onNavCat} activeCat={activeCat} />
        <main className="ab-page-enter">
          <OrderConfirmedPage order={confirmedOrder} onGoHome={goHome} onGoOrders={goOrders} />
        </main>
        <Toast />
      </>
    );
  }

  if (page === "account") {
    return (
      <>
        <Header onNavCat={onNavCat} activeCat={activeCat} />
        <AccountPage onGoHome={goHome} />
        <Toast />
      </>
    );
  }

  if (page === "faq") {
    return (
      <>
        <Header onNavCat={onNavCat} activeCat={activeCat} />
        <FaqPage onGoHome={goHome} />
        <Toast />
      </>
    );
  }

  const POLICY_PAGES = ['privacy-policy', 'terms-conditions', 'delivery-policy', 'returns-refunds'];
  if (POLICY_PAGES.includes(page)) {
    return (
      <>
        <Header onNavCat={onNavCat} activeCat={activeCat} />
        <PolicyPage type={page} onGoHome={goHome} />
        <Footer onShopCat={onShopCat} />
        <Toast />
        <WhatsappFab />
      </>
    );
  }

  if (page === "shop") {
    return (
      <>
        <Header onNavCat={onNavCat} activeCat={activeCat} />
        <main className="ab-page-enter bg-white" style={{ paddingBottom: '5rem' }}>
          <Shop activeCat={activeCat} setActiveCat={setActiveCat} query={query} setQuery={setQuery} />
          <IndustrialBanner
            eyebrow="Wholesale Cleaning Products"
            title="Need bulk pricing for your business?"
            desc="Tell our sales team what you need and we'll send a quote. Reliable supply for offices, schools, factories, hospitality and cleaning contractors across South Africa."
          />
        </main>
        <Footer onShopCat={onShopCat} />
        <Toast />
        <QuickView />
        <WhatsappFab />
      </>
    );
  }

  if (page === "about") {
    return (
      <>
        <Header onNavCat={onNavCat} activeCat={activeCat} />
        <main className="ab-page-enter bg-white" style={{ paddingBottom: '5rem', paddingTop: '3rem' }}>
          <WhyUs />
        </main>
        <Footer onShopCat={onShopCat} />
        <Toast />
        <WhatsappFab />
      </>
    );
  }

  if (page === "contact") {
    return (
      <>
        <Header onNavCat={onNavCat} activeCat={activeCat} />
        <main className="ab-page-enter bg-white" style={{ paddingBottom: '5rem', paddingTop: '3rem' }}>
          <Contact />
        </main>
        <Footer onShopCat={onShopCat} />
        <Toast />
        <WhatsappFab />
      </>
    );
  }

  // Default: Home
  return (
    <>
      <Header onNavCat={onNavCat} activeCat={activeCat} />
      <main className="ab-page-enter">
        <Hero onShopCat={onShopCat} />
        <TrustStrip />
        <CategoryShowcase onShopCat={onShopCat} />
        <IndustrialBanner />
        <Featured />
        <BulkPromo />
        <WhyUs />
        <Shop activeCat={activeCat} setActiveCat={setActiveCat} query={query} setQuery={setQuery} carousel />
        <Reviews />
        <Contact />
        <Newsletter />
        <HomepageFaqSection />
      </main>
      <Footer onShopCat={onShopCat} />
      <Toast />
      <QuickView />
      <WhatsappFab />
    </>
  );
}

/* ── Root Store App ───────────────────────────────────────────────────────── */
export default function StorePage() {
  return (
    <ProductsProvider>
      <CustomerProvider>
        <CartProvider>
          <StoreRouter />
          <AuthModal />
        </CartProvider>
      </CustomerProvider>
    </ProductsProvider>
  );
}
