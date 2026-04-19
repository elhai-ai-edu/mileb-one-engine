// netlify/functions/classroom.js — MilEd.One

import { getDatabase } from "firebase-admin/database";
import { readFile } from "fs/promises";
import { ensureFirebaseAdminApp } from "./firebase-admin.js";

let cachedConfigCourses = null;

function getDB() {
  return getDatabase(ensureFirebaseAdminApp());

}

const headers = {

  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"Content-Type",
  "Access-Control-Allow-Methods":"POST, GET, OPTIONS",
  "Content-Type":"application/json"

};

function ok(body){

  return {
    statusCode:200,
    headers,
    body:JSON.stringify(body)
  };

}

function err(msg){

  return {
    statusCode:400,
    headers,
    body:JSON.stringify({error:msg})
  };

}

const ALLOWED_LIVE_PHASES = ["listening", "interactive", "solo", "pairs", "plenary"];

// Normalise and validate a raw phase string. Returns the validated phase or null.
function validateLivePhase(raw) {
  const phase = String(raw || "").trim().toLowerCase();
  return ALLOWED_LIVE_PHASES.includes(phase) ? phase : null;
}

function normalizeAvatar(value){
  const avatar = String(value || "").trim();
  if(!avatar.startsWith("data:image/")) return null;
  return avatar;
}

function normalizePreSessionMission(input = {}) {
  const text = String(input.text || "").trim();
  const videoUrl = String(input.videoUrl || "").trim();
  const audioDataUrlRaw = String(input.audioDataUrl || "").trim();
  const audioDataUrl = audioDataUrlRaw.startsWith("data:audio/") ? audioDataUrlRaw : "";

  return {
    text: text || null,
    videoUrl: videoUrl || null,
    audioDataUrl: audioDataUrl || null
  };
}

function buildEntranceTask(input = {}) {
  const type = String(input.taskType || input.type || "ticket").trim().toLowerCase();
  const title  = String(input.taskTitle || input.title || "").trim() || null;
  const prompt = String(input.text || input.prompt || "").trim() || null;

  const task = { enabled: true, type, title, prompt, updatedAt: Date.now() };

  if (type === "video") {
    task.videoUrl = String(input.videoUrl || "").trim() || null;
  }
  if (type === "quiz") {
    const rawOptions = input.options;
    const options = Array.isArray(rawOptions)
      ? rawOptions.map(o => String(o).trim()).filter(Boolean)
      : String(rawOptions || "").split("\n").map(o => o.trim()).filter(Boolean);
    task.options       = options.length ? options : null;
    task.correctIndex  = Number.isFinite(Number(input.correctIndex)) ? Number(input.correctIndex) - 1 : -1;
    task.allowWrongAnswer = task.correctIndex < 0;
  }
  if (type === "ticket") {
    task.minLength = Number(input.minLength) > 0 ? Number(input.minLength) : 20;
  }
  if (type === "vocab") {
    const rawPairs = input.pairs;
    let pairs = [];
    if (Array.isArray(rawPairs)) {
      pairs = rawPairs.map(p => Array.isArray(p) ? p : String(p).split("|").map(s => s.trim())).filter(p => p.length >= 2);
    } else {
      pairs = String(rawPairs || "").split("\n")
        .map(line => line.split("|").map(s => s.trim()))
        .filter(p => p.length >= 2 && p[0] && p[1]);
    }
    task.pairs = pairs.length ? pairs : null;
  }
  return task;
}

function clipCardText(text, maxLen = 40) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if(clean.length <= maxLen) return clean;
  return clean.slice(0, maxLen).trim();
}

function computeVotePercentages(votesMap = {}, optionsCount = 3) {
  const counts = Array.from({ length: Math.max(1, optionsCount) }, () => 0);
  Object.values(votesMap || {}).forEach(item => {
    const idx = Number(item?.choice);
    if(Number.isInteger(idx) && idx >= 0 && idx < counts.length) counts[idx]++;
  });
  const totalVotes = counts.reduce((sum, n) => sum + n, 0);
  const percentages = counts.map(count => totalVotes ? Math.round((count / totalVotes) * 100) : 0);
  return { counts, totalVotes, percentages };
}

function normalizeUnitId(value, fallback = "unit_01") {
  const unit = String(value || "").trim();
  return unit || fallback;
}

function normalizeConfigUnitId(value, fallbackIndex = 1) {
  const raw = String(value ?? "").trim();
  if(/^unit_\d+$/i.test(raw)) return normalizeUnitId(raw.toLowerCase());
  const numeric = Number(raw);
  if(Number.isInteger(numeric) && numeric > 0) {
    return `unit_${String(numeric).padStart(2, "0")}`;
  }
  return `unit_${String(fallbackIndex).padStart(2, "0")}`;
}

async function getConfigCourses() {
  if(cachedConfigCourses) return cachedConfigCourses;
  try {
    const configPath = new URL("../config.json", import.meta.url);
    const raw = await readFile(configPath, "utf8");
    const parsed = JSON.parse(raw);
    const catalog = parsed?.course_catalog || {};
    const instances = parsed?.my_courses || {};
    // Merge each instance with its template: template fields are defaults,
    // instance fields override. course_units and universal_bots merge shallowly.
    const resolved = {};
    for(const [classId, instance] of Object.entries(instances)) {
      const template = instance.templateId ? (catalog[instance.templateId] || {}) : {};
      resolved[classId] = {
        ...template,
        ...instance,
        universal_bots: instance.universal_bots ?? template.universal_bots,
        course_units:   instance.course_units   ?? template.course_units,
      };
    }
    cachedConfigCourses = resolved;
  } catch {
    cachedConfigCourses = {};
  }
  return cachedConfigCourses;
}

function buildConfigCourseBundle(courseConfig = {}, lessonId) {
  const semesterUnits = Array.isArray(courseConfig?.course_units?.semester_a?.units)
    ? courseConfig.course_units.semester_a.units
    : [];
  const fallbackUnits = semesterUnits.map((unit, index) => ({
    unitId: normalizeConfigUnitId(unit?.unitId || unit?.id, index + 1),
    name: String(unit?.label || unit?.name || `Unit ${index + 1}`).trim() || `Unit ${index + 1}`,
    resources: []
  }));
  const normalizedLessonId = normalizeUnitId(lessonId, "unit_01");
  const selectedUnits = fallbackUnits.filter(unit => unit.unitId === normalizedLessonId);
  const activeUnit = selectedUnits[0] || null;

  return {
    courseName: String(courseConfig?.name || "").trim() || null,
    selectedUnits,
    resources: [],
    sprintDefinitions: activeUnit ? [{
      id: `${normalizedLessonId}_focus`,
      title: activeUnit.name,
      stationType: "AI_STATION",
      instructions: `עובדים כעת על היחידה "${activeUnit.name}". השתמשו בשיחה ובמשאבים הזמינים כדי להתקדם במשימה.`,
      order: 1
    }] : []
  };
}

