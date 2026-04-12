# Evidence And Continuity Object Library

## Purpose

This document is the first Wave 2 draft of a shared evidence and continuity object library for MilEd.One.

Its job is to define reusable structures for:

- evidence events
- evidence bundles and traces
- continuity state across stages
- handoff objects between products
- validation-linked unlock events

This library does not own pedagogical skill meaning.

It owns the reusable transport and continuity layer that lets evidence remain traceable across runtime, gatekeeping, and recognition flows.

## Source Lineage

Primary sources used in this first draft:

- `docs/platform_libraries/product_protocol_registry.md`
- `docs/platform_libraries/skill_object_contracts.md`
- `docs/platform_libraries/credential_object_contracts.md`
- `docs/platform_libraries/skill_credential_bridge_contracts.md`
- architecture materials referring to continuity, evidence, and stage progression

## Core Design Claim

MilEd should not let each runtime or product invent its own evidence handoff model.

The platform needs a shared object layer for carrying:

1. what happened
2. where it happened
3. what it supports
4. what stage or state it enables next
5. how it stays traceable across systems

Without this layer, lesson runtime, external gatekeeping, and credential recognition drift into disconnected local logs.

## What This Library Owns

This library owns:

- evidence event structure
- continuity handoff objects
- traceable validation events
- stage transition evidence
- continuity state across products and stages

This library does not own:

- what a skill means
- what a credential means
- what a product protocol stage means

It binds those layers through shared continuity objects.

## Core Object Directions

### 1. EvidenceEvent

Represents a traceable event where learning-relevant evidence is produced, validated, or updated.

Suggested shape:

```json
{
  "eventId": "evt_001",
  "studentId": "student_123",
  "sourceContext": "lesson_space",
  "eventType": "artifact_created",
  "artifactRef": "artifact_778",
  "timestamp": "2026-04-11T16:30:00Z"
}
```

### 2. EvidenceTrace

Represents an ordered set of related evidence events for a learner, stage, or skill pathway.

Suggested shape:

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

Represents the object passed between one system context and another.

Suggested shape:

```json
{
  "handoffId": "handoff_001",
  "fromContext": "lesson_space",
  "toContext": "external_gatekeeper",
  "studentId": "student_123",
  "payloadRefs": ["trace_001", "sub_001"],
  "purpose": "stage_validation"
}
```

### 4. ValidationEvent

Represents a specific validation decision that affects stage access or recognition flow.

Suggested shape:

```json
{
  "validationEventId": "val_001",
  "studentId": "student_123",
  "sourceProtocol": "external_gatekeeper_approval_flow",
  "decision": "approved",
  "evidenceRefs": ["bundle_001", "eval_001"],
  "timestamp": "2026-04-11T16:40:00Z"
}
```

### 5. ContinuityState

Represents the current cross-stage continuity state for a learner.

Suggested shape:

```json
{
  "continuityStateId": "cont_001",
  "studentId": "student_123",
  "currentStageId": "solution_search_b",
  "priorStageIds": ["problem_analysis_a"],
  "latestValidationEventId": "val_001",
  "status": "active"
}
```

## Shared Rules

### Rule 1: Evidence Must Be Traceable Across Contexts

If evidence begins in lesson runtime and later supports a credential or unlock event, the chain should remain inspectable.

### Rule 2: Validation Must Point To Evidence

A `ValidationEvent` should never exist without references to supporting evidence, evaluation, or bundle objects.

### Rule 3: Handoff Objects Must Preserve Meaning, Not Rewrite It

`ContinuityHandoff` carries references and state.

It should not redefine skill meaning, credential thresholds, or protocol semantics.

### Rule 4: ContinuityState Is Cross-Stage, Not Product-Owned

The continuity object should be reusable across lesson runtime, external gatekeeping, and credential pathways.

### Rule 5: Unlocking Should Be A Validation Consequence

If a stage becomes available, that transition should be explainable through a prior validation event and continuity update.

## Relationship To Other Libraries

### Relationship To Skills

Skills own what counts as skill evidence.

This library owns how evidence stays traceable across systems.

### Relationship To Credentials

Credentials own threshold and recognition logic.

This library owns the continuity objects that carry evidence toward that logic.

### Relationship To Product Protocols

Protocols define when evidence is produced, evaluated, or consumed.

This library defines the shared objects used to carry those transitions.

## Risks And Failure Modes

- products produce evidence with no stable handoff objects
- validation occurs with no traceable evidence chain
- continuity state is rebuilt differently in every product
- unlock events and recognition events become impossible to audit

## Final Statement

This library gives MilEd a shared continuity layer between learning activity, validation, and recognition.

That is necessary if the platform is going to scale multi-stage pedagogy without losing evidence traceability across products.