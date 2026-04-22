import fs from "fs";
import path from "path";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

function json(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  let nextConfig;
  try {
    nextConfig = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, error: "Invalid JSON body" });
  }

  if (!nextConfig || typeof nextConfig !== "object" || Array.isArray(nextConfig)) {
    return json(400, { ok: false, error: "Config payload must be an object" });
  }

  const configPath = path.resolve(process.cwd(), "config.json");
  try {
    fs.writeFileSync(configPath, `${JSON.stringify(nextConfig, null, 2)}\n`, "utf8");
    return json(200, { ok: true });
  } catch (error) {
    console.error("saveConfig: write failed:", error.message);
    return json(500, { ok: false, error: "Failed to persist config" });
  }
}
