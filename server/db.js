const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

// Database file location
const DB_PATH = path.join(__dirname, 'data', 'cow_management.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Initialize database
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// All collection names (tables)
const COLLECTIONS = [
  'cm_locations',
  'cm_facilities',
  'cm_cows',
  'cm_fodder_types',
  'cm_fodder_inventory',
  'cm_fodder_schedules',
  'cm_health_records',
  'cm_breeding_records',
  'cm_pregnancy_tracking',
  'cm_calving_records',
  'cm_weaning_records',
  'cm_milk_daily',
  'cm_milk_lactation',
  'cm_milk_sales',
  'cm_vaccinations',
  'cm_diseases',
  'cm_deworming',
  'cm_vet_visits',
  'cm_verification_log'
];

// Create tables for all collections
function initTables() {
  const createTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS __collection__ (
      id TEXT PRIMARY KEY,
      json_data TEXT NOT NULL,
      created_at TEXT,
      updated_at TEXT
    )
  `);

  for (const col of COLLECTIONS) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS "${col}" (
        id TEXT PRIMARY KEY,
        json_data TEXT NOT NULL,
        created_at TEXT,
        updated_at TEXT
      )
    `);
  }
  console.log(`✓ Initialized ${COLLECTIONS.length} tables`);
}

// Generate UUID
function generateId() {
  return crypto.randomUUID();
}

// CRUD Operations
function getAll(collection) {
  const stmt = db.prepare(`SELECT json_data FROM "${collection}"`);
  return stmt.all().map(row => JSON.parse(row.json_data));
}

function getById(collection, id) {
  const stmt = db.prepare(`SELECT json_data FROM "${collection}" WHERE id = ?`);
  const row = stmt.get(id);
  return row ? JSON.parse(row.json_data) : null;
}

function add(collection, record) {
  const id = generateId();
  const now = new Date().toISOString();
  record.id = id;
  record.createdAt = now;
  const stmt = db.prepare(`INSERT INTO "${collection}" (id, json_data, created_at) VALUES (?, ?, ?)`);
  stmt.run(id, JSON.stringify(record), now);
  return record;
}

function update(collection, id, updates) {
  const existing = getById(collection, id);
  if (!existing) return null;
  const now = new Date().toISOString();
  const merged = { ...existing, ...updates, id, updatedAt: now };
  const stmt = db.prepare(`UPDATE "${collection}" SET json_data = ?, updated_at = ? WHERE id = ?`);
  stmt.run(JSON.stringify(merged), now, id);
  return merged;
}

function remove(collection, id) {
  const stmt = db.prepare(`DELETE FROM "${collection}" WHERE id = ?`);
  return stmt.run(id);
}

function clearCollection(collection) {
  const stmt = db.prepare(`DELETE FROM "${collection}"`);
  return stmt.run();
}

function bulkInsert(collection, records) {
  const insert = db.prepare(`INSERT OR REPLACE INTO "${collection}" (id, json_data, created_at, updated_at) VALUES (?, ?, ?, ?)`);
  const insertMany = db.transaction((items) => {
    for (const record of items) {
      if (!record.id) record.id = generateId();
      if (!record.createdAt) record.createdAt = new Date().toISOString();
      insert.run(record.id, JSON.stringify(record), record.createdAt, record.updatedAt || null);
    }
  });
  insertMany(records);
}

function exportAll() {
  const data = {};
  for (const col of COLLECTIONS) {
    data[col] = getAll(col);
  }
  return data;
}

function importAll(data) {
  const importTransaction = db.transaction((importData) => {
    for (const [key, records] of Object.entries(importData)) {
      if (key.startsWith('cm_') && Array.isArray(records) && COLLECTIONS.includes(key)) {
        clearCollection(key);
        if (records.length > 0) {
          bulkInsert(key, records);
        }
      }
    }
  });
  importTransaction(data);
}

function getDbSize() {
  const stats = fs.statSync(DB_PATH);
  return stats.size;
}

// Initialize on load
initTables();

module.exports = {
  db,
  COLLECTIONS,
  generateId,
  getAll,
  getById,
  add,
  update,
  remove,
  clearCollection,
  bulkInsert,
  exportAll,
  importAll,
  getDbSize
};
