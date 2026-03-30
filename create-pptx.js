const pptxgen = require("pptxgenjs");
const pres = new pptxgen();

pres.layout = "LAYOUT_16x9";
pres.author = "CowManager Team";
pres.title = "Cow Management System - Architecture & Technology (v2.0)";

// Color palette - Forest & Emerald theme
const C = {
  dark: "064E3B",
  primary: "059669",
  primaryLight: "34D399",
  accent: "F59E0B",
  accentLight: "FCD34D",
  bg: "F8FAFC",
  bgAlt: "ECFDF5",
  white: "FFFFFF",
  text: "0F172A",
  textMuted: "64748B",
  border: "E2E8F0",
  blue: "3B82F6",
  blueLight: "DBEAFE",
  purple: "7C3AED",
  purpleLight: "EDE9FE",
  red: "EF4444",
  redLight: "FEE2E2",
  orange: "F59E0B",
  orangeLight: "FEF3C7",
  teal: "0891B2",
  tealLight: "CFFAFE",
};

const mkShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.12 });

// Helper: slide header
function slideHeader(slide, title, subtitle) {
  slide.background = { color: C.bg };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });
  slide.addText(title, { x: 0.5, y: 0.25, w: 9, h: 0.6, fontSize: 26, fontFace: "Arial Black", color: C.dark, margin: 0 });
  if (subtitle) {
    slide.addText(subtitle, { x: 0.5, y: 0.8, w: 9, h: 0.4, fontSize: 13, fontFace: "Calibri", color: C.textMuted, margin: 0 });
  }
}

// ============================================================
// SLIDE 1: TITLE SLIDE
// ============================================================
let s1 = pres.addSlide();
s1.background = { color: C.dark };
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.accent } });
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0.06, w: 0.12, h: 5.565, fill: { color: C.primary } });

s1.addText("COW MANAGEMENT SYSTEM", {
  x: 0.8, y: 0.8, w: 8.4, h: 1.0,
  fontSize: 38, fontFace: "Arial Black", color: C.white, bold: true, charSpacing: 3, margin: 0,
});
s1.addText("Architecture & Technology Stack  |  v2.0", {
  x: 0.8, y: 1.8, w: 8.4, h: 0.6,
  fontSize: 22, fontFace: "Calibri", color: C.primaryLight, margin: 0,
});
s1.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 2.6, w: 2.5, h: 0.04, fill: { color: C.accent } });
s1.addText("Full-Stack Cattle Farm Digital Platform", {
  x: 0.8, y: 2.85, w: 8.4, h: 0.5,
  fontSize: 16, fontFace: "Calibri", color: "A7F3D0", italic: true, margin: 0,
});

// Architecture badges
s1.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.5, w: 8.4, h: 0.5, fill: { color: "065F46" } });
s1.addText("Node.js  +  Express.js  +  SQLite  +  REST API  +  HTML5/CSS3/JS", {
  x: 0.8, y: 3.5, w: 8.4, h: 0.5,
  fontSize: 14, fontFace: "Consolas", color: C.primaryLight, align: "center", valign: "middle", margin: 0,
});

// Stats bar
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.4, w: 10, h: 1.225, fill: { color: "065F46" } });
const stats = [
  { label: "MODULES", value: "15" },
  { label: "API ENDPOINTS", value: "25+" },
  { label: "DB TABLES", value: "19" },
  { label: "FULL-STACK", value: "YES" },
];
stats.forEach((st, i) => {
  const sx = 0.5 + i * 2.4;
  s1.addText(st.value, { x: sx, y: 4.52, w: 2, h: 0.55, fontSize: 28, fontFace: "Arial Black", color: C.accent, align: "center", valign: "middle", margin: 0 });
  s1.addText(st.label, { x: sx, y: 5.05, w: 2, h: 0.35, fontSize: 10, fontFace: "Calibri", color: "A7F3D0", align: "center", valign: "top", charSpacing: 2, margin: 0 });
});


// ============================================================
// SLIDE 2: HIGH-LEVEL ARCHITECTURE (3-Tier Full-Stack)
// ============================================================
let s2 = pres.addSlide();
slideHeader(s2, "HIGH-LEVEL ARCHITECTURE", "Full-Stack Application with Client-Server Separation & SQLite Database");

