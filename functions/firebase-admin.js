import fs from "fs";
import path from "path";
import { initializeApp, getApps, cert } from "firebase-admin/app";

function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function loadFirebaseServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  const explicitPath = process.env.FIREBASE_SERVICE_ACCOUNT_FILE || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (explicitPath && fs.existsSync(explicitPath)) {
    return readJsonFile(explicitPath);
  }

  const localFallbackPath = path.resolve(process.cwd(), "scripts", "service_account.json");
  if (fs.existsSync(localFallbackPath)) {
    return readJsonFile(localFallbackPath);
  }

  throw new Error(
    "Firebase service account not configured. Set FIREBASE_SERVICE_ACCOUNT, FIREBASE_SERVICE_ACCOUNT_FILE, GOOGLE_APPLICATION_CREDENTIALS, or provide scripts/service_account.json"
  );
}

export function ensureFirebaseAdminApp() {
  if (getApps().length) {
    return getApps()[0];
  }

  return initializeApp({
    credential: cert(loadFirebaseServiceAccount()),
    databaseURL: process.env.FIREBASE_DB_URL
  });
}