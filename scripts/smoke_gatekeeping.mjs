import fs from "fs";
import { spawnSync } from "child_process";

const files = [
  "functions/gatekeeping.js",
  "functions/chat.js",
  "lesson_view.html",
  "docs/EXTERNAL_GATEKEEPING_RUNTIME_DATA_PLAN.md"
];

function fail(message) {
  console.error(`SMOKE GATEKEEPING FAIL: ${message}`);
  process.exit(1);
}

for (const file of files) {
  if (!fs.existsSync(file)) {
    fail(`Missing required file: ${file}`);
  }
}

for (const file of ["functions/gatekeeping.js", "functions/chat.js"]) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "pipe", encoding: "utf8" });
  if (result.status !== 0) {
    fail(`Syntax check failed for ${file}\n${result.stderr || result.stdout || "Unknown error"}`);
  }
}

console.log("SMOKE GATEKEEPING OK: files exist and JS syntax is valid.");