const tiers = [
  { label: "PRESENTATION LAYER", sub: "Client (HTML5 / CSS3 / JS)", color: C.blue, bg: C.blueLight, y: 1.35,
    items: "Responsive SPA  |  15 Page Sections  |  Async/Await Store  |  Fetch API  |  Service Worker (PWA)  |  Glassmorphism UI" },
  { label: "APPLICATION LAYER", sub: "Server (Node.js + Express.js)", color: C.primary, bg: C.bgAlt, y: 2.65,
    items: "REST API  |  Generic CRUD Routes  |  CORS  |  JSON Body Parser (50MB)  |  Static File Serving  |  Export/Import Endpoints" },
  { label: "DATA LAYER", sub: "SQLite Database (better-sqlite3)", color: C.accent, bg: C.orangeLight, y: 3.95,
    items: "19 Tables  |  WAL Journal Mode  |  UUID Primary Keys  |  JSON Document Storage  |  Transaction Support  |  Data Migration" },
];

tiers.forEach((t) => {
  s2.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: t.y, w: 9, h: 1.1, fill: { color: C.white }, line: { color: C.border, width: 1 }, shadow: mkShadow() });
  s2.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: t.y, w: 0.08, h: 1.1, fill: { color: t.color } });
  s2.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: t.y + 0.15, w: 2.8, h: 0.35, fill: { color: t.bg } });
  s2.addText(t.label, { x: 0.9, y: t.y + 0.15, w: 2.6, h: 0.35, fontSize: 11, fontFace: "Arial Black", color: t.color, valign: "middle", margin: 0 });
  s2.addText(t.sub, { x: 3.8, y: t.y + 0.15, w: 4, h: 0.35, fontSize: 11, fontFace: "Calibri", color: C.textMuted, valign: "middle", margin: 0 });
  s2.addText(t.items, { x: 0.9, y: t.y + 0.6, w: 8.3, h: 0.35, fontSize: 11, fontFace: "Calibri", color: C.text, valign: "middle", margin: 0 });
});

// Arrows
[2.45, 3.75].forEach((ay) => {
  s2.addText("REST API \u25BC", { x: 3.5, y: ay, w: 3, h: 0.2, fontSize: 10, color: C.primary, align: "center", bold: true, margin: 0 });
});


// ============================================================
// SLIDE 3: TECHNOLOGY STACK
// ============================================================
let s3 = pres.addSlide();
slideHeader(s3, "TECHNOLOGY STACK", "");

const techCards = [
  { title: "Node.js", sub: "Runtime", desc: "Server-side JavaScript\nExpress.js framework\nRESTful API design", color: C.primary, x: 0.5, y: 1.15 },
  { title: "Express.js", sub: "Backend", desc: "Route handling, CORS\nJSON body parsing\nStatic file serving", color: "339933", x: 3.55, y: 1.15 },
  { title: "SQLite", sub: "Database", desc: "19 document-style tables\nWAL mode, transactions\nbetter-sqlite3 driver", color: C.blue, x: 6.6, y: 1.15 },
  { title: "HTML5 / CSS3", sub: "Frontend", desc: "Glassmorphism, Gradients\nFlexbox, Grid, Animations\nCSS Variables, Responsive", color: C.purple, x: 0.5, y: 3.15 },
  { title: "JavaScript ES6+", sub: "Client Logic", desc: "Async/Await, Fetch API\nModule pattern, Templates\nService Worker (PWA)", color: C.accent, x: 3.55, y: 3.15 },
  { title: "REST API", sub: "Communication", desc: "Generic CRUD endpoints\nExport/Import JSON\nStats & monitoring", color: C.red, x: 6.6, y: 3.15 },
];

techCards.forEach((tc) => {
  s3.addShape(pres.shapes.RECTANGLE, { x: tc.x, y: tc.y, w: 2.85, h: 1.8, fill: { color: C.white }, line: { color: C.border, width: 1 }, shadow: mkShadow() });
  s3.addShape(pres.shapes.RECTANGLE, { x: tc.x, y: tc.y, w: 2.85, h: 0.04, fill: { color: tc.color } });
  s3.addText(tc.title, { x: tc.x + 0.2, y: tc.y + 0.12, w: 2.45, h: 0.35, fontSize: 14, fontFace: "Arial Black", color: tc.color, margin: 0 });
  s3.addText(tc.sub, { x: tc.x + 0.2, y: tc.y + 0.45, w: 2.45, h: 0.25, fontSize: 10, fontFace: "Calibri", color: C.textMuted, margin: 0 });
  s3.addText(tc.desc, { x: tc.x + 0.2, y: tc.y + 0.75, w: 2.45, h: 0.9, fontSize: 11, fontFace: "Calibri", color: C.text, margin: 0 });
});


// ============================================================
// SLIDE 4: CLIENT-SERVER ARCHITECTURE DIAGRAM
// ============================================================
let s4 = pres.addSlide();
slideHeader(s4, "CLIENT-SERVER ARCHITECTURE", "Separated Frontend & Backend with REST API Communication");

