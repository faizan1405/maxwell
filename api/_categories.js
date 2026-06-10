/* Categories API — GET (public), POST/PATCH/DELETE (auth required) */
const { verifySession, cors } = require('./_auth');
const { readBlob, writeBlob } = require('./_blob');

const CATEGORIES_PATH = 'data/maxwell-categories.json';

const SEED_CATEGORIES = [
  { id: "household", name: "Household Cleaning", short: "Household", icon: "Home", blurb: "Everyday surfaces, floors, fabrics & fresh-smelling rooms.", accent: "#1D4ED8", status: 'active', displayOrder: 1, createdAt: Date.now(), updatedAt: Date.now() },
  { id: "industrial", name: "Industrial Products", short: "Industrial", icon: "Spray", blurb: "Heavy-duty degreasers, cleaners and specialty solutions for industrial use.", accent: "#B45309", status: 'active', displayOrder: 2, createdAt: Date.now(), updatedAt: Date.now() },
  { id: "car", name: "Car Care", short: "Car Care", icon: "Car", blurb: "Showroom shine for tyres, dashboards & trim.", accent: "#0B2E6B", status: 'active', displayOrder: 3, createdAt: Date.now(), updatedAt: Date.now() },
  { id: "car-exterior", name: "Car Exterior", short: "Car Exterior", icon: "Car", blurb: "Tar removers, bumper black, chassis coatings & exterior detailing.", accent: "#1E3A5F", status: 'active', displayOrder: 4, createdAt: Date.now(), updatedAt: Date.now() },
  { id: "sanitiser", name: "Sanitisers & Disinfectants", short: "Sanitisers", icon: "Shield", blurb: "High-purity protection that kills 99.9% of germs.", accent: "#159A4C", status: 'active', displayOrder: 5, createdAt: Date.now(), updatedAt: Date.now() },
];

async function getCategories() {
  const data = await readBlob(CATEGORIES_PATH);
  if (!data) {
    await writeBlob(CATEGORIES_PATH, SEED_CATEGORIES);
    return SEED_CATEGORIES;
  }
  return data;
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  /* ── GET — public read ─────────────────────────────────────────────────────── */
  if (req.method === 'GET') {
    const categories = await getCategories();
    // Public fetch only gets active categories, unless ?all=1
    if (req.query.all !== '1') {
      return res.status(200).json(categories.filter(c => c.status !== 'inactive'));
    }
    return res.status(200).json(categories);
  }

  /* ── All mutative endpoints require admin session ──────────────────────────── */
  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

  /* ── POST — create ─────────────────────────────────────────────────────────── */
  if (req.method === 'POST') {
    const { name, id, short, icon, blurb, accent, status, displayOrder, image } = body;
    if (!name || !id) return res.status(400).json({ error: 'Name and ID (slug) are required.' });

    const categories = await getCategories();
    if (categories.find(c => c.id === id)) {
      return res.status(400).json({ error: 'A category with this ID/slug already exists.' });
    }

    const cat = {
      id,
      name,
      short: short || name,
      icon: icon || 'Box',
      image: image || null,
      blurb: blurb || '',
      accent: accent || '#0B2545',
      status: status === 'inactive' ? 'inactive' : 'active',
      displayOrder: typeof displayOrder === 'number' ? displayOrder : 99,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await writeBlob(CATEGORIES_PATH, [...categories, cat]);
    return res.status(201).json(cat);
  }

  /* ── PATCH — update ────────────────────────────────────────────────────────── */
  if (req.method === 'PATCH') {
    const { id, patch } = body;
    if (!id || !patch) return res.status(400).json({ error: 'Missing id or patch object.' });

    const categories = await getCategories();
    const idx = categories.findIndex(c => c.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Category not found.' });

    const updated = { ...categories[idx], ...patch, id: categories[idx].id, updatedAt: Date.now() };
    const newList = [...categories];
    newList[idx] = updated;

    await writeBlob(CATEGORIES_PATH, newList);
    return res.status(200).json(updated);
  }

  /* ── DELETE ────────────────────────────────────────────────────────────────── */
  if (req.method === 'DELETE') {
    const { id } = body;
    if (!id) return res.status(400).json({ error: 'Missing id.' });

    const categories = await getCategories();
    await writeBlob(CATEGORIES_PATH, categories.filter(c => c.id !== id));
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
