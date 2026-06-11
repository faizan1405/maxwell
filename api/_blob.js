/* Blob helpers — read/write JSON data files stored in Vercel Blob with local file fallback */
const { put, list } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

// Ensure local data directory exists in the workspace (useful for local dev or fallback)
const LOCAL_DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(LOCAL_DATA_DIR)) {
  try {
    fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create local data dir:', err);
  }
}

async function readBlob(pathname) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) throw new Error('No Vercel Blob token configured');
    
    const { blobs } = await list({ prefix: pathname, limit: 1, token });
    const match = blobs.find(b => b.pathname === pathname);
    if (match) {
      const res = await fetch(match.url + '?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        // Cache locally when read succeeds
        try {
          const localPath = path.join(process.cwd(), pathname);
          const dir = path.dirname(localPath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(localPath, JSON.stringify(data, null, 2), 'utf8');
        } catch (localWriteErr) {
          // ignore cache write errors
        }
        return data;
      }
    }
  } catch (err) {
    console.error(`[blob] readBlob Vercel Blob failed for ${pathname}:`, err.message);
  }

  // Fallback to local filesystem copy
  const localPath = path.join(process.cwd(), pathname);
  if (fs.existsSync(localPath)) {
    try {
      console.log(`[blob] readBlob falling back to local file: ${localPath}`);
      const content = fs.readFileSync(localPath, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      console.error(`[blob] Failed to read local copy for ${pathname}:`, err.message);
    }
  }
  return null;
}

async function writeBlob(pathname, data) {
  let vercelSuccess = false;
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token) {
      await put(pathname, JSON.stringify(data), {
        access: 'public',
        addRandomSuffix: false,
        contentType: 'application/json',
        allowOverwrite: true,
        token
      });
      vercelSuccess = true;
    }
  } catch (err) {
    console.error(`[blob] writeBlob Vercel Blob failed for ${pathname}:`, err.message);
  }

  // Always save a local copy on disk as backup/fallback
  const localPath = path.join(process.cwd(), pathname);
  try {
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(localPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`[blob] Successfully saved local copy to ${localPath}`);
  } catch (err) {
    console.error(`[blob] Failed to write local copy for ${pathname}:`, err.message);
    if (!vercelSuccess) throw err; // Only throw if Vercel also failed
  }
}

module.exports = { readBlob, writeBlob };
