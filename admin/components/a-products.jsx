/* Admin Panel — Products Management */

const CATEGORIES = [
  { id:'household', label:'Household Cleaning' },
  { id:'sanitiser', label:'Sanitisers & Disinfectants' },
  { id:'car',       label:'Car Care' },
];
const BADGES  = [null,'Bestseller','New','High Purity','Sale'];
const STATUSES= ['active','draft','archived'];
const PAGE_SIZE = 8;

// ── Blank product form ────────────────────────────────────────────────────────
function blankProduct() {
  return { name:'', cat:'household', sub:'', price:'', was:'', size:'', sku:'', scent:'', badge:null, img:'', desc:'', stock:0, lowStockThreshold:10, status:'active', benefits:['','','',''], variants:[], rating:4.8, reviews:0 };
}

// ── Variant row ───────────────────────────────────────────────────────────────
function VariantRow({ v, idx, onChange, onRemove }) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
      <input value={v.name} onChange={e=>onChange(idx,'name',e.target.value)} placeholder="Size (e.g. 1L)"
        className="min-w-0 px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-cobalt"/>
      <input value={v.price} onChange={e=>onChange(idx,'price',e.target.value)} placeholder="Price"
        type="number" min="0" step="0.01"
        className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-cobalt"/>
      <input value={v.stock} onChange={e=>onChange(idx,'stock',e.target.value)} placeholder="Stock"
        type="number" min="0"
        className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-cobalt"/>
      <button onClick={()=>onRemove(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Icon.Trash/></button>
    </div>
  );
}

