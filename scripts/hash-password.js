#!/usr/bin/env node
/**
 * Utility script to generate SHA-256 password hashes for Amahle Blue admin/manager accounts.
 * Usage:
 *   node scripts/hash-password.js "YourSecurePassword"
 */
const crypto = require('crypto');

const SALT = 'ab_salt_2024:';

function sha256hex(password) {
  return crypto.createHash('sha256').update(SALT + password).digest('hex');
}

const password = process.argv[2];

if (!password) {
  console.log('Usage: node scripts/hash-password.js <password>');
  console.log('Example: node scripts/hash-password.js "DevAdmin!2026"');
  process.exit(1);
}

const hash = sha256hex(password);

console.log('----------------------------------------------------');
console.log(`Password: ${password}`);
console.log(`Hash:     ${hash}`);
console.log('----------------------------------------------------');
console.log('Set this in your .env or .env.local file:');
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.log('----------------------------------------------------');
