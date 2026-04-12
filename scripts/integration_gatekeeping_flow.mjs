import assert from "node:assert/strict";

const baseRoot = process.env.GATEKEEPING_BASE_URL || "http://localhost:8888/.netlify/functions";
const gatekeepingUrl = `${baseRoot.replace(/\/$/, "")}/gatekeeping`;

const bearerToken = String(process.env.GATEKEEPING_BEARER_TOKEN || "").trim();
const allowLegacyActor = String(process.env.GATEKEEPING_ALLOW_LEGACY_ACTOR || "").trim().toLowerCase() === "true";
const actorId = String(process.env.GATEKEEPING_ACTOR_ID || "").trim();
const actorRole = String(process.env.GATEKEEPING_ACTOR_ROLE || "lecturer").trim();

const courseId = String(process.env.GATEKEEPING_TEST_COURSE_ID || "course_integration_test").trim();
const studentId = String(process.env.GATEKEEPING_TEST_STUDENT_ID || `stu_${Date.now().toString(36)}`).trim();
const stageId = String(process.env.GATEKEEPING_TEST_STAGE_ID || "stage_integration").trim();

if (!bearerToken) {
  if (!allowLegacyActor) {
    console.error("INTEGRATION BLOCKED: set GATEKEEPING_BEARER_TOKEN for evaluate flow (or set GATEKEEPING_ALLOW_LEGACY_ACTOR=true in local test mode)");
    process.exit(1);
  }
}
if (!actorId) {
  console.error("INTEGRATION BLOCKED: set GATEKEEPING_ACTOR_ID to the same uid represented by the bearer token");
  process.exit(1);
}

function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;
  return headers;
}

async function postJson(body) {
  const res = await fetch(gatekeepingUrl, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

async function getJson(url) {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

async function run() {
  console.log("STEP 1/4 submit");
  const submit = await postJson({
    action: "submit",
    studentId,
    classId: courseId,
    stageId,
    payloadSummary: "integration test payload"
  });
  assert.equal(submit.res.ok, true, `submit failed: ${JSON.stringify(submit.data)}`);
  assert.equal(submit.data?.ok, true, "submit response ok=false");
  const submissionId = submit.data?.submission?.submissionId;
  assert.ok(submissionId, "submissionId missing");

  console.log("STEP 2/4 evaluate approved");
  const evaluate = await postJson({
    action: "evaluate",
    studentId,
    classId: courseId,
    submissionId,
    stageId,
    status: "approved",
    feedback: "integration approved",
    actorId,
    actorRole
  });
  assert.equal(evaluate.res.ok, true, `evaluate failed: ${JSON.stringify(evaluate.data)}`);
  assert.equal(evaluate.data?.ok, true, "evaluate response ok=false");

  console.log("STEP 3/4 status validation");
  const statusUrl = `${gatekeepingUrl}?studentId=${encodeURIComponent(studentId)}&courseId=${encodeURIComponent(courseId)}&stageId=${encodeURIComponent(stageId)}`;
  const status = await getJson(statusUrl);
  assert.equal(status.res.ok, true, `status failed: ${JSON.stringify(status.data)}`);
  assert.equal(status.data?.ok, true, "status response ok=false");
  const unlockState = String(status.data?.unlockState?.state || "");
  assert.ok(["unlocked", "pending_review"].includes(unlockState), `unexpected unlockState: ${unlockState}`);

  console.log("STEP 4/4 queue visibility");
  const queueUrl = `${gatekeepingUrl}?action=queue_by_course&courseId=${encodeURIComponent(courseId)}&search=${encodeURIComponent(studentId)}`;
  const queue = await getJson(queueUrl);
  assert.equal(queue.res.ok, true, `queue failed: ${JSON.stringify(queue.data)}`);
  assert.equal(queue.data?.ok, true, "queue response ok=false");

  console.log("INTEGRATION GATEKEEPING FLOW OK", {
    studentId,
    courseId,
    stageId,
    submissionId,
    unlockState,
    queueMatches: Array.isArray(queue.data?.queue) ? queue.data.queue.length : 0
  });
}

run().catch(error => {
  console.error("INTEGRATION GATEKEEPING FLOW FAILED", error?.message || error);
  process.exit(1);
});
