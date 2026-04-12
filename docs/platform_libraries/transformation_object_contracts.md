# Transformation Object Contracts

## Purpose

This document is the companion contracts file for the transformation library.

Its role is to stabilize the minimal reusable object boundaries for transformation work before implementation details harden in different directions.

## Scope Rule

These are draft platform-library contracts.

They are not final database schemas.

They exist to create a shared vocabulary for transformation products, planning flows, and export logic.

## Core Objects

### 1. TransformationTemplate

Represents a reusable redesign pattern.

Minimal contract:

```json
{
  "templateId": "lecture_guided_active",
  "name": "Lecture To Guided Active",
  "archetype": "Lecture->Guided",
  "scope": "unit_or_course",
  "transformationLevel": "medium",
  "principles": ["AfL", "UDL", "Scaffolding"],
  "triggers": ["lecture", "large_class"],
  "gapChecks": ["no_formative_feedback"],
  "policyFlags": ["ai_policy_required"]
}
```

### 2. TransformedUnit

Represents the result of applying transformation logic to an existing unit.

Minimal contract:

```json
{
  "transformedUnitId": "tu_001",
  "sourceUnitId": "unit_03",
  "templateId": "lecture_guided_active",
  "transformationLevel": "medium",
  "linkedSkills": ["critical_thinking", "academic_writing"],
  "activities": ["mini_case_pair", "exit_ticket"],
  "artifacts": ["one_pager"],
  "status": "draft"
}
```

### 3. TemplateLinkage

Represents the internal mapping chain that makes a template operational.

Minimal contract:

```json
{
  "templateId": "lecture_guided_active",
  "principleIds": ["AfL", "UDL"],
  "activityIds": ["mini_case_pair", "mid_poll", "exit_ticket"],
  "artifactIds": ["one_pager", "reflection_micro"],
  "rubricIds": ["rub_case", "rub_reflect"],
  "skillIds": ["critical_thinking", "academic_writing"],
  "creditImpact": "mixed"
}
```

### 4. TransformationSelection

Represents the decision state when the system evaluates which template is appropriate.

Minimal contract:

```json
{
  "selectionId": "sel_001",
  "sourceType": "course_material",
  "candidateTemplates": ["lecture_guided_active", "paper_portfolio"],
  "selectedTemplate": "lecture_guided_active",
  "reasonSignals": ["large_class", "no_formative_feedback"],
  "feasibility": "medium",
  "policyFit": "valid"
}
```

### 5. GapCheckResult

Represents a detected missing condition that justifies transformation.

Minimal contract:

```json
{
  "gapId": "gap_001",
  "sourceUnitId": "unit_03",
  "gapType": "no_intermediate_evidence",
  "severity": "high",
  "recommendedTemplates": ["lecture_guided_active", "exam_mixed_assessment"]
}
```

## Cross-Object Rules

### Rule 1: Template Is Reusable, TransformedUnit Is Contextual

`TransformationTemplate` is reusable across contexts.

`TransformedUnit` is the contextual application.

### Rule 2: Gap Checks Justify Transformation

Transformation should not be only preference-based.

A defensible transformation should be explainable through detectable gaps, goals, or constraints.

### Rule 3: Linkage Is The Operational Core

The template only becomes actionable when its principles, activities, artifacts, rubrics, skills, and credit implications are linked.

### Rule 4: Selection Must Include Feasibility Signals

A template recommendation is incomplete if it ignores class size, modality, workload, or policy fit.

### Rule 5: Credit Impact Is Secondary But Visible

Transformation templates should be credit-aware without becoming the credential engine itself.

## Minimal Shared Enums

### `transformationLevel`

- `light`
- `medium`
- `radical`

### `scope`

- `unit`
- `course`
- `unit_or_course`

### `status`

- `draft`
- `reviewed`
- `approved`
- `exported`

### `feasibility`

- `low`
- `medium`
- `high`

### `policyFit`

- `valid`
- `review_needed`
- `blocked`

## Final Statement

These contracts give the transformation library a stable operating vocabulary.

That makes it possible to build lecturer-facing transformation products without baking one-off assumptions into each workflow.