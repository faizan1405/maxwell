/**
 * Explicit database seeder.
 *
 *   node src/scripts/seed.js
 *
 * Seeding is intentionally NOT run on normal application requests or inside
 * connectToDatabase() — that added cold-start latency to every production
 * request even though production is already seeded. Run this script by hand
 * once against a fresh database.
 *
 * Safety: every collection is guarded with countDocuments() before insert, and
 * products are upserted with $setOnInsert, so running it against a populated
 * database never overwrites existing data.
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

const demoProducts = require('../../data/maxwell-products.json');

const SEED_CATEGORIES = [
  { id: 'household',    name: 'Household',    short: 'Household',    icon: 'Home',   blurb: 'Everyday surfaces, floors, fabrics & fresh-smelling rooms.',                     accent: '#1D4ED8', status: 'active', displayOrder: 1 },
  { id: 'industrial',   name: 'Industrial',   short: 'Industrial',   icon: 'Spray',  blurb: 'Heavy-duty degreasers, cleaners and specialty solutions for industrial use.',   accent: '#B45309', status: 'active', displayOrder: 2 },
  { id: 'car',          name: 'Car Care',     short: 'Car Care',     icon: 'Car',    blurb: 'Showroom shine for tyres, dashboards & trim.',                                  accent: '#0B2E6B', status: 'active', displayOrder: 3 },
  { id: 'car-exterior', name: 'Car Exterior', short: 'Car Exterior', icon: 'Car',    blurb: 'Tar removers, bumper black, chassis coatings & exterior detailing.',            accent: '#1E3A5F', status: 'active', displayOrder: 4 },
  { id: 'sanitiser',    name: 'Sanitisers',   short: 'Sanitisers',   icon: 'Shield', blurb: 'High-purity protection that kills 99.9% of germs.',                             accent: '#36F700', status: 'active', displayOrder: 5 },
];

const DEFAULT_SHIPPING = {
  id: 'default-rate',
  name: 'Standard Flat Rate',
  country: 'South Africa',
  region: '',
  charge: 85,
  minOrderAmount: 0,
  freeThreshold: 750,
  estimatedTime: '2-5 Business Days',
  status: 'active',
  isDefault: true,
  displayPriority: 999,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

const DEFAULT_SETTINGS = {
  cod: { enabled: true, description: 'Pay in cash when your order is delivered.', minOrderAmount: 0, maxOrderAmount: 0, codFee: 0, locationRestrictions: [], productRestrictions: [] },
  eft: { enabled: true, bankName: '', accountHolder: '', accountNumber: '', branchCode: '', accountType: 'Current', swiftCode: '', instructions: '', allowProofUpload: false },
  shipping: {
    freeThreshold: 750, flatFee: 85,
    provinceRates: { 'Gauteng': 75, 'Western Cape': 120, 'KwaZulu-Natal': 120, 'Eastern Cape': 130, 'Mpumalanga': 100, 'Limpopo': 110, 'North West': 100, 'Free State': 110, 'Northern Cape': 140 },
  },
  business: { name: 'Amahle Blue', tagline: 'Cleaning Solutions', vatNumber: '4930324332', email: 'info@amahle-blue.co.za', phone: '067 101 4345', address: 'Unit H, 13 Main Reef Road, Dunswart, Boksburg, Gauteng, South Africa' },
  invoiceCounter: 1000,
  orderCounter: 10000,
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  const db = mongoose.connection.db;

  const settingsCount = await db.collection('settings').countDocuments();
  if (settingsCount === 0) {
    await db.collection('settings').insertOne({ key: 'global_settings', value: DEFAULT_SETTINGS, createdAt: new Date(), updatedAt: new Date() });
    console.log('[seed] Seeded global settings.');
  } else {
    console.log('[seed] Settings already present — skipped.');
  }

  const categoryCount = await db.collection('categories').countDocuments();
  if (categoryCount === 0) {
    await db.collection('categories').insertMany(SEED_CATEGORIES);
    console.log('[seed] Seeded categories.');
  } else {
    console.log('[seed] Categories already present — skipped.');
  }

  const shippingCount = await db.collection('shippingrates').countDocuments();
  if (shippingCount === 0) {
    await db.collection('shippingrates').insertOne(DEFAULT_SHIPPING);
    console.log('[seed] Seeded default shipping rate.');
  } else {
    console.log('[seed] Shipping rates already present — skipped.');
  }

  if (Array.isArray(demoProducts) && demoProducts.length > 0) {
    const ops = demoProducts.map((p) => ({
      updateOne: {
        filter: { id: p.id },
        update: {
          $setOnInsert: {
            ...p,
            variants: Array.isArray(p.variants) ? p.variants : [],
            media: Array.isArray(p.media) ? p.media : [],
          },
        },
        upsert: true,
      },
    }));
    const result = await db.collection('products').bulkWrite(ops, { ordered: false });
    console.log(`[seed] Products: ${result.upsertedCount || 0} inserted, ${demoProducts.length - (result.upsertedCount || 0)} already present.`);
  }

  await mongoose.disconnect();
  console.log('[seed] Done.');
}

main().catch((e) => { console.error('[seed] Error:', e.message); process.exit(1); });
