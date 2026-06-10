/* Admin Panel — Login Page */

function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPw,   setShowPw]   = React.useState(false);
  const [loading,  setLoading]  = React.useState(false);
  const [error,    setError]    = React.useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password) return setError('Please enter your username and password.');
    setLoading(true); setError('');
    const res = await login(username, password);
    setLoading(false);
    if (!res.ok) setError(res.error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ink via-[#1a3a6a] to-cobalt px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{position:'absolute',top:'-20%',right:'-10%',width:'600px',height:'600px',borderRadius:'50%',background:'rgba(30,80,224,0.12)',filter:'blur(80px)'}}/>
        <div style={{position:'absolute',bottom:'-20%',left:'-10%',width:'500px',height:'500px',borderRadius:'50%',background:'rgba(21,154,76,0.08)',filter:'blur(80px)'}}/>
      </div>

      <div className="relative w-full max-w-[420px] animate-fadein">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src="assets/amahle-blue-logo.jpg"
              alt="Amahle Blue"
              style={{ height: 64, width: 'auto', objectFit: 'contain', background: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: '8px 16px' }}
            />
          </div>
          <h1 className="text-2xl font-800 text-white mb-1">Admin Panel</h1>
          <p className="text-sm text-white/60">Sign in to manage your store</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <div>
              <label className="block text-sm font-600 text-slate-700 mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                autoComplete="username"
                placeholder="Enter your username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-600 text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-slate-200 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20 transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5">
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl bg-cobalt text-white font-700 text-sm hover:bg-cobalt-d active:scale-98 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
              {loading ? <><Spinner size={16}/> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">
            Contact the store owner if you need credentials.
          </p>
        </div>

        <p className="text-center text-xs text-white/40 mt-6">
          Protected admin area · Amahle Blue © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

window.LoginPage = LoginPage;
