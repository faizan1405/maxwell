/* Admin Panel — Orders Management */

const ORDERS_PER_PAGE = 10;

/* ── Status definitions ──────────────────────────────────────────────────────── */
const ORDER_STATUS_OPTIONS = [
  { value:'all',              label:'All Orders' },
  { value:'Awaiting Payment', label:'Awaiting Payment' },
  { value:'Order Placed',     label:'Order Placed' },
  { value:'Confirmed',        label:'Confirmed' },
  { value:'Processing',       label:'Processing' },
  { value:'Dispatched',       label:'Dispatched' },
  { value:'Delivered',        label:'Delivered' },
  { value:'Cancelled',        label:'Cancelled' },
  /* legacy simple values for old orders */
  { value:'pending',          label:'Pending (legacy)' },
  { value:'confirmed',        label:'Confirmed (legacy)' },
  { value:'processing',       label:'Processing (legacy)' },
  { value:'shipped',          label:'Shipped (legacy)' },
  { value:'delivered',        label:'Delivered (legacy)' },
  { value:'cancelled',        label:'Cancelled (legacy)' },
];

const PAY_STATUS_OPTIONS = [
  { value:'all',                            label:'All Payments' },
  { value:'Cash Payment Pending',           label:'Cash Payment Pending' },
  { value:'Awaiting EFT Payment',           label:'Awaiting EFT Payment' },
  { value:'Proof of Payment Submitted',     label:'Pending Verification' },
  { value:'Paid',                           label:'Approved' },
  { value:'Payment Rejected',               label:'Rejected' },
  { value:'Corrected Proof Requested',      label:'Corrected Proof Requested' },
  { value:'Refunded',                       label:'Refunded' },
  { value:'Cancelled',                      label:'Cancelled' },
  /* legacy */
  { value:'pending',  label:'Pending (legacy)' },
  { value:'paid',     label:'Paid (legacy)' },
  { value:'refunded', label:'Refunded (legacy)' },
  { value:'failed',   label:'Failed (legacy)' },
];

const PAY_METHOD_OPTIONS = [
  { value:'all',  label:'All Methods' },
  { value:'COD',  label:'Cash on Delivery' },
  { value:'EFT',  label:'EFT' },
];

/* ── Badge styling ───────────────────────────────────────────────────────────── */
function orderStatusClass(s) {
  const map = {
    'Order Placed':'bg-blue-100 text-blue-700',
    'Awaiting Payment':'bg-amber-100 text-amber-700',
    'Confirmed':'bg-teal-100 text-teal-700',
    'Processing':'bg-blue-100 text-blue-700',
    'Dispatched':'bg-indigo-100 text-indigo-700',
    'Delivered':'bg-green-100 text-green-700',
    'Cancelled':'bg-red-100 text-red-600',
    pending:'bg-amber-100 text-amber-700',
    confirmed:'bg-teal-100 text-teal-700',
    processing:'bg-blue-100 text-blue-700',
    shipped:'bg-indigo-100 text-indigo-700',
    delivered:'bg-green-100 text-green-700',
    cancelled:'bg-red-100 text-red-600',
  };
  return map[s] || 'bg-slate-100 text-slate-600';
}

function payStatusClass(s) {
  const map = {
    'Cash Payment Pending':'bg-amber-100 text-amber-700',
    'Awaiting EFT Payment':'bg-amber-100 text-amber-700',
    'Proof of Payment Submitted':'bg-blue-100 text-blue-700',
    'Payment Verification Required':'bg-purple-100 text-purple-700',
    'Paid':'bg-green-100 text-green-700',
    'Payment Rejected':'bg-red-100 text-red-600',
    'Corrected Proof Requested':'bg-orange-100 text-orange-700',
    'Refunded':'bg-purple-100 text-purple-700',
    'Cancelled':'bg-slate-100 text-slate-500',
    pending:'bg-amber-100 text-amber-700',
    paid:'bg-green-100 text-green-700',
    refunded:'bg-purple-100 text-purple-700',
    failed:'bg-red-100 text-red-600',
  };
  return map[s] || 'bg-slate-100 text-slate-600';
}

function OrderStatusBadge({ status }) {
  if (!status) return null;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-600 ${orderStatusClass(status)}`}>{status}</span>;
}
function PayStatusBadge({ status }) {
  if (!status) return null;
  let label = status;
  if (status === 'Proof of Payment Submitted' || status === 'Payment Verification Required') {
    label = 'Pending Verification';
  } else if (status === 'Paid' || status === 'paid') {
    label = 'Approved';
  } else if (status === 'Payment Rejected') {
    label = 'Rejected';
  }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-600 ${payStatusClass(status)}`}>{label}</span>;
}

/* ── Money formatter ─────────────────────────────────────────────────────────── */
function R(n) {
  const abs = Math.abs(n || 0).toFixed(2);
  const [int, dec] = abs.split('.');
  return 'R ' + int.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + dec;
}