// ── Product Form Modal ────────────────────────────────────────────────────────
function ProductForm({ open, onClose, initial, onSave }) {
  const [form,   setForm]   = React.useState(blankProduct);
  const [saving, setSaving] = React.useState(false);
  const [errors,       setErrors]       = React.useState({});
  const [imgUploading, setImgUploading] = React.useState(false);
  const [imgError,     setImgError]     = React.useState('');

  React.useEffect(() => {
    if (open) { setForm(initial ? {...initial, benefits: (initial.benefits||['','','','']).slice(0,4).concat(['','','','']).slice(0,4) } : blankProduct()); setImgError(''); }
    if (!open) setErrors({});
  }, [open, initial]);

  const set = (field, val) => setForm(f => ({...f, [field]: val}));
  const setBenefit = (i, val) => setForm(f => { const b=[...f.benefits]; b[i]=val; return {...f,benefits:b}; });
  const addVariant = () => setForm(f => ({...f, variants:[...f.variants, {name:'',price:'',stock:0}]}));
  const removeVariant = i => setForm(f => ({...f, variants:f.variants.filter((_,idx)=>idx!==i)}));
  const changeVariant = (i,field,val) => setForm(f => { const v=[...f.variants]; v[i]={...v[i],[field]:field==='stock'?parseInt(val)||0:field==='price'?parseFloat(val)||0:val}; return {...f,variants:v}; });

  function validate() {
    const e = {};
    if (!form.name.trim())  e.name  = 'Product name is required.';
    if (!form.price || isNaN(parseFloat(form.price))) e.price = 'Valid price is required.';
    if (!form.sku.trim())   e.sku   = 'SKU is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const data = {
      ...form,
      price: parseFloat(form.price)||0,
      was:   form.was ? parseFloat(form.was)||null : null,
      stock: parseInt(form.stock)||0,
      lowStockThreshold: parseInt(form.lowStockThreshold)||10,
      benefits: form.benefits.filter(Boolean),
    };
    await onSave(data);
    setSaving(false);
    onClose();
  }

  const isEdit = !!initial;

  return (
    <Modal open={open} onClose={onClose} size="xl" title={isEdit ? `Edit: ${initial?.name}` : 'Add New Product'}
      footer={<><Btn variant="secondary" onClick={onClose}>Cancel</Btn><Btn onClick={handleSave} disabled={saving}>{saving?<><Spinner size={14}/>Saving…</>:isEdit?'Save Changes':'Add Product'}</Btn></>}
    >
      <div className="space-y-5">
        {/* Basic Info */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Product Name *" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. All Purpose Cleaner" error={errors.name} className="sm:col-span-2"/>
          <Input label="Subtitle" value={form.sub} onChange={e=>set('sub',e.target.value)} placeholder="e.g. 5L Concentrated Formula"/>
          <Select label="Category" value={form.cat} onChange={e=>set('cat',e.target.value)}>
            {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
        </div>

        {/* Pricing & SKU */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Input label="Price (R) *" type="number" min="0" step="0.01" value={form.price} onChange={e=>set('price',e.target.value)} placeholder="0.00" error={errors.price}/>
          <Input label="Compare-at Price" type="number" min="0" step="0.01" value={form.was||''} onChange={e=>set('was',e.target.value)} placeholder="0.00"/>
          <Input label="Size / Unit" value={form.size} onChange={e=>set('size',e.target.value)} placeholder="e.g. 5L"/>
          <Input label="SKU *" value={form.sku} onChange={e=>set('sku',e.target.value)} placeholder="ABC-5L-001" error={errors.sku}/>
        </div>

        {/* Stock */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Input label="Stock Quantity" type="number" min="0" value={form.stock} onChange={e=>set('stock',e.target.value)}/>
          <Input label="Low Stock Alert" type="number" min="0" value={form.lowStockThreshold} onChange={e=>set('lowStockThreshold',e.target.value)} hint="Alert when below this number"/>
          <Select label="Status" value={form.status} onChange={e=>set('status',e.target.value)}>
            {STATUSES.map(s=><option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </Select>
          <Select label="Badge" value={form.badge||''} onChange={e=>set('badge',e.target.value||null)}>
            <option value="">No badge</option>
            {BADGES.filter(Boolean).map(b=><option key={b} value={b}>{b}</option>)}
          </Select>
        </div>

        {/* Image & Scent */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-600 text-slate-700 mb-1">Product Image</label>
            <label className={`relative flex flex-col items-center justify-center w-full h-28 sm:h-36 rounded-xl border-2 border-dashed transition-colors overflow-hidden
              ${imgUploading ? 'border-cobalt/40 bg-cobalt/5 cursor-wait' : form.img ? 'border-cobalt/40 bg-cobalt/5 cursor-pointer' : 'border-slate-200 bg-slate-50 hover:border-cobalt/40 hover:bg-cobalt/5 cursor-pointer'}`}>
              {form.img && !imgUploading && (
                <img src={form.img} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-xl"/>
              )}
              {imgUploading ? (
                <div className="flex flex-col items-center gap-2 text-cobalt z-10">
                  <Spinner size={24}/>
                  <span className="text-xs font-600">Uploading…</span>
                </div>
              ) : !form.img ? (
                <div className="flex flex-col items-center gap-1 text-slate-400 pointer-events-none">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span className="text-xs font-600">Click to upload image</span>
                  <span className="text-xs text-slate-300">JPG, PNG, WEBP · max 5 MB</span>
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl z-10">
                  <span className="text-white text-xs font-600">Change image</span>
                </div>
              )}
              <input type="file" accept="image/*" disabled={imgUploading} className="hidden" onChange={async e => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImgError('');
                // Instant local preview
                const reader = new FileReader();
                reader.onload = ev => set('img', ev.target.result);
                reader.readAsDataURL(file);
                // Upload to Vercel Blob
                setImgUploading(true);
                try {
                  const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': file.type, 'x-filename': file.name },
                    body: file,
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || 'Upload failed');
                  set('img', data.url); // replace base64 with permanent CDN URL
                } catch (err) {
                  setImgError('Upload failed — image saved locally only. ' + err.message);
                } finally {
                  setImgUploading(false);
                }
              }}/>
            </label>
            {imgError && <p className="text-xs text-amber-600 mt-1">{imgError}</p>}
            {form.img && !imgUploading && (
              <button type="button" onClick={() => { set('img',''); setImgError(''); }}
                className="mt-1.5 text-xs text-red-500 hover:text-red-700 hover:underline">
                Remove image
              </button>
            )}
          </div>
          <Input label="Scent / Type" value={form.scent||''} onChange={e=>set('scent',e.target.value)} placeholder="e.g. Fresh Citrus"/>
        </div>

        {/* Description */}
        <Textarea label="Description" value={form.desc} onChange={e=>set('desc',e.target.value)} rows={3} placeholder="Describe the product…"/>

        {/* Benefits */}
        <div>
          <label className="block text-sm font-600 text-slate-700 mb-2">Key Benefits (up to 4)</label>
          <div className="grid sm:grid-cols-2 gap-2">
            {form.benefits.map((b,i)=>(
              <input key={i} value={b} onChange={e=>setBenefit(i,e.target.value)} placeholder={`Benefit ${i+1}`}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20"/>
            ))}
          </div>
        </div>

        {/* Variants */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-600 text-slate-700">Product Variants</label>
            <Btn variant="ghost" size="sm" onClick={addVariant}><Icon.Plus/> Add Variant</Btn>
          </div>
          {form.variants.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2 px-3 text-xs font-600 text-slate-400 uppercase tracking-wide mb-1">
                <span>Size / Name</span><span>Price (R)</span><span>Stock</span>
              </div>
              {form.variants.map((v,i)=><VariantRow key={i} v={v} idx={i} onChange={changeVariant} onRemove={removeVariant}/>)}
            </div>
          ) : (
            <p className="text-xs text-slate-400 bg-slate-50 rounded-xl px-4 py-3">No variants. Click "Add Variant" to create size options.</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ── Products Page ─────────────────────────────────────────────────────────────
function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, fmtMoney } = useAdmin();
  const { isAdmin } = useAuth();

  const [search,    setSearch]    = React.useState('');
  const [catFilter, setCatFilter] = React.useState('all');
  const [statusFilter, setStatus] = React.useState('all');
  const [sort,      setSort]      = React.useState('name');
  const [page,      setPage]      = React.useState(1);
  const [formOpen,  setFormOpen]  = React.useState(false);
  const [editing,   setEditing]   = React.useState(null);
  const [deleting,  setDeleting]  = React.useState(null);
  const [archiving, setArchiving] = React.useState(null);
  const [selected,  setSelected]  = React.useState(new Set());
  const [toast,     setToast]     = React.useState({ visible:false, msg:'', type:'success' });

  function showToast(msg, type='success') {
    setToast({ visible:true, msg, type });
    setTimeout(() => setToast(t=>({...t,visible:false})), 3000);
  }

  // Filter + sort
  const filtered = React.useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q)||p.sku?.toLowerCase().includes(q)||(p.sub||'').toLowerCase().includes(q));
    }
    if (catFilter !== 'all') list = list.filter(p => p.cat === catFilter);
    if (statusFilter !== 'all') list = list.filter(p => p.status === statusFilter);
    list.sort((a,b) => {
      if (sort==='name')       return a.name.localeCompare(b.name);
      if (sort==='price_asc')  return a.price - b.price;
      if (sort==='price_desc') return b.price - a.price;
      if (sort==='stock_asc')  return a.stock - b.stock;
      if (sort==='stock_desc') return b.stock - a.stock;
      if (sort==='newest')     return (b.createdAt||0)-(a.createdAt||0);
      return 0;
    });
    return list;
  }, [products, search, catFilter, statusFilter, sort]);

  const paged = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  React.useEffect(() => setPage(1), [search, catFilter, statusFilter, sort]);

  // Stats
  const activeCount  = products.filter(p=>p.status==='active').length;
  const draftCount   = products.filter(p=>p.status==='draft').length;
  const archivedCount= products.filter(p=>p.status==='archived').length;
  const lowCount     = products.filter(p=>p.status==='active'&&p.stock<=p.lowStockThreshold).length;

  // Bulk select
  function toggleSelect(id) {
    setSelected(s => { const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; });
  }
  function toggleAll() {
    if (selected.size===paged.length) setSelected(new Set());
    else setSelected(new Set(paged.map(p=>p.id)));
  }

  function bulkArchive() {
    selected.forEach(id => updateProduct(id, {status:'archived'}));
    showToast(`${selected.size} product(s) archived`);
    setSelected(new Set());
  }

  async function handleSave(data) {
    if (editing) { updateProduct(editing.id, data); showToast('Product updated successfully'); }
    else { addProduct(data); showToast('Product added successfully'); }
  }

  const catLabel = { household:'Household', sanitiser:'Sanitiser', car:'Car Care' };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <AdminToast message={toast.msg} type={toast.type} visible={toast.visible}/>

      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h2 className="text-xl font-800 text-slate-800">Products</h2>
          <p className="text-sm text-slate-400 mt-0.5">{products.length} total products</p>
        </div>
        <Btn onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Icon.Plus/> Add Product
        </Btn>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[['Active',activeCount,'text-green-600','bg-green-50'],['Draft',draftCount,'text-amber-600','bg-amber-50'],['Archived',archivedCount,'text-slate-500','bg-slate-50'],['Low Stock',lowCount,'text-red-600','bg-red-50']].map(([l,v,tc,bc])=>(
          <div key={l} className={`${bc} rounded-xl px-4 py-3 flex items-center justify-between`}>
            <span className="text-xs font-600 text-slate-500">{l}</span>
            <span className={`text-lg font-800 ${tc}`}>{v}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search products…"/>
          <select value={catFilter} onChange={e=>setCatFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-cobalt bg-white">
            <option value="all">All Categories</option>
            {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select value={statusFilter} onChange={e=>setStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-cobalt bg-white">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <select value={sort} onChange={e=>setSort(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-cobalt bg-white">
            <option value="name">Name A–Z</option>
            <option value="price_asc">Price: Low–High</option>
            <option value="price_desc">Price: High–Low</option>
            <option value="stock_asc">Stock: Low–High</option>
            <option value="stock_desc">Stock: High–Low</option>
            <option value="newest">Newest first</option>
          </select>
          {selected.size > 0 && (
            <div className="flex gap-2 ml-auto">
              <span className="text-sm text-slate-500 self-center">{selected.size} selected</span>
              <Btn variant="secondary" size="sm" onClick={bulkArchive}><Icon.Archive/> Archive</Btn>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <Empty icon={<Icon.Box/>} title="No products found" description="Try adjusting your filters or add a new product."
            action={<Btn onClick={()=>{ setEditing(null); setFormOpen(true); }}><Icon.Plus/> Add Product</Btn>}/>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-5 py-3.5 w-10">
                      <input type="checkbox" checked={selected.size===paged.length&&paged.length>0} onChange={toggleAll} className="rounded"/>
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Product</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide hidden sm:table-cell">SKU</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Price</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Stock</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paged.map(p => {
                    const low = p.status==='active' && p.stock <= p.lowStockThreshold;
                    return (
                      <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${selected.has(p.id)?'bg-cobalt/5':''}`}>
                        <td className="px-5 py-3.5">
                          <input type="checkbox" checked={selected.has(p.id)} onChange={()=>toggleSelect(p.id)} className="rounded"/>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <img src={p.img} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-slate-50 border border-slate-100 flex-shrink-0" onError={e=>e.target.style.opacity='.3'}/>
                            <div className="min-w-0">
                              <p className="font-600 text-slate-800 truncate max-w-[160px]">{p.name}</p>
                              <p className="text-xs text-slate-400 truncate max-w-[160px]">{p.sub}</p>
                            </div>
                            {p.badge && <Badge label={p.badge}/>}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell font-mono text-xs text-slate-400">{p.sku}</td>
                        <td className="px-4 py-3.5 hidden md:table-cell"><Badge label={catLabel[p.cat]||p.cat} variant={p.cat}/></td>
                        <td className="px-4 py-3.5">
                          <div className="font-700 text-slate-800">{fmtMoney(p.price)}</div>
                          {p.was && <div className="text-xs text-slate-400 line-through">{fmtMoney(p.was)}</div>}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`font-700 text-sm ${p.stock===0?'text-red-600':low?'text-amber-600':'text-slate-700'}`}>{p.stock}</span>
                          {low && <div className="text-xs text-amber-500 font-500">Low stock</div>}
                        </td>
                        <td className="px-4 py-3.5"><Badge label={p.status} variant={p.status}/></td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button onClick={()=>{ setEditing(p); setFormOpen(true); }} title="Edit"
                              className="p-1.5 text-slate-400 hover:text-cobalt hover:bg-cobalt/10 rounded-lg transition-colors"><Icon.Edit/></button>
                            {p.status !== 'archived' && (
                              <button onClick={()=>setArchiving(p)} title="Archive"
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Icon.Archive/></button>
                            )}
                            {isAdmin && (
                              <button onClick={()=>setDeleting(p)} title="Delete"
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Icon.Trash/></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 pb-4 pt-1">
              <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage}/>
            </div>
          </>
        )}
      </div>

      {/* Product form modal */}
      <ProductForm open={formOpen} onClose={()=>setFormOpen(false)} initial={editing} onSave={handleSave}/>

      {/* Archive confirm */}
      <ConfirmDialog open={!!archiving} onClose={()=>setArchiving(null)}
        title="Archive Product" confirmLabel="Archive" variant="secondary"
        message={`Archive "${archiving?.name}"? It will be hidden from the storefront but not deleted.`}
        onConfirm={()=>{ updateProduct(archiving.id,{status:'archived'}); showToast('Product archived'); }}
      />

      {/* Delete confirm */}
      <ConfirmDialog open={!!deleting} onClose={()=>setDeleting(null)}
        title="Delete Product" confirmLabel="Delete" variant="danger"
        message={`Permanently delete "${deleting?.name}"? This action cannot be undone.`}
        onConfirm={()=>{ deleteProduct(deleting.id); showToast('Product deleted','error'); }}
      />
    </div>
  );
}

window.ProductsPage = ProductsPage;
