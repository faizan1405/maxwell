function ShippingEditor() {
  const { shippingRates, addShippingRate, updateShippingRate, deleteShippingRate, fmtMoney, fmtDateTime } = useAdmin();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  // Form State
  const [name, setName] = React.useState('');
  const [country, setCountry] = React.useState('South Africa');
  const [region, setRegion] = React.useState('');
  const [charge, setCharge] = React.useState(0);
  const [minOrderAmount, setMinOrderAmount] = React.useState(0);
  const [freeThreshold, setFreeThreshold] = React.useState(0);
  const [estimatedTime, setEstimatedTime] = React.useState('');
  const [status, setStatus] = React.useState('active');
  const [isDefault, setIsDefault] = React.useState(false);
  const [displayPriority, setDisplayPriority] = React.useState(0);

  function openNew() {
    setEditingId(null);
    setName('');
    setCountry('South Africa');
    setRegion('');
    setCharge(0);
    setMinOrderAmount(0);
    setFreeThreshold(0);
    setEstimatedTime('');
    setStatus('active');
    setIsDefault(false);
    setDisplayPriority(0);
    setModalOpen(true);
  }

  function openEdit(rate) {
    setEditingId(rate.id);
    setName(rate.name);
    setCountry(rate.country);
    setRegion(rate.region || '');
    setCharge(rate.charge);
    setMinOrderAmount(rate.minOrderAmount || 0);
    setFreeThreshold(rate.freeThreshold || 0);
    setEstimatedTime(rate.estimatedTime || '');
    setStatus(rate.status);
    setIsDefault(rate.isDefault || false);
    setDisplayPriority(rate.displayPriority || 0);
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { id: editingId, name, country, region, charge, minOrderAmount, freeThreshold, estimatedTime, status, isDefault, displayPriority };
    const ok = editingId ? await updateShippingRate(payload) : await addShippingRate(payload);
    setSaving(false);
    if (ok) setModalOpen(false);
    else alert('Failed to save shipping rate.');
  }

  async function handleDelete(id) {
    if (confirm('Are you sure you want to delete this shipping rate?')) {
      await deleteShippingRate(id);
    }
  }

  const sortedRates = [...(shippingRates || [])].sort((a,b) => b.displayPriority - a.displayPriority || a.name.localeCompare(b.name));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-800 text-slate-800">Shipping Rates</h1>
          <p className="text-slate-500 text-sm mt-1">Manage delivery charges, regions, and free shipping thresholds.</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Icon.Plus/> Add Rate
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-600">
              <tr>
                <th className="px-6 py-4">Rate Name</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4">Charge</th>
                <th className="px-6 py-4">Free Threshold</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Default</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sortedRates.length === 0 && (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">No shipping rates found. Add one to get started.</td></tr>
              )}
              {sortedRates.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-500">{r.name}</td>
                  <td className="px-6 py-4">{r.region || 'Any'}</td>
                  <td className="px-6 py-4 font-600 text-slate-900">{fmtMoney(r.charge)}</td>
                  <td className="px-6 py-4 text-slate-500">{r.freeThreshold > 0 ? fmtMoney(r.freeThreshold) : '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-600 ${r.status==='active'?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-600'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {r.isDefault && <span className="px-2.5 py-1 rounded-full text-xs font-600 bg-blue-100 text-blue-700">Default</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(r)} className="p-2 text-slate-400 hover:text-cobalt transition-colors inline-block"><Icon.Edit/></button>
                    <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors inline-block ml-1"><Icon.Trash/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}/>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-700 text-slate-800">{editingId ? 'Edit Shipping Rate' : 'New Shipping Rate'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><Icon.Close/></button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-600 text-slate-700">Rate Name</label>
                <input required value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Standard Local" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-cobalt focus:ring-1 focus:ring-cobalt outline-none"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-600 text-slate-700">Country</label>
                  <input required value={country} onChange={e=>setCountry(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-cobalt outline-none"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-600 text-slate-700">Region / Province</label>
                  <input value={region} onChange={e=>setRegion(e.target.value)} placeholder="e.g. Gauteng" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-cobalt outline-none"/>
                  <p className="text-[11px] text-slate-500">Leave blank to match any</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-600 text-slate-700">Delivery Charge (R)</label>
                  <input type="number" step="0.01" min="0" required value={charge} onChange={e=>setCharge(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-cobalt outline-none"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-600 text-slate-700">Estimated Time</label>
                  <input value={estimatedTime} onChange={e=>setEstimatedTime(e.target.value)} placeholder="e.g. 1-2 Days" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-cobalt outline-none"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-600 text-slate-700">Min Order Amount</label>
                  <input type="number" step="0.01" min="0" value={minOrderAmount} onChange={e=>setMinOrderAmount(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-cobalt outline-none"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-600 text-slate-700">Free Delivery Above</label>
                  <input type="number" step="0.01" min="0" value={freeThreshold} onChange={e=>setFreeThreshold(Number(e.target.value))} placeholder="0 for no free delivery" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-cobalt outline-none"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-600 text-slate-700">Status</label>
                  <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-cobalt outline-none">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-600 text-slate-700">Display Priority</label>
                  <input type="number" value={displayPriority} onChange={e=>setDisplayPriority(Number(e.target.value))} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-cobalt outline-none"/>
                </div>
              </div>

              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="checkbox" checked={isDefault} onChange={e=>setIsDefault(e.target.checked)} className="w-5 h-5 text-cobalt rounded border-slate-300 focus:ring-cobalt"/>
                <div className="flex-1">
                  <div className="font-600 text-slate-800 text-sm">Fallback / Default Rate</div>
                  <div className="text-xs text-slate-500">Apply this rate when no other regional rules match.</div>
                </div>
              </label>

            </form>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-xl font-600 text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl font-600 bg-cobalt text-white hover:bg-cobalt/90 transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Rate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

window.ShippingEditor = ShippingEditor;
