/* Admin Panel — Products Management */

const BADGES  = [null,'Bestseller','New','High Purity','Sale'];
const STATUSES= ['active','draft','archived'];
const PAGE_SIZE = 8;

const MEDIA_LIMITS   = { maxItems: 12, maxImageBytes: 5*1024*1024, maxVideoBytes: 50*1024*1024 };
const _ALLOWED_IMGS  = new Set(['image/jpeg','image/png','image/webp']);
const _ALLOWED_VIDS  = new Set(['video/mp4','video/webm']);

// ── Admin-side primary image helper ──────────────────────────────────────────
function getPrimaryImg(p) {
  if (p && p.media && p.media.length > 0) {
    const pri = p.media.find(m => m.isPrimary && m.type === 'image');
    if (pri && pri.url) return pri.url;
    const fi = p.media.find(m => m.type === 'image');
    if (fi && fi.url) return fi.url;
  }
  return (p && p.img) ? p.img : '../assets/products/placeholder.svg';
}

// ── Blank product ─────────────────────────────────────────────────────────────
function blankProduct() {
  return { name:'', cat:'household', sub:'', price:'', was:'', size:'', sku:'', scent:'', badge:null, img:'', media:[], desc:'', stock:0, lowStockThreshold:10, status:'active', benefits:['','','',''], variants:[], rating:4.8, reviews:0 };
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

// ── Media Gallery Section ─────────────────────────────────────────────────────
function MediaGallerySection({ items, onFilesSelected, onReorder, onSetPrimary, onDelete, disabled }) {
  const fileRef              = React.useRef();
  const [dropZone, setDropZone] = React.useState(false);
  const [dragSrc,  setDragSrc]  = React.useState(null);
  const [dragOver, setDragOver] = React.useState(null);
  const canAdd = items.length < MEDIA_LIMITS.maxItems;

  function handleZoneDrop(e) {
    e.preventDefault();
    setDropZone(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) onFilesSelected(files);
  }

  function startDrag(e, idx) {
    setDragSrc(idx);
    e.dataTransfer.effectAllowed = 'move';
  }

  function overItem(e, idx) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (idx !== dragOver) setDragOver(idx);
  }

  function dropItem(e, idx) {
    e.preventDefault();
    e.stopPropagation();
    if (dragSrc !== null && dragSrc !== idx) onReorder(dragSrc, idx);
    setDragSrc(null);
    setDragOver(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-600 text-slate-700">
          Media Gallery
          <span className="ml-1.5 text-xs font-400 text-slate-400">({items.length}/{MEDIA_LIMITS.maxItems} · drag to reorder)</span>
        </label>
        {canAdd && !disabled && (
          <button type="button" onClick={()=>fileRef.current?.click()}
            className="text-xs text-cobalt hover:underline font-600">+ Add files</button>
        )}
      </div>

      {/* Drop zone */}
      {canAdd && (
        <div
          onDragEnter={e=>{e.preventDefault();setDropZone(true);}}
          onDragOver={e=>{e.preventDefault();setDropZone(true);}}
          onDragLeave={()=>setDropZone(false)}
          onDrop={handleZoneDrop}
          onClick={()=>!disabled&&fileRef.current?.click()}
          className={`mb-3 flex flex-col items-center justify-center h-16 rounded-xl border-2 border-dashed transition-colors
            ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            ${dropZone ? 'border-cobalt bg-cobalt/10' : 'border-slate-200 bg-slate-50 hover:border-cobalt/40 hover:bg-cobalt/5'}`}
        >
          <div className="flex items-center gap-2 text-slate-400 pointer-events-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span className="text-xs font-600">Drop files or click to upload</span>
          </div>
          <span className="text-[11px] text-slate-300 mt-0.5 pointer-events-none">Images: JPG/PNG/WEBP ≤5 MB · Videos: MP4/WEBM ≤50 MB</span>
        </div>
      )}

      {/* Thumbnail grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {items.map((item, idx) => (
            <div
              key={item.id}
              draggable={item.status === 'done'}
              onDragStart={e=>startDrag(e, idx)}
              onDragOver={e=>overItem(e, idx)}
              onDrop={e=>dropItem(e, idx)}
              onDragEnd={()=>{setDragSrc(null);setDragOver(null);}}
              className={`relative rounded-xl overflow-hidden bg-slate-100 aspect-square select-none transition-all
                ${item.status==='done' ? 'cursor-grab' : 'cursor-default'}
                ${dragOver===idx && dragSrc!==idx ? 'ring-2 ring-cobalt scale-105' : ''}
                ${dragSrc===idx ? 'opacity-40' : ''}`}
            >
              {/* Thumbnail */}
              {item.type === 'video' ? (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              ) : (
                <img src={item.previewUrl || item.url} alt={item.altText||''} className="w-full h-full object-cover" draggable="false"/>
              )}

              {/* Uploading overlay */}
              {item.status === 'uploading' && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1">
                  <Spinner size={18}/>
                  <span className="text-white text-[10px]">Uploading…</span>
                </div>
              )}

              {/* Error overlay */}
              {item.status === 'error' && (
                <div className="absolute inset-0 bg-red-800/80 flex flex-col items-center justify-center p-1 gap-0.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span className="text-white text-[9px] text-center leading-tight">{item.error||'Failed'}</span>
                  <button type="button" onClick={()=>onDelete(idx)} className="text-white text-[9px] underline">Remove</button>
                </div>
              )}

              {/* Badges */}
              {item.status === 'done' && (
                <>
                  {item.isPrimary && item.type === 'image' && (
                    <span className="absolute top-1 left-1 bg-cobalt text-white text-[9px] font-700 px-1 py-0.5 rounded leading-none">★</span>
                  )}
                  {item.type === 'video' && (
                    <span className="absolute top-1 right-1 bg-slate-700/80 text-white text-[9px] font-600 px-1 py-0.5 rounded leading-none">VID</span>
                  )}
                </>
              )}

              {/* Hover actions */}
              {item.status === 'done' && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-black/40 flex flex-col items-end justify-between p-1">
                  <button type="button" onClick={e=>{e.stopPropagation();onDelete(idx);}}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-0.5">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                  {item.type === 'image' && !item.isPrimary && (
                    <button type="button" onClick={e=>{e.stopPropagation();onSetPrimary(idx);}}
                      className="bg-white/90 hover:bg-white text-cobalt text-[9px] font-700 px-1.5 py-0.5 rounded leading-none">
                      Set main
                    </button>
                  )}
                </div>
              )}

              {/* Sort number */}
              <span className="absolute bottom-0.5 right-0.5 bg-black/40 text-white text-[8px] rounded px-0.5 leading-tight pointer-events-none">{idx+1}</span>
            </div>
          ))}
        </div>
      )}

      <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp,.mp4,.webm" multiple className="hidden"
        onChange={e=>{ const f=Array.from(e.target.files||[]); if(f.length) onFilesSelected(f); e.target.value=''; }}/>
    </div>
  );
}

