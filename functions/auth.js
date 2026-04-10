// functions/auth.js — MilEd.One
// Validates cockpit login against Firebase admin/auth path.
// Only users with role "superadmin" are granted cockpit access.
//
// Firebase path: admin/auth/{username} → { id, name, role, password }
//
// MIGRATION NOTE: Before deploying, seed Firebase with:
//   admin/auth/elhai → { id:"f_elhai", name:"נחום", role:"superadmin", password:"teach1" }

import { getDatabase } from "firebase-admin/database";
import { ensureFirebaseAdminApp } from "./firebase-admin.js";

const headers = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

function getDB() {
  return getDatabase(ensureFirebaseAdminApp());
}

export async function handler(event) {

  if (event.httpMethod === "OPTIONS")
    return { statusCode: 200, headers, body: "" };

  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  // ─── Parse body ───
  let username, password;
  try {
    ({ username, password } = JSON.parse(event.body || "{}"));
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  if (!username || !password)
    return { statusCode: 400, headers, body: JSON.stringify({ error: "username and password required" }) };

  // ─── Read from Firebase ───
  let userRecord;
  try {
    const snap = await getDB().ref(`admin/auth/${username}`).get();
    if (!snap.exists()) {
      console.warn("AUTH: unknown username:", username);
      return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: "Invalid credentials" }) };
    }
    userRecord = snap.val();
  } catch (e) {
    console.error("AUTH: Firebase read error:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Auth service unavailable" }) };
  }

  // ─── Validate password ───
  if (userRecord.password !== password) {
    console.warn("AUTH: wrong password for:", username);
    return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: "Invalid credentials" }) };
  }

  // ─── Cockpit requires superadmin ───
  if (userRecord.role !== "superadmin") {
    return {
      statusCode: 403, headers,
      body: JSON.stringify({ ok: false, error: "Cockpit access requires superadmin role" })
    };
  }

  // ─── Issue session token ───
  const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ok:   true,
      token,
      user: {
        id:   userRecord.id   || username,
        name: userRecord.name || username,
        role: userRecord.role
      }
    })
  };

}
