/**
 * extract_lexicon.js — Google Docs → Markdown + master_list.json
 * MilEd.One v9.7.0
 *
 * WHAT IT DOES:
 *   1. Reads a list of Google Docs URLs from a CSV file OR a Google Sheet
 *   2. Fetches each Doc via the Google Docs API
 *   3. Converts the Doc content (including tables) to clean Markdown
 *   4. Saves each Doc as a .md file in /processed_lexicon
 *   5. Extracts vocabulary words from tables and writes master_list.json
 *      in the MilEd.One 10-field schema (ready for Firebase /lexicon)
 *
 * ─── SETUP (one-time) ───────────────────────────────────────────────────────
 *
 *  1. Install dependencies:
 *       npm install googleapis
 *       (already in package.json after this script adds it)
 *
 *  2. Create a Google Cloud Service Account:
 *       • Go to console.cloud.google.com → IAM & Admin → Service Accounts
 *       • Create a new service account, generate a JSON key
 *       • Save it as:  scripts/service_account.json
 *       • Enable these APIs in your project:
 *           - Google Docs API
 *           - Google Drive API
 *           - Google Sheets API (if SPREADSHEET_SOURCE = "sheets")
 *
 *  3. Share your Google Docs with the service account email
 *       (it looks like: name@project.iam.gserviceaccount.com)
 *       Or make the Docs publicly readable (View access for anyone with link)
 *
 *  4. Configure the settings below.
 *
 * ─── USAGE ──────────────────────────────────────────────────────────────────
 *
 *   node scripts/extract_lexicon.js
 *
 *   Optional flags:
 *     --dry-run      Print what would be extracted without writing files
 *     --skip-md      Only generate master_list.json, skip .md files
 *     --field=management  Filter: only include words from this field
 *
 * ────────────────────────────────────────────────────────────────────────────
 */

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ═══════════════════════════════════════════════════════════════════════════
//  CONFIGURATION — edit these before running
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // ── Input source ──────────────────────────────────────────────────────────
  // "csv"    → read from a local CSV file (set CSV_FILE below)
  // "sheets" → read from a Google Sheet   (set SHEETS_ID + SHEETS_RANGE below)
  SPREADSHEET_SOURCE: "csv",

  // CSV: path to a CSV file where one column contains Google Docs URLs.
  // The script auto-detects which column has "docs.google.com" links.
  // Example CSV row:  "מבוא לניהול","https://docs.google.com/document/d/..."
  CSV_FILE: path.join(__dirname, "docs_links.csv"),

  // Google Sheets alternative (set SPREADSHEET_SOURCE: "sheets")
  SHEETS_ID:    "YOUR_GOOGLE_SHEETS_ID_HERE",   // the ID from the sheet URL
  SHEETS_RANGE: "Sheet1!A:B",                   // range containing doc links

  // ── Authentication ────────────────────────────────────────────────────────
  // Path to your Google Cloud service account JSON key file
  SERVICE_ACCOUNT_FILE: path.join(__dirname, "service_account.json"),

  // ── Output ───────────────────────────────────────────────────────────────
  OUTPUT_DIR: path.join(__dirname, "..", "processed_lexicon"),
  MASTER_LIST: path.join(__dirname, "..", "processed_lexicon", "master_list.json"),

  // ── Lexicon schema defaults ───────────────────────────────────────────────
  // Default field for words if not auto-detected from the doc title
  DEFAULT_FIELD: "management",       // "management" | "optics" | "social"
  DEFAULT_DIFFICULTY: 1,             // 1=basic | 2=intermediate | 3=advanced

  // Column header names to look for inside tables (case-insensitive, partial match)
  // Maps the doc's column header → our schema field name
  COLUMN_MAP: {
    "מילה":          "word",
    "word":          "word",
    "מונח":          "word",
    "term":          "word",
    "הגדרה":         "meaning",
    "משמעות":        "meaning",
    "meaning":       "meaning",
    "definition":    "meaning",
    "דוגמה":         "example",
    "example":       "example",
    "תחום":          "field",
    "field":         "field",
    "רמה":           "difficulty_level",
    "difficulty":    "difficulty_level",
    "מילית יחס":     "preposition",
    "preposition":   "preposition",
    "שורש":          "root",
    "root":          "root",
    "ערבית":         "arabic_word",
    "arabic":        "arabic_word",
    "arabic word":   "arabic_word",
    "ערבית הסבר":    "arabic_meaning",
    "arabic meaning":"arabic_meaning",
    "english":       "english_word",
    "אנגלית":        "english_word",
    "english word":  "english_word",
    "english meaning":"english_meaning",
    "משימת כתיבה":   "handwriting_task",
    "handwriting":   "handwriting_task",
  },

  // ── Field auto-detection from doc title ──────────────────────────────────
  FIELD_KEYWORDS: {
    management: ["ניהול", "management", "ארגון", "משאבי אנוש"],
    optics:     ["אופטיקה", "optics", "עדשה", "ראייה"],
    social:     ["רווחה", "social", "חברה", "קהילה"],
  },

  // ── Runtime flags ─────────────────────────────────────────────────────────
  DRY_RUN:   process.argv.includes("--dry-run"),
  SKIP_MD:   process.argv.includes("--skip-md"),
  FIELD_FILTER: (process.argv.find(a => a.startsWith("--field=")) || "").replace("--field=","") || null,
};

