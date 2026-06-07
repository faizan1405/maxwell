/* Admin Panel — Core: Auth context, data state, CRUD operations */

const { useState, useEffect, useContext, useCallback, useMemo, createContext, useRef } = React;

// ── Storage keys ──────────────────────────────────────────────────────────────
const CREDS_KEY    = 'ab_admin_creds_v2';
const SESSION_KEY  = 'ab_admin_session_v2';
const ATTEMPTS_KEY = 'ab_admin_attempts_v2';
const PRODUCTS_KEY = 'ab_admin_products_v2';
const ORDERS_KEY   = 'ab_admin_orders_v2';
const SESSION_MS   = 8 * 60 * 60 * 1000;   // 8 hours
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS   = 15 * 60 * 1000;        // 15 minutes

// ── Crypto ────────────────────────────────────────────────────────────────────
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('ab_salt_2024:' + text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}
function genToken() {
  const a = new Uint8Array(32); crypto.getRandomValues(a);
  return Array.from(a).map(b => b.toString(16).padStart(2,'0')).join('');
}

// ── Seed products ─────────────────────────────────────────────────────────────
const SEED_PRODUCTS = [
  { id:'all-purpose-cleaner', name:'All Purpose Cleaner', cat:'household', sub:'Versatile Multi-Surface Cleaning Solution', price:89.99, was:109.99, size:'500ml', rating:4.8, reviews:124, badge:'Bestseller', img:'assets/products/all-purpose-cleaner.jpg', benefits:['Cuts grease & grime','Cleans kitchens, bathrooms & counters','Leaves surfaces fresh & streak-free','Safe on tiles, stainless steel & sealed surfaces'], desc:'A versatile multi-surface cleaning solution designed to cut through grease, dirt and grime — leaving every washable surface sparkling clean and fresh every time.', scent:'Fresh Clean', sku:'APC-500-001', stock:48, lowStockThreshold:10, status:'active', variants:[{name:'500ml',price:89.99,stock:48},{name:'1L',price:149.99,stock:22}], createdAt:1705276800000, updatedAt:1730419200000 },
  { id:'tile-cleaner', name:'Tile Cleaner', cat:'household', sub:'Powerful Floor & Tile Cleaning Solution', price:94.99, was:null, size:'5L', rating:4.7, reviews:98, badge:null, img:'assets/products/tile-cleaner.jpg', benefits:['Removes tough stains','Cuts grease & grime','Fresh clean finish','Suitable for ceramic & porcelain tiles'], desc:'Powerful cleaning solution formulated to remove tough stains, dirt, grease and soap scum from floor and wall tiles — leaving surfaces sparkling with a fresh finish.', scent:'Sparkling Fresh', sku:'TLC-5L-002', stock:62, lowStockThreshold:10, status:'active', variants:[{name:'5L',price:94.99,stock:62}], createdAt:1705276800000, updatedAt:1729555200000 },
  { id:'carpet-upholstery-shampoo', name:'Carpet & Upholstery Shampoo', cat:'household', sub:'Deep Cleaning Fabric & Carpet Care', price:129.99, was:149.99, size:'5L', rating:4.9, reviews:76, badge:'Bestseller', img:'assets/products/carpet-upholstery-shampoo.png', benefits:['Lifts dirt & stubborn stains','Refreshes carpets & upholstery','Low-foam fresh clean finish','Suitable for rugs, sofas & fabric seats'], desc:'A powerful shampoo specially formulated to remove dirt, stains and embedded grime from carpets, rugs and upholstered surfaces — leaving them cleaner, brighter and fresh-smelling.', scent:'Fresh Linen', sku:'CUS-5L-003', stock:7, lowStockThreshold:10, status:'active', variants:[{name:'5L',price:129.99,stock:7}], createdAt:1707264000000, updatedAt:1730764800000 },
  { id:'linen-spray', name:'Linen Spray', cat:'household', sub:'Fresh Linen Fragrance & Fabric Refresh', price:99.99, was:null, size:'500ml', rating:4.8, reviews:61, badge:'New', img:'assets/products/linen-spray.jpg', benefits:['Refreshes linen & fabrics instantly','Helps neutralize unwanted odours','Long-lasting fresh scent','For bedding, curtains & upholstery'], desc:'A fabric freshening spray formulated to refresh linen, bedding, curtains and soft furnishings — eliminating odours while leaving fabrics smelling clean, crisp and pleasantly fresh.', scent:'Fresh Linen', sku:'LNS-500-004', stock:24, lowStockThreshold:10, status:'active', variants:[{name:'500ml',price:99.99,stock:24}], createdAt:1709251200000, updatedAt:1728950400000 },
  { id:'hand-surface-sanitiser', name:'Hand & Surface Sanitiser', cat:'sanitiser', sub:'Isopropyl Alcohol 85% — Kills 99.9% of germs', price:149.99, was:null, size:'5L', rating:4.9, reviews:210, badge:'Bestseller', img:'assets/products/hand-surface-sanitiser.jpg', benefits:['Kills 99.9% of germs & bacteria','Fast drying & non-sticky','No-rinse formula','Surface friendly'], desc:'High-strength hand and surface sanitiser formulated with 85% Isopropyl Alcohol to kill 99.9% of germs and bacteria. Fast-drying and non-sticky — suitable for hands and a wide range of hard surfaces.', scent:'85% IPA', sku:'HSS-5L-005', stock:5, lowStockThreshold:10, status:'active', variants:[{name:'1L',price:59.99,stock:45},{name:'5L',price:149.99,stock:5}], createdAt:1704844800000, updatedAt:1731024000000 },
  { id:'isopropyl-alcohol', name:'Isopropyl Alcohol 99.99%', cat:'sanitiser', sub:'Fast Drying Cleaning & Disinfecting Solution', price:179.99, was:199.99, size:'5L', rating:4.9, reviews:143, badge:'High Purity', img:'assets/products/isopropyl-alcohol.jpg', benefits:['Quick evaporation & fast drying','Removes grease, dirt & residue','Safe for glass, electronics & equipment','Leaves a clean streak-free finish'], desc:'A fast-evaporating 99.99% Isopropyl Alcohol cleaning solution that removes grease, grime and residue from hard surfaces and equipment — drying quickly without leaving heavy residue.', scent:'99.99% IPA', sku:'IPA-5L-006', stock:22, lowStockThreshold:10, status:'active', variants:[{name:'1L',price:89.99,stock:30},{name:'5L',price:179.99,stock:22}], createdAt:1705017600000, updatedAt:1729382400000 },
  { id:'tyre-shine', name:'Tyre Shine', cat:'car', sub:'Deep Black Shine & Long-Lasting Protection', price:119.99, was:null, size:'5L', rating:4.7, reviews:88, badge:null, img:'assets/products/tyre-shine.jpg', benefits:['Restores deep black tyre finish','Instant glossy shine','Helps protect against cracking & fading','Repels dust & road grime'], desc:'A premium tyre dressing formulated to restore a rich black appearance and a clean, glossy finish — enhancing the look of tyres while protecting against dryness, dullness and everyday road grime.', scent:null, sku:'TYS-5L-007', stock:31, lowStockThreshold:10, status:'active', variants:[{name:'1L',price:59.99,stock:15},{name:'5L',price:119.99,stock:31}], createdAt:1705708800000, updatedAt:1730160000000 },
  { id:'tyre-dash-shine', name:'Tyre & Dash Shine', cat:'car', sub:'Interior & Exterior Dressing Combo', price:129.99, was:null, size:'5L', rating:4.6, reviews:55, badge:null, img:'assets/products/tyre-dash-shine.jpg', benefits:['Shines tyres & interior plastics','Restores faded black trim','Non-greasy satin finish','UV protection built-in'], desc:'A versatile 2-in-1 dressing that delivers a clean, satin finish on both tyres and interior plastics — restoring faded trim and protecting against UV damage and everyday wear.', scent:null, sku:'TDS-5L-008', stock:18, lowStockThreshold:10, status:'active', variants:[{name:'1L',price:69.99,stock:20},{name:'5L',price:129.99,stock:18}], createdAt:1707091200000, updatedAt:1729728000000 },
];

