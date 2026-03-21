// functions/insights.js — MilEd.One v1.0
// Aggregates skills_sessions data for the Teacher Insights panel.
// Reads multi-wave records and returns per-skill confidence/engagement metrics.
// No admin credentials required — returns class-level aggregate data only.

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const headers = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Content-Type": "application/json"
};

function getDB() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(serviceAccount), databaseURL: process.env.FIREBASE_DB_URL });
  }
  return getDatabase();
}

// Confidence band: messages sent in that wave session
function confidenceBand(avgMsg) {
  if (avgMsg >= 6) return "high";
  if (avgMsg >= 3) return "medium";
  return "low";
}

// Human-readable label for a wave ID
const WAVE_LABELS = {
  wave_1_baseline: "Wave 1 — Baseline",
  wave_2_midterm:  "Wave 2 — Midterm",
  wave_3_final:    "Wave 3 — Final"
};

export async function handler(event) {
  if (event.httpMethod === "OPTIONS")
    return { statusCode: 200, headers, body: "" };

  if (event.httpMethod === "GET")
    return { statusCode: 200, headers, body: JSON.stringify({ status: "insights engine running" }) };

  try {
    const snap = await getDB().ref("skills_sessions").get();

    if (!snap.exists()) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, insights: [], totalStudents: 0, waveLabels: WAVE_LABELS })
      };
    }

    const data           = snap.val();
    const totalStudents  = Object.keys(data).length;
    const skillStats     = {}; // botType → aggregated metrics

    for (const studentId in data) {
      for (const botType in data[studentId]) {
        const botRecord = data[studentId][botType];

        // Skip the nested "waves" key if it appears at the botType level
        if (typeof botRecord !== "object" || !botRecord.botType) continue;

        if (!skillStats[botType]) {
          skillStats[botType] = {
            botType,
            botName:      botRecord.botName || botType,
            layer:        botRecord.layer   || "skills_process",
            totalStudents: 0,
            wave1Count:   0,
            wave2Count:   0,
            w1MsgCounts:  [],
            w2MsgCounts:  []
          };
        }

        const s     = skillStats[botType];
        const waves = botRecord.waves || {};
        s.totalStudents++;

        if (waves.wave_1_baseline) {
          s.wave1Count++;
          s.w1MsgCounts.push(waves.wave_1_baseline.messageCount || 0);
        }
        if (waves.wave_2_midterm) {
          s.wave2Count++;
          s.w2MsgCounts.push(waves.wave_2_midterm.messageCount || 0);
        }
      }
    }

    const avg = arr => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const insights = Object.values(skillStats)
      .map(s => {
        const avgW1 = avg(s.w1MsgCounts);
        const avgW2 = avg(s.w2MsgCounts);
        const w1Confidence  = confidenceBand(avgW1);
        const w2Confidence  = confidenceBand(avgW2);
        const pctParticipated = totalStudents > 0
          ? Math.round((s.wave1Count / totalStudents) * 100) : 0;
        const pctNeedsHelp = Math.max(0, 100 - pctParticipated);
        const improved = s.wave2Count > 0 && avgW2 > avgW1;
        const improvementPct = improved && avgW1 > 0
          ? Math.round(((avgW2 - avgW1) / avgW1) * 100) : 0;

        return {
          botType, botName: s.botName, layer: s.layer,
          totalStudents:   s.totalStudents,
          wave1Count:      s.wave1Count,
          wave2Count:      s.wave2Count,
          avgW1:           Math.round(avgW1 * 10) / 10,
          avgW2:           Math.round(avgW2 * 10) / 10,
          w1Confidence, w2Confidence,
          pctParticipated, pctNeedsHelp,
          needsHelp:      w1Confidence === "low" || pctParticipated < 50,
          improved,       improvementPct
        };
      })
      .filter(i => i.totalStudents > 0)
      .sort((a, b) => a.avgW1 - b.avgW1); // worst-performing skills first

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, insights, totalStudents, waveLabels: WAVE_LABELS })
    };

  } catch (e) {
    console.error("INSIGHTS ERROR:", e.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: "Insights unavailable" })
    };
  }
}