// Client box
s4.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 1.3, w: 3.5, h: 3.6, fill: { color: C.blueLight }, line: { color: C.blue, width: 2 }, shadow: mkShadow() });
s4.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 1.3, w: 3.5, h: 0.45, fill: { color: C.blue } });
s4.addText("CLIENT  (client/)", { x: 0.3, y: 1.3, w: 3.5, h: 0.45, fontSize: 13, fontFace: "Arial Black", color: C.white, align: "center", valign: "middle", margin: 0 });

const clientItems = [
  { label: "index.html", desc: "15 page sections, modals, tabs" },
  { label: "app.js", desc: "Async Store + 15 modules" },
  { label: "styles.css", desc: "Glassmorphism, gradients" },
  { label: "sw.js", desc: "PWA service worker" },
  { label: "manifest.json", desc: "App install config + icons" },
];
clientItems.forEach((ci, i) => {
  const cy = 1.95 + i * 0.55;
  s4.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: cy, w: 3.1, h: 0.45, fill: { color: C.white }, line: { color: C.border, width: 0.5 } });
  s4.addText(ci.label, { x: 0.6, y: cy, w: 1.2, h: 0.45, fontSize: 9, fontFace: "Consolas", color: C.blue, valign: "middle", bold: true, margin: 0 });
  s4.addText(ci.desc, { x: 1.8, y: cy, w: 1.7, h: 0.45, fontSize: 8, fontFace: "Calibri", color: C.textMuted, valign: "middle", margin: 0 });
});

// Server box
s4.addShape(pres.shapes.RECTANGLE, { x: 6.2, y: 1.3, w: 3.5, h: 3.6, fill: { color: C.bgAlt }, line: { color: C.primary, width: 2 }, shadow: mkShadow() });
s4.addShape(pres.shapes.RECTANGLE, { x: 6.2, y: 1.3, w: 3.5, h: 0.45, fill: { color: C.primary } });
s4.addText("SERVER  (server/)", { x: 6.2, y: 1.3, w: 3.5, h: 0.45, fontSize: 13, fontFace: "Arial Black", color: C.white, align: "center", valign: "middle", margin: 0 });

const serverItems = [
  { label: "server.js", desc: "Express app, REST routes" },
  { label: "db.js", desc: "SQLite CRUD operations" },
  { label: "migrate.js", desc: "Data migration tool" },
  { label: "package.json", desc: "Dependencies config" },
  { label: "data/*.db", desc: "SQLite database file" },
];
serverItems.forEach((si, i) => {
  const sy = 1.95 + i * 0.55;
  s4.addShape(pres.shapes.RECTANGLE, { x: 6.4, y: sy, w: 3.1, h: 0.45, fill: { color: C.white }, line: { color: C.border, width: 0.5 } });
  s4.addText(si.label, { x: 6.5, y: sy, w: 1.2, h: 0.45, fontSize: 9, fontFace: "Consolas", color: C.primary, valign: "middle", bold: true, margin: 0 });
  s4.addText(si.desc, { x: 7.7, y: sy, w: 1.7, h: 0.45, fontSize: 8, fontFace: "Calibri", color: C.textMuted, valign: "middle", margin: 0 });
});

// REST API arrows in the middle
s4.addShape(pres.shapes.RECTANGLE, { x: 4.05, y: 1.8, w: 1.9, h: 2.8, fill: { color: C.orangeLight }, line: { color: C.accent, width: 1.5 } });
s4.addText("REST API", { x: 4.05, y: 1.85, w: 1.9, h: 0.35, fontSize: 11, fontFace: "Arial Black", color: C.accent, align: "center", valign: "middle", margin: 0 });

const apiRoutes = [
  "GET /api/:collection",
  "POST /api/:collection",
  "PUT /api/:collection/:id",
  "DELETE /api/:collection/:id",
  "GET /api/_meta/export",
  "POST /api/_meta/import",
  "GET /api/_meta/stats",
];
apiRoutes.forEach((r, i) => {
  s4.addText(r, { x: 4.15, y: 2.3 + i * 0.3, w: 1.7, h: 0.28, fontSize: 7, fontFace: "Consolas", color: C.text, align: "center", valign: "middle", margin: 0 });
});

// Arrows
s4.addText("\u25B6", { x: 3.8, y: 2.5, w: 0.3, h: 0.4, fontSize: 16, color: C.accent, align: "center", margin: 0 });
s4.addText("\u25C0", { x: 3.8, y: 3.2, w: 0.3, h: 0.4, fontSize: 16, color: C.accent, align: "center", margin: 0 });
s4.addText("\u25B6", { x: 5.9, y: 2.5, w: 0.3, h: 0.4, fontSize: 16, color: C.accent, align: "center", margin: 0 });
s4.addText("\u25C0", { x: 5.9, y: 3.2, w: 0.3, h: 0.4, fontSize: 16, color: C.accent, align: "center", margin: 0 });


