/* Blob helpers — read/write JSON data files stored in Vercel Blob */
const { put, list } = require('@vercel/blob');

async function readBlob(pathname) {
  const { blobs } = await list({ prefix: pathname, limit: 1 });
  const match = blobs.find(b => b.pathname === pathname);
  if (!match) return null;
  const res = await fetch(match.url + '?t=' + Date.now()); // bust CDN cache
  if (!res.ok) return null;
  return res.json();
}

async function writeBlob(pathname, data) {
  await put(pathname, JSON.stringify(data), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    allowOverwrite: true,
  });
}

module.exports = { readBlob, writeBlob };
