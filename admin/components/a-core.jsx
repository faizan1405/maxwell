/* Admin Panel — Core: Auth context, data state, CRUD operations */

const { useState, useEffect, useContext, useCallback, useMemo, createContext, useRef } = React;

// ── Storage keys (still used as a local read-cache) ───────────────────────────
const SESSION_KEY  = 'ab_admin_session_v2';

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

// ── API base — use Vercel when running locally ────────────────────────────────
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'https://maxwell-chi.vercel.app'
  : '';

// ── API helper ────────────────────────────────────────────────────────────────
function apiHeaders(token, extra) {
  return { 'Content-Type':'application/json', ...(token ? {'Authorization':`Bearer ${token}`} : {}), ...extra };
}

// ── AdminProvider ─────────────────────────────────────────────────────────────
function AdminProvider({ children }) {
  const [ready,               setReady]              = useState(false);
  const [session,             setSession]            = useState(null);
  const [products,            setProducts]           = useState([]);
  const [orders,              setOrders]             = useState([]);
  const [registeredCustomers, setRegisteredCustomers] = useState([]);
  const [coupons,             setCoupons]             = useState([]);
  const [reviews,             setReviews]             = useState([]);
  const [abandonedCarts,      setAbandonedCarts]      = useState([]);
  const [faqs,                setFaqs]               = useState([]);
  const [categories,          setCategories]         = useState([]);
  const [shippingRates,       setShippingRates]      = useState([]);

  // Init — restore session from sessionStorage, then fetch data
  useEffect(() => {
    (async () => {
      let sess = null;
      try {
        const s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
        if (s && s.expiresAt > Date.now()) { sess = s; setSession(s); }
      } catch {}

      if (sess) {
        await Promise.all([
          fetchProducts(sess.token), fetchOrders(sess.token), fetchRegisteredCustomers(sess.token),
          fetchCoupons(sess.token), fetchReviews(sess.token), fetchAbandonedCarts(sess.token),
          fetchFaqs(sess.token), fetchCategories(sess.token), fetchShippingRates(sess.token), fetchSettings(),
        ]);
      }
      setReady(true);
    })();
  }, []);

  // ── Data fetchers ─────────────────────────────────────────────────────────
  async function fetchRegisteredCustomers(token) {
    try {
      const res = await fetch(`${API_BASE}/api/customers`, { headers: apiHeaders(token) });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setRegisteredCustomers(data);
    } catch {}
  }

  async function fetchProducts(token) {
    try {
      const res = await fetch(`${API_BASE}/api/products?all=1`, { headers: apiHeaders(token) });
      if (!res.ok) return;
      const data = await res.json();
      setProducts(data);
      // Keep localStorage cache for offline fallback
      try { localStorage.setItem('ab_products', JSON.stringify(data.filter(p=>p.status==='active'))); } catch {}
    } catch {
      // Fallback to localStorage cache if API unreachable
      try {
        const raw = localStorage.getItem('ab_admin_products_v2');
        if (raw) { const p = JSON.parse(raw); if (Array.isArray(p)) setProducts(p); }
      } catch {}
    }
  }

  async function fetchOrders(token) {
    try {
      const res = await fetch(`${API_BASE}/api/orders`, { headers: apiHeaders(token) });
      if (!res.ok) return;
      const data = await res.json();
      setOrders(data);
    } catch {
      try {
        const raw = localStorage.getItem('ab_admin_orders_v2');
        if (raw) { const o = JSON.parse(raw); if (Array.isArray(o)) setOrders(o); }
      } catch {}
    }
  }

  async function fetchCoupons(token) {
    try {
      const res = await fetch(`${API_BASE}/api/coupons`, { headers: apiHeaders(token) });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setCoupons(data);
    } catch {}
  }

  async function fetchReviews(token) {
    try {
      const res = await fetch(`${API_BASE}/api/reviews?all=1`, { headers: apiHeaders(token) });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setReviews(data);
    } catch {}
  }

  async function fetchFaqs(token) {
    try {
      const res = await fetch(`${API_BASE}/api/faqs`, { headers: apiHeaders(token) });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setFaqs(data);
    } catch {}
  }

  async function fetchAbandonedCarts(token) {
    try {
      const res = await fetch(`${API_BASE}/api/carts`, { headers: apiHeaders(token) });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setAbandonedCarts(data);
    } catch {}
  }

  async function fetchCategories(token) {
    try {
      const res = await fetch(`${API_BASE}/api/categories?all=1`, { headers: apiHeaders(token) });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch {}
  }

  async function fetchSettings() {
    try {
      const res = await fetch(`${API_BASE}/api/settings`);
      if (!res.ok) return;
      const s = await res.json();
      window.__settings = s; // consumed by invoice generator (VAT number etc.)
    } catch {}
  }

  async function fetchShippingRates(token) {
    try {
      const res = await fetch(`${API_BASE}/api/shipping`, { headers: apiHeaders(token) });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setShippingRates(data);
        window.SHIPPING_RATES = data;
      }
    } catch {}
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error || 'Login failed' };

      const { token, session: s } = data;
      setSession(s);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));

      // Fetch data now that we have a session
      await Promise.all([
        fetchProducts(token), fetchOrders(token), fetchRegisteredCustomers(token),
        fetchCoupons(token), fetchReviews(token), fetchAbandonedCarts(token),
        fetchFaqs(token), fetchCategories(token), fetchShippingRates(token), fetchSettings(),
      ]);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: 'Network error — please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    if (session?.token) {
      try {
        await fetch(`${API_BASE}/api/auth`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'logout', token:session.token }) });
      } catch {}
    }
    setSession(null);
    setProducts([]);
    setOrders([]);
    setRegisteredCustomers([]);
    setCoupons([]);
    setReviews([]);
    setAbandonedCarts([]);
    setFaqs([]);
    setCategories([]);
    sessionStorage.removeItem(SESSION_KEY);
  }, [session]);

  // ── Product CRUD ──────────────────────────────────────────────────────────
  const addProduct = useCallback(async (p) => {
    const res  = await fetch(`${API_BASE}/api/products`, {
      method: 'POST',
      headers: apiHeaders(session?.token),
      body: JSON.stringify(p),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
    setProducts(prev => [...prev, data]);
    return data;
  }, [session]);

  const updateProduct = useCallback(async (id, patch) => {
    setProducts(prev => prev.map(p => p.id===id ? {...p,...patch,updatedAt:Date.now()} : p));
    let errMsg = null;
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'PATCH',
        headers: apiHeaders(session?.token),
        body: JSON.stringify({ id, ...patch }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        errMsg = d.error || `Server error ${res.status}`;
      }
    } catch {
      errMsg = 'Network error — please try again.';
    }
    if (errMsg) {
      fetchProducts(session?.token);
      throw new Error(errMsg);
    }
  }, [session]);

  const deleteProduct = useCallback(async (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    let errMsg = null;
    try {
      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'DELETE',
        headers: apiHeaders(session?.token),
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        errMsg = d.error || `Server error ${res.status}`;
      }
    } catch {
      errMsg = 'Network error — please try again.';
    }
    if (errMsg) {
      fetchProducts(session?.token);
      throw new Error(errMsg);
    }
  }, [session]);

  // ── Order CRUD ────────────────────────────────────────────────────────────
  const updateOrderStatus = useCallback(async (id, status) => {
    setOrders(prev => prev.map(o => o.id===id ? {...o,status,updatedAt:Date.now()} : o));
    try {
      await fetch(`${API_BASE}/api/orders`, {
        method: 'PATCH',
        headers: apiHeaders(session?.token),
        body: JSON.stringify({ id, status }),
      });
    } catch {
      fetchOrders(session?.token);
    }
  }, [session]);

  const updateOrderNote = useCallback(async (id, notes) => {
    setOrders(prev => prev.map(o => o.id===id ? {...o,notes,updatedAt:Date.now()} : o));
    try {
      await fetch(`${API_BASE}/api/orders`, {
        method: 'PATCH',
        headers: apiHeaders(session?.token),
        body: JSON.stringify({ id, notes }),
      });
    } catch {
      fetchOrders(session?.token);
    }
  }, [session]);

  const updatePaymentStatus = useCallback(async (id, paymentStatus) => {
    setOrders(prev => prev.map(o => o.id===id ? {...o, payment:{...o.payment, status:paymentStatus}, updatedAt:Date.now()} : o));
    try {
      await fetch(`${API_BASE}/api/orders`, {
        method: 'PATCH',
        headers: apiHeaders(session?.token),
        body: JSON.stringify({ id, paymentStatus }),
      });
    } catch {
      fetchOrders(session?.token);
    }
  }, [session]);

  const updateTracking = useCallback(async (id, trackingNumber, carrier) => {
    setOrders(prev => prev.map(o => o.id===id ? {...o, trackingNumber, carrier, updatedAt:Date.now()} : o));
    try {
      await fetch(`${API_BASE}/api/orders`, {
        method: 'PATCH',
        headers: apiHeaders(session?.token),
        body: JSON.stringify({ id, trackingNumber, carrier }),
      });
    } catch {
      fetchOrders(session?.token);
    }
  }, [session]);

  // ── Coupon CRUD ───────────────────────────────────────────────────────────
  const addCoupon = useCallback(async (payload) => {
    const res = await fetch(`${API_BASE}/api/coupons`, {
      method: 'POST', headers: apiHeaders(session?.token), body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) setCoupons(prev => [...prev, data]);
    return data;
  }, [session]);

  const updateCoupon = useCallback(async (id, patch) => {
    setCoupons(prev => prev.map(c => c.id===id ? {...c,...patch,updatedAt:Date.now()} : c));
    try {
      await fetch(`${API_BASE}/api/coupons`, {
        method: 'PATCH', headers: apiHeaders(session?.token), body: JSON.stringify({ id, ...patch }),
      });
    } catch { fetchCoupons(session?.token); }
  }, [session]);

  const deleteCoupon = useCallback(async (id) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
    try {
      await fetch(`${API_BASE}/api/coupons`, {
        method: 'DELETE', headers: apiHeaders(session?.token), body: JSON.stringify({ id }),
      });
    } catch { fetchCoupons(session?.token); }
  }, [session]);

  // ── FAQ CRUD ──────────────────────────────────────────────────────────────
  const addFaq = useCallback(async (payload) => {
    const res  = await fetch(`${API_BASE}/api/faqs`, {
      method: 'POST', headers: apiHeaders(session?.token), body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) setFaqs(prev => [...prev, data].sort((a, b) => (a.order || 0) - (b.order || 0)));
    return data;
  }, [session]);

  const updateFaq = useCallback(async (id, patch) => {
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, ...patch, updatedAt: Date.now() } : f));
    try {
      await fetch(`${API_BASE}/api/faqs`, {
        method: 'PATCH', headers: apiHeaders(session?.token), body: JSON.stringify({ id, ...patch }),
      });
    } catch { fetchFaqs(session?.token); }
  }, [session]);

  const deleteFaq = useCallback(async (id) => {
    setFaqs(prev => prev.filter(f => f.id !== id));
    try {
      await fetch(`${API_BASE}/api/faqs`, {
        method: 'DELETE', headers: apiHeaders(session?.token), body: JSON.stringify({ id }),
      });
    } catch { fetchFaqs(session?.token); }
  }, [session]);

  // ── Shipping Rates ──
  async function addShippingRate(rate) {
    try {
      const res = await fetch(`${API_BASE}/api/shipping`, { method:'POST', headers:apiHeaders(session.token), body:JSON.stringify(rate) });
      if(!res.ok) return false;
      const data = await res.json();
      setShippingRates([...shippingRates.filter(r => !data.isDefault || !r.isDefault), data]);
      return true;
    } catch { return false; }
  }
  async function updateShippingRate(rate) {
    try {
      const res = await fetch(`${API_BASE}/api/shipping`, { method:'PATCH', headers:apiHeaders(session.token), body:JSON.stringify(rate) });
      if(!res.ok) return false;
      const data = await res.json();
      setShippingRates(shippingRates.map(r => r.id === data.id ? data : (data.isDefault ? {...r, isDefault:false} : r)));
      return true;
    } catch { return false; }
  }
  async function deleteShippingRate(id) {
    try {
      const res = await fetch(`${API_BASE}/api/shipping`, { method:'DELETE', headers:apiHeaders(session.token), body:JSON.stringify({id}) });
      if(res.ok) setShippingRates(shippingRates.filter(r=>r.id!==id));
      return res.ok;
    } catch { return false; }
  }

  // ── Categories CRUD ────────────────────────────────────────────────────────
  const addCategory = useCallback(async (payload) => {
    const res = await fetch(`${API_BASE}/api/categories`, {
      method: 'POST', headers: apiHeaders(session?.token), body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Server error');
    setCategories(prev => [...prev, data].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    return data;
  }, [session]);

  const updateCategory = useCallback(async (id, patch) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
    try {
      const res = await fetch(`${API_BASE}/api/categories`, {
        method: 'PATCH', headers: apiHeaders(session?.token), body: JSON.stringify({ id, patch }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Server error');
      }
    } catch (e) {
      fetchCategories(session?.token);
      throw e;
    }
  }, [session]);

  const deleteCategory = useCallback(async (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    try {
      const res = await fetch(`${API_BASE}/api/categories`, {
        method: 'DELETE', headers: apiHeaders(session?.token), body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Server error');
      }
    } catch (e) {
      fetchCategories(session?.token);
      throw e;
    }
  }, [session]);

  // ── Review moderation ─────────────────────────────────────────────────────
  const updateReview = useCallback(async (id, patch) => {
    setReviews(prev => prev.map(r => r.id===id ? {...r,...patch,updatedAt:Date.now()} : r));
    try {
      await fetch(`${API_BASE}/api/reviews`, {
        method: 'PATCH', headers: apiHeaders(session?.token), body: JSON.stringify({ id, ...patch }),
      });
    } catch { fetchReviews(session?.token); }
  }, [session]);

  const deleteReview = useCallback(async (id) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    try {
      await fetch(`${API_BASE}/api/reviews`, {
        method: 'DELETE', headers: apiHeaders(session?.token), body: JSON.stringify({ id }),
      });
    } catch { fetchReviews(session?.token); }
  }, [session]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const customers = useMemo(() => {
    // Build map from orders (keyed by email for reliable merging)
    const map = {};
    orders.forEach(o => {
      const c = o.customer;
      const key = (c.email || c.id || '').toLowerCase();
      if (!map[key]) map[key] = { ...c, orders:[], totalSpent:0, orderCount:0, lastOrderAt:0 };
      map[key].orders.push(o);
      map[key].orderCount++;
      if (o.payment.status === 'paid') map[key].totalSpent += o.total;
      if (o.createdAt > map[key].lastOrderAt) map[key].lastOrderAt = o.createdAt;
    });

    // Merge registered customer accounts
    registeredCustomers.forEach(rc => {
      const key = rc.email.toLowerCase();
      if (map[key]) {
        // Enrich existing order-derived entry with account info
        map[key].hasAccount    = true;
        map[key].accountId     = rc.id;
        map[key].accountSince  = rc.createdAt;
        map[key].savedAddresses = rc.addresses || [];
        if (rc.name && !map[key].name) map[key].name = rc.name;
        if (rc.phone && !map[key].phone) map[key].phone = rc.phone;
      } else {
        // Registered customer with no orders yet
        map[key] = {
          id: rc.id, name: rc.name || '(no name)', email: rc.email, phone: rc.phone || '',
          orders: [], totalSpent: 0, orderCount: 0, lastOrderAt: rc.createdAt,
          hasAccount: true, accountId: rc.id, accountSince: rc.createdAt,
          savedAddresses: rc.addresses || [],
        };
      }
    });

    return Object.values(map).sort((a,b) => b.totalSpent - a.totalSpent);
  }, [orders, registeredCustomers]);

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
  const dataValue  = {
    products, setProducts, fetchProducts, addProduct, updateProduct, deleteProduct,
    orders, setOrders, fetchOrders,
    customers,
    registeredCustomers, fetchRegisteredCustomers,
    stats,
    updateOrderStatus, updateOrderNote, updatePaymentStatus, updateTracking,
    coupons, setCoupons, fetchCoupons, addCoupon, updateCoupon, deleteCoupon,
    reviews, setReviews, fetchReviews, updateReview, deleteReview,
    abandonedCarts, setAbandonedCarts, fetchAbandonedCarts,
    faqs, setFaqs, fetchFaqs, addFaq, updateFaq, deleteFaq,
    categories, setCategories, fetchCategories, addCategory, updateCategory, deleteCategory,
    shippingRates, setShippingRates, fetchShippingRates, addShippingRate, updateShippingRate, deleteShippingRate,
    fmtMoney, fmtDate, fmtDateTime, initials,
  };

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
window.API_BASE    = API_BASE;
window.fmtMoney    = fmtMoney;
window.fmtDate     = fmtDate;
window.fmtDateTime = fmtDateTime;
window.initials    = initials;
