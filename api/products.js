/* Products API — GET (public), POST/PATCH/DELETE (auth required) */
const { verifySession, cors } = require('./_auth');
const { readBlob, writeBlob } = require('./_blob');

const PRODUCTS_PATH = 'data/maxwell-products.json';

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

async function getProducts() {
  const stored = await readBlob(PRODUCTS_PATH);
  if (Array.isArray(stored) && stored.length) return stored;
  await writeBlob(PRODUCTS_PATH, SEED_PRODUCTS);
  return SEED_PRODUCTS;
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  // ── GET — public ──────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const products = await getProducts();
    const list = req.query.all ? products : products.filter(p => p.status === 'active');
    return res.status(200).json(list);
  }

  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

  // ── POST — create ─────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const products   = await getProducts();
    const newProduct = { ...body, id: Date.now().toString(), createdAt: Date.now(), updatedAt: Date.now() };
    await writeBlob(PRODUCTS_PATH, [...products, newProduct]);
    return res.status(201).json(newProduct);
  }

  // ── PATCH — update ────────────────────────────────────────────────────────────
  if (req.method === 'PATCH') {
    const { id, ...patch } = body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const products = await getProducts();
    const idx      = products.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const updated = { ...products[idx], ...patch, updatedAt: Date.now() };
    const newList  = [...products]; newList[idx] = updated;
    await writeBlob(PRODUCTS_PATH, newList);
    return res.status(200).json(updated);
  }

  // ── DELETE ────────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    if (session.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { id } = body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const products = await getProducts();
    await writeBlob(PRODUCTS_PATH, products.filter(p => p.id !== id));
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
