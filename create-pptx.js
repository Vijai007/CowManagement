const pptxgen = require("pptxgenjs");
const pres = new pptxgen();

pres.layout = "LAYOUT_16x9";
pres.author = "CowManager Team";
pres.title = "Cow Management System - Architecture & Technology";

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

// ============================================================
// SLIDE 1: TITLE SLIDE
// ============================================================
let s1 = pres.addSlide();
s1.background = { color: C.dark };

// Decorative top bar
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.accent } });

// Left decorative strip
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0.06, w: 0.12, h: 5.565, fill: { color: C.primary } });

// Main title area
s1.addText("COW MANAGEMENT SYSTEM", {
  x: 0.8, y: 1.0, w: 8.4, h: 1.0,
  fontSize: 38, fontFace: "Arial Black", color: C.white, bold: true,
  charSpacing: 3, margin: 0,
});

s1.addText("Architecture & Technology Stack", {
  x: 0.8, y: 2.0, w: 8.4, h: 0.6,
  fontSize: 22, fontFace: "Calibri", color: C.primaryLight, margin: 0,
});

// Divider line
s1.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 2.8, w: 2.5, h: 0.04, fill: { color: C.accent } });

s1.addText("Complete Cattle Farm Digital Platform", {
  x: 0.8, y: 3.1, w: 8.4, h: 0.5,
  fontSize: 16, fontFace: "Calibri", color: "A7F3D0", italic: true, margin: 0,
});

// Stats bar at bottom
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.4, w: 10, h: 1.225, fill: { color: "065F46" } });

const stats = [
  { label: "MODULES", value: "15" },
  { label: "FEATURES", value: "50+" },
  { label: "STORAGE", value: "LOCAL" },
  { label: "RESPONSIVE", value: "YES" },
];
stats.forEach((st, i) => {
  const sx = 0.5 + i * 2.4;
  s1.addText(st.value, { x: sx, y: 4.52, w: 2, h: 0.55, fontSize: 28, fontFace: "Arial Black", color: C.accent, align: "center", valign: "middle", margin: 0 });
  s1.addText(st.label, { x: sx, y: 5.05, w: 2, h: 0.35, fontSize: 10, fontFace: "Calibri", color: "A7F3D0", align: "center", valign: "top", charSpacing: 2, margin: 0 });
});


// ============================================================
// SLIDE 2: HIGH-LEVEL ARCHITECTURE
// ============================================================
let s2 = pres.addSlide();
s2.background = { color: C.bg };
s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });

s2.addText("HIGH-LEVEL ARCHITECTURE", {
  x: 0.5, y: 0.25, w: 9, h: 0.6,
  fontSize: 26, fontFace: "Arial Black", color: C.dark, margin: 0,
});
s2.addText("Single Page Application (SPA) with Client-Side Data Persistence", {
  x: 0.5, y: 0.8, w: 9, h: 0.4,
  fontSize: 13, fontFace: "Calibri", color: C.textMuted, margin: 0,
});

// 3-Tier boxes
const tiers = [
  { label: "PRESENTATION LAYER", sub: "HTML5 / CSS3", color: C.blue, bg: C.blueLight, y: 1.45, items: "Responsive UI  |  15 Page Sections  |  Modal System  |  Tab Navigation  |  Detail Panels  |  Toast Notifications" },
  { label: "APPLICATION LAYER", sub: "Vanilla JavaScript (ES6+)", color: C.primary, bg: C.bgAlt, y: 2.75, items: "Router  |  15 Modules  |  Store API  |  UI Utilities  |  Image Compression  |  Form Validation" },
  { label: "DATA LAYER", sub: "Browser localStorage", color: C.accent, bg: C.orangeLight, y: 4.05, items: "JSON Serialization  |  CRUD Operations  |  Query Engine  |  Export/Import  |  Auto Timestamps  |  UUID Generation" },
];

tiers.forEach((t) => {
  // Card
  s2.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: t.y, w: 9, h: 1.1, fill: { color: C.white }, line: { color: C.border, width: 1 }, shadow: mkShadow() });
  // Left accent
  s2.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: t.y, w: 0.08, h: 1.1, fill: { color: t.color } });
  // Label bg
  s2.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: t.y + 0.15, w: 2.8, h: 0.35, fill: { color: t.bg } });
  s2.addText(t.label, { x: 0.9, y: t.y + 0.15, w: 2.6, h: 0.35, fontSize: 11, fontFace: "Arial Black", color: t.color, valign: "middle", margin: 0 });
  s2.addText(t.sub, { x: 3.8, y: t.y + 0.15, w: 3, h: 0.35, fontSize: 11, fontFace: "Calibri", color: C.textMuted, valign: "middle", margin: 0 });
  s2.addText(t.items, { x: 0.9, y: t.y + 0.6, w: 8.3, h: 0.35, fontSize: 11, fontFace: "Calibri", color: C.text, valign: "middle", margin: 0 });
});