// ============================================================
// SLIDE 5: MODULE ARCHITECTURE (15 MODULES)
// ============================================================
let s5 = pres.addSlide();
slideHeader(s5, "MODULE ARCHITECTURE", "15 Independent Modules with Shared Async Store & REST API Layer");

const groups = [
  { title: "CORE MANAGEMENT", color: C.primary, y: 1.1,
    modules: ["Dashboard", "Locations", "Facilities", "Fodder Mgmt", "Cow Identification"] },
  { title: "LIFECYCLE", color: C.blue, y: 2.3,
    modules: ["Health Records", "Breeding & Pregnancy", "Calving", "Weaning"] },
  { title: "PRODUCTION & HEALTH", color: C.accent, y: 3.5,
    modules: ["Milk Production", "Vaccination", "Disease Tracking", "Deworming", "Vet Visits"] },
  { title: "INTELLIGENCE", color: C.purple, y: 4.7,
    modules: ["Alerts & Notifications", "Cow Verification (Anti-Fraud)"] },
];

groups.forEach((g) => {
  s5.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: g.y, w: 2.2, h: 0.8, fill: { color: g.color } });
  s5.addText(g.title, { x: 0.6, y: g.y, w: 2.0, h: 0.8, fontSize: 10, fontFace: "Arial Black", color: C.white, align: "center", valign: "middle", margin: 0 });
  let mx = 3.0;
  g.modules.forEach((m) => {
    const w = Math.max(m.length * 0.1 + 0.3, 1.2);
    s5.addShape(pres.shapes.RECTANGLE, { x: mx, y: g.y + 0.15, w: w, h: 0.5, fill: { color: C.white }, line: { color: g.color, width: 1.5 }, shadow: mkShadow() });
    s5.addText(m, { x: mx, y: g.y + 0.15, w: w, h: 0.5, fontSize: 10, fontFace: "Calibri", color: g.color, align: "center", valign: "middle", bold: true, margin: 0 });
    mx += w + 0.15;
  });
});


// ============================================================
// SLIDE 6: DATABASE SCHEMA (19 Tables)
// ============================================================
let s6 = pres.addSlide();
slideHeader(s6, "DATABASE SCHEMA", "SQLite with 19 Document-Style Tables  |  server/data/cow_management.db");

// Table schema diagram
s6.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.2, w: 4.2, h: 0.5, fill: { color: C.dark } });
s6.addText("Table Structure (all tables follow same schema)", { x: 0.6, y: 1.2, w: 4.0, h: 0.5, fontSize: 10, fontFace: "Arial Black", color: C.white, valign: "middle", margin: 0 });

const schema = [
  ["id", "TEXT PRIMARY KEY", "UUID v4"],
  ["json_data", "TEXT NOT NULL", "Full record as JSON"],
  ["created_at", "TEXT", "ISO timestamp"],
  ["updated_at", "TEXT", "ISO timestamp"],
];
schema.forEach((row, i) => {
  const ry = 1.7 + i * 0.32;
  const bgColor = i % 2 === 0 ? C.white : "F1F5F9";
  s6.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: ry, w: 4.2, h: 0.32, fill: { color: bgColor } });
  s6.addText(row[0], { x: 0.6, y: ry, w: 1.2, h: 0.32, fontSize: 9, fontFace: "Consolas", color: C.primary, valign: "middle", bold: true, margin: 0 });
  s6.addText(row[1], { x: 1.8, y: ry, w: 1.5, h: 0.32, fontSize: 8, fontFace: "Consolas", color: C.textMuted, valign: "middle", margin: 0 });
  s6.addText(row[2], { x: 3.4, y: ry, w: 1.3, h: 0.32, fontSize: 8, fontFace: "Calibri", color: C.text, valign: "middle", margin: 0 });
});

// All 19 tables list
s6.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.2, w: 4.3, h: 0.5, fill: { color: C.dark } });
s6.addText("19 Collection Tables", { x: 5.3, y: 1.2, w: 4.1, h: 0.5, fontSize: 10, fontFace: "Arial Black", color: C.white, valign: "middle", margin: 0 });

const tables = [
  "cm_locations", "cm_facilities", "cm_cows", "cm_fodder_types",
  "cm_fodder_inventory", "cm_fodder_schedules", "cm_health_records",
  "cm_breeding_records", "cm_pregnancy_tracking", "cm_calving_records",
  "cm_weaning_records", "cm_milk_daily", "cm_milk_lactation",
  "cm_milk_sales", "cm_vaccinations", "cm_diseases",
  "cm_deworming", "cm_vet_visits", "cm_verification_log"
];
tables.forEach((t, i) => {
  const col = i < 10 ? 0 : 1;
  const row = i < 10 ? i : i - 10;
  const tx = 5.3 + col * 2.15;
  const ty = 1.78 + row * 0.28;
  const bgColor = row % 2 === 0 ? C.white : "F1F5F9";
  s6.addShape(pres.shapes.RECTANGLE, { x: tx - 0.1, y: ty, w: 2.1, h: 0.28, fill: { color: bgColor } });
  s6.addText(t, { x: tx, y: ty, w: 2.0, h: 0.28, fontSize: 8, fontFace: "Consolas", color: C.primary, valign: "middle", bold: true, margin: 0 });
});