function tryParseJson(value) {
  if(typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function slugifySegment(value, fallback = "item") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || fallback;
}

function cleanResourceTitle(value) {
  const raw = String(value || "").replace(/\s+/g, " ").trim();
  if(!raw) return "ללא כותרת";
  const cleaned = raw.replace(/^(קישור לאתר אינטרנט|קובץ|file|url|page|folder|label)\s*[:\-–]?\s*/i, "").trim();
  return cleaned || raw;
}

function inferResourceUrl(item = {}) {
  return String(
    item.url ||
    item.link ||
    item.href ||
    item.externalUrl ||
    item.resourceUrl ||
    item.downloadUrl ||
    ""
  ).trim() || null;
}

function inferResourceKind(item = {}, url = "") {
  const declared = String(item.kind || item.type || item.modname || item.resourceType || "").trim().toLowerCase();
  const lowerUrl = String(url || "").toLowerCase();
  if(declared.includes("pdf") || lowerUrl.endsWith(".pdf")) return "pdf";
  if(declared.includes("file") || lowerUrl.match(/\.(docx?|pptx?|xlsx?|zip)$/)) return "file";
  if(declared.includes("task") || declared.includes("assignment") || declared.includes("forum")) return "task";
  if(declared.includes("page")) return "page";
  if(declared.includes("url") || declared.includes("link") || /^https?:\/\//.test(lowerUrl)) return "link";
  return "resource";
}

function isLecturerOnlyResource(title) {
  return /(נוכחות|יומן|הודעות)/.test(String(title || ""));
}

function normalizeMoodleMetadata(rawInput) {
  const raw = tryParseJson(rawInput);
  if(!raw || typeof raw !== "object") return null;

  const sections =
    (Array.isArray(raw.sections) && raw.sections) ||
    (Array.isArray(raw?.course?.sections) && raw.course.sections) ||
    (Array.isArray(raw?.data?.sections) && raw.data.sections) ||
    (Array.isArray(raw) && raw) ||
    [];

  const units = sections.map((section, sectionIndex) => {
    const sectionName = String(section?.name || section?.title || section?.section || `Unit ${sectionIndex + 1}`).trim();
    const unitId = normalizeUnitId(
      section?.unitId || section?.id || slugifySegment(sectionName, `unit_${String(sectionIndex + 1).padStart(2, "0")}`),
      `unit_${String(sectionIndex + 1).padStart(2, "0")}`
    );
    const itemList =
      (Array.isArray(section?.items) && section.items) ||
      (Array.isArray(section?.modules) && section.modules) ||
      (Array.isArray(section?.resources) && section.resources) ||
      [];

    const resources = itemList.map((item, itemIndex) => {
      const originalTitle = String(item?.name || item?.title || item?.label || item?.resourceName || `Resource ${itemIndex + 1}`).trim();
      const cleanedTitle = cleanResourceTitle(originalTitle);
      const url = inferResourceUrl(item);
      const kind = inferResourceKind(item, url || "");
      return {
        id: String(item?.id || `${unitId}_res_${String(itemIndex + 1).padStart(2, "0")}`),
        title: cleanedTitle,
        originalTitle,
        url,
        kind,
        lecturerOnly: isLecturerOnlyResource(cleanedTitle),
        sourceType: String(item?.type || item?.modname || item?.resourceType || kind),
        description: String(item?.description || item?.summary || "").trim() || null,
        icon: kind,
        updatedAt: Date.now()
      };
    });

    return {
      unitId,
      name: sectionName || `Unit ${sectionIndex + 1}`,
      resources
    };
  }).filter(unit => unit.name || unit.resources.length);

  const resourceCount = units.reduce((sum, unit) => sum + unit.resources.length, 0);

  return {
    importedAt: Date.now(),
    raw,
    unitCount: units.length,
    resourceCount,
    units
  };
}

function getCourseLessonBundle(courseNode = {}, lessonId, courseConfig = null) {
  const metadata = courseNode?.metadata || {};
  let units = Array.isArray(metadata?.units) ? metadata.units : [];
  const playlists = courseNode?.playlists || {};
  const normalizedLessonId = normalizeUnitId(lessonId, "unit_01");
  const playlist = playlists?.[normalizedLessonId] || null;
  const configBundle = !units.length && courseConfig ? buildConfigCourseBundle(courseConfig, normalizedLessonId) : null;
  if(!units.length && configBundle?.selectedUnits?.length) {
    units = configBundle.selectedUnits;
  }
  const selectedUnitIds = Array.isArray(playlist?.unitIds) && playlist.unitIds.length
    ? playlist.unitIds.map(id => normalizeUnitId(id)).filter(Boolean)
    : [normalizedLessonId];
  const selectedUnits = units.filter(unit => selectedUnitIds.includes(normalizeUnitId(unit?.unitId)));
  const resources = selectedUnits.flatMap(unit => (Array.isArray(unit?.resources) ? unit.resources : []).map(resource => ({
    ...resource,
    unitId: normalizeUnitId(unit?.unitId),
    unitName: unit?.name || normalizeUnitId(unit?.unitId)
  })));

  return {
    lessonId: normalizedLessonId,
    playlist,
    selectedUnits: selectedUnits.length ? selectedUnits : (configBundle?.selectedUnits || []),
    resources: resources.length ? resources : (configBundle?.resources || []),
    courseName: String(courseNode?.name || courseConfig?.name || "").trim() || null,
    sprintDefinitions: Array.isArray(courseNode?.sprintDefinitions?.[normalizedLessonId]?.items)
      ? courseNode.sprintDefinitions[normalizedLessonId].items
      : (configBundle?.sprintDefinitions || [])
  };
}

function computePacingSummary(pacingMap = {}, activeSprint = null) {
  const students = Object.values(pacingMap || {}).map(entry => ({
    studentId: entry?.studentId || null,
    studentName: entry?.studentName || entry?.name || null,
    currentSprint: entry?.currentSprint || null,
    status: entry?.status || "idle",
    pathDecision: entry?.pathDecision || "normal",
    guidance: entry?.guidance || null,
    lastActivityAt: Number(entry?.lastActivityAt) || 0,
    completedSprints: entry?.completedSprints || {},
    evidenceCount: Number(entry?.evidenceCount) || 0
  }));

  const averagesBySprint = {};
  students.forEach(student => {
    Object.entries(student.completedSprints || {}).forEach(([sprintId, info]) => {
      const durationMs = Number(info?.durationMs) || 0;
      if(!durationMs) return;
      if(!averagesBySprint[sprintId]) averagesBySprint[sprintId] = [];
      averagesBySprint[sprintId].push(durationMs);
    });
  });

  const averageCompletionMs = Object.fromEntries(
    Object.entries(averagesBySprint).map(([sprintId, values]) => [
      sprintId,
      Math.round(values.reduce((sum, item) => sum + item, 0) / values.length)
    ])
  );

  const stuckThresholdMs = 12 * 60 * 1000;
  const now = Date.now();
  const heatmap = students.map(student => {
    const lastDelta = student.lastActivityAt ? now - student.lastActivityAt : Number.MAX_SAFE_INTEGER;
    return {
      studentId: student.studentId,
      studentName: student.studentName,
      sprint: student.currentSprint || activeSprint || "—",
      isStuck: lastDelta > stuckThresholdMs || student.pathDecision === "support",
      pathDecision: student.pathDecision,
      status: student.status,
      evidenceCount: student.evidenceCount,
      lastActivityAt: student.lastActivityAt
    };
  });

  return {
    students,
    activeSprint: activeSprint || null,
    averageCompletionMs,
    heatmap,
    stuckCount: heatmap.filter(item => item.isStuck).length
  };
}

function getUnitPath(userId, courseId, unitId) {
  return `users/${userId}/courses/${courseId}/units/${unitId}`;
}

// Returns a Set of sessionIds that are currently active for a given courseId.
// Reads from both the top-level sessionId and per-unit sessionIds stored in
// active_sessions/{courseId}.
async function collectActiveSessionIds(db, courseId) {
  const snap = await db.ref(`active_sessions/${courseId}`).once("value");
  const data = snap.val() || {};
  const ids = new Set();
  if (data.sessionId) ids.add(data.sessionId);
  Object.values(data.units || {}).forEach(u => { if (u?.sessionId) ids.add(u.sessionId); });
  return ids;
}

async function ensureUnitNode(db, { userId, courseId, unitId, structureType = "Session", topicName = "" }) {
  if(!userId || !courseId || !unitId) return;
  const nodeRef = db.ref(getUnitPath(userId, courseId, unitId));
  const snap = await nodeRef.once("value");
  if(snap.exists()) return;
  await nodeRef.set({
    topicName: String(topicName || "").trim() || null,
    structureType: String(structureType || "Session"),
    missionData: null,
    entranceTickets: null,
    updatedAt: Date.now()
  });
}

const WAITING_ROOM_STALE_MS = 60000;

async function getFreshLegacyWaitingSnapshot(db, classId){
  if(!classId) return { count: 0, students: [] };

  const waitingRef = db.ref(`waiting_room/${classId}`);
  const waitingSnap = await waitingRef.once("value");
  const waitingMap = waitingSnap.val() || {};
  const now = Date.now();
  const staleKeys = [];
  const students = [];

  Object.entries(waitingMap).forEach(([sid, item]) => {
    const lastSeen = Number(item?.lastSeen) || 0;
    const fresh = now - lastSeen <= WAITING_ROOM_STALE_MS;
    if(!fresh) {
      staleKeys.push(sid);
      return;
    }
    students.push({
      studentId: sid,
      name: item?.name || null,
      avatar: normalizeAvatar(item?.avatar) || null,
      reaction: String(item?.reaction || "").trim() || null,
      lastSeen,
      status: item?.status || "waiting"
    });
  });

  if(staleKeys.length){
    const updates = {};
    staleKeys.forEach(sid => {
      updates[`waiting_room/${classId}/${sid}`] = null;
    });
    await db.ref().update(updates);
  }

  students.sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));

  return {
    count: students.length,
    students: students.slice(0, 80)
  };
}

async function getFreshAttendeeSnapshot(db, classId, unitId = null){
  if(!classId) return { count: 0, students: [] };

  const normalizedUnitId = unitId ? normalizeUnitId(unitId) : null;
  const syncKeys = [];

  if(normalizedUnitId) {
    syncKeys.push(`${classId}_${normalizedUnitId}`);
  } else {
    try {
      const activeSnap = await db.ref(`active_sessions/${classId}`).once("value");
      const activeUnits = activeSnap.val()?.units || {};
      Object.keys(activeUnits).forEach((activeUnitId) => {
        const resolvedUnitId = normalizeUnitId(activeUnitId);
        const syncKey = `${classId}_${resolvedUnitId}`;
        if(!syncKeys.includes(syncKey)) syncKeys.push(syncKey);
      });
    } catch {}
  }

  if(!syncKeys.length) return { count: 0, students: [] };

  const snapshots = await Promise.all(
    syncKeys.map((syncKey) => db.ref(`sessions/${syncKey}/attendees`).once("value"))
  );

  const now = Date.now();
  const staleUpdates = {};
  const studentsById = new Map();

  snapshots.forEach((snapshot, index) => {
    const syncKey = syncKeys[index];
    const attendees = snapshot.val() || {};
    const syncUnitId = syncKey.slice(`${classId}_`.length) || normalizedUnitId || "unit_01";

    Object.entries(attendees).forEach(([sid, item]) => {
      const lastSeen = Number(item?.lastSeen) || 0;
      const fresh = now - lastSeen <= WAITING_ROOM_STALE_MS;
      if(!fresh) {
        staleUpdates[`sessions/${syncKey}/attendees/${sid}`] = null;
        return;
      }

      const studentId = String(item?.studentId || item?.userId || sid || "").trim() || sid;
      const candidate = {
        studentId,
        name: item?.name || item?.studentName || null,
        avatar: normalizeAvatar(item?.avatar) || null,
        reaction: String(item?.reaction || "").trim() || null,
        lastSeen,
        status: item?.ready ? "ready" : (item?.status || "waiting"),
        sessionId: item?.sessionId || null,
        unitId: syncUnitId
      };

      const existing = studentsById.get(studentId);
      if(!existing || lastSeen > (Number(existing.lastSeen) || 0)) {
        studentsById.set(studentId, candidate);
      }
    });
  });

  if(Object.keys(staleUpdates).length) {
    await db.ref().update(staleUpdates);
  }

  const students = Array.from(studentsById.values())
    .sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0))
    .slice(0, 80);

  return {
    count: students.length,
    students
  };
}

async function getFreshWaitingSnapshot(db, classId, unitId = null){
  if(!classId) return { count: 0, students: [] };

  const [legacySnapshot, attendeeSnapshot] = await Promise.all([
    getFreshLegacyWaitingSnapshot(db, classId),
    getFreshAttendeeSnapshot(db, classId, unitId)
  ]);

  const studentsById = new Map();
  [...legacySnapshot.students, ...attendeeSnapshot.students].forEach((student) => {
    const studentId = String(student?.studentId || "").trim();
    if(!studentId) return;
    const existing = studentsById.get(studentId);
    if(!existing || Number(student?.lastSeen) > Number(existing?.lastSeen || 0)) {
      studentsById.set(studentId, student);
    }
  });

  const students = Array.from(studentsById.values())
    .sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0))
    .slice(0, 80);

  return {
    count: students.length,
    students
  };
}

async function getFreshWaitingCount(db, classId, unitId = null){
  const snapshot = await getFreshWaitingSnapshot(db, classId, unitId);
  return snapshot.count;
}

