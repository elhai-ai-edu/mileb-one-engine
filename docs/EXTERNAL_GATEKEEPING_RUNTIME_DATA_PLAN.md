# External Gatekeeping Runtime Data Plan

## Purpose

This document operationalizes the first implementation slice defined in the implementation schema plan.

It defines the exact runtime objects, Firebase residency, and endpoint responsibilities for the external gatekeeping flow.

## Slice Scope

This slice covers six runtime effects:

1. create `GatekeeperSubmission`
2. record `ExternalEvaluationResult`
3. write `ValidationEvent`
4. issue `ApprovalToken` on approval
5. update `StageUnlockState`
6. update `ContinuityState`

## Core Residency Rule

`sessions/{studentId}/{courseId}` is the source of truth for learner-specific gatekeeping state.

`classes/{classId}` holds class defaults and stage policies.

`conversations/{sessionId}` remains chat log only.

## Class-Level Residency

Firebase path:

`classes/{classId}/gatekeeping`

Recommended structure:

```json
{
  "enabled": true,
  "protocolId": "external_gatekeeper_approval_flow",
  "defaultSourceType": "manual_review",
  "tokenTtlHours": 168,
  "autoUnlockOnApproval": true,
  "stageSettings": {
    "problem_analysis_a": {
      "enabled": true,
      "criteriaVersion": "rubric_v1",
      "reviewMode": "hybrid",
      "sourceType": "google_form",
      "unlocksStageId": "solution_search_b"
    }
  },
  "updatedAt": 1760000000000
}
```

### Field Meaning

- `enabled`: class-level on or off switch
- `protocolId`: protocol identifier used in `ValidationEvent.sourceProtocol`
- `defaultSourceType`: fallback submission source when stage-level value is absent
- `tokenTtlHours`: default approval-token lifetime
- `autoUnlockOnApproval`: whether approval moves unlock state directly to `unlocked`
- `stageSettings.<stageId>.unlocksStageId`: which stage becomes available after approval

## Session-Level Residency

Firebase path:

`sessions/{studentId}/{courseId}`

### Gatekeeping subtree

```json
{
  "gatekeeping": {
    "activeSubmissionIdByStage": {
      "problem_analysis_a": "sub_001"
    },
    "lastEvaluationIdByStage": {
      "problem_analysis_a": "eval_001"
    },
    "lastTokenIdByStage": {
      "problem_analysis_a": "tok_001"
    },
    "submissions": {
      "sub_001": {}
    },
    "evaluations": {
      "eval_001": {}
    },
    "tokens": {
      "tok_001": {}
    },
    "revisionRequests": {
      "rev_001": {}
    },
    "updatedAt": 1760000000000
  }
}
```

### Continuity subtree

```json
{
  "continuity": {
    "state": {},
    "unlockStates": {
      "solution_search_b": {}
    },
    "handoffs": {
      "handoff_001": {}
    },
    "validationEvents": {
      "val_001": {}
    },
    "transitions": {
      "trans_001": {}
    }
  }
}
```

### Evidence subtree

```json
{
  "evidence": {
    "events": {
      "evt_001": {}
    },
    "traces": {
      "trace_001": {}
    }
  }
}
```

## Storage-Key Rule

Map keys inside `activeSubmissionIdByStage`, `lastEvaluationIdByStage`, `lastTokenIdByStage`, and `unlockStates` must use a Firebase-safe normalized stage key.

The original `stageId` remains inside each stored object.

## Endpoint Contract

Runtime endpoint:

`/api/gatekeeping`

Supported operations:

### 1. `submit`

Creates:

- `GatekeeperSubmission`
- `EvidenceEvent`
- `EvidenceTrace` update
- `ContinuityHandoff`
- pending `StageUnlockState`
- updated `ContinuityState`

Minimal request body:

```json
{
  "action": "submit",
  "studentId": "student_123",
  "courseId": "ed421_a",
  "stageId": "problem_analysis_a",
  "sessionId": "sess_001",
  "sourceType": "google_form",
  "payloadRef": "form_response_7781",
  "payload": {
    "artifactUrl": "https://example.edu/submission/7781"
  }
}
```

### 2. `evaluate`

Creates or updates:

- `ExternalEvaluationResult`
- `ValidationEvent`
- `ApprovalToken` when approved
- `RevisionRequest` when rejected
- `StageUnlockState`
- `StageTransitionEvent` when unlocked
- `ContinuityState`

Minimal request body:

```json
{
  "action": "evaluate",
  "studentId": "student_123",
  "courseId": "ed421_a",
  "submissionId": "sub_001",
  "status": "approved",
  "feedback": "ההגשה מלאה ועומדת בקריטריונים.",
  "criteriaVersion": "rubric_v1",
  "reviewMode": "hybrid"
}
```

### 3. `status`

Returns the current gatekeeping and continuity snapshot for the learner and optionally for a specific stage.

Minimal query parameters:

- `studentId`
- `courseId` or `classId`
- optional `stageId`

## Event Semantics

### On submit

- `EvidenceEvent.eventType = submission_attached`
- `ContinuityHandoff.purpose = stage_validation`
- `StageUnlockState.state = pending_review`

### On approved evaluation

- `ValidationEvent.decision = approved`
- `ApprovalToken.status = issued`
- `StageUnlockState.state = unlocked` when class policy enables auto unlock
- `StageTransitionEvent.resultState = unlocked`

### On rejected evaluation

- `ValidationEvent.decision = rejected`
- create `RevisionRequest`
- `StageUnlockState.state = relocked`

### On review-required evaluation

- `ValidationEvent.decision = review_required`
- `StageUnlockState.state = pending_review`

## Chat Runtime Binding

`functions/chat.js` should read the session-side gatekeeping snapshot and inject it into the system prompt context.

Minimal prompt-relevant lines are:

- current continuity stage
- current unlock state
- pending submission marker
- latest evaluation result
- open revision request summary

This makes the gatekeeping state operational for runtime coaching without moving authority away from the session store.

## Out Of Scope For This Slice

- vendor-specific webhook payloads
- UI workflow polish
- analytics dashboards
- credential awarding
- skill-evidence normalization beyond gatekeeping-linked evidence events

## Completion Standard

This slice is considered implemented when:

1. `/api/gatekeeping` can create and advance the approval flow
2. all gatekeeping objects land under `sessions/{studentId}/{courseId}` in the agreed subtrees
3. class defaults are read from `classes/{classId}/gatekeeping`
4. `chat.js` consumes the stored gatekeeping state as runtime context