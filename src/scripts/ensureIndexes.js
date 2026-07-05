/**
 * Deliberate index migration.
 *
 *   node src/scripts/ensureIndexes.js
 *
 * Creates the unique partial index on Customer.googleSub explicitly, rather
 * than relying on Mongoose autoIndex building it during a serverless cold
 * request (which can add latency and is not guaranteed to run before traffic).
 *
 * Safe to run repeatedly: createIndex is idempotent when the spec + options
 * match. We deliberately do NOT call syncIndexes() — that could drop unrelated
 * production indexes. This script only ever ADDS the one index it manages.
 */
const fs = require('fs');
const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Load .env.local the same way the other scripts do.
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

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const customers = mongoose.connection.collection('customers');

  await customers.createIndex(
    { googleSub: 1 },
    {
      unique: true,
      name: 'uniq_google_sub',
      partialFilterExpression: { googleSub: { $type: 'string' } },
    }
  );

  console.log('✓ ensured index uniq_google_sub on customers.googleSub');
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => {
  console.error('Index migration failed:', e.message);
  process.exit(1);
});
