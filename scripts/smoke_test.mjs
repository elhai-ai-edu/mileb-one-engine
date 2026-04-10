/**
 * scripts/smoke_test.mjs — MilEd.One Smoke Test
 * ─────────────────────────────────────────────────────────────────────────────
 * Tests 3 assertions in one run:
 *   TEST A — Dual Routing: signal lands in BOTH course path AND global_map
 *   TEST B — mastery_pct = 0 after 3 consecutive failures
 *   TEST C — interventionFlag = true (classroom.js algorithm on live data)
 *
 * Prerequisites:
 *   1. Copy your Firebase service account JSON to scripts/service_account.json
 *      (it is already gitignored — safe to place here temporarily)
 *   OR set one of these env vars:
 *      $env:FIREBASE_SERVICE_ACCOUNT = (Get-Content scripts\service_account.json -Raw)
 *      $env:FIREBASE_SERVICE_ACCOUNT_FILE = "C:\path\to\service-account.json"
 *      $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\path\to\service-account.json"
 *      $env:FIREBASE_DB_URL = "https://miled-one-classroom-default-rtdb.europe-west1.firebasedatabase.app"
 *
 * Run:
 *   node scripts/smoke_test.mjs
 *
 * The script writes, reads, asserts, then cleans up — no permanent data left.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync, existsSync } from "fs";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase }                  from "firebase-admin/database";

// ── CONFIG ───────────────────────────────────────────────────────────────────
const STUDENT_ID  = "smoke_test_student_01";
const COURSE_ID   = "hebrew_advanced_b_2026";
const SKILL_KEY   = "s03_logical_structure";       // a known COURSE_SKILLS member
const SA_PATH     = new URL("./service_account.json", import.meta.url).pathname
                      .replace(/^\/([A-Z]:)/, "$1"); // fix Windows /C: → C:
const DEFAULT_DB_URL = "https://miled-one-classroom-default-rtdb.europe-west1.firebasedatabase.app";

function resolveDbUrl() {
  return process.env.FIREBASE_DB_URL || DEFAULT_DB_URL;
}

const DB_URL = resolveDbUrl();

// ── CREDENTIALS ──────────────────────────────────────────────────────────────
function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  const explicitPath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (explicitPath && existsSync(explicitPath)) {
    return JSON.parse(readFileSync(explicitPath, "utf8"));
  }

  if (existsSync(SA_PATH)) {
    return JSON.parse(readFileSync(SA_PATH, "utf8"));
  }

  console.error("❌  No credentials found.");
  console.error("    Provide one of these:");
  console.error("    1. $env:FIREBASE_SERVICE_ACCOUNT = (Get-Content scripts\\service_account.json -Raw)");
  console.error("    2. $env:FIREBASE_SERVICE_ACCOUNT_FILE = \"C:\\path\\to\\service-account.json\"");
  console.error("    3. $env:GOOGLE_APPLICATION_CREDENTIALS = \"C:\\path\\to\\service-account.json\"");
  console.error("    4. Place scripts/service_account.json in the scripts/ folder.");
  process.exit(1);
}

// ── HELPERS ──────────────────────────────────────────────────────────────────

/** Exact replica of the recalcAndUpdate() closure inside chat.js */
async function recalcAndUpdate(ref, payload, meta = {}) {
  await ref.child("signals").push(payload);
  const snap    = await ref.child("signals").get();
  const signals = snap.exists() ? Object.values(snap.val()) : [];
  const total   = signals.reduce((s, sig) => s + (sig.score || 0), 0);
  const max     = signals.length * 3;
  const masteryPct  = max > 0 ? Math.round((total / max) * 100) : 0;
  const status      = masteryPct >= 70 ? "proven" : masteryPct >= 30 ? "developing" : "none";
  const recentWeakPoints = signals
    .filter(sig => sig.score === 0 && sig.weak_point)
    .map(sig => sig.weak_point)
    .slice(-5);

  await ref.update({
    mastery_pct:         masteryPct,
    status,
    exposures:           signals.length,
    last_ts:             Date.now(),
    recent_weak_points:  recentWeakPoints,
    ...meta
  });
  return signals;
}

/** Exact replica of classroom.js streak-scan algorithm */
function computeInterventionFlag(skillNodeVal) {
  const signals = skillNodeVal?.signals ? Object.values(skillNodeVal.signals) : [];
  const ordered = signals
    .filter(sig => Number.isFinite(sig?.ts))
    .sort((a, b) => a.ts - b.ts);

  let streak = 0;
  let maxStreak = 0;
  for (const sig of ordered) {
    if (sig.score === 0) { streak++; }
    else                  { streak = 0; }
    if (streak > maxStreak) maxStreak = streak;
  }
  return { maxStreak, interventionFlag: maxStreak >= 3 };
}

