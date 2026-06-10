const { put, del } = require('@vercel/blob');
const { verifySession, cors } = require('./_auth');
const { readBlob, writeBlob }  = require('./_blob');

const ALLOWED_IMAGES  = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_VIDEOS  = new Set(['video/mp4', 'video/webm']);
const EXT_FOR_TYPE    = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'video/mp4':  'mp4', 'video/webm': 'webm',
};
const MAX_IMAGE_BYTES = 5  * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const PRODUCTS_PATH   = 'data/maxwell-products.json';

function isVercelBlob(url) {
  return typeof url === 'string' && url.includes('.vercel-storage.com');
}

function sanitizeMediaItem(m, i) {
  return {
    id:         String(m.id || `${Date.now()}-${i}`).slice(0, 60),
    type:       m.type === 'video' ? 'video' : 'image',
    url:        String(m.url || '').slice(0, 1024),
    storageKey: m.storageKey ? String(m.storageKey).slice(0, 500) : null,
    altText:    m.altText    ? String(m.altText).slice(0, 200)    : '',
    sortOrder:  i,
    isPrimary:  !!m.isPrimary,
    fileName:   m.fileName   ? String(m.fileName).slice(0, 200)   : '',
    mimeType:   m.mimeType   ? String(m.mimeType).slice(0, 50)    : '',
    fileSize:   Math.max(0, Number(m.fileSize) || 0),
    createdAt:  m.createdAt  || Date.now(),
  };
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const session = verifySession(req);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not configured.' });

  /* ── PATCH — reorder / set primary on a product's media array ─────────── */
  if (req.method === 'PATCH') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    const { productId, media } = body;
    if (!productId)            return res.status(400).json({ error: 'Missing productId' });
    if (!Array.isArray(media)) return res.status(400).json({ error: 'media must be an array' });

    const products = await readBlob(PRODUCTS_PATH);
    if (!Array.isArray(products)) return res.status(500).json({ error: 'Products data error' });
    const idx = products.findIndex(p => p.id === productId);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });

    const cleanMedia = media.slice(0, 12).map(sanitizeMediaItem);
    if (!cleanMedia.some(m => m.isPrimary && m.type === 'image')) {
      const first = cleanMedia.find(m => m.type === 'image');
      if (first) first.isPrimary = true;
    }
    const primaryImg = cleanMedia.find(m => m.isPrimary && m.type === 'image')
                    || cleanMedia.find(m => m.type === 'image');

    const updated = { ...products[idx], media: cleanMedia, img: primaryImg ? primaryImg.url : (products[idx].img || ''), updatedAt: Date.now() };
    const list = [...products]; list[idx] = updated;
    await writeBlob(PRODUCTS_PATH, list);
    return res.status(200).json(updated);
  }

  /* ── DELETE — remove one media item from a product ────────────────────── */
  if (req.method === 'DELETE') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    const { productId, mediaId } = body;
    if (!productId || !mediaId) return res.status(400).json({ error: 'Missing productId or mediaId' });

    const products = await readBlob(PRODUCTS_PATH);
    if (!Array.isArray(products)) return res.status(500).json({ error: 'Products data error' });
    const idx = products.findIndex(p => p.id === productId);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });

    const product = products[idx];
    const media   = Array.isArray(product.media) ? [...product.media] : [];
    const item    = media.find(m => m.id === mediaId);
    if (!item) return res.status(404).json({ error: 'Media item not found' });

    if (isVercelBlob(item.url)) {
      try { await del(item.url, { token }); } catch (e) {
        console.error('[/api/upload DELETE] blob error:', e.message);
      }
    }

    let newMedia = media.filter(m => m.id !== mediaId).map((m, i) => ({ ...m, sortOrder: i }));
    if (item.isPrimary && item.type === 'image') {
      const nextImg = newMedia.find(m => m.type === 'image');
      if (nextImg) nextImg.isPrimary = true;
    }
    const primaryImg = newMedia.find(m => m.isPrimary && m.type === 'image')
                    || newMedia.find(m => m.type === 'image');

    const updated = { ...product, media: newMedia, img: primaryImg ? primaryImg.url : (product.img || ''), updatedAt: Date.now() };
    const list = [...products]; list[idx] = updated;
    await writeBlob(PRODUCTS_PATH, list);
    return res.status(200).json(updated);
  }

  /* ── POST — upload a new product image or video ───────────────────────── */
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const contentType = (req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  const isImage = ALLOWED_IMAGES.has(contentType);
  const isVideo = ALLOWED_VIDEOS.has(contentType);

  if (!isImage && !isVideo) {
    return res.status(415).json({ error: 'Unsupported file type. Allowed images: JPG, PNG, WEBP. Allowed videos: MP4, WEBM.' });
  }

  const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;

  try {
    const rawName  = String(req.headers['x-filename'] || `upload.${EXT_FOR_TYPE[contentType]}`);
    const base     = rawName.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase().replace(/\.[a-z0-9]+$/, '');
    const ext      = EXT_FOR_TYPE[contentType];
    const filename = `products/${Date.now()}-${base.slice(0, 40)}.${ext}`;

    const chunks = []; let received = 0;
    for await (const chunk of req) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      received += buf.length;
      if (received > maxBytes) {
        const mb = (maxBytes / 1048576).toFixed(0);
        return res.status(413).json({ error: `File exceeds ${mb} MB limit.` });
      }
      chunks.push(buf);
    }
    const buffer = Buffer.concat(chunks);
    if (!buffer.length) return res.status(400).json({ error: 'Empty file received.' });

    const head = buffer.slice(0, 12); let valid = false;
    if (isImage) {
      const isJpg  = head[0] === 0xFF && head[1] === 0xD8 && head[2] === 0xFF;
      const isPng  = head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4E && head[3] === 0x47;
      const isWebp = head[0] === 0x52 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x46 && head[8] === 0x57;
      valid = isJpg || isPng || isWebp;
    } else {
      const isMp4  = buffer.length > 7 && (
        (head[4] === 0x66 && head[5] === 0x74 && head[6] === 0x79 && head[7] === 0x70) ||
        (head[4] === 0x6D && head[5] === 0x6F && head[6] === 0x6F && head[7] === 0x76)
      );
      const isWebm = head[0] === 0x1A && head[1] === 0x45 && head[2] === 0xDF && head[3] === 0xA3;
      valid = isMp4 || isWebm;
    }
    if (!valid) return res.status(415).json({ error: 'File content does not match its declared type.' });

    const blob = await put(filename, buffer, { access: 'public', contentType, token });
    return res.status(200).json({
      url: blob.url, type: isImage ? 'image' : 'video',
      fileName: rawName.slice(0, 200), mimeType: contentType,
      fileSize: buffer.length, storageKey: filename,
    });
  } catch (err) {
    console.error('[/api/upload]', err);
    return res.status(500).json({ error: 'Upload failed.' });
  }
};