/* ── Invoice printer ─────────────────────────────────────────────────────────── */
function printInvoice(order) {
  const payMethod   = order.paymentMethod || order.payment?.method || '';
  const payStatus   = order.paymentStatus || (order.payment?.status === 'paid' ? 'Paid' : '');
  const orderStatus = order.orderStatus   || order.status || '';
  const isPaid      = payStatus === 'Paid' || order.payment?.status === 'paid';
  const codFee      = order.codFee || 0;
  const eftRef      = order.eftReference || order.orderNumber;
  const vatRate     = 0.15;
  const vatAmount   = (order.total || 0) - (order.total || 0) / (1 + vatRate);
  const vatNumber   = (window.__settings && window.__settings.business && window.__settings.business.vatNumber) || '';
  const bankDetails = (window.__settings && window.__settings.eft) || {};
  const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-ZA', { day:'numeric', month:'long', year:'numeric' }) : '';

  const itemRows = (order.items || []).map(item => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">${item.name}${item.variation ? ` <span style="color:#94a3b8;font-size:11px">(${item.variation})</span>` : ''}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right">${item.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right">${R(item.price)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600">${R((item.qty || 1) * (item.price || 0))}</td>
    </tr>`).join('');

  const couponRow = order.couponDiscount > 0 ? `
    <tr>
      <td colspan="3" style="padding:8px 12px;text-align:right;color:#159A4C">Coupon ${order.couponCode ? `(${order.couponCode})` : ''}</td>
      <td style="padding:8px 12px;text-align:right;color:#159A4C;font-weight:600">−${R(order.couponDiscount)}</td>
    </tr>` : '';

  const codRow = codFee > 0 ? `
    <tr>
      <td colspan="3" style="padding:8px 12px;text-align:right;color:#d97706">COD Fee</td>
      <td style="padding:8px 12px;text-align:right;color:#d97706;font-weight:600">${R(codFee)}</td>
    </tr>` : '';

  const eftSection = payMethod === 'EFT' && !isPaid ? `
    <div style="margin-top:24px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px 20px;">
      <p style="font-weight:700;color:#1E50E0;margin:0 0 8px;font-size:13px">EFT Payment Instructions</p>
      <p style="margin:2px 0;font-size:12px;color:#334155">Reference: <strong>${eftRef}</strong></p>
      ${bankDetails.bankName   ? `<p style="margin:2px 0;font-size:12px;color:#334155">Bank: ${bankDetails.bankName}</p>` : ''}
      ${bankDetails.accountHolder ? `<p style="margin:2px 0;font-size:12px;color:#334155">Account Holder: ${bankDetails.accountHolder}</p>` : ''}
      ${bankDetails.accountNumber ? `<p style="margin:2px 0;font-size:12px;color:#334155">Account Number: ${bankDetails.accountNumber}</p>` : ''}
      ${bankDetails.branchCode    ? `<p style="margin:2px 0;font-size:12px;color:#334155">Branch Code: ${bankDetails.branchCode}</p>` : ''}
      ${bankDetails.accountType   ? `<p style="margin:2px 0;font-size:12px;color:#334155">Account Type: ${bankDetails.accountType}</p>` : ''}
      <p style="margin:6px 0 0;font-size:11px;color:#64748b">Please use your order number as your payment reference.</p>
    </div>` : '';

  const codSection = payMethod === 'COD' && !isPaid ? `
    <div style="margin-top:24px;background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;">
      <p style="font-weight:700;color:#92400e;margin:0 0 4px;font-size:13px">Cash on Delivery</p>
      <p style="margin:0;font-size:12px;color:#92400e;">Amount due on delivery: <strong>${R(order.total)}</strong></p>
    </div>` : '';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice ${order.invoiceNumber || order.orderNumber}</title>
<style>
body{font-family:Arial,sans-serif;color:#0B2545;margin:0;padding:24px;font-size:13px}
h1{margin:0;font-size:22px;color:#1E50E0}
table{width:100%;border-collapse:collapse;margin-top:16px}
th{background:#f8fafc;padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#64748b}
.hdr{display:flex;justify-content:space-between;margin-bottom:32px;border-bottom:2px solid #1E50E0;padding-bottom:20px}
@media print{button{display:none}}
</style></head><body>
<div class="hdr">
  <div>
    <h1>${(window.__settings && window.__settings.business && window.__settings.business.name) || 'Amahle Blue'}</h1>
    <p style="margin:4px 0;color:#64748b;font-size:12px">${(window.__settings && window.__settings.business && window.__settings.business.address) || 'Unit H, 13 Main Reef Road, Dunswart, Boksburg, Gauteng, South Africa'}</p>
    <p style="margin:2px 0;color:#64748b;font-size:12px">${(window.__settings && window.__settings.business && window.__settings.business.phone) || '067 101 4345'} · ${(window.__settings && window.__settings.business && window.__settings.business.email) || 'info@amahle-blue.co.za'}</p>
    ${vatNumber ? `<p style="margin:2px 0;color:#64748b;font-size:11px">VAT No: ${vatNumber}</p>` : ''}
  </div>
  <div style="text-align:right">
    <p style="font-size:18px;font-weight:700;margin:0">${order.invoiceNumber || order.orderNumber}</p>
    <p style="color:#64748b;margin:4px 0;font-size:12px">Date: ${date}</p>
    <p style="color:#64748b;margin:2px 0;font-size:12px">Order: ${order.orderNumber}</p>
    <p style="margin:4px 0;font-size:12px"><strong>Order Status:</strong> ${orderStatus}</p>
    <p style="margin:2px 0;font-size:12px"><strong>Payment:</strong> ${payStatus || (isPaid ? 'Paid' : 'Pending')} · ${payMethod}</p>
  </div>
</div>
<div style="display:flex;gap:32px;margin-bottom:24px">
  <div>
    <p style="font-weight:700;margin-bottom:4px">Bill To</p>
    <p style="margin:2px 0">${order.customer?.name || ''}</p>
    <p style="margin:2px 0;color:#64748b">${order.customer?.email || ''}</p>
    <p style="margin:2px 0;color:#64748b">${order.customer?.phone || ''}</p>
  </div>
  <div>
    <p style="font-weight:700;margin-bottom:4px">Deliver To</p>
    <p style="margin:2px 0;color:#64748b">${order.address || ''}</p>
  </div>
</div>
<table>
  <thead><tr><th>Item</th><th style="text-align:right">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
  <tbody>
    ${itemRows}
    <tr><td colspan="3" style="padding:8px 12px;text-align:right;color:#64748b">Subtotal</td><td style="padding:8px 12px;text-align:right">${R(order.subtotal)}</td></tr>
    <tr><td colspan="3" style="padding:8px 12px;text-align:right;color:#64748b">Delivery</td><td style="padding:8px 12px;text-align:right">${order.delivery === 0 ? 'Free' : R(order.delivery)}</td></tr>
    ${couponRow}
    ${codRow}
    <tr><td colspan="3" style="padding:8px 12px;text-align:right;color:#94a3b8;font-size:11px">VAT (15%, included in total)</td><td style="padding:8px 12px;text-align:right;color:#94a3b8;font-size:11px">${R(vatAmount)}</td></tr>
    <tr style="font-weight:700;font-size:15px;color:#1E50E0;border-top:2px solid #e2e8f0">
      <td colspan="3" style="padding:10px 12px;text-align:right">Total (incl. VAT)</td>
      <td style="padding:10px 12px;text-align:right">${R(order.total)}</td>
    </tr>
  </tbody>
</table>
${eftSection}${codSection}
<p style="margin-top:32px;font-size:11px;color:#94a3b8;text-align:center">Thank you for your purchase · ${(window.__settings && window.__settings.business && window.__settings.business.name) || 'Amahle Blue'} · ${(window.__settings && window.__settings.business && window.__settings.business.email) || 'info@amahle-blue.co.za'}</p>
<script>window.onload=function(){window.print();};<\/script>
</body></html>`;

  const w = window.open('', '_blank', 'width=820,height=680');
  if (!w) { alert('Allow popups to print the invoice.'); return; }
  w.document.open(); w.document.write(html); w.document.close();
}

/* ── Confirmation dialog ─────────────────────────────────────────────────────── */
function OrderConfirmDialog({ open, title, message, note, noteLabel, noteRequired, confirmLabel, confirmVariant='danger', onConfirm, onCancel }) {
  const [val, setVal] = React.useState('');
  React.useEffect(() => { if (open) setVal(''); }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{background:'rgba(11,37,69,0.55)'}}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <p className="font-700 text-slate-800 text-base">{title}</p>
        {message && <p className="text-sm text-slate-500 leading-relaxed">{message}</p>}
        {note && (
          <div>
            <label className="block text-xs font-600 text-slate-600 mb-1">{noteLabel || 'Note'}{noteRequired ? ' *' : ' (optional)'}</label>
            <textarea value={val} onChange={e=>setVal(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20 resize-none"/>
          </div>
        )}
        <div className="flex gap-2 justify-end pt-1">
          <Btn variant="ghost" size="sm" onClick={onCancel}>Cancel</Btn>
          <Btn variant={confirmVariant} size="sm"
            disabled={note && noteRequired && !val.trim()}
            onClick={() => onConfirm(val.trim())}>
            {confirmLabel || 'Confirm'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ── Payment status history ──────────────────────────────────────────────────── */
function PaymentHistorySection({ history }) {
  if (!Array.isArray(history) || !history.length) return (
    <p className="text-sm text-slate-400 italic">No payment status history.</p>
  );
  return (
    <div className="space-y-2">
      {[...history].reverse().map((h, i) => (
        <div key={i} className="flex gap-3 text-xs">
          <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-cobalt/40 mt-1.5"/>
          <div>
            <span className="font-600 text-slate-600">{h.previousStatus}</span>
            <span className="text-slate-400 mx-1">→</span>
            <span className="font-600 text-cobalt">{h.newStatus}</span>
            {h.note && <p className="text-slate-500 mt-0.5 italic">"{h.note}"</p>}
            <p className="text-slate-400 mt-0.5">
              {h.changedBy || 'system'} · {h.createdAt ? new Date(h.createdAt).toLocaleString('en-ZA', {day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : ''}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Proof of payment viewer ─────────────────────────────────────────────────── */
function ProofViewer({ order }) {
  const url  = order.proofOfPaymentUrl;
  const meta = order.proofOfPaymentMetadata || {};
  if (!url) return <p className="text-sm text-slate-400 italic">No proof uploaded.</p>;

  const isPdf = meta.mimeType === 'application/pdf' || url.toLowerCase().endsWith('.pdf');

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
        <div className="text-2xl">{isPdf ? '📄' : '🖼️'}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-600 text-slate-700 truncate">{meta.filename || 'Proof of payment'}</p>
          <p className="text-xs text-slate-400">
            {meta.mimeType || ''}{meta.fileSize ? ` · ${(meta.fileSize / 1024).toFixed(0)} KB` : ''}
            {meta.uploadedAt ? ` · Uploaded ${new Date(meta.uploadedAt).toLocaleDateString('en-ZA',{day:'numeric',month:'short',year:'numeric'})}` : ''}
          </p>
        </div>
        <a href={url} target="_blank" rel="noreferrer"
          className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-cobalt text-white text-xs font-600 hover:bg-cobalt/90 transition">
          View
        </a>
      </div>
    </div>
  );
}

/* ── EFT action buttons ──────────────────────────────────────────────────────── */
function EftActions({ order, onAction }) {
  const payStatus = order.paymentStatus || order.payment?.status || '';
  const hasProof  = !!order.proofOfPaymentUrl;

  const canVerify  = hasProof && (payStatus === 'Proof of Payment Submitted' || payStatus === 'Payment Verification Required');
  const canReject  = hasProof && (payStatus === 'Proof of Payment Submitted' || payStatus === 'Payment Verification Required');
  const canCorrect = hasProof && (payStatus === 'Proof of Payment Submitted' || payStatus === 'Payment Verification Required');
  const canMarkPaid = payStatus === 'Paid'; // already paid — shown as info
  const isAlreadyPaid = payStatus === 'Paid' || order.payment?.status === 'paid';
  const canMoveToConfirmed = (order.orderStatus === 'Awaiting Payment' || order.status === 'pending') && isAlreadyPaid;

  if (isAlreadyPaid && !canMoveToConfirmed) {
    return <p className="text-sm text-green-600 font-600">✓ Payment verified and paid</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {canVerify && (
        <Btn variant="success" size="sm" onClick={() => onAction('verify')}>
          ✓ Approve Payment
        </Btn>
      )}
      {canReject && (
        <Btn variant="danger" size="sm" onClick={() => onAction('reject')}>
          ✗ Reject Payment
        </Btn>
      )}
      {canCorrect && (
        <Btn variant="secondary" size="sm" onClick={() => onAction('correct')}>
          ↩ Request Correction
        </Btn>
      )}
      {canMoveToConfirmed && (
        <Btn variant="primary" size="sm" onClick={() => onAction('moveConfirmed')}>
          → Move to Confirmed
        </Btn>
      )}
      {!hasProof && !isAlreadyPaid && (
        <p className="text-xs text-amber-600 italic">Awaiting proof of payment upload from customer.</p>
      )}
    </div>
  );
}

/* ── COD action buttons ──────────────────────────────────────────────────────── */
function CodActions({ order, onAction }) {
  const os = order.orderStatus || order.status || '';
  const ps = order.paymentStatus || order.payment?.status || '';

  const isCashCollected = ps === 'Paid' || order.payment?.status === 'paid';

  const NEXT_ORDER = {
    'Order Placed':     { next:'Confirmed',  label:'Confirm Order',    variant:'success' },
    'Awaiting Payment': { next:'Confirmed',  label:'Confirm Order',    variant:'success' },
    pending:            { next:'Confirmed',  label:'Confirm Order',    variant:'success' },
    'Confirmed':        { next:'Processing', label:'Mark Processing',   variant:'primary' },
    confirmed:          { next:'Processing', label:'Mark Processing',   variant:'primary' },
    'Processing':       { next:'Dispatched', label:'Mark Dispatched',   variant:'primary' },
    processing:         { next:'Dispatched', label:'Mark Dispatched',   variant:'primary' },
    'Dispatched':       { next:'Delivered',  label:'Mark Delivered',    variant:'primary' },
    shipped:            { next:'Delivered',  label:'Mark Delivered',    variant:'primary' },
    'Delivered':        { next: null,        label:'Delivered',         variant:'success' },
    delivered:          { next: null,        label:'Delivered',         variant:'success' },
  };

  const flow = NEXT_ORDER[os];

  return (
    <div className="flex flex-wrap gap-2">
      {flow?.next && (
        <Btn variant={flow.variant} size="sm" onClick={() => onAction('orderStatus', flow.next)}>
          {flow.label}
        </Btn>
      )}
      {(os === 'Delivered' || os === 'delivered') && !isCashCollected && (
        <Btn variant="success" size="sm" onClick={() => onAction('cashCollected')}>
          💵 Mark Cash Collected
        </Btn>
      )}
      {isCashCollected && (os === 'Delivered' || os === 'delivered') && (
        <p className="text-sm text-green-600 font-600">✓ Cash collected</p>
      )}
    </div>
  );
}

/* ── OrderDetail modal ───────────────────────────────────────────────────────── */
function OrderDetail({ order, saving, onClose, onOrderStatusChange, onPayStatusChange, onNoteChange, onInternalNoteAdd, onTrackingChange }) {
  const { fmtMoney, fmtDateTime } = useAdmin();
  const { isAdmin, session } = useAuth();

  const [noteEdit,    setNoteEdit]    = React.useState(false);
  const [note,        setNote]        = React.useState('');
  const [trackEdit,   setTrackEdit]   = React.useState(false);
  const [trackNum,    setTrackNum]    = React.useState('');
  const [carrier,     setCarrier]     = React.useState('');
  const [trackLink,   setTrackLink]   = React.useState('');
  const [dispatchDate, setDispatchDate] = React.useState('');
  const [internalNote, setInternalNote] = React.useState('');
  const [confirmDlg,  setConfirmDlg]  = React.useState(null); /* { type, title, message, noteLabel, noteRequired, confirmLabel, confirmVariant } */
  const [activeTab,   setActiveTab]   = React.useState('details');

  React.useEffect(() => {
    if (order) {
      setNote(order.notes || '');
      setTrackNum(order.trackingNumber || '');
      setCarrier(order.carrier || '');
      setTrackLink(order.trackingLink || '');
      setDispatchDate(order.dispatchDate ? new Date(order.dispatchDate).toISOString().split('T')[0] : '');
      setNoteEdit(false);
      setTrackEdit(false);
      setActiveTab('details');
    }
  }, [order?.id]);

  if (!order) return null;

  const payMethod = order.paymentMethod || order.payment?.method || '';
  const isEFT     = payMethod === 'EFT';
  const isCOD     = payMethod === 'COD';
  const orderStatus = order.orderStatus || order.status || '';
  const payStatus   = order.paymentStatus || (order.payment?.status === 'paid' ? 'Paid' : order.payment?.status) || '';
  const isCancelled = orderStatus === 'Cancelled' || orderStatus === 'cancelled';
  const isDelivered = orderStatus === 'Delivered' || orderStatus === 'delivered';
  const codFee      = order.codFee || 0;

  function saveNote() { onNoteChange(order.id, note); setNoteEdit(false); }
  function saveTracking() { onTrackingChange(order.id, trackNum.trim(), carrier.trim(), trackLink.trim(), dispatchDate); setTrackEdit(false); }

  function handleEftAction(type) {
    const configs = {
      verify:         { title:'Approve Payment?',          message:`Mark payment for ${order.orderNumber} as approved and paid. This will also confirm the order if awaiting payment.`, confirmLabel:'Approve & Mark Paid', confirmVariant:'success', note:true, noteLabel:'Note (optional)', noteRequired:false },
      reject:         { title:'Reject Payment?',          message:'The customer will be notified and asked to re-upload proof.', confirmLabel:'Reject Payment', confirmVariant:'danger', note:true, noteLabel:'Rejection reason', noteRequired:true },
      correct:        { title:'Request Corrected Proof?', message:'The customer will be notified to upload a new proof of payment.', confirmLabel:'Request Correction', confirmVariant:'secondary', note:true, noteLabel:'What to correct', noteRequired:true },
      moveConfirmed:  { title:'Move to Confirmed?',       message:'Move this order from Awaiting Payment to Confirmed.', confirmLabel:'Move to Confirmed', confirmVariant:'primary', note:false },
    };
    setConfirmDlg({ type, ...configs[type] });
  }

  function handleCodAction(type, value) {
    if (type === 'orderStatus') {
      setConfirmDlg({ type, value, title:`Set status to ${value}?`, message:`Change order status to "${value}".`, confirmLabel:'Confirm', confirmVariant:'primary', note:false });
    } else if (type === 'cashCollected') {
      setConfirmDlg({ type, title:'Mark Cash Collected?', message:`Confirm that cash payment of ${fmtMoney(order.total)} was collected for order ${order.orderNumber}.`, confirmLabel:'Mark Collected', confirmVariant:'success', note:false });
    }
  }

  function handleConfirm(noteVal) {
    const dlg = confirmDlg;
    setConfirmDlg(null);
    if (!dlg) return;

    if (dlg.type === 'verify') {
      onPayStatusChange(order.id, 'Paid', noteVal || 'Payment verified by admin');
    } else if (dlg.type === 'reject') {
      onPayStatusChange(order.id, 'Payment Rejected', noteVal);
    } else if (dlg.type === 'correct') {
      onPayStatusChange(order.id, 'Corrected Proof Requested', noteVal);
    } else if (dlg.type === 'moveConfirmed') {
      onOrderStatusChange(order.id, 'Confirmed');
    } else if (dlg.type === 'orderStatus') {
      onOrderStatusChange(order.id, dlg.value);
    } else if (dlg.type === 'cashCollected') {
      onPayStatusChange(order.id, 'Paid', 'Cash collected on delivery');
    } else if (dlg.type === 'cancel') {
      if (noteVal) {
        onInternalNoteAdd(order.id, "Cancellation reason: " + noteVal);
      }
      onOrderStatusChange(order.id, 'Cancelled');
    }
  }

  const TABS = [
    { key:'details',  label:'Details' },
    { key:'history',  label:'History' },
  ];

  return (
    <>
      <Modal open={!!order} onClose={onClose} size="lg"
        title={`${order.orderNumber}${order.invoiceNumber ? ` · ${order.invoiceNumber}` : ''}`}
        footer={
          <div className="flex items-center gap-2 w-full flex-wrap">
            <div className="flex-1 flex items-center gap-2 flex-wrap">
              {isAdmin && !isCancelled && !isDelivered && (
                <Btn variant="ghost" size="sm" onClick={() => setConfirmDlg({ type:'cancel', title:'Cancel Order?', message:'This cannot be undone.', confirmLabel:'Cancel Order', confirmVariant:'danger', note:true, noteLabel:'Reason for cancellation', noteRequired:false })}>
                  Cancel Order
                </Btn>
              )}
              <Btn variant="secondary" size="sm" onClick={() => printInvoice(order)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Print Invoice
              </Btn>
            </div>
            <Btn variant="secondary" onClick={onClose}>Close</Btn>
          </div>
        }
      >
        {/* Status row */}
        <div className="flex flex-wrap gap-2 items-center mb-4 pb-4 border-b border-slate-100">
          <OrderStatusBadge status={orderStatus}/>
          <PayStatusBadge status={payStatus}/>
          <span className="text-xs font-600 uppercase text-slate-400">{payMethod}</span>
          <span className="text-xs text-slate-400 ml-auto">{fmtDateTime(order.createdAt)}</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-slate-100">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm font-600 border-b-2 transition-colors ${activeTab === t.key ? 'border-cobalt text-cobalt' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Details tab ─────────────────────────────────────── */}
        {activeTab === 'details' && (
          <div className="space-y-5">
            {/* Order Status selector */}
            <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-600 text-slate-500 uppercase tracking-wide mb-1">Order Status</p>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={orderStatus}/>
                  {isCancelled && <span className="text-xs text-red-500 font-500">Cancelled</span>}
                </div>
              </div>
              {!isCancelled && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-500">Update status:</span>
                  <select
                    value={orderStatus}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'Cancelled') {
                        setConfirmDlg({ type:'cancel', title:'Cancel Order?', message:'This cannot be undone.', confirmLabel:'Cancel Order', confirmVariant:'danger', note:true, noteLabel:'Reason for cancellation', noteRequired:false });
                      } else {
                        onOrderStatusChange(order.id, val);
                      }
                    }}
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-600 outline-none focus:border-cobalt bg-white cursor-pointer"
                  >
                    <option value={isEFT ? 'Awaiting Payment' : 'Order Placed'}>Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Dispatched">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              )}
            </div>

            {/* Customer & delivery */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-600 text-slate-500 uppercase tracking-wide mb-2">Customer</p>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar name={order.customer?.name} size={32}/>
                  <div>
                    <p className="text-sm font-600 text-slate-800">{order.customer?.name}</p>
                    <p className="text-xs text-slate-400">{order.customer?.email}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">{order.customer?.phone}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-600 text-slate-500 uppercase tracking-wide mb-2">Delivery Address</p>
                <p className="text-sm text-slate-600 leading-relaxed">{order.address}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-xs font-600 text-slate-500 uppercase tracking-wide mb-2">Items</p>
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                {(order.items || []).map((item, i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-slate-50' : ''}`}>
                    <div>
                      <p className="text-sm font-500 text-slate-700">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        Qty: {item.qty} × {fmtMoney(item.price)}
                        {item.variation ? ` · ${item.variation}` : ''}
                      </p>
                    </div>
                    <p className="font-600 text-slate-800">{fmtMoney((item.qty || 1) * (item.price || 0))}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-500">{fmtMoney(order.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Delivery</span><span className="font-500">{order.delivery === 0 ? 'Free' : fmtMoney(order.delivery)}</span></div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-grass">Coupon {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span className="font-500 text-grass">−{fmtMoney(order.couponDiscount)}</span>
                </div>
              )}
              {codFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-amber-600">COD Fee</span>
                  <span className="font-500 text-amber-600">{fmtMoney(codFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-700 text-base pt-1 border-t border-slate-200">
                <span>Total</span><span className="text-cobalt">{fmtMoney(order.total)}</span>
              </div>
            </div>

            {/* Tracking */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-600 text-slate-500 uppercase tracking-wide">Tracking</p>
                {!trackEdit && <button onClick={() => setTrackEdit(true)} className="text-xs text-cobalt hover:underline">Edit</button>}
              </div>
              {trackEdit ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-600 text-slate-500 mb-1">Tracking Number</label>
                      <input value={trackNum} onChange={e => setTrackNum(e.target.value)} placeholder="e.g. FADX123456"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20"/>
                    </div>
                    <div>
                      <label className="block text-[11px] font-600 text-slate-500 mb-1">Carrier</label>
                      <input value={carrier} onChange={e => setCarrier(e.target.value)} placeholder="e.g. Courier Guy"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20"/>
                    </div>
                    <div>
                      <label className="block text-[11px] font-600 text-slate-500 mb-1">Tracking Link</label>
                      <input value={trackLink} onChange={e => setTrackLink(e.target.value)} placeholder="https://"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20"/>
                    </div>
                    <div>
                      <label className="block text-[11px] font-600 text-slate-500 mb-1">Dispatch Date</label>
                      <input type="date" value={dispatchDate} onChange={e => setDispatchDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20"/>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <Btn variant="ghost" size="sm" onClick={() => { setTrackEdit(false); setTrackNum(order.trackingNumber || ''); setCarrier(order.carrier || ''); setTrackLink(order.trackingLink || ''); setDispatchDate(order.dispatchDate ? new Date(order.dispatchDate).toISOString().split('T')[0] : ''); }}>Cancel</Btn>
                    <Btn size="sm" onClick={saveTracking}>Save</Btn>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-600 space-y-1">
                  {order.trackingNumber ? (
                    <>
                      <p><span className="font-600">{order.carrier || 'Carrier'}</span> · {order.trackingNumber}</p>
                      {order.trackingLink && <p><a href={order.trackingLink} target="_blank" rel="noreferrer" className="text-cobalt hover:underline text-xs">Track Package ↗</a></p>}
                      {order.dispatchDate && <p className="text-xs text-slate-500">Dispatched: {new Date(order.dispatchDate).toLocaleDateString('en-ZA')}</p>}
                    </>
                  ) : <span className="italic text-slate-400">No tracking info</span>}
                </div>
              )}
            </div>

            {/* Order notes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-600 text-slate-500 uppercase tracking-wide">Order Notes</p>
                {!noteEdit && <button onClick={() => setNoteEdit(true)} className="text-xs text-cobalt hover:underline">Edit</button>}
              </div>
              {noteEdit ? (
                <div className="space-y-2">
                  <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20 resize-none"/>
                  <div className="flex gap-2 justify-end">
                    <Btn variant="ghost" size="sm" onClick={() => { setNoteEdit(false); setNote(order.notes || ''); }}>Cancel</Btn>
                    <Btn size="sm" onClick={saveNote}>Save</Btn>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-3 min-h-[40px]">
                  {order.notes || <span className="italic text-slate-300">No notes</span>}
                </p>
              )}
            </div>

            {/* Payment Details & Actions Section */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-600 text-slate-500 uppercase tracking-wide">Payment Details & Actions</p>
              
              {isEFT && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-500">Payment Status</span>
                    <PayStatusBadge status={payStatus}/>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-500">EFT Reference</span>
                    <span className="font-600 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{order.eftReference || order.orderNumber}</span>
                  </div>
                  
                  {order.proofOfPaymentUrl && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <p className="text-[11px] font-600 text-slate-500 uppercase mb-2">Uploaded Proof</p>
                      <ProofViewer order={order}/>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-slate-200/60">
                    <EftActions order={order} onAction={handleEftAction}/>
                  </div>
                </div>
              )}

              {isCOD && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-500">Payment Status</span>
                    <PayStatusBadge status={payStatus}/>
                  </div>
                  
                  <div className="bg-amber-100/50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                    <p className="font-500">Amount due on delivery: <span className="font-700 text-amber-900">{fmtMoney(order.total)}</span></p>
                    {codFee > 0 && <p className="text-xs text-amber-600 mt-0.5">Includes COD fee: {fmtMoney(codFee)}</p>}
                  </div>
                  
                  <div className="pt-2 border-t border-slate-200/60">
                    <CodActions order={order} onAction={handleCodAction}/>
                  </div>
                </div>
              )}
            </div>

            {/* Internal Notes */}
            <div>
              <p className="text-xs font-600 text-slate-500 uppercase tracking-wide mb-2">Internal Notes</p>
              <div className="space-y-2">
                {Array.isArray(order.internalNotes) && order.internalNotes.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {order.internalNotes.map((n, i) => (
                      <div key={i} className="bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2">
                        <p className="text-sm text-slate-700">{n.note}</p>
                        <p className="text-xs text-slate-400 mt-1">{n.addedBy || 'admin'} · {n.createdAt ? new Date(n.createdAt).toLocaleString('en-ZA',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : ''}</p>
                      </div>
                    ))}
                  </div>
                )}
                <textarea value={internalNote} onChange={e => setInternalNote(e.target.value)} rows={2}
                  placeholder="Add internal note (not visible to customer)…"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-cobalt focus:ring-2 focus:ring-cobalt/20 resize-none"/>
                <div className="flex justify-end">
                  <Btn size="sm" disabled={!internalNote.trim()} onClick={() => { onInternalNoteAdd(order.id, internalNote.trim()); setInternalNote(''); }}>
                    Add Note
                  </Btn>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── History tab ─────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-600 text-slate-500 uppercase tracking-wide mb-3">Payment Status History</p>
              <PaymentHistorySection history={order.paymentStatusHistory}/>
            </div>
          </div>
        )}
      </Modal>

      <OrderConfirmDialog
        open={!!confirmDlg}
        title={confirmDlg?.title}
        message={confirmDlg?.message}
        note={confirmDlg?.note}
        noteLabel={confirmDlg?.noteLabel}
        noteRequired={confirmDlg?.noteRequired}
        confirmLabel={confirmDlg?.confirmLabel}
        confirmVariant={confirmDlg?.confirmVariant}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmDlg(null)}
      />
    </>
  );
}

/* ── OrdersPage ──────────────────────────────────────────────────────────────── */
function OrdersPage() {
  const { orders, updateOrderStatus, updateOrderNote, updatePaymentStatus, updateTracking, fmtMoney, fmtDate } = useAdmin();
  const { isAdmin, session } = useAuth();

  const [orderStatusFilter, setOrderStatusFilter] = React.useState('all');
  const [payStatusFilter,   setPayStatusFilter]   = React.useState('all');
  const [payMethodFilter,   setPayMethodFilter]   = React.useState('all');
  const [dateRangeFilter,   setDateRangeFilter]   = React.useState('all');
  const [customStart,       setCustomStart]       = React.useState('');
  const [customEnd,         setCustomEnd]         = React.useState('');
  const [search,            setSearch]            = React.useState('');
  const [sort,              setSort]              = React.useState('newest');
  const [page,              setPage]              = React.useState(1);
  const [viewing,           setViewing]           = React.useState(null);
  const [toast,             setToast]             = React.useState({ visible:false, msg:'', type:'success' });
  const [saving,            setSaving]            = React.useState(false);
  const [isExporting,       setIsExporting]       = React.useState(false);

  function showToast(msg, type='success') {
    setToast({ visible:true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, visible:false })), 3500);
  }

  /* Resolve effective order/pay status from either old or new fields */
  function effectiveOrderStatus(o) {
    return o.orderStatus || o.status || '';
  }
  function effectivePayStatus(o) {
    return o.paymentStatus || (o.payment?.status === 'paid' ? 'Paid' : o.payment?.status) || '';
  }
  function effectivePayMethod(o) {
    return o.paymentMethod || o.payment?.method || '';
  }

  const filtered = React.useMemo(() => {
    let list = [...orders];

    if (dateRangeFilter !== 'all') {
      const now = new Date();
      let start = new Date(0);
      let end = new Date();
      if (dateRangeFilter === 'today') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (dateRangeFilter === '7d') {
        start = new Date(now); start.setDate(now.getDate() - 6); start.setHours(0,0,0,0);
      } else if (dateRangeFilter === '30d') {
        start = new Date(now); start.setDate(now.getDate() - 29); start.setHours(0,0,0,0);
      } else if (dateRangeFilter === 'custom') {
        start = customStart ? new Date(customStart) : new Date(0);
        end = customEnd ? new Date(customEnd) : new Date();
        if (customEnd) end.setHours(23, 59, 59, 999);
      }
      list = list.filter(o => {
        const d = new Date(o.createdAt);
        return d >= start && d <= end;
      });
    }

    if (orderStatusFilter !== 'all') list = list.filter(o => effectiveOrderStatus(o) === orderStatusFilter);
    if (payStatusFilter   !== 'all') list = list.filter(o => effectivePayStatus(o)   === payStatusFilter);
    if (payMethodFilter   !== 'all') list = list.filter(o => effectivePayMethod(o).toUpperCase() === payMethodFilter.toUpperCase());
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        (o.orderNumber || '').toLowerCase().includes(q) ||
        (o.customer?.name  || '').toLowerCase().includes(q) ||
        (o.customer?.email || '').toLowerCase().includes(q) ||
        (o.customer?.phone || '').toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => sort === 'oldest' ? a.createdAt - b.createdAt : b.createdAt - a.createdAt);
    return list;
  }, [orders, orderStatusFilter, payStatusFilter, payMethodFilter, dateRangeFilter, customStart, customEnd, search, sort]);

  const paged = filtered.slice((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE);
  React.useEffect(() => setPage(1), [orderStatusFilter, payStatusFilter, payMethodFilter, search, sort]);

  /* Needs-attention flag: EFT with proof submitted */
  function needsAttention(o) {
    const ps = effectivePayStatus(o);
    return ps === 'Proof of Payment Submitted' || ps === 'Payment Verification Required';
  }

  /* ── Action handlers ── */
  async function handleOrderStatusChange(id, newStatus) {
    const simpleMap = {
      'Order Placed':'pending','Awaiting Payment':'pending','Confirmed':'confirmed',
      'Processing':'processing','Dispatched':'shipped','Delivered':'delivered','Cancelled':'cancelled',
    };
    const simpleStatus = simpleMap[newStatus] || newStatus;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${session?.token}` },
        body: JSON.stringify({ id, orderStatus: newStatus, status: simpleStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = (data && data.id) ? data : { orderStatus: newStatus, status: simpleStatus };
        setViewing(v => v ? { ...v, ...updated } : null);
        updateOrderStatus(id, simpleStatus);
        showToast(`Order status → ${newStatus}`);
      } else {
        showToast('Failed to update order status', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handlePayStatusChange(id, newPayStatus, note) {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${session?.token}` },
        body: JSON.stringify({ id, paymentStatus: newPayStatus, statusNote: note }),
      });
      if (res.ok) {
        const data = await res.json();
        const updated = (data && data.id) ? data : { paymentStatus: newPayStatus };
        setViewing(v => v ? { ...v, ...updated } : null);
        updatePaymentStatus(id, newPayStatus === 'Paid' ? 'paid' : 'pending');
        showToast(`Payment status → ${newPayStatus}`);
      } else {
        showToast('Failed to update payment status', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleInternalNoteAdd(id, note) {
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'PATCH',
        headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${session?.token}` },
        body: JSON.stringify({ id, internalNotes: note }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.id) setViewing(v => v ? { ...v, ...data } : null);
        showToast('Internal note saved');
      }
    } catch {
      showToast('Failed to save note', 'error');
    }
  }

  function handleNoteChange(id, notes) {
    updateOrderNote(id, notes);
    setViewing(v => v ? { ...v, notes } : null);
  }

  function handleTrackingChange(id, trackingNumber, carrier, trackingLink, dispatchDate) {
    updateTracking(id, trackingNumber, carrier, trackingLink, dispatchDate);
    setViewing(v => v ? { ...v, trackingNumber, carrier, trackingLink, dispatchDate } : null);
    showToast('Tracking info saved');
  }

  const orderStatusCounts = React.useMemo(() => {
    const c = { all: orders.length };
    orders.forEach(o => {
      const s = effectiveOrderStatus(o);
      c[s] = (c[s] || 0) + 1;
    });
    return c;
  }, [orders]);

  /* Proof-needs-attention count */
  const attentionCount = React.useMemo(() => orders.filter(needsAttention).length, [orders]);

  /* ── Export handlers ── */
  const getExportData = React.useCallback(() => {
    return filtered.map(o => {
      const items = o.items || [];
      const itemNames = items.map(i => i.name).join('\n');
      const itemQtys = items.map(i => i.qty).join('\n');
      const itemVars = items.map(i => i.variation || '—').join('\n');
      return [
        o.orderNumber,
        new Date(o.createdAt).toLocaleString('en-ZA'),
        o.customer?.name || '—',
        o.customer?.phone || '—',
        o.customer?.email || '—',
        o.address || '—',
        itemNames,
        itemQtys,
        itemVars,
        o.subtotal || 0,
        o.couponDiscount || 0,
        o.delivery || 0,
        o.total || 0,
        effectivePayMethod(o),
        effectivePayStatus(o),
        effectiveOrderStatus(o)
      ];
    });
  }, [filtered]);

  async function handleExportCSV() {
    if (!isAdmin) return showToast('Unauthorized', 'error');
    setIsExporting(true);
    try {
      const headers = ['Order ID', 'Order Date', 'Customer Name', 'Phone', 'Email', 'Delivery Address', 'Products', 'Quantities', 'Variations', 'Subtotal', 'Discount', 'Delivery', 'Total', 'Payment Method', 'Payment Status', 'Order Status'];
      const data = getExportData();
      const escapeCell = (cell) => {
        if (cell == null) return '""';
        const str = String(cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      const csvContent = [
        headers.map(escapeCell).join(','),
        ...data.map(row => row.map(escapeCell).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute("href", url);
      link.setAttribute("download", `orders-export-${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('CSV Export successful');
    } catch (e) {
      console.error(e);
      showToast('Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  }

  async function handleExportPDF() {
    if (!isAdmin) return showToast('Unauthorized', 'error');
    setIsExporting(true);
    try {
      if (!window.jspdf) throw new Error('jsPDF not loaded');
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('landscape');
      
      const headers = [['Order ID', 'Date', 'Customer', 'Phone', 'Email', 'Address', 'Products', 'Total', 'Pay Method', 'Pay Status', 'Status']];
      const data = filtered.map(o => {
        const items = o.items || [];
        const products = items.map(i => `${i.qty}x ${i.name}`).join('\n');
        return [
          o.orderNumber,
          new Date(o.createdAt).toLocaleString('en-ZA'),
          o.customer?.name || '—',
          o.customer?.phone || '—',
          o.customer?.email || '—',
          o.address || '—',
          products,
          `R${(o.total || 0).toFixed(2)}`,
          effectivePayMethod(o),
          effectivePayStatus(o),
          effectiveOrderStatus(o)
        ];
      });

      doc.text('Orders Export', 14, 15);
      doc.autoTable({
        startY: 20,
        head: headers,
        body: data,
        styles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak' },
        headStyles: { fillColor: [30, 80, 224] }
      });
      
      const dateStr = new Date().toISOString().split('T')[0];
      doc.save(`orders-export-${dateStr}.pdf`);
      showToast('PDF Export successful');
    } catch (e) {
      console.error(e);
      showToast('Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <AdminToast message={toast.msg} type={toast.type} visible={toast.visible}/>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-800 text-slate-800">Orders</h2>
          <p className="text-sm text-slate-400 mt-0.5">{orders.length} total · {filtered.length} shown</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {attentionCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 cursor-pointer"
              onClick={() => { setPayStatusFilter('Proof of Payment Submitted'); setPayMethodFilter('EFT'); }}>
              <span className="text-amber-600 font-700 text-sm">⚠ {attentionCount} proof{attentionCount !== 1 ? 's' : ''} need review</span>
            </div>
          )}
          <Btn variant="secondary" size="sm" disabled={isExporting || filtered.length === 0} onClick={handleExportCSV}>
            {isExporting ? <span className="animate-spin inline-block mr-1">⭘</span> : null}
            Export CSV
          </Btn>
          <Btn variant="secondary" size="sm" disabled={isExporting || filtered.length === 0} onClick={handleExportPDF}>
            {isExporting ? <span className="animate-spin inline-block mr-1">⭘</span> : null}
            Export PDF
          </Btn>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Order #, name, phone…"/>
        <select value={dateRangeFilter} onChange={e => setDateRangeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-cobalt bg-white">
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="custom">Custom Range</option>
        </select>
        {dateRangeFilter === 'custom' && (
          <div className="flex items-center gap-2">
            <input type="date" value={customStart} onChange={e=>setCustomStart(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"/>
            <span className="text-slate-400">to</span>
            <input type="date" value={customEnd} onChange={e=>setCustomEnd(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none"/>
          </div>
        )}
        <select value={payMethodFilter} onChange={e => setPayMethodFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-cobalt bg-white">
          {PAY_METHOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-cobalt bg-white">
          {ORDER_STATUS_OPTIONS.filter(o => o.value === 'all' || orderStatusCounts[o.value] > 0).map(o => (
            <option key={o.value} value={o.value}>{o.label}{o.value !== 'all' && orderStatusCounts[o.value] ? ` (${orderStatusCounts[o.value]})` : ''}</option>
          ))}
        </select>
        <select value={payStatusFilter} onChange={e => setPayStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-cobalt bg-white">
          {PAY_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-cobalt bg-white">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        {(orderStatusFilter !== 'all' || payStatusFilter !== 'all' || payMethodFilter !== 'all' || search) && (
          <button onClick={() => { setOrderStatusFilter('all'); setPayStatusFilter('all'); setPayMethodFilter('all'); setSearch(''); }}
            className="text-xs text-slate-400 hover:text-slate-600 underline">Clear filters</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <Empty icon="📦" title="No orders found" description="Try adjusting your search or filters."/>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left px-5 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Order</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Customer</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide hidden sm:table-cell">Items</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Total</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide hidden md:table-cell">Method</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Payment</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide hidden lg:table-cell">Order Status</th>
                    <th className="text-left px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide hidden xl:table-cell">Date</th>
                    <th className="px-4 py-3.5 text-xs font-600 text-slate-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paged.map(o => {
                    const os = effectiveOrderStatus(o);
                    const ps = effectivePayStatus(o);
                    const pm = effectivePayMethod(o);
                    const attention = needsAttention(o);
                    return (
                      <tr key={o.id} className={`hover:bg-slate-50/50 transition-colors ${attention ? 'border-l-4 border-l-amber-400' : ''}`}>
                        <td className="px-5 py-3.5">
                          <span className="font-700 text-cobalt text-sm">{o.orderNumber}</span>
                          {attention && <span className="ml-1.5 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-700">Review</span>}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <Avatar name={o.customer?.name} size={28}/>
                            <div className="min-w-0">
                              <p className="font-500 text-slate-700 truncate max-w-[120px]">{o.customer?.name}</p>
                              <p className="text-xs text-slate-400 truncate max-w-[120px]">{o.customer?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell text-xs text-slate-500">
                          {(o.items || []).length} item{(o.items || []).length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-4 py-3.5 font-700 text-slate-800">{fmtMoney(o.total)}</td>
                        <td className="px-4 py-3.5 hidden md:table-cell text-xs font-600 text-slate-500 uppercase">{pm}</td>
                        <td className="px-4 py-3.5"><PayStatusBadge status={ps}/></td>
                        <td className="px-4 py-3.5 hidden lg:table-cell"><OrderStatusBadge status={os}/></td>
                        <td className="px-4 py-3.5 text-xs text-slate-400 hidden xl:table-cell">{fmtDate(o.createdAt)}</td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => setViewing(o)} title="View details"
                            className="p-1.5 text-slate-400 hover:text-cobalt hover:bg-cobalt/10 rounded-lg transition-colors">
                            <Icon.Eye/>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-5 pb-4 pt-1">
              <Pagination page={page} total={filtered.length} pageSize={ORDERS_PER_PAGE} onChange={setPage}/>
            </div>
          </>
        )}
      </div>

      <OrderDetail
        order={viewing}
        saving={saving}
        onClose={() => setViewing(null)}
        onOrderStatusChange={handleOrderStatusChange}
        onPayStatusChange={handlePayStatusChange}
        onNoteChange={handleNoteChange}
        onInternalNoteAdd={handleInternalNoteAdd}
        onTrackingChange={handleTrackingChange}
      />
    </div>
  );
}

window.OrdersPage = OrdersPage;
