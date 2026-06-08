/* Admin Panel — Settings Page + App Root */

function SettingsPage() {
  const { session } = useAuth();
  const [tab,      setTab]      = React.useState('account');
  const [toast,    setToast]    = React.useState({ visible:false, msg:'', type:'success' });
  const [pwForm,   setPwForm]   = React.useState({ current:'', next:'', confirm:'' });
  const [pwErrors, setPwErrors] = React.useState({});
  const [saving,   setSaving]   = React.useState(false);
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNext,    setShowNext]    = React.useState(false);

  function showToast(msg, type='success') {
    setToast({ visible:true, msg, type });
    setTimeout(() => setToast(t=>({...t,visible:false})), 3000);
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    const errs = {};
    if (!pwForm.current)           errs.current = 'Current password is required.';
    if (pwForm.next.length < 8)    errs.next    = 'New password must be at least 8 characters.';
    if (pwForm.next !== pwForm.confirm) errs.confirm = 'Passwords do not match.';
    setPwErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action:'changePassword', token:session.token, currentPassword:pwForm.current, newPassword:pwForm.next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwErrors({ current: data.error || 'Failed to update password.' });
        setSaving(false);
        return;
      }
    } catch {
      setPwErrors({ current: 'Network error — please try again.' });
      setSaving(false);
      return;
    }
    setSaving(false);
    setPwForm({ current:'', next:'', confirm:'' });
    showToast('Password changed successfully');
  }

  function handleResetData() {
    // Clear local caches; the KV data will reseed on next load
    localStorage.removeItem('ab_products');
    showToast('Local cache cleared. Reload to resync from server.', 'error');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <AdminToast message={toast.msg} type={toast.type} visible={toast.visible}/>

      <div>
        <h2 className="text-xl font-800 text-slate-800">Settings</h2>
        <p className="text-sm text-slate-400 mt-0.5">Manage your account and store preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm w-fit">
        {['account','security','store'].map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-500 capitalize transition-all ${tab===t?'bg-cobalt text-white shadow-sm':'text-slate-500 hover:bg-slate-50'}`}>{t}</button>
        ))}
      </div>

      {tab === 'account' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-700 text-slate-700">Account Information</h3>
          <div className="flex items-center gap-4">
            <Avatar name={session?.user?.name} size={56}/>
            <div>
              <p className="font-700 text-slate-800 text-base">{session?.user?.name}</p>
              <p className="text-sm text-slate-500">{session?.user?.email}</p>
              <Badge label={session?.role} variant={session?.role==='admin'?'active':'processing'} className="mt-1"/>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-600 text-slate-500 uppercase tracking-wide mb-1">Username</p>
              <p className="text-sm font-600 text-slate-700">{session?.user?.username}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-600 text-slate-500 uppercase tracking-wide mb-1">Role</p>
              <p className="text-sm font-600 text-slate-700 capitalize">{session?.role}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <div>
            <h3 className="text-sm font-700 text-slate-700">Change Password</h3>
            <p className="text-xs text-slate-400 mt-0.5">Minimum 8 characters recommended</p>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-600 text-slate-700 mb-1.5">Current Password</label>
              <div className="relative">
                <input type={showCurrent?'text':'password'} value={pwForm.current} onChange={e=>setPwForm(f=>({...f,current:e.target.value}))}
                  className={`w-full px-3.5 py-2.5 pr-11 rounded-xl border text-sm outline-none ${pwErrors.current?'border-red-400':'border-slate-200 focus:border-cobalt focus:ring-2 focus:ring-cobalt/20'}`}/>
                <button type="button" onClick={()=>setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <Icon.Eye/>
                </button>
              </div>
              {pwErrors.current && <p className="text-xs text-red-500 mt-1">{pwErrors.current}</p>}
            </div>
            <div>
              <label className="block text-sm font-600 text-slate-700 mb-1.5">New Password</label>
              <div className="relative">
                <input type={showNext?'text':'password'} value={pwForm.next} onChange={e=>setPwForm(f=>({...f,next:e.target.value}))}
                  className={`w-full px-3.5 py-2.5 pr-11 rounded-xl border text-sm outline-none ${pwErrors.next?'border-red-400':'border-slate-200 focus:border-cobalt focus:ring-2 focus:ring-cobalt/20'}`}/>
                <button type="button" onClick={()=>setShowNext(!showNext)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <Icon.Eye/>
                </button>
              </div>
              {pwErrors.next && <p className="text-xs text-red-500 mt-1">{pwErrors.next}</p>}
            </div>
            <Input label="Confirm New Password" type="password" value={pwForm.confirm}
              onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))} error={pwErrors.confirm}/>
            <Btn type="submit" disabled={saving}>{saving?<><Spinner size={14}/>Saving…</>:'Update Password'}</Btn>
          </form>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-600 text-slate-700 mb-1">Session</h4>
            <p className="text-xs text-slate-400 mb-3">Your session expires 8 hours after login and clears when you close the browser.</p>
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-2">
              <Icon.Check/>
              <span className="text-xs text-green-700 font-500">Session active · SHA-256 hashed passwords</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'store' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-700 text-slate-700 mb-4">Store Info</h3>
            <div className="space-y-3 text-sm">
              {[['Store Name','Amahle Blue'],['Phone','067 101 4345'],['Email','info@amahle-blue.co.za'],['Address','Unit H, 13 Main Reef Road, Dunswart, Boksburg, Gauteng']].map(([k,v])=>(
                <div key={k} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-slate-500 font-500">{k}</span>
                  <span className="text-slate-700 font-600 text-right max-w-[240px]">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-700 text-slate-700 mb-1">Data Management</h3>
            <p className="text-xs text-slate-400 mb-4">Products and orders are stored in Vercel KV. Clear the local browser cache if you need to force a resync.</p>
            <Btn variant="danger" size="sm" onClick={handleResetData}>Clear Local Cache</Btn>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <div className="flex gap-2 mb-2"><Icon.Check/><span className="text-sm font-700 text-green-800">Backend Connected</span></div>
            <p className="text-xs text-green-700 leading-relaxed">Products, orders and credentials are stored in <strong>Vercel KV</strong> — persistent across devices and browser sessions. Images are hosted on <strong>Vercel Blob</strong>.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────
function AdminApp() {
  const { session }  = useAuth();
  const { stats }    = useAdmin();
  const [page, setPage] = React.useState('dashboard');

  if (!session) return <LoginPage/>;

  const pages = {
    dashboard: <DashboardPage setPage={setPage}/>,
    products:  <ProductsPage/>,
    orders:    <OrdersPage/>,
    customers: <CustomersPage/>,
    settings:  <SettingsPage/>,
    coupons:   <CouponsPage/>,
    reviews:   <ReviewsPage/>,
    abandoned: <AbandonedPage/>,
  };

  return (
    <AdminLayout page={page} setPage={setPage} stats={stats}>
      {pages[page] || pages.dashboard}
    </AdminLayout>
  );
}

const root = ReactDOM.createRoot(document.getElementById('admin-root'));
root.render(<AdminProvider><AdminApp/></AdminProvider>);
