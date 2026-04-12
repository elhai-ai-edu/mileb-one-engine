import { getDatabase } from "firebase-admin/database";
import { getAuth } from "firebase-admin/auth";
import { ensureFirebaseAdminApp } from "./firebase-admin.js";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Gatekeeping-Secret",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};

function getDB() {
  return getDatabase(ensureFirebaseAdminApp());
}

function getAdminAuth() {
  return getAuth(ensureFirebaseAdminApp());
}

function json(statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body)
  };
}

function badRequest(error) {
  return json(400, { ok: false, error });
}

function forbidden(error) {
  return json(403, { ok: false, error });
}

function notFound(error) {
  return json(404, { ok: false, error });
}

function safeParseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function nowMs() {
  return Date.now();
}

function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeCourseId(value) {
  return String(value || "").trim();
}

function normalizeStageId(value) {
  return String(value || "").trim();
}

function toStageKey(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || "stage";
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueStrings(values) {
  return [...new Set(ensureArray(values).filter(Boolean).map(item => String(item)))];
}

function safePathPart(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "") || "anon";
}

function parseMaybeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function parseBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  const normalized = String(value || "").trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function toMillisFromInput(value) {
  if (value === null || value === undefined || value === "") return null;
  const asNumber = Number(value);
  if (Number.isFinite(asNumber)) return asNumber;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseAuthorizationToken(event) {
  const authHeader = String(event.headers?.authorization || event.headers?.Authorization || "").trim();
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

function getRequesterIp(event) {
  const forwarded = String(event.headers?.["x-forwarded-for"] || event.headers?.["X-Forwarded-For"] || "").trim();
  if (forwarded) return forwarded.split(",")[0].trim();
  return String(event.headers?.["client-ip"] || event.headers?.["Client-Ip"] || "unknown").trim() || "unknown";
}

async function enforceRateLimit(db, scope, identity, limit, windowMs) {
  const safeScope = safePathPart(scope);
  const safeIdentity = safePathPart(identity);
  const safeLimit = Math.max(1, parseMaybeNumber(limit, 25));
  const safeWindowMs = Math.max(1000, parseMaybeNumber(windowMs, 60_000));
  const now = nowMs();
  const slot = Math.floor(now / safeWindowMs);
  const ref = db.ref(`system/runtime/rate_limits/gatekeeping/${safeScope}/${safeIdentity}/${slot}`);
  let allowed = true;
  let currentCount = 0;

  await ref.transaction(current => {
    const count = Number(current?.count || 0);
    if (count >= safeLimit) {
      allowed = false;
      currentCount = count;
      return current;
    }
    currentCount = count + 1;
    return {
      count: count + 1,
      firstTs: Number(current?.firstTs || now),
      lastTs: now,
      windowMs: safeWindowMs,
      scope: safeScope
    };
  }, undefined, false);

  return {
    allowed,
    count: currentCount,
    limit: safeLimit,
    windowMs: safeWindowMs,
    retryAfterMs: allowed ? 0 : Math.max(0, (slot + 1) * safeWindowMs - now)
  };
}

function buildExpiry(hours) {
  const durationHours = Number(hours);
  const safeHours = Number.isFinite(durationHours) && durationHours > 0 ? durationHours : 168;
  return new Date(Date.now() + safeHours * 60 * 60 * 1000).toISOString();
}

function createTokenValue() {
  return `APP-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function getSessionPath(studentId, courseId) {
  return `sessions/${studentId}/${courseId}`;
}

function getAllowedEvaluatorRoles() {
  return new Set(["lecturer", "institution_admin", "system_admin", "superadmin", "faculty"]);
}

function normalizeRole(value) {
  const role = String(value || "").trim().toLowerCase();
  if (role === "faculty") return "lecturer";
  if (role === "superadmin") return "system_admin";
  return role;
}

function canEvaluate(actor = {}) {
  const actorId = String(actor.id || actor.uid || actor.email || "").trim();
  const role = normalizeRole(actor.role);
  if (!actorId || !role) return false;
  return getAllowedEvaluatorRoles().has(role);
}

async function resolveActorFromToken(event, db, body = {}) {
  const token = parseAuthorizationToken(event);
  if (!token) return null;
  let decoded = null;

  try {
    decoded = await getAdminAuth().verifyIdToken(token);
  } catch {
    return null;
  }

  const uid = String(decoded?.uid || "").trim();
  const email = String(decoded?.email || "").trim() || null;
  if (!uid) return null;

  let roleFromDb = "";
  try {
    const userSnap = await db.ref(`users/${uid}`).get();
    if (userSnap.exists()) {
      const userData = userSnap.val() || {};
      roleFromDb = normalizeRole(userData.role || userData.canonicalRole || "");
    }
  } catch {
    roleFromDb = "";
  }

  const role = roleFromDb || normalizeRole(decoded?.role || decoded?.canonicalRole || "");
  const actor = {
    id: uid,
    role: role || "",
    email,
    verifiedByToken: true
  };

  const bodyActorId = String(body.actorId || body.facultyId || body.userId || "").trim();
  if (bodyActorId && bodyActorId !== uid) {
    return { ...actor, mismatch: true };
  }

  return actor;
}

function getStageTrace(traces = {}, stageId) {
  return Object.entries(traces || {}).find(([, trace]) => trace?.stageId === stageId) || null;
}

function getStageConfig(classGatekeeping = {}, stageId) {
  const defaultSourceType = String(classGatekeeping.defaultSourceType || "manual_review").trim() || "manual_review";
  const protocolId = String(classGatekeeping.protocolId || "external_gatekeeper_approval_flow").trim() || "external_gatekeeper_approval_flow";
  const tokenTtlHours = Number(classGatekeeping.tokenTtlHours) || 168;
  const autoUnlockOnApproval = classGatekeeping.autoUnlockOnApproval !== false;
  const stageSettings = classGatekeeping.stageSettings || {};
  const explicit = stageSettings[stageId] || stageSettings[toStageKey(stageId)] || {};
  return {
    enabled: explicit.enabled !== false,
    protocolId,
    defaultSourceType,
    tokenTtlHours,
    autoUnlockOnApproval,
    criteriaVersion: explicit.criteriaVersion || null,
    reviewMode: explicit.reviewMode || null,
    sourceType: explicit.sourceType || defaultSourceType,
    unlocksStageId: explicit.unlocksStageId || stageId
  };
}

function pickRevisionRequestBySubmission(revisionRequests = {}, submissionId) {
  return Object.values(revisionRequests || {}).find(item => item?.submissionId === submissionId && item?.status === "open") || null;
}

async function loadSessionAndClass(db, studentId, courseId) {
  const [sessionSnap, classSnap] = await Promise.all([
    db.ref(getSessionPath(studentId, courseId)).get(),
    db.ref(`classes/${courseId}/gatekeeping`).get()
  ]);

  return {
    session: sessionSnap.exists() ? sessionSnap.val() : {},
    classGatekeeping: classSnap.exists() ? classSnap.val() : {}
  };
}

async function handleSubmit(body) {
  const studentId = String(body.studentId || "").trim();
  const courseId = normalizeCourseId(body.courseId || body.classId);
  const stageId = normalizeStageId(body.stageId);
  if (!studentId || !courseId || !stageId) {
    return badRequest("studentId, courseId/classId, and stageId are required");
  }

  const db = getDB();
  const { session, classGatekeeping } = await loadSessionAndClass(db, studentId, courseId);
  const stageConfig = getStageConfig(classGatekeeping, stageId);
  if (classGatekeeping.enabled === false || stageConfig.enabled === false) {
    return badRequest("Gatekeeping is disabled for this class or stage");
  }

  const submittedAt = nowIso();
  const updatedAt = nowMs();
  const stageKey = toStageKey(stageId);
  const unlockStageId = stageConfig.unlocksStageId || stageId;
  const unlockStageKey = toStageKey(unlockStageId);
  const submissionId = createId("sub");
  const eventId = createId("evt");
  const handoffId = createId("handoff");
  const continuityStateId = session?.continuity?.state?.continuityStateId || createId("cont");
  const existingTraceEntry = getStageTrace(session?.evidence?.traces, stageId);
  const traceId = existingTraceEntry?.[0] || createId("trace");
  const existingTrace = existingTraceEntry?.[1] || {};
  const payloadRef = String(body.payloadRef || body.artifactRef || submissionId).trim() || submissionId;
  const sourceType = String(body.sourceType || stageConfig.sourceType || stageConfig.defaultSourceType).trim() || "manual_review";

  const submission = {
    submissionId,
    studentId,
    stageId,
    sourceType,
    payloadRef,
    submittedAt,
    sessionId: body.sessionId || null,
    payload: body.payload && typeof body.payload === "object" ? body.payload : null,
    payloadSummary: String(body.payloadSummary || body.feedback || "").trim() || null
  };

  const evidenceEvent = {
    eventId,
    studentId,
    sourceContext: "lesson_space",
    eventType: "submission_attached",
    artifactRef: payloadRef,
    linkedSkillEvidenceIds: [],
    timestamp: submittedAt
  };

  const trace = {
    traceId,
    studentId,
    stageId,
    eventIds: uniqueStrings([...(existingTrace.eventIds || []), eventId]),
    traceStatus: "active"
  };

  const handoff = {
    handoffId,
    fromContext: "lesson_space",
    toContext: "external_gatekeeper",
    studentId,
    payloadRefs: uniqueStrings([traceId, submissionId]),
    purpose: "stage_validation",
    status: "sent"
  };

  const unlockState = {
    unlockStateId: session?.continuity?.unlockStates?.[unlockStageKey]?.unlockStateId || createId("unlock"),
    studentId,
    stageId,
    lockedStageId: unlockStageId,
    requiredSubmissionId: submissionId,
    requiredTokenId: null,
    validationEventId: null,
    state: "pending_review",
    lastUpdated: submittedAt
  };

  const continuityState = {
    continuityStateId,
    studentId,
    currentStageId: session?.continuity?.state?.currentStageId || stageId,
    priorStageIds: uniqueStrings(session?.continuity?.state?.priorStageIds || []),
    latestValidationEventId: session?.continuity?.state?.latestValidationEventId || null,
    latestHandoffId: handoffId,
    status: "active"
  };

  const updates = {};
  const sessionPath = getSessionPath(studentId, courseId);

  updates[`${sessionPath}/classId`] = courseId;
  updates[`${sessionPath}/gatekeeping/activeSubmissionIdByStage/${stageKey}`] = submissionId;
  updates[`${sessionPath}/gatekeeping/submissions/${submissionId}`] = submission;
  updates[`${sessionPath}/gatekeeping/updatedAt`] = updatedAt;
  updates[`${sessionPath}/evidence/events/${eventId}`] = evidenceEvent;
  updates[`${sessionPath}/evidence/traces/${traceId}`] = trace;
  updates[`${sessionPath}/continuity/handoffs/${handoffId}`] = handoff;
  updates[`${sessionPath}/continuity/unlockStates/${unlockStageKey}`] = unlockState;
  updates[`${sessionPath}/continuity/state`] = continuityState;
  updates[`${sessionPath}/updatedAt`] = updatedAt;

  await db.ref().update(updates);

  return json(200, {
    ok: true,
    action: "submit",
    submission,
    evidenceEvent,
    trace,
    handoff,
    unlockState,
    continuityState
  });
}

async function handleEvaluate(event, body) {
  const studentId = String(body.studentId || "").trim();
  const courseId = normalizeCourseId(body.courseId || body.classId);
  const submissionId = String(body.submissionId || "").trim();
  const requestedStatus = String(body.status || "").trim().toLowerCase();
  if (!studentId || !courseId || !submissionId || !requestedStatus) {
    return badRequest("studentId, courseId/classId, submissionId, and status are required");
  }
  if (!["approved", "rejected", "review_required"].includes(requestedStatus)) {
    return badRequest("status must be approved, rejected, or review_required");
  }

  const db = getDB();
  const actorFromToken = await resolveActorFromToken(event, db, body);
  const allowLegacyActor = parseBoolean(process.env.GATEKEEPING_ALLOW_LEGACY_ACTOR, false);
  let actor = actorFromToken;

  if (!actor) {
    if (!allowLegacyActor) {
      return forbidden("Evaluate requires a valid Firebase Authorization Bearer token");
    }
    actor = {
      id: body.actorId || body.facultyId || body.userId || null,
      role: body.actorRole || body.role || null,
      email: body.actorEmail || null,
      verifiedByToken: false
    };
  }

  if (actor?.mismatch) {
    return forbidden("actorId does not match authenticated token");
  }

  if (!canEvaluate(actor)) {
    return forbidden("Evaluate requires a lecturer or admin actor");
  }

  const limiter = await enforceRateLimit(
    db,
    "evaluate",
    `${courseId}_${String(actor.id || "anon")}`,
    process.env.GATEKEEPING_EVALUATE_RATE_LIMIT || 50,
    process.env.GATEKEEPING_EVALUATE_RATE_WINDOW_MS || 60_000
  );
  if (!limiter.allowed) {
    return json(429, {
      ok: false,
      error: "Rate limit exceeded for evaluate",
      retryAfterMs: limiter.retryAfterMs
    });
  }

  const { session, classGatekeeping } = await loadSessionAndClass(db, studentId, courseId);
  const submission = session?.gatekeeping?.submissions?.[submissionId] || null;
  if (!submission) {
    return notFound("Submission not found");
  }

  const stageId = normalizeStageId(body.stageId || submission.stageId);
  const stageKey = toStageKey(stageId);
  const stageConfig = getStageConfig(classGatekeeping, stageId);
  const unlockStageId = stageConfig.unlocksStageId || stageId;
  const unlockStageKey = toStageKey(unlockStageId);
  const evaluatedAt = nowIso();
  const updatedAt = nowMs();
  const evaluationId = createId("eval");
  const validationEventId = createId("val");
  const eventId = createId("evt");
  const transitionEventId = requestedStatus === "approved" ? createId("trans") : null;
  const tokenId = requestedStatus === "approved" ? createId("tok") : null;
  const revisionRequestId = requestedStatus === "rejected" ? createId("rev") : null;
  const evidenceEvent = {
    eventId,
    studentId,
    sourceContext: "external_gatekeeper",
    eventType: "evidence_validated",
    artifactRef: evaluationId,
    linkedSkillEvidenceIds: [],
    timestamp: evaluatedAt
  };
  const existingTraceEntry = getStageTrace(session?.evidence?.traces, stageId);
  const traceId = existingTraceEntry?.[0] || createId("trace");
  const existingTrace = existingTraceEntry?.[1] || {};
  const trace = {
    traceId,
    studentId,
    stageId,
    eventIds: uniqueStrings([...(existingTrace.eventIds || []), eventId]),
    traceStatus: requestedStatus === "approved" ? "closed" : "active"
  };

  const evaluation = {
    evaluationId,
    submissionId,
    status: requestedStatus,
    feedback: String(body.feedback || "").trim() || null,
    criteriaVersion: String(stageConfig.criteriaVersion || body.criteriaVersion || "").trim() || null,
    reviewMode: String(stageConfig.reviewMode || body.reviewMode || "").trim() || null,
    evaluatedAt,
    evaluatedBy: {
      actorId: String(actor.id || "").trim() || null,
      role: normalizeRole(actor.role) || null,
      email: String(actor.email || "").trim() || null
    }
  };

  const relatedHandoff = Object.values(session?.continuity?.handoffs || {}).find(item =>
    Array.isArray(item?.payloadRefs) && item.payloadRefs.includes(submissionId)
  ) || null;

  const validationEvent = {
    validationEventId,
    studentId,
    sourceProtocol: stageConfig.protocolId,
    decision: requestedStatus,
    evidenceRefs: uniqueStrings([submissionId, evaluationId, tokenId]),
    continuityRefs: uniqueStrings([relatedHandoff?.handoffId, traceId]),
    timestamp: evaluatedAt
  };

  const token = tokenId ? {
    tokenId,
    submissionId,
    studentId,
    stageId,
    tokenValue: String(body.tokenValue || createTokenValue()).trim(),
    expiresAt: body.expiresAt || buildExpiry(stageConfig.tokenTtlHours),
    status: "issued"
  } : null;

  const revisionRequest = revisionRequestId ? {
    revisionRequestId,
    submissionId,
    studentId,
    reasonSummary: evaluation.feedback || "Revision required",
    actionRequired: `resubmit_${stageKey}`,
    status: "open"
  } : null;

  const priorStageIds = uniqueStrings(session?.continuity?.state?.priorStageIds || []);
  if (requestedStatus === "approved") priorStageIds.push(stageId);

  const unlockStateValue = requestedStatus === "approved"
    ? (stageConfig.autoUnlockOnApproval ? "unlocked" : "pending_review")
    : requestedStatus === "rejected"
      ? "relocked"
      : "pending_review";

  const unlockState = {
    unlockStateId: session?.continuity?.unlockStates?.[unlockStageKey]?.unlockStateId || createId("unlock"),
    studentId,
    stageId,
    lockedStageId: unlockStageId,
    requiredSubmissionId: submissionId,
    requiredTokenId: tokenId,
    validationEventId,
    state: unlockStateValue,
    lastUpdated: evaluatedAt
  };

  const continuityState = {
    continuityStateId: session?.continuity?.state?.continuityStateId || createId("cont"),
    studentId,
    currentStageId: requestedStatus === "approved" ? unlockStageId : stageId,
    priorStageIds: uniqueStrings(priorStageIds),
    latestValidationEventId: validationEventId,
    latestHandoffId: relatedHandoff?.handoffId || session?.continuity?.state?.latestHandoffId || null,
    status: "active"
  };

  const transitionEvent = transitionEventId ? {
    transitionEventId,
    studentId,
    fromStageId: stageId,
    toStageId: unlockStageId,
    triggerValidationEventId: validationEventId,
    resultState: unlockStateValue,
    timestamp: evaluatedAt
  } : null;

  const updates = {};
  const sessionPath = getSessionPath(studentId, courseId);
  const auditId = createId("audit");
  const auditPayload = {
    auditId,
    eventType: "gatekeeping_evaluate",
    actorId: String(actor.id || "").trim() || null,
    actorRole: normalizeRole(actor.role) || null,
    actorEmail: String(actor.email || "").trim() || null,
    studentId,
    courseId,
    stageId,
    submissionId,
    decision: requestedStatus,
    evaluationId,
    validationEventId,
    authVerifiedByToken: !!actor.verifiedByToken,
    timestamp: evaluatedAt
  };

  updates[`${sessionPath}/gatekeeping/lastEvaluationIdByStage/${stageKey}`] = evaluationId;
  updates[`${sessionPath}/gatekeeping/evaluations/${evaluationId}`] = evaluation;
  updates[`${sessionPath}/gatekeeping/audit/${auditId}`] = auditPayload;
  updates[`${sessionPath}/gatekeeping/submissions/${submissionId}/evaluationId`] = evaluationId;
  updates[`${sessionPath}/gatekeeping/submissions/${submissionId}/lastStatus`] = requestedStatus;
  updates[`${sessionPath}/gatekeeping/updatedAt`] = updatedAt;
  updates[`${sessionPath}/evidence/events/${eventId}`] = evidenceEvent;
  updates[`${sessionPath}/evidence/traces/${traceId}`] = trace;
  updates[`${sessionPath}/continuity/validationEvents/${validationEventId}`] = validationEvent;
  updates[`${sessionPath}/continuity/unlockStates/${unlockStageKey}`] = unlockState;
  updates[`${sessionPath}/continuity/state`] = continuityState;
  updates[`${sessionPath}/updatedAt`] = updatedAt;

  if (token) {
    updates[`${sessionPath}/gatekeeping/lastTokenIdByStage/${stageKey}`] = tokenId;
    updates[`${sessionPath}/gatekeeping/tokens/${tokenId}`] = token;
  }

  if (revisionRequest) {
    const openRevision = pickRevisionRequestBySubmission(session?.gatekeeping?.revisionRequests, submissionId);
    if (openRevision?.revisionRequestId) {
      updates[`${sessionPath}/gatekeeping/revisionRequests/${openRevision.revisionRequestId}/status`] = "superseded";
    }
    updates[`${sessionPath}/gatekeeping/revisionRequests/${revisionRequestId}`] = revisionRequest;
  }

  if (transitionEvent) {
    updates[`${sessionPath}/continuity/transitions/${transitionEventId}`] = transitionEvent;
  }

  await db.ref().update(updates);

  return json(200, {
    ok: true,
    action: "evaluate",
    audit: auditPayload,
    evaluation,
    validationEvent,
    token,
    revisionRequest,
    unlockState,
    continuityState,
    transitionEvent
  });
}

async function handleStatus(query) {
  const studentId = String(query.studentId || "").trim();
  const courseId = normalizeCourseId(query.courseId || query.classId);
  const stageId = normalizeStageId(query.stageId || "");
  if (!studentId || !courseId) {
    return badRequest("studentId and courseId/classId are required");
  }

  const db = getDB();
  const { session, classGatekeeping } = await loadSessionAndClass(db, studentId, courseId);
  const gatekeeping = session?.gatekeeping || {};
  const continuity = session?.continuity || {};
  const stageKey = stageId ? toStageKey(stageId) : null;
  const activeSubmissionId = stageKey ? gatekeeping?.activeSubmissionIdByStage?.[stageKey] || null : null;
  const latestEvaluationId = stageKey ? gatekeeping?.lastEvaluationIdByStage?.[stageKey] || null : null;
  const latestTokenId = stageKey ? gatekeeping?.lastTokenIdByStage?.[stageKey] || null : null;

  const submissions = gatekeeping?.submissions || {};
  const evaluations = gatekeeping?.evaluations || {};
  const tokens = gatekeeping?.tokens || {};

  const stageSubmissions = Object.values(submissions)
    .filter(item => !stageId || item?.stageId === stageId)
    .sort((a, b) => Date.parse(b?.submittedAt || 0) - Date.parse(a?.submittedAt || 0));

  const stageEvaluations = Object.values(evaluations)
    .filter(item => {
      if (!stageId) return true;
      const refSubmission = submissions[item?.submissionId] || null;
      return refSubmission?.stageId === stageId;
    })
    .sort((a, b) => Date.parse(b?.evaluatedAt || 0) - Date.parse(a?.evaluatedAt || 0));

  const stageTokens = Object.values(tokens)
    .filter(item => !stageId || item?.stageId === stageId)
    .sort((a, b) => Date.parse(b?.expiresAt || 0) - Date.parse(a?.expiresAt || 0));

  return json(200, {
    ok: true,
    classGatekeeping,
    continuityState: continuity?.state || null,
    unlockState: stageKey ? continuity?.unlockStates?.[stageKey] || null : continuity?.unlockStates || {},
    submission: activeSubmissionId ? gatekeeping?.submissions?.[activeSubmissionId] || null : null,
    evaluation: latestEvaluationId ? gatekeeping?.evaluations?.[latestEvaluationId] || null : null,
    token: latestTokenId ? gatekeeping?.tokens?.[latestTokenId] || null : null,
    revisionRequests: gatekeeping?.revisionRequests || {},
    history: {
      submissions: stageSubmissions,
      evaluations: stageEvaluations,
      tokens: stageTokens
    }
  });
}

async function handleQueueByCourse(query) {
  const courseId = normalizeCourseId(query.courseId || query.classId);
  const stageId = normalizeStageId(query.stageId || "");
  const statusFilter = String(query.status || "").trim().toLowerCase();
  const search = String(query.search || "").trim().toLowerCase();
  const fromTs = toMillisFromInput(query.fromTs || query.fromDate || "");
  const toTs = toMillisFromInput(query.toTs || query.toDate || "");
  const page = Math.max(1, parseMaybeNumber(query.page, 1));
  const pageSize = Math.min(200, Math.max(1, parseMaybeNumber(query.pageSize, 50)));
  if (!courseId) return badRequest("courseId/classId required");

  const db = getDB();
  const sessionsSnap = await db.ref("sessions").get();
  if (!sessionsSnap.exists()) {
    return json(200, { ok: true, queue: [] });
  }

  const sessionsRoot = sessionsSnap.val() || {};
  const queue = [];

  for (const [studentId, coursesMap] of Object.entries(sessionsRoot)) {
    const courseState = (coursesMap || {})[courseId] || null;
    if (!courseState) continue;
    const gatekeeping = courseState.gatekeeping || {};
    const submissions = Object.values(gatekeeping.submissions || {})
      .filter(item => !stageId || item?.stageId === stageId)
      .sort((a, b) => Date.parse(b?.submittedAt || 0) - Date.parse(a?.submittedAt || 0));
    const latestSubmission = submissions[0] || null;
    if (!latestSubmission) continue;

    const latestEvaluationIdByStage = gatekeeping.lastEvaluationIdByStage || {};
    const stageKey = toStageKey(latestSubmission.stageId);
    const evalId = latestEvaluationIdByStage[stageKey] || latestSubmission.evaluationId || null;
    const evaluation = evalId ? (gatekeeping.evaluations || {})[evalId] || null : null;
    const unlockState = courseState?.continuity?.unlockStates?.[stageKey] || null;

    const submittedMs = Date.parse(latestSubmission.submittedAt || 0) || 0;
    const evaluationStatus = String(evaluation?.status || "pending_review").trim().toLowerCase();
    const studentName = String(courseState.studentName || "").trim();
    const queueItem = {
      studentId,
      studentName: studentName || null,
      stageId: latestSubmission.stageId,
      submissionId: latestSubmission.submissionId,
      submittedAt: latestSubmission.submittedAt,
      submittedAtMs: submittedMs,
      evaluationStatus,
      unlockState: unlockState?.state || null,
      feedback: evaluation?.feedback || null
    };

    if (statusFilter && queueItem.evaluationStatus !== statusFilter) continue;
    if (fromTs !== null && submittedMs < fromTs) continue;
    if (toTs !== null && submittedMs > toTs) continue;
    if (search) {
      const haystack = `${studentId} ${studentName} ${queueItem.stageId} ${queueItem.submissionId}`.toLowerCase();
      if (!haystack.includes(search)) continue;
    }

    queue.push(queueItem);
  }

  queue.sort((a, b) => (b.submittedAtMs || 0) - (a.submittedAtMs || 0));
  const total = queue.length;
  const start = (page - 1) * pageSize;
  const pageItems = queue.slice(start, start + pageSize);

  return json(200, {
    ok: true,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    queue: pageItems
  });
}

function toCsvCell(value) {
  const raw = String(value ?? "");
  if (/[",\n]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

async function handleAuditByCourse(query) {
  const courseId = normalizeCourseId(query.courseId || query.classId);
  if (!courseId) return badRequest("courseId/classId required");

  const statusFilter = String(query.status || "").trim().toLowerCase();
  const actorIdFilter = String(query.actorId || "").trim();
  const fromTs = toMillisFromInput(query.fromTs || query.fromDate || "");
  const toTs = toMillisFromInput(query.toTs || query.toDate || "");
  const page = Math.max(1, parseMaybeNumber(query.page, 1));
  const pageSize = Math.min(500, Math.max(1, parseMaybeNumber(query.pageSize, 100)));
  const format = String(query.format || "json").trim().toLowerCase();

  const db = getDB();
  const sessionsSnap = await db.ref("sessions").get();
  if (!sessionsSnap.exists()) {
    if (format === "csv") {
      return {
        statusCode: 200,
        headers: {
          ...headers,
          "Content-Type": "text/csv; charset=utf-8"
        },
        body: "auditId,timestamp,courseId,studentId,stageId,submissionId,decision,actorId,actorRole,actorEmail,evaluationId,validationEventId,authVerifiedByToken\n"
      };
    }
    return json(200, { ok: true, audit: [], total: 0, page, pageSize, totalPages: 1 });
  }

  const sessionsRoot = sessionsSnap.val() || {};
  const auditRows = [];

  for (const [studentId, coursesMap] of Object.entries(sessionsRoot)) {
    const courseState = (coursesMap || {})[courseId] || null;
    if (!courseState) continue;
    const auditMap = courseState?.gatekeeping?.audit || {};
    for (const item of Object.values(auditMap)) {
      const tsMs = Date.parse(item?.timestamp || 0) || 0;
      const decision = String(item?.decision || "").trim().toLowerCase();
      const actorId = String(item?.actorId || "").trim();

      if (statusFilter && decision !== statusFilter) continue;
      if (actorIdFilter && actorId !== actorIdFilter) continue;
      if (fromTs !== null && tsMs < fromTs) continue;
      if (toTs !== null && tsMs > toTs) continue;

      auditRows.push({
        auditId: item?.auditId || null,
        timestamp: item?.timestamp || null,
        timestampMs: tsMs,
        courseId,
        studentId: item?.studentId || studentId,
        stageId: item?.stageId || null,
        submissionId: item?.submissionId || null,
        decision,
        actorId,
        actorRole: item?.actorRole || null,
        actorEmail: item?.actorEmail || null,
        evaluationId: item?.evaluationId || null,
        validationEventId: item?.validationEventId || null,
        authVerifiedByToken: item?.authVerifiedByToken === true
      });
    }
  }

  auditRows.sort((a, b) => (b.timestampMs || 0) - (a.timestampMs || 0));
  const total = auditRows.length;
  const start = (page - 1) * pageSize;
  const pagedRows = auditRows.slice(start, start + pageSize);

  if (format === "csv") {
    const headerRow = "auditId,timestamp,courseId,studentId,stageId,submissionId,decision,actorId,actorRole,actorEmail,evaluationId,validationEventId,authVerifiedByToken";
    const dataRows = pagedRows.map(item => [
      item.auditId,
      item.timestamp,
      item.courseId,
      item.studentId,
      item.stageId,
      item.submissionId,
      item.decision,
      item.actorId,
      item.actorRole,
      item.actorEmail,
      item.evaluationId,
      item.validationEventId,
      item.authVerifiedByToken
    ].map(toCsvCell).join(","));

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": "text/csv; charset=utf-8"
      },
      body: [headerRow, ...dataRows].join("\n")
    };
  }

  return json(200, {
    ok: true,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    audit: pagedRows
  });
}

async function handleWebhookEvaluate(event, body) {
  const configuredSecret = String(process.env.GATEKEEPING_WEBHOOK_SECRET || "").trim();
  const providedSecret = String(event.headers?.["x-gatekeeping-secret"] || event.headers?.["X-Gatekeeping-Secret"] || body.secret || "").trim();

  if (configuredSecret && configuredSecret !== providedSecret) {
    return forbidden("Invalid webhook secret");
  }

  const db = getDB();
  const sourceIp = getRequesterIp(event);
  const limiter = await enforceRateLimit(
    db,
    "webhook_evaluate",
    sourceIp || "unknown",
    process.env.GATEKEEPING_WEBHOOK_RATE_LIMIT || 60,
    process.env.GATEKEEPING_WEBHOOK_RATE_WINDOW_MS || 60_000
  );
  if (!limiter.allowed) {
    return json(429, {
      ok: false,
      error: "Rate limit exceeded for webhook_evaluate",
      retryAfterMs: limiter.retryAfterMs
    });
  }

  const normalizedBody = {
    ...body,
    action: "evaluate",
    actorId: body.actorId || "webhook",
    actorRole: body.actorRole || "system_admin",
    actorEmail: body.actorEmail || null
  };

  return handleEvaluate(event, normalizedBody);
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod === "GET") {
    if (event.queryStringParameters?.action === "queue_by_course") {
      try {
        return await handleQueueByCourse(event.queryStringParameters || {});
      } catch (error) {
        console.error("GATEKEEPING QUEUE ERROR:", error.message);
        return json(500, { ok: false, error: "Gatekeeping queue unavailable" });
      }
    }

    if (event.queryStringParameters?.action === "audit_by_course") {
      try {
        return await handleAuditByCourse(event.queryStringParameters || {});
      } catch (error) {
        console.error("GATEKEEPING AUDIT ERROR:", error.message);
        return json(500, { ok: false, error: "Gatekeeping audit unavailable" });
      }
    }

    if (!event.queryStringParameters?.studentId) {
      return json(200, { status: "gatekeeping runtime ready" });
    }
    try {
      return await handleStatus(event.queryStringParameters || {});
    } catch (error) {
      console.error("GATEKEEPING STATUS ERROR:", error.message);
      return json(500, { ok: false, error: "Gatekeeping status unavailable" });
    }
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  const body = safeParseBody(event);
  if (!body) {
    return badRequest("Invalid JSON body");
  }

  try {
    const action = String(body.action || "").trim();
    if (action === "submit") return await handleSubmit(body);
    if (action === "evaluate") return await handleEvaluate(event, body);
    if (action === "webhook_evaluate") return await handleWebhookEvaluate(event, body);
    return badRequest("Unsupported action");
  } catch (error) {
    console.error("GATEKEEPING ERROR:", error.message);
    return json(500, { ok: false, error: "Gatekeeping flow failed" });
  }
}