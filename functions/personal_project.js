// functions/personal_project.js — MilEd.One Personal Project API

import { getDatabase } from "firebase-admin/database";
import { ensureFirebaseAdminApp } from "./firebase-admin.js";

function getDB() {
  return getDatabase(ensureFirebaseAdminApp());
}

const headers = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

function ok(body) { return { statusCode: 200, headers, body: JSON.stringify(body) }; }
function err(msg) { return { statusCode: 400, headers, body: JSON.stringify({ error: msg }) }; }

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };
  if (event.httpMethod !== "POST")    return err("POST required");

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return err("invalid JSON"); }

  const db          = getDB();
  const action      = String(body.action      || "").trim();
  const courseId    = String(body.courseId    || "").trim();
  const studentId   = String(body.studentId   || "").trim();
  const studentName = String(body.studentName || studentId).slice(0, 80);

  if (!courseId)  return err("courseId required");
  if (!studentId) return err("studentId required");

  const projRef    = db.ref(`personal_projects/${courseId}`);
  const studentRef = projRef.child(`students/${studentId}`);

  // ── entry ─────────────────────────────────────────────────────────────────
  // Called when a student opens the personal project page.
  // Loads progress, announcements, and Q&A. Auto-initialises if first visit.
  if (action === "entry") {
    const [studentSnap, announcementsSnap, qaSnap] = await Promise.all([
      studentRef.once("value"),
      projRef.child("announcements").orderByChild("postedAt").limitToLast(20).once("value"),
      projRef.child(`teacherQA/${studentId}`).orderByChild("postedAt").limitToLast(50).once("value")
    ]);

    const now         = Date.now();
    const studentData = studentSnap.val() || { currentStage: 0 };

    await studentRef.update({ lastSeen: now });

    return ok({
      ok:            true,
      student:       studentData,
      announcements: announcementsSnap.val() || {},
      teacherQA:     qaSnap.val()            || {}
    });
  }

  // ── save_draft ────────────────────────────────────────────────────────────
  // Autosaves the current textarea content without advancing the stage.
  if (action === "save_draft") {
    const text = String(body.text || "");
    await studentRef.update({ draft: text, draftSavedAt: Date.now() });
    return ok({ ok: true });
  }

  // ── submit_stage ──────────────────────────────────────────────────────────
  // Saves the student's answer for a stage and advances to the next stage.
  if (action === "submit_stage") {
    const text       = String(body.text || "").trim();
    const stageIndex = Number(body.stageIndex);

    if (!text) return err("text required");
    if (isNaN(stageIndex) || stageIndex < 0 || stageIndex > 6)
      return err("invalid stageIndex (must be 0–6)");

    const now = Date.now();

    await studentRef.child(`stages/${stageIndex}`).set({
      text,
      submittedAt: now
    });

    const studentSnap  = await studentRef.once("value");
    const studentData  = studentSnap.val() || {};
    const currentStage = Number(studentData.currentStage ?? 0);

    const updates = { draft: "", draftSavedAt: now };
    // Advance to next stage only when submitting the currently active stage
    if (stageIndex === currentStage && stageIndex < 6) {
      updates.currentStage = stageIndex + 1;
    }
    await studentRef.update(updates);

    return ok({ ok: true, nextStage: updates.currentStage ?? currentStage });
  }

  // ── ask_teacher ───────────────────────────────────────────────────────────
  // Posts a Q&A message from the student to the teacher feed.
  if (action === "ask_teacher") {
    const text = String(body.text || "").trim();
    if (!text) return err("text required");

    const key = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
    await projRef.child(`teacherQA/${studentId}/${key}`).set({
      text,
      from:        "student",
      postedAt:    Date.now(),
      studentName: studentName.slice(0, 60)
    });

    return ok({ ok: true });
  }

  return err(`unknown action: ${action}`);
}
