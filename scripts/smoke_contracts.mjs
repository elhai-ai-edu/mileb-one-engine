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

function run() {
  const config = readJson("config.json");

  testPhaseBinding(config);
  console.log("PASS phase binding smoke");

  testArchitectRouting();
  console.log("PASS architect routing smoke");

  testFacultyScopes(config);
  console.log("PASS faculty scope smoke");

  console.log("SMOKE CONTRACTS COMPLETE");
}

run();