// ═══════════════════════════════════════════════════════════════════════════
//  GOOGLE API AUTH
// ═══════════════════════════════════════════════════════════════════════════

function getAuth() {
  if (!fs.existsSync(CONFIG.SERVICE_ACCOUNT_FILE)) {
    console.error(`\n❌ Service account file not found: ${CONFIG.SERVICE_ACCOUNT_FILE}`);
    console.error("   See setup instructions at the top of this script.\n");
    process.exit(1);
  }
  const key = JSON.parse(fs.readFileSync(CONFIG.SERVICE_ACCOUNT_FILE, "utf8"));
  return new google.auth.GoogleAuth({
    credentials: key,
    scopes: [
      "https://www.googleapis.com/auth/documents.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/spreadsheets.readonly",
    ],
  });
}

// ═══════════════════════════════════════════════════════════════════════════
//  INPUT: LOAD DOC LINKS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse a CSV string into an array of rows (each row = array of strings).
 * Handles quoted fields, commas within quotes, Hebrew text.
 */
function parseCSV(text) {
  const rows = [];
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    const row = [];
    let inQuote = false, field = "";
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i+1] === '"') { field += '"'; i++; }
        else inQuote = !inQuote;
      } else if (ch === "," && !inQuote) {
        row.push(field.trim()); field = "";
      } else {
        field += ch;
      }
    }
    row.push(field.trim());
    rows.push(row);
  }
  return rows;
}

/** Extract Google Doc ID from a full URL */
function extractDocId(url) {
  const m = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  return m ? m[1] : null;
}

async function loadDocLinks() {
  if (CONFIG.SPREADSHEET_SOURCE === "csv") {
    if (!fs.existsSync(CONFIG.CSV_FILE)) {
      console.error(`\n❌ CSV file not found: ${CONFIG.CSV_FILE}`);
      console.error("   Create a CSV file with Google Docs links (one per row).\n");
      process.exit(1);
    }
    const text = fs.readFileSync(CONFIG.CSV_FILE, "utf8");
    const rows = parseCSV(text);
    const links = [];
    for (const row of rows) {
      for (const cell of row) {
        if (cell.includes("docs.google.com/document")) {
          const docId = extractDocId(cell);
          if (docId) links.push({ docId, label: row[0] || docId, rawUrl: cell });
        }
      }
    }
    return links;
  }

  if (CONFIG.SPREADSHEET_SOURCE === "sheets") {
    const auth   = getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const res    = await sheets.spreadsheets.values.get({
      spreadsheetId: CONFIG.SHEETS_ID,
      range:         CONFIG.SHEETS_RANGE,
    });
    const links = [];
    for (const row of (res.data.values || [])) {
      for (const cell of row) {
        if (cell && cell.includes("docs.google.com/document")) {
          const docId = extractDocId(cell);
          if (docId) links.push({ docId, label: row[0] || docId, rawUrl: cell });
        }
      }
    }
    return links;
  }

  throw new Error(`Unknown SPREADSHEET_SOURCE: ${CONFIG.SPREADSHEET_SOURCE}`);
}