// ── Seed orders ───────────────────────────────────────────────────────────────
const SEED_ORDERS = [
  { id:'ORD-001', orderNumber:'#10001', customer:{id:'C001',name:'Thabo Nkosi',email:'thabo.nkosi@gmail.com',phone:'083 456 7890'}, items:[{productId:'all-purpose-cleaner',name:'All Purpose Cleaner (500ml)',qty:2,price:89.99},{productId:'carpet-upholstery-shampoo',name:'Carpet & Upholstery Shampoo (5L)',qty:1,price:129.99}], subtotal:309.97, delivery:0, total:309.97, status:'delivered', payment:{method:'EFT',status:'paid'}, address:'12 Sunflower Street, Soweto, Gauteng, 1804', notes:'', createdAt:new Date('2024-11-15').getTime(), updatedAt:new Date('2024-11-18').getTime() },
  { id:'ORD-002', orderNumber:'#10002', customer:{id:'C002',name:'Priya Govender',email:'priya.g@webmail.co.za',phone:'071 234 5678'}, items:[{productId:'hand-surface-sanitiser',name:'Hand & Surface Sanitiser (5L)',qty:3,price:149.99}], subtotal:449.97, delivery:85, total:534.97, status:'shipped', payment:{method:'Card',status:'paid'}, address:'45 Phoenix Road, Durban North, KZN, 4051', notes:'Please leave at gate', createdAt:new Date('2024-11-20').getTime(), updatedAt:new Date('2024-11-22').getTime() },
  { id:'ORD-003', orderNumber:'#10003', customer:{id:'C003',name:'Amara Dlamini',email:'amara.d@outlook.com',phone:'082 765 4321'}, items:[{productId:'tyre-shine',name:'Tyre Shine (5L)',qty:2,price:119.99},{productId:'tyre-dash-shine',name:'Tyre & Dash Shine (5L)',qty:1,price:129.99}], subtotal:369.97, delivery:0, total:369.97, status:'processing', payment:{method:'EFT',status:'paid'}, address:'8 Oak Avenue, Centurion, Gauteng, 0157', notes:'Business delivery', createdAt:new Date('2024-11-25').getTime(), updatedAt:new Date('2024-11-25').getTime() },
  { id:'ORD-004', orderNumber:'#10004', customer:{id:'C004',name:'Sipho Mahlangu',email:'sipho.m@icloud.com',phone:'079 876 5432'}, items:[{productId:'isopropyl-alcohol',name:'Isopropyl Alcohol 99.99% (5L)',qty:4,price:179.99}], subtotal:719.96, delivery:0, total:719.96, status:'delivered', payment:{method:'Card',status:'paid'}, address:'23 Industrial Park, Johannesburg, Gauteng, 2092', notes:'For lab use', createdAt:new Date('2024-11-10').getTime(), updatedAt:new Date('2024-11-14').getTime() },
  { id:'ORD-005', orderNumber:'#10005', customer:{id:'C005',name:'Fatima Cassim',email:'fatima.c@gmail.com',phone:'076 543 2109'}, items:[{productId:'all-purpose-cleaner',name:'All Purpose Cleaner (1L)',qty:1,price:149.99},{productId:'linen-spray',name:'Linen Spray (500ml)',qty:2,price:99.99}], subtotal:349.97, delivery:85, total:434.97, status:'pending', payment:{method:'EFT',status:'pending'}, address:'67 Main Road, Cape Town, Western Cape, 8001', notes:'', createdAt:new Date('2024-11-28').getTime(), updatedAt:new Date('2024-11-28').getTime() },
  { id:'ORD-006', orderNumber:'#10006', customer:{id:'C001',name:'Thabo Nkosi',email:'thabo.nkosi@gmail.com',phone:'083 456 7890'}, items:[{productId:'tile-cleaner',name:'Tile Cleaner (5L)',qty:3,price:94.99}], subtotal:284.97, delivery:0, total:284.97, status:'delivered', payment:{method:'EFT',status:'paid'}, address:'12 Sunflower Street, Soweto, Gauteng, 1804', notes:'', createdAt:new Date('2024-10-20').getTime(), updatedAt:new Date('2024-10-24').getTime() },
  { id:'ORD-007', orderNumber:'#10007', customer:{id:'C006',name:'Andile Zulu',email:'andile.z@yahoo.com',phone:'064 321 0987'}, items:[{productId:'hand-surface-sanitiser',name:'Hand & Surface Sanitiser (5L)',qty:2,price:149.99}], subtotal:299.98, delivery:0, total:299.98, status:'cancelled', payment:{method:'Card',status:'refunded'}, address:'5 Kloof Street, Gardens, Cape Town, 8001', notes:'Cancelled by customer', createdAt:new Date('2024-11-05').getTime(), updatedAt:new Date('2024-11-06').getTime() },
  { id:'ORD-008', orderNumber:'#10008', customer:{id:'C007',name:'Nandi Xulu',email:'nandi.x@webmail.co.za',phone:'084 109 8765'}, items:[{productId:'carpet-upholstery-shampoo',name:'Carpet & Upholstery Shampoo (5L)',qty:2,price:129.99},{productId:'linen-spray',name:'Linen Spray (500ml)',qty:1,price:99.99}], subtotal:359.97, delivery:0, total:359.97, status:'shipped', payment:{method:'EFT',status:'paid'}, address:'18 Pretoria Street, Pretoria, Gauteng, 0001', notes:'', createdAt:new Date('2024-11-22').getTime(), updatedAt:new Date('2024-11-24').getTime() },
  { id:'ORD-009', orderNumber:'#10009', customer:{id:'C008',name:'Kobus van der Berg',email:'kobus.v@outlook.com',phone:'082 008 7654'}, items:[{productId:'tyre-shine',name:'Tyre Shine (1L)',qty:4,price:59.99}], subtotal:239.96, delivery:85, total:324.96, status:'processing', payment:{method:'Card',status:'paid'}, address:'33 Wellington Road, Stellenbosch, Western Cape, 7600', notes:'', createdAt:new Date('2024-11-27').getTime(), updatedAt:new Date('2024-11-27').getTime() },
  { id:'ORD-010', orderNumber:'#10010', customer:{id:'C009',name:'Zanele Mokoena',email:'zanele.m@gmail.com',phone:'071 987 6543'}, items:[{productId:'isopropyl-alcohol',name:'Isopropyl Alcohol 99.99% (1L)',qty:2,price:89.99},{productId:'hand-surface-sanitiser',name:'Hand & Surface Sanitiser (1L)',qty:2,price:59.99}], subtotal:299.96, delivery:0, total:299.96, status:'delivered', payment:{method:'EFT',status:'paid'}, address:'9 Lemon Street, Port Elizabeth, Eastern Cape, 6001', notes:'', createdAt:new Date('2024-11-01').getTime(), updatedAt:new Date('2024-11-05').getTime() },
  { id:'ORD-011', orderNumber:'#10011', customer:{id:'C010',name:'Lerato Sithole',email:'lerato.s@gmail.com',phone:'065 432 1098'}, items:[{productId:'all-purpose-cleaner',name:'All Purpose Cleaner (500ml)',qty:4,price:89.99}], subtotal:359.96, delivery:0, total:359.96, status:'delivered', payment:{method:'EFT',status:'paid'}, address:'2 Rietfontein Road, Johannesburg East, Gauteng, 1459', notes:'Bulk order', createdAt:new Date('2024-10-08').getTime(), updatedAt:new Date('2024-10-12').getTime() },
  { id:'ORD-012', orderNumber:'#10012', customer:{id:'C011',name:'Mpho Tau',email:'mpho.t@webmail.co.za',phone:'083 210 9876'}, items:[{productId:'tile-cleaner',name:'Tile Cleaner (5L)',qty:2,price:94.99},{productId:'carpet-upholstery-shampoo',name:'Carpet & Upholstery Shampoo (5L)',qty:1,price:129.99}], subtotal:319.97, delivery:0, total:319.97, status:'pending', payment:{method:'Card',status:'pending'}, address:'77 Boksburg Road, Boksburg, Gauteng, 1460', notes:'', createdAt:new Date('2024-11-29').getTime(), updatedAt:new Date('2024-11-29').getTime() },
];

