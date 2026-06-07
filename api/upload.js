const { put } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-filename');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not configured in Vercel environment variables.' });
  }

  try {
    const rawName  = req.headers['x-filename'] || `product-${Date.now()}.jpg`;
    const safeFile = rawName.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
    const filename = `products/${Date.now()}-${safeFile}`;
    const contentType = (req.headers['content-type'] || 'image/jpeg').split(';')[0];

    // Read raw body stream
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    if (!buffer.length) return res.status(400).json({ error: 'Empty file received.' });
    if (buffer.length > 5 * 1024 * 1024) return res.status(413).json({ error: 'File exceeds 5 MB limit.' });

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType,
      token,
    });

    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('[/api/upload]', err);
    return res.status(500).json({ error: err.message || 'Upload failed.' });
  }
};
