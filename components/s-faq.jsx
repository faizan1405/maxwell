/* Amahle Blue Store — FAQ section (homepage accordion) + FAQ page */

const FAQ_CATEGORIES = [
  { id: 'products',      label: 'Products' },
  { id: 'carcare',       label: 'Car Care' },
  { id: 'cleaning',      label: 'Cleaning & Sanitising' },
  { id: 'account',       label: 'Account & Ordering' },
  { id: 'delivery',      label: 'Delivery' },
  { id: 'payments',      label: 'Payments' },
  { id: 'cancellations', label: 'Cancellations & Support' },
];

const DEFAULT_FAQS = [
  /* ── Products ──────────────────────────────────────────────────────────────── */
  { id:'dfaq1',  question:'What products does Amahle Blue manufacture and sell?',              answer:'Amahle Blue manufactures and sells sanitising, cleaning, and car-care products. Our range includes sanitiser, isopropyl alcohol, car interior care products, car exterior care products, tyre shine, dash shine, tile cleaner, and all-purpose cleaner.',                                                                         category:'products',      order:1,  enabled:true, showOnHomepage:true  },
  { id:'dfaq2',  question:'Are Amahle Blue products available in different sizes and quantities?', answer:'Yes. Selected products are available in different sizes and quantities. Open the relevant product page to view the currently available options before adding an item to your cart.',                                                                                                                                        category:'products',      order:2,  enabled:true, showOnHomepage:true  },
  { id:'dfaq3',  question:'Where can I find instructions for using a product?',                answer:'Please check the relevant product page and the instructions provided on the product label before use. Product usage instructions, ingredients, materials, and precautions may vary depending on the item.',                                                                                                                     category:'products',      order:3,  enabled:true, showOnHomepage:false },
  { id:'dfaq4',  question:'Do Amahle Blue products come with a warranty or guarantee?',        answer:'A warranty or guarantee may apply to selected products. The applicable terms depend on the product. Please review the product details or contact our support team before ordering if you need confirmation.',                                                                                                                   category:'products',      order:4,  enabled:true, showOnHomepage:false },
  /* ── Car Care ───────────────────────────────────────────────────────────────── */
  { id:'dfaq5',  question:'Which products can I use for car interior care?',                   answer:'Amahle Blue offers car interior care products, including dash shine. Please check the relevant product description and usage instructions to choose the correct product for your vehicle.',                                                                                                                                    category:'carcare',       order:1,  enabled:true, showOnHomepage:false },
  { id:'dfaq6',  question:'Which products can I use for car exterior care?',                   answer:'Amahle Blue offers car exterior care products and tyre shine. Review the relevant product page for usage instructions before applying any product.',                                                                                                                                                                          category:'carcare',       order:2,  enabled:true, showOnHomepage:false },
  { id:'dfaq7',  question:'Can I use the same product on every part of my vehicle?',           answer:'Not necessarily. Different surfaces may require different products. Always review the product description and follow the label instructions before applying a product to your vehicle.',                                                                                                                                       category:'carcare',       order:3,  enabled:true, showOnHomepage:false },
  /* ── Cleaning & Sanitising ──────────────────────────────────────────────────── */
  { id:'dfaq8',  question:'Do you sell products for household and general cleaning?',          answer:'Yes. Amahle Blue offers products such as tile cleaner and all-purpose cleaner. Please review the relevant product details to determine which item is suitable for your intended use.',                                                                                                                                        category:'cleaning',      order:1,  enabled:true, showOnHomepage:false },
  { id:'dfaq9',  question:'Do you sell sanitiser and isopropyl alcohol?',                      answer:'Yes. Amahle Blue sells sanitiser and isopropyl alcohol. Please select the required product size and carefully follow the instructions and precautions shown on the product page and label.',                                                                                                                                  category:'cleaning',      order:2,  enabled:true, showOnHomepage:false },
  { id:'dfaq10', question:'Should I read the product label before using a cleaning or sanitising product?', answer:'Yes. Always read the label and follow the applicable usage instructions and precautions before use. Do not use a product for a purpose that is not stated in its instructions.',                                                                                                                              category:'cleaning',      order:3,  enabled:true, showOnHomepage:false },
  /* ── Account & Ordering ─────────────────────────────────────────────────────── */
  { id:'dfaq11', question:'Do I need to create an account before ordering?',                   answer:'No. You can place an order as a guest without creating an account. However, creating an account lets you track your orders, upload proof of payment, reorder easily, and receive updates — so we recommend signing up for the best experience.',                                                                                                                                                              category:'account',       order:1,  enabled:true, showOnHomepage:false },
  { id:'dfaq12', question:'How can I place an order?',                                         answer:'Browse the products, select the required size or quantity where applicable, add the items to your cart, proceed to checkout, enter your delivery information, choose an available payment method, and confirm your order. You can check out as a guest or sign in to your account.',                                                                                                category:'account',       order:2,  enabled:true, showOnHomepage:false },
  { id:'dfaq13', question:'Will I receive an invoice after ordering?',                         answer:'Yes. You will receive an invoice after placing your order.',                                                                                                                                                                                                                                                                  category:'account',       order:3,  enabled:true, showOnHomepage:false },
  { id:'dfaq14', question:'Will I receive updates about my order?',                            answer:'Yes. Order-related updates will be sent to your registered email address.',                                                                                                                                                                                                                                                   category:'account',       order:4,  enabled:true, showOnHomepage:false },
  /* ── Delivery ───────────────────────────────────────────────────────────────── */
  { id:'dfaq15', question:'Does Amahle Blue deliver across South Africa?',                     answer:'Yes. Amahle Blue delivers orders across South Africa.',                                                                                                                                                                                                                                                                       category:'delivery',      order:1,  enabled:true, showOnHomepage:true  },
  { id:'dfaq16', question:'How much does delivery cost?',                                      answer:'Delivery charges vary according to your location and order details. The applicable delivery charge will be calculated or confirmed for your order.',                                                                                                                                                                          category:'delivery',      order:2,  enabled:true, showOnHomepage:true  },
  { id:'dfaq17', question:'How long will my order take to arrive?',                            answer:'The delivery timeline depends on your order and delivery location. The expected timeline will be confirmed after your order has been placed.',                                                                                                                                                                                category:'delivery',      order:3,  enabled:true, showOnHomepage:true  },
  { id:'dfaq18', question:'Will I receive a courier tracking link?',                           answer:'Tracking availability may depend on the courier and delivery arrangement. Any available order or delivery updates will be sent to your registered email address.',                                                                                                                                                            category:'delivery',      order:4,  enabled:true, showOnHomepage:false },
  /* ── Payments ───────────────────────────────────────────────────────────────── */
  { id:'dfaq19', question:'Which payment methods do you accept?',                              answer:'Amahle Blue currently accepts Cash and EFT payments. Select the available option that suits you when placing your order.',                                                                                                                                                                                                    category:'payments',      order:1,  enabled:true, showOnHomepage:true  },
  { id:'dfaq20', question:'Do you offer instalment payments?',                                 answer:'No. Instalment payments are currently not available.',                                                                                                                                                                                                                                                                        category:'payments',      order:2,  enabled:true, showOnHomepage:false },
  { id:'dfaq21', question:'Can I use more than one coupon code on the same order?',            answer:'No. Only one coupon code can be applied to an order.',                                                                                                                                                                                                                                                                        category:'payments',      order:3,  enabled:true, showOnHomepage:false },
  { id:'dfaq22', question:'Do you offer discounts or special deals?',                          answer:'Amahle Blue may offer promotional deals such as first-order discounts, product bundles, and seasonal sales. Available offers will be shown on the website when applicable.',                                                                                                                                                  category:'payments',      order:4,  enabled:true, showOnHomepage:false },
  /* ── Cancellations & Support ────────────────────────────────────────────────── */
  { id:'dfaq23', question:'Can I cancel my order after placing it?',                           answer:'You can request cancellation after placing an order. Please contact our support team as soon as possible. Cancellation approval may depend on the current status of your order.',                                                                                                                                             category:'cancellations', order:1,  enabled:true, showOnHomepage:true  },
  { id:'dfaq24', question:'What should I do if I need help with a product or order?',          answer:'Please contact the Amahle Blue support team using the contact details shown on the website. Share your order details where applicable so the team can assist you efficiently.',                                                                                                                                               category:'cancellations', order:2,  enabled:true, showOnHomepage:false },
  { id:'dfaq25', question:'Do you accept bulk orders?',                                        answer:'Yes. Amahle Blue accepts bulk orders. Please contact our team directly to discuss the required products, quantities, and bulk pricing.',                                                                                                                                                                                      category:'cancellations', order:3,  enabled:true, showOnHomepage:true  },
];

