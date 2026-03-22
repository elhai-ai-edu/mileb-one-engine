/**
 * upload_lexicon.js — Push master_list.json to Firebase via /api/lexicon/bulk-import
 * MilEd.One v9.7.0
 *
 * USAGE:
 *   node scripts/upload_lexicon.js
 *   node scripts/upload_lexicon.js --overwrite   (replace duplicate words)
 *   node scripts/upload_lexicon.js --dry-run     (validate only, no write)
 *
 * REQUIRES:
 *   • processed_lexicon/master_list.json to exist (run extract_lexicon.js first)
 *   • SITE_URL and ADMIN credentials configured below
 */

import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── CONFIG ────────────────────────────────────────────────────────────────

const CONFIG = {
  MASTER_LIST:        path.join(__dirname, "..", "processed_lexicon", "master_list.json"),
  SITE_URL:           process.env.SITE_URL || "https://your-netlify-site.netlify.app",
  ADMIN_USERNAME:     process.env.ADMIN_USERNAME || "elhai",
  ADMIN_PASSWORD:     process.env.ADMIN_PASSWORD || "",     // set via env var
  BATCH_SIZE:         200,                                  // Firebase: max 500, keep lower for safety
  ON_CONFLICT:        process.argv.includes("--overwrite") ? "overwrite" : "skip",
  DRY_RUN:            process.argv.includes("--dry-run"),
};

// ── MAIN ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log(" MilEd.One Lexicon Uploader v9.7.0");
  console.log(`   Mode: ${CONFIG.DRY_RUN ? "DRY RUN" : "LIVE"} | Conflict: ${CONFIG.ON_CONFLICT}`);
  console.log("═══════════════════════════════════════════════════\n");

  if (!fs.existsSync(CONFIG.MASTER_LIST)) {
    console.error(`❌ master_list.json not found: ${CONFIG.MASTER_LIST}`);
    console.error("   Run extract_lexicon.js first.\n");
    process.exit(1);
  }

  const { words } = JSON.parse(fs.readFileSync(CONFIG.MASTER_LIST, "utf8"));
  console.log(`📦 Loaded ${words.length} words from master_list.json`);

  if (CONFIG.DRY_RUN) {
    console.log("\n🔍 DRY RUN — validation only:");
    const missing = words.filter(w => !w.word || !w.meaning);
    console.log(`   Valid: ${words.length - missing.length} | Missing word/meaning: ${missing.length}`);
    if (missing.length) {
      console.log("   First 5 invalid:");
      missing.slice(0,5).forEach((w,i) => console.log(`     ${i+1}. word="${w.word}" meaning="${w.meaning}"`));
    }
    process.exit(0);
  }

  if (!CONFIG.ADMIN_PASSWORD) {
    console.error("❌ ADMIN_PASSWORD is empty. Set it via environment variable:");
    console.error("   ADMIN_PASSWORD=yourpassword node scripts/upload_lexicon.js\n");
    process.exit(1);
  }

  // Upload in batches
  const endpoint = `${CONFIG.SITE_URL}/api/lexicon/bulk-import`;
  let totalAdded = 0, totalSkipped = 0, totalErrors = 0;

  for (let i = 0; i < words.length; i += CONFIG.BATCH_SIZE) {
    const batch = words.slice(i, i + CONFIG.BATCH_SIZE);
    const batchNum = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(words.length / CONFIG.BATCH_SIZE);
    process.stdout.write(`[Batch ${batchNum}/${totalBatches}] ${batch.length} words... `);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          words: batch,
          onConflict:        CONFIG.ON_CONFLICT,
          requesterUsername: CONFIG.ADMIN_USERNAME,
          requesterPassword: CONFIG.ADMIN_PASSWORD,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || `HTTP ${res.status}`);
      totalAdded   += data.added   || 0;
      totalSkipped += data.skipped || 0;
      if (data.errorRows?.length) {
        totalErrors += data.errorRows.length;
        console.log(`⚠️  added: ${data.added}, skipped: ${data.skipped}, errors: ${data.errorRows.length}`);
      } else {
        console.log(`✅  added: ${data.added}, skipped: ${data.skipped}`);
      }
    } catch (e) {
      console.log(`❌ FAILED — ${e.message}`);
      totalErrors += batch.length;
    }

    // Rate limit between batches
    if (i + CONFIG.BATCH_SIZE < words.length) await new Promise(r => setTimeout(r, 500));
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log(` ✅ Upload complete`);
  console.log(`    Added:   ${totalAdded}`);
  console.log(`    Skipped: ${totalSkipped} (already in Firebase)`);
  console.log(`    Errors:  ${totalErrors}`);
  console.log("═══════════════════════════════════════════════════\n");
}

main().catch(e => {
  console.error("\n💥 Fatal error:", e.message);
  process.exit(1);
});
