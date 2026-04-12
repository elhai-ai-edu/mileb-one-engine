# Transformation Template Library

## Purpose

This document is the first Wave 1 draft of a shared transformation-template library.

Its role is to hold reusable redesign structures for courses, units, and lessons.

It is not a full product spec.

It is the reusable library layer beneath lecturer redesign products and future course-transformation builders.

## Source Lineage

Primary sources used in this first draft:

- `docs/drive-download-20260320T045128Z-1-001/שלבים בבניית אפליקציה_  מערכת ED421.md`
- `docs/drive-download-20260320T044443Z-1-001/מסמך RAW 1– כל החומרים הלא מסודרים שלי.md`

## Core Design Claim

Transformation should not be treated as freeform creativity each time a lecturer wants to redesign a course or unit.

It should be modeled as a reusable library of transformation patterns that connect:

- source structure
- pedagogical principles
- activities
- outputs / artifacts
- rubrics
- skills
- policy constraints
- effort and feasibility signals

This is what allows the system to recommend redesigns without becoming arbitrary.

## What A Transformation Template Is

A transformation template is a reusable pattern for converting an existing instructional structure into a more active, skill-oriented, measurable, or credential-relevant form.

The current docs imply that a template is not only an idea.

It is a structured linkage object between multiple pedagogical layers.

## Transformation Levels

The ED421 materials already define three major levels of change.

### 1. Light Transformation

Purpose:

- preserve most of the original structure
- add targeted upgrades

Typical use:

- add one or two activities
- improve clarity or feedback
- add basic evidence capture

### 2. Medium Transformation

Purpose:

- partially redesign the structure around skills and activities

Typical use:

- introduce new activity logic
- re-balance content and participation
- connect outputs more explicitly to skills

### 3. Radical Transformation

Purpose:

- rebuild the course or unit from the ground up

Typical use:

- create a mini-course
- redesign around skill pathways
- rebuild assessment and artifacts around a new pedagogical logic

## Transformation Families

The current docs already imply multiple repeatable archetypes.

Initial extracted families include:

- `Lecture -> Guided Active`
- `Lab -> Authentic / WIL`
- `Paper -> Portfolio`
- `Seminar -> Inquiry`
- `Online -> Blended Rebalance`
- `Exam-Only -> Mixed Assessment`
- `Case -> Policy Brief`

These families are not yet formalized as the final catalog, but they are strong enough to serve as the first shared set.

## Transformed Unit Logic

The docs imply that a transformed unit should become a reusable object, not just a prose recommendation.

At a library level, a transformed unit represents:

- the source unit
- the chosen transformation level
- the selected template family
- the activities introduced
- the outputs / artifacts produced
- the skill links created
- the evidence structure attached

This is important because the system should be able to compare the original unit and the transformed unit as two related but distinct structures.

## Gap-Check Catalog

The current materials repeatedly suggest that transformation begins by detecting what is missing.

Initial reusable gap checks include:

- no formative feedback
- no UDL alternative
- no authentic output
- no scaffolded progression
- no intermediate evidence
- no rubric transparency
- no link between activity and skill
- no policy alignment for AI / privacy / accessibility

These should become a stable template-library concept because they explain why a certain transformation is recommended.

## Principle To Activity To Artifact Mapping

This is one of the strongest reusable layers present in the corpus.

The current materials imply a chain like this:

1. principle
2. activity
3. artifact / output
4. rubric
5. skill
6. credit or recognition implication

This chain is the real engine of the transformation library.

Without it, templates become inspirational examples only.

## Skill And Credit Linkage

The transformation docs already position skills and credits inside the template logic.

That means a template should not only ask:

- what activity is introduced?

It should also ask:

- what skill does this output evidence?
- what kind of recognition or weight might follow?

This does not make the transformation library the credential library.

But it means templates should be credential-aware.

## Policy And Guardrail Layer

The transformation materials clearly treat policy as part of the template, not as an afterthought.

Initial policy flags already visible:

- AI use policy
- privacy
- accessibility
- overload guard
- inclusivity sweep

This matters because a transformation is not only pedagogical; it is also governed.

## Feasibility And Effort Signals

The template library should include signals that help choose between templates realistically.

Current candidate signals include:

- class size fit
- modality fit: online / hybrid / face-to-face
- lecturer effort load
- student workload impact
- implementation complexity
- policy fit

This is essential if the library is going to support real lecturer workflows.

## Minimal Template Record Shape

This is a draft library-level object, not a final schema.

```json
{
	"templateId": "lecture_guided_active",
	"archetype": "Lecture->Guided",
	"transformationLevel": "medium",
	"triggers": ["lecture", "large_class"],
	"gapChecks": ["no_formative_feedback", "no_intermediate_evidence"],
	"principles": ["AfL", "UDL", "Scaffolding"],
	"activities": ["mini_case_pair", "mid_poll", "exit_ticket"],
	"artifacts": ["one_pager", "reflection_micro"],
	"skillsMap": ["critical_thinking", "academic_writing"],
	"policyFlags": ["ai_policy_required", "udl_option_required"],
	"effortEstimate": "medium"
}
```

## Lecturer-Facing Use

The library is reusable only if it supports a practical lecturer flow.

The current docs imply a lecturer sequence like this:

1. upload or describe source course material
2. detect current structure and likely gaps
3. choose transformation level
4. select or receive candidate template families
5. compose a transformed unit or course path
6. review effort, policy, and skill implications
7. export output for implementation

The library should support this sequence without becoming the whole workflow itself.

## What This Draft Does Not Yet Solve

- a normalized catalog of all transformation families
- final IDs for principles, activities, artifacts, and rubrics
- full external-source normalization from the market scan
- a final scoring algorithm for template selection
- full export specification for LMS targets

## Recommended Next Extraction Step

The next pass on this library should add:

- a clearer catalog of archetypes and scopes
- a normalized transformed-unit object
- draft selection logic for choosing among candidate templates
- a first linkage table between template families and skills / outputs

## Final Statement

The current docs already contain enough material to treat transformation as a reusable platform library rather than a loose redesign conversation.

That is the necessary foundation for serious lecturer-facing transformation products.