/* Fetch live FAQs from API; fall back to DEFAULT_FAQS */
function useFaqs() {
  const [faqs, setFaqs] = React.useState(DEFAULT_FAQS.filter(f => f.enabled !== false));
  React.useEffect(() => {
    fetch('/api/faqs')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data) && data.length) setFaqs(data); })
      .catch(() => {});
  }, []);
  return faqs;
}

/* Chevron SVG — rotates when open */
const FaqChevron = ({ open }) => (
  <svg
    width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
    style={{
      transition: 'transform 0.3s cubic-bezier(.16,1,.3,1)',
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      flexShrink: 0,
    }}
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* Single accordion item */
function FaqAccordionItem({ item, isOpen, onToggle, index }) {
  const bodyRef = React.useRef(null);
  const answerId = `faq-answer-${item.id}`;
  const btnId    = `faq-btn-${item.id}`;

  return (
    <FadeReveal delay={index * 40} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_10px_rgba(11,37,69,0.04)] transition-shadow duration-200 hover:shadow-[0_4px_18px_rgba(11,37,69,0.08)]">
      <button
        id={btnId}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={answerId}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt focus-visible:ring-inset"
      >
        <span className="font-display text-[16px] font-semibold leading-snug text-ink">
          {item.question}
        </span>
        <span className={`transition-colors duration-200 ${isOpen ? 'text-cobalt' : 'text-slate-400'}`}>
          <FaqChevron open={isOpen} />
        </span>
      </button>

      <div
        id={answerId}
        role="region"
        aria-labelledby={btnId}
        ref={bodyRef}
        style={{
          maxHeight: isOpen ? (bodyRef.current ? bodyRef.current.scrollHeight + 'px' : '600px') : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.38s cubic-bezier(.16,1,.3,1)',
        }}
      >
        <div className="border-t border-slate-100 px-6 pb-6 pt-4 text-[15px] leading-relaxed text-slate-600">
          {item.answer}
        </div>
      </div>
    </FadeReveal>
  );
}

