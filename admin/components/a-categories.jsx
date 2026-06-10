/* Admin Panel — Categories Page */

function CategoriesPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useAdmin();
  const [search, setSearch] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');

  const [modalMode, setModalMode] = React.useState(null); // 'add' | 'edit' | 'delete'
  const [activeItem, setActiveItem] = React.useState(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [toast, setToast] = React.useState({ visible: false, msg: '', type: 'success' });
  
  // Reassignment for deletion
  const [reassignTo, setReassignTo] = React.useState('');

  function showToast(msg, type = 'success') {
    setToast({ visible: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  }

  const filtered = React.useMemo(() => {
    return (categories || []).filter(c => {
      if (filterStatus !== 'all' && c.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return (c.name || '').toLowerCase().includes(q) || (c.id || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [categories, search, filterStatus]);

  function handleAdd() {
    setActiveItem({ name: '', id: '', short: '', icon: 'Box', image: '', blurb: '', accent: '#0B2545', status: 'active', displayOrder: 99 });
    setModalMode('add');
  }

  function handleEdit(c) {
    setActiveItem({ ...c });
    setModalMode('edit');
  }

  function handleDeleteReq(c) {
    setActiveItem({ ...c });
    setReassignTo('');
    setModalMode('delete');
  }

  async function handleToggleStatus(c) {
    const newStatus = c.status === 'active' ? 'inactive' : 'active';
    try {
      await updateCategory(c.id, { status: newStatus });
      showToast(`Category marked as ${newStatus}`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function onSave(e) {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (modalMode === 'add') {
        // Simple auto-slug if empty
        if (!activeItem.id) activeItem.id = activeItem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        await addCategory(activeItem);
        showToast('Category created');
      } else {
        await updateCategory(activeItem.id, activeItem);
        showToast('Category updated');
      }
      setModalMode(null);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setIsSaving(false);
  }

  async function onDeleteConf() {
    setIsSaving(true);
    try {
      const linkedProducts = products.filter(p => p.cat === activeItem.id);
      
      // Reassign linked products if a new category was chosen
      if (linkedProducts.length > 0) {
        if (!reassignTo) {
          showToast('Please select a category to reassign products to.', 'error');
          setIsSaving(false);
          return;
        }
        for (const p of linkedProducts) {
          // You should have an updateProduct from useAdmin
          // Note: doing this in a loop might be slow if there are many products,
          // but for this scale, it should be fine. Alternatively, a batch endpoint.
          // Since we are in the admin dashboard, we'll await a fetch to update products one by one or create a batch route.
          // The current `updateProduct` updates the server.
          await window.useAdmin().updateProduct(p.id, { cat: reassignTo });
        }
      }

      await deleteCategory(activeItem.id);
      showToast('Category deleted');
      setModalMode(null);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setIsSaving(false);
  }

  const getProductCount = (catId) => products.filter(p => p.cat === catId).length;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <AdminToast message={toast.msg} type={toast.type} visible={toast.visible} />

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-800 text-slate-800">Categories</h2>
          <p className="text-sm text-slate-400 mt-0.5">{categories?.length || 0} categories total</p>
        </div>
        <Btn onClick={handleAdd}><Icon.Plus /> Add Category</Btn>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Icon.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="appearance-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-500 outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-700 text-slate-500 uppercase tracking-wider">
                <th className="p-4 w-12 text-center">Image</th>
                <th className="p-4">Name & Slug</th>
                <th className="p-4 w-24 text-center">Order</th>
                <th className="p-4 w-24 text-center">Products</th>
                <th className="p-4 w-28">Status</th>
                <th className="p-4 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {filtered.map(c => {
                const count = getProductCount(c.id);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 text-center">
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="w-9 h-9 rounded bg-slate-100 object-cover mx-auto" />
                      ) : (
                        <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center text-slate-400 mx-auto" style={{ color: c.accent || '#94a3b8' }}>
                          {Icon[c.icon] ? Icon[c.icon]() : <Icon.Box />}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-600 text-slate-800">{c.name}</div>
                      <div className="text-[11.5px] text-slate-400 font-mono mt-0.5">{c.id}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-2 py-1 bg-slate-100 rounded text-xs font-600 text-slate-600">{c.displayOrder}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-700 ${count > 0 ? 'bg-cobalt/10 text-cobalt' : 'bg-slate-100 text-slate-400'}`}>
                        {count}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge label={c.status === 'active' ? 'Active' : 'Inactive'} variant={c.status === 'active' ? 'active' : 'draft'} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleToggleStatus(c)} className="p-1.5 text-slate-400 hover:text-amber-600 bg-white hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all" title={c.status === 'active' ? 'Archive (Set Inactive)' : 'Unarchive (Set Active)'}>
                          <Icon.Archive size={16} />
                        </button>
                        <button onClick={() => handleEdit(c)} className="p-1.5 text-slate-400 hover:text-cobalt bg-white hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all" title="Edit">
                          <Icon.Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteReq(c)} className="p-1.5 text-slate-400 hover:text-red-500 bg-white hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-all" title="Delete">
                          <Icon.Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 text-sm">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      <Modal open={modalMode === 'add' || modalMode === 'edit'} onClose={() => !isSaving && setModalMode(null)} title={modalMode === 'add' ? 'New Category' : 'Edit Category'} size="lg">
        {activeItem && (
          <form onSubmit={onSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Category Name" value={activeItem.name} onChange={e => setActiveItem({ ...activeItem, name: e.target.value })} required />
              <Input label="Slug (ID)" value={activeItem.id} onChange={e => setActiveItem({ ...activeItem, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })} placeholder="auto-generated if empty" disabled={modalMode === 'edit'} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Short Name" value={activeItem.short} onChange={e => setActiveItem({ ...activeItem, short: e.target.value })} placeholder="e.g. Household" />
              <Input label="Vector Icon" value={activeItem.icon} onChange={e => setActiveItem({ ...activeItem, icon: e.target.value })} placeholder="e.g. Home, Spray, Car" />
            </div>

            <div>
              <label className="block text-sm font-600 text-slate-700 mb-1.5">Image URL (Optional override)</label>
              <input value={activeItem.image || ''} onChange={e => setActiveItem({ ...activeItem, image: e.target.value })} placeholder="https://..." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-cobalt" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Accent Color" type="color" value={activeItem.accent} onChange={e => setActiveItem({ ...activeItem, accent: e.target.value })} />
              <Input label="Display Order" type="number" value={activeItem.displayOrder} onChange={e => setActiveItem({ ...activeItem, displayOrder: parseInt(e.target.value) || 0 })} />
            </div>

            <div>
              <label className="block text-sm font-600 text-slate-700 mb-1.5">Short Description / Blurb</label>
              <textarea value={activeItem.blurb || ''} onChange={e => setActiveItem({ ...activeItem, blurb: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-cobalt resize-none" />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={activeItem.status === 'active'} onChange={e => setActiveItem({ ...activeItem, status: e.target.checked ? 'active' : 'inactive' })} className="h-4 w-4 rounded accent-cobalt" />
                <span className="text-sm font-600 text-slate-700">Active (Visible in store)</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <Btn type="button" variant="secondary" className="flex-1" onClick={() => setModalMode(null)} disabled={isSaving}>Cancel</Btn>
              <Btn type="submit" className="flex-1" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Category'}</Btn>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={modalMode === 'delete'} onClose={() => !isSaving && setModalMode(null)} title="Delete Category" size="sm">
        {activeItem && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to delete the category <strong className="text-slate-800">{activeItem.name}</strong>?
            </p>

            {(() => {
              const count = getProductCount(activeItem.id);
              if (count > 0) {
                return (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
                    <div className="flex items-start gap-2.5 text-amber-800">
                      <Icon.Warning className="shrink-0 mt-0.5" />
                      <p className="text-sm font-600">This category has {count} linked product{count !== 1 ? 's' : ''}.</p>
                    </div>
                    <p className="text-xs text-amber-700/80 leading-relaxed">You must reassign these products to another category before deleting.</p>
                    <select value={reassignTo} onChange={e => setReassignTo(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-amber-300/50 bg-white text-sm outline-none">
                      <option value="">Select new category...</option>
                      {categories.filter(c => c.id !== activeItem.id).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                );
              }
              return null;
            })()}

            <div className="flex gap-3 pt-4">
              <Btn type="button" variant="secondary" className="flex-1" onClick={() => setModalMode(null)} disabled={isSaving}>Cancel</Btn>
              <Btn type="button" variant="danger" className="flex-1" onClick={onDeleteConf} disabled={isSaving || (getProductCount(activeItem.id) > 0 && !reassignTo)}>
                {isSaving ? 'Deleting...' : 'Confirm Delete'}
              </Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

window.CategoriesPage = CategoriesPage;
