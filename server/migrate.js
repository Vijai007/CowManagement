/**
 * Migration Script: Import data from JSON backup into SQLite
 * Usage: node migrate.js <path-to-backup.json>
 */
const fs = require('fs');
const path = require('path');
const db = require('./db');

const backupFile = process.argv[2];

if (!backupFile) {
  console.log('Usage: node migrate.js <path-to-backup.json>');
  console.log('');
  console.log('This imports data exported from the old localStorage-based app.');
  console.log('Use the Export button in the old app to create the backup JSON file.');
  process.exit(1);
}

const filePath = path.resolve(backupFile);
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

try {
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log('Importing data...');

  let totalRecords = 0;
  for (const [key, records] of Object.entries(json)) {
    if (key.startsWith('cm_') && Array.isArray(records) && db.COLLECTIONS.includes(key)) {
      db.bulkInsert(key, records);
      console.log(`  ✓ ${key}: ${records.length} records`);
      totalRecords += records.length;
    }
  }

  console.log(`\n✅ Migration complete! Imported ${totalRecords} records.`);
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exit(1);
}
