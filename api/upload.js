const { put } = require('@vercel/blob');
const { verifySession, cors } = require('./_auth');

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const EXT_FOR_TYPE  = { 'image/jpeg':'jpg', 'image/png':'png', 'image/webp':'webp', 'image/gif':'gif' };
const MAX_BYTES     = 5 * 1024 * 1024;

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  /* Admin-only — anonymous upload would let anyone fill the Blob bucket */
  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not configured.' });

  const contentType = (req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  if (!ALLOWED_TYPES.has(contentType)) {
    return res.status(415).json({ error: 'Only JPG, PNG, WEBP, or GIF images are allowed.' });
  }

  try {
    const rawName  = String(req.headers['x-filename'] || `upload.${EXT_FOR_TYPE[contentType]}`);
    /* Strip path traversal, drop extension to a known-safe one based on MIME */
    const base     = rawName.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase().replace(/\.[a-z0-9]+$/, '');
    const filename = `products/${Date.now()}-${base.slice(0, 40)}.${EXT_FOR_TYPE[contentType]}`;

    const chunks = [];
    let received = 0;
    for await (const chunk of req) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      received += buf.length;
      if (received > MAX_BYTES) return res.status(413).json({ error: 'File exceeds 5 MB limit.' });
      chunks.push(buf);
    }
    const buffer = Buffer.concat(chunks);
    if (!buffer.length) return res.status(400).json({ error: 'Empty file received.' });

    /* Magic-byte sanity check — defeats simple Content-Type spoofing */
    const head = buffer.slice(0, 12);
    const isJpg  = head[0] === 0xFF && head[1] === 0xD8 && head[2] === 0xFF;
    const isPng  = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4E && head[3] === 0x47;
    const isGif  = head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46;
    const isWebp = head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 && head[8] === 0x57;
    if (!(isJpg || isPng || isGif || isWebp)) {
      return res.status(415).json({ error: 'File does not look like a valid image.' });
    }

    const blob = await put(filename, buffer, { access: 'public', contentType, token });
    return res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error('[/api/upload]', err);
    return res.status(500).json({ error: 'Upload failed.' });
  }
};