export async function handler(event){

  if(event.httpMethod === "OPTIONS")
    return {statusCode:200,headers,body:""};

  const db = getDB();

  let body = {};

  try{
    body = JSON.parse(event.body || "{}");
  }
  catch{
    return err("Invalid JSON");
  }

  const { action, sessionId } = body;

  if(event.httpMethod === "GET"){

    const { action, sessionId, studentId, facultyId } =
      event.queryStringParameters || {};

    // templates — no active session needed
    if(action === "templates"){
      const classId = event.queryStringParameters?.classId;
      if(!classId) return err("classId required");
      const snap = await db.ref(`lesson_templates/${classId}`).once("value");
      return ok({ templates: snap.val() || {} });
    }

    if(action === "waiting_count"){
      const classId = event.queryStringParameters?.classId;
      const unitId = event.queryStringParameters?.unitId || null;
      if(!classId) return err("classId required");
      const waitingSnapshot = await getFreshWaitingSnapshot(db, classId, unitId);
      return ok({
        classId,
        unitId: unitId ? normalizeUnitId(unitId) : null,
        waitingStudentsCount: waitingSnapshot.count,
        waitingStudents: waitingSnapshot.students
      });
    }

    if(action === "course_metadata"){
      const courseId = String(event.queryStringParameters?.courseId || event.queryStringParameters?.classId || "").trim();
      if(!courseId) return err("courseId required");
      const snap = await db.ref(`courses/${courseId}`).once("value");
      const courseNode = snap.val() || {};
      return ok({
        courseId,
        metadata: courseNode.metadata || null,
        playlists: courseNode.playlists || {},
        sprintDefinitions: courseNode.sprintDefinitions || {}
      });
    }

    if(action === "meeting_info"){
      const courseId = String(event.queryStringParameters?.courseId || event.queryStringParameters?.classId || "").trim();
      if(!courseId) return err("courseId required");
      const snap = await db.ref(`courses/${courseId}/liveMeeting`).once("value");
      return ok({ courseId, liveMeeting: snap.val() || null });
    }

    if(action === "lesson_payload"){
      if(!sessionId) return err("sessionId required");
      const sessionSnap = await db.ref(`sessions/${sessionId}`).once("value");
      const session = sessionSnap.val() || null;
      if(!session) return err("session not found");

      // Write student presence so lecturer dashboard sees them immediately
      const payloadStudentId = String(event.queryStringParameters?.studentId || "").trim();
      const payloadStudentName = String(event.queryStringParameters?.studentName || "").trim();
      if(payloadStudentId){
        const now = Date.now();
        const presenceUpdate = { lastSeen: now, presence: "online" };
        if(payloadStudentName) presenceUpdate.name = payloadStudentName;
        await Promise.all([
          db.ref(`sessions/${sessionId}/students/${payloadStudentId}`).update(presenceUpdate),
          db.ref(`sessions/${sessionId}/answers/${payloadStudentId}/lastSeen`).set(now)
        ]);
      }

      const courseId = session.courseId || session.classId || null;
      const state = session.state || {
        current_unit: normalizeUnitId(session.unitId),
        active_sprint: null,
        door_status: session.active ? "auto" : "closed"
      };
      const lessonId = normalizeUnitId(state.current_unit || session.unitId);
      const configCourses = await getConfigCourses();
      const courseConfig = courseId ? (configCourses?.[courseId] || null) : null;
      const courseSnap = courseId
        ? await db.ref(`courses/${courseId}`).once("value")
        : { val: () => ({}) };
      const courseNode = courseSnap.val() || {};
      const lessonBundle = getCourseLessonBundle(courseNode, lessonId, courseConfig);
      const pacingSummary = computePacingSummary(session.pacing || {}, state.active_sprint || null);

      // Live meeting: prefer session-level snapshot (locked at session open time),
      // fall back to the current course-level record.
      const liveMeeting = session.liveMeetingSnapshot || courseNode.liveMeeting || null;
      const speakerFocus = session.speakerFocus || null;

      return ok({
        sessionId,
        courseId,
        courseName: lessonBundle.courseName,
        lessonId,
        botType: session.botType || null,
        hebrewLevel: courseConfig?.hebrew_level || null,
        roleAssignment: courseConfig?.roleAssignment || null,
        facultyId: session.facultyId || null,
        active: !!session.active,
        state: {
          current_unit: lessonId,
          active_sprint: state.active_sprint || null,
          door_status: String(state.door_status || "auto").toLowerCase(),
          pushed_resource: state.pushed_resource || null,
          live_phase: state.live_phase || null,
          phase_source: state.phase_source || null,
          updatedAt: Number(state.updatedAt) || null
        },
        playlist: lessonBundle.playlist || null,
        selectedUnits: lessonBundle.selectedUnits,
        resources: lessonBundle.resources,
        sprintDefinitions: lessonBundle.sprintDefinitions,
        pacing: pacingSummary,
        activeTask: session.active_task || null,
        broadcast: session.broadcast || null,
        broadcastedAt: session.broadcastedAt || null,
        currentStep: session.currentStep || 1,
        projectStages: courseConfig?.course_units?.semester_a?.project?.stages || [],
        liveMeeting,
        speakerFocus
      });
    }

    if(action === "pacing_snapshot"){
      if(!sessionId) return err("sessionId required");
      const sessionSnap = await db.ref(`sessions/${sessionId}`).once("value");
      const session = sessionSnap.val() || null;
      if(!session) return err("session not found");
      const state = session.state || {};
      return ok({
        sessionId,
        pacing: computePacingSummary(session.pacing || {}, state.active_sprint || null)
      });
    }

    if(action === "units_list"){
      const userId = String(event.queryStringParameters?.userId || "").trim();
      const courseId = String(event.queryStringParameters?.courseId || event.queryStringParameters?.classId || "").trim();
      if(!userId) return err("userId required");
      if(!courseId) return err("courseId required");

      const snap = await db.ref(`users/${userId}/courses/${courseId}/units`).once("value");
      const unitsMap = snap.val() || {};
      return ok({
        userId,
        courseId,
        units: unitsMap
      });
    }

    if(action === "unit_get"){
      const userId = String(event.queryStringParameters?.userId || "").trim();
      const courseId = String(event.queryStringParameters?.courseId || event.queryStringParameters?.classId || "").trim();
      const unitId = normalizeUnitId(event.queryStringParameters?.unitId);
      if(!userId) return err("userId required");
      if(!courseId) return err("courseId required");

      const snap = await db.ref(getUnitPath(userId, courseId, unitId)).once("value");
      return ok({
        userId,
        courseId,
        unitId,
        unit: snap.val() || null
      });
    }

    if(action === "pre_session"){
      let classId = event.queryStringParameters?.classId || event.queryStringParameters?.courseId;
      let userId = String(event.queryStringParameters?.userId || event.queryStringParameters?.facultyId || "").trim() || null;
      let unitId = normalizeUnitId(event.queryStringParameters?.unitId);
      const requestedSessionId = event.queryStringParameters?.sessionId || null;
      const requestedStudentId = event.queryStringParameters?.studentId || null;
      let resolvedSessionId = requestedSessionId || null;
      if((!classId || !userId) && requestedSessionId){
        const sessionSnap = await db.ref(`sessions/${requestedSessionId}`).once("value");
        const sessionData = sessionSnap.val() || {};
        classId = classId || sessionData.classId || sessionData.courseId || null;
        userId = userId || sessionData.userId || sessionData.facultyId || null;
        unitId = normalizeUnitId(sessionData.unitId || unitId);
      }
      if(!classId) return err("classId required");

      if(!userId && classId){
        const activeSnap = await db.ref(`active_sessions/${classId}`).once("value");
        const activeData = activeSnap.val() || {};
        const activeSessionId = activeData?.units?.[unitId]?.sessionId || activeData?.sessionId || null;
        if(activeSessionId){
          resolvedSessionId = activeSessionId;
          const activeSessionSnap = await db.ref(`sessions/${activeSessionId}`).once("value");
          const activeSession = activeSessionSnap.val() || {};
          userId = activeSession.userId || activeSession.facultyId || null;
          unitId = normalizeUnitId(activeSession.unitId || unitId);
        }
      }

      if(!userId) userId = "shared";

      const unitPath = getUnitPath(userId, classId, unitId);

      const [unitSnap, missionSnapLegacy, ticketsSnapLegacy, warmupSnapLegacy, waitingSnapshot, courseLiveMeetingSnap, entranceTaskSnap] = await Promise.all([
        db.ref(unitPath).once("value"),
        db.ref(`pre_session_content/${classId}`).once("value"),
        db.ref(`pre_session_tickets/${classId}`).once("value"),
        db.ref(`pre_session_warmup/${classId}`).once("value"),
        getFreshWaitingSnapshot(db, classId, unitId),
        db.ref(`courses/${classId}/liveMeeting`).once("value"),
        db.ref(`classes/${classId}/features/entranceTask`).once("value")
      ]);

      const unitData = unitSnap.val() || {};
      const missionRaw = unitData?.missionData || missionSnapLegacy.val() || {};
      const mission = {
        text: missionRaw.text || null,
        videoUrl: missionRaw.videoUrl || null,
        audioDataUrl: missionRaw.audioDataUrl || null,
        updatedAt: missionRaw.updatedAt || null,
        facultyId: missionRaw.facultyId || null
      };

      const warmupRaw = unitData?.warmupData || warmupSnapLegacy.val() || null;
      const warmup = warmupRaw && warmupRaw.question ? warmupRaw : null;
      if(warmup && Array.isArray(warmup.answers)) {
        const voteStats = computeVotePercentages(warmup.votes || {}, warmup.answers.length);
        warmup.voteStats = voteStats;
      }

      let ticketsMap = unitData?.entranceTickets || {};
      if(requestedSessionId){
        const sessionTicketSnap = await db.ref(`sessions/${requestedSessionId}/entranceTickets`).once("value");
        ticketsMap = sessionTicketSnap.val() || ticketsMap;
      }
      if(!Object.keys(ticketsMap || {}).length)
        ticketsMap = ticketsSnapLegacy.val() || {};

      const entranceTicket = requestedStudentId ? (ticketsMap[requestedStudentId] || null) : null;

      return ok({
        classId,
        courseId: classId,
        userId,
        unitId,
        activeSessionId: resolvedSessionId,
        topicName: unitData?.topicName || null,
        structureType: unitData?.structureType || null,
        mission,
        warmup,
        entranceTask: entranceTaskSnap.val() || null,
        entranceTicket,
        hasEntranceTicket: !!(entranceTicket?.answer),
        waitingStudentsCount: waitingSnapshot.count,
        waitingStudents: waitingSnapshot.students,
        liveMeeting: courseLiveMeetingSnap.val() || null
      });
    }

    if(!sessionId) return err("sessionId required");

    const snap =
      await db.ref(`sessions/${sessionId}`).once("value");

    const session = snap.val();

    if(!session)
      return ok({broadcast:null,sessionActive:false});

    if(action === "dashboard" && facultyId){

      if(session.facultyId !== facultyId)
        return err("not session owner");

      // Resolve classId: prefer stored value, fall back to query param (handles legacy sessions)
      const resolvedClassId = session.classId || event.queryStringParameters?.classId || null;
      const resolvedUnitId = normalizeUnitId(session.unitId || event.queryStringParameters?.unitId);
      const resolvedUserId = session.userId || event.queryStringParameters?.userId || session.facultyId || facultyId;

      // Canonical source for cockpit student grid: merge both trees to avoid drift.
      const studentsNode = session.students || {};
      const legacyAnswersNode = session.answers || {};
      const mergedStudentIds = new Set([
        ...Object.keys(studentsNode),
        ...Object.keys(legacyAnswersNode)
      ]);
      const studentsSource = {};
      mergedStudentIds.forEach((sid) => {
        studentsSource[sid] = {
          ...(legacyAnswersNode[sid] || {}),
          ...(studentsNode[sid] || {})
        };
      });

      const botType = session.botType;
      let courseId = null;
      if (botType === "hebrew_b_research" || botType === "hebrew_b_companion") {
        courseId = session.classId || "hebrew_advanced_b_2026";
      }

      const students = await Promise.all(
        Object.entries(studentsSource).map(async ([sid, data]) => {
          const lecturerRepliesForStudent = Object.entries(
            session.students?.[sid]?.lecturer_replies || {}
          )
            .map(([id, item]) => ({
              id,
              text: item?.text || "",
              ts: item?.ts || 0,
              avatar: item?.avatar || session?.facultyAvatar || null
            }))
            .filter(item => item.text)
            .sort((a, b) => a.ts - b.ts);

          const base = {
            studentId: sid,
            name: session.students?.[sid]?.name || data.name || null,
            avatar: session.students?.[sid]?.avatar || data.avatar || null,
            steps: data.steps || {},
            state: data.state || "idle",
            status: session.students?.[sid]?.status || data.status || data.state || "idle",
            presence: session.students?.[sid]?.presence || data.presence || "offline",
            is_unread: !!(session.students?.[sid]?.is_unread || data.is_unread),
            lastUpdated: data.lastUpdated || null,
            lastSeen: data.lastSeen || null,
            lecturerReplies: lecturerRepliesForStudent
          };

          if (!courseId || sid === "anonymous") {
            return {
              ...base,
              researchStage: null,
              skillHealth: { mastery_pct: 0, hasFailure: false, failureStreak: 0, interventionFlag: false }
            };
          }

          try {
            const [researchSnap, skillsSnap] = await Promise.all([
              db.ref(`sessions/${sid}/${courseId}/research_stage`).get(),
              db.ref(`skills_mastery/${sid}/${courseId}`).get()
            ]);

            const rawStage = researchSnap.exists() ? Number(researchSnap.val()) : null;
            const researchStage = Number.isFinite(rawStage)
              ? Math.min(7, Math.max(1, rawStage))
              : null;

            const skillsData = skillsSnap.exists() ? skillsSnap.val() : {};
            let totalPct = 0;
            let skillCount = 0;
            let hasFailure = false;
            let maxFailureStreak = 0;

            Object.values(skillsData).forEach(skillData => {
              if (typeof skillData?.mastery_pct === "number") {
                totalPct += skillData.mastery_pct;
                skillCount++;
              }

              const signals = skillData?.signals ? Object.values(skillData.signals) : [];
              const ordered = signals
                .filter(sig => Number.isFinite(sig?.ts))
                .sort((a, b) => a.ts - b.ts);

              let streak = 0;
              for (const sig of ordered) {
                if (sig.score === 0) {
                  streak++;
                  hasFailure = true;
                } else {
                  streak = 0;
                }
                if (streak > maxFailureStreak) maxFailureStreak = streak;
              }
            });

            return {
              ...base,
              researchStage,
              skillHealth: {
                mastery_pct: skillCount > 0 ? Math.round(totalPct / skillCount) : 0,
                hasFailure,
                failureStreak: maxFailureStreak,
                interventionFlag: maxFailureStreak >= 3
              }
            };
          } catch (e) {
            console.error("DASHBOARD ENRICH ERROR:", e.message);
            return {
              ...base,
              researchStage: null,
              skillHealth: { mastery_pct: 0, hasFailure: false, failureStreak: 0, interventionFlag: false }
            };
          }
        })
      );

      const stats = {
        chatting:0,
        writing:0,
        submitted:0,
        idle:0
      };

      students.forEach(s=>{
        if(stats[s.state] !== undefined)
          stats[s.state]++;
      });

      const online = students.filter(s => Date.now() - (s.lastSeen || 0) < 15000).length;
      const waitingStudentsCount = resolvedClassId
        ? await getFreshWaitingCount(db, resolvedClassId, resolvedUnitId)
        : 0;
      let entranceTickets = [];

      let unitData = null;
      if(resolvedUserId && resolvedClassId && resolvedUnitId){
        const unitSnap = await db.ref(getUnitPath(resolvedUserId, resolvedClassId, resolvedUnitId)).once("value");
        unitData = unitSnap.val() || null;

        if(unitData?.entranceTickets){
          entranceTickets = Object.values(unitData.entranceTickets || {})
            .map(item => ({
              studentId: item?.studentId || null,
              name: item?.name || item?.studentName || null,
              answer: item?.answer || item?.text || "",
              submittedAt: item?.submittedAt || 0
            }))
            .filter(item => item.answer)
            .sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0))
            .slice(0, 120);
        }
      }

      if(!entranceTickets.length){
        const sessionTicketsSnap = await db.ref(`sessions/${sessionId}/entranceTickets`).once("value");
        const sessionTicketsMap = sessionTicketsSnap.val() || {};
        entranceTickets = Object.values(sessionTicketsMap)
          .map(item => ({
            studentId: item?.studentId || null,
            name: item?.name || item?.studentName || null,
            answer: item?.answer || item?.text || "",
            submittedAt: item?.submittedAt || 0
          }))
          .filter(item => item.answer)
          .sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0))
          .slice(0, 120);
      }

      // Legacy fallback for older records written only by classId.
      if (!entranceTickets.length && resolvedClassId) {
        const ticketsSnap = await db.ref(`pre_session_tickets/${resolvedClassId}`).once("value");
        const ticketsMap = ticketsSnap.val() || {};
        entranceTickets = Object.values(ticketsMap)
          .map(item => ({
            studentId: item?.studentId || null,
            name: item?.name || item?.studentName || null,
            answer: item?.answer || item?.text || "",
            submittedAt: item?.submittedAt || 0
          }))
          .filter(item => item.answer)
          .sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0))
          .slice(0, 120);
      }

      return ok({

        sessionId,
        broadcast:session.broadcast || null,
        facultyAvatar: session.facultyAvatar || null,
        recallAll: session.recall_all || null,
        currentStep:session.currentStep || 1,
        stepVersion:session.stepVersion || 0,
        lockedSteps:session.lockedSteps || [],
        students,
        onlineStudents:online,
        stateStats:stats,
        unitId: resolvedUnitId,
        topicName: unitData?.topicName || null,
        structureType: unitData?.structureType || null,
        waitingStudentsCount,
        entranceTickets

      });

    }

    if(studentId){

      const now = Date.now();
      await db.ref(`sessions/${sessionId}/answers/${studentId}/lastSeen`).set(now);
      await db.ref(`sessions/${sessionId}/students/${studentId}/lastSeen`).set(now);
      await db.ref(`sessions/${sessionId}/students/${studentId}/presence`).set("online");

    }

    const studentLocked =
      studentId &&
      (session.lockedSteps || []).includes(studentId);

    const lecturerRepliesRaw =
      session.students?.[studentId]?.lecturer_replies || {};

    const lecturerReplies = Object.entries(lecturerRepliesRaw)
      .map(([id, item]) => ({
        id,
        text: item?.text || "",
        ts: item?.ts || 0,
        facultyId: item?.facultyId || null,
        avatar: item?.avatar || session?.facultyAvatar || null
      }))
      .filter(item => item.text)
      .sort((a, b) => (a.ts || 0) - (b.ts || 0))
      .slice(-20);

    const studentStepsRaw = session.students?.[studentId]?.steps ||
                             session.answers?.[studentId]?.steps || {};
    const studentSteps = Object.entries(studentStepsRaw)
      .map(([id, item]) => ({
        id,
        content: item?.content || "",
        kind: item?.kind || "message",
        tag: item?.tag || "general",
        step: item?.step || null,
        ts: item?.submittedAt || 0,
        avatar: item?.avatar || session?.students?.[studentId]?.avatar || null
      }))
      .filter(item => item.content)
      .sort((a, b) => a.ts - b.ts);

    const publicWallRaw = session.publicWall || {};
    const publicPosts = Object.entries(publicWallRaw)
      .map(([id, item]) => ({
        id,
        studentId: item?.studentId || "?",
        content: item?.content || "",
        kind: "public",
        tag: item?.tag || "general",
        step: item?.step || null,
        ts: item?.ts || 0
      }))
      .filter(item => item.content)
      .sort((a, b) => a.ts - b.ts)
      .slice(-50);

    // Prepare clean broadcast history (remove nulls/empty, max 50 items)
    const broadcastHistory = (session?.broadcastHistory || [])
      .filter(item => item && item.text)
      .slice(-50);

    return ok({

      broadcast:session.broadcast || null,
      broadcastedAt:session.broadcastedAt || null,
      broadcastHistory:broadcastHistory,
      studentAvatar: session?.students?.[studentId]?.avatar || null,
      lecturerAvatar: session?.facultyAvatar || null,
      currentStep:session.currentStep || 1,
      stepVersion:session.stepVersion || 0,
      stepLocked:studentLocked,
      sessionActive:session.active !== false,
      lecturerReplies,
      studentSteps,
      publicPosts,
      recallAll: session.recall_all || null,
      active_task: session.active_task || null

    });

  }

  if(event.httpMethod !== "POST")
    return {
      statusCode:405,
      headers,
      body:JSON.stringify({error:"Method not allowed"})
    };

  // save_template works without an active session
  if(action === "save_template"){
    const { classId, templateName, steps, facultyId: fid } = body;
    if(!classId || !Array.isArray(steps)) return err("classId and steps[] required");
    if(!fid) return err("facultyId required");
    const templateId = "tpl_" + Date.now();
    await db.ref(`lesson_templates/${classId}/${templateId}`).set({
      name: templateName || "תבנית שיעור",
      steps,
      savedAt: Date.now(),
      facultyId: fid
    });
    return ok({ ok:true, templateId });
  }

  if(action === "waiting_ping"){
    const { classId, studentId, studentName, waiting } = body;

    if(!classId) return err("classId required");
    if(!studentId) return err("studentId required");

    const waitingRef = db.ref(`waiting_room/${classId}/${studentId}`);

    if(waiting === false){
      await waitingRef.remove();
      return ok({ ok:true, waiting:false });
    }

    await waitingRef.update({
      studentId,
      name: String(studentName || "").trim() || null,
      avatar: normalizeAvatar(body.avatar) || null,
      reaction: String(body.reaction || "").trim() || null,
      sessionId: String(body.sessionId || "").trim() || null,
      status: "waiting",
      lastSeen: Date.now()
    });

    return ok({ ok:true, waiting:true });
  }

  if(action === "pre_session_save"){
    const { classId, courseId, facultyId: fid } = body;
    const resolvedCourseId = classId || courseId || null;
    const unitId = normalizeUnitId(body.unitId);
    const userId = String(body.userId || fid || "").trim() || null;
    if(!resolvedCourseId) return err("classId required");
    if(!fid) return err("facultyId required");

    const mission = normalizePreSessionMission(body);
    if(!mission.text && !mission.videoUrl && !mission.audioDataUrl)
      return err("mission content required");

    const missionPayload = {
      ...mission,
      updatedAt: Date.now(),
      facultyId: fid
    };

    if(userId)
      await ensureUnitNode(db, { userId, courseId: resolvedCourseId, unitId, structureType: String(body.structureType || "Session"), topicName: body.topicName || "" });

    if(userId)
      await db.ref(`${getUnitPath(userId, resolvedCourseId, unitId)}/missionData`).set(missionPayload);

    await db.ref(`pre_session_content/${resolvedCourseId}`).set(missionPayload);

    // Write structured entrance task for the new gate system
    const entranceTask = buildEntranceTask(body);
    await db.ref(`classes/${resolvedCourseId}/features/entranceTask`).set(entranceTask);

    // New mission resets entrance tickets so lecturer sees fresh intent.
    await db.ref(`pre_session_tickets/${resolvedCourseId}`).remove();
    if(userId)
      await db.ref(`${getUnitPath(userId, resolvedCourseId, unitId)}/entranceTickets`).remove();

    return ok({ ok:true, classId: resolvedCourseId, unitId, userId, mission: missionPayload, entranceTask });
  }

  if(action === "pre_session_clear"){
    const { classId, courseId, facultyId: fid } = body;
    const resolvedCourseId = classId || courseId || null;
    const unitId = normalizeUnitId(body.unitId);
    const userId = String(body.userId || fid || "").trim() || null;
    if(!resolvedCourseId) return err("classId required");
    if(!fid) return err("facultyId required");

    const clearOps = [
      db.ref(`pre_session_content/${resolvedCourseId}`).remove(),
      db.ref(`pre_session_tickets/${resolvedCourseId}`).remove(),
      db.ref(`pre_session_warmup/${resolvedCourseId}`).remove(),
      db.ref(`classes/${resolvedCourseId}/features/entranceTask`).remove()
    ];
    if(userId){
      clearOps.push(db.ref(`${getUnitPath(userId, resolvedCourseId, unitId)}/missionData`).remove());
      clearOps.push(db.ref(`${getUnitPath(userId, resolvedCourseId, unitId)}/entranceTickets`).remove());
      clearOps.push(db.ref(`${getUnitPath(userId, resolvedCourseId, unitId)}/warmupData`).remove());
    }

    await Promise.all(clearOps);

    return ok({ ok:true, classId: resolvedCourseId, unitId, userId, cleared:true });
  }

  if(action === "generate_warmup"){
    const { classId, courseId, facultyId: fid } = body;
    const resolvedCourseId = classId || courseId || null;
    const unitId = normalizeUnitId(body.unitId);
    const userId = String(body.userId || fid || "").trim() || null;
    const requestedWarmupType = String(body.warmupType || "").trim().toLowerCase();
    if(!resolvedCourseId) return err("classId required");
    if(!fid) return err("facultyId required");

    const SUBJECT_MAP = {
      gerontology_mechina:         "גרונטולוגיה — הזדקנות, גיל שלישי, מדיניות סיעוד וטיפול",
      social_science_mechina_ar:   "מדעי החברה — סוציולוגיה, פסיכולוגיה חברתית, מחקר",
      academic_writing_ar:         "כתיבה אקדמית — מבנה מאמר, ציטוט, בניית טיעון",
      academic_writing_he:         "כתיבה אקדמית — מבנה מאמר, ציטוט, בניית טיעון",
      hebrew_advanced_optics:      "עברית אקדמית מתקדמת — הבנת הנקרא, כתיבה מדויקת",
      hebrew_advanced_management:  "עברית אקדמית מתקדמת — הבנת הנקרא, כתיבה מדויקת"
    };
    const subject = SUBJECT_MAP[resolvedCourseId] || "לימודים אקדמיים כלליים — מיומנויות למידה";

    const apiKey = process.env.OPENROUTER_API_KEY;
    if(!apiKey) return err("AI service unavailable");

    if(requestedWarmupType === "memory_match") {
      let topicName = String(body.topicName || "").trim();
      if(!topicName && userId){
        const unitSnap = await db.ref(getUnitPath(userId, resolvedCourseId, unitId)).once("value");
        topicName = String(unitSnap.val()?.topicName || "").trim();
      }
      const promptTopic = topicName || subject;

      const memoryPrompt = `צור משחק Memory Match לשיעור בנושא: '${promptTopic}'.
החזר אך ורק JSON תקין, ללא טקסט נוסף, במבנה:
{"type":"memory_match","title":"...","pairs":[{"term":"...","match":"..."}]}

כללים קשיחים:
- בדיוק 8 זוגות (8 items במערך pairs)
- כל זוג: term מקצועי + match (הגדרה קצרה או תרגום עברית-אנגלית)
- כל שדה term/match חייב להיות עד 40 תווים
- טקסט קצר, ברור, מתאים לכרטיס משחק
- אין כפילויות בין terms
- אין משפטים ארוכים`;

      try {
        const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://cozy-seahorse-7c5204.netlify.app",
            "X-Title": "MilEd.One"
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-001",
            messages: [{ role: "user", content: memoryPrompt }],
            temperature: 0.9,
            max_tokens: 900
          })
        });

        if(!aiRes.ok) return err("AI generation failed");

        const aiData = await aiRes.json();
        const rawContent = String(aiData?.choices?.[0]?.message?.content || "");
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if(!jsonMatch) return err("AI returned invalid format");

        let parsed;
        try { parsed = JSON.parse(jsonMatch[0]); }
        catch { return err("AI JSON parse error"); }

        const rawPairs = Array.isArray(parsed?.pairs) ? parsed.pairs : [];
        if(rawPairs.length < 8) return err("AI returned insufficient pairs");

        const pairs = rawPairs.slice(0, 8).map((item, idx) => {
          const term = clipCardText(item?.term, 40);
          const match = clipCardText(item?.match, 40);
          return {
            pairId: `p${idx + 1}`,
            term,
            match
          };
        }).filter(item => item.term && item.match);

        if(pairs.length < 8) return err("AI returned invalid pair texts");

        const warmup = {
          type: "memory_match",
          responseType: "memory_match",
          categoryKey: "memory_match",
          categoryLabel: "Memory Match",
          question: clipCardText(parsed?.title || `התאמות מושגים: ${promptTopic}`, 80),
          topicName: promptTopic,
          pairs,
          generatedAt: Date.now(),
          votes: {}
        };

        await db.ref(`pre_session_warmup/${resolvedCourseId}`).set(warmup);
        if(userId)
          await db.ref(`${getUnitPath(userId, resolvedCourseId, unitId)}/warmupData`).set(warmup);

        return ok({ ok:true, warmup });
      } catch (e) {
        console.error("generate_warmup memory_match error:", e.message);
        return err("AI generation error");
      }
    }

    const categoryLibrary = [
      {
        key: "dilemma",
        label: "Dilemmas",
        responseType: "opinion",
        instruction: "צור דילמה רגשית/אתית אמיתית מהתחום."
      },
      {
        key: "career_focus",
        label: "Career Focus",
        responseType: "opinion",
        instruction: "צור שאלה על קידום, הכנסה או החלטת קריירה בתחום."
      },
      {
        key: "linguistic_puzzle",
        label: "Linguistic Puzzles",
        responseType: "quiz",
        instruction: "צור חידת תרגום עברית-אנגלית למונח מקצועי."
      },
      {
        key: "pure_logic",
        label: "Pure Logic",
        responseType: "quiz",
        instruction: "צור חידת היגיון/תבנית קצרה, ללא תלות ישירה בתחום."
      }
    ];

    let lastCategory = null;
    if(userId){
      const unitMetaSnap = await db.ref(`${getUnitPath(userId, resolvedCourseId, unitId)}/warmupMeta`).once("value");
      lastCategory = String(unitMetaSnap.val()?.lastCategory || "").trim() || null;
    }
    if(!lastCategory){
      const legacyMetaSnap = await db.ref(`pre_session_warmup_meta/${resolvedCourseId}`).once("value");
      lastCategory = String(legacyMetaSnap.val()?.lastCategory || "").trim() || null;
    }

    const candidateCategories = categoryLibrary.filter(item => item.key !== lastCategory);
    const chosenCategory = (candidateCategories.length ? candidateCategories : categoryLibrary)[
      Math.floor(Math.random() * (candidateCategories.length || categoryLibrary.length))
    ];

    const promptText = `אתה יוצר חימום לכיתה אקדמית. נושא מקצועי: '${subject}'.

איסור מוחלט:
- לעולם אל תשאל שאלות הגדרה (כמו: "מה ההגדרה של...").
- לעולם אל תייצר שאלה טריוויאלית של זיכרון עובדות.

קטגוריה חובה לסבב זה (אסור לשנות): ${chosenCategory.key}
תיאור הקטגוריה: ${chosenCategory.instruction}
סוג תשובה חובה: ${chosenCategory.responseType}

החזר אך ורק JSON תקין וללא טקסט נוסף, במבנה:
{"categoryKey":"${chosenCategory.key}","responseType":"${chosenCategory.responseType}","question":"...","answers":["...","...","..."],"correct":0,"feedback":"..."}

כללים:
- question: שאלה חדה ומגרה עד 24 מילים
- answers: בדיוק 3 אפשרויות קצרות (עד 10 מילים)
- אם responseType הוא opinion: correct חייב להיות null
- אם responseType הוא quiz: correct חייב להיות 0/1/2
- feedback: משפט הסבר קצר שמנמק חשיבה`;

    try {
      const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://cozy-seahorse-7c5204.netlify.app",
          "X-Title": "MilEd.One"
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [{ role: "user", content: promptText }],
          temperature: 0.8,
          max_tokens: 400
        })
      });

      if(!aiRes.ok) return err("AI generation failed");

      const aiData = await aiRes.json();
      const rawContent = String(aiData?.choices?.[0]?.message?.content || "");
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if(!jsonMatch) return err("AI returned invalid format");

      let warmup;
      try { warmup = JSON.parse(jsonMatch[0]); }
      catch { return err("AI JSON parse error"); }

      if(!warmup.question || !Array.isArray(warmup.answers) || warmup.answers.length < 3)
        return err("AI returned incomplete data");

      warmup.answers = warmup.answers.slice(0, 3).map(a => String(a || "").trim());
      const responseType = String(warmup.responseType || chosenCategory.responseType || "quiz").trim().toLowerCase();
      warmup.responseType = responseType === "opinion" ? "opinion" : "quiz";
      warmup.categoryKey = chosenCategory.key;
      warmup.categoryLabel = chosenCategory.label;
      if(warmup.responseType === "opinion") warmup.correct = null;
      else warmup.correct = Math.max(0, Math.min(2, Number(warmup.correct) || 0));
      warmup.feedback = String(warmup.feedback || "").trim();
      warmup.question = String(warmup.question || "").trim();
      warmup.generatedAt = Date.now();
      warmup.votes = {};

      await db.ref(`pre_session_warmup/${resolvedCourseId}`).set(warmup);
      if(userId)
        await db.ref(`${getUnitPath(userId, resolvedCourseId, unitId)}/warmupData`).set(warmup);
      await db.ref(`pre_session_warmup_meta/${resolvedCourseId}`).set({
        lastCategory: chosenCategory.key,
        updatedAt: Date.now()
      });
      if(userId)
        await db.ref(`${getUnitPath(userId, resolvedCourseId, unitId)}/warmupMeta`).set({
          lastCategory: chosenCategory.key,
          updatedAt: Date.now()
        });
      return ok({ ok:true, warmup });

    } catch(e) {
      console.error("generate_warmup error:", e.message);
      return err("AI generation error");
    }
  }

  if(action === "warmup_vote"){
    let classId = body.classId || body.courseId || null;
    let unitId = normalizeUnitId(body.unitId);
    let userId = String(body.userId || "").trim() || null;
    let resolvedSessionId = String(body.sessionId || "").trim() || null;
    const studentId = String(body.studentId || "").trim();
    const choice = Number(body.choice);

    if(!studentId) return err("studentId required");
    if(!Number.isInteger(choice) || choice < 0 || choice > 2) return err("invalid choice");

    if(!resolvedSessionId && classId){
      const activeSnap = await db.ref(`active_sessions/${classId}`).once("value");
      const activeData = activeSnap.val() || {};
      resolvedSessionId = activeData?.units?.[unitId]?.sessionId || activeData?.sessionId || null;
    }

    if(resolvedSessionId && (!classId || !userId)){
      const sessionSnap = await db.ref(`sessions/${resolvedSessionId}`).once("value");
      const sessionData = sessionSnap.val() || {};
      classId = classId || sessionData.classId || sessionData.courseId || null;
      userId = userId || sessionData.userId || sessionData.facultyId || null;
      unitId = normalizeUnitId(sessionData.unitId || unitId);
    }

    if(!classId) return err("classId required");

    let warmupPath = `pre_session_warmup/${classId}`;
    if(userId) warmupPath = `${getUnitPath(userId, classId, unitId)}/warmupData`;

    const warmupSnap = await db.ref(warmupPath).once("value");
    let warmup = warmupSnap.val() || null;
    if(!warmup && userId){
      const legacyWarmupSnap = await db.ref(`pre_session_warmup/${classId}`).once("value");
      warmup = legacyWarmupSnap.val() || null;
      warmupPath = `pre_session_warmup/${classId}`;
    }
    if(!warmup || !Array.isArray(warmup.answers)) return err("warmup not found");

    const nextVotes = {
      ...(warmup.votes || {}),
      [studentId]: {
        studentId,
        choice,
        votedAt: Date.now()
      }
    };

    await db.ref(`${warmupPath}/votes`).set(nextVotes);
    if(userId)
      await db.ref(`pre_session_warmup/${classId}/votes`).set(nextVotes);

    const voteStats = computeVotePercentages(nextVotes, warmup.answers.length || 3);
    return ok({
      ok:true,
      choice,
      voteStats,
      responseType: String(warmup.responseType || "quiz")
    });
  }

  if(action === "entrance_ticket_submit"){
    let classId = body.classId || body.courseId || null;
    let unitId = normalizeUnitId(body.unitId);
    let userId = String(body.userId || "").trim() || null;
    const requestedSessionId = body.sessionId || null;
    let resolvedSessionId = requestedSessionId || null;
    const { studentId, studentName, answer } = body;

    if(!resolvedSessionId && classId){
      const activeSnap = await db.ref(`active_sessions/${classId}`).once("value");
      const activeData = activeSnap.val() || {};
      resolvedSessionId = activeData?.units?.[unitId]?.sessionId || activeData?.sessionId || null;
    }

    if(!classId && resolvedSessionId){
      const sessionSnap = await db.ref(`sessions/${resolvedSessionId}`).once("value");
      const sessionData = sessionSnap.val() || {};
      classId = sessionData.classId || null;
      unitId = normalizeUnitId(sessionData.unitId || unitId);
      userId = userId || sessionData.userId || sessionData.facultyId || null;
    }

    if(!classId && requestedSessionId){
      const sessionSnap = await db.ref(`sessions/${requestedSessionId}`).once("value");
      const sessionData = sessionSnap.val() || {};
      classId = sessionData.classId || null;
      unitId = normalizeUnitId(sessionData.unitId || unitId);
      userId = userId || sessionData.userId || sessionData.facultyId || null;
    }

    if(!resolvedSessionId) return err("sessionId required");
    if(!studentId) return err("studentId required");

    const normalizedAnswer = String(answer || body.text || "").trim();
    if(!normalizedAnswer) return err("answer required");
    const normalizedName = String(studentName || body.name || "").trim() || null;

    const ticketPayload = {
      studentId,
      name: normalizedName,
      studentName: normalizedName,
      answer: normalizedAnswer,
      text: normalizedAnswer,
      submittedAt: Date.now(),
      sessionId: resolvedSessionId,
      classId: classId || null
    };

    await db.ref(`sessions/${resolvedSessionId}/entranceTickets/${studentId}`).set(ticketPayload);

    if(userId && classId)
      await db.ref(`${getUnitPath(userId, classId, unitId)}/entranceTickets/${studentId}`).set(ticketPayload);

    // Keep legacy mirror for pre-session student checks keyed by classId.
    if(classId)
      await db.ref(`pre_session_tickets/${classId}/${studentId}`).set(ticketPayload);

    return ok({ ok:true, classId: classId || null, unitId, userId, sessionId: resolvedSessionId, studentId });
  }

  if(action === "unit_upsert"){
    const userId = String(body.userId || body.facultyId || "").trim();
    const courseId = String(body.courseId || body.classId || "").trim();
    const unitId = normalizeUnitId(body.unitId);
    if(!userId) return err("userId required");
    if(!courseId) return err("courseId required");

    const payload = {
      topicName: String(body.topicName || "").trim() || null,
      structureType: String(body.structureType || "Session"),
      missionData: body.missionData || null,
      entranceTickets: body.entranceTickets || null,
      updatedAt: Date.now()
    };
    if (Object.prototype.hasOwnProperty.call(body, "lessonDate")) {
      payload.lessonDate = String(body.lessonDate || "").trim() || null;
    }

    await db.ref(getUnitPath(userId, courseId, unitId)).update(payload);
    return ok({ ok:true, userId, courseId, unitId });
  }

  if(action === "course_metadata_save"){
    const courseId = String(body.courseId || body.classId || "").trim();
    if(!courseId) return err("courseId required");
    const normalizedMetadata = normalizeMoodleMetadata(body.metadataJson ?? body.metadata ?? null);
    if(!normalizedMetadata) return err("invalid metadata json");
    await db.ref(`courses/${courseId}/metadata`).set(normalizedMetadata);
    return ok({
      ok:true,
      courseId,
      metadata: normalizedMetadata
    });
  }

  if(action === "lesson_playlist_save"){
    const courseId = String(body.courseId || body.classId || "").trim();
    const lessonId = normalizeUnitId(body.lessonId || body.unitId, "unit_01");
    const unitIds = Array.isArray(body.unitIds)
      ? body.unitIds.map(id => normalizeUnitId(id)).filter(Boolean)
      : [];
    if(!courseId) return err("courseId required");
    if(!unitIds.length) return err("unitIds required");

    const payload = {
      lessonId,
      unitIds,
      updatedAt: Date.now()
    };
    await db.ref(`courses/${courseId}/playlists/${lessonId}`).set(payload);
    return ok({ ok:true, courseId, playlist: payload });
  }

  if(action === "sprint_definitions_save"){
    const courseId = String(body.courseId || body.classId || "").trim();
    const lessonId = normalizeUnitId(body.lessonId || body.unitId, "unit_01");
    const sprints = Array.isArray(body.sprints) ? body.sprints : [];
    if(!courseId) return err("courseId required");
    if(!sprints.length) return err("sprints required");

    const normalizedSprints = sprints.map((sprint, index) => ({
      id: String(sprint?.id || `sprint_${String(index + 1).padStart(2, "0")}`),
      title: String(sprint?.title || `Sprint ${index + 1}`).trim(),
      stationType: ["AI_STATION", "PHYSICAL_STATION", "PLENARY_STATION"].includes(String(sprint?.stationType || "").trim().toUpperCase())
        ? String(sprint.stationType).trim().toUpperCase()
        : "AI_STATION",
      instructions: String(sprint?.instructions || "").trim() || null,
      deepDivePrompt: String(sprint?.deepDivePrompt || "").trim() || null,
      supportHint: String(sprint?.supportHint || "").trim() || null,
      evidenceRequired: !!sprint?.evidenceRequired,
      order: index + 1
    }));

    await db.ref(`courses/${courseId}/sprintDefinitions/${lessonId}`).set({
      lessonId,
      items: normalizedSprints,
      updatedAt: Date.now()
    });

    return ok({ ok:true, courseId, lessonId, sprints: normalizedSprints });
  }

  // ─── Live Meeting: save course-level meeting info ─────────────────────────
  if(action === "meeting_save"){
    const courseId = String(body.courseId || body.classId || "").trim();
    const facultyId = String(body.facultyId || "").trim();
    if(!courseId) return err("courseId required");
    if(!facultyId) return err("facultyId required");

    const source = String(body.source || "manual").trim().toLowerCase();
    const allowedSources = ["manual", "moodle_zoom", "api_linked"];
    const normalizedSource = allowedSources.includes(source) ? source : "manual";

    const status = String(body.status || "scheduled").trim().toLowerCase();
    const allowedStatuses = ["scheduled", "live", "ended"];
    const normalizedStatus = allowedStatuses.includes(status) ? status : "scheduled";

    const joinUrl = String(body.joinUrl || "").trim();
    // Validate joinUrl is a plausible HTTPS URL if provided
    if(joinUrl && !joinUrl.startsWith("https://")) return err("joinUrl must be a valid HTTPS URL (e.g., https://zoom.us/j/...)");

    const meeting = {
      source: normalizedSource,
      title: String(body.title || "").trim() || null,
      joinUrl: joinUrl || null,
      passcode: null, // never stored; client appends to join URL if needed
      status: normalizedStatus,
      moodleActivityId: String(body.moodleActivityId || "").trim() || null,
      updatedAt: Date.now(),
      updatedBy: facultyId
    };

    await db.ref(`courses/${courseId}/liveMeeting`).set(meeting);
    console.log(`[meeting_save] courseId=${courseId} facultyId=${facultyId} status=${normalizedStatus}`);

    // Propagate to all active sessions for this course so students see the
    // change immediately via the existing lesson_payload poll, without waiting
    // for a new session to open.
    const activeMTargets = await collectActiveSessionIds(db, courseId);
    if (activeMTargets.size > 0) {
      await Promise.all([...activeMTargets].map(sid =>
        db.ref(`sessions/${sid}/liveMeetingSnapshot`).set(meeting)
      ));
      console.log(`[meeting_save] propagated to ${activeMTargets.size} active session(s) for ${courseId}`);
    }

    return ok({ ok:true, courseId, liveMeeting: meeting });
  }

  // ─── Live Meeting: publish recording URL after session ends ──────────────
  if(action === "meeting_recording_save"){
    const courseId = String(body.courseId || body.classId || "").trim();
    const facultyId = String(body.facultyId || "").trim();
    if(!courseId) return err("courseId required");
    if(!facultyId) return err("facultyId required");

    const recordingUrl = String(body.recordingUrl || "").trim();
    if(recordingUrl && !recordingUrl.startsWith("https://")) return err("recordingUrl must be a valid HTTPS URL (e.g., https://zoom.us/rec/...)");

    const recordingUnitId = String(body.unitId || "").trim() || null;
    const update = {
      recordingUrl: recordingUrl || null,
      recordingUnitId,
      status: "ended",
      recordingPublishedAt: Date.now(),
      updatedAt: Date.now(),
      updatedBy: facultyId
    };
    await db.ref(`courses/${courseId}/liveMeeting`).update(update);
    console.log(`[meeting_recording_save] courseId=${courseId} facultyId=${facultyId}`);

    // Propagate to all active sessions for this course (e.g. still-open sessions
    // where the faculty published the recording before clicking "close").
    const activeRTargets = await collectActiveSessionIds(db, courseId);
    if (activeRTargets.size > 0) {
      await Promise.all([...activeRTargets].map(sid =>
        db.ref(`sessions/${sid}/liveMeetingSnapshot`).update(update)
      ));
      console.log(`[meeting_recording_save] propagated to ${activeRTargets.size} active session(s) for ${courseId}`);
    }

    return ok({ ok:true, courseId, recordingUrl: recordingUrl || null, recordingUnitId });
  }

  if(!sessionId) return err("sessionId required");

  // ─── Speaker Focus: set or clear active speaker for a live session ────────
  if(action === "speaker_focus_set"){
    const { facultyId } = body;
    if(!facultyId) return err("facultyId required");
    const snap = await db.ref(`sessions/${sessionId}`).once("value");
    const session = snap.val() || null;
    if(!session) return err("session not found");
    if(session.facultyId !== facultyId) return err("not session owner");

    const label = String(body.label || "").trim();
    const speakerFocus = label
      ? { label, setAt: Date.now(), setBy: facultyId }
      : null;
    await db.ref(`sessions/${sessionId}/speakerFocus`).set(speakerFocus);
    console.log(`[speaker_focus_set] sessionId=${sessionId} label=${label || "(cleared)"}`);
    return ok({ ok:true, speakerFocus });
  }

  const sessionRef =
    db.ref(`sessions/${sessionId}`);

  if(action === "session_state_update"){
    const { facultyId } = body;
    if(!facultyId) return err("facultyId required");
    const snap = await sessionRef.once("value");
    const session = snap.val() || null;
    if(!session) return err("session not found");
    if(session.facultyId !== facultyId) return err("not session owner");

    const updates = {
      updatedAt: Date.now()
    };

    if(body.currentUnit !== undefined) updates.current_unit = normalizeUnitId(body.currentUnit, normalizeUnitId(session.unitId));
    if(body.activeSprint !== undefined) updates.active_sprint = String(body.activeSprint || "").trim() || null;
    if(body.doorStatus !== undefined) updates.door_status = String(body.doorStatus || "auto").trim().toLowerCase();
    if(body.lobbyMode !== undefined) updates.lobby_mode = !!body.lobbyMode;
    if(body.clearPushedResource) updates.pushed_resource = null;
    if(body.livePhase !== undefined) {
      updates.live_phase = validateLivePhase(body.livePhase);
      // Track whether the phase was set manually so push_task auto-derive is suppressed.
      updates.phase_source = updates.live_phase ? "manual" : null;
    }

    // Allow the instructor to release a manual override and re-derive the phase
    // from the currently active task's suggestedPhase.
    if(body.resetPhaseSource) {
      const derivedPhase = session.active_task?.suggestedPhase || null;
      updates.live_phase = validateLivePhase(derivedPhase);
      updates.phase_source = updates.live_phase ? "derived" : null;
    }

    await sessionRef.child("state").update(updates);
    return ok({ ok:true, state: updates });
  }

  if(action === "resource_push"){
    const { facultyId } = body;
    if(!facultyId) return err("facultyId required");
    const snap = await sessionRef.once("value");
    const session = snap.val() || null;
    if(!session) return err("session not found");
    if(session.facultyId !== facultyId) return err("not session owner");

    if(body.clear) {
      await sessionRef.child("state/pushed_resource").set(null);
      return ok({ ok:true, pushedResource:null });
    }

    const resource = body.resource || {};
    const payload = {
      id: String(resource.id || `resource_${Date.now()}`),
      title: cleanResourceTitle(resource.title || resource.originalTitle || "משאב"),
      url: String(resource.url || "").trim() || null,
      kind: inferResourceKind(resource, resource.url || ""),
      lecturerOnly: !!resource.lecturerOnly,
      unitId: normalizeUnitId(resource.unitId || session.unitId),
      pushedAt: Date.now(),
      pushedBy: facultyId
    };

    await sessionRef.child("state").update({
      pushed_resource: payload,
      updatedAt: Date.now()
    });
    return ok({ ok:true, pushedResource: payload });
  }

  if(action === "pacing_update"){
    const studentId = String(body.studentId || "").trim();
    if(!studentId) return err("studentId required");

    const snap = await sessionRef.once("value");
    const session = snap.val() || null;
    if(!session) return err("session not found");

    const pacingMap = session.pacing || {};
    const current = pacingMap[studentId] || {};
    const now = Date.now();
    const currentSprint = String(body.currentSprint || current.currentSprint || session?.state?.active_sprint || "").trim() || null;
    const eventType = String(body.eventType || "heartbeat").trim().toLowerCase();
    const completedSprints = current.completedSprints || {};
    const nextEntry = {
      studentId,
      studentName: String(body.studentName || current.studentName || current.name || "").trim() || null,
      currentSprint,
      status: "active",
      firstSeenAt: Number(current.firstSeenAt) || now,
      sprintStartedAt: Number(current.sprintStartedAt) || now,
      lastActivityAt: now,
      completedSprints,
      evidenceCount: Number(current.evidenceCount) || 0,
      pathDecision: current.pathDecision || "normal",
      guidance: current.guidance || null
    };

    if(eventType === "sprint_started") {
      nextEntry.sprintStartedAt = now;
      nextEntry.status = "in_progress";
    }

    if(eventType === "sprint_completed" && currentSprint) {
      const durationMs = Math.max(1000, now - (Number(current.sprintStartedAt) || now));
      completedSprints[currentSprint] = {
        completedAt: now,
        durationMs
      };
      nextEntry.completedSprints = completedSprints;
      nextEntry.status = "completed_sprint";
      nextEntry.sprintStartedAt = now;

      const cohortDurations = Object.values(pacingMap).map(item => Number(item?.completedSprints?.[currentSprint]?.durationMs) || 0).filter(Boolean);
      const avgDuration = cohortDurations.length
        ? cohortDurations.reduce((sum, item) => sum + item, 0) / cohortDurations.length
        : 0;

      if(avgDuration && durationMs < avgDuration * 0.7) {
        nextEntry.pathDecision = "fast";
        nextEntry.guidance = "Deep Dive: עצור לרפלקציה עמוקה והסבר את התהליך שבחרת.";
      } else {
        nextEntry.pathDecision = "normal";
        nextEntry.guidance = null;
      }
    }

    if(eventType === "heartbeat") {
      const activeDuration = Math.max(0, now - (Number(current.sprintStartedAt) || now));
      const cohortDurations = currentSprint
        ? Object.values(pacingMap).map(item => Number(item?.completedSprints?.[currentSprint]?.durationMs) || 0).filter(Boolean)
        : [];
      const avgDuration = cohortDurations.length
        ? cohortDurations.reduce((sum, item) => sum + item, 0) / cohortDurations.length
        : 0;
      const isSupport = activeDuration > 8 * 60 * 1000 || (avgDuration && activeDuration > avgDuration * 1.3);
      if(isSupport) {
        nextEntry.pathDecision = "support";
        nextEntry.guidance = "Support Path: פרק את המשימה למיקרו-שלבים ובדוק רמז אחד בכל פעם.";
        nextEntry.status = "stuck";
      }
    }

    await sessionRef.child(`pacing/${studentId}`).set(nextEntry);
    return ok({
      ok:true,
      pacing: nextEntry,
      summary: computePacingSummary({ ...pacingMap, [studentId]: nextEntry }, session?.state?.active_sprint || currentSprint || null)
    });
  }

  if(action === "evidence_submit"){
    const studentId = String(body.studentId || "").trim();
    const sprintId = String(body.sprintId || body.currentSprint || "").trim();
    const text = String(body.text || "").trim();
    const imageDataUrl = String(body.imageDataUrl || "").trim();
    if(!studentId) return err("studentId required");
    if(!sprintId) return err("sprintId required");
    if(!text && !imageDataUrl) return err("evidence required");

    const payload = {
      studentId,
      studentName: String(body.studentName || "").trim() || null,
      sprintId,
      text: text || null,
      imageDataUrl: imageDataUrl.startsWith("data:image/") ? imageDataUrl : null,
      submittedAt: Date.now()
    };

    await sessionRef.child(`evidence/${studentId}`).push(payload);
    const pacingSnap = await sessionRef.child(`pacing/${studentId}`).once("value");
    const pacing = pacingSnap.val() || {};
    await sessionRef.child(`pacing/${studentId}`).update({
      studentId,
      studentName: payload.studentName || pacing.studentName || null,
      currentSprint: sprintId,
      evidenceCount: (Number(pacing.evidenceCount) || 0) + 1,
      lastActivityAt: Date.now(),
      status: "evidence_submitted"
    });

    return ok({ ok:true, evidence: payload, unlocked:true });
  }

  if(action === "open"){

    const { facultyId, botType, classId, courseId, broadcast } = body;
    const resolvedCourseId = classId || courseId || null;
    const unitId = normalizeUnitId(body.unitId);
    const userId = String(body.userId || facultyId || "").trim() || null;
    const topicName = String(body.topicName || "").trim() || null;
    const structureType = String(body.structureType || "Session");

    if(!facultyId) return err("facultyId required");

    const existing =
      await sessionRef.once("value");

    if(existing.exists())
      return err("session already exists");

    // Snapshot the current live meeting at session-open time so that
    // course-level changes during an active session don't confuse students.
    let liveMeetingSnapshot = null;
    if(resolvedCourseId){
      const lmSnap = await db.ref(`courses/${resolvedCourseId}/liveMeeting`).once("value");
      liveMeetingSnapshot = lmSnap.val() || null;
    }

    await sessionRef.set({

      facultyId,
      userId: userId || null,
      botType:botType || null,
      classId:resolvedCourseId || null,
      courseId:resolvedCourseId || null,
      unitId,
      facultyAvatar: normalizeAvatar(body.facultyAvatar),
      broadcast:broadcast || null,
      broadcastedAt:broadcast ? Date.now() : null,
      currentStep:1,
      stepVersion:0,
      lockedSteps:[],
      state: {
        current_unit: unitId,
        active_sprint: null,
        door_status: resolvedCourseId ? "auto" : "open",
        pushed_resource: null,
        updatedAt: Date.now()
      },
      pacing: {},
      active:true,
      openedAt:Date.now(),
      answers:{},
      liveMeetingSnapshot

    });

    // Write index so students can auto-discover the session by courseId
    if (resolvedCourseId) {
      await db.ref(`active_sessions/${resolvedCourseId}`).update({
        sessionId,
        openedAt: Date.now(),
        [`units/${unitId}/sessionId`]: sessionId,
        [`units/${unitId}/openedAt`]: Date.now()
      });

      if(userId){
        await ensureUnitNode(db, { userId, courseId: resolvedCourseId, unitId, structureType, topicName: topicName || "" });
      }
    }

    return ok({ok:true,action:"open",sessionId});

  }

  const snap =
    await sessionRef.once("value");

  const session = snap.val() || {};

  const facultyId = body.facultyId;

  const teacherActions =
    ["broadcast","lock","unlock","close","set_step","lecturer_reply","push_task","export_session"];

  if(teacherActions.includes(action)){

    if(!facultyId) return err("facultyId required");

    if(session.facultyId !== facultyId)
      return err("not session owner");

  }

  if(action === "set_step"){

    const step = Number(body.step);

    if(!Number.isFinite(step))
      return err("invalid step");

    const versionSnap =
      await sessionRef.child("stepVersion")
      .transaction(v => (typeof v === "number" ? v+1 : 1));

    const stepVersion =
      versionSnap.snapshot.val();

    await sessionRef.update({

      currentStep:step,
      stepVersion,
      stepUpdatedAt:Date.now()

    });

    return ok({ok:true,step,stepVersion});

  }

  if(action === "broadcast"){

    const { text, step } = body;

    if(!text) return err("text required");

    const now = Date.now();
    const update = {
      broadcast:text,
      broadcastedAt:now
    };

    if(step !== undefined)
      update.currentStep = step;

    // Track broadcast in history (max 50 items)
    const currentHistory = (session?.broadcastHistory || []);
    const newHistory = [...currentHistory, {
      text,
      ts: now,
      kind: text.startsWith('data:') ? (text.startsWith('data:audio/') ? 'audio' : 'file') : 'text',
      avatar: normalizeAvatar(body.facultyAvatar) || session?.facultyAvatar || null
    }];
    if(newHistory.length > 50) newHistory.shift();
    update.broadcastHistory = newHistory;
    update.facultyAvatar = normalizeAvatar(body.facultyAvatar) || session?.facultyAvatar || null;

    await sessionRef.update(update);

    return ok({ok:true,action:"broadcast"});

  }

  if(action === "lock"){

    const { studentId } = body;

    if(!studentId)
      return err("studentId required");

    const locked =
      [...new Set([...(session.lockedSteps || []),studentId])];

    await sessionRef.update({lockedSteps:locked});

    return ok({ok:true});

  }

  if(action === "unlock"){

    const { studentId } = body;

    if(!studentId)
      return err("studentId required");

    const locked =
      (session.lockedSteps || [])
      .filter(id => id !== studentId);

    await sessionRef.update({lockedSteps:locked});

    return ok({ok:true});

  }

  if(action === "submit"){

    const { studentId, step, content, type } = body;

    if(!studentId)
      return err("studentId required");

    if(!content)
      return err("content required");

    const stepNum = Number(step) || 1;
    const kind = type === "message" ? "message"
      : type === "audio"  ? "audio"
      : type === "public" ? "public"
      : "submission";
    const now = Date.now();
    const VALID_TAGS = ["research", "task", "general"];
    const tag = VALID_TAGS.includes(body.tag) ? body.tag : "general";
    const entry = {

      step:stepNum,
      content,
      kind,
      tag,
      avatar: normalizeAvatar(body.avatar),
      submittedAt:now

    };

    const answerEntryRef = db.ref(
      `sessions/${sessionId}/answers/${studentId}/steps`
    ).push();

    const studentEntryRef = db.ref(
      `sessions/${sessionId}/students/${studentId}/steps`
    ).push();

    await answerEntryRef.set(entry);

    await db.ref(
      `sessions/${sessionId}/answers/${studentId}/state`
    ).set((kind === "message" || kind === "audio" || kind === "public") ? "chatting" : "submitted");

    await db.ref(
      `sessions/${sessionId}/answers/${studentId}/lastUpdated`
    ).set(now);

    // Mirror for cockpit consumers reading sessions/{sessionId}/students
    await studentEntryRef.set(entry);

    await db.ref(
      `sessions/${sessionId}/students/${studentId}/state`
    ).set((kind === "message" || kind === "audio" || kind === "public") ? "chatting" : "submitted");

    await db.ref(
      `sessions/${sessionId}/students/${studentId}/lastUpdated`
    ).set(now);

    if (normalizeAvatar(body.avatar)) {
      await db.ref(`sessions/${sessionId}/students/${studentId}/avatar`).set(normalizeAvatar(body.avatar));
      await db.ref(`sessions/${sessionId}/answers/${studentId}/avatar`).set(normalizeAvatar(body.avatar));
    }

    await db.ref(
      `sessions/${sessionId}/students/${studentId}/is_unread`
    ).set(true);

    // Public posts also fan-out to the shared wall so all students can read them
    if (kind === "public") {
      await db.ref(`sessions/${sessionId}/publicWall`).push({
        studentId, content, kind: "public", tag, step: stepNum, ts: now
      });
    }

    return ok({ok:true,step:stepNum});

  }

  if(action === "state"){

    const { studentId, state } = body;

    if(!studentId) return err("studentId required");
    if(!state) return err("state required");

    await db.ref(
      `sessions/${sessionId}/answers/${studentId}/state`
    ).set(state);

    await db.ref(
      `sessions/${sessionId}/answers/${studentId}/lastSeen`
    ).set(Date.now());

    await db.ref(
      `sessions/${sessionId}/students/${studentId}/state`
    ).set(state);

    await db.ref(
      `sessions/${sessionId}/students/${studentId}/lastSeen`
    ).set(Date.now());

    return ok({ok:true,state});

  }

  if(action === "lecturer_reply"){

    const { studentId, text } = body;

    if(!studentId) return err("studentId required");
    if(!text || !String(text).trim()) return err("text required");

    await db.ref(
      `sessions/${sessionId}/students/${studentId}/lecturer_replies`
    ).push({

      text:String(text).trim(),
      ts:Date.now(),
      facultyId,
      avatar: normalizeAvatar(body.facultyAvatar) || session?.facultyAvatar || null

    });

    await db.ref(
      `sessions/${sessionId}/students/${studentId}/is_unread`
    ).set(false);

    return ok({ok:true});

  }

  if(action === "join"){

    const { studentId, studentName, status } = body;

    if(!studentId) return err("studentId required");

    const now = Date.now();
    const normalizedName = String(studentName || "").trim();
    const normalizedStatus = String(status || "online").trim() || "online";

    await db.ref(
      `sessions/${sessionId}/answers/${studentId}`
    ).transaction(current => {

      if(current) return current;

      return {

        steps:{},
        joinedAt:now,
        lastUpdated:now,
        lastSeen:now,
        state:"idle"

      };

    });

    await db.ref(
      `sessions/${sessionId}/students/${studentId}`
    ).transaction(current => {

      if(current) return current;

      return {

        steps:{},
        joinedAt:now,
        lastUpdated:now,
        lastSeen:now,
        state:"idle"

      };

    });

    await db.ref(`sessions/${sessionId}/students/${studentId}`).update({
      name: normalizedName || null,
      avatar: normalizeAvatar(body.avatar) || session?.students?.[studentId]?.avatar || null,
      status: normalizedStatus,
      presence: "online",
      is_unread: false,
      lastSeen: now,
      lastUpdated: now
    });

    await db.ref(`sessions/${sessionId}/answers/${studentId}/lastSeen`).set(now);

    return ok({ok:true});

  }

  if(action === "close"){

    await sessionRef.update({

      active:false,
      state: {
        ...(session.state || {}),
        door_status:"closed",
        updatedAt:Date.now()
      },
      closedAt:Date.now()

    });

    // Remove the active-session index so students no longer auto-join
    if (session.classId) {
      const activeRef = db.ref(`active_sessions/${session.classId}`);
      const activeSnap = await activeRef.once("value");
      const activeData = activeSnap.val() || {};
      const sessionUnitId = normalizeUnitId(session.unitId || "");

      if(sessionUnitId && activeData?.units?.[sessionUnitId]?.sessionId === sessionId){
        await activeRef.child(`units/${sessionUnitId}`).remove();
      }

      if(activeData?.sessionId === sessionId){
        await activeRef.child("sessionId").remove();
        await activeRef.child("openedAt").remove();
      }

      const activeAfterSnap = await activeRef.once("value");
      const activeAfter = activeAfterSnap.val() || {};
      const hasUnits = activeAfter.units && Object.keys(activeAfter.units).length;
      const hasRootSession = !!activeAfter.sessionId;
      if(!hasUnits && !hasRootSession){
        await activeRef.remove();
      }
    }

    return ok({ok:true});

  }

  if(action === "push_task"){

    const { title, instructions, step } = body;
    if(!title) return err("title required");
    const now = Date.now();
    const taskData = {
      title,
      instructions: instructions || "",
      step: step || 1,
      suggestedPhase: validateLivePhase(body.suggestedPhase),
      pushedAt: now
    };
    await sessionRef.update({ active_task: taskData });
    // Auto-derive live_phase from suggestedPhase unless the instructor has set
    // a manual override (phase_source === "manual").
    const currentPhaseSource = session.state?.phase_source || null;
    if(taskData.suggestedPhase && currentPhaseSource !== "manual") {
      await sessionRef.child("state").update({
        live_phase: taskData.suggestedPhase,
        phase_source: "derived",
        updatedAt: now
      });
    }
    // log for export journal
    await db.ref(`sessions/${sessionId}/task_log`).push({ ...taskData, facultyId });
    return ok({ ok:true });

  }

  if(action === "gate_open_all"){

    if(!sessionId) return err("sessionId required");
    const snap = await sessionRef.once("value");
    const session = snap.val();
    if(!session) return err("session not found");
    if(session.facultyId !== facultyId) return err("not session owner");

    const studentIds = Object.keys(session.students || {});
    const updates = {};
    studentIds.forEach(studentId => {
      updates[`sessions/${sessionId}/students/${studentId}/is_locked`] = false;
    });
    updates[`sessions/${sessionId}/active_task`] = {
      title: "שלב פתוח לכל הכיתה",
      instructions: "ניתן להמשיך בעבודה",
      step: 1,
      gateBroadcastAt: Date.now()
    };
    updates[`sessions/${sessionId}/state/door_status`] = "open";
    updates[`sessions/${sessionId}/state/updatedAt`] = Date.now();
    
    await db.ref().update(updates);
    return ok({ ok: true });

  }

  if(action === "gate_lock_all"){

    if(!sessionId) return err("sessionId required");
    const snap = await sessionRef.once("value");
    const session = snap.val();
    if(!session) return err("session not found");
    if(session.facultyId !== facultyId) return err("not session owner");

    const studentIds = Object.keys(session.students || {});
    const updates = {};
    studentIds.forEach(studentId => {
      updates[`sessions/${sessionId}/students/${studentId}/is_locked`] = true;
    });
    updates[`sessions/${sessionId}/active_task`] = {
      title: "שלב נעול",
      instructions: "המתן להנחיה מהמרצה",
      step: 1,
      gateBroadcastAt: Date.now()
    };
    
    await db.ref().update(updates);
    return ok({ ok: true });

  }

  if(action === "recall_all"){

    if(!sessionId) return err("sessionId required");
    const snap = await sessionRef.once("value");
    const session = snap.val();
    if(!session) return err("session not found");
    if(session.facultyId !== facultyId) return err("not session owner");

    const recallPayload = {
      id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      active: true,
      message: String(body.message || "חזרו עכשיו לשיעור").trim(),
      triggeredAt: Date.now(),
      triggeredBy: facultyId || null,
      acks: {}
    };
    await sessionRef.update({ recall_all: recallPayload });
    return ok({ ok: true, recallAll: recallPayload });

  }

  if(action === "recall_ack"){

    const recallId = String(body.recallId || "").trim();
    if(!sessionId) return err("sessionId required");
    if(!studentId) return err("studentId required");
    if(!recallId) return err("recallId required");

    await db.ref(`sessions/${sessionId}/recall_all/acks/${studentId}`).set({
      recallId,
      at: Date.now()
    });
    return ok({ ok: true, recallId, studentId });

  }

  // ─── Peer Review ──────────────────────────────────────────────────────────
  if(action === "peer_review"){

    const { classId: reviewClassId, activityId, rubricId, scores, emoji, comment } = body;
    const reviewStudentId = String(body.studentId || "").trim();
    const resolvedClassId = String(reviewClassId || body.courseId || "").trim();

    if(!resolvedClassId) return err("classId required");
    if(!reviewStudentId)  return err("studentId required");

    const actId  = String(activityId || "default").trim();
    const now    = Date.now();

    const review = {
      reviewerId:  reviewStudentId,
      rubricId:    String(rubricId || "default").trim(),
      scores:      (scores && typeof scores === "object" && !Array.isArray(scores)) ? scores : {},
      emoji:       Array.isArray(emoji) ? emoji.slice(0, 5) : [],
      comment:     String(comment || "").trim().slice(0, 500),
      submittedAt: now
    };

    await db.ref(`submissions/${resolvedClassId}/${actId}/${reviewStudentId}/peer_reviews`).push(review);
    await db.ref(`submissions/${resolvedClassId}/${actId}/${reviewStudentId}/peer_review_ready`).set(false);

    return ok({ ok: true });

  }

  // ── peer_responses — returns anonymised submissions from classmates ─────────
  if(action === "peer_responses"){

    if(!sessionId) return err("sessionId required");
    const reqStudentId = String(params.studentId || body?.studentId || "").trim();

    const answersSnap = await db.ref(`sessions/${sessionId}/answers`).once("value");
    const answers = answersSnap.val() || {};

    const pool = [];
    for(const [sid, data] of Object.entries(answers)){
      if(sid === reqStudentId) continue; // exclude own submission
      const steps = data.steps ? Object.values(data.steps) : [];
      const submission = steps.find(s => s.kind === "submission" && s.content);
      if(submission) pool.push(String(submission.content).slice(0, 400));
    }

    // Shuffle and return up to 3 anonymous responses
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 3);
    return ok({ responses: shuffled });

  }

  if(action === "export_session"){

    const [taskLogSnap, studentsSnap] = await Promise.all([
      db.ref(`sessions/${sessionId}/task_log`).once("value"),
      db.ref(`sessions/${sessionId}/students`).once("value")
    ]);
    const taskLog = Object.values(taskLogSnap.val() || {})
      .sort((a,b) => (a.pushedAt||0) - (b.pushedAt||0));
    const studentsData = studentsSnap.val() || {};
    const studentResponses = Object.entries(studentsData)
      .flatMap(([sid, sdata]) =>
        Object.values(sdata.steps || {}).map(s => ({ ...s, studentId: sid }))
      )
      .sort((a,b) => (a.submittedAt||0) - (b.submittedAt||0));
    return ok({
      sessionId,
      exportedAt: Date.now(),
      session: {
        classId: session.classId || null,
        openedAt: session.openedAt || null,
        closedAt: session.closedAt || null
      },
      taskLog,
      studentResponses
    });

  }

  return err(`Unknown action: ${action}`);

}
