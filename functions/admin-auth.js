// functions/admin-auth.js — MilEd.One
// Firebase CRUD for admin/auth path.
// All actions require re-authentication via {requesterUsername, requesterPassword}.
// Only superadmin users may perform any action.
//
// Firebase path: admin/auth/{username} → { id, name, role, password }
//
// Actions:
//   list            — return all user records (passwords redacted)
//   create_user     — create a new auth record
//   update_password — change a user's password
//   delete_user     — remove a user record (cannot delete self)

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

// ─── Re-authenticate requester ───
async function authenticate(db, username, password) {
  const snap = await db.ref(`admin/auth/${username}`).get();
  if (!snap.exists()) return null;
  const record = snap.val();
  if (record.password !== password) return null;
  if (record.role !== "superadmin") return null;
  return record;
}

export async function handler(event) {

  if (event.httpMethod === "OPTIONS")
    return { statusCode: 200, headers, body: "" };

  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { action, requesterUsername, requesterPassword } = body;

  if (!action || !requesterUsername || !requesterPassword)
    return { statusCode: 400, headers, body: JSON.stringify({ error: "action, requesterUsername, requesterPassword required" }) };

  const db = getDB();

  // ─── Authenticate requester ───
  let requester;
  try {
    requester = await authenticate(db, requesterUsername, requesterPassword);
  } catch (e) {
    console.error("ADMIN-AUTH: Firebase read error:", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Auth service unavailable" }) };
  }

  if (!requester)
    return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: "Invalid credentials or insufficient role" }) };

  // ─── Dispatch action ───

  if (action === "list") {
    try {
      const snap = await db.ref("admin/auth").get();
      const users = [];
      if (snap.exists()) {
        snap.forEach(child => {
          const u = child.val();
          users.push({ username: child.key, id: u.id, name: u.name, role: u.role });
          // password intentionally omitted
        });
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, users }) };
    } catch (e) {
      console.error("ADMIN-AUTH list error:", e.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to list users" }) };
    }
  }

  if (action === "create_user") {
    const { username, password, name, role } = body;
    if (!username || !password || !name || !role)
      return { statusCode: 400, headers, body: JSON.stringify({ error: "username, password, name, role required" }) };

    try {
      const existing = await db.ref(`admin/auth/${username}`).get();
      if (existing.exists())
        return { statusCode: 409, headers, body: JSON.stringify({ ok: false, error: "Username already exists" }) };

      await db.ref(`admin/auth/${username}`).set({
        id:       "f_" + username,
        name,
        role,
        password,
        createdBy: requesterUsername,
        createdAt: new Date().toISOString()
      });
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch (e) {
      console.error("ADMIN-AUTH create error:", e.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to create user" }) };
    }
  }

  if (action === "update_password") {
    const { username, newPassword } = body;
    if (!username || !newPassword)
      return { statusCode: 400, headers, body: JSON.stringify({ error: "username and newPassword required" }) };
    if (newPassword.length < 6)
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Password must be at least 6 characters" }) };

    try {
      const snap = await db.ref(`admin/auth/${username}`).get();
      if (!snap.exists())
        return { statusCode: 404, headers, body: JSON.stringify({ ok: false, error: "User not found" }) };

      await db.ref(`admin/auth/${username}/password`).set(newPassword);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch (e) {
      console.error("ADMIN-AUTH update error:", e.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to update password" }) };
    }
  }

  if (action === "delete_user") {
    const { username } = body;
    if (!username)
      return { statusCode: 400, headers, body: JSON.stringify({ error: "username required" }) };
    if (username === requesterUsername)
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "Cannot delete your own account" }) };

    try {
      const snap = await db.ref(`admin/auth/${username}`).get();
      if (!snap.exists())
        return { statusCode: 404, headers, body: JSON.stringify({ ok: false, error: "User not found" }) };

      await db.ref(`admin/auth/${username}`).remove();
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch (e) {
      console.error("ADMIN-AUTH delete error:", e.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to delete user" }) };
    }
  }

  // ─── readPath: read any Firebase path (superadmin only) ───
  if (action === "readPath") {
    const { path: fbPath, limit: fbLimit = 200 } = body;
    if (!fbPath)
      return { statusCode: 400, headers, body: JSON.stringify({ error: "path required" }) };

    // Guard: only allow safe read paths
    const ALLOWED_PREFIXES = ["conversations", "skills_sessions", "sessions"];
    const allowed = ALLOWED_PREFIXES.some(p => fbPath === p || fbPath.startsWith(p + "/"));
    if (!allowed)
      return { statusCode: 403, headers, body: JSON.stringify({ error: "Path not allowed" }) };

    try {
      const snap = await db.ref(fbPath).limitToLast(Number(fbLimit)).get();
      const data = snap.exists() ? snap.val() : {};
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true, data }) };
    } catch (e) {
      console.error("ADMIN-AUTH readPath error:", e.message);
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to read path" }) };
    }
  }

  return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown action" }) };
}
