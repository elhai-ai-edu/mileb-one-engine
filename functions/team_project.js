// functions/team_project.js — MilEd.One Async Team Project API

import { getDatabase } from "firebase-admin/database";
import { ensureFirebaseAdminApp } from "./firebase-admin.js";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL     = "https://openrouter.ai/api/v1/chat/completions";
const SITE_URL           = "https://cozy-seahorse-7c5204.netlify.app";
const DIGEST_MODEL       = "google/gemini-2.0-flash-001";
const DIGEST_TTL_MS      = 30 * 60 * 1000; // 30 min — re-generate if stale

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

// ─── AI Digest Generator ─────────────────────────────────────────────────────
// Produces a 2-3 sentence Hebrew summary of document blocks added since lastSeen.
// Falls back to a static message if LLM fails or there's nothing new.

async function generateDigest(projectTitle, studentName, newBlocks) {
  if (!newBlocks.length) {
    return "לא היו שינויים במסמך מאז ביקורך האחרון.";
  }

  if (!OPENROUTER_API_KEY) {
    return `מאז ביקורך האחרון נוספו ${newBlocks.length} בלוקים חדשים למסמך.`;
  }

  const blockLines = newBlocks
    .map(b => {
      const date = new Date(b.addedAt).toLocaleDateString("he-IL");
      const preview = b.text.length > 120 ? b.text.slice(0, 120) + "…" : b.text;
      return `• ${b.authorName || b.authorId} (${date}): "${preview}"`;
    })
    .join("\n");

  const prompt = `אתה עוזר לסטודנט בשם ${studentName} לחזור לפרויקט הצוות "${projectTitle}".

מאז ביקורו/ה האחרון נוספו הבלוקים הבאים:
${blockLines}

כתוב סיכום קצר (2-3 משפטים בעברית) שמתאר מה השתנה, כדי שהסטודנט יוכל להמשיך מהר. התמקד במה חשוב. אל תפתח בברכה.`;

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": SITE_URL,
        "X-Title": "MilEd.One"
      },
      body: JSON.stringify({
        model:      DIGEST_MODEL,
        messages:   [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens:  200
      })
    });
    if (!res.ok) throw new Error(`LLM ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim()
      || `נוספו ${newBlocks.length} בלוקים חדשים למסמך.`;
  } catch (e) {
    console.warn("[MilEd] digest LLM failed:", e.message);
    return `מאז ביקורך האחרון נוספו ${newBlocks.length} בלוקים חדשים למסמך.`;
  }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };
  if (event.httpMethod !== "POST")    return err("POST required");

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return err("invalid JSON"); }

  const db          = getDB();
  const action      = String(body.action    || "").trim();
  const projectId   = String(body.projectId || "").trim();
  const studentId   = String(body.studentId || "").trim();
  const studentName = String(body.studentName || "").trim() || studentId;

  if (!projectId) return err("projectId required");
  if (!studentId) return err("studentId required");

  const projRef = db.ref(`team_projects/${projectId}`);

  // ── entry ─────────────────────────────────────────────────────────────────────
  // Called when a student opens the team project screen.
  // Updates presence, generates or reuses AI digest, returns full project state.
  if (action === "entry") {
    const [projSnap, presenceSnap, docSnap, batonSnap] = await Promise.all([
      projRef.once("value"),
      db.ref(`team_projects/${projectId}/presence/${studentId}`).once("value"),
      db.ref(`team_projects/${projectId}/document`).once("value"),
      db.ref(`team_projects/${projectId}/baton`).once("value")
    ]);

    const project = projSnap.val();
    if (!project) return err("project not found");
    if (!(project.members || []).includes(studentId)) return err("not a project member");

    const presence   = presenceSnap.val() || {};
    const lastSeen   = presence.lastSeen || 0;
    const doc        = docSnap.val() || {};
    const baton      = batonSnap.val() || {};
    const allBlocks  = Object.values(doc.blocks || {});
    const newBlocks  = allBlocks
      .filter(b => !b.deleted && b.addedAt > lastSeen)
      .sort((a, b) => a.addedAt - b.addedAt);

    // Generate or reuse digest
    const now = Date.now();
    const digestSnap   = await db.ref(`team_projects/${projectId}/digest/${studentId}`).once("value");
    const savedDigest  = digestSnap.val();
    let digestText;

    const digestFresh = savedDigest
      && (now - savedDigest.generatedAt) < DIGEST_TTL_MS
      && savedDigest.sinceLastVisit === lastSeen;

    if (digestFresh) {
      digestText = savedDigest.summary;
    } else {
      digestText = await generateDigest(project.title || "פרויקט הצוות", studentName, newBlocks);
      await db.ref(`team_projects/${projectId}/digest/${studentId}`).set({
        generatedAt:    now,
        sinceLastVisit: lastSeen,
        summary:        digestText,
        newBlocks:      newBlocks.map(b => b.id),
        pendingBaton:   baton.currentHolder === studentId
      });
    }

    // Mark online
    await db.ref(`team_projects/${projectId}/presence/${studentId}`).update({
      lastSeen:   now,
      lastAction: "entry",
      online:     true
    });

    return ok({ ok: true, project, digest: digestText, document: doc, baton, newBlockCount: newBlocks.length });
  }

  // ── add_block ─────────────────────────────────────────────────────────────────
  // Appends an attributed block to the project document.
  // Only the baton holder may add blocks when baton.status === "holding".
  if (action === "add_block") {
    const text = String(body.text || "").trim();
    if (!text) return err("text required");

    const [projSnap, batonSnap] = await Promise.all([
      projRef.once("value"),
      db.ref(`team_projects/${projectId}/baton`).once("value")
    ]);

    const project = projSnap.val();
    if (!project) return err("project not found");

    const baton = batonSnap.val() || {};
    if (baton.status === "holding" && baton.currentHolder !== studentId) {
      return err("baton held by another member — wait for your turn");
    }

    const now     = Date.now();
    const blockId = `block_${now}_${Math.random().toString(36).slice(2, 6)}`;

    await db.ref(`team_projects/${projectId}/document/blocks/${blockId}`).set({
      id: blockId,
      authorId:   studentId,
      authorName: studentName || null,
      text,
      addedAt:    now,
      editedAt:   null,
      deleted:    false
    });

    await db.ref(`team_projects/${projectId}/document`).update({
      lastUpdatedBy: studentId,
      lastUpdatedAt: now
    });

    await db.ref(`team_projects/${projectId}/presence/${studentId}`).update({
      lastSeen:   now,
      lastAction: "added_block"
    });

    return ok({ ok: true, blockId });
  }

  // ── baton_pass ────────────────────────────────────────────────────────────────
  // Transfers the baton to the next member with a mandatory handoff note.
  // handoffTo is optional — defaults to next in roster (round-robin).
  if (action === "baton_pass") {
    const handoffNote = String(body.handoffNote || "").trim();
    if (!handoffNote) return err("handoffNote is required to pass the baton");

    const handoffTo = String(body.handoffTo || "").trim() || null;

    const [projSnap, batonSnap] = await Promise.all([
      projRef.once("value"),
      db.ref(`team_projects/${projectId}/baton`).once("value")
    ]);

    const project = projSnap.val();
    if (!project) return err("project not found");

    const baton = batonSnap.val() || {};
    if (baton.status === "holding" && baton.currentHolder !== studentId) {
      return err("you do not hold the baton");
    }

    // Compute next holder
    const members   = project.members || [];
    const idx       = members.indexOf(studentId);
    const nextHolder = handoffTo || members[(idx + 1) % members.length] || studentId;

    const now = Date.now();
    await db.ref(`team_projects/${projectId}/baton`).set({
      currentHolder: nextHolder,
      handoffNote,
      handoffAt:    now,
      handoffFrom:  studentId,
      status:       "passed"
    });

    await projRef.update({ currentHolder: nextHolder, lastActivity: now });

    await db.ref(`team_projects/${projectId}/presence/${studentId}`).update({
      lastSeen:   now,
      lastAction: "baton_passed",
      online:     false
    });

    return ok({ ok: true, nextHolder });
  }

  // ── veto_initiate ─────────────────────────────────────────────────────────────
  // Opens a veto/approval round over the current document snapshot.
  // Initiator auto-approves. Others call veto_approve.
  if (action === "veto_initiate") {
    const activityId = String(body.activityId || "final").trim();

    const [projSnap, docSnap] = await Promise.all([
      projRef.once("value"),
      db.ref(`team_projects/${projectId}/document`).once("value")
    ]);

    const project = projSnap.val();
    if (!project) return err("project not found");

    const doc    = docSnap.val() || {};
    const blocks = Object.values(doc.blocks || {}).filter(b => !b.deleted);
    if (!blocks.length) return err("document is empty — add content before initiating approval");

    const draftSnapshot = blocks
      .sort((a, b) => a.addedAt - b.addedAt)
      .map(b => b.text)
      .join("\n\n");

    const members   = project.members || [];
    const now       = Date.now();
    const approvals = {};
    members.forEach(sid => {
      approvals[sid] = sid === studentId
        ? { approved: true, approvedAt: now }
        : { approved: null, approvedAt: null };
    });

    const veto = {
      initiatedBy:      studentId,
      initiatedAt:      now,
      draftSnapshot,
      approvals,
      status:           "pending",
      finalSubmittedAt: null
    };

    await db.ref(`team_projects/${projectId}/veto/${activityId}`).set(veto);
    return ok({ ok: true, veto });
  }

  // ── veto_approve ──────────────────────────────────────────────────────────────
  // Cast approval (approved: true) or veto (approved: false) on an active round.
  // Status auto-advances: all true → "approved"; any false → "vetoed".
  if (action === "veto_approve") {
    const activityId = String(body.activityId || "final").trim();
    const approved   = body.approved === true;
    const vetoReason = String(body.vetoReason || "").trim().slice(0, 300);

    const vetoRef  = db.ref(`team_projects/${projectId}/veto/${activityId}`);
    const vetoSnap = await vetoRef.once("value");
    const veto     = vetoSnap.val();
    if (!veto)                    return err("no active veto for this activityId");
    if (veto.status !== "pending") return err("veto round is not pending");

    const now = Date.now();
    await db.ref(`team_projects/${projectId}/veto/${activityId}/approvals/${studentId}`).set({
      approved,
      approvedAt: now,
      ...(vetoReason && !approved ? { vetoReason } : {})
    });

    const updatedSnap = await vetoRef.once("value");
    const vals        = Object.values(updatedSnap.val()?.approvals || {});
    const allApproved = vals.length > 0 && vals.every(v => v.approved === true);
    const anyVetoed   = vals.some(v => v.approved === false);
    const newStatus   = allApproved ? "approved" : anyVetoed ? "vetoed" : "pending";

    await db.ref(`team_projects/${projectId}/veto/${activityId}/status`).set(newStatus);
    return ok({ ok: true, status: newStatus });
  }

  // ── final_submit ──────────────────────────────────────────────────────────────
  // Submits the project. Requires unanimous approval on the veto round.
  if (action === "final_submit") {
    const activityId = String(body.activityId || "final").trim();

    const vetoSnap = await db.ref(`team_projects/${projectId}/veto/${activityId}`).once("value");
    const veto     = vetoSnap.val();
    if (!veto || veto.status !== "approved")
      return err("unanimous approval is required before final submission");

    const now = Date.now();
    await projRef.update({ status: "submitted", lastActivity: now });
    await db.ref(`team_projects/${projectId}/veto/${activityId}`).update({
      status:           "submitted",
      finalSubmittedAt: now
    });

    return ok({ ok: true, submittedAt: now });
  }

  // ── redline_add ───────────────────────────────────────────────────────────────
  // Skeptic adds a redline (objection) to a document block.
  // Only one open redline per block at a time.
  if (action === "redline_add") {
    const blockId = String(body.blockId || "").trim();
    const note    = String(body.note    || "").trim().slice(0, 500);
    if (!blockId) return err("blockId required");
    if (!note)    return err("note required");

    const [projSnap, blockSnap] = await Promise.all([
      projRef.once("value"),
      db.ref(`team_projects/${projectId}/document/blocks/${blockId}`).once("value")
    ]);
    if (!projSnap.val()) return err("project not found");
    if (!blockSnap.val()) return err("block not found");

    const existing = await db.ref(`team_projects/${projectId}/redlines/${blockId}`).once("value");
    if (existing.val()?.status === "open") return err("block already has an open redline");

    const now = Date.now();
    await db.ref(`team_projects/${projectId}/redlines/${blockId}`).set({
      blockId,
      authorId:   studentId,
      authorName: studentName || null,
      note,
      status:     "open",
      createdAt:  now,
      resolvedAt: null,
      resolution: null
    });

    return ok({ ok: true });
  }

  // ── redline_resolve ───────────────────────────────────────────────────────────
  // Drafter (מנסח) accepts or dismisses an open redline.
  if (action === "redline_resolve") {
    const blockId    = String(body.blockId    || "").trim();
    const resolution = ["accept","dismiss"].includes(body.resolution) ? body.resolution : null;
    if (!blockId)    return err("blockId required");
    if (!resolution) return err("resolution must be 'accept' or 'dismiss'");

    const redlineSnap = await db.ref(`team_projects/${projectId}/redlines/${blockId}`).once("value");
    const redline     = redlineSnap.val();
    if (!redline || redline.status !== "open") return err("no open redline for this block");

    const now = Date.now();
    await db.ref(`team_projects/${projectId}/redlines/${blockId}`).update({
      status:     "resolved",
      resolution,
      resolvedBy: studentId,
      resolvedAt: now
    });

    return ok({ ok: true, resolution });
  }

  // ── board_post ────────────────────────────────────────────────────────────────
  // Append a message to the project's bulletin board.
  // type ∈ "update" | "question" | "pin"
  if (action === "board_post") {
    const text = String(body.text || "").trim();
    if (!text) return err("text required");

    const type = ["update", "question", "pin"].includes(body.type) ? body.type : "update";

    const projSnap = await projRef.once("value");
    if (!projSnap.val()) return err("project not found");

    const now    = Date.now();
    const postId = `post_${now}_${Math.random().toString(36).slice(2, 6)}`;

    await db.ref(`team_projects/${projectId}/board/${postId}`).set({
      id:         postId,
      authorId:   studentId,
      authorName: studentName || null,
      text,
      type,
      postedAt:   now
    });

    return ok({ ok: true, postId });
  }

  return err(`Unknown action: ${action}`);
}