// Arrows between tiers
[2.55, 3.85].forEach((ay) => {
  s2.addText("\u25BC", { x: 4.5, y: ay, w: 1, h: 0.2, fontSize: 14, color: C.textMuted, align: "center", margin: 0 });
});


// ============================================================
// SLIDE 3: TECHNOLOGY STACK
// ============================================================
let s3 = pres.addSlide();
s3.background = { color: C.bg };
s3.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });

s3.addText("TECHNOLOGY STACK", {
  x: 0.5, y: 0.25, w: 9, h: 0.6,
  fontSize: 26, fontFace: "Arial Black", color: C.dark, margin: 0,
});

const techCards = [
  { title: "HTML5", sub: "Structure", desc: "Semantic sections, forms,\ntables, canvas, datalists,\nmulti-file upload", color: C.blue, x: 0.5, y: 1.15 },
  { title: "CSS3", sub: "Styling", desc: "CSS Variables, Flexbox, Grid,\nAnimations, Glassmorphism,\nGradients, Media Queries", color: C.purple, x: 3.55, y: 1.15 },
  { title: "JavaScript ES6+", sub: "Logic", desc: "Modules, Template Literals,\nAsync/Await, LocalStorage,\nFormData, Crypto API", color: C.primary, x: 6.6, y: 1.15 },
  { title: "Google Fonts", sub: "Typography", desc: "Inter font family\n300-700 weights\nCross-browser rendering", color: C.teal, x: 0.5, y: 3.15 },
  { title: "Canvas API", sub: "Charts", desc: "Custom bar charts\nBread distribution\nDynamic rendering", color: C.accent, x: 3.55, y: 3.15 },
  { title: "localStorage", sub: "Database", desc: "JSON persistence\nExport/Import JSON\nUp to 10MB storage", color: C.red, x: 6.6, y: 3.15 },
];

techCards.forEach((tc) => {
  s3.addShape(pres.shapes.RECTANGLE, { x: tc.x, y: tc.y, w: 2.85, h: 1.8, fill: { color: C.white }, line: { color: C.border, width: 1 }, shadow: mkShadow() });
  s3.addShape(pres.shapes.RECTANGLE, { x: tc.x, y: tc.y, w: 2.85, h: 0.04, fill: { color: tc.color } });
  s3.addText(tc.title, { x: tc.x + 0.2, y: tc.y + 0.12, w: 2.45, h: 0.35, fontSize: 14, fontFace: "Arial Black", color: tc.color, margin: 0 });
  s3.addText(tc.sub, { x: tc.x + 0.2, y: tc.y + 0.45, w: 2.45, h: 0.25, fontSize: 10, fontFace: "Calibri", color: C.textMuted, margin: 0 });
  s3.addText(tc.desc, { x: tc.x + 0.2, y: tc.y + 0.75, w: 2.45, h: 0.9, fontSize: 11, fontFace: "Calibri", color: C.text, margin: 0 });
});


// ============================================================
// SLIDE 4: MODULE ARCHITECTURE (15 MODULES)
// ============================================================
let s4 = pres.addSlide();
s4.background = { color: C.bg };
s4.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });

s4.addText("MODULE ARCHITECTURE", {
  x: 0.5, y: 0.2, w: 9, h: 0.5,
  fontSize: 26, fontFace: "Arial Black", color: C.dark, margin: 0,
});
s4.addText("15 Independent Modules with Shared Store & UI Layer", {
  x: 0.5, y: 0.65, w: 9, h: 0.3,
  fontSize: 12, fontFace: "Calibri", color: C.textMuted, margin: 0,
});

// Module groups
const groups = [
  {
    title: "CORE MANAGEMENT", color: C.primary, y: 1.1,
    modules: ["Dashboard", "Locations", "Facilities", "Fodder Mgmt", "Cow Identification"]
  },
  {
    title: "LIFECYCLE", color: C.blue, y: 2.3,
    modules: ["Health Records", "Breeding & Pregnancy", "Calving", "Weaning"]
  },
  {
    title: "PRODUCTION & HEALTH", color: C.accent, y: 3.5,
    modules: ["Milk Production", "Vaccination", "Disease Tracking", "Deworming", "Vet Visits"]
  },
  {
    title: "INTELLIGENCE", color: C.purple, y: 4.7,
    modules: ["Alerts & Notifications", "Cow Verification (Anti-Fraud)"]
  },
];

