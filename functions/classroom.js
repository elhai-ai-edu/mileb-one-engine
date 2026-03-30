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

    if(action === "pre_session"){
      let classId = event.queryStringParameters?.classId;
      const requestedSessionId = event.queryStringParameters?.sessionId || null;
      const requestedStudentId = event.queryStringParameters?.studentId || null;
      if(!classId && requestedSessionId){
        const sessionSnap = await db.ref(`sessions/${requestedSessionId}`).once("value");
        const sessionData = sessionSnap.val() || {};
        classId = sessionData.classId || null;
      }
      if(!classId) return err("classId required");

      const [missionSnap, ticketsSnap, waitingSnapshot] = await Promise.all([
        db.ref(`pre_session_content/${classId}`).once("value"),
        db.ref(`pre_session_tickets/${classId}`).once("value"),
        getFreshWaitingSnapshot(db, classId)
      ]);

      const missionRaw = missionSnap.val() || {};
      const mission = {
        text: missionRaw.text || null,
        videoUrl: missionRaw.videoUrl || null,
        audioDataUrl: missionRaw.audioDataUrl || null,
        updatedAt: missionRaw.updatedAt || null,
        facultyId: missionRaw.facultyId || null
      };

      const ticketsMap = ticketsSnap.val() || {};
      const entranceTicket = requestedStudentId ? (ticketsMap[requestedStudentId] || null) : null;

      return ok({
        classId,
        mission,
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
      const waitingStudentsCount = session.classId
        ? await getFreshWaitingCount(db, session.classId)
        : 0;
      let entranceTickets = [];

      if (session.classId) {
        const ticketsSnap = await db.ref(`pre_session_tickets/${session.classId}`).once("value");
        const ticketsMap = ticketsSnap.val() || {};
        entranceTickets = Object.values(ticketsMap)
          .map(item => ({
            studentId: item?.studentId || null,
            name: item?.name || null,
            answer: item?.answer || "",
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
    const { classId, facultyId: fid } = body;
    if(!classId) return err("classId required");
    if(!fid) return err("facultyId required");

    const mission = normalizePreSessionMission(body);
    if(!mission.text && !mission.videoUrl && !mission.audioDataUrl)
      return err("mission content required");

    await db.ref(`pre_session_content/${classId}`).set({
      ...mission,
      updatedAt: Date.now(),
      facultyId: fid
    });

    // New mission resets entrance tickets so lecturer sees fresh intent.
    await db.ref(`pre_session_tickets/${classId}`).remove();

    return ok({ ok:true, classId, mission });
  }

  if(action === "pre_session_clear"){
    const { classId, facultyId: fid } = body;
    if(!classId) return err("classId required");
    if(!fid) return err("facultyId required");

    await Promise.all([
      db.ref(`pre_session_content/${classId}`).remove(),
      db.ref(`pre_session_tickets/${classId}`).remove()
    ]);

    return ok({ ok:true, classId, cleared:true });
  }

  if(action === "entrance_ticket_submit"){
    let classId = body.classId;
    const requestedSessionId = body.sessionId || null;
    const { studentId, studentName, answer } = body;
    if(!classId && requestedSessionId){
      const sessionSnap = await db.ref(`sessions/${requestedSessionId}`).once("value");
      const sessionData = sessionSnap.val() || {};
      classId = sessionData.classId || null;
    }
    if(!classId) return err("classId required");
    if(!studentId) return err("studentId required");

    const normalizedAnswer = String(answer || "").trim();
    if(!normalizedAnswer) return err("answer required");

    await db.ref(`pre_session_tickets/${classId}/${studentId}`).set({
      studentId,
      name: String(studentName || "").trim() || null,
      answer: normalizedAnswer,
      submittedAt: Date.now()
    });

    return ok({ ok:true, classId, studentId });
  }

  if(!sessionId) return err("sessionId required");

  const sessionRef =
    db.ref(`sessions/${sessionId}`);

  if(action === "open"){

    const { facultyId, botType, classId, broadcast } = body;

    if(!facultyId) return err("facultyId required");

    const existing =
      await sessionRef.once("value");

    if(existing.exists())
      return err("session already exists");

    await sessionRef.set({

      facultyId,
      botType:botType || null,
      classId:classId || null,
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
    if (classId) {
      await db.ref(`active_sessions/${classId}`).set({
        sessionId,
        openedAt: Date.now()
      });
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
      await db.ref(`active_sessions/${session.classId}`).remove();
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