// ═══════════════════════════════════════════════════════════════════════════
//  GOOGLE DOCS → MARKDOWN CONVERTER
// ═══════════════════════════════════════════════════════════════════════════

/** Extract all text from a Google Docs structural element (paragraph or table cell) */
function elementToText(el) {
  if (!el) return "";
  if (el.paragraph) {
    return (el.paragraph.elements || []).map(e => e.textRun?.content || "").join("").replace(/\n$/, "");
  }
  return "";
}

/** Convert a Google Docs table to a Markdown table string */
function tableToMarkdown(table) {
  const rows = table.tableRows || [];
  if (!rows.length) return "";

  const mdRows = rows.map(row =>
    "| " + (row.tableCells || []).map(cell =>
      (cell.content || []).map(el => elementToText(el)).join(" ").trim().replace(/\|/g, "\\|")
    ).join(" | ") + " |"
  );

  if (mdRows.length < 2) return mdRows.join("\n");

  // Insert separator after header row
  const colCount = (rows[0].tableCells || []).length;
  const separator = "| " + Array(colCount).fill("---").join(" | ") + " |";
  return [mdRows[0], separator, ...mdRows.slice(1)].join("\n");
}

/** Convert a Google Docs paragraph's heading style to Markdown prefix */
function headingPrefix(style) {
  const map = {
    HEADING_1: "# ", HEADING_2: "## ", HEADING_3: "### ",
    HEADING_4: "#### ", HEADING_5: "##### ", HEADING_6: "###### ",
  };
  return map[style] || "";
}

/** Convert bold/italic runs to Markdown inline markup */
function formatRun(run) {
  let text = run.content || "";
  if (!text.trim()) return text; // preserve whitespace-only runs as-is
  text = text.replace(/\n$/, ""); // trailing newline handled at paragraph level
  const ts = run.textStyle || {};
  if (ts.bold && ts.italic) text = `***${text}***`;
  else if (ts.bold)         text = `**${text}**`;
  else if (ts.italic)       text = `*${text}*`;
  if (ts.underline && !ts.link) text = `<u>${text}</u>`;
  if (ts.link?.url)          text = `[${text}](${ts.link.url})`;
  return text;
}

/** Convert a single Google Docs content element to a Markdown string */
function contentElementToMd(el) {
  if (el.table)     return tableToMarkdown(el.table);
  if (el.paragraph) {
    const style  = el.paragraph.paragraphStyle?.namedStyleType || "NORMAL_TEXT";
    const prefix = headingPrefix(style);
    const runs   = (el.paragraph.elements || []).map(e => formatRun(e.textRun || {})).join("");
    const isList = el.paragraph.bullet;
    if (isList) return `- ${runs.trim()}`;
    return prefix + runs;
  }
  return "";
}

