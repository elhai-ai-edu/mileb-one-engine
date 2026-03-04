// netlify/functions/classroom.js — MilEd.One
// Classroom sync layer: teacher broadcast + student polling + answer collection
// Uses Firebase Realtime DB. Fits existing chat.js architecture exactly.
//
// ENV VARS needed in Netlify:
//   FIREBASE_DB_URL           = https://your-project-default-rtdb.firebaseio.com
//   FIREBASE_SERVICE_ACCOUNT  = (JSON string of your Firebase service account key)

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase }                   from "firebase-admin/database";

// ─────────────────────────────────────────
// FIREBASE INIT (singleton)
// ─────────────────────────────────────────

function getDB() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DB_URL,
    });
  }
  return getDatabase();
}

// ─────────────────────────────────────────
// CORS HEADERS (same as chat.js)
// ─────────────────────────────────────────

const headers = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Content-Type": "application/json",
};

function ok(body)  { return { statusCode: 200, headers, body: JSON.stringify(body) }; }
function err(msg)  { return { statusCode: 400, headers, body: JSON.stringify({ error: msg }) }; }

// ─────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────

export async function handler(event) {

  if (event.httpMethod === "OPTIONS")
    return { statusCode: 200, headers, body: "" };

  const db = getDB();

  // ── GET: student polls for teacher broadcast ──────────────────────────────
  // GET /classroom?action=poll&sessionId=abc123&studentId=s_xyz
  if (event.httpMethod === "GET") {
    const { action, sessionId, studentId, facultyId } = event.queryStringParameters || {};

    if (!sessionId) return err("sessionId required");

    const sessionRef = db.ref(`sessions/${sessionId}`);
    const snap = await sessionRef.once("value");
    const session = snap.val();

    if (!session) return ok({ broadcast: null, steps: [], sessionActive: false });

    // Teacher dashboard: get all student answers
    if (action === "dashboard" && facultyId) {
      const answers = session.answers || {};
      const students = Object.entries(answers).map(([sid, data]) => ({
        studentId: sid,
        steps: data.steps || [],
        lastUpdated: data.lastUpdated || null,
      }));
      return ok({
        sessionId,
        broadcast: session.broadcast || null,
        currentStep: session.currentStep || 1,
        lockedSteps: session.lockedSteps || [],
        students,
      });
    }

    // Student poll: get broadcast + step status
    const studentLocked = (session.lockedSteps || []).includes(studentId);
    const currentStep = session.currentStep || 1;

    return ok({
      broadcast:     session.broadcast || null,
      broadcastedAt: session.broadcastedAt || null,
      currentStep,
      stepLocked:    studentLocked,
      sessionActive: session.active !== false,
    });
  }

  // ── POST ─────────────────────────────────────────────────────────────────
  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  const body = JSON.parse(event.body || "{}");
  const { action, sessionId } = body;

  if (!sessionId) return err("sessionId required");

  const sessionRef = db.ref(`sessions/${sessionId}`);

  // ── action: open — teacher opens a classroom session ─────────────────────
  // { action: "open", sessionId, facultyId, botType, classId, broadcast? }
  if (action === "open") {
    const { facultyId, botType, classId, broadcast } = body;
    if (!facultyId) return err("facultyId required to open session");

    await sessionRef.set({
      facultyId,
      botType:       botType   || null,
      classId:       classId   || null,
      broadcast:     broadcast || null,
      broadcastedAt: broadcast ? Date.now() : null,
      currentStep:   1,
      lockedSteps:   [],
      active:        true,
      openedAt:      Date.now(),
      answers:       {},
    });

    return ok({ ok: true, action: "open", sessionId });
  }

  // ── action: broadcast — teacher sends text to all students ───────────────
  // { action: "broadcast", sessionId, facultyId, text, step? }
  if (action === "broadcast") {
    const { facultyId, text, step } = body;
    if (!facultyId) return err("facultyId required");
    if (!text)      return err("text required");

    await sessionRef.update({
      broadcast:     text,
      broadcastedAt: Date.now(),
      currentStep:   step || 1,
    });

    return ok({ ok: true, action: "broadcast", sessionId });
  }

  // ── action: unlock — teacher unlocks next step for a student ─────────────
  // { action: "unlock", sessionId, facultyId, studentId }
  if (action === "unlock") {
    const { facultyId, studentId } = body;
    if (!facultyId)  return err("facultyId required");
    if (!studentId)  return err("studentId required");

    const snap = await sessionRef.once("value");
    const session = snap.val() || {};
    const locked = (session.lockedSteps || []).filter(id => id !== studentId);

    await sessionRef.update({ lockedSteps: locked });

    return ok({ ok: true, action: "unlock", studentId });
  }

  // ── action: lock — teacher locks a student ───────────────────────────────
  if (action === "lock") {
    const { facultyId, studentId } = body;
    if (!facultyId)  return err("facultyId required");
    if (!studentId)  return err("studentId required");

    const snap = await sessionRef.once("value");
    const session = snap.val() || {};
    const locked = [...new Set([...(session.lockedSteps || []), studentId])];

    await sessionRef.update({ lockedSteps: locked });

    return ok({ ok: true, action: "lock", studentId });
  }

  // ── action: submit — student submits a step answer ───────────────────────
  // { action: "submit", sessionId, studentId, step, content }
  if (action === "submit") {
    const { studentId, step, content } = body;
    if (!studentId) return err("studentId required");
    if (!content)   return err("content required");

    const stepNum = step || 1;

    await db.ref(`sessions/${sessionId}/answers/${studentId}/steps/${stepNum - 1}`).set({
      step:        stepNum,
      content,
      submittedAt: Date.now(),
    });

    await db.ref(`sessions/${sessionId}/answers/${studentId}/lastUpdated`).set(Date.now());

    return ok({ ok: true, action: "submit", step: stepNum });
  }

  // ── action: close — teacher closes session ───────────────────────────────
  if (action === "close") {
    await sessionRef.update({ active: false, closedAt: Date.now() });
    return ok({ ok: true, action: "close", sessionId });
  }

  return err(`Unknown action: ${action}`);
}