groups.forEach((g) => {
  // Group label
  s4.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: g.y, w: 2.2, h: 0.8, fill: { color: g.color } });
  s4.addText(g.title, { x: 0.6, y: g.y, w: 2.0, h: 0.8, fontSize: 10, fontFace: "Arial Black", color: C.white, align: "center", valign: "middle", margin: 0 });

  // Module pills
  let mx = 3.0;
  g.modules.forEach((m) => {
    const w = Math.max(m.length * 0.1 + 0.3, 1.2);
    s4.addShape(pres.shapes.RECTANGLE, { x: mx, y: g.y + 0.15, w: w, h: 0.5, fill: { color: C.white }, line: { color: g.color, width: 1.5 }, shadow: mkShadow() });
    s4.addText(m, { x: mx, y: g.y + 0.15, w: w, h: 0.5, fontSize: 10, fontFace: "Calibri", color: g.color, align: "center", valign: "middle", bold: true, margin: 0 });
    mx += w + 0.15;
  });
});


// ============================================================
// SLIDE 5: DATA FLOW & STORAGE
// ============================================================
let s5 = pres.addSlide();
s5.background = { color: C.bg };
s5.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });

s5.addText("DATA FLOW & STORAGE MODEL", {
  x: 0.5, y: 0.25, w: 9, h: 0.6,
  fontSize: 26, fontFace: "Arial Black", color: C.dark, margin: 0,
});

// Storage keys table
const storageKeys = [
  ["cm_locations", "Geographic locations (Country to Panchayat)"],
  ["cm_facilities", "Farm facilities, sheds, budget"],
  ["cm_cows", "Cow records + multi-factor ID + photos"],
  ["cm_fodder_types / inventory / schedules", "Feed management (3 tables)"],
  ["cm_health_records", "Individual & group health checks"],
  ["cm_breeding_records / pregnancy_tracking", "Breeding & pregnancy (2 tables)"],
  ["cm_calving_records / weaning_records", "Calving & weaning data"],
  ["cm_milk_daily / lactation / sales", "Milk production (3 tables)"],
  ["cm_vaccinations", "Vaccination schedules & records"],
  ["cm_diseases", "Disease tracking & quarantine"],
  ["cm_deworming", "Deworming logs"],
  ["cm_vet_visits", "Veterinary visit records"],
  ["cm_verification_log", "Cow identity verification audit trail"],
];

// Header
s5.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.05, w: 9, h: 0.38, fill: { color: C.dark } });
s5.addText("STORAGE KEY", { x: 0.6, y: 1.05, w: 4.2, h: 0.38, fontSize: 10, fontFace: "Arial Black", color: C.white, valign: "middle", margin: 0 });
s5.addText("DESCRIPTION", { x: 4.9, y: 1.05, w: 4.5, h: 0.38, fontSize: 10, fontFace: "Arial Black", color: C.white, valign: "middle", margin: 0 });

storageKeys.forEach((row, i) => {
  const ry = 1.43 + i * 0.3;
  const bgColor = i % 2 === 0 ? C.white : "F1F5F9";
  s5.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: ry, w: 9, h: 0.3, fill: { color: bgColor } });
  s5.addText(row[0], { x: 0.6, y: ry, w: 4.2, h: 0.3, fontSize: 9, fontFace: "Consolas", color: C.primary, valign: "middle", bold: true, margin: 0 });
  s5.addText(row[1], { x: 4.9, y: ry, w: 4.5, h: 0.3, fontSize: 9, fontFace: "Calibri", color: C.text, valign: "middle", margin: 0 });
});


// ============================================================
// SLIDE 6: COW IDENTIFICATION & ANTI-FRAUD
// ============================================================
let s6 = pres.addSlide();
s6.background = { color: C.bg };
s6.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });

s6.addText("COW IDENTIFICATION & ANTI-FRAUD SYSTEM", {
  x: 0.5, y: 0.25, w: 9, h: 0.6,
  fontSize: 24, fontFace: "Arial Black", color: C.dark, margin: 0,
});

