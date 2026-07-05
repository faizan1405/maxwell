/**
 * One-time migration: normalise legacy `purchaseMode: 'both'` products.
 *
 *   node src/scripts/migratePurchaseModes.js
 *
 * This logic used to run as two `updateMany()` writes on EVERY public
 * `GET /api/products` request — a write amplification on the hot storefront
 * read path. The API now normalises purchase mode at read time (in-memory,
 * no writes), so this correction only needs to be applied to stored data once.
 *
 * Rules:
 *   • purchaseMode 'both' + price > 0        → 'cart'
 *   • purchaseMode 'both' + no/zero price    → 'quote' (whatsappEnabled: true)
 *
 * Safe to re-run: it only touches documents still on the legacy 'both' value.
 */
const fs = require('fs');
const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

try {
  const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
  envFile.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*"?(.*?)"?\s*$/);
    if (match) process.env[match[1]] = match[2];
  });
} catch {
  /* env may already be provided by the shell */
}

const mongoose = require('mongoose');

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not set. Aborting.');
  process.exit(1);
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  const products = mongoose.connection.db.collection('products');

  const toCart = await products.updateMany(
    { purchaseMode: 'both', price: { $gt: 0 } },
    { $set: { purchaseMode: 'cart', updatedAt: Date.now() } }
  );

  const toQuote = await products.updateMany(
    { purchaseMode: 'both', $or: [{ price: { $exists: false } }, { price: null }, { price: { $lte: 0 } }] },
    { $set: { purchaseMode: 'quote', whatsappEnabled: true, updatedAt: Date.now() } }
  );

  console.log(`[migrate] 'both' → 'cart': ${toCart.modifiedCount} product(s).`);
  console.log(`[migrate] 'both' → 'quote': ${toQuote.modifiedCount} product(s).`);

  await mongoose.disconnect();
  console.log('[migrate] Done.');
}

main().catch((e) => { console.error('[migrate] Error:', e.message); process.exit(1); });