function pass(msg) { console.log(`  ✅  PASS — ${msg}`); }
function fail(msg) { console.log(`  ❌  FAIL — ${msg}`); }

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function run() {
  const sa = loadServiceAccount();

  console.log("\n🔐  Firebase smoke preflight");
  console.log(`    databaseURL: ${DB_URL}`);
  console.log(`    projectId: ${sa.project_id || sa.projectId || "unknown"}`);

  if (!getApps().length) {
    initializeApp({ credential: cert(sa), databaseURL: DB_URL });
  }
  const db = getDatabase();

  const courseRef = db.ref(`skills_mastery/${STUDENT_ID}/${COURSE_ID}/${SKILL_KEY}`);
  const globalRef = db.ref(`skills_mastery/${STUDENT_ID}/global_map/${SKILL_KEY}`);

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 0 — Clean slate
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n🧹  Cleaning up any previous smoke-test data…");
  await Promise.all([ courseRef.remove(), globalRef.remove() ]);

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1 — Write 3 consecutive failure signals (score = 0)
  //          Simulates what chat.js does after receiving %%SESSION_UPDATE%%
  //          with skill_signal: { skill: "s03_logical_structure", score: 0 }
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n📡  Writing 3 consecutive score=0 signals for student:", STUDENT_ID);
  console.log(`    skill: ${SKILL_KEY}   course: ${COURSE_ID}\n`);

  const baseTs = Date.now();

  for (let i = 1; i <= 3; i++) {
    const payload = {
      rounds:        1,
      self:          "hard",
      score:         0,                           // ← ALL FAILURES
      weak_point:    `weak_point_trial_${i}`,
      feedback:      null,
      lesson:        i,
      ts:            baseTs + i * 100,            // monotonic timestamps
      signal_source: "course",
      bot_type:      "hebrew_b_companion"
    };

    // chat.js writes to refs[] (course) and globalRef in parallel
    await Promise.all([
      recalcAndUpdate(courseRef, payload, { signal_source: "course" }),
      recalcAndUpdate(globalRef, payload, { signal_source: "course", last_course: COURSE_ID })
    ]);
    console.log(`    Signal ${i}/3 written  (score=0, ts=${baseTs + i * 100})`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ASSERTIONS
  // ─────────────────────────────────────────────────────────────────────────
  const [courseSnap, globalSnap] = await Promise.all([
    courseRef.get(),
    globalRef.get()
  ]);
  const courseVal = courseSnap.exists() ? courseSnap.val() : null;
  const globalVal = globalSnap.exists() ? globalSnap.val() : null;

  let failures = 0;

  // ── TEST A — Dual Routing ────────────────────────────────────────────────
  console.log("\n── TEST A: Dual Routing ─────────────────────────────────────");

  if (courseVal?.exposures === 3) {
    pass(`Course path has 3 exposures  →  skills_mastery/${STUDENT_ID}/${COURSE_ID}/${SKILL_KEY}`);
  } else {
    fail(`Course path missing or wrong  →  exposures=${courseVal?.exposures}`); failures++;
  }

  if (globalVal?.exposures === 3) {
    pass(`Global path has 3 exposures  →  skills_mastery/${STUDENT_ID}/global_map/${SKILL_KEY}`);
  } else {
    fail(`Global path missing or wrong  →  exposures=${globalVal?.exposures}`); failures++;
  }

  if (globalVal?.last_course === COURSE_ID) {
    pass(`global_map carries last_course="${COURSE_ID}"`);
  } else {
    fail(`global_map.last_course missing or wrong  →  got="${globalVal?.last_course}"`); failures++;
  }

  // ── TEST B — Mastery Score ───────────────────────────────────────────────
  console.log("\n── TEST B: Mastery Score ────────────────────────────────────");

  if (courseVal?.mastery_pct === 0) {
    pass("mastery_pct = 0  (all failures, no partial credit)");
  } else {
    fail(`mastery_pct should be 0, got ${courseVal?.mastery_pct}`); failures++;
  }

  if (courseVal?.status === "none") {
    pass('status = "none"  (< 30 % threshold)');
  } else {
    fail(`status should be "none", got "${courseVal?.status}"`); failures++;
  }

  if (Array.isArray(courseVal?.recent_weak_points) && courseVal.recent_weak_points.length === 3) {
    pass(`recent_weak_points collected: ${JSON.stringify(courseVal.recent_weak_points)}`);
  } else {
    fail(`recent_weak_points unexpected: ${JSON.stringify(courseVal?.recent_weak_points)}`); failures++;
  }

  // ── TEST C — interventionFlag (classroom.js algorithm) ──────────────────
  console.log("\n── TEST C: interventionFlag (classroom.js algorithm) ────────");

  const { maxStreak, interventionFlag } = computeInterventionFlag(courseVal);

  if (maxStreak >= 3) {
    pass(`failureStreak = ${maxStreak}  (≥ 3 consecutive score=0)`);
  } else {
    fail(`failureStreak = ${maxStreak}  (expected ≥ 3)`); failures++;
  }

  if (interventionFlag) {
    pass("interventionFlag = true  →  classroom dashboard WILL show alert");
  } else {
    fail("interventionFlag = false  →  dashboard alert will NOT trigger"); failures++;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(60));
  if (failures === 0) {
    console.log("🟢  SMOKE TEST COMPLETE — ALL ASSERTIONS PASSED");
  } else {
    console.log(`🔴  SMOKE TEST COMPLETE — ${failures} ASSERTION(S) FAILED`);
  }
  console.log("─".repeat(60));

  // ─────────────────────────────────────────────────────────────────────────
  // BONUS: Raw Firebase snapshot for manual inspection
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n📋  Raw Firebase snapshot (course path):\n");
  const { signals: _s, ...courseValNoSignals } = courseVal || {};
  console.log(JSON.stringify(courseValNoSignals, null, 2));

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2 — Cleanup
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n🧹  Removing smoke-test data from Firebase…");
  await Promise.all([ courseRef.remove(), globalRef.remove() ]);
  console.log("    Done. No test artifacts left in the database.\n");

  process.exit(failures > 0 ? 1 : 0);
}

run().catch(e => {
  console.error("\n💥  FATAL ERROR:", e.message);
  process.exit(1);
});
