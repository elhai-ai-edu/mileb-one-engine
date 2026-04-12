import assert from "node:assert/strict";

const baseRoot = process.env.GATEKEEPING_BASE_URL || "http://localhost:8888/.netlify/functions";
const gatekeepingUrl = `${baseRoot.replace(/\/$/, "")}/gatekeeping`;

const courseId = String(process.env.GATEKEEPING_TEST_COURSE_ID || "course_auth_negative").trim();
const studentId = String(process.env.GATEKEEPING_TEST_STUDENT_ID || `stu_${Date.now().toString(36)}`).trim();
const stageId = String(process.env.GATEKEEPING_TEST_STAGE_ID || "stage_auth").trim();

async function postJson(body, headers = { "Content-Type": "application/json" }) {
  const res = await fetch(gatekeepingUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

async function run() {
  console.log("NEGATIVE STEP 1/3 submit baseline");
  const submit = await postJson({
    action: "submit",
    studentId,
    classId: courseId,
    stageId,
    payloadSummary: "negative auth test"
  });
  assert.equal(submit.res.ok, true, `submit setup failed: ${JSON.stringify(submit.data)}`);
  const submissionId = submit.data?.submission?.submissionId;
  assert.ok(submissionId, "submissionId missing in setup");

  console.log("NEGATIVE STEP 2/3 evaluate without token must fail");
  const evaluateNoToken = await postJson({
    action: "evaluate",
    studentId,
    classId: courseId,
    submissionId,
    stageId,
    status: "approved",
    actorId: "spoofed_actor",
    actorRole: "lecturer"
  });
  assert.equal(evaluateNoToken.res.status, 403, `expected 403, got ${evaluateNoToken.res.status} ${JSON.stringify(evaluateNoToken.data)}`);

  console.log("NEGATIVE STEP 3/3 webhook with wrong secret must fail");
  const webhookWrongSecret = await postJson({
    action: "webhook_evaluate",
    studentId,
    classId: courseId,
    submissionId,
    stageId,
    status: "approved",
    secret: "definitely_wrong"
  }, { "Content-Type": "application/json", "X-Gatekeeping-Secret": "definitely_wrong" });

  if (process.env.GATEKEEPING_WEBHOOK_SECRET) {
    assert.equal(webhookWrongSecret.res.status, 403, `expected 403 for wrong webhook secret, got ${webhookWrongSecret.res.status}`);
  } else {
    console.log("WEBHOOK SECRET NOT CONFIGURED: skipped strict secret assertion");
  }

  console.log("NEGATIVE AUTH TESTS OK", {
    evaluateNoTokenStatus: evaluateNoToken.res.status,
    webhookWrongSecretStatus: webhookWrongSecret.res.status
  });
}

run().catch(error => {
  console.error("NEGATIVE AUTH TESTS FAILED", error?.message || error);
  process.exit(1);
});
