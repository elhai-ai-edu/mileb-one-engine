# External Gatekeeper Object Contracts

## Purpose

This document is the companion contracts file for the external gatekeeper approval flow.

Its role is to stabilize the minimal reusable object boundaries for approval-code workflows where coaching, external evaluation, and stage unlocking are intentionally separated.

## Scope Rule

These are draft platform-library contracts.

They are not final vendor-specific payloads for Make, Google Forms, or mail systems.

They exist to create a shared vocabulary for approval tokens, evaluation results, submissions, and stage unlock state.

## Core Objects

### 1. GatekeeperSubmission

Represents the formal submission sent into the external approval flow.

Minimal contract:

```json
{
  "submissionId": "sub_001",
  "studentId": "student_123",
  "stageId": "problem_analysis_a",
  "sourceType": "google_form",
  "payloadRef": "form_response_7781",
  "submittedAt": "2026-04-11T16:00:00Z"
}
```

### 2. ExternalEvaluationResult

Represents the evaluation result returned from an external AI or rules-based checker.

Minimal contract:

```json
{
  "evaluationId": "eval_001",
  "submissionId": "sub_001",
  "status": "approved",
  "feedback": "הגשת תשובה מלאה וברורה.",
  "criteriaVersion": "rubric_v1",
  "reviewMode": "hybrid"
}
```

### 3. ApprovalToken

Represents the approval code or unlock token issued after a successful evaluation step.

Minimal contract:

```json
{
  "tokenId": "tok_001",
  "submissionId": "sub_001",
  "studentId": "student_123",
  "stageId": "problem_analysis_a",
  "tokenValue": "Innovation2026",
  "expiresAt": "2026-04-18T16:00:00Z",
  "status": "issued"
}
```

### 4. StageUnlockState

Represents whether the learner's next stage is still locked, pending review, or unlocked.

Minimal contract:

```json
{
  "unlockStateId": "unlock_001",
  "studentId": "student_123",
  "lockedStageId": "solution_search_b",
  "requiredSubmissionId": "sub_001",
  "requiredTokenId": "tok_001",
  "validationEventId": "val_001",
  "state": "unlocked",
  "lastUpdated": "2026-04-11T16:15:00Z"
}
```

### 5. RevisionRequest

Represents a formal return-for-revision outcome when the learner does not pass the gate.

Minimal contract:

```json
{
  "revisionRequestId": "rev_001",
  "submissionId": "sub_001",
  "studentId": "student_123",
  "reasonSummary": "Missing prior solution explanation.",
  "actionRequired": "resubmit_stage_a",
  "status": "open"
}
```

## Cross-Object Rules

### Rule 1: Submission And Evaluation Must Stay Linked

An `ExternalEvaluationResult` must point back to a specific `GatekeeperSubmission`.

Approval without a traceable submission is invalid.

### Rule 2: ApprovalToken Is A Consequence, Not A Substitute

An `ApprovalToken` can only be issued from an approved evaluation path.

It must not replace the evidence of evaluation itself.

### Rule 3: Unlock State Must Depend On Validation

`StageUnlockState` must not move to `unlocked` from chat intent alone.

It should require a valid submission, evaluation path, and token or equivalent approval event.

Where the continuity layer is active, that approval event should be represented through a `ValidationEvent` reference.

### Rule 4: Rejection Must Stay Actionable

If the learner is not approved, a `RevisionRequest` should preserve enough feedback to support repair and resubmission.

### Rule 5: Token Validity Should Be Time-Bound Or State-Bound

Approval tokens should not remain permanently reusable unless the product explicitly requires that behavior.

## Minimal Shared Enums

### `status` for `ExternalEvaluationResult`

- `approved`
- `rejected`
- `review_required`

### `status` for `ApprovalToken`

- `issued`
- `redeemed`
- `expired`
- `revoked`

### `state` for `StageUnlockState`

- `locked`
- `pending_review`
- `unlocked`
- `relocked`

### `status` for `RevisionRequest`

- `open`
- `resolved`
- `superseded`

## Final Statement

These contracts give the external gatekeeper flow a stable vocabulary.

That makes it possible to model approval-code pathways without collapsing coaching, evaluation, and unlocking into one opaque step.