// Left: Multi-factor ID
s6.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.1, w: 4.3, h: 4.2, fill: { color: C.white }, line: { color: C.border, width: 1 }, shadow: mkShadow() });
s6.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 1.1, w: 4.3, h: 0.04, fill: { color: C.primary } });
s6.addText("MULTI-FACTOR IDENTIFICATION", { x: 0.7, y: 1.2, w: 3.9, h: 0.4, fontSize: 12, fontFace: "Arial Black", color: C.primary, margin: 0 });

const idFactors = [
  "Ear Tag (Primary ID)",
  "RFID Tag (Electronic ID)",
  "Muzzle Print (Biometric)",
  "Multi-Angle Photos (Front/Left/Right)",
  "Color & Markings Description",
  "Horn Pattern Classification",
  "Tail Switch Color",
  "Distinguishing Marks (Scars, Brands)",
  "Body Condition Score (1-9)",
  "Height & Weight Measurements",
  "ID Completeness Score (%)",
];
s6.addText(idFactors.map((f, i) => ({
  text: `${i + 1}.  ${f}`,
  options: { breakLine: true, fontSize: 10, fontFace: "Calibri", color: C.text, paraSpaceAfter: 4 }
})), { x: 0.7, y: 1.7, w: 3.9, h: 3.4, margin: 0 });

// Right: Verification flow
s6.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.1, w: 4.3, h: 4.2, fill: { color: C.white }, line: { color: C.border, width: 1 }, shadow: mkShadow() });
s6.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.1, w: 4.3, h: 0.04, fill: { color: C.red } });
s6.addText("VERIFICATION WORKFLOW", { x: 5.4, y: 1.2, w: 3.9, h: 0.4, fontSize: 12, fontFace: "Arial Black", color: C.red, margin: 0 });

const verifySteps = [
  { step: "1", title: "LOOKUP", desc: "Search by Ear Tag or RFID" },
  { step: "2", title: "COMPARE", desc: "9-point identity checklist\nvs registered profile" },
  { step: "3", title: "SCORE", desc: "Auto-calculate match %\nwith Pass/Partial/Fail result" },
  { step: "4", title: "ALERT", desc: "Flag mismatches as\npossible fraud" },
  { step: "5", title: "LOG", desc: "Audit trail with inspector,\ndate, mismatches recorded" },
];

verifySteps.forEach((vs, i) => {
  const vy = 1.75 + i * 0.65;
  s6.addShape(pres.shapes.OVAL, { x: 5.5, y: vy, w: 0.4, h: 0.4, fill: { color: C.red } });
  s6.addText(vs.step, { x: 5.5, y: vy, w: 0.4, h: 0.4, fontSize: 12, fontFace: "Arial Black", color: C.white, align: "center", valign: "middle", margin: 0 });
  s6.addText(vs.title, { x: 6.1, y: vy - 0.02, w: 1.2, h: 0.22, fontSize: 10, fontFace: "Arial Black", color: C.text, margin: 0 });
  s6.addText(vs.desc, { x: 6.1, y: vy + 0.2, w: 3.2, h: 0.35, fontSize: 9, fontFace: "Calibri", color: C.textMuted, margin: 0 });
});

// Duplicate detection callout
s6.addShape(pres.shapes.RECTANGLE, { x: 5.4, y: 4.55, w: 3.9, h: 0.55, fill: { color: C.redLight } });
s6.addText("Duplicate Tag Detection: Real-time alert on form input + block on submit", { x: 5.5, y: 4.55, w: 3.7, h: 0.55, fontSize: 9, fontFace: "Calibri", color: C.red, valign: "middle", bold: true, margin: 0 });


// ============================================================
// SLIDE 7: LOCATION HIERARCHY
// ============================================================
let s7 = pres.addSlide();
s7.background = { color: C.bg };
s7.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });

s7.addText("CASCADING LOCATION HIERARCHY", {
  x: 0.5, y: 0.25, w: 9, h: 0.6,
  fontSize: 26, fontFace: "Arial Black", color: C.dark, margin: 0,
});
s7.addText("Smart Dropdown System - Each Level Filters the Next", {
  x: 0.5, y: 0.8, w: 9, h: 0.3,
  fontSize: 13, fontFace: "Calibri", color: C.textMuted, margin: 0,
});

const hierarchy = [
  { label: "Country", example: "India, USA", color: C.dark },
  { label: "State", example: "36 Indian States/UTs, 50 US States", color: "065F46" },
  { label: "District", example: "75 UP Districts", color: C.primary },
  { label: "Tahasil", example: "6 Sitapur Tahasils", color: "10B981" },
  { label: "Block", example: "21 Blocks (incl. Gondalomau)", color: C.primaryLight },
  { label: "Panchayat", example: "40-70 per Block", color: "6EE7B7" },
  { label: "Plot Number", example: "Free-text entry", color: "A7F3D0" },
];

