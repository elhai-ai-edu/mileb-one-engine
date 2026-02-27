// netlify/functions/create_sp.js — MilEd.One (starter)
// Builds: SPI + System Prompt from questionnaire answers (no LLM call)

import fs from "fs";
import path from "path";
import { buildSPI } from "./spi_builder.js";

const SITE_URL = "https://cozy-seahorse-7c5204.netlify.app";

// --- kernel.txt (optional injection here; you can also keep kernel injection only in chat.js)
const kernelPath = path.resolve(process.cwd(), "kernel.txt");
const kernelText = fs.existsSync(kernelPath) ? fs.readFileSync(kernelPath, "utf8") : "";

// ─────────────────────────────────────────
// CONFIG LOADER (same idea as chat.js)
// ─────────────────────────────────────────
async function loadConfig() {
  try {
    const res = await fetch(`${SITE_URL}/config.json`);
    if (!res.ok) {
      console.error("CONFIG LOAD FAILED:", res.status);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error("CONFIG FETCH ERROR:", e.message);
    return null;
  }
}

// ─────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────
export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    // expected payload:
    // {
    //   "answers": {...},         // questionnaire answers
    //   "exportPublicOnly": true  // optional (future)
    // }
    const answers = body.answers || {};
    const exportPublicOnly = body.exportPublicOnly === true;

    // Load config
    const config = await loadConfig();
    if (!config) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Configuration load failed" }),
      };
    }

    const engine = config.engine || {};
    const functionPolicies = config.functionPolicies || {};

    // Resolve function key:
    // prefer explicit answers.function, else answers.channel, else "teaching"
    const functionKey =
      (typeof answers.function === "string" && answers.function.trim()) ||
      (typeof answers.channel === "string" && answers.channel.trim()) ||
      "teaching";

    const policy = functionPolicies[functionKey] || {};

    // Optional: export = public kernel only
    const engineForBuild = exportPublicOnly
      ? {
          ...engine,
          kernel: {
            public: engine?.kernel?.public || {},
            private: {},
          },
        }
      : engine;

    // Build SPI + systemPrompt
    const { spi, systemPrompt, meta } = buildSPI({
      answers,
      engine: engineForBuild,
      policy,
      kernelText, // keep or set "" if you want kernel only in chat.js
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        functionKey,
        meta,
        spi,
        systemPrompt,
      }),
    };
  } catch (err) {
    console.error("CREATE_SP ERROR:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
