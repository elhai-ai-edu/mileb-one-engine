// functions/personal_project.js — MilEd.One Personal Project API

import { getDatabase } from "firebase-admin/database";
import { ensureFirebaseAdminApp } from "./firebase-admin.js";

const MAX_STUDENT_NAME_LENGTH = 80;
const MAX_STAGE_INDEX         = 6;   // PP_STAGES has 7 stages (0–6)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDB() {
  return getDatabase(ensureFirebaseAdminApp());
}

function msgKey() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
}

// Canonical status values shared with course_progress mirror and micro_cockpit.
// personal_project uses: pending_review | approved | relocked | completed
// course_progress uses:  pending_review | unlocked | relocked
// Mapping approved → unlocked when writing to course_progress.
const PP_STATUSES = new Set(["pending_review", "approved", "relocked", "completed"]);

// Build a stable synthetic submission ID for a personal-project stage.
// Prefixed with "pp_" so micro_cockpit can route evaluations back here.
function ppSubmissionId(courseId, studentId, stageIndex) {
  return `pp_${String(courseId).slice(0, 20)}_${String(studentId).slice(0, 20)}_${stageIndex}`;
}

// Mirror a stage entry to course_progress/{courseId}/{studentId} so the
// gatekeeping course_stage_summary endpoint and the micro_cockpit tracking
// tab can read personal-project data without a separate API.
async function mirrorToCourseProgress(db, courseId, studentId, studentName, stageIndex, stageLabel, status, submissionId, extra = {}) {
  const courseStatus = status === "approved" ? "unlocked" : status; // unlocked ≡ approved
  const stageKey     = `pp_stage_${stageIndex}`;
  const update = {
    studentId,
    ...(studentName ? { studentName } : {}),
    [`stages/${stageKey}`]: {
      stageId:      stageKey,
      stageLabel:   stageLabel || stageKey,
      state:        courseStatus,
      submissionId: submissionId || null,
      submittedAt:  extra.submittedAt || null,
      ...(extra.approvedAt  ? { approvedAt:  extra.approvedAt  } : {}),
      ...(extra.rejectedAt  ? { rejectedAt:  extra.rejectedAt  } : {}),
      ...(extra.feedback    ? { feedback:    extra.feedback    } : {})
    },
    ...(status === "approved" ? { currentStageId: `pp_stage_${stageIndex}` } : {}),
    updatedAt: Date.now()
  };
  try {
    await db.ref(`course_progress/${courseId}/${studentId}`).update(update);
  } catch (e) {
    console.error("PP COURSE_PROGRESS MIRROR ERROR:", e.message);
  }
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
  const studentName = String(body.studentName || studentId).slice(0, MAX_STUDENT_NAME_LENGTH);

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
      student:       { currentStage: 0, ...studentData },
      announcements: announcementsSnap.val() || {},
      teacherQA:     qaSnap.val()            || {}
    });
  }

  // ── save_draft ────────────────────────────────────────────────────────────
  // Autosaves the current textarea content without advancing the stage.
  if (action === "save_draft") {
    const text = String(body.text || "");
    const now  = Date.now();
    await studentRef.update({ draft: text, draftSavedAt: now });
    return ok({ ok: true, draftSavedAt: now });
  }

  // ── submit_stage ──────────────────────────────────────────────────────────
  // Saves the student's answer for a stage and marks it pending_review.
  // Does NOT auto-advance currentStage; advancement happens on approve_stage.
  if (action === "submit_stage") {
    const text       = String(body.text || "").trim();
    const stageIndex = Number(body.stageIndex);
    const stageLabel = String(body.stageLabel || `שלב ${stageIndex + 1}`).slice(0, 80);

    if (!text) return err("text required");
    if (isNaN(stageIndex) || stageIndex < 0 || stageIndex > MAX_STAGE_INDEX)
      return err(`invalid stageIndex (must be 0–${MAX_STAGE_INDEX})`);

    const now          = Date.now();
    const submissionId = ppSubmissionId(courseId, studentId, stageIndex);

    const stageEntry = {
      text,
      status:       "pending_review",
      stageId:      `pp_stage_${stageIndex}`,
      stageLabel,
      submissionId,
      submittedAt:  now
    };

    await studentRef.child(`stages/${stageIndex}`).set(stageEntry);
    await studentRef.update({ draft: "", draftSavedAt: now, lastSeen: now });

    // Sync to course_progress on submission — pass studentId correctly
    await mirrorToCourseProgress(
      db, courseId, studentId, studentName, stageIndex, stageLabel,
      "pending_review", submissionId, { submittedAt: now }
    );

    return ok({ ok: true, status: "pending_review", submissionId });
  }

  // ── approve_stage ─────────────────────────────────────────────────────────
  // Teacher approves, rejects, or requests revision on a student's stage.
  // Accessible only from teacher-facing surfaces (micro_cockpit, personal_project teacher view).
  if (action === "approve_stage") {
    const targetStudentId = String(body.targetStudentId || body.studentId || "").trim();
    const stageIndex      = Number(body.stageIndex);
    const newStatus       = String(body.status || "").trim().toLowerCase();
    const feedback        = String(body.feedback || "").trim();

    if (!targetStudentId) return err("targetStudentId required");
    if (isNaN(stageIndex) || stageIndex < 0 || stageIndex > MAX_STAGE_INDEX)
      return err(`invalid stageIndex (must be 0–${MAX_STAGE_INDEX})`);
    if (!PP_STATUSES.has(newStatus)) return err(`invalid status (must be: ${[...PP_STATUSES].join(", ")})`);

    const targetStudentRef  = projRef.child(`students/${targetStudentId}`);
    const targetStudentSnap = await targetStudentRef.once("value");
    const targetData        = targetStudentSnap.val() || {};
    const stageEntry        = targetData.stages?.[stageIndex] || {};
    const now               = Date.now();
    const stageLabel        = stageEntry.stageLabel || `שלב ${stageIndex + 1}`;

    const stageUpdates = {
      status: newStatus,
      ...(feedback ? { feedback } : {}),
      evaluatedAt: now
    };
    if (newStatus === "approved") stageUpdates.approvedAt = now;
    if (newStatus === "relocked") stageUpdates.rejectedAt = now;

    await targetStudentRef.child(`stages/${stageIndex}`).update(stageUpdates);

    // Advance currentStage when approved, unless already past this index
    const studentUpdates = {};
    const currentStage   = Number(targetData.currentStage ?? 0);
    if (newStatus === "approved" && stageIndex === currentStage && stageIndex < MAX_STAGE_INDEX) {
      studentUpdates.currentStage = stageIndex + 1;
    }
    if (Object.keys(studentUpdates).length) await targetStudentRef.update(studentUpdates);

    // Post teacher reply to Q&A feed if feedback was provided
    if (feedback) {
      const key = msgKey();
      await projRef.child(`teacherQA/${targetStudentId}/${key}`).set({
        text:     feedback,
        from:     "teacher",
        postedAt: now
      });
    }

    await mirrorToCourseProgress(
      db, courseId, targetStudentId, targetData.studentName || targetStudentId,
      stageIndex, stageLabel, newStatus, stageEntry.submissionId || null,
      {
        submittedAt: stageEntry.submittedAt || null,
        approvedAt:  newStatus === "approved" ? now : (stageEntry.approvedAt || null),
        rejectedAt:  newStatus === "relocked" ? now : (stageEntry.rejectedAt || null),
        feedback
      }
    );

    return ok({ ok: true, status: newStatus, nextStage: studentUpdates.currentStage ?? currentStage });
  }

  // ── ask_teacher ───────────────────────────────────────────────────────────
  // Posts a Q&A message from the student to the teacher feed.
  if (action === "ask_teacher") {
    const text = String(body.text || "").trim();
    if (!text) return err("text required");

    await projRef.child(`teacherQA/${studentId}/${msgKey()}`).set({
      text,
      from:        "student",
      postedAt:    Date.now(),
      studentName: studentName.slice(0, 60)
    });

    return ok({ ok: true });
  }

  // ── reply_teacher ─────────────────────────────────────────────────────────
  // Teacher replies to a student's Q&A message.
  if (action === "reply_teacher") {
    const targetStudentId = String(body.targetStudentId || "").trim();
    const text            = String(body.text || "").trim();
    if (!targetStudentId) return err("targetStudentId required");
    if (!text)            return err("text required");

    await projRef.child(`teacherQA/${targetStudentId}/${msgKey()}`).set({
      text,
      from:     "teacher",
      postedAt: Date.now()
    });

    return ok({ ok: true });
  }

  // ── teacher_announce ──────────────────────────────────────────────────────
  // Teacher posts a course-wide announcement visible to all students.
  if (action === "teacher_announce") {
    const text = String(body.text || "").trim();
    if (!text) return err("text required");

    await projRef.child(`announcements/${msgKey()}`).set({
      text,
      postedAt: Date.now()
    });

    return ok({ ok: true });
  }

  return err(`unknown action: ${action}`);
}
