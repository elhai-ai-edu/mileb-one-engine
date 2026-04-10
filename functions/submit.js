// netlify/functions/submit.js — MilEd.One
// Stores student submissions (assignments / artifacts)

import { getDatabase } from "firebase-admin/database";
import { ensureFirebaseAdminApp } from "./firebase-admin.js";


// ─────────────────────────────────────────
// FIREBASE INIT
// ─────────────────────────────────────────

function getDB(){
  return getDatabase(ensureFirebaseAdminApp());

}


// ─────────────────────────────────────────
// HEADERS
// ─────────────────────────────────────────

const headers = {

  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"Content-Type",
  "Access-Control-Allow-Methods":"POST, OPTIONS",
  "Content-Type":"application/json"

};


// ─────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────

export async function handler(event){

  if(event.httpMethod === "OPTIONS"){
    return { statusCode:200, headers, body:"" };
  }

  if(event.httpMethod !== "POST"){
    return {
      statusCode:405,
      headers,
      body:JSON.stringify({error:"Method not allowed"})
    };
  }

  try{

    const body = JSON.parse(event.body || "{}");
    const submission = body.submission || {};

    const studentId   = submission.studentId;
    const classId     = submission.classId;
    const sessionId   = submission.sessionId || null;
    const botType     = submission.botType   || null;

    const assignmentId = submission.assignmentId || "general";
    const step         = submission.step || 1;
    const version      = submission.version || 1;

    const content     = submission.content;

    if(!studentId || !classId || !content){

      return {
        statusCode:400,
        headers,
        body:JSON.stringify({
          error:"studentId, classId and content are required"
        })
      };

    }

    const db = getDB();

    const submissionId =
      "sub_" + Date.now() + "_" + Math.random().toString(36).slice(2,6);

    const timestamp = Date.now();

    const record = {

      submissionId,

      studentId,
      classId,
      sessionId,
      botType,

      assignmentId,
      step,
      version,

      content,
      timestamp

    };

    await db
      .ref(`submissions/${classId}/${studentId}/${submissionId}`)
      .set(record);

    console.log("SUBMISSION SAVED:",record);

    return {

      statusCode:200,
      headers,
      body:JSON.stringify({

        ok:true,
        submissionId

      })

    };

  }
  catch(err){

    console.error("SUBMIT ERROR:",err);

    return {

      statusCode:500,
      headers,
      body:JSON.stringify({

        error:"submission failed"

      })

    };

  }

}
