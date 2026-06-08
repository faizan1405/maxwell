/* Admin Panel — Coupon Management */

const COUPON_PAGE_SIZE = 10;

function blankCoupon() {
  return { code:'', type:'percentage', value:'', minOrderValue:'', maxUses:'', expiresAt:'', active:true };
}

function CouponForm({ open, onClose, initial, onSave }) {
  const [form,   setForm]   = React.useState(blankCoupon);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    if (!open) return;
    setErrors({});
    if (initial) {
      setForm({
        ...initial,
        value:         String(initial.value),
        minOrderValue: initial.minOrderValue ? String(initial.minOrderValue) : '',
        maxUses:       initial.maxUses       ? String(initial.maxUses)       : '',
        expiresAt:     initial.expiresAt     ? new Date(initial.expiresAt).toISOString().slice(0, 10) : '',
      });
    } else {
      setForm(blankCoupon());
    }
  }, [open, initial]);

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  function validate() {
    const e = {};
    if (!form.code.trim()) e.code = 'Coupon code is required.';
    const v = parseFloat(form.value);
    if (!form.value || isNaN(v) || v <= 0) e.value = 'Valid discount value is required.';
    if (form.type === 'percentage' && v > 100) e.value = 'Percentage cannot exceed 100.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    await onSave({
      ...form,
      code:          form.code.trim().toUpperCase(),
      value:         parseFloat(form.value),
      minOrderValue: form.minOrderValue ? parseFloat(form.minOrderValue) : 0,
      maxUses:       form.maxUses       ? parseInt(form.maxUses)         : null,
      expiresAt:     form.expiresAt     ? new Date(form.expiresAt + 'T23:59:59').getTime() : null,
    });
    setSaving(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} size="md" title={initial ? 'Edit Coupon' : 'New Coupon'}
      footer={<><Btn variant="secondary" onClick={onClose}>Cancel</Btn><Btn onClick={handleSave} disabled={saving}>{saving?<><Spinner size={14}/>Saving…</>:(initial?'Save Changes':'Create Coupon')}</Btn></>}
    >
      <div className="space-y-4">
        <Input label="Coupon Code *" value={form.code} onChange={e=>set('code',e.target.value.toUpperCase())}
          placeholder="e.g. SAVE20" error={errors.code} hint="Auto-uppercased · customers type this at checkout" />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Discount Type" value={form.type} onChange={e=>set('type',e.target.value)}>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (R)</option>
          </Select>
          <Input label={`Value * ${form.type==='percentage'?'(%)':'(R)'}`} type="number" min="0.01" step="0.01"
            value={form.value} onChange={e=>set('value',e.target.value)} error={errors.value}
            placeholder={form.type==='percentage'?'e.g. 20':'e.g. 50'} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Min Order Value (R)" type="number" min="0" step="0.01"
            value={form.minOrderValue} onChange={e=>set('minOrderValue',e.target.value)}
            placeholder="0 = no minimum" />
          <Input label="Max Uses" type="number" min="1" step="1"
            value={form.maxUses} onChange={e=>set('maxUses',e.target.value)}
            placeholder="Blank = unlimited" />
        </div>
        <Input label="Expiry Date" type="date" value={form.expiresAt} onChange={e=>set('expiresAt',e.target.value)}
          hint="Leave blank for no expiry" />
        <Toggle checked={form.active} onChange={v=>set('active',v)} label="Active (customers can redeem this coupon)" />
      </div>
    </Modal>
  );
}