const cx = 5.0;
hierarchy.forEach((h, i) => {
  const hy = 1.35 + i * 0.55;
  const bw = 3.2 + i * 0.25;
  const bx = cx - bw / 2;
  s7.addShape(pres.shapes.RECTANGLE, { x: bx, y: hy, w: bw, h: 0.42, fill: { color: h.color }, shadow: mkShadow() });
  s7.addText(h.label, { x: bx + 0.15, y: hy, w: 1.4, h: 0.42, fontSize: 11, fontFace: "Arial Black", color: C.white, valign: "middle", margin: 0 });
  s7.addText(h.example, { x: bx + 1.6, y: hy, w: bw - 1.75, h: 0.42, fontSize: 10, fontFace: "Calibri", color: "D1FAE5", valign: "middle", margin: 0 });
  if (i < hierarchy.length - 1) {
    s7.addText("\u25BC", { x: cx - 0.25, y: hy + 0.38, w: 0.5, h: 0.2, fontSize: 10, color: C.textMuted, align: "center", margin: 0 });
  }
});


// ============================================================
// SLIDE 8: FEATURE HIGHLIGHTS
// ============================================================
let s8 = pres.addSlide();
s8.background = { color: C.bg };
s8.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });

s8.addText("KEY FEATURE HIGHLIGHTS", {
  x: 0.5, y: 0.25, w: 9, h: 0.5,
  fontSize: 26, fontFace: "Arial Black", color: C.dark, margin: 0,
});

const features = [
  { icon: "\uD83E\uDD5B", title: "Milk Production", desc: "Daily AM/PM recording, fat%, SNF%, lactation tracking, 305-day yield, sales & revenue", color: C.blue },
  { icon: "\uD83D\uDC89", title: "Vaccination", desc: "Scheduled/completed/overdue tracking, 11 common vaccines, booster reminders", color: C.teal },
  { icon: "\uD83E\uDDA0", title: "Disease Tracking", desc: "18 cattle diseases, symptom/diagnosis/treatment, quarantine management", color: C.red },
  { icon: "\uD83D\uDC8A", title: "Deworming", desc: "10 drug options, dosage/route/schedule, group deworming, next-due alerts", color: C.purple },
  { icon: "\uD83E\uDE7A", title: "Vet Visits", desc: "Multi-cow visits, prescriptions, follow-up scheduling, cost tracking", color: C.accent },
  { icon: "\uD83D\uDD14", title: "Smart Alerts", desc: "7 alert categories: vaccination, deworming, calving, disease, fodder, vet & health follow-ups", color: C.primary },
];

features.forEach((f, i) => {
  const row = Math.floor(i / 3);
  const col = i % 3;
  const fx = 0.5 + col * 3.1;
  const fy = 1.0 + row * 2.15;

  s8.addShape(pres.shapes.RECTANGLE, { x: fx, y: fy, w: 2.9, h: 1.95, fill: { color: C.white }, line: { color: C.border, width: 1 }, shadow: mkShadow() });
  s8.addShape(pres.shapes.RECTANGLE, { x: fx, y: fy, w: 0.06, h: 1.95, fill: { color: f.color } });
  s8.addText(f.icon, { x: fx + 0.2, y: fy + 0.12, w: 0.5, h: 0.5, fontSize: 24, margin: 0 });
  s8.addText(f.title, { x: fx + 0.7, y: fy + 0.15, w: 2.0, h: 0.35, fontSize: 13, fontFace: "Arial Black", color: f.color, valign: "middle", margin: 0 });
  s8.addText(f.desc, { x: fx + 0.2, y: fy + 0.7, w: 2.5, h: 1.1, fontSize: 10, fontFace: "Calibri", color: C.text, margin: 0 });
});


// ============================================================
// SLIDE 9: UI/UX DESIGN
// ============================================================
let s9 = pres.addSlide();
s9.background = { color: C.bg };
s9.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });

s9.addText("UI / UX DESIGN SYSTEM", {
  x: 0.5, y: 0.25, w: 9, h: 0.6,
  fontSize: 26, fontFace: "Arial Black", color: C.dark, margin: 0,
});

