# Active Learning And Skills-Oriented Design Pattern Object Contracts

## Purpose

This document is the companion contracts file for the active-learning and skills-oriented design pattern library.

Its role is to stabilize the minimal reusable object boundaries for named pedagogical patterns and their selection logic.

## Scope Rule

These are draft platform-library contracts.

They are not final lesson-builder schemas.

They exist to create a stable shared vocabulary for patterns, families, selection rules, evidence links, and pattern constraints.

## Core Objects

### 1. DesignPattern

Represents a reusable pedagogical pattern.

Minimal contract:

```json
{
  "patternId": "guided_inquiry",
  "name": "Guided Inquiry",
  "family": "inquiry",
  "goal": "move learners from curiosity to evidence-backed response",
  "phaseFit": ["development", "reflection"]
}
```

### 2. PatternFamily

Represents a reusable family of related patterns.

Minimal contract:

```json
{
  "familyId": "scaffolding",
  "name": "Scaffolding Patterns",
  "selectionFocus": "cognitive load reduction",
  "typicalArtifacts": ["micro_task_response", "revision_attempt"]
}
```

### 3. PatternSelectionRule

Represents a rule for when a pattern is appropriate.

Minimal contract:

```json
{
  "selectionRuleId": "sel_001",
  "patternId": "guided_inquiry",
  "phase": "development",
  "readinessBand": "mid",
  "autonomyTarget": "supported_independence"
}
```

### 4. PatternEvidenceLink

Represents the expected evidence direction associated with a pattern.

Minimal contract:

```json
{
  "patternEvidenceLinkId": "link_001",
  "patternId": "revision_loop",
  "artifactTypes": ["draft_revision", "feedback_response"],
  "evidenceSignals": ["revision_trace", "partial_success"]
}
```

### 5. PatternConstraint

Represents a guardrail that limits when or how a pattern should be used.

Minimal contract:

```json
{
  "constraintId": "con_001",
  "patternId": "bounded_correction_load",
  "constraintType": "cognitive_load",
  "rule": "no_more_than_three_corrections_per_turn"
}
```

## Cross-Object Rules

### Rule 1: Patterns Belong To Families But Retain Local Purpose

`DesignPattern` should link to `PatternFamily` but keep a distinct goal.

### Rule 2: Selection Rules Must Be Context-Sensitive

`PatternSelectionRule` should express phase, readiness, or autonomy context.

### Rule 3: Evidence Links Are Directional, Not Deterministic

`PatternEvidenceLink` should indicate likely artifacts and signals, not guarantee them.

### Rule 4: Constraints Prevent Pattern Drift

`PatternConstraint` should make explicit the limits that keep a pattern pedagogically coherent.

### Rule 5: Patterns Do Not Redefine Skills

Patterns may activate or support skills.

They do not own skill meaning.

## Minimal Shared Enums

### `constraintType`

- `cognitive_load`
- `phase_fit`
- `evidence_fit`
- `autonomy_fit`

### `readinessBand`

- `low`
- `mid`
- `high`

## Final Statement

These contracts give the pattern library a stable object vocabulary.

That makes it possible to reuse pedagogical patterns across products without restating them as prose each time.