/* ── Homepage FAQ Section ─────────────────────────────────────────────────── */
function HomepageFaqSection() {
  const allFaqs  = useFaqs();
  const [openId, setOpenId] = React.useState(null);

  const items = React.useMemo(
    () => allFaqs
      .filter(f => f.showOnHomepage && f.enabled !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .slice(0, 8),
    [allFaqs]
  );

  const goFaq = () => window.dispatchEvent(new CustomEvent('ab:go-page', { detail: 'faq' }));

  if (!items.length) return null;

  return (
    <section className="bg-[#f7f9fc] py-16 sm:py-24" aria-labelledby="faq-home-heading">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        {/* heading */}
        <Reveal className="mb-12 text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cobalt/15 bg-cobalt/5 px-4 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-cobalt">
            Support
          </p>
          <h2 id="faq-home-heading" className="font-display text-[30px] font-extrabold leading-tight text-ink sm:text-[38px]">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-[15px] text-slate-500">
            Quick answers to common questions about ordering, delivery, and more.
          </p>
        </Reveal>

        {/* accordion grid */}
        <div className="mx-auto max-w-[860px] space-y-3">
          {items.map((item, i) => (
            <FaqAccordionItem
              key={item.id}
              item={item}
              index={i}
              isOpen={openId === item.id}
              onToggle={() => setOpenId(openId === item.id ? null : item.id)}
            />
          ))}
        </div>

        {/* CTA */}
        <FadeReveal delay={items.length * 40 + 80} className="mt-10 text-center">
          <button
            onClick={goFaq}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-[14.5px] font-semibold text-white shadow-[0_8px_24px_rgba(11,37,69,0.22)] transition-all duration-200 hover:bg-cobalt hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(30,80,224,0.3)] active:scale-95 active:translate-y-0"
          >
            View All FAQs
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </FadeReveal>
      </div>
    </section>
  );
}

