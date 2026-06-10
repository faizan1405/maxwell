/* Admin Panel — Shared UI primitives */

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ size=20 }) {
  return (
    <div className="animate-spin" style={{width:size,height:size,border:'2.5px solid rgba(30,80,224,0.2)',borderTopColor:'#1E50E0',borderRadius:'50%',flexShrink:0}} />
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
const BADGE_STYLES = {
  active:     'bg-green-100 text-green-700',
  archived:   'bg-slate-100 text-slate-500',
  draft:      'bg-amber-100 text-amber-700',
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-600',
  paid:       'bg-green-100 text-green-700',
  refunded:   'bg-purple-100 text-purple-700',
  household:  'bg-blue-50 text-blue-700',
  sanitiser:  'bg-green-50 text-green-700',
  car:        'bg-slate-100 text-slate-600',
  Bestseller: 'bg-cobalt/10 text-cobalt',
  New:        'bg-grass/10 text-grass',
  'High Purity':'bg-purple-100 text-purple-700',
};
function Badge({ label, variant }) {
  const cls = BADGE_STYLES[variant || label] || 'bg-slate-100 text-slate-600';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-600 capitalize ${cls}`}>{label}</span>;
}

// ── Avatar ────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#1E50E0','#0B2545','#159A4C','#7C3AED','#0E7490','#B45309'];
function Avatar({ name, size=32 }) {
  const idx = (name||'?').charCodeAt(0) % AVATAR_COLORS.length;
  const bg  = AVATAR_COLORS[idx];
  const txt = (name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
  return (
    <div style={{width:size,height:size,borderRadius:'50%',background:bg,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.38,fontWeight:700,flexShrink:0}}>
      {txt}
    </div>
  );
}

// ── Btn ───────────────────────────────────────────────────────────────────────
function Btn({ children, variant='primary', size='md', onClick, disabled, type='button', className='' }) {
  const base = 'inline-flex items-center gap-1.5 rounded-lg font-600 transition-all cursor-pointer border-0 outline-none';
  const sizes = { sm:'px-3 py-1.5 text-sm', md:'px-4 py-2 text-sm', lg:'px-5 py-2.5 text-base' };
  const variants = {
    primary:  'bg-cobalt text-white hover:bg-cobalt-d active:scale-95 shadow-sm',
    secondary:'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:scale-95 shadow-sm',
    danger:   'bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-sm',
    ghost:    'bg-transparent text-slate-700 hover:bg-slate-100 active:scale-95',
    success:  'bg-green-500 text-white hover:bg-green-600 active:scale-95 shadow-sm',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${disabled?'opacity-50 pointer-events-none':''} ${className}`}>
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
function Input({ label, error, hint, className='', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-600 text-slate-700 mb-1">{label}</label>}
      <input {...props} className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors outline-none ${error ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-cobalt focus:ring-2 focus:ring-cobalt/20'} bg-white`} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {hint  && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────
function Textarea({ label, error, hint, rows=3, className='', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-600 text-slate-700 mb-1">{label}</label>}
      <textarea rows={rows} {...props} className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors outline-none resize-y ${error ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-cobalt focus:ring-2 focus:ring-cobalt/20'} bg-white`} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {hint  && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
function Select({ label, error, children, className='', ...props }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-600 text-slate-700 mb-1">{label}</label>}
      <select {...props} className={`w-full px-3 py-2 rounded-lg border text-sm transition-colors outline-none bg-white ${error ? 'border-red-400' : 'border-slate-200 focus:border-cobalt focus:ring-2 focus:ring-cobalt/20'}`}>
        {children}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div onClick={() => onChange(!checked)} className={`relative w-10 h-6 rounded-full transition-colors ${checked?'bg-cobalt':'bg-slate-300'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${checked?'left-5':'left-1'}`}/>
      </div>
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </label>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, size='md', footer }) {
  React.useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!open) return null;
  const widths = { sm:'28rem', md:'36rem', lg:'42rem', xl:'56rem', full:'64rem' };
  // Keep modal chrome outside the scrollable form body so actions always stay visible.
  const large = size === 'lg' || size === 'xl' || size === 'full';
  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16}}
      onClick={e => e.target===e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" style={{position:'absolute', inset:0}} onClick={onClose}/>
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full ab-modal-enter"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        data-modal-size={size}
        style={{
          position:'relative',
          display:'grid',
          gridTemplateRows: footer ? 'auto minmax(0, 1fr) auto' : 'auto minmax(0, 1fr)',
          width:'100%',
          maxWidth: widths[size] || widths.md,
          height: large ? 'min(90dvh, calc(100dvh - 32px))' : 'auto',
          maxHeight:'calc(100dvh - 32px)',
          overflow:'hidden',
        }}
      >
        <div style={{flexShrink:0}} className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 id="admin-modal-title" className="text-base font-700 text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{overflowY:'auto', minHeight:0, WebkitOverflowScrolling:'touch'}} className="px-6 py-5">{children}</div>
        {footer && <div style={{flexShrink:0}} className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
  return ReactDOM.createPortal(modal, document.body);
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel='Delete', variant='danger' }) {
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!open) setBusy(false);
  }, [open]);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
    } catch {
      // onConfirm handles its own errors
    } finally {
      setBusy(false);
      onClose();
    }
  }
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<>
        <Btn variant="secondary" onClick={onClose} disabled={busy}>Cancel</Btn>
        <Btn variant={variant} onClick={handleConfirm} disabled={busy}>
          {busy ? <><Spinner size={14}/> Please wait…</> : confirmLabel}
        </Btn>
      </>}
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function Empty({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-4xl mb-3 text-slate-300">{icon}</div>}
      <p className="text-sm font-600 text-slate-600 mb-1">{title}</p>
      {description && <p className="text-xs text-slate-400 mb-4">{description}</p>}
      {action}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color='cobalt', trend, onClick, className='' }) {
  const colors = {
    cobalt: 'bg-cobalt/10 text-cobalt',
    green:  'bg-green-100 text-green-600',
    amber:  'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
  };
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all duration-200 ${onClick?'cursor-pointer hover:border-cobalt/30 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0':''} ${className}`} onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${colors[color]}`}>{icon}</div>
        {trend !== undefined && (
          <span className={`text-xs font-600 px-2 py-1 rounded-full ${trend>=0?'bg-green-100 text-green-700':'bg-red-100 text-red-600'}`}>
            {trend>=0?'↑':'↓'}{Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-800 text-slate-800 mb-0.5">{value}</div>
      <div className="text-xs font-600 text-slate-500 uppercase tracking-wide">{label}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

// ── Search Input ──────────────────────────────────────────────────────────────
function SearchInput({ value, onChange, placeholder='Search…' }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm w-full outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20 bg-white" />
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, total, pageSize, onChange }) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const start = (page-1)*pageSize+1;
  const end   = Math.min(page*pageSize, total);
  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-xs text-slate-500">Showing {start}–{end} of {total}</span>
      <div className="flex gap-1">
        <button onClick={()=>onChange(page-1)} disabled={page<=1} className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-default transition-colors">‹ Prev</button>
        {Array.from({length:pages},(_,i)=>i+1).filter(p=>Math.abs(p-page)<=2||p===1||p===pages).reduce((acc,p,i,arr)=>{
          if (i>0 && arr[i-1]!==p-1) acc.push(<span key={`e${p}`} className="px-2 text-slate-400 text-xs self-center">…</span>);
          acc.push(<button key={p} onClick={()=>onChange(p)} className={`w-8 h-8 text-xs rounded-lg border transition-colors ${p===page?'bg-cobalt text-white border-cobalt':'border-slate-200 hover:bg-slate-50'}`}>{p}</button>);
          return acc;
        },[])}
        <button onClick={()=>onChange(page+1)} disabled={page>=pages} className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-default transition-colors">Next ›</button>
      </div>
    </div>
  );
}

