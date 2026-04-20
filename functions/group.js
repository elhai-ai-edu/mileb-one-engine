// functions/group.js — MilEd.One Group Mode API

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

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };
  if (event.httpMethod !== "POST")    return err("POST required");

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return err("invalid JSON"); }

  const db         = getDB();
  const action     = String(body.action     || "").trim();
  const classId    = String(body.classId    || body.courseId || "").trim();
  const groupId    = String(body.groupId    || "").trim();
  const activityId = String(body.activityId || "default").trim();
  const studentId  = String(body.studentId  || "").trim();
  const studentName = String(body.studentName || "").trim() || null;

  if (!classId)   return err("classId required");
  if (!groupId)   return err("groupId required");
  if (!studentId) return err("studentId required");

  const basePath = `group_contributions/${classId}/${groupId}/${activityId}`;

  // Helper: read this student's group role from assignments (keyed by studentId)
  async function getRole() {
    const snap = await db.ref(`classes/${classId}/features/groupMode/assignments/${studentId}`).once("value");
    return snap.val() || null;
  }

  // ── contribute ───────────────────────────────────────────────────────────────
  // Add a contribution (text block) to the group workspace.
  // Any group member may contribute; type ∈ content | challenge | comment.
  if (action === "contribute") {
    const text = String(body.text || "").trim();
    const type = ["content", "challenge", "comment"].includes(body.type) ? body.type : "content";
    if (!text) return err("text required");

    const now   = Date.now();
    const id    = `contrib_${now}_${Math.random().toString(36).slice(2, 6)}`;
    const entry = { id, authorId: studentId, authorName: studentName, text, type, addedAt: now };

    await db.ref(`${basePath}/contributions/${id}`).set(entry);
    await db.ref(`${basePath}/updatedAt`).set(now);
    return ok({ ok: true, contributionId: id });
  }

  // ── master_draft ─────────────────────────────────────────────────────────────
  // Update the group's master draft. Only the מנסח role may write here.
  if (action === "master_draft") {
    const role = await getRole();
    if (role !== "מנסח") return err("only מנסח may edit master draft");

    const text = String(body.text || "").trim();
    if (!text) return err("text required");

    const now = Date.now();
    await db.ref(`${basePath}/masterDraft`).set({
      text,
      lastEditedBy: studentId,
      lastEditedAt: now
    });
    await db.ref(`${basePath}/updatedAt`).set(now);
    return ok({ ok: true });
  }

  // ── veto_initiate ─────────────────────────────────────────────────────────────
  // Start the veto/approval round for the current master draft.
  // Initiator auto-approves. Others must call veto_approve.
  if (action === "veto_initiate") {
    const draftSnap = await db.ref(`${basePath}/masterDraft`).once("value");
    const draft     = draftSnap.val();
    if (!draft?.text) return err("no master draft to veto");

    // Read per-student assignments (not slot-keyed roles) to build approvals map
    const assignSnap = await db.ref(`classes/${classId}/features/groupMode/assignments`).once("value");
    const assignments = assignSnap.val() || {};
    const now         = Date.now();
    const approvals   = {};
    Object.keys(assignments).forEach(sid => {
      approvals[sid] = sid === studentId
        ? { approved: true,  approvedAt: now }
        : { approved: null,  approvedAt: null };
    });

    const veto = {
      initiatedBy:      studentId,
      initiatedAt:      now,
      draftSnapshot:    draft.text,
      approvals,
      status:           "pending",
      finalSubmittedAt: null
    };

    await db.ref(`${basePath}/veto`).set(veto);
    return ok({ ok: true, veto });
  }

  // ── veto_approve ──────────────────────────────────────────────────────────────
  // Cast an approval (true) or veto (false) on the active veto round.
  // Status auto-advances to "approved" when unanimous, or "vetoed" on any false.
  if (action === "veto_approve") {
    const approved   = body.approved === true;
    const vetoReason = String(body.vetoReason || "").trim().slice(0, 300);

    const vetoRef  = db.ref(`${basePath}/veto`);
    const vetoSnap = await vetoRef.once("value");
    const veto     = vetoSnap.val();
    if (!veto)                   return err("no active veto");
    if (veto.status !== "pending") return err("veto not pending");

    const now = Date.now();
    await db.ref(`${basePath}/veto/approvals/${studentId}`).set({
      approved,
      approvedAt: now,
      ...(vetoReason && !approved ? { vetoReason } : {})
    });

    const updatedSnap = await vetoRef.once("value");
    const updated     = updatedSnap.val();
    const vals        = Object.values(updated.approvals || {});
    const allApproved = vals.length > 0 && vals.every(v => v.approved === true);
    const anyVetoed   = vals.some(v => v.approved === false);
    const newStatus   = allApproved ? "approved" : anyVetoed ? "vetoed" : "pending";

    await db.ref(`${basePath}/veto/status`).set(newStatus);
    return ok({ ok: true, status: newStatus });
  }

  // ── submit ────────────────────────────────────────────────────────────────────
  // Final group submission — only allowed after unanimous veto approval.
  if (action === "submit") {
    const vetoSnap = await db.ref(`${basePath}/veto`).once("value");
    const veto     = vetoSnap.val();
    if (!veto || veto.status !== "approved")
      return err("unanimous veto approval required before submit");

    const draftSnap = await db.ref(`${basePath}/masterDraft`).once("value");
    const draft     = draftSnap.val();
    if (!draft?.text) return err("no master draft to submit");

    const now = Date.now();
    await db.ref(`${basePath}/finalSubmission`).set({
      text:        draft.text,
      submittedBy: studentId,
      submittedAt: now,
      activityId,
      groupId
    });
    await db.ref(`${basePath}/veto/status`).set("submitted");
    await db.ref(`${basePath}/veto/finalSubmittedAt`).set(now);
    return ok({ ok: true, submittedAt: now });
  }

  return err(`Unknown action: ${action}`);
}
