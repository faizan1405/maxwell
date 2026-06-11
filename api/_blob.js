/* Blob & KV helpers — reads/writes JSON data files stored in Vercel KV, Vercel Blob, or local filesystem */
const { put, list } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

// Upstash REST helper
async function callKV(cmd, args = []) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([cmd, ...args])
    });
    if (!res.ok) {
      console.error(`[kv] Command failed: ${cmd}`, await res.text());
      return null;
    }
    const data = await res.json();
    return data.result;
  } catch (err) {
    console.error(`[kv] Error executing ${cmd}:`, err.message);
    return null;
  }
}

async function readBlob(pathname) {
  // 1. Try Vercel KV first (if configured)
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const key = `maxwell:${pathname.replace(/\//g, ':').replace('.json', '')}`;
      const val = await callKV('get', [key]);
      if (val) {
        const parsed = JSON.parse(val);
        // Sync to local file when read succeeds
        try {
          const localPath = path.join(process.cwd(), pathname);
          const dir = path.dirname(localPath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(localPath, JSON.stringify(parsed, null, 2), 'utf8');
        } catch {}
        return parsed;
      }
    } catch (err) {
      console.error(`[kv] Failed to read key for ${pathname}:`, err.message);
    }
  }

  // 2. Try Vercel Blob (if token is configured and KV is not active)
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token) {
      const { blobs } = await list({ prefix: pathname, limit: 1, token });
      const match = blobs.find(b => b.pathname === pathname);
      if (match) {
        const res = await fetch(match.url + '?t=' + Date.now());
        if (res.ok) {
          const data = await res.json();
          // Cache locally
          try {
            const localPath = path.join(process.cwd(), pathname);
            const dir = path.dirname(localPath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(localPath, JSON.stringify(data, null, 2), 'utf8');
          } catch {}
          return data;
        }
      }
    }
  } catch (err) {
    console.error(`[blob] readBlob Vercel Blob failed for ${pathname}:`, err.message);
  }

  // 3. Fallback to local filesystem copy
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
  let cloudSuccess = false;

  // 1. Try Vercel KV first (if configured)
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const key = `maxwell:${pathname.replace(/\//g, ':').replace('.json', '')}`;
      const ok = await callKV('set', [key, JSON.stringify(data)]);
      if (ok === 'OK') {
        cloudSuccess = true;
        console.log(`[kv] Successfully set key for ${pathname}`);
      }
    } catch (err) {
      console.error(`[kv] Failed to write key for ${pathname}:`, err.message);
    }
  }

  // 2. Try Vercel Blob (if token is configured and KV is not active)
  if (!cloudSuccess) {
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
        cloudSuccess = true;
        console.log(`[blob] Successfully wrote to Vercel Blob for ${pathname}`);
      }
    } catch (err) {
      console.error(`[blob] writeBlob Vercel Blob failed for ${pathname}:`, err.message);
    }
  }

  // 3. Always save a local copy on disk as backup/fallback
  const localPath = path.join(process.cwd(), pathname);
  try {
    const dir = path.dirname(localPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(localPath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`[blob] Successfully saved local copy to ${localPath}`);
  } catch (err) {
    console.error(`[blob] Failed to write local copy for ${pathname}:`, err.message);
    if (!cloudSuccess) throw err; // Only throw if both failed
  }
}

module.exports = { readBlob, writeBlob };