// ── Alert ─────────────────────────────────────────────────────────────────────
function Alert({ type='info', message, onClose }) {
  const styles = {
    info:    'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error:   'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ab-fade-in ${styles[type]}`}>
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity shrink-0 mt-0.5">✕</button>}
    </div>
  );
}

// ── Toast (admin) ─────────────────────────────────────────────────────────────
function AdminToast({ message, type='success', visible }) {
  if (!visible) return null;
  const colors = { success:'bg-slate-800 text-white', error:'bg-red-600 text-white' };
  const icon = type === 'success'
    ? <span className="grid h-5 w-5 place-items-center rounded-full bg-green-500 text-white shrink-0 ab-succ-enter"><Icon.Check/></span>
    : <span className="grid h-5 w-5 place-items-center rounded-full bg-red-400 text-white shrink-0">!</span>;
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-500 ab-fade-in ${colors[type]}`}
      style={{ animation: 'abmodal .3s cubic-bezier(.16,1,.3,1)' }}>
      {icon}
      {message}
    </div>
  );
}

// ── Icons (inline SVG helpers) ────────────────────────────────────────────────
const Icon = {
  Chart:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 9l-5 5-4-4-5 5"/></svg>,
  List:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Dashboard: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  Box:       () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  ShoppingBag:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  Users:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Settings:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Plus:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Archive:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
  Eye:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  ChevronDown:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
  Bell:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Logout:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Menu:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Close:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Warning:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Check:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  Truck:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Search:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Filter:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Tag:       () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Star:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Cart:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  Help:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
};

window.Spinner=Spinner; window.Badge=Badge; window.Avatar=Avatar; window.Btn=Btn;
window.Input=Input; window.Textarea=Textarea; window.Select=Select; window.Toggle=Toggle;
window.Modal=Modal; window.ConfirmDialog=ConfirmDialog; window.Empty=Empty;
window.StatCard=StatCard; window.SearchInput=SearchInput; window.Pagination=Pagination;
window.Alert=Alert; window.AdminToast=AdminToast; window.Icon=Icon;
