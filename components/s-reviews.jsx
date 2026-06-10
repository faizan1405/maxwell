/* Amahle Blue Store — Product Reviews: display + customer submit */

const CUST_API_BASE_REV = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'https://maxwell-chi.vercel.app'
  : '';

/* ── Star picker ──────────────────────────────────────────────────────────────── */
function StarPicker({ value, onChange, size = 28 }) {
  const [hover, setHover] = React.useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110 active:scale-95"
          aria-label={`${n} star${n !== 1 ? 's' : ''}`}>
          <Star size={size} fill={(hover || value) >= n ? '#f59e0b' : 'none'} strokeWidth={1.5}
            className={(hover || value) >= n ? 'text-amber-400' : 'text-slate-300'} />
        </button>
      ))}
    </div>
  );
}

/* ── Single review card ───────────────────────────────────────────────────────── */
function ReviewCard({ review }) {
  const initials = (review.customerName || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const COLORS   = ['#1E50E0', '#0B2545', '#159A4C', '#7C3AED', '#0E7490'];
  const bg       = COLORS[(review.customerName || '?').charCodeAt(0) % COLORS.length];
  const date     = review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="flex items-start gap-3">
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-700 text-[14px] text-ink">{review.customerName || 'Verified Buyer'}</span>
            <span className="text-[11px] text-grass font-600 bg-green-50 px-2 py-0.5 rounded-full ring-1 ring-green-200">Verified Purchase</span>
            <span className="text-[11.5px] text-slate-400 ml-auto">{date}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <Stars value={review.rating} size={13} />
            <span className="text-[12px] font-700 text-amber-600">{review.rating.toFixed(1)}</span>
          </div>
          {review.text && (
            <p className="mt-2 text-[13.5px] text-slate-600 leading-relaxed">{review.text}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Review submit form ──────────────────────────────────────────────────────── */
function ReviewForm({ productId, sessionToken, existingReview, onSubmitted }) {
  const [rating,   setRating]   = React.useState(existingReview?.rating || 0);
  const [text,     setText]     = React.useState(existingReview?.text   || '');
  const [saving,   setSaving]   = React.useState(false);
  const [error,    setError]    = React.useState('');
  const [success,  setSuccess]  = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!rating) { setError('Please select a star rating.'); return; }
    setSaving(true); setError('');
    try {
      const res  = await fetch(`${CUST_API_BASE_REV}/api/reviews`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionToken}` },
        body:    JSON.stringify({ productId, rating, text: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to submit review.'); setSaving(false); return; }
      setSuccess(true);
      onSubmitted?.(data);
    } catch { setError('Network error. Please try again.'); }
    setSaving(false);
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 ring-1 ring-green-200">
        <CheckCircle size={16} className="text-grass shrink-0" />
        <p className="text-[13px] text-grass font-600">
          Review submitted — it'll appear once approved. Thank you!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-cobalt/3 rounded-2xl border border-cobalt/15 p-5 space-y-4">
      <h4 className="font-700 text-[14.5px] text-ink">
        {existingReview ? 'Update your review' : 'Write a review'}
      </h4>
      <div>
        <p className="text-[12px] font-700 text-slate-600 mb-2">Your rating *</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>
      <div>
        <label className="block text-[12px] font-700 text-slate-600 mb-1.5">Your review (optional)</label>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
          placeholder="Share your experience with this product…"
          className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-[13px] outline-none transition focus:border-cobalt focus:ring-2 focus:ring-cobalt/10 resize-none bg-white" />
      </div>
      {error && <p className="text-[12px] text-red-500">{error}</p>}
      <button type="submit" disabled={saving || !rating}
        className="h-10 px-5 rounded-xl bg-cobalt text-white text-[13px] font-700 hover:bg-cobalt-700 disabled:opacity-50 transition flex items-center gap-2">
        {saving ? <><AccSpinner2 /> Submitting…</> : (existingReview ? 'Update review' : 'Submit review')}
      </button>
    </form>
  );
}

/* ── Product Reviews Section ─────────────────────────────────────────────────── */
function ProductReviews({ productId }) {
  const { customer, sessionToken, isLoggedIn, openAuth } = useCustomer();
  const [reviews,       setReviews]       = React.useState(null);
  const [error,         setError]         = React.useState('');
  const [showForm,      setShowForm]      = React.useState(false);
  const [purchaseCheck, setPurchaseCheck] = React.useState(null); // null=unchecked, true, false

  /* Load approved reviews for this product */
  React.useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        const res  = await fetch(`${CUST_API_BASE_REV}/api/reviews?productId=${encodeURIComponent(productId)}`);
        const data = await res.json();
        setReviews(Array.isArray(data) ? data.sort((a, b) => b.createdAt - a.createdAt) : []);
      } catch { setReviews([]); }
    })();
  }, [productId]);

  /* Check if logged-in customer has purchased this product */
  React.useEffect(() => {
    if (!isLoggedIn || !sessionToken || !productId) { setPurchaseCheck(false); return; }
    (async () => {
      try {
        const res  = await fetch(`${CUST_API_BASE_REV}/api/orders`, {
          headers: { 'Authorization': `Bearer ${sessionToken}` },
        });
        if (!res.ok) { setPurchaseCheck(false); return; }
        const orders = await res.json();
        const ELIGIBLE = ['processing','shipped','delivered','Processing','Dispatched','Delivered'];
        const bought = orders.some(o =>
          ELIGIBLE.includes(o.status) &&
          o.items?.some(i => i.productId === productId)
        );
        setPurchaseCheck(bought);
      } catch { setPurchaseCheck(false); }
    })();
  }, [isLoggedIn, sessionToken, productId]);

  const existingReview = reviews?.find(r => r.customerId === customer?.id || r.email === customer?.email);
  const avgRating = reviews?.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  if (!productId) return null;

  return (
    <div className="space-y-5">
      {/* Summary */}
      {reviews?.length > 0 && (
        <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 px-5 py-4">
          <div className="text-center">
            <div className="font-display text-[40px] font-extrabold text-ink leading-none">{avgRating.toFixed(1)}</div>
            <Stars value={avgRating} size={14} className="mt-1" />
            <p className="text-[11px] text-slate-400 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map(n => {
              const count = reviews.filter(r => r.rating === n).length;
              const pct   = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={n} className="flex items-center gap-2">
                  <span className="text-[11px] font-600 text-slate-500 w-3">{n}</span>
                  <Star size={10} fill="#f59e0b" className="text-amber-400 shrink-0" />
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[11px] text-slate-400 w-4 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write review CTA */}
      {!showForm && (
        <div>
          {isLoggedIn && purchaseCheck && !existingReview && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 h-10 px-5 rounded-xl border-2 border-dashed border-cobalt/40 text-cobalt font-700 text-[13px] hover:bg-cobalt/5 transition w-full justify-center">
              <Star size={15} /> Write a review
            </button>
          )}
          {isLoggedIn && purchaseCheck && existingReview && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 h-10 px-5 rounded-xl border border-cobalt/30 text-cobalt font-600 text-[13px] hover:bg-cobalt/5 transition">
              <Pencil size={14} /> Update your review
            </button>
          )}
          {isLoggedIn && purchaseCheck === false && (
            <p className="text-[12.5px] text-slate-400 italic text-center py-2">Purchase this product to leave a review.</p>
          )}
          {!isLoggedIn && (
            <button onClick={openAuth}
              className="flex items-center gap-2 h-10 px-5 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-600 text-[13px] hover:bg-slate-50 transition w-full justify-center">
              <User size={15} /> Sign in to write a review
            </button>
          )}
        </div>
      )}

      {showForm && (
        <ReviewForm
          productId={productId}
          sessionToken={sessionToken}
          existingReview={existingReview}
          onSubmitted={(rev) => {
            if (existingReview) {
              setReviews(prev => prev.map(r => r.id === rev.id ? rev : r));
            } else {
              /* New review is pending, don't add to approved list yet */
            }
            setShowForm(false);
          }}
        />
      )}

      {/* Review list */}
      {reviews === null && (
        <div className="flex justify-center py-6">
          <span className="w-6 h-6 rounded-full border-2 border-cobalt/20 border-t-cobalt" style={{ animation: 'spin .7s linear infinite', display: 'inline-block' }} />
        </div>
      )}

      {reviews?.length > 0 ? (
        <div className="space-y-3">
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      ) : reviews !== null && (
        <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl">
          <Star size={28} className="mx-auto text-slate-300 mb-2" />
          <p className="text-[13.5px] font-600 text-slate-500">No reviews yet</p>
          <p className="text-[12px] text-slate-400 mt-1">Be the first to review this product.</p>
        </div>
      )}
    </div>
  );
}

function AccSpinner2() {
  return <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', flexShrink: 0, display: 'inline-block', animation: 'spin .7s linear infinite' }} />;
}

window.ProductReviews = ProductReviews;
window.StarPicker     = StarPicker;
