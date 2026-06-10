/* Admin Panel — FAQ Management */

const FAQ_CAT_OPTIONS = [
  { value: 'products',      label: 'Products' },
  { value: 'carcare',       label: 'Car Care' },
  { value: 'cleaning',      label: 'Cleaning & Sanitising' },
  { value: 'account',       label: 'Account & Ordering' },
  { value: 'delivery',      label: 'Delivery' },
  { value: 'payments',      label: 'Payments' },
  { value: 'cancellations', label: 'Cancellations & Support' },
];

const FAQ_PAGE_SIZE = 12;

function blankFaq() {
  return { question: '', answer: '', category: 'ordering', order: 1, enabled: true, showOnHomepage: false };
}

function FaqForm({ open, onClose, initial, onSave }) {
  const [form,   setForm]   = React.useState(blankFaq);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(initial
      ? { ...initial, order: String(initial.order || 1) }
      : { ...blankFaq(), order: '1' }
    );
  }, [open, initial]);

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  function validate() {
    const e = {};
    if (!form.question.trim()) e.question = 'Question is required.';
    if (!form.answer.trim())   e.answer   = 'Answer is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    await onSave({ ...form, order: parseInt(form.order) || 1 });
    setSaving(false);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} size="lg" title={initial ? 'Edit FAQ' : 'New FAQ'}
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={saving}>
            {saving ? <><Spinner size={14} />Saving…</> : (initial ? 'Save Changes' : 'Create FAQ')}
          </Btn>
        </>
      }
    >
      <div className="space-y-4">
        <Textarea
          label="Question *"
          rows={2}
          value={form.question}
          onChange={e => set('question', e.target.value)}
          placeholder="e.g. How can I place an order?"
          error={errors.question}
        />
        <Textarea
          label="Answer *"
          rows={5}
          value={form.answer}
          onChange={e => set('answer', e.target.value)}
          placeholder="Write a clear, concise answer…"
          error={errors.answer}
        />
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Category"
            value={form.category}
            onChange={e => set('category', e.target.value)}
          >
            {FAQ_CAT_OPTIONS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
          <Input
            label="Display Order"
            type="number"
            min="1"
            step="1"
            value={form.order}
            onChange={e => set('order', e.target.value)}
            hint="Lower = appears first"
          />
        </div>
        <div className="flex flex-col gap-3 pt-1">
          <Toggle
            checked={form.enabled}
            onChange={v => set('enabled', v)}
            label="Enabled (visible to customers)"
          />
          <Toggle
            checked={form.showOnHomepage}
            onChange={v => set('showOnHomepage', v)}
            label="Show on homepage (up to 8 shown)"
          />
        </div>
      </div>
    </Modal>
  );
}

function FaqsPage() {
  const { faqs, addFaq, updateFaq, deleteFaq } = useAdmin();
  const [search,   setSearch]   = React.useState('');
  const [catFilter,setCatFilter] = React.useState('all');
  const [page,     setPage]     = React.useState(1);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing,  setEditing]  = React.useState(null);
  const [deleting, setDeleting] = React.useState(null);
  const [toast,    setToast]    = React.useState({ visible: false, msg: '', type: 'success' });

  function showToast(msg, type = 'success') {
    setToast({ visible: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }

  const filtered = React.useMemo(() => {
    let items = [...(faqs || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    if (catFilter !== 'all') items = items.filter(f => f.category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(f =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
      );
    }
    return items;
  }, [faqs, search, catFilter]);

  const paged = filtered.slice((page - 1) * FAQ_PAGE_SIZE, page * FAQ_PAGE_SIZE);
  React.useEffect(() => setPage(1), [search, catFilter]);

  async function handleSave(payload) {
    if (editing) { await updateFaq(editing.id, payload); showToast('FAQ updated'); }
    else         { await addFaq(payload);                showToast('FAQ created'); }
  }

  async function handleToggleEnabled(f) {
    await updateFaq(f.id, { enabled: !f.enabled });
    showToast(`FAQ ${f.enabled ? 'disabled' : 'enabled'}`);
  }

  async function handleToggleHomepage(f) {
    await updateFaq(f.id, { showOnHomepage: !f.showOnHomepage });
    showToast(`Homepage visibility ${f.showOnHomepage ? 'removed' : 'added'}`);
  }

  async function handleDelete() {
    await deleteFaq(deleting.id);
    showToast('FAQ deleted', 'error');
  }

  const homepageCount = (faqs || []).filter(f => f.showOnHomepage && f.enabled !== false).length;

  const catLabel = id => FAQ_CAT_OPTIONS.find(c => c.value === id)?.label || id;

  return (
    <div className="space-y-5">
      <AdminToast message={toast.msg} type={toast.type} visible={toast.visible} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-800 text-slate-800">FAQs</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {(faqs || []).length} total · {(faqs || []).filter(f => f.enabled !== false).length} enabled · {homepageCount}/8 on homepage
          </p>
        </div>
        <Btn onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Icon.Plus /> New FAQ
        </Btn>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput value={search} onChange={setSearch} placeholder="Search questions or answers…" />
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20 sm:w-52"
        >
          <option value="all">All categories</option>
          {FAQ_CAT_OPTIONS.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Empty */}
      {(faqs || []).length === 0 && (
        <Empty
          icon="❓"
          title="No FAQs yet"
          description="Add your first FAQ to help customers find answers quickly."
          action={<Btn onClick={() => { setEditing(null); setFormOpen(true); }}><Icon.Plus /> Add First FAQ</Btn>}
        />
      )}

      {/* List */}
      {paged.length > 0 && (
        <div className="space-y-2">
          {paged.map(f => (
            <div key={f.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 animate-fadein">
              <div className="flex items-start gap-3">
                {/* Order badge */}
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-700 text-slate-500">
                  {f.order}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600 text-slate-800 leading-snug">{f.question}</p>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">{f.answer}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-cobalt/8 px-2.5 py-0.5 text-xs font-600 text-cobalt">
                      {catLabel(f.category)}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-600 ${f.enabled !== false ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {f.enabled !== false ? 'Enabled' : 'Disabled'}
                    </span>
                    {f.showOnHomepage && (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-600 text-amber-700">
                        Homepage
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => handleToggleEnabled(f)}
                    title={f.enabled !== false ? 'Disable' : 'Enable'}
                    className={`rounded-lg p-2 text-xs transition-colors ${f.enabled !== false ? 'text-green-600 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {f.enabled !== false
                        ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                        : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      }
                    </svg>
                  </button>
                  <button
                    onClick={() => { setEditing(f); setFormOpen(true); }}
                    title="Edit"
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-cobalt"
                  >
                    <Icon.Edit />
                  </button>
                  <button
                    onClick={() => setDeleting(f)}
                    title="Delete"
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Icon.Trash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (faqs || []).length > 0 && (
        <Empty icon="🔍" title="No FAQs match" description="Try adjusting your search or filter." />
      )}

      <Pagination page={page} total={filtered.length} pageSize={FAQ_PAGE_SIZE} onChange={setPage} />

      <FaqForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete FAQ"
        message={`Delete "${deleting?.question}"? This cannot be undone.`}
        confirmLabel="Delete FAQ"
        variant="danger"
      />
    </div>
  );
}

window.FaqsPage = FaqsPage;
