const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static client files
app.use(express.static(path.join(__dirname, '..', 'client')));

// Middleware to validate collection name
function validateCollection(req, res, next) {
  const { collection } = req.params;
  if (!db.COLLECTIONS.includes(collection)) {
    return res.status(404).json({ error: `Unknown collection: ${collection}` });
  }
  next();
}

// ===== SPECIAL ENDPOINTS (must be before :collection routes) =====

// GET /api/_meta/export - Export all data
app.get('/api/_meta/export', (req, res) => {
  try {
    const data = db.exportAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/_meta/import - Import all data
app.post('/api/_meta/import', (req, res) => {
  try {
    db.importAll(req.body);
    res.json({ success: true, message: 'Data imported successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/_meta/stats - Database statistics
app.get('/api/_meta/stats', (req, res) => {
  try {
    const stats = {};
    let totalRecords = 0;
    for (const col of db.COLLECTIONS) {
      const count = db.getAll(col).length;
      stats[col] = count;
      totalRecords += count;
    }
    res.json({
      collections: db.COLLECTIONS.length,
      totalRecords,
      dbSize: db.getDbSize(),
      tables: stats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== GENERIC CRUD ROUTES =====

// GET /api/:collection - Get all records
app.get('/api/:collection', validateCollection, (req, res) => {
  try {
    const data = db.getAll(req.params.collection);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/:collection/:id - Get single record
app.get('/api/:collection/:id', validateCollection, (req, res) => {
  try {
    const record = db.getById(req.params.collection, req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/:collection - Create new record
app.post('/api/:collection', validateCollection, (req, res) => {
  try {
    const record = db.add(req.params.collection, req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/:collection/:id - Update record
app.put('/api/:collection/:id', validateCollection, (req, res) => {
  try {
    const record = db.update(req.params.collection, req.params.id, req.body);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/:collection/:id - Delete single record
app.delete('/api/:collection/:id', validateCollection, (req, res) => {
  try {
    db.remove(req.params.collection, req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/:collection - Clear entire collection
app.delete('/api/:collection', validateCollection, (req, res) => {
  try {
    db.clearCollection(req.params.collection);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Catch-all: serve client index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║       🐄  Cow Management System Server  🐄       ║
╠══════════════════════════════════════════════════╣
║  Server:   http://localhost:${PORT}                  ║
║  API:      http://localhost:${PORT}/api              ║
║  Database: SQLite (server/data/cow_management.db)║
╚══════════════════════════════════════════════════╝
  `);
});

module.exports = app;
