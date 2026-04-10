// functions/firebase-auth.js — MilEd.One Auth v8.0
// POST /api/firebase-auth  { idToken: string }
//
// Verifies a Google ID token via Firebase Admin Auth.
// Institution lookup order:
//   1. SUPER_ADMIN_EMAILS override (bypass all checks)
//   2. /institutions/{domainKey}  — auto-approve entire domain
//   3. /authorized_users/{emailKey} — individual whitelist
//   4. Block — "מייל לא מזוהה: הגישה מותרת למוסדות מורשים בלבד"
//
// New users default to role: "student" (or authorized_users override)
// Return users keep their stored role; institutionId is refreshed
// Valid roles: student | faculty | institution | superadmin

import { getApps } from "firebase-admin/app";
import { getAuth }     from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { ensureFirebaseAdminApp } from "./firebase-admin.js";

const headers = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

function getApp() {
  if (!getApps().length) {
    return ensureFirebaseAdminApp();
  }
  return getApps()[0];
}

// Encode email/domain for use as Firebase RTDB keys (no dots or @ allowed)
function domainKey(domain)  { return domain.replace(/\./g, "_"); }
function emailKey(email)    { return email.replace(/\./g, "_").replace(/@/g, "_at_"); }

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

  // ─── Verify Google ID token ───
  const app = getApp();
  let decoded;
  try {
    decoded = await getAuth(app).verifyIdToken(idToken);
  } catch (e) {
    console.warn("FIREBASE-AUTH: token verification failed:", e.message);
    return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: "Invalid or expired token" }) };
  }

  const { uid, email, name } = decoded;
  const emailLower = (email || "").toLowerCase();
  const db      = getDatabase(app);
  const userRef = db.ref(`users/${uid}`);

  // ─── Hardcoded Super-Admin override ───
  // Bypasses all institution checks — always granted superadmin.
  const SUPER_ADMIN_EMAILS = new Set(["elnahum@gmail.com"]);
  if (SUPER_ADMIN_EMAILS.has(emailLower)) {
    await userRef.update({
      uid, email,
      displayName: name || email,
      role: "superadmin",
      institutionId: "superadmin",
      lastSeen: Date.now()
    }).catch(() => {});
    console.log(`FIREBASE-AUTH: superadmin override — ${email}`);
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, uid, email, role: "superadmin", institutionId: "superadmin" }) };
  }

  // ─── Double-Lock: domain check + mandatory authorized_users whitelist ───
  // Both checks run, but authorized_users is the gate that grants access.
  // Domain check only determines which rejection message to show.
  const domain = emailLower.split("@")[1] || "";
  const dKey   = domainKey(domain);
  const eKey   = emailKey(emailLower);

  let domainRecognized   = false;
  let authorizedUserData = null;

  // 1. Check /institutions/{domainKey} (for context / rejection message)
  try {
    const instSnap = await db.ref(`institutions/${dKey}`).get();
    if (instSnap.exists()) {
      domainRecognized = true;
      console.log(`FIREBASE-AUTH: domain recognized — ${domain}`);
    }
  } catch {}

  // 2. Check /authorized_users/{emailKey} — REQUIRED to grant access
  try {
    const auSnap = await db.ref(`authorized_users/${eKey}`).get();
    if (auSnap.exists()) {
      authorizedUserData = auSnap.val();
      console.log(`FIREBASE-AUTH: authorized_users match — ${email}`);
    }
  } catch {}

  // 3. Block if not in authorized_users (double-lock enforcement)
  if (!authorizedUserData) {
    if (domainRecognized) {
      // Known institution but user not whitelisted for this pilot
      console.warn(`FIREBASE-AUTH: pilot block — known domain '${domain}' but ${email} not in authorized_users`);
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          ok: false,
          error: "גישתך למערכת טרם אושרה לפיילוט הנוכחי. אנא פנה למרצה."
        })
      };
    }
    // Entirely unknown domain
    console.warn(`FIREBASE-AUTH: blocked — unknown domain '${domain}' for ${email}`);
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({
        ok: false,
        error: "מייל לא מזוהה: הגישה מותרת למוסדות מורשים בלבד"
      })
    };
  }

  // Authorized — resolve institutionId (prefer authorized_users record, fall back to domain key)
  const institutionId = authorizedUserData.institutionId
    || (domainRecognized ? dKey : "manual");

  // ─── Read or create user record ───
  let role;
  try {
    const snap = await userRef.get();
    const classId = authorizedUserData?.classId || null;
    if (snap.exists()) {
      // Returning user: keep stored role; refresh metadata + sync classId
      role = snap.val().role || "student";
      await userRef.update({
        lastSeen: Date.now(), email,
        displayName: name || email,
        institutionId,
        ...(classId !== null ? { classId } : {})
      });
    } else {
      // New user: use authorized_users role override if present, else "student"
      role = authorizedUserData?.role || "student";
      await userRef.set({
        uid, email,
        displayName: name || email,
        role,
        institutionId,
        classId,
        createdAt: Date.now(),
        lastSeen:  Date.now()
      });
      console.log(`FIREBASE-AUTH: new user — ${email} (role: ${role}, institution: ${institutionId})`);
    }
  } catch (e) {
    console.error("FIREBASE-AUTH: RTDB error:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: "Database error" }) };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, uid, email, role, institutionId })
  };
}
