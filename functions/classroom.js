// netlify/functions/classroom.js — MilEd.One

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

function getDB() {

  if (!getApps().length) {

    const serviceAccount =
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DB_URL
    });

  }

  return getDatabase();

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

function normalizeUnitId(value, fallback = "unit_01") {
  const unit = String(value || "").trim();
  return unit || fallback;
}

function getUnitPath(userId, courseId, unitId) {
  return `users/${userId}/courses/${courseId}/units/${unitId}`;
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

async function getFreshWaitingSnapshot(db, classId){
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

async function getFreshWaitingCount(db, classId){
  const snapshot = await getFreshWaitingSnapshot(db, classId);
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
      if(!classId) return err("classId required");
      const waitingSnapshot = await getFreshWaitingSnapshot(db, classId);
      return ok({
        classId,
        waitingStudentsCount: waitingSnapshot.count,
        waitingStudents: waitingSnapshot.students
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
          const activeSessionSnap = await db.ref(`sessions/${activeSessionId}`).once("value");
          const activeSession = activeSessionSnap.val() || {};
          userId = activeSession.userId || activeSession.facultyId || null;
          unitId = normalizeUnitId(activeSession.unitId || unitId);
        }
      }

      if(!userId) userId = "shared";

      const unitPath = getUnitPath(userId, classId, unitId);

      const [unitSnap, missionSnapLegacy, ticketsSnapLegacy, warmupSnapLegacy, waitingSnapshot] = await Promise.all([
        db.ref(unitPath).once("value"),
        db.ref(`pre_session_content/${classId}`).once("value"),
        db.ref(`pre_session_tickets/${classId}`).once("value"),
        db.ref(`pre_session_warmup/${classId}`).once("value"),
        getFreshWaitingSnapshot(db, classId)
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
        topicName: unitData?.topicName || null,
        structureType: unitData?.structureType || null,
        mission,
        warmup,
        entranceTicket,
        hasEntranceTicket: !!(entranceTicket?.answer),
        waitingStudentsCount: waitingSnapshot.count,
        waitingStudents: waitingSnapshot.students
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
        ? await getFreshWaitingCount(db, resolvedClassId)
        : 0;
      let entranceTickets = [];

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

      let unitData = null;
      if(resolvedUserId && resolvedClassId && resolvedUnitId){
        const unitSnap = await db.ref(getUnitPath(resolvedUserId, resolvedClassId, resolvedUnitId)).once("value");
        unitData = unitSnap.val() || null;

        if(!entranceTickets.length && unitData?.entranceTickets){
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

    // New mission resets entrance tickets so lecturer sees fresh intent.
    await db.ref(`pre_session_tickets/${resolvedCourseId}`).remove();
    if(userId)
      await db.ref(`${getUnitPath(userId, resolvedCourseId, unitId)}/entranceTickets`).remove();

    return ok({ ok:true, classId: resolvedCourseId, unitId, userId, mission: missionPayload });
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
      db.ref(`pre_session_warmup/${resolvedCourseId}`).remove()
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

    const promptText = `אתה עוזר פדגוגי. צור שאלת חימום קצרה וממוקדת בנושא: '${subject}'.
ענה אך ורק ב-JSON תקין, ללא טקסט נוסף, בפורמט הבא:
{"question":"...","answers":["...","...","..."],"correct":0,"feedback":"..."}

כללים:
- question: שאלה קצרה בעברית, עד 20 מילה
- answers: בדיוק 3 תשובות קצרות בעברית (לא יותר מ-8 מילה כל אחת)
- correct: האינדקס של התשובה הנכונה (0, 1 או 2)
- feedback: משפט הסבר קצר על התשובה הנכונה (עד 20 מילה)`;

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
      warmup.correct = Math.max(0, Math.min(2, Number(warmup.correct) || 0));
      warmup.feedback = String(warmup.feedback || "").trim();
      warmup.question = String(warmup.question || "").trim();
      warmup.generatedAt = Date.now();

      await db.ref(`pre_session_warmup/${resolvedCourseId}`).set(warmup);
      if(userId)
        await db.ref(`${getUnitPath(userId, resolvedCourseId, unitId)}/warmupData`).set(warmup);
      return ok({ ok:true, warmup });

    } catch(e) {
      console.error("generate_warmup error:", e.message);
      return err("AI generation error");
    }
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

    await db.ref(getUnitPath(userId, courseId, unitId)).update(payload);
    return ok({ ok:true, userId, courseId, unitId });
  }

  if(!sessionId) return err("sessionId required");

  const sessionRef =
    db.ref(`sessions/${sessionId}`);

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
      active:true,
      openedAt:Date.now(),
      answers:{}

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
      pushedAt: now
    };
    await sessionRef.update({ active_task: taskData });
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