// ── Contexts ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const DataContext = createContext(null);
const useAuth  = () => useContext(AuthContext);
const useAdmin = () => useContext(DataContext);

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtMoney(n) { return 'R' + (n||0).toFixed(2); }
function fmtDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-ZA', {day:'numeric',month:'short',year:'numeric'});
}
function fmtDateTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-ZA', {day:'numeric',month:'short',year:'numeric'}) + ' · ' + d.toLocaleTimeString('en-ZA',{hour:'2-digit',minute:'2-digit'});
}
function initials(name) {
  return (name||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
}

// ── AdminProvider ─────────────────────────────────────────────────────────────
function AdminProvider({ children }) {
  const [ready,    setReady]    = useState(false);
  const [session,  setSession]  = useState(null);
  const [products, setProducts] = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [attempts, setAttempts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '{}'); } catch { return {}; }
  });

  // Init
  useEffect(() => {
    (async () => {
      // First-run credential seeding
      if (!localStorage.getItem(CREDS_KEY)) {
        const adminHash   = await sha256('AmahleAdmin2024!');
        const managerHash = await sha256('AmahleManager2024!');
        localStorage.setItem(CREDS_KEY, JSON.stringify([
          { username:'admin',   passwordHash:adminHash,   role:'admin',   name:'Admin User',     email:'admin@amahle-blue.co.za' },
          { username:'manager', passwordHash:managerHash, role:'manager', name:'Store Manager',  email:'manager@amahle-blue.co.za' },
        ]));
      }

      // Restore session from sessionStorage
      try {
        const s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
        if (s && s.expiresAt > Date.now()) setSession(s);
      } catch {}

      // Products
      try {
        const raw = localStorage.getItem(PRODUCTS_KEY);
        const p = raw ? JSON.parse(raw) : null;
        if (Array.isArray(p) && p.length) { setProducts(p); }
        else { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(SEED_PRODUCTS)); setProducts(SEED_PRODUCTS); }
      } catch { setProducts(SEED_PRODUCTS); }

      // Orders
      try {
        const raw = localStorage.getItem(ORDERS_KEY);
        const o = raw ? JSON.parse(raw) : null;
        if (Array.isArray(o) && o.length) { setOrders(o); }
        else { localStorage.setItem(ORDERS_KEY, JSON.stringify(SEED_ORDERS)); setOrders(SEED_ORDERS); }
      } catch { setOrders(SEED_ORDERS); }

      setReady(true);
    })();
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    const now = Date.now();
    const att = attempts[username] || { count:0, lastAttempt:0 };
    const locked = att.count >= MAX_ATTEMPTS && (now - att.lastAttempt) < LOCKOUT_MS;
    if (locked) {
      const mins = Math.ceil((LOCKOUT_MS - (now - att.lastAttempt)) / 60000);
      return { ok:false, error:`Account locked. Try again in ${mins} min.` };
    }

    const inputHash = await sha256(password);
    const creds = JSON.parse(localStorage.getItem(CREDS_KEY) || '[]');
    const user  = creds.find(c => c.username === username.toLowerCase().trim() && c.passwordHash === inputHash);

    if (!user) {
      const wasLocked = att.count >= MAX_ATTEMPTS && (now - att.lastAttempt) >= LOCKOUT_MS;
      const count = wasLocked ? 1 : att.count + 1;
      const upd = { ...attempts, [username]: { count, lastAttempt: now } };
      setAttempts(upd); localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(upd));
      const left = MAX_ATTEMPTS - count;
      return { ok:false, error: left > 0 ? `Invalid credentials — ${left} attempt${left!==1?'s':''} remaining.` : 'Account locked for 15 minutes.' };
    }

    const upd = { ...attempts, [username]: { count:0, lastAttempt:0 } };
    setAttempts(upd); localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(upd));

    const token = genToken();
    const s = { token, role:user.role, user:{ username:user.username, name:user.name, email:user.email, role:user.role }, expiresAt: Date.now() + SESSION_MS };
    setSession(s);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    return { ok:true };
  }, [attempts]);

  const logout = useCallback(() => {
    setSession(null);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  // ── Product CRUD ──────────────────────────────────────────────────────────
  const persistProducts = useCallback((list) => {
    setProducts(list);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
    // Sync active products to main store key
    localStorage.setItem('ab_products', JSON.stringify(list.filter(p => p.status === 'active')));
  }, []);

  const addProduct = useCallback((p) => {
    const np = { ...p, id: Date.now().toString(), createdAt:Date.now(), updatedAt:Date.now() };
    persistProducts([...products, np]);
    return np;
  }, [products, persistProducts]);

  const updateProduct = useCallback((id, patch) => {
    persistProducts(products.map(p => p.id === id ? {...p, ...patch, updatedAt:Date.now()} : p));
  }, [products, persistProducts]);

  const deleteProduct = useCallback((id) => {
    persistProducts(products.filter(p => p.id !== id));
  }, [products, persistProducts]);

  // ── Order CRUD ────────────────────────────────────────────────────────────
  const persistOrders = useCallback((list) => {
    setOrders(list);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
  }, []);

  const updateOrderStatus = useCallback((id, status) => {
    persistOrders(orders.map(o => o.id === id ? {...o, status, updatedAt:Date.now()} : o));
  }, [orders, persistOrders]);

  const updateOrderNote = useCallback((id, notes) => {
    persistOrders(orders.map(o => o.id === id ? {...o, notes, updatedAt:Date.now()} : o));
  }, [orders, persistOrders]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const customers = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      const c = o.customer;
      if (!map[c.id]) map[c.id] = { ...c, orders:[], totalSpent:0, orderCount:0, lastOrderAt:0 };
      map[c.id].orders.push(o);
      map[c.id].orderCount++;
      if (o.payment.status === 'paid') map[c.id].totalSpent += o.total;
      if (o.createdAt > map[c.id].lastOrderAt) map[c.id].lastOrderAt = o.createdAt;
    });
    return Object.values(map).sort((a,b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const stats = useMemo(() => {
    const paid    = orders.filter(o => o.payment.status === 'paid');
    const revenue = paid.reduce((s,o) => s + o.total, 0);
    const active  = products.filter(p => p.status === 'active');
    const lowStock= products.filter(p => p.status === 'active' && p.stock <= p.lowStockThreshold);
    const recentOrders = [...orders].sort((a,b) => b.createdAt - a.createdAt).slice(0, 5);
    const byStatus = orders.reduce((a,o) => { a[o.status] = (a[o.status]||0)+1; return a; }, {});
    return { revenue, totalOrders:orders.length, activeProducts:active.length, totalCustomers:customers.length, lowStockProducts:lowStock, lowStockCount:lowStock.length, recentOrders, byStatus };
  }, [orders, products, customers]);

  const authValue  = { session, login, logout, isAdmin: session?.role === 'admin' };
  const dataValue  = { products, orders, customers, stats, addProduct, updateProduct, deleteProduct, updateOrderStatus, updateOrderNote, fmtMoney, fmtDate, fmtDateTime, initials };

  if (!ready) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0B2545'}}>
      <div style={{textAlign:'center',color:'white'}}>
        <div className="animate-spin" style={{width:40,height:40,border:'3px solid rgba(255,255,255,0.2)',borderTopColor:'white',borderRadius:'50%',margin:'0 auto 16px'}}/>
        <div style={{fontFamily:'Plus Jakarta Sans,sans-serif',fontSize:14,opacity:.7}}>Loading admin panel…</div>
      </div>
    </div>
  );

  return (
    <AuthContext.Provider value={authValue}>
      <DataContext.Provider value={dataValue}>
        {children}
      </DataContext.Provider>
    </AuthContext.Provider>
  );
}

window.useAuth     = useAuth;
window.useAdmin    = useAdmin;
window.AdminProvider = AdminProvider;
window.fmtMoney    = fmtMoney;
window.fmtDate     = fmtDate;
window.fmtDateTime = fmtDateTime;
window.initials    = initials;
