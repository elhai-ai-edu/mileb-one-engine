# Evidence And Continuity Object Contracts

## Purpose

This document is the companion contracts file for the evidence and continuity object library.

Its role is to stabilize the minimal reusable object boundaries for cross-context evidence traceability before products and runtimes harden around local assumptions.

## Scope Rule

These are draft platform-library contracts.

They are not final persistence schemas.

They exist to create a stable shared vocabulary for evidence transport, continuity handoff, validation-linked transitions, and state tracking across contexts.

## Core Objects

### 1. EvidenceEvent

Represents a traceable event where learning-relevant evidence is produced, updated, validated, or consumed.

Minimal contract:

```json
{
  "eventId": "evt_001",
  "studentId": "student_123",
  "sourceContext": "lesson_space",
  "eventType": "artifact_created",
  "artifactRef": "artifact_778",
  "linkedSkillEvidenceIds": ["ev_101"],
  "timestamp": "2026-04-11T16:30:00Z"
}
```

### 2. EvidenceTrace

Represents an ordered set of related evidence events for a learner, stage, or pathway.

Minimal contract:

```json
{
  "traceId": "trace_001",
  "studentId": "student_123",
  "stageId": "problem_analysis_a",
  "eventIds": ["evt_001", "evt_002", "evt_003"],
  "traceStatus": "active"
}
```

### 3. ContinuityHandoff

Represents the shared handoff object between one context and another.

Minimal contract:

```json
{
  "handoffId": "handoff_001",
  "fromContext": "lesson_space",
  "toContext": "external_gatekeeper",
  "studentId": "student_123",
  "payloadRefs": ["trace_001", "sub_001"],
  "purpose": "stage_validation",
  "status": "sent"
}
```

### 4. ValidationEvent

Represents a validation decision that affects stage access, review state, or recognition flow.

Minimal contract:

```json
{
  "validationEventId": "val_001",
  "studentId": "student_123",
  "sourceProtocol": "external_gatekeeper_approval_flow",
  "decision": "approved",
  "evidenceRefs": ["bundle_001", "eval_001"],
  "continuityRefs": ["handoff_001", "trace_001"],
  "timestamp": "2026-04-11T16:40:00Z"
}
```

### 5. ContinuityState

Represents the current cross-stage continuity state for a learner.

Minimal contract:

```json
{
  "continuityStateId": "cont_001",
  "studentId": "student_123",
  "currentStageId": "solution_search_b",
  "priorStageIds": ["problem_analysis_a"],
  "latestValidationEventId": "val_001",
  "latestHandoffId": "handoff_001",
  "status": "active"
}
```

### 6. StageTransitionEvent

Represents the explicit transition from one stage state to another.

Minimal contract:

```json
{
  "transitionEventId": "trans_001",
  "studentId": "student_123",
  "fromStageId": "problem_analysis_a",
  "toStageId": "solution_search_b",
  "triggerValidationEventId": "val_001",
  "resultState": "unlocked",
  "timestamp": "2026-04-11T16:45:00Z"
}
```

## Cross-Object Rules

### Rule 1: EvidenceEvent Is Atomic, EvidenceTrace Is Aggregated

`EvidenceEvent` is the smallest continuity-layer event.

`EvidenceTrace` is the ordered aggregation that makes stage or pathway interpretation possible.

### Rule 2: Handoff Must Preserve References

`ContinuityHandoff` should carry references to prior evidence objects.

It must not rewrite skill meaning, credential thresholds, or protocol semantics.

### Rule 3: Validation Must Be Traceable

`ValidationEvent` must point to evidence or evaluation references that justify the decision.

Validation without traceable references is invalid.

### Rule 4: ContinuityState Must Be Derivable From Events

`ContinuityState` should summarize the latest durable state.

It must remain explainable through underlying handoff, validation, and transition events.

### Rule 5: Stage Unlocking Requires Transition Evidence

If a learner advances, that advancement should be representable through a `StageTransitionEvent` linked to a prior validation event.

## Minimal Shared Enums

### `eventType`

- `artifact_created`
- `artifact_updated`
- `evidence_validated`
- `evidence_consumed`
- `submission_attached`

### `traceStatus`

- `active`
- `closed`
- `superseded`

### `status` for `ContinuityHandoff`

- `draft`
- `sent`
- `received`
- `resolved`

### `decision`

- `approved`
- `rejected`
- `review_required`

### `status` for `ContinuityState`

- `active`
- `paused`
- `completed`
- `superseded`

### `resultState`

- `locked`
- `pending_review`
- `unlocked`
- `relocked`

## Final Statement

These contracts give the evidence and continuity layer a stable operational vocabulary.

That makes it possible to connect runtime events, external validation, and stage progression without rebuilding continuity logic inside each product.
