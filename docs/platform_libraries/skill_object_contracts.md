# Skill Object Contracts

## Purpose

This document is a companion to the shared skills library.

Its role is narrower than the main library document.

It does not explain the pedagogical model in depth.

Instead, it defines the minimal reusable object boundaries that future products, branches, and runtime layers can share.

## Scope Rule

These contracts are draft-level platform library contracts.

They are not final implementation schemas.

They are meant to stabilize vocabulary and object boundaries before deeper implementation work begins.

## Core Objects

### 1. Skill

Represents a reusable skill definition.

Minimal contract:

```json
{
  "skillId": "academic_writing.paraphrase",
  "family": "writing_composition",
  "subdomain": "paraphrase",
  "displayName": "Paraphrase",
  "description": "Transforms source meaning into new wording while preserving meaning.",
  "genericity": "generic_academic",
  "pathwayStage": "writing_construction"
}
```

### 2. CourseSkill

Represents the relationship between a course or unit and a required skill.

Minimal contract:

```json
{
  "courseId": "course_hebrew_literacy_01",
  "unitId": "unit_03",
  "skillId": "academic_writing.paraphrase",
  "role": "core",
  "expectedLevel": 3,
  "evidenceTypes": ["paragraph_rewrite", "source_summary"]
}
```

### 3. StudentSkillProgress

Represents the current tracked state of a learner in relation to a skill.

Minimal contract:

```json
{
  "studentId": "student_123",
  "skillId": "academic_writing.paraphrase",
  "levelAchieved": 2,
  "supportNeed": "scaffolded",
  "recentEvidence": ["micro_paraphrase_attempt"],
  "recentErrors": ["structure_copying"],
  "lastUpdated": "2026-04-11T12:00:00Z"
}
```

### 4. SkillEvidence

Represents an artifact or performance trace that can be used as evidence for a skill judgment.

Minimal contract:

```json
{
  "evidenceId": "ev_001",
  "studentId": "student_123",
  "skillId": "academic_writing.paraphrase",
  "evidenceType": "micro_paraphrase_attempt",
  "sourceContext": "lesson_space",
  "qualitySignal": "partial_success",
  "timestamp": "2026-04-11T12:01:00Z"
}
```

### 5. SkillPathway

Represents an ordered developmental route through related skills or subskills.

Minimal contract:

```json
{
  "pathwayId": "academic_literacy_core",
  "name": "Academic Literacy Core",
  "stages": [
    "linguistic_foundation",
    "reading_comprehension",
    "structure_analysis",
    "writing_construction",
    "source_work",
    "full_research"
  ]
}
```

### 6. PopulationSkillOverlay

Represents an adaptation layer for diagnosis or support without redefining the underlying skill.

Minimal contract:

```json
{
  "overlayId": "immigrant_hebrew_beginner",
  "population": "immigrant",
  "languageLevel": "beginner",
  "affects": ["diagnosis_signals", "support_mode", "vocabulary_scaffolds"],
  "entryAdjustment": "earlier_pathway_entry"
}
```

### 7. SkillCredentialLink

Represents a draft relationship between a demonstrated skill and a credential opportunity.

Minimal contract:

```json
{
  "skillId": "academic_writing.paraphrase",
  "credentialId": "cred_academic_writing_foundations",
  "requiredLevel": 3,
  "requiredEvidenceTypes": ["paragraph_rewrite", "source_summary", "revision_trace"],
  "status": "draft_link"
}
```

## Cross-Object Rules

### Rule 1: Skill Is The Stable Anchor

Other objects may change by course, student, or population.

`Skill` remains the shared anchor.

### Rule 2: CourseSkill Does Not Redefine Skill

It only binds an existing skill to a course or unit context.

### Rule 3: StudentSkillProgress Must Be Evidence-Aware

A level should not stand alone without some evidence trace.

### Rule 4: Population Overlay Adapts Access, Not Core Definition

The skill remains the same.

Diagnosis or support entry conditions may differ.

### Rule 5: Credential Links Depend On Evidence Thresholds

A skill should not be treated as credential-ready based on naming alone.

It should require evidence conditions.

## Minimal Shared Enums

Draft values worth stabilizing early:

### `role`

- `core`
- `support`
- `optional`

### `supportNeed`

- `direct_guidance`
- `scaffolded`
- `independent`
- `transfer_ready`

### `qualitySignal`

- `attempted`
- `partial_success`
- `validated`
- `advanced`

### `genericity`

- `generic_academic`
- `discipline_linked`
- `micro_skill`

## Final Statement

These object contracts are useful because they reduce ambiguity before implementation.

They create a shared vocabulary for products that want to connect courses, skills, evidence, progress, and credentials.