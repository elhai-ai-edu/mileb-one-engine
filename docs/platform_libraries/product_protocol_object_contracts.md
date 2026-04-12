# Product Protocol Object Contracts

## Purpose

This document is the companion contracts file for the product protocol registry.

Its role is to stabilize the minimal reusable object boundaries for major product workflows before implementation hardens in separate directions.

## Scope Rule

These are draft platform-library contracts.

They are not final API payloads or database schemas.

They exist to create a shared vocabulary for operating sequences, stage-level checks, and protocol outputs.

## Core Objects

### 1. ProductProtocol

Represents a canonical product-level operating sequence.

Minimal contract:

```json
{
  "protocolId": "bot_architect",
  "name": "Bot Architect",
  "purpose": "Turn faculty intent into governed bot configuration.",
  "entryMode": "faculty_guided",
  "stageIds": ["intake", "stress_test", "assembly", "export"],
  "dependencies": ["architecture_governance", "bot_dna_registry"],
  "status": "draft"
}
```

### 2. ProtocolStage

Represents a named stage inside a product protocol.

Minimal contract:

```json
{
  "stageId": "stress_test",
  "protocolId": "bot_architect",
  "name": "Pedagogical Challenge",
  "order": 2,
  "inputTypes": ["questionnaire_responses", "clarifications"],
  "outputTypes": ["resolved_tensions", "governance_decisions"],
  "transitionRule": "all_required_tensions_resolved"
}
```

### 3. ProtocolCheck

Represents an internal validation or gating check required by a protocol.

Minimal contract:

```json
{
  "checkId": "phase_mismatch",
  "protocolId": "bot_architect",
  "stageId": "stress_test",
  "checkType": "governance",
  "severity": "high",
  "failureAction": "block_or_clarify"
}
```

### 4. ProtocolDependency

Represents a declared dependency on another platform library or architecture rule.

Minimal contract:

```json
{
  "dependencyId": "dep_001",
  "protocolId": "lesson_space_runtime",
  "library": "skill_ontology_and_diagnosis",
  "dependencyType": "consumes",
  "requiredObjects": ["Skill", "SkillEvidence"],
  "notes": "Lesson runtime emits evidence compatible with skill logic."
}
```

### 5. ProtocolOutput

Represents a structured output emitted by a product protocol.

Minimal contract:

```json
{
  "outputId": "out_001",
  "protocolId": "lecturer_transformation_workflow",
  "stageId": "compose_transformed_unit",
  "outputType": "transformed_unit_proposal",
  "targetConsumer": "lecturer_or_export_engine",
  "bindsTo": ["TransformedUnit", "SkillCredentialLink", "ValidationEvent", "DesignPattern", "RoutingDecision", "BotArchetype"]
}
```

### 6. ProtocolRunState

Represents the current execution state of a protocol instance.

Minimal contract:

```json
{
  "runId": "run_001",
  "protocolId": "bot_architect",
  "currentStageId": "assembly",
  "completedStageIds": ["intake", "stress_test"],
  "blockingCheckIds": [],
  "continuityRefs": ["handoff_001", "val_001"],
  "status": "active"
}
```

## Cross-Object Rules

### Rule 1: ProductProtocol Is Canonical, ProtocolRunState Is Contextual

`ProductProtocol` is reusable and stable.

`ProtocolRunState` is the contextual execution instance.

### Rule 2: Stage Order Must Be Explicit

If a product has a staged operating sequence, those stages should be represented explicitly rather than implied in narrative text.

### Rule 3: Checks Must Be Attached To Stages

Checks should not float as general warnings.

They should be connected to the stage where they must be evaluated.

### Rule 4: Dependencies Must Name Consumed Libraries

If a protocol uses skills, transformation objects, or credential logic, it should declare that dependency directly.

### Rule 5: Outputs Should Bind To Shared Objects Where Possible

Product outputs should reference shared platform objects instead of inventing protocol-local structures.

### Rule 6: Protocol State Should Be Continuity-Aware When Relevant

If a protocol drives validation, unlocking, or cross-context handoff, its run state should reference continuity-layer objects rather than carrying opaque local state only.

### Rule 7: Protocol Outputs May Reference Secondary Libraries But Must Not Redefine Them

If a protocol outputs a DNA choice, pattern choice, or routing outcome, it should bind to the shared-library object rather than restating the concept locally.

## Minimal Shared Enums

### `entryMode`

- `faculty_guided`
- `runtime_orchestrated`
- `analysis_guided`

### `checkType`

- `governance`
- `pedagogical`
- `readiness`
- `policy`
- `continuity`

### `failureAction`

- `clarify`
- `block`
- `block_or_clarify`
- `warn_only`

### `dependencyType`

- `consumes`
- `binds_to`
- `requires_alignment_with`

### `status`

- `draft`
- `active`
- `blocked`
- `completed`
- `exported`

## Final Statement

These contracts give the protocol layer a stable operating vocabulary.

That makes it possible to model major product flows as reusable governed sequences instead of ad hoc narratives.