/* ── FAQ Page ─────────────────────────────────────────────────────────────── */
function FaqPage({ onGoHome }) {
  const allFaqs = useFaqs();
  const [openId,  setOpenId]  = React.useState(null);
  const [search,  setSearch]  = React.useState('');
  const [activeCat, setActiveCat] = React.useState('all');

  /* Update document title and structured data on mount */
  React.useEffect(() => {
    const prevTitle = document.title;
    const prevDesc  = document.querySelector('meta[name="description"]')?.getAttribute('content');
    document.title  = 'FAQs | Amahle Blue Cleaning, Car-Care and Sanitising Products';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', 'Find answers about Amahle Blue products, delivery across South Africa, Cash and EFT payments, product variations, discounts, cancellations, and bulk orders.');

    /* FAQ structured data */
    const schema = document.createElement('script');
    schema.id   = 'ab-faq-schema';
    schema.type = 'application/ld+json';
    schema.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: allFaqs
        .filter(f => f.enabled !== false)
        .map(f => ({
          '@type':          'Question',
          name:             f.question,
          acceptedAnswer:   { '@type': 'Answer', text: f.answer },
        })),
    });
    document.head.appendChild(schema);

    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc) metaDesc.setAttribute('content', prevDesc);
      document.getElementById('ab-faq-schema')?.remove();
    };
  }, [allFaqs]);

  /* push/pop history for /faq URL */
  React.useEffect(() => {
    if (window.history.pushState) {
      window.history.pushState({ page: 'faq' }, '', '/faq');
    }
    const onPop = () => onGoHome?.();
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (window.history.pushState) {
        window.history.pushState({ page: 'home' }, '', '/');
      }
    };
  }, []);

  const q = search.trim().toLowerCase();

  /* Filtered items */
  const filtered = React.useMemo(() => {
    let items = allFaqs.filter(f => f.enabled !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    if (activeCat !== 'all') items = items.filter(f => f.category === activeCat);
    if (q) items = items.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
    return items;
  }, [allFaqs, activeCat, q]);

  /* Categories that have at least one enabled FAQ */
  const usedCats = React.useMemo(() => {
    const ids = new Set(allFaqs.filter(f => f.enabled !== false).map(f => f.category));
    return FAQ_CATEGORIES.filter(c => ids.has(c.id));
  }, [allFaqs]);

  /* Group by category (only when showing "all" and no search) */
  const grouped = React.useMemo(() => {
    if (activeCat !== 'all' || q) return null;
    const map = {};
    usedCats.forEach(c => { map[c.id] = []; });
    filtered.forEach(f => {
      if (!map[f.category]) map[f.category] = [];
      map[f.category].push(f);
    });
    return map;
  }, [filtered, activeCat, q, usedCats]);

  const toggle = (id) => setOpenId(prev => prev === id ? null : id);

  return (
    <main className="ab-page-enter min-h-screen bg-[#f7f9fc] pb-16">
      {/* hero strip */}
      <div className="bg-ink pb-10 pt-12 sm:pb-14 sm:pt-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <button
            onClick={onGoHome}
            className="mb-6 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-white/50 transition-colors hover:text-white/90"
            aria-label="Back to home"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to store
          </button>
          <h1 className="font-display text-[32px] font-extrabold text-white sm:text-[44px]">
            Frequently Asked Questions
          </h1>
          <p className="mt-2 text-[15.5px] text-white/55 sm:text-[16px]">
            Everything you need to know about ordering, delivery, and support.
          </p>

          {/* Search */}
          <div className="mt-7 max-w-[560px]">
            <div className="relative">
              <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="search"
                value={search}
                onChange={e => { setSearch(e.target.value); setActiveCat('all'); }}
                placeholder="Search questions or keywords…"
                aria-label="Search FAQs"
                className="w-full rounded-2xl border border-white/10 bg-white/10 py-3.5 pl-11 pr-4 text-[15px] text-white placeholder-white/35 outline-none transition-all duration-200 focus:border-white/25 focus:bg-white/15 focus:ring-0"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/40 transition-colors hover:text-white/80"
                  aria-label="Clear search"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        {/* Category tabs */}
        {!q && (
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 py-6 sm:-mx-6 sm:px-6" role="tablist" aria-label="FAQ categories">
            {[{ id: 'all', label: 'All Questions' }, ...usedCats].map(cat => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={activeCat === cat.id}
                onClick={() => { setActiveCat(cat.id); setOpenId(null); }}
                className={`shrink-0 rounded-full px-4 py-2 text-[13.5px] font-semibold transition-all duration-200 ${
                  activeCat === cat.id
                    ? 'bg-cobalt text-white shadow-[0_4px_14px_rgba(30,80,224,0.25)]'
                    : 'bg-white text-slate-500 shadow-sm hover:text-ink'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* No results */}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <p className="font-display text-[17px] font-bold text-ink">No results found</p>
            <p className="mt-1.5 text-[14px] text-slate-400">
              {q ? `No FAQs match "${search}". Try different keywords.` : 'No questions in this category yet.'}
            </p>
            {q && (
              <button onClick={() => setSearch('')} className="mt-4 text-[13.5px] font-semibold text-cobalt underline underline-offset-2">
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Grouped (all + no search) */}
        {grouped && (
          <div className="space-y-10 pb-4">
            {usedCats
              .filter(c => (grouped[c.id] || []).length > 0)
              .map(cat => (
                <div key={cat.id}>
                  <h2 className="mb-4 font-display text-[19px] font-extrabold text-ink">{cat.label}</h2>
                  <div className="space-y-3">
                    {(grouped[cat.id] || []).map((item, i) => (
                      <FaqAccordionItem
                        key={item.id}
                        item={item}
                        index={i}
                        isOpen={openId === item.id}
                        onToggle={() => toggle(item.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Flat list (single cat or search) */}
        {!grouped && filtered.length > 0 && (
          <div className="space-y-3 pb-4">
            {filtered.map((item, i) => (
              <FaqAccordionItem
                key={item.id}
                item={item}
                index={i}
                isOpen={openId === item.id}
                onToggle={() => toggle(item.id)}
              />
            ))}
          </div>
        )}

        {/* Contact CTA */}
        <FadeReveal className="my-12 overflow-hidden rounded-3xl bg-ink px-6 py-10 text-center sm:px-10">
          <p className="mb-1 text-[11.5px] font-semibold uppercase tracking-[0.2em] text-cobalt">Still need help?</p>
          <h3 className="font-display text-[24px] font-extrabold text-white sm:text-[28px]">Contact our support team</h3>
          <p className="mt-2 text-[14.5px] leading-relaxed text-white/55">
            Can't find what you're looking for? Reach out and we'll be happy to help.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={BRAND.wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-grass px-6 py-3 text-[14px] font-semibold text-white shadow-[0_8px_24px_rgba(21,154,76,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(21,154,76,0.4)] active:scale-95"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>
            <a
              href={`mailto:${BRAND.email}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-[14px] font-semibold text-white/80 transition-all duration-200 hover:border-white/30 hover:text-white active:scale-95"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Email us
            </a>
          </div>
        </FadeReveal>
      </div>
    </main>
  );
}

Object.assign(window, { HomepageFaqSection, FaqPage, FAQ_CATEGORIES, DEFAULT_FAQS });