// Features box at bottom
s6.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.5, w: 9, h: 0.6, fill: { color: C.bgAlt }, line: { color: C.primary, width: 1 } });
s6.addText("WAL Journal Mode  |  Foreign Keys Enabled  |  JSON Document Storage  |  Bulk Insert with Transactions  |  Export/Import All Collections", {
  x: 0.7, y: 4.5, w: 8.6, h: 0.6, fontSize: 10, fontFace: "Calibri", color: C.primary, align: "center", valign: "middle", margin: 0
});


// ============================================================
// SLIDE 7: REST API DESIGN
// ============================================================
let s7 = pres.addSlide();
slideHeader(s7, "REST API DESIGN", "Generic CRUD Endpoints  |  All 19 collections share the same route pattern");

// API routes table
const apiEndpoints = [
  ["GET", "/api/:collection", "Fetch all records in a collection", "200 + JSON array"],
  ["GET", "/api/:collection/:id", "Fetch single record by UUID", "200 + JSON object"],
  ["POST", "/api/:collection", "Create new record (auto ID + timestamp)", "201 + Created record"],
  ["PUT", "/api/:collection/:id", "Merge updates into existing record", "200 + Updated record"],
  ["DELETE", "/api/:collection/:id", "Delete single record", "204 No Content"],
  ["DELETE", "/api/:collection", "Clear entire collection", "204 No Content"],
  ["GET", "/api/_meta/export", "Export all 19 collections as JSON", "200 + Full backup"],
  ["POST", "/api/_meta/import", "Bulk import (replace) from JSON", "200 + Success msg"],
  ["GET", "/api/_meta/stats", "Database size, record counts per table", "200 + Stats object"],
];

// Header
s7.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.2, w: 9, h: 0.4, fill: { color: C.dark } });
s7.addText("METHOD", { x: 0.6, y: 1.2, w: 0.8, h: 0.4, fontSize: 9, fontFace: "Arial Black", color: C.white, valign: "middle", margin: 0 });
s7.addText("ENDPOINT", { x: 1.5, y: 1.2, w: 2.5, h: 0.4, fontSize: 9, fontFace: "Arial Black", color: C.white, valign: "middle", margin: 0 });
s7.addText("DESCRIPTION", { x: 4.1, y: 1.2, w: 3.2, h: 0.4, fontSize: 9, fontFace: "Arial Black", color: C.white, valign: "middle", margin: 0 });
s7.addText("RESPONSE", { x: 7.4, y: 1.2, w: 2, h: 0.4, fontSize: 9, fontFace: "Arial Black", color: C.white, valign: "middle", margin: 0 });

const methodColors = { GET: C.blue, POST: C.primary, PUT: C.accent, DELETE: C.red };
apiEndpoints.forEach((row, i) => {
  const ry = 1.6 + i * 0.37;
  const bgColor = i % 2 === 0 ? C.white : "F1F5F9";
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: ry, w: 9, h: 0.37, fill: { color: bgColor } });
  s7.addText(row[0], { x: 0.6, y: ry, w: 0.8, h: 0.37, fontSize: 9, fontFace: "Arial Black", color: methodColors[row[0]] || C.text, valign: "middle", margin: 0 });
  s7.addText(row[1], { x: 1.5, y: ry, w: 2.5, h: 0.37, fontSize: 8, fontFace: "Consolas", color: C.text, valign: "middle", margin: 0 });
  s7.addText(row[2], { x: 4.1, y: ry, w: 3.2, h: 0.37, fontSize: 9, fontFace: "Calibri", color: C.text, valign: "middle", margin: 0 });
  s7.addText(row[3], { x: 7.4, y: ry, w: 2, h: 0.37, fontSize: 8, fontFace: "Calibri", color: C.textMuted, valign: "middle", margin: 0 });
});

// Middleware box
s7.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.6, w: 9, h: 0.55, fill: { color: C.bgAlt }, line: { color: C.primary, width: 1 } });
s7.addText("Middleware:  CORS  |  JSON Body Parser (50MB limit)  |  Collection Whitelist Validation  |  Static File Server  |  SPA Catch-All", {
  x: 0.7, y: 4.6, w: 8.6, h: 0.55, fontSize: 10, fontFace: "Calibri", color: C.primary, align: "center", valign: "middle", margin: 0
});