// Color palette showcase
s9.addText("COLOR PALETTE", { x: 0.5, y: 1.0, w: 3, h: 0.3, fontSize: 11, fontFace: "Arial Black", color: C.textMuted, margin: 0 });
const palette = [
  { color: C.dark, label: "Dark" },
  { color: C.primary, label: "Primary" },
  { color: C.primaryLight, label: "Light" },
  { color: C.accent, label: "Accent" },
  { color: C.blue, label: "Info" },
  { color: C.red, label: "Danger" },
  { color: C.purple, label: "Purple" },
  { color: C.textMuted, label: "Muted" },
];
palette.forEach((p, i) => {
  s9.addShape(pres.shapes.RECTANGLE, { x: 0.5 + i * 1.1, y: 1.35, w: 0.95, h: 0.5, fill: { color: p.color }, shadow: mkShadow() });
  s9.addText(p.label, { x: 0.5 + i * 1.1, y: 1.88, w: 0.95, h: 0.25, fontSize: 8, fontFace: "Calibri", color: C.textMuted, align: "center", margin: 0 });
});

// Design features - 2 columns
const uxFeatures = [
  { title: "Glassmorphism Top Bar", desc: "Semi-transparent header with\nbackdrop-filter blur effect" },
  { title: "Gradient Sidebar", desc: "Dark emerald gradient with\nactive indicator animations" },
  { title: "Card Hover Effects", desc: "Lift animation (translateY)\nwith shadow expansion" },
  { title: "Modal Animations", desc: "Scale + fade entrance with\nblurred backdrop overlay" },
  { title: "Responsive Layout", desc: "Mobile-first with hamburger\nmenu and collapsible sidebar" },
  { title: "Toast Notifications", desc: "Gradient-colored slide-in\nnotifications with auto-dismiss" },
];

uxFeatures.forEach((uf, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const ux = 0.5 + col * 4.7;
  const uy = 2.4 + row * 1.0;
  s9.addShape(pres.shapes.RECTANGLE, { x: ux, y: uy, w: 0.06, h: 0.8, fill: { color: C.primary } });
  s9.addText(uf.title, { x: ux + 0.2, y: uy, w: 4.2, h: 0.3, fontSize: 12, fontFace: "Arial Black", color: C.text, margin: 0 });
  s9.addText(uf.desc, { x: ux + 0.2, y: uy + 0.32, w: 4.2, h: 0.45, fontSize: 10, fontFace: "Calibri", color: C.textMuted, margin: 0 });
});


// ============================================================
// SLIDE 10: SUMMARY & CLOSING
// ============================================================
let s10 = pres.addSlide();
s10.background = { color: C.dark };
s10.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.accent } });

s10.addText("SUMMARY", {
  x: 0.8, y: 0.4, w: 8.4, h: 0.6,
  fontSize: 32, fontFace: "Arial Black", color: C.white, margin: 0,
});

s10.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.1, w: 2, h: 0.04, fill: { color: C.accent } });

const summaryItems = [
  "Zero-dependency SPA built with pure HTML5, CSS3, and JavaScript",
  "15 fully functional modules covering end-to-end cattle management",
  "Anti-fraud cow verification system with multi-factor identification",
  "Cascading location hierarchy (Country to Panchayat level)",
  "7-category smart alerts dashboard for proactive management",
  "Milk production tracking with daily recording, lactation & sales",
  "Complete health ecosystem: vaccination, disease, deworming, vet visits",
  "Modern UI with glassmorphism, gradients, and responsive design",
  "Offline-capable with localStorage and JSON export/import",
];

s10.addText(summaryItems.map((item, i) => ({
  text: item,
  options: { bullet: true, breakLine: true, fontSize: 13, fontFace: "Calibri", color: "D1FAE5", paraSpaceAfter: 6 }
})), { x: 0.8, y: 1.4, w: 8.4, h: 3.5, margin: 0 });

// Footer
s10.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.8, w: 10, h: 0.825, fill: { color: "065F46" } });
s10.addText("Cow Management System  |  Architecture & Technology", {
  x: 0.8, y: 4.9, w: 6, h: 0.5, fontSize: 12, fontFace: "Calibri", color: "A7F3D0", margin: 0,
});
s10.addText("http://localhost:3000", {
  x: 7, y: 4.9, w: 2.5, h: 0.5, fontSize: 12, fontFace: "Calibri", color: C.accent, align: "right", bold: true, margin: 0,
});

// Write file
pres.writeFile({ fileName: "C:/CowManagement/CowManagement_Architecture.pptx" })
  .then(() => console.log("PPTX created successfully!"))
  .catch((err) => console.error("Error:", err));