function CouponsPage() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon, fmtMoney, fmtDate } = useAdmin();
  const { isAdmin } = useAuth();
  const [search,   setSearch]   = React.useState('');
  const [page,     setPage]     = React.useState(1);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing,  setEditing]  = React.useState(null);
  const [deleting, setDeleting] = React.useState(null);
  const [toast,    setToast]    = React.useState({ visible:false, msg:'', type:'success' });

  function showToast(msg, type='success') {
    setToast({ visible:true, msg, type });
    setTimeout(() => setToast(t=>({...t,visible:false})), 3000);
  }

  const filtered = React.useMemo(() => {
    if (!search.trim()) return coupons;
    const q = search.toLowerCase();
    return coupons.filter(c => c.code.toLowerCase().includes(q));
  }, [coupons, search]);

  const paged = filtered.slice((page-1)*COUPON_PAGE_SIZE, page*COUPON_PAGE_SIZE);
  React.useEffect(() => setPage(1), [search]);

  async function handleSave(payload) {
    if (editing) { await updateCoupon(editing.id, payload); showToast('Coupon updated'); }
    else         { await addCoupon(payload);                showToast('Coupon created'); }
  }

  async function handleToggle(c) {
    await updateCoupon(c.id, { active: !c.active });
    showToast(`Coupon ${c.active?'deactivated':'activated'}`);
  }

  async function handleDelete(c) {
    await deleteCoupon(c.id);
    showToast('Coupon deleted', 'error');
    setDeleting(null);
  }

  const now = Date.now();

  return (
    <div className="space-y-5">
      <AdminToast message={toast.msg} type={toast.type} visible={toast.visible}/>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-800 text-slate-800">Coupons</h2>
          <p className="text-sm text-slate-400 mt-0.5">{coupons.length} coupon{coupons.length!==1?'s':''} total</p>
        </div>
        {isAdmin && (
          <Btn onClick={() => { setEditing(null); setFormOpen(true); }}><Icon.Plus/> New Coupon</Btn>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-4 border-b border-slate-50">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by code…"/>
        </div>

        {filtered.length === 0 ? (
          <Empty icon="🎟️" title="No coupons found"
            description={search?'Try a different search.':'Create your first coupon to get started.'}/>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="text-left px-4 py-3 text-xs font-600 text-slate-400 uppercase tracking-wide">Code</th>
                    <th className="text-left px-4 py-3 text-xs font-600 text-slate-400 uppercase tracking-wide">Discount</th>
                    <th className="text-left px-4 py-3 text-xs font-600 text-slate-400 uppercase tracking-wide hidden sm:table-cell">Min Order</th>
                    <th className="text-left px-4 py-3 text-xs font-600 text-slate-400 uppercase tracking-wide hidden md:table-cell">Uses</th>
                    <th className="text-left px-4 py-3 text-xs font-600 text-slate-400 uppercase tracking-wide hidden lg:table-cell">Expires</th>
                    <th className="text-left px-4 py-3 text-xs font-600 text-slate-400 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3"/>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paged.map(c => {
                    const expired   = c.expiresAt && c.expiresAt < now;
                    const exhausted = c.maxUses != null && (c.usedCount||0) >= c.maxUses;
                    const label     = !c.active ? 'inactive' : expired ? 'expired' : exhausted ? 'exhausted' : 'active';
                    const labelCls  = label==='active' ? 'bg-green-100 text-green-700' : label==='inactive' ? 'bg-slate-100 text-slate-500' : 'bg-red-50 text-red-500';
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-700 text-cobalt font-mono tracking-wide">{c.code}</td>
                        <td className="px-4 py-3 text-slate-700">
                          {c.type==='percentage' ? `${c.value}% off` : `${fmtMoney(c.value)} off`}
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                          {c.minOrderValue>0 ? fmtMoney(c.minOrderValue) : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                          {c.usedCount||0}{c.maxUses!=null?` / ${c.maxUses}`:''}
                        </td>
                        <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">
                          {c.expiresAt ? fmtDate(c.expiresAt) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-600 capitalize ${labelCls}`}>{label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end">
                            {isAdmin && <Toggle checked={c.active} onChange={() => handleToggle(c)}/>}
                            <button onClick={() => { setEditing(c); setFormOpen(true); }}
                              className="p-1.5 text-slate-400 hover:text-cobalt hover:bg-cobalt/5 rounded-lg transition-colors">
                              <Icon.Edit/>
                            </button>
                            {isAdmin && (
                              <button onClick={() => setDeleting(c)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Icon.Trash/>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-4">
              <Pagination page={page} total={filtered.length} pageSize={COUPON_PAGE_SIZE} onChange={setPage}/>
            </div>
          </>
        )}
      </div>

      <CouponForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        initial={editing}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => handleDelete(deleting)}
        title="Delete Coupon"
        message={`Permanently delete coupon "${deleting?.code}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}

window.CouponsPage = CouponsPage;
