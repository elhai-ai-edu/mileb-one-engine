# Implementation Schema Plan

## Purpose

This document translates the stabilized architecture into an implementation-facing schema plan.

Its role is to define:

- which objects should exist at implementation time
- where each object should live
- which layer is the source of truth for each object
- the most efficient implementation order

This document does not replace the architecture canon.

It operationalizes it.

## Core Rule

The implementation should not start by wiring everything at once.

It should start by pinning object residency and then implementing one narrow vertical slice that proves the architecture in runtime.

## Implementation Priority Order

1. schema and residency pinning
2. session-scoped runtime state
3. external gatekeeping vertical slice
4. continuity integration into lesson runtime
5. skill evidence capture
6. credential prototype
7. protocol generalization
8. secondary library bindings

## Layer 1: Library-Resident Definitions

These objects are authoritative definitions.

They should not be authored dynamically inside runtime sessions.

They belong to the shared-library/configuration layer.

### Main object groups

- `Skill`
- `SkillPathway`
- `CredentialUnit`
- `CredentialRequirement`
- `TransformationTemplate`
- `ProductProtocol`
- `DNAType`
- `BotArchetype`
- `DesignPattern`
- `PatternFamily`
- `PopulationProfile`
- `AdaptationOverlay`

### Recommended residency

- source of truth: documentation + curated configuration artifacts
- implementation target: generated or curated JSON/config layer, not mutable session storage

### Implementation note

These objects are reference data.

The runtime should consume them.

The runtime should not redefine them.

## Layer 2: Class-Scoped Configuration

These objects belong to the class or course context.

They should live with class-level settings because they affect all learners in the same class context.

### Main object groups

- enabled protocols for the class
- class-level gatekeeping settings
- credential enablement policy for the class
- lesson/runtime defaults
- routing defaults for the class population mix

### Recommended residency

- Firebase path: `classes/{classId}`

### Suggested substructure

```json
{
  "runtimeDefaults": {},
  "gatekeeping": {},
  "credentialPolicy": {},
  "populationRoutingDefaults": {},
  "lessonProtocolSettings": {}
}
```

## Layer 3: Session-Scoped Learner State

This is the most important mutable layer.

It should hold all learner-specific runtime state that changes during progression.

### Main object groups

- `StudentSkillProgress`
- `CredentialAwardState`
- `CredentialEvidenceBundle`
- `ProtocolRunState`
- `ContinuityState`
- `StageUnlockState`
- learner-specific `RoutingDecision`

### Recommended residency

- Firebase path: `sessions/{studentId}/{courseId}`

### Suggested substructure

```json
{
  "skillProgress": {
    "<skillId>": {}
  },
  "credentials": {
    "awardStates": {
      "<credentialId>": {}
    },
    "evidenceBundles": {
      "<bundleId>": {}
    }
  },
  "protocols": {
    "runStates": {
      "<protocolId>": {}
    }
  },
  "continuity": {
    "state": {},
    "unlockStates": {
      "<stageId>": {}
    }
  },
  "routing": {
    "decision": {}
  }
}
```

### Implementation note

This keeps mutable learner state under the already-approved session path instead of inventing a second competing runtime state system.

## Layer 4: Event And Validation Trace Layer

These are append-like trace objects.

They should remain inspectable and should support auditability.

### Main object groups

- `SkillEvidence`
- `EvidenceEvent`
- `EvidenceTrace`
- `ContinuityHandoff`
- `ValidationEvent`
- `StageTransitionEvent`
- `GatekeeperSubmission`
- `ExternalEvaluationResult`
- `ApprovalToken`
- `RevisionRequest`

### Recommended residency

Primary recommendation:

- store current operative references under `sessions/{studentId}/{courseId}`
- store append-style raw conversational history under `conversations/{sessionId}` only as conversation log, not as source of truth for state

### Suggested session-side substructure

```json
{
  "evidence": {
    "skillEvidence": {
      "<evidenceId>": {}
    },
    "events": {
      "<eventId>": {}
    },
    "traces": {
      "<traceId>": {}
    }
  },
  "continuity": {
    "handoffs": {
      "<handoffId>": {}
    },
    "validationEvents": {
      "<validationEventId>": {}
    },
    "transitions": {
      "<transitionEventId>": {}
    }
  },
  "gatekeeping": {
    "submissions": {
      "<submissionId>": {}
    },
    "evaluations": {
      "<evaluationId>": {}
    },
    "tokens": {
      "<tokenId>": {}
    },
    "revisionRequests": {
      "<revisionRequestId>": {}
    }
  }
}
```

### Implementation note

The important distinction is:

