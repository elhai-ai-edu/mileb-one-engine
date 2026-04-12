# Credential Object Contracts

## Purpose

This document is the companion contracts file for the credential logic library.

Its role is to stabilize the minimal reusable object boundaries for recognition logic before products, exports, or institutional workflows harden in separate directions.

## Scope Rule

These are draft platform-library contracts.

They are not final administrative schemas or award-system payloads.

They exist to create a shared vocabulary for credential units, threshold rules, evidence bundles, pathway stacking, and award state.

## Core Objects

### 1. CredentialUnit

Represents the smallest named recognition object that the platform may award, unlock, or track.

Minimal contract:

```json
{
  "credentialId": "cred_academic_writing_foundations",
  "name": "Academic Writing Foundations",
  "credentialType": "micro_credential",
  "scope": "module",
  "targetSkills": ["academic_writing.paraphrase"],
  "stacksTo": ["cred_academic_literacy_core"],
  "status": "draft"
}
```

### 2. CredentialRequirement

Represents the threshold logic that defines eligibility for a credential.

Minimal contract:

```json
{
  "requirementId": "req_001",
  "credentialId": "cred_academic_writing_foundations",
  "minimumSkillLevel": 3,
  "requiredEvidenceTypes": ["paragraph_rewrite", "source_summary", "revision_trace"],
  "minimumQualitySignals": ["validated"],
  "reviewMode": "hybrid"
}
```

### 3. CredentialEvidenceBundle

Represents the collected evidence being evaluated for a credential decision.

Minimal contract:

```json
{
  "bundleId": "bundle_001",
  "credentialId": "cred_academic_writing_foundations",
  "studentId": "student_123",
  "evidenceIds": ["ev_101", "ev_102", "ev_103"],
  "coverageStatus": "complete",
  "latestEvidenceAt": "2026-04-11T14:30:00Z"
}
```

### 4. CredentialPathway

Represents a stackable route across multiple credential units.

Minimal contract:

```json
{
  "pathwayId": "path_academic_literacy",
  "name": "Academic Literacy Pathway",
  "credentialIds": [
    "cred_academic_writing_foundations",
    "cred_source_integration",
    "cred_academic_literacy_core"
  ],
  "pathwayType": "stackable",
  "entryCredentialId": "cred_academic_writing_foundations"
}
```

### 5. CredentialAwardState

Represents the current recognition state of a learner relative to a credential unit.

Minimal contract:

```json
{
  "awardStateId": "award_001",
  "credentialId": "cred_academic_writing_foundations",
  "studentId": "student_123",
  "recognitionState": "review_required",
  "reviewMode": "hybrid",
  "decisionReason": "threshold_met_pending_review",
  "lastUpdated": "2026-04-11T15:00:00Z"
}
```

## Cross-Object Rules

### Rule 1: CredentialUnit Names The Recognition Target

The unit defines what is being recognized.

It does not by itself prove eligibility.

### Rule 2: Requirements Own Threshold Logic

A credential should not be treated as earned without visible requirement logic.

Threshold ownership belongs in `CredentialRequirement`, not in product-specific wording.

### Rule 3: Evidence Bundles Must Be Traceable

If a credential decision is made, the evidence bundle should make it possible to inspect what artifacts supported that decision.

### Rule 4: Award State Is Contextual

`CredentialAwardState` belongs to a learner-context instance.

It must not redefine the credential unit or requirement itself.

### Rule 5: Pathways Stack Units, Not Ambiguous Labels

If a pathway is stackable, it should point to explicit credential units.

It should not rely on informal naming conventions alone.

## Minimal Shared Enums

### `credentialType`

- `micro_credential`
- `module_credential`
- `pathway_credential`
- `course_linked_recognition`

### `scope`

- `lesson`
- `module`
- `course`
- `pathway`

### `reviewMode`

- `automated`
- `lecturer_review`
- `hybrid`

### `coverageStatus`

- `partial`
- `complete`
- `stale`

### `recognitionState`

- `not_eligible`
- `in_progress`
- `evidence_ready`
- `review_required`
- `recognized`
- `expired_or_superseded`

### `status`

- `draft`
- `active`
- `retired`

## Final Statement

These contracts give the credential layer a stable object vocabulary.

That makes it possible to connect skills, evidence, thresholds, and recognition states without scattering credential logic across products or policy prose.