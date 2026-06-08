/* Admin Panel — Review Moderation */

const REVIEW_PAGE_SIZE  = 15;
const REVIEW_STATUSES   = ['pending', 'approved', 'rejected', 'hidden'];

function StarsMini({ value }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <svg key={n} width="12" height="12" viewBox="0 0 24 24"
          fill={n<=value?'#f59e0b':'none'} stroke={n<=value?'#f59e0b':'#cbd5e1'} strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

const STATUS_STYLES = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-50 text-red-600',
  hidden:   'bg-slate-100 text-slate-500',
};

function ReviewCard({ review, onUpdate, onDelete, fmtDate }) {
  const [saving, setSaving] = React.useState(false);

  async function setStatus(status) {
    setSaving(true);
    await onUpdate(review.id, { status });
    setSaving(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Avatar name={review.customerName || '?'} size={36}/>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-700 text-sm text-slate-800">{review.customerName || 'Unknown'}</span>
            {review.email && <span className="text-xs text-slate-400">{review.email}</span>}
            <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-600 capitalize ${STATUS_STYLES[review.status]||STATUS_STYLES.pending}`}>
              {review.status}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StarsMini value={review.rating}/>
            <span className="text-xs font-700 text-amber-600">{(review.rating||0).toFixed(1)}</span>
            <span className="text-xs text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-500">{review.productId}</span>
            <span className="text-xs text-slate-400 ml-auto">{fmtDate(review.createdAt)}</span>
          </div>
          {review.text && (
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{review.text}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-50 flex-wrap">
        {review.status !== 'approved' && (
          <Btn size="sm" variant="success" onClick={() => setStatus('approved')} disabled={saving}>Approve</Btn>
        )}
        {review.status !== 'rejected' && (
          <Btn size="sm" variant="ghost" onClick={() => setStatus('rejected')} disabled={saving}>Reject</Btn>
        )}
        {review.status !== 'hidden' && (
          <Btn size="sm" variant="ghost" onClick={() => setStatus('hidden')} disabled={saving}>Hide</Btn>
        )}
        {saving && <Spinner size={14}/>}
        <button onClick={() => onDelete(review.id)}
          className="ml-auto p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <Icon.Trash/>
        </button>
      </div>
    </div>
  );
}

function ReviewsPage() {
  const { reviews, updateReview, deleteReview, fmtDate } = useAdmin();
  const [tab,      setTab]     = React.useState('pending');
  const [search,   setSearch]  = React.useState('');
  const [page,     setPage]    = React.useState(1);
  const [deleting, setDeleting]= React.useState(null);
  const [toast,    setToast]   = React.useState({ visible:false, msg:'', type:'success' });

  function showToast(msg, type='success') {
    setToast({ visible:true, msg, type });
    setTimeout(() => setToast(t=>({...t,visible:false})), 3000);
  }

  const allReviews = reviews || [];

  const tabCounts = React.useMemo(() => {
    const c = { all: allReviews.length };
    REVIEW_STATUSES.forEach(s => { c[s] = allReviews.filter(r=>r.status===s).length; });
    return c;
  }, [allReviews]);

  const filtered = React.useMemo(() => {
    let list = tab === 'all' ? allReviews : allReviews.filter(r => r.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        (r.customerName||'').toLowerCase().includes(q) ||
        (r.email||'').toLowerCase().includes(q) ||
        (r.text||'').toLowerCase().includes(q) ||
        (r.productId||'').toLowerCase().includes(q)
      );
    }
    return [...list].sort((a,b) => b.createdAt - a.createdAt);
  }, [allReviews, tab, search]);

  const paged = filtered.slice((page-1)*REVIEW_PAGE_SIZE, page*REVIEW_PAGE_SIZE);
  React.useEffect(() => setPage(1), [tab, search]);

  async function handleUpdate(id, patch) {
    await updateReview(id, patch);
    showToast('Review updated');
  }

  async function handleDelete(id) {
    await deleteReview(id);
    showToast('Review deleted', 'error');
    setDeleting(null);
  }

  const tabs = [{ id:'pending', label:'Pending' }, { id:'approved', label:'Approved' }, { id:'rejected', label:'Rejected' }, { id:'hidden', label:'Hidden' }, { id:'all', label:'All' }];

  return (
    <div className="space-y-5">
      <AdminToast message={toast.msg} type={toast.type} visible={toast.visible}/>

      <div>
        <h2 className="text-xl font-800 text-slate-800">Reviews</h2>
        <p className="text-sm text-slate-400 mt-0.5">Moderate customer product reviews</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-500 transition-all ${tab===t.id?'bg-cobalt text-white shadow-sm':'text-slate-500 hover:bg-slate-50'}`}>
            {t.label}
            {tabCounts[t.id] > 0 && (
              <span className={`text-xs font-700 px-1.5 rounded-full min-w-[20px] text-center ${tab===t.id?'bg-white/20 text-white':'bg-slate-100 text-slate-500'}`}>
                {tabCounts[t.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email, product or text…"/>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <Empty icon="⭐" title={`No ${tab==='all'?'':tab+' '}reviews`} description="Nothing to moderate here."/>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paged.map(r => (
              <ReviewCard key={r.id} review={r} onUpdate={handleUpdate} onDelete={id => setDeleting(id)} fmtDate={fmtDate}/>
            ))}
          </div>
          <Pagination page={page} total={filtered.length} pageSize={REVIEW_PAGE_SIZE} onChange={setPage}/>
        </>
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => handleDelete(deleting)}
        title="Delete Review"
        message="Permanently delete this review? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

window.ReviewsPage = ReviewsPage;
