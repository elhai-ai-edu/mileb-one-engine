// functions/project_curator.js — MilEd.One AI Project Curator
// Netlify Scheduled Function — runs daily at 08:00 UTC.
// Scans team_projects for idle projects (no activity > IDLE_DAYS)
// and writes a curator nudge to team_projects/{id}/curatorNudge.

import { getDatabase } from "firebase-admin/database";
import { ensureFirebaseAdminApp } from "./firebase-admin.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL     = "https://openrouter.ai/api/v1/chat/completions";
const SITE_URL           = process.env.URL || "https://cozy-seahorse-7c5204.netlify.app";
const CURATOR_MODEL      = "google/gemini-2.0-flash-001";

const IDLE_DAYS   = 3;             // flag project if no block added in this many days
const IDLE_MS     = IDLE_DAYS * 24 * 60 * 60 * 1000;
const NUDGE_TTL   = 24 * 60 * 60 * 1000; // don't re-nudge within 24h

function getDB() {
  return getDatabase(ensureFirebaseAdminApp());
}

// ── Nudge generator ───────────────────────────────────────────────────────────
async function generateNudge(project, idleDays, blockCount) {
  if (!OPENROUTER_API_KEY) {
    return `הפרויקט לא עודכן כבר ${idleDays} ימים — הגיע הזמן להתקדם!`;
  }

  const memberList = (project.members || []).join(", ");
  const prompt = `אתה בוט "אוצר ידע" של מערכת למידה. פרויקט הצוות "${project.title || "פרויקט צוות"}" לא עודכן כבר ${idleDays} ימים. ${blockCount} בלוקים נכתבו עד כה. חברי הקבוצה: ${memberList || "לא ידוע"}.

כתוב הודעת עידוד קצרה (2 משפטים בעברית, טון חברי ולא מאיים) שתניע את הקבוצה להמשיך לעבוד. אל תאמר "שלום" ואל תזכיר את המערכת. התמקד בהתקדמות.`;

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type":  "application/json",
        "HTTP-Referer":  SITE_URL,
        "X-Title":       "MilEd.One"
      },
      body: JSON.stringify({
        model:       CURATOR_MODEL,
        messages:    [{ role: "user", content: prompt }],
        temperature: 0.6,
        max_tokens:  120
      })
    });
    if (!res.ok) throw new Error(`LLM ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim()
      || `הפרויקט לא עודכן כבר ${idleDays} ימים — הגיע הזמן להתקדם!`;
  } catch(e) {
    console.warn("[Curator] LLM failed:", e.message);
    return `הפרויקט לא עודכן כבר ${idleDays} ימים — הגיע הזמן להתקדם!`;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function handler(event) {
  const db  = getDB();
  const now = Date.now();

  console.log("[Curator] Starting scan at", new Date(now).toISOString());

  let scanned = 0, nudged = 0, skipped = 0;

  try {
    const snap     = await db.ref("team_projects").once("value");
    const projects = snap.val() || {};

    for (const [projectId, project] of Object.entries(projects)) {
      scanned++;

      // Skip already-submitted projects
      if (project.status === "submitted") { skipped++; continue; }

      // Find last document activity
      const blocks       = Object.values(project.document?.blocks || {}).filter(b => !b.deleted);
      const lastBlockAt  = blocks.reduce((max, b) => Math.max(max, b.addedAt || 0), 0);
      const lastActivity = Math.max(lastBlockAt, project.lastActivity || 0);
      const idleMs       = now - lastActivity;

      if (idleMs < IDLE_MS) { skipped++; continue; }

      // Don't re-nudge within TTL
      const existingNudge = project.curatorNudge;
      if (existingNudge?.createdAt && (now - existingNudge.createdAt) < NUDGE_TTL) {
        skipped++;
        continue;
      }

      const idleDays = Math.floor(idleMs / (24 * 60 * 60 * 1000));
      const nudge    = await generateNudge(project, idleDays, blocks.length);

      await db.ref(`team_projects/${projectId}/curatorNudge`).set({
        message:   nudge,
        createdAt: now,
        idleDays,
        seenBy:    {}  // {studentId: timestamp} — populated client-side on dismiss
      });

      nudged++;
      console.log(`[Curator] Nudged project ${projectId} (idle ${idleDays}d)`);
    }
  } catch(e) {
    console.error("[Curator] Scan failed:", e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }

  console.log(`[Curator] Done — scanned ${scanned}, nudged ${nudged}, skipped ${skipped}`);
  return { statusCode: 200, body: JSON.stringify({ ok: true, scanned, nudged, skipped }) };
}