// ============================================================
// SLIDE 8: COW ID & ANTI-FRAUD SYSTEM
// ============================================================
let s8 = pres.addSlide();
slideHeader(s8, "COW IDENTIFICATION & ANTI-FRAUD SYSTEM", "");

// Left panel
s8.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 1.2, w: 4.4, h: 4, fill: { color: C.white }, line: { color: C.border, width: 1 }, shadow: mkShadow() });
s8.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 1.2, w: 4.4, h: 0.4, fill: { color: C.primary } });
s8.addText("MULTI-FACTOR IDENTIFICATION", { x: 0.4, y: 1.2, w: 4.2, h: 0.4, fontSize: 11, fontFace: "Arial Black", color: C.white, valign: "middle", margin: 0 });

const idFactors = [
  "1.  Ear Tag (Primary ID)", "2.  RFID Tag (Electronic ID)", "3.  Muzzle Print (Biometric)",
  "4.  Multi-Angle Photos (Front/Left/Right)", "5.  Color & Markings Description",
  "6.  Horn Pattern Classification", "7.  Tail Switch Color",
  "8.  Distinguishing Marks (Scars, Brands)", "9.  Body Condition Score (1-9)",
  "10.  Height & Weight Measurements", "11.  ID Completeness Score (%)"
];
idFactors.forEach((f, i) => {
  s8.addText(f, { x: 0.5, y: 1.7 + i * 0.29, w: 4, h: 0.29, fontSize: 10, fontFace: "Calibri", color: C.text, valign: "middle", margin: 0 });
});

// Right panel - Verification workflow
s8.addShape(pres.shapes.RECTANGLE, { x: 5.3, y: 1.2, w: 4.4, h: 4, fill: { color: C.white }, line: { color: C.border, width: 1 }, shadow: mkShadow() });
s8.addShape(pres.shapes.RECTANGLE, { x: 5.3, y: 1.2, w: 4.4, h: 0.4, fill: { color: C.accent } });
s8.addText("VERIFICATION WORKFLOW", { x: 5.4, y: 1.2, w: 4.2, h: 0.4, fontSize: 11, fontFace: "Arial Black", color: C.white, valign: "middle", margin: 0 });

const vSteps = [
  { num: "1", title: "LOOKUP", desc: "Search by Ear Tag or RFID" },
  { num: "2", title: "COMPARE", desc: "9-point identity checklist\nvs registered profile" },
  { num: "3", title: "SCORE", desc: "Auto-calculate match %\nwith Pass/Partial/Fail result" },
  { num: "4", title: "ALERT", desc: "Flag mismatches as\npossible fraud" },
  { num: "5", title: "LOG", desc: "Audit trail with inspector,\ndate, mismatches recorded" },
];
vSteps.forEach((vs, i) => {
  const vy = 1.75 + i * 0.58;
  s8.addShape(pres.shapes.OVAL, { x: 5.5, y: vy, w: 0.35, h: 0.35, fill: { color: C.accent } });
  s8.addText(vs.num, { x: 5.5, y: vy, w: 0.35, h: 0.35, fontSize: 12, fontFace: "Arial Black", color: C.white, align: "center", valign: "middle", margin: 0 });
  s8.addText(vs.title, { x: 6.0, y: vy, w: 1.0, h: 0.35, fontSize: 10, fontFace: "Arial Black", color: C.accent, valign: "middle", margin: 0 });
  s8.addText(vs.desc, { x: 7.1, y: vy - 0.05, w: 2.4, h: 0.45, fontSize: 9, fontFace: "Calibri", color: C.textMuted, valign: "middle", margin: 0 });
});

// Bottom bar
s8.addShape(pres.shapes.RECTANGLE, { x: 0.3, y: 4.65, w: 9.4, h: 0.45, fill: { color: C.redLight }, line: { color: C.red, width: 1 } });
s8.addText("Duplicate Tag Detection: Real-time alert on form input + block on submit  |  All verification data stored in cm_verification_log table via REST API", {
  x: 0.5, y: 4.65, w: 9.0, h: 0.45, fontSize: 9, fontFace: "Calibri", color: C.red, align: "center", valign: "middle", margin: 0
});


// ============================================================
// SLIDE 9: LOCATION HIERARCHY
// ============================================================
let s9 = pres.addSlide();
slideHeader(s9, "CASCADING LOCATION HIERARCHY", "Smart Dropdown System - Each Level Filters the Next");

const levels = [
  { label: "Country", detail: "India, USA", color: C.dark },
  { label: "State", detail: "36 Indian States/UTs, 50 US States", color: "065F46" },
  { label: "District", detail: "75 UP Districts", color: C.primary },
  { label: "Tahasil", detail: "6 Sitapur Tahasils", color: C.teal },
  { label: "Block", detail: "21 Blocks (incl. Gondalomau)", color: C.blue },
  { label: "Panchayat", detail: "40-70 per Block", color: C.purple },
  { label: "Plot Number", detail: "Free-text entry", color: C.accent },
];