// ── Product Form Modal ────────────────────────────────────────────────────────
function ProductForm({ open, onClose, initial, onSave }) {
  const { session }                    = useAuth();
  const { categories }                 = useAdmin();
  const [form,       setForm]          = React.useState(blankProduct);
  const [saving,     setSaving]        = React.useState(false);
  const [errors,     setErrors]        = React.useState({});
  const [formError,  setFormError]     = React.useState('');
  const [mediaItems, setMediaItems]    = React.useState([]);

  React.useEffect(() => {
    if (open) {
      setForm(initial
        ? { ...initial, benefits: (initial.benefits||['','','','']).slice(0,4).concat(['','','','']).slice(0,4) }
        : blankProduct()
      );
      setErrors({});
      setFormError('');
      if (initial && Array.isArray(initial.media) && initial.media.length > 0) {
        setMediaItems(initial.media.map(m => ({ ...m, previewUrl: m.url, status: 'done', error: '', _file: null })));
      } else if (initial && initial.img) {
        setMediaItems([{
          id: (initial.id||'legacy') + '-img',
          type: 'image', url: initial.img, previewUrl: initial.img,
          storageKey: null, altText: initial.name||'', sortOrder: 0, isPrimary: true,
          fileName: initial.img.split('/').pop()||'image', mimeType: 'image/jpeg',
          fileSize: 0, createdAt: initial.createdAt||Date.now(),
          status: 'done', error: '', _file: null,
        }]);
      } else {
        setMediaItems([]);
      }
    }
  }, [open, initial]);

  const set         = (field, val) => setForm(f => ({...f, [field]: val}));
  const setBenefit  = (i, val)     => setForm(f => { const b=[...f.benefits]; b[i]=val; return {...f,benefits:b}; });
  const addVariant  = ()           => setForm(f => ({...f, variants:[...f.variants, {name:'',price:'',stock:0}]}));
  const removeVariant = i          => setForm(f => ({...f, variants:f.variants.filter((_,idx)=>idx!==i)}));
  const changeVariant = (i,field,val) => setForm(f => { const v=[...f.variants]; v[i]={...v[i],[field]:field==='stock'?parseInt(val)||0:field==='price'?parseFloat(val)||0:val}; return {...f,variants:v}; });

  async function handleFilesSelected(files) {
    const token  = session?.token;
    const canAdd = MEDIA_LIMITS.maxItems - mediaItems.length;
    const toAdd  = Array.from(files).slice(0, canAdd);
    if (!toAdd.length) return;

    const newItems = toAdd.map(file => ({
      id:         `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type:       _ALLOWED_VIDS.has(file.type) ? 'video' : 'image',
      url:        '',
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
      storageKey: null, altText: '', sortOrder: 0, isPrimary: false,
      fileName: file.name, mimeType: file.type, fileSize: file.size,
      createdAt: Date.now(),
      status: 'uploading', error: '', _file: file,
    }));

    setMediaItems(prev => [...prev, ...newItems]);

    await Promise.all(newItems.map(async item => {
      try {
        const isVid = _ALLOWED_VIDS.has(item.mimeType);
        const isImg = _ALLOWED_IMGS.has(item.mimeType);
        if (!isImg && !isVid) throw new Error('Unsupported file type');
        const maxBytes = isVid ? MEDIA_LIMITS.maxVideoBytes : MEDIA_LIMITS.maxImageBytes;
        if (item.fileSize > maxBytes) throw new Error(`Exceeds ${isVid?'50':'5'} MB limit`);

        const res = await fetch('/api/upload', {
          method:  'POST',
          headers: {
            'Content-Type': item.mimeType,
            'x-filename':   item.fileName,
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: item._file,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');

        setMediaItems(prev => prev.map(m => m.id !== item.id ? m : {
          ...m, url: data.url, storageKey: data.storageKey||null,
          type: data.type || m.type,
          status: 'done', error: '', _file: null,
        }));
      } catch (err) {
        setMediaItems(prev => prev.map(m => m.id !== item.id ? m : {
          ...m, status: 'error', error: err.message, _file: null,
        }));
      }
    }));
  }

  function reorderMedia(srcIdx, dstIdx) {
    setMediaItems(prev => {
      const next = [...prev];
      const [item] = next.splice(srcIdx, 1);
      next.splice(dstIdx, 0, item);
      return next.map((m, i) => ({ ...m, sortOrder: i }));
    });
  }

  function setPrimaryMedia(idx) {
    setMediaItems(prev => prev.map((m, i) => ({ ...m, isPrimary: i === idx && m.type === 'image' })));
  }

  function deleteMediaItem(idx) {
    setMediaItems(prev => {
      const removed = prev[idx];
      const next    = prev.filter((_,i) => i !== idx).map((m,i) => ({ ...m, sortOrder: i }));
      if (removed.isPrimary && removed.type === 'image') {
        const fi = next.find(m => m.type === 'image');
        if (fi) fi.isPrimary = true;
      }
      if (removed.previewUrl && removed.previewUrl.startsWith('blob:')) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  }

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

    const doneMedia = mediaItems
      .filter(m => m.status === 'done')
      .map(({ _file, previewUrl, status, error, ...rest }) => rest)
      .map((m, i) => ({ ...m, sortOrder: i }));

    if (!doneMedia.some(m => m.isPrimary && m.type === 'image')) {
      const fi = doneMedia.find(m => m.type === 'image');
      if (fi) fi.isPrimary = true;
    }

    const primaryImg = doneMedia.find(m => m.isPrimary && m.type === 'image') || doneMedia.find(m => m.type === 'image');

    const data = {
      ...form,
      price:             parseFloat(form.price)||0,
      was:               form.was ? parseFloat(form.was)||null : null,
      stock:             parseInt(form.stock)||0,
      lowStockThreshold: parseInt(form.lowStockThreshold)||10,
      benefits:          form.benefits.filter(Boolean),
      media:             doneMedia,
      img:               primaryImg ? primaryImg.url : (form.img || ''),
    };
    try {
      await onSave(data);
      setSaving(false);
      onClose();
    } catch (err) {
      setSaving(false);
      setFormError(err.message || 'Failed to save product. Please try again.');
    }
  }

  const uploadingCount = mediaItems.filter(m => m.status === 'uploading').length;
  const isEdit         = !!initial;

  return (
    <Modal open={open} onClose={onClose} size="xl" title={isEdit ? `Edit: ${initial?.name}` : 'Add New Product'}
      footer={<>
        {formError && <span className="flex-1 text-xs text-red-600 font-500 mr-2">{formError}</span>}
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={handleSave} disabled={saving||uploadingCount>0}>
          {saving
            ? <><Spinner size={14}/>Saving…</>
            : uploadingCount > 0
              ? <><Spinner size={14}/>{uploadingCount} uploading…</>
              : isEdit ? 'Save Changes' : 'Add Product'}
        </Btn>
      </>}
    >
      <div className="space-y-5">
        {/* Basic Info */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Product Name *" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. All Purpose Cleaner" error={errors.name} className="sm:col-span-2"/>
          <Input label="Subtitle" value={form.sub} onChange={e=>set('sub',e.target.value)} placeholder="e.g. 5L Concentrated Formula"/>
          <Select label="Category" value={form.cat} onChange={e=>set('cat',e.target.value)}>
            {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
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

        {/* Media Gallery */}
        <MediaGallerySection
          items={mediaItems}
          onFilesSelected={handleFilesSelected}
          onReorder={reorderMedia}
          onSetPrimary={setPrimaryMedia}
          onDelete={deleteMediaItem}
          disabled={saving}
        />

        {/* Scent */}
        <Input label="Scent / Type" value={form.scent||''} onChange={e=>set('scent',e.target.value)} placeholder="e.g. Fresh Citrus"/>

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
  const { products, addProduct, updateProduct, deleteProduct, fmtMoney, categories } = useAdmin();
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

  const activeCount   = products.filter(p=>p.status==='active').length;
  const draftCount    = products.filter(p=>p.status==='draft').length;
  const archivedCount = products.filter(p=>p.status==='archived').length;
  const lowCount      = products.filter(p=>p.status==='active'&&p.stock<=p.lowStockThreshold).length;

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
    if (editing) {
      await updateProduct(editing.id, data);
      showToast('Product updated successfully');
    } else {
      await addProduct(data);
      showToast('Product added successfully');
    }
  }

  const catLabel = React.useMemo(() => {
    const map = {};
    categories.forEach(c => { map[c.id] = c.short || c.name; });
    return map;
  }, [categories]);

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
            {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
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
                            <img src={getPrimaryImg(p)} alt={p.name} className="w-10 h-10 rounded-xl object-cover bg-slate-50 border border-slate-100 flex-shrink-0" onError={e=>e.target.style.opacity='.3'}/>
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
        onConfirm={async () => {
          const id = archiving?.id;
          try {
            await updateProduct(id, {status:'archived'});
            showToast('Product archived');
          } catch(err) {
            showToast(err.message || 'Failed to archive product', 'error');
          } finally {
            setArchiving(null);
          }
        }}
      />

      {/* Delete confirm */}
      <ConfirmDialog open={!!deleting} onClose={()=>setDeleting(null)}
        title="Delete Product" confirmLabel="Delete" variant="danger"
        message={`Permanently delete "${deleting?.name}"? This action cannot be undone.`}
        onConfirm={async () => {
          const id = deleting?.id;
          try {
            await deleteProduct(id);
            showToast('Product deleted');
          } catch(err) {
            showToast(err.message || 'Failed to delete product', 'error');
          } finally {
            setDeleting(null);
          }
        }}
      />
    </div>
  );
}

window.ProductsPage = ProductsPage;
