/* FAQs API — public GET + admin CRUD */
const { verifySession, cors } = require('./_auth');
const { readBlob, writeBlob } = require('./_blob');

const FAQS_PATH = 'data/maxwell-faqs.json';

async function getFaqs() {
  return (await readBlob(FAQS_PATH)) || [];
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  /* GET — admin gets all; public gets enabled only, sorted by order */
  if (req.method === 'GET') {
    const session = verifySession(req);
    const faqs = await getFaqs();
    if (session) return res.status(200).json(faqs);
    return res.status(200).json(
      faqs
        .filter(f => f.enabled !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    );
  }

  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

  /* POST — create */
  if (req.method === 'POST') {
    const q = (body.question || '').trim();
    const a = (body.answer   || '').trim();
    if (!q || !a) return res.status(400).json({ error: 'Question and answer are required.' });
    const faqs = await getFaqs();
    const faq = {
      id:             `faq_${Date.now()}`,
      question:       q,
      answer:         a,
      category:       body.category || 'ordering',
      order:          typeof body.order === 'number' ? body.order : faqs.length + 1,
      enabled:        body.enabled !== false,
      showOnHomepage: !!body.showOnHomepage,
      createdAt:      Date.now(),
      updatedAt:      Date.now(),
    };
    await writeBlob(FAQS_PATH, [...faqs, faq]);
    return res.status(201).json(faq);
  }

  /* PATCH — update */
  if (req.method === 'PATCH') {
    const { id } = body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const faqs = await getFaqs();
    const idx  = faqs.findIndex(f => f.id === id);
    if (idx === -1) return res.status(404).json({ error: 'FAQ not found' });

    const patch = { updatedAt: Date.now() };
    if (body.question       !== undefined) patch.question       = String(body.question).trim();
    if (body.answer         !== undefined) patch.answer         = String(body.answer).trim();
    if (body.category       !== undefined) patch.category       = String(body.category);
    if (body.order          !== undefined) patch.order          = Number(body.order) || 0;
    if (body.enabled        !== undefined) patch.enabled        = !!body.enabled;
    if (body.showOnHomepage !== undefined) patch.showOnHomepage = !!body.showOnHomepage;

    const updated = { ...faqs[idx], ...patch };
    const list    = [...faqs]; list[idx] = updated;
    await writeBlob(FAQS_PATH, list);
    return res.status(200).json(updated);
  }

  /* DELETE */
  if (req.method === 'DELETE') {
    const { id } = body;
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const faqs = await getFaqs();
    await writeBlob(FAQS_PATH, faqs.filter(f => f.id !== id));
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
