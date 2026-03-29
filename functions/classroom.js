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

    if(!sessionId) return err("sessionId required");

    const snap =
      await db.ref(`sessions/${sessionId}`).once("value");

    const session = snap.val();

    if(!session)
      return ok({broadcast:null,sessionActive:false});

    if(action === "dashboard" && facultyId){

      if(session.facultyId !== facultyId)
        return err("not session owner");

      const answers = {
        ...(session.answers || {}),
        ...(session.students || {})
      };

      const botType = session.botType;
      let courseId = null;
      if (botType === "hebrew_b_research" || botType === "hebrew_b_companion") {
        courseId = session.classId || "hebrew_advanced_b_2026";
      }

      const students = await Promise.all(
        Object.entries(answers).map(async ([sid, data]) => {
          const lecturerRepliesForStudent = Object.entries(
            session.students?.[sid]?.lecturer_replies || {}
          )
            .map(([id, item]) => ({ id, text: item?.text || "", ts: item?.ts || 0 }))
            .filter(item => item.text)
            .sort((a, b) => a.ts - b.ts);

          const base = {
            studentId: sid,
            steps: data.steps || {},
            state: data.state || "idle",
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

      const online =
        students.filter(s =>
          Date.now() - (s.lastSeen || 0) < 15000
        ).length;

      return ok({

        sessionId,
        broadcast:session.broadcast || null,
        currentStep:session.currentStep || 1,
        stepVersion:session.stepVersion || 0,
        lockedSteps:session.lockedSteps || [],
        students,
        onlineStudents:online,
        stateStats:stats

      });

    }

    if(studentId){

      await db.ref(
        `sessions/${sessionId}/answers/${studentId}/lastSeen`
      ).set(Date.now());

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
        facultyId: item?.facultyId || null
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
        ts: item?.submittedAt || 0
      }))
      .filter(item => item.content)
      .sort((a, b) => a.ts - b.ts);

    return ok({

      broadcast:session.broadcast || null,
      broadcastedAt:session.broadcastedAt || null,
      currentStep:session.currentStep || 1,
      stepVersion:session.stepVersion || 0,
      stepLocked:studentLocked,
      sessionActive:session.active !== false,
      lecturerReplies,
      studentSteps

    });

  }

  if(event.httpMethod !== "POST")
    return {
      statusCode:405,
      headers,
      body:JSON.stringify({error:"Method not allowed"})
    };

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
    ["broadcast","lock","unlock","close","set_step","lecturer_reply"];

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

    const update = {

      broadcast:text,
      broadcastedAt:Date.now()

    };

    if(step !== undefined)
      update.currentStep = step;

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
    const kind = type === "message" ? "message" : "submission";
    const now = Date.now();
    const VALID_TAGS = ["research", "task", "general"];
    const tag = VALID_TAGS.includes(body.tag) ? body.tag : "general";
    const entry = {

      step:stepNum,
      content,
      kind,
      tag,
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
    ).set(kind === "message" ? "chatting" : "submitted");

    await db.ref(
      `sessions/${sessionId}/answers/${studentId}/lastUpdated`
    ).set(now);

    // Mirror for cockpit consumers reading sessions/{sessionId}/students
    await studentEntryRef.set(entry);

    await db.ref(
      `sessions/${sessionId}/students/${studentId}/state`
    ).set(kind === "message" ? "chatting" : "submitted");

    await db.ref(
      `sessions/${sessionId}/students/${studentId}/lastUpdated`
    ).set(now);

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
      facultyId

    });

    return ok({ok:true});

  }

  if(action === "join"){

    const { studentId } = body;

    if(!studentId) return err("studentId required");

    await db.ref(
      `sessions/${sessionId}/answers/${studentId}`
    ).transaction(current => {

      if(current) return current;

      return {

        steps:{},
        joinedAt:Date.now(),
        lastUpdated:Date.now(),
        lastSeen:Date.now(),
        state:"idle"

      };

    });

    await db.ref(
      `sessions/${sessionId}/students/${studentId}`
    ).transaction(current => {

      if(current) return current;

      return {

        steps:{},
        joinedAt:Date.now(),
        lastUpdated:Date.now(),
        lastSeen:Date.now(),
        state:"idle"

      };

    });

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

  return err(`Unknown action: ${action}`);

}
