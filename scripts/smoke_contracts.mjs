import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildSPI } from "../functions/spi_builder.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), "utf8"));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), "utf8");
}

function testPhaseBinding(config) {
  const engine = config.engine;

  const learningDevelopment = buildSPI({
    answers: { channel: "learning", function: "learning", phase: "development" },
    engine
  });
  assert.equal(learningDevelopment.spi.phase, "development");
  assert.equal(learningDevelopment.spi.governance.noFullSolution, true);

  const learningDiagnostic = buildSPI({
    answers: { channel: "learning", function: "learning", phase: "diagnostic" },
    engine
  });
  assert.equal(learningDiagnostic.spi.phase, "diagnostic");
  assert.equal(learningDiagnostic.spi.governance.noFullSolution, false);

  const teachingDesign = buildSPI({
    answers: { channel: "teaching", function: "teaching", phase: "design" },
    engine
  });
  assert.equal(teachingDesign.spi.phase, "design");
  assert.equal(teachingDesign.spi.governance.noFullSolution, false);
}

function testArchitectRouting() {
  const architectStudio = readText("architect_studio.html");
  const architectApi = readText(path.join("functions", "architect_api.js"));

  assert.match(architectStudio, /fetch\("\/api\/architect\/chat"/);
  assert.doesNotMatch(architectStudio, /fetch\("\/api\/chat"/);
  assert.match(architectApi, /async function handleArchitectChat\(event\)/);
  assert.match(architectApi, /case "chat":\s+return handleArchitectChat\(event\);/);
}

function testFacultyScopes(config) {
  const facultyItems = config?.branches?.faculty?.items || {};

  assert.equal(facultyItems?.pedagogical_transformation?.scope, "institution");
  assert.equal(facultyItems?.faculty_bot_builder?.scope, "institution");
}

// ─── Personal Project Contract ───────────────────────────────────────────────
// Verifies that the field names and status values are consistent across the PP chain:
//   personal_project_stage_schema.js → chat.html → functions/chat.js → macro_cockpit.html
function testPersonalProjectContract() {
  const schema     = readText("personal_project_stage_schema.js");
  const chatHtml   = readText("chat.html");
  const chatJs     = readText(path.join("functions", "chat.js"));
  const macroCockpit = readText("macro_cockpit.html");
  const ppJs       = readText(path.join("functions", "personal_project.js"));

  // 1. Schema exports the expected API surface
  assert.match(schema, /window\.MiledPersonalProjectStageSchema/,
    "schema must assign to window.MiledPersonalProjectStageSchema");
  assert.match(schema, /getDefaultStages/,  "schema must export getDefaultStages");
  assert.match(schema, /normalizeStages/,   "schema must export normalizeStages");
  assert.match(schema, /normalizeSingleStage/, "schema must export normalizeSingleStage");
  assert.match(schema, /MAX_STAGES/,        "schema must export MAX_STAGES");

  // 2. PP bot-context field names are identical in chat.html payload and chat.js handler
  const ppFields = [
    "ppCurrentStage",
    "ppStageTitle",
    "ppStageInstructions",
    "ppStageTaskPrompt",
    "ppStageBotHint",
    "ppBotPolicy"
  ];
  for (const field of ppFields) {
    assert.match(chatHtml, new RegExp(field),
      `chat.html buildChatRequestPayload must include ${field}`);
    assert.match(chatJs, new RegExp(field),
      `functions/chat.js handler must accept ${field}`);
  }

  // 3. ppCurrentStage takes precedence over currentStep in chat.js
  assert.match(chatJs, /ppCurrentStage != null \? ppCurrentStage : currentStep/,
    "chat.js must resolve effectiveCurrentStep as ppCurrentStage ?? currentStep");

  // 4. Canonical PP status values in personal_project.js match macro tracking status map
  const ppStatuses = ["pending_review", "approved", "relocked", "completed"];
  for (const s of ppStatuses) {
    assert.match(ppJs, new RegExp(s),
      `personal_project.js must reference status "${s}"`);
  }
  // macro tracking must recognise all four PP statuses
  for (const s of ppStatuses) {
    assert.match(macroCockpit, new RegExp(s),
      `macro_cockpit.html must reference status "${s}"`);
  }

  // 5. Schema is the single normalization entry point used by both consumers
  assert.match(macroCockpit, /MiledPersonalProjectStageSchema/,
    "macro_cockpit must use MiledPersonalProjectStageSchema");
  // personal_project.html is a browser file — verify via direct read
  const ppHtml = readText("personal_project.html");
  assert.match(ppHtml, /MiledPersonalProjectStageSchema/,
    "personal_project.html must use MiledPersonalProjectStageSchema");

  // 6. stationRoot guard exists in chat.js for personal_project
  assert.match(chatJs, /stationRoot === "personal_project" && effectiveCurrentStep == null/,
    "chat.js must warn when personal_project stationRoot has no stage index");
}

function run() {
  const config = readJson("config.json");

  testPhaseBinding(config);
  console.log("PASS phase binding smoke");

  testArchitectRouting();
  console.log("PASS architect routing smoke");

  testFacultyScopes(config);
  console.log("PASS faculty scope smoke");

  testPersonalProjectContract();
  console.log("PASS personal project contract smoke");

  console.log("SMOKE CONTRACTS COMPLETE");
}

run();