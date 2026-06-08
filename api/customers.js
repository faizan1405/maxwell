/* Customers API — admin-only registered customer list */
const { verifySession, cors } = require('./_auth');
const { getCustomers }        = require('./_customers');

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const customers = await getCustomers();
    return res.status(200).json(customers);
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
