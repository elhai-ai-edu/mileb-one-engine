// functions/firebase-auth.js — MilEd.One Auth v7.0
// POST /api/firebase-auth  { idToken: string }
//
// Verifies a Google ID token via Firebase Admin Auth.
// On first login  → creates users/{uid} in RTDB with role: "student"
// On return login → returns stored role, updates lastSeen
//
// To promote a user: Firebase Console → Realtime Database → users/{uid} → role → change value
// Valid roles: student | faculty | institution | superadmin

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth }     from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

const headers = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

function getApp() {
  if (!getApps().length) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    return initializeApp({ credential: cert(sa), databaseURL: process.env.FIREBASE_DB_URL });
  }
  return getApps()[0];
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS")
    return { statusCode: 200, headers, body: "" };

  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers, body: JSON.stringify({ error: "POST required" }) };

  let idToken;
  try { ({ idToken } = JSON.parse(event.body || "{}")); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  if (!idToken)
    return { statusCode: 400, headers, body: JSON.stringify({ error: "idToken required" }) };

  // ─── Verify Google ID token via Firebase Admin ───
  const app = getApp();
  let decoded;
  try {
    decoded = await getAuth(app).verifyIdToken(idToken);
  } catch (e) {
    console.warn("FIREBASE-AUTH: token verification failed:", e.message);
    return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: "Invalid or expired token" }) };
  }

  const { uid, email, name } = decoded;
  const db      = getDatabase(app);
  const userRef = db.ref(`users/${uid}`);

  // ─── Read or create user record ───
  let role;
  try {
    const snap = await userRef.get();
    if (snap.exists()) {
      role = snap.val().role || "student";
      await userRef.update({ lastSeen: Date.now(), email, displayName: name || email });
    } else {
      role = "student";
      await userRef.set({
        uid, email,
        displayName: name || email,
        role,
        createdAt: Date.now(),
        lastSeen:  Date.now()
      });
      console.log(`FIREBASE-AUTH: new user — ${email} (role: student)`);
    }
  } catch (e) {
    console.error("FIREBASE-AUTH: RTDB error:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: "Database error" }) };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, uid, email, role })
  };
}