- `conversations/{sessionId}` = log of dialogue
- `sessions/{studentId}/{courseId}` = source of truth for pedagogical state

## Layer 5: Derived Analytics Layer

These objects should not be hand-authored by runtime flows.

They should be derived from the session and event layers.

### Main object groups

- progress dashboards
- class-level stage completion summaries
- credential readiness summaries
- evidence density summaries
- protocol performance summaries

### Recommended residency

- derived views from `sessions/{studentId}/{courseId}` and `classes/{classId}`
- optional future analytics store only after runtime flows are stable

## Object Residency Summary

### `config.json` or generated config layer

- bot presets
- protocol enablement defaults
- archetype and DNA defaults where global

### `classes/{classId}`

- class runtime defaults
- class gatekeeping policy
- class credential policy
- class population routing defaults

### `sessions/{studentId}/{courseId}`

- learner runtime state
- protocol run state
- continuity state
- skill progress
- credential award state
- event and gatekeeping trace objects

### `conversations/{sessionId}`

- raw chat history only

## First Vertical Slice To Implement

The first full runtime slice should be the external gatekeeping flow.

### Why this slice first

- it exercises protocol state
- it exercises continuity and validation
- it exercises event traceability
- it proves that coaching and evaluation can remain separated
- it is narrow enough to implement without needing the full skills and credentials system first

### Slice scope

1. coaching prepares learner
2. learner submits external stage artifact
3. submission is recorded as `GatekeeperSubmission`
4. evaluation returns `ExternalEvaluationResult`
5. system writes `ValidationEvent`
6. system issues `ApprovalToken` if approved
7. system updates `StageUnlockState`
8. system updates `ContinuityState`

### Minimum code-binding target

- API or function layer writes under `sessions/{studentId}/{courseId}`
- lesson/runtime surfaces read unlock status from session state
- no state lives only in memory inside the chat engine

## Second Vertical Slice

After gatekeeping works, the next slice should be skill evidence.

### Scope

1. produce `SkillEvidence`
2. attach it to `EvidenceEvent`
3. update `StudentSkillProgress`
4. group evidence into `CredentialEvidenceBundle` only for a very small pilot credential

## Third Vertical Slice

After skill evidence works, implement a minimal credential pathway.

### Scope

1. one `CredentialUnit`
2. one `CredentialRequirement`
3. one `CredentialAwardState`
4. one hybrid review mode

## Binding Rules For Implementation

### Rule 1: No Parallel State System

If a runtime object already belongs in session state, do not create a competing copy inside a separate ad hoc store.

### Rule 2: Logs Are Not State

Conversation logs may support explanation or audit.

They are not the canonical state store.

### Rule 3: Validation Events Must Be Explicit

Do not infer advancement from vague status booleans when a `ValidationEvent` should exist.

### Rule 4: Secondary Libraries Bind Only After Core Runtime Paths Exist

DNA registry, design patterns, and routing logic should bind into runtime only after gatekeeping, continuity, and evidence flow are working.

## Immediate Next Implementation Task

Create the runtime data plan for the external gatekeeping slice with exact field names under:

- `sessions/{studentId}/{courseId}`
- `classes/{classId}`

That should be the first code-facing artifact after this document.

## Execution Status Update

The first vertical slice has moved from plan to running baseline.

Implemented artifacts:

- runtime data plan for external gatekeeping
- runtime endpoint: `/api/gatekeeping`
- submit, evaluate, and status operations
- queue-by-course status view for lecturer monitoring
- webhook-style evaluation entry (`webhook_evaluate`)
- chat runtime context injection from session-side gatekeeping state
- lesson runtime controls for student submit and lecturer evaluate

Current runtime boundaries remain unchanged:

- `sessions/{studentId}/{courseId}` is source of truth for learner progression state
- `classes/{classId}` remains class defaults and policy layer
- `conversations/{sessionId}` remains chat log only

Residual hardening tasks for this slice:

- stronger backend identity verification for evaluate actions (completed: Firebase bearer verification + actorId mismatch protection)
- evaluate/webhook rate limiting (completed)
- class-level queue controls (completed in micro cockpit: filters, pagination, bulk, retry, stop)
- audit export and operational runbook (completed)
- end-to-end integration tests with seeded Firebase fixtures (partially completed: runnable integration and negative-auth scripts added; full seeded fixture automation remains)
- strict integration verification with real Firebase bearer identity (deferred operationally until token/uid can be provided in the execution environment)

## Final Statement

The architecture is now stable enough to move into implementation by slices.

The correct next move is not more abstract architecture.

It is to bind the stabilized objects to real runtime residency and prove them through one narrow vertical flow.