levels.forEach((lv, i) => {
  const lx = 0.5 + i * 1.25;
  const ly = 2.2;
  s9.addShape(pres.shapes.RECTANGLE, { x: lx, y: ly, w: 1.15, h: 1.5, fill: { color: C.white }, line: { color: lv.color, width: 2 }, shadow: mkShadow() });
  s9.addShape(pres.shapes.RECTANGLE, { x: lx, y: ly, w: 1.15, h: 0.04, fill: { color: lv.color } });
  s9.addText(lv.label, { x: lx, y: ly + 0.15, w: 1.15, h: 0.35, fontSize: 10, fontFace: "Arial Black", color: lv.color, align: "center", valign: "middle", margin: 0 });
  s9.addText(lv.detail, { x: lx + 0.05, y: ly + 0.55, w: 1.05, h: 0.8, fontSize: 8, fontFace: "Calibri", color: C.textMuted, align: "center", valign: "top", margin: 0 });
  if (i < levels.length - 1) {
    s9.addText("\u25B6", { x: lx + 1.15, y: ly + 0.5, w: 0.15, h: 0.3, fontSize: 10, color: C.textMuted, align: "center", margin: 0 });
  }
});


// ============================================================
// SLIDE 10: DEPLOYMENT & PWA
// ============================================================
let s10 = pres.addSlide();
slideHeader(s10, "DEPLOYMENT & PWA", "Multi-Platform Deployment Strategy");

// Deployment options
const deployItems = [
  { icon: "\uD83D\uDDA5\uFE0F", title: "Local Development", desc: "node server/server.js\nhttp://localhost:3000", color: C.primary, x: 0.5, y: 1.3 },
  { icon: "\u2601\uFE0F", title: "GitHub Repository", desc: "github.com/Vijai007/CowManagement\nAuto-deploy on push", color: C.text, x: 3.55, y: 1.3 },
  { icon: "\uD83D\uDE80", title: "Render.com (Free)", desc: "Node.js hosting with SQLite\nHTTPS + Auto-deploy", color: C.purple, x: 6.6, y: 1.3 },
];

deployItems.forEach((d) => {
  s10.addShape(pres.shapes.RECTANGLE, { x: d.x, y: d.y, w: 2.85, h: 1.4, fill: { color: C.white }, line: { color: C.border, width: 1 }, shadow: mkShadow() });
  s10.addShape(pres.shapes.RECTANGLE, { x: d.x, y: d.y, w: 2.85, h: 0.04, fill: { color: d.color } });
  s10.addText(d.title, { x: d.x + 0.15, y: d.y + 0.12, w: 2.55, h: 0.35, fontSize: 13, fontFace: "Arial Black", color: d.color, margin: 0 });
  s10.addText(d.desc, { x: d.x + 0.15, y: d.y + 0.55, w: 2.55, h: 0.7, fontSize: 10, fontFace: "Calibri", color: C.textMuted, margin: 0 });
});

// PWA section
s10.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 3.0, w: 9, h: 0.45, fill: { color: C.primary } });
s10.addText("PROGRESSIVE WEB APP (PWA) - Install on iPhone & Android", { x: 0.6, y: 3.0, w: 8.8, h: 0.45, fontSize: 13, fontFace: "Arial Black", color: C.white, valign: "middle", margin: 0 });

const pwaFeatures = [
  { title: "Home Screen Icon", desc: "Green gradient cow icon\n72px to 512px sizes" },
  { title: "Full-Screen Mode", desc: "Standalone display\nNo browser toolbar" },
  { title: "Offline Support", desc: "Service worker caches\nstatic assets" },
  { title: "Auto-Deploy", desc: "GitHub push triggers\nRender.com rebuild" },
];
pwaFeatures.forEach((pf, i) => {
  const px = 0.5 + i * 2.3;
  s10.addShape(pres.shapes.RECTANGLE, { x: px, y: 3.65, w: 2.15, h: 1.3, fill: { color: C.white }, line: { color: C.border, width: 1 }, shadow: mkShadow() });
  s10.addText(pf.title, { x: px + 0.1, y: 3.72, w: 1.95, h: 0.35, fontSize: 11, fontFace: "Arial Black", color: C.primary, margin: 0 });
  s10.addText(pf.desc, { x: px + 0.1, y: 4.1, w: 1.95, h: 0.7, fontSize: 10, fontFace: "Calibri", color: C.textMuted, margin: 0 });
});