/** Convert a full Google Docs API response object to a Markdown string */
function docToMarkdown(doc) {
  const title = doc.title || "Untitled";
  const content = doc.body?.content || [];
  const lines = [`# ${title}`, ""];

  let prevWasTable = false;
  for (const el of content) {
    const md = contentElementToMd(el);
    if (!md && !prevWasTable) continue; // skip empty lines at start
    if (el.table) {
      if (lines[lines.length - 1] !== "") lines.push("");
      lines.push(md);
      lines.push("");
      prevWasTable = true;
    } else {
      lines.push(md);
      prevWasTable = false;
    }
  }

  // Collapse runs of 3+ blank lines into 2
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

// ═══════════════════════════════════════════════════════════════════════════
//  TABLE → VOCABULARY EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════

/** Normalize a header cell string to lower-case, trimmed */
function normalizeHeader(h) { return (h || "").toLowerCase().trim(); }

/** Map a normalized header string to our schema field name (or null) */
function mapHeader(header) {
  const h = normalizeHeader(header);
  for (const [key, field] of Object.entries(CONFIG.COLUMN_MAP)) {
    if (h.includes(key.toLowerCase())) return field;
  }
  return null;
}

/** Auto-detect the field (management/optics/social) from the doc title */
function detectField(title) {
  const t = (title || "").toLowerCase();
  for (const [field, keywords] of Object.entries(CONFIG.FIELD_KEYWORDS)) {
    if (keywords.some(kw => t.includes(kw.toLowerCase()))) return field;
  }
  return CONFIG.DEFAULT_FIELD;
}

/** Extract vocabulary rows from all tables in a Google Doc */
function extractVocabFromDoc(doc, defaultField) {
  const words = [];
  const content = doc.body?.content || [];

  for (const el of content) {
    if (!el.table) continue;
    const rows = el.table.tableRows || [];
    if (rows.length < 2) continue;

    // First row = headers
    const headerCells = (rows[0].tableCells || []).map(cell =>
      (cell.content || []).map(el => elementToText(el)).join(" ").trim()
    );
    const headerMap = headerCells.map(h => mapHeader(h)); // schema field name | null

    // Check if this looks like a vocabulary table (has "word" or "מילה" column)
    if (!headerMap.includes("word")) continue;

    // Data rows
    for (let r = 1; r < rows.length; r++) {
      const cells = (rows[r].tableCells || []).map(cell =>
        (cell.content || []).map(el => elementToText(el)).join(" ").trim()
      );
      if (cells.every(c => !c)) continue; // completely empty row

      const entry = {
        word:            null,
        preposition:     null,
        root:            null,
        meaning:         null,
        example:         null,
        field:           defaultField,
        difficulty_level: CONFIG.DEFAULT_DIFFICULTY,
        arabic_word:     null,
        arabic_meaning:  null,
        english_word:    null,
        english_meaning: null,
        handwriting_task: null,
      };

      for (let c = 0; c < headerMap.length && c < cells.length; c++) {
        const field = headerMap[c];
        if (!field) continue;
        const val = cells[c] || null;
        if (val === null || val === "") continue;

        if (field === "difficulty_level") {
          entry.difficulty_level = Math.max(1, Math.min(3, parseInt(val) || CONFIG.DEFAULT_DIFFICULTY));
        } else if (field === "field") {
          const f = val.toLowerCase();
          if (["management","optics","social"].includes(f)) entry.field = f;
          else if (f.includes("ניהול"))  entry.field = "management";
          else if (f.includes("אופטיקה")) entry.field = "optics";
          else if (f.includes("רווחה"))  entry.field = "social";
        } else {
          entry[field] = val;
        }
      }

      // Only include rows that have at least a word
      if (!entry.word) continue;

      // Auto-generate handwriting_task fallback if not in table
      if (!entry.handwriting_task) {
        entry.handwriting_task = entry.preposition
          ? `כתבי משפט בו תשתמשי ב"${entry.word} ${entry.preposition}"`
          : `כתבי משפט בו תשתמשי ב"${entry.word}"`;
      }

      words.push(entry);
    }
  }
  return words;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log(" MilEd.One Lexicon Extractor v9.7.0");
  console.log("═══════════════════════════════════════════════════");
  if (CONFIG.DRY_RUN) console.log(" 🔍 DRY RUN — no files will be written\n");

  // ── 1. Load doc links ────────────────────────────────────────────────────
  console.log("📋 Loading doc links...");
  const links = await loadDocLinks();
  console.log(`   Found ${links.length} Google Docs links.\n`);
  if (!links.length) {
    console.error("❌ No links found. Check your CSV file or Sheets config.");
    process.exit(1);
  }

  // ── 2. Authenticate ──────────────────────────────────────────────────────
  const auth = getAuth();
  const docsClient = google.docs({ version: "v1", auth });

  // ── 3. Create output dir ─────────────────────────────────────────────────
  if (!CONFIG.DRY_RUN) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }

  // ── 4. Process each doc ──────────────────────────────────────────────────
  const allWords = [];
  const results  = { ok: [], failed: [] };

  for (let i = 0; i < links.length; i++) {
    const { docId, label } = links[i];
    const prefix = `[${i+1}/${links.length}]`;
    process.stdout.write(`${prefix} "${label}" (${docId})... `);

    let doc;
    try {
      const res = await docsClient.documents.get({ documentId: docId });
      doc = res.data;
    } catch (e) {
      const msg = e.message || String(e);
      console.log(`❌ FAILED — ${msg}`);
      results.failed.push({ docId, label, error: msg });
      continue;
    }

    // Convert to Markdown
    const md = docToMarkdown(doc);

    // Save .md file
    const safeTitle = (doc.title || docId).replace(/[^א-תa-zA-Z0-9_\- ]/g, "").trim().replace(/\s+/g, "_");
    const mdPath = path.join(CONFIG.OUTPUT_DIR, `${safeTitle}.md`);
    if (!CONFIG.DRY_RUN && !CONFIG.SKIP_MD) {
      fs.writeFileSync(mdPath, md, "utf8");
    }

    // Extract vocabulary
    const defaultField = detectField(doc.title);
    const words = extractVocabFromDoc(doc, defaultField);

    // Apply field filter if set
    const filtered = CONFIG.FIELD_FILTER
      ? words.filter(w => w.field === CONFIG.FIELD_FILTER)
      : words;

    allWords.push(...filtered);

    console.log(`✅  ${words.length} words, field: ${defaultField}${CONFIG.SKIP_MD ? "" : ` → ${path.basename(mdPath)}`}`);
    results.ok.push({ docId, label, words: words.length, field: defaultField });

    // Polite rate limit (Google Docs API quota: ~60 reads/min)
    if (i < links.length - 1) await new Promise(r => setTimeout(r, 1100));
  }

  // ── 5. Deduplicate words ─────────────────────────────────────────────────
  console.log(`\n📊 Total words extracted (before dedup): ${allWords.length}`);
  const seen = new Set();
  const deduped = allWords.filter(w => {
    const key = (w.word || "").trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(`   After dedup: ${deduped.length} unique words`);

  // ── 6. Write master_list.json ────────────────────────────────────────────
  const masterList = {
    _meta: {
      generatedAt: new Date().toISOString(),
      totalWords:  deduped.length,
      sources:     results.ok.length,
      schema:      "MilEd.One v9.6.9 — 10-field trilingual",
    },
    words: deduped,
  };

  if (!CONFIG.DRY_RUN) {
    fs.writeFileSync(CONFIG.MASTER_LIST, JSON.stringify(masterList, null, 2), "utf8");
    console.log(`\n✅ master_list.json written → ${CONFIG.MASTER_LIST}`);
  } else {
    console.log("\n🔍 DRY RUN — master_list.json not written.");
    console.log("   Sample (first 3 words):");
    console.log(JSON.stringify(deduped.slice(0, 3), null, 2));
  }

  // ── 7. Summary ───────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════");
  console.log(` ✅ Done: ${results.ok.length} docs processed, ${results.failed.length} failed`);
  if (results.failed.length) {
    console.log("\n Failed docs:");
    results.failed.forEach(f => console.log(`   • ${f.label}: ${f.error}`));
  }
  const fieldCounts = {};
  deduped.forEach(w => { fieldCounts[w.field] = (fieldCounts[w.field] || 0) + 1; });
  console.log("\n Words by field:");
  Object.entries(fieldCounts).forEach(([f, n]) => console.log(`   • ${f}: ${n}`));
  console.log("\n Output directory:", CONFIG.OUTPUT_DIR);
  console.log("═══════════════════════════════════════════════════\n");

  // ── 8. Hint: upload to Firebase ──────────────────────────────────────────
  if (!CONFIG.DRY_RUN && deduped.length > 0) {
    console.log("📤 Next step — upload to Firebase:");
    console.log("   node scripts/upload_lexicon.js\n");
  }
}

main().catch(e => {
  console.error("\n💥 Fatal error:", e.message);
  process.exit(1);
});
