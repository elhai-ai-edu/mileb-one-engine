import fs from "fs";
import path from "path";
import crypto from "crypto";
import { getDatabase } from "firebase-admin/database";
import { ensureFirebaseAdminApp } from "./firebase-admin.js";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

function json(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

function getDB() {
  return getDatabase(ensureFirebaseAdminApp());
}

async function verifyFacultyId(facultyId) {
  if (!facultyId) return false;
  try {
    const snap = await getDB().ref(`admin/auth/${facultyId}`).get();
    if (!snap.exists()) return false;
    const role = snap.val()?.role || "";
    return ["faculty", "admin", "superadmin"].includes(role);
  } catch (error) {
    console.error("saveConfig: faculty verification failed:", error.message);
    return null;
  }
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, error: "Invalid JSON body" });
  }

  const facultyId = String(payload?.facultyId || "").trim();
  const authorized = await verifyFacultyId(facultyId);
  if (authorized === null) {
    return json(500, { ok: false, error: "Authorization service unavailable" });
  }
  if (!authorized) {
    return json(403, { ok: false, error: "Unauthorized" });
  }

  const nextConfig = payload?.config;

  if (!nextConfig || typeof nextConfig !== "object" || Array.isArray(nextConfig)) {
    return json(400, { ok: false, error: "Config payload must be an object" });
  }

  const configPath = path.resolve(process.cwd(), "config.json");
  const tempPath = `${configPath}.tmp-${crypto.randomBytes(12).toString("hex")}`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(nextConfig, null, 2) + "\n", "utf8");
    fs.renameSync(tempPath, configPath);
    return json(200, { ok: true });
  } catch (error) {
    console.error("saveConfig: write failed:", error.message);
    return json(500, { ok: false, error: "Failed to persist config" });
  } finally {
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch {}
    }
  }
}
