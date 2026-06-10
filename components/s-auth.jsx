/* Amahle Blue Store — Customer Auth: context, session, OTP modal */

const CUST_SESSION_KEY = 'ab_customer_session_v2';
const CUST_API_BASE    = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'https://maxwell-chi.vercel.app'
  : '';

const CustomerContext = React.createContext(null);
const useCustomer     = () => React.useContext(CustomerContext);

/* ─── Provider ─────────────────────────────────────────────────────────────── */
function CustomerProvider({ children }) {
  const [customer,     setCustomer]     = React.useState(null);
  const [sessionToken, setSessionToken] = React.useState(null);
  const [authOpen,     setAuthOpen]     = React.useState(false);
  const [page,         setPage]         = React.useState('home'); // 'home' | 'account'

  /* Restore session */
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(CUST_SESSION_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s && s.expiresAt > Date.now()) {
        setCustomer(s.customer);
        setSessionToken(s.sessionToken);
      } else {
        localStorage.removeItem(CUST_SESSION_KEY);
      }
    } catch {}
  }, []);

  const login = React.useCallback((cust, token, expiresAt) => {
    setCustomer(cust);
    setSessionToken(token);
    localStorage.setItem(CUST_SESSION_KEY, JSON.stringify({ customer: cust, sessionToken: token, expiresAt }));
    setAuthOpen(false);

    /* Merge any guest cart items into the customer's server-side cart */
    const guestId = window.getGuestId?.();
    if (guestId) {
      fetch(`${CUST_API_BASE}/api/carts`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body:    JSON.stringify({ action: 'merge', guestId }),
      }).then(r => r.ok ? r.json() : null).then(data => {
        if (data?.items?.length) {
          try { localStorage.setItem('ab_cart', JSON.stringify(data.items)); } catch {}
          window.dispatchEvent(new Event('ab:cart-merged'));
        }
      }).catch(() => {});
    }
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await fetch(`${CUST_API_BASE}/api/customer-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch {}
    setCustomer(null);
    setSessionToken(null);
    setPage('home');
    localStorage.removeItem(CUST_SESSION_KEY);
  }, []);

  const updateCustomerData = React.useCallback((updated) => {
    setCustomer(updated);
    try {
      const raw = localStorage.getItem(CUST_SESSION_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        s.customer = updated;
        localStorage.setItem(CUST_SESSION_KEY, JSON.stringify(s));
      }
    } catch {}
  }, []);

  const value = React.useMemo(() => ({
    customer,
    sessionToken,
    isLoggedIn: !!customer,
    login,
    logout,
    authOpen,
    openAuth:  () => setAuthOpen(true),
    closeAuth: () => setAuthOpen(false),
    page,
    setPage,
    updateCustomerData,
    apiBase: CUST_API_BASE,
  }), [customer, sessionToken, authOpen, page, login, logout, updateCustomerData]);

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

/* ─── Auth Modal ────────────────────────────────────────────────────────────── */
function AuthModal() {
  const { authOpen, closeAuth, login, apiBase } = useCustomer();
  const [step,        setStep]        = React.useState('email'); // 'email' | 'otp'
  const [email,       setEmail]       = React.useState('');
  const [otp,         setOtp]         = React.useState('');
  const [otpToken,    setOtpToken]    = React.useState('');
  const [loading,     setLoading]     = React.useState(false);
  const [error,       setError]       = React.useState('');
  const [resendSecs,  setResendSecs]  = React.useState(0);
  const [isNew,       setIsNew]       = React.useState(false);
  const [devOtp,      setDevOtp]      = React.useState('');
  const otpFormRef = React.useRef(null);

  /* Reset on close */
  React.useEffect(() => {
    if (!authOpen) {
      const t = setTimeout(() => {
        setStep('email'); setEmail(''); setOtp('');
        setOtpToken(''); setError(''); setResendSecs(0); setDevOtp('');
      }, 300);
      return () => clearTimeout(t);
    }
  }, [authOpen]);

  /* Resend countdown */
  React.useEffect(() => {
    if (resendSecs <= 0) return;
    const t = setTimeout(() => setResendSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendSecs]);

  async function doSendOtp(e) {
    if (e) e.preventDefault();
    const trimEmail = email.trim().toLowerCase();
    if (!trimEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${apiBase}/api/customer-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sendOtp', email: trimEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to send code. Try again.'); setLoading(false); return; }
      setOtpToken(data.otpToken);
      setIsNew(!!data.isNew);
      setStep('otp');
      setResendSecs(60);
      if (data.devOtp) { setOtp(data.devOtp); setDevOtp(data.devOtp); }
    } catch { setError('Network error. Please try again.'); }
    setLoading(false);
  }

  async function doVerifyOtp(e) {
    if (e) e.preventDefault();
    const code = otp.trim();
    if (code.length !== 6) { setError('Please enter the 6-digit code.'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${apiBase}/api/customer-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verifyOtp', otpToken, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Invalid code. Please try again.'); setOtp(''); setLoading(false); return; }
      login(data.customer, data.sessionToken, data.expiresAt);
    } catch { setError('Network error. Please try again.'); }
    setLoading(false);
  }

  function handleOtpInput(e) {
    const v = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(v);
    setError('');
    if (v.length === 6) setTimeout(() => otpFormRef.current?.requestSubmit(), 80);
  }

  if (!authOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div onClick={closeAuth} className="absolute inset-0 bg-ink/60 backdrop-blur-sm ab-fade-in" />
      <div className="relative w-full max-w-[420px] rounded-2xl bg-white shadow-2xl overflow-hidden ab-modal-enter">

        {/* Header gradient */}
        <div className="bg-gradient-to-br from-cobalt to-ink px-7 py-6 relative">
          <button onClick={closeAuth} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-xl text-white/60 hover:bg-white/10 hover:text-white transition">
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/15 text-white"><User size={16} /></span>
            <span className="text-[11px] font-bold uppercase tracking-[2px] text-sky-300">Amahle Blue</span>
          </div>
          <h2 className="font-display text-[22px] font-extrabold text-white leading-tight">
            {step === 'email'
              ? (isNew ? 'Create account' : 'Welcome back')
              : 'Check your email'}
          </h2>
          <p className="mt-1 text-[13px] text-sky-100/80">
            {step === 'email'
              ? 'Enter your email to receive a sign-in code — no password needed.'
              : `We sent a 6-digit code to ${email}`}
          </p>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          {step === 'email' ? (
            <form key="email" onSubmit={doSendOtp} className="space-y-4 ab-fade-in">
              <div>
                <label className="block text-[13px] font-700 text-slate-700 mb-1.5">Email address</label>
                <input type="email" value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="your@email.com" autoFocus
                  className={`w-full h-12 rounded-xl border px-4 text-[14px] outline-none transition focus:ring-4 ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-cobalt focus:ring-cobalt/10'}`}
                />
                {error && <p key={error} className="mt-1.5 text-[12px] text-red-500 ab-fade-in">{error}</p>}
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-12 rounded-xl bg-cobalt font-bold text-[14px] text-white transition-all duration-200 hover:bg-cobalt-700 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><AuthSpinner /> Sending…</> : 'Send sign-in code →'}
              </button>
              <p className="text-[12px] text-slate-400 text-center leading-relaxed">
                New here? An account is created automatically on first sign-in.
              </p>
            </form>
          ) : (
            <form key="otp" ref={otpFormRef} onSubmit={doVerifyOtp} className="space-y-4 ab-fade-in">
              {devOtp && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-700">
                  Email delivery paused — domain not yet verified. Code pre-filled for testing.
                </div>
              )}
              <div>
                <label className="block text-[13px] font-700 text-slate-700 mb-1.5">6-digit code</label>
                <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6}
                  value={otp} onChange={handleOtpInput} autoFocus
                  placeholder="000000"
                  className={`w-full h-16 rounded-xl border text-center text-[32px] font-mono font-bold outline-none tracking-[10px] transition focus:ring-4 ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-cobalt focus:ring-cobalt/10'}`}
                />
                {error && <p key={error} className="mt-1.5 text-[12px] text-red-500 ab-fade-in">{error}</p>}
              </div>
              <button type="submit" disabled={loading || otp.length !== 6}
                className="w-full h-12 rounded-xl bg-cobalt font-bold text-[14px] text-white transition-all duration-200 hover:bg-cobalt-700 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><AuthSpinner /> Verifying…</> : 'Verify & sign in →'}
              </button>
              <div className="flex items-center justify-between text-[12.5px]">
                <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition">
                  <ArrowLeft size={14} /> Change email
                </button>
                {resendSecs > 0 ? (
                  <span className="text-slate-400">Resend in {resendSecs}s</span>
                ) : (
                  <button type="button" onClick={doSendOtp}
                    className="flex items-center gap-1 text-cobalt font-semibold hover:underline">
                    <RefreshCw size={13} /> Resend code
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function AuthSpinner() {
  return (
    <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', flexShrink:0, display:'inline-block', animation:'spin .7s linear infinite' }} />
  );
}

Object.assign(window, { CustomerContext, CustomerProvider, useCustomer, AuthModal });