// ============================================================
// SLIDE 11: UI/UX DESIGN SYSTEM
// ============================================================
let s11 = pres.addSlide();
slideHeader(s11, "UI / UX DESIGN SYSTEM", "");

// Color palette
s11.addText("COLOR PALETTE", { x: 0.5, y: 1.1, w: 2, h: 0.3, fontSize: 10, fontFace: "Arial Black", color: C.textMuted, margin: 0 });
const palette = [
  { name: "Dark", color: C.dark }, { name: "Primary", color: C.primary }, { name: "Light", color: C.primaryLight },
  { name: "Accent", color: C.accent }, { name: "Info", color: C.blue }, { name: "Danger", color: C.red },
  { name: "Purple", color: C.purple }, { name: "Muted", color: C.textMuted },
];
palette.forEach((p, i) => {
  const cx = 0.5 + i * 1.15;
  s11.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.45, w: 1.0, h: 0.5, fill: { color: p.color } });
  s11.addText(p.name, { x: cx, y: 1.95, w: 1.0, h: 0.25, fontSize: 8, fontFace: "Calibri", color: C.textMuted, align: "center", margin: 0 });
});

// Design features grid
const designFeatures = [
  { title: "Glassmorphism Top Bar", desc: "Semi-transparent header with\nbackdrop-filter blur effect" },
  { title: "Gradient Sidebar", desc: "Dark emerald gradient with\nactive indicator animations" },
  { title: "Card Hover Effects", desc: "Lift animation (translateY)\nwith shadow expansion" },
  { title: "Modal Animations", desc: "Scale + fade entrance with\nblurred backdrop overlay" },
  { title: "Responsive Layout", desc: "Mobile-first with hamburger\nmenu and collapsible sidebar" },
  { title: "Toast Notifications", desc: "Gradient-colored slide-in\nnotifications with auto-dismiss" },
];
designFeatures.forEach((df, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const dx = 0.5 + col * 3.1;
  const dy = 2.5 + row * 1.3;
  s11.addShape(pres.shapes.RECTANGLE, { x: dx, y: dy, w: 2.9, h: 1.1, fill: { color: C.white }, line: { color: C.border, width: 1 }, shadow: mkShadow() });
  s11.addText(df.title, { x: dx + 0.15, y: dy + 0.1, w: 2.6, h: 0.3, fontSize: 11, fontFace: "Arial Black", color: C.primary, margin: 0 });
  s11.addText(df.desc, { x: dx + 0.15, y: dy + 0.45, w: 2.6, h: 0.55, fontSize: 10, fontFace: "Calibri", color: C.textMuted, margin: 0 });
});


// ============================================================
// SLIDE 12: SUMMARY
// ============================================================
let s12 = pres.addSlide();
s12.background = { color: C.dark };
s12.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.accent } });

s12.addText("SUMMARY", {
  x: 0.8, y: 0.3, w: 8.4, h: 0.7,
  fontSize: 30, fontFace: "Arial Black", color: C.white, margin: 0,
});
s12.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.0, w: 2, h: 0.04, fill: { color: C.accent } });

const summaryPoints = [
  "Full-stack architecture: Node.js + Express + SQLite backend with REST API",
  "19 SQLite database tables replacing localStorage for persistent, scalable storage",
  "Generic CRUD API design: all collections share GET/POST/PUT/DELETE endpoints",
  "15 fully functional modules covering end-to-end cattle management",
  "Anti-fraud cow verification system with multi-factor identification",
  "Progressive Web App (PWA) — installable on iPhone & Android",
  "Async/Await throughout client code with fetch-based Store module",
  "Modern UI with glassmorphism, gradients, and responsive design",
  "Deployable to Render.com (free) with auto-deploy from GitHub",
  "Data migration script for importing legacy localStorage backups",
];
summaryPoints.forEach((p, i) => {
  s12.addText("\u2713  " + p, {
    x: 0.8, y: 1.3 + i * 0.38, w: 8.4, h: 0.35,
    fontSize: 13, fontFace: "Calibri", color: i < 3 ? C.accentLight : "A7F3D0", valign: "middle", margin: 0,
  });
});

// Footer
s12.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.25, w: 10, h: 0.375, fill: { color: "065F46" } });
s12.addText("Cow Management System v2.0  |  Full-Stack Architecture  |  github.com/Vijai007/CowManagement", {
  x: 0.5, y: 5.25, w: 9, h: 0.375,
  fontSize: 10, fontFace: "Calibri", color: "A7F3D0", align: "center", valign: "middle", margin: 0,
});


// ============================================================
// GENERATE
// ============================================================
pres.writeFile({ fileName: "C:/CowManagement/CowManagement_Architecture_v2.pptx" })
  .then(() => console.log("PPTX created successfully!"))
  .catch(err => console.error("Error:", err));
