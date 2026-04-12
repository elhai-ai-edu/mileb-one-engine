# Skill Ontology And Diagnosis Library

## Purpose

This document is the first Wave 1 draft of a shared skills library for MilEd.One.

Its job is to define reusable structures for:

- skill families
- skill dimensions
- diagnosis signals
- progression logic
- evidence types

This is not a complete skill system yet.

It is a first normalization layer extracted from existing docs.

## Source Lineage

Primary sources used in this first draft:

- `docs/academic-literacy-map.md`
- `docs/drive-download-20260320T034648Z-1-001/סיכום חומרים למאגר הידע של בוט פרפרזה.md`
- `docs/WAVE_1_EXTRACTION_SPEC.md`

Additional sources used in this expanded draft:

- `docs/drive-download-20260320T045128Z-1-001/שלבים בבניית אפליקציה_  מערכת ED421.md`
- `docs/opal-populations.md`
- `docs/opal-library-map.md`

Companion contract document:

- `docs/platform_libraries/skill_object_contracts.md`

## Core Design Claim

MilEd should not treat skills as a flat list.

Skills should be modeled through multiple coordinated axes:

1. skill family
2. unit of performance
3. depth of performance
4. progression level
5. evidence type
6. diagnosis signals

This allows the same learner to be described more precisely than with a single overall level.

## Skill Families

### 1. Reading And Analysis

This family covers how a learner reads and interprets academic text.

Subdomains extracted from the literacy map:

- sentence-level reading
- paragraph-level reading
- whole-text reading
- article-level reading
- simple identification
- deep identification
- critical reading

### 2. Writing And Composition

This family covers how a learner produces academic writing.

Subdomains extracted from the literacy map:

- sentence formulation
- paragraph construction
- essay composition
- article or review writing
- descriptive writing
- analytic writing
- critical-inferential writing

### 3. Writing Bridge And Planning

This family covers pre-writing and genre control.

Subdomains extracted from the literacy map:

- idea mapping
- outline construction
- audience and purpose recognition
- genre selection
- argument structure
- comparison structure
- process / problem-solution structure

### 4. Research And Source Integration

This family covers how learners work with sources.

Subdomains extracted from the literacy map:

- faithful summary of one source
- source analysis
- critical evaluation of a source
- source comparison
- synthesis across sources

### 5. Vocabulary And Language Control

This family covers lexical, grammatical, and register control.

Subdomains extracted from the literacy map:

- form and meaning
- inflection control
- contextual word use
- academic connectors
- academic verbs
- conventional academic phrasing
- general language register
- discipline-specific vocabulary

### 6. Skill-Specific Micro-Transformation

This family is introduced from the paraphrase materials.

It captures skills where the learner transforms text while preserving meaning.

Current extracted subdomains:

- meaning understanding
- lexical change
- structural change
- advanced paraphrase
- academic paraphrase mastery

This family is still narrow, but it is useful because it shows how a micro-skill progression model may plug into the larger ontology.

## Skill Dimensions

The current source materials imply that diagnosis should not be only by family.

It should also use dimensions.

### Dimension A: Unit Of Performance

- sentence
- paragraph
- essay / composition
- article / review
- single source
- multiple sources

### Dimension B: Depth Of Performance

- basic identification / descriptive
- analytic
- critical / inferential

### Dimension C: Linguistic Control

- everyday language
- formal written language
- advanced academic language

### Dimension D: Transformation Complexity

- minimal change
- local change
- structural change
- integrated transformation

### Dimension E: Autonomy Level

- needs direct guidance
- succeeds with scaffolded support
- performs independently
- transfers skill across contexts

## Diagnosis Model

The current materials suggest a diagnosis model built from observable signals rather than only from test scores.

### Signal Group 1: Accuracy Signals

- meaning preserved
- task completed fully
- source represented faithfully
- no major information loss
- no meaning shift

### Signal Group 2: Structural Signals

- learner can move beyond sentence copying
- learner can reorganize structure
- learner can produce coherent paragraph logic
- learner can maintain genre structure

### Signal Group 3: Cognitive Signals

- learner identifies claims and evidence
- learner explains why, not only what
- learner compares sources
- learner critiques assumptions or limits

### Signal Group 4: Language Signals

- uses connectors appropriately
- uses academic verbs appropriately
- controls register
- handles discipline vocabulary appropriately

### Signal Group 5: Error Signals

Extracted especially from the paraphrase materials:

- minimal change
- structure copying
- meaning shift
- information loss
- information addition
- awkward structure
- incomplete transformation
- missing hedge or academic nuance

### Signal Group 6: Support Dependence Signals

- requires example before attempting
- succeeds only after micro-task decomposition
- requires repeated guided hints
- succeeds after scaffold removal

## Progression Logic

The current library should support both macro and micro progression.

### Macro Progression

Across the literacy map, progression generally moves through:

1. smaller units to larger units
2. description to analysis to critique
3. low register control to academic control
4. single-source handling to multi-source integration

### Micro Progression

The paraphrase materials show that some skills need fine-grained internal ladders.

Current extracted model:

1. meaning understanding
2. lexical change
3. structural change
4. advanced paraphrase
5. academic mastery

### Combined Rule

MilEd should eventually support nested progression:

- broad family-level progression
- micro-skill progression inside a family where needed

## Evidence Types

The current materials imply that diagnosis should rely on artifact evidence.

Initial evidence types:

- faithful summary
- paragraph rewrite
- genre-based written response
- source comparison note
- synthesis paragraph
- paraphrase attempt
- micro-paraphrase attempt
- vocabulary-in-context task
- outline or writing skeleton
- reflective revision attempt

## Course And Student Linkage Model

The current corpus already implies that a skills library should connect to course structure and student state.

Extracted linkage concepts:

- `Skill`: a named reusable skill unit
- `CourseSkill`: a relation between a course and the skills it requires
- `StudentSkillProgress`: a learner-state object that tracks progress over time

This means the skills library should not remain only taxonomic.

It should also support at least three platform relations:

1. course -> required skills
2. student -> current demonstrated level
3. artifact -> evidence for skill progress

## Minimal Progress State Model

The current docs suggest a simple but reusable student progress model.

At minimum, skill progress should be able to express:

- current level achieved
- last updated timestamp
- recent evidence
- recent error signals
- current support need

A minimal draft shape:

```json
{
  "skillId": "academic_writing.paraphrase",
  "levelAchieved": 2,
  "lastUpdated": "2026-04-11T12:00:00Z",
  "recentEvidence": ["micro_paraphrase_attempt", "paragraph_rewrite"],
  "recentErrors": ["structure_copying"],
  "supportNeed": "scaffolded"
}
```

This stays draft-level, but it is important because it links diagnosis to runtime continuity.

## Skill Pathway Logic

The OPAL library materials suggest that skills should also be arranged as pathways, not only as tagged items.

A reusable pathway model now visible in the docs is:

1. linguistic foundation
2. reading comprehension
3. structure and analysis
4. writing construction
5. source work
6. full research performance

This implies two useful distinctions:

- horizontal families of skills
- vertical pathways of progression toward more complex academic performance

The skills library should eventually support both views.

## Population And Adaptation Layer

The OPAL population materials make one important correction:

the same skill should not always be diagnosed or supported in the same way for every learner population.

At this stage, the library should distinguish between:

- core skill definition
- diagnosis adaptation
- support adaptation

### Example populations already documented

- immigrant learners with low or developing Hebrew
- Haredi learners with strong language resources but mismatched academic register
- general learners without those specific adaptation needs

### Main implication

The underlying skill can stay the same, while:

- signals used in diagnosis
- explanation mode
- vocabulary scaffolds
- pathway entry point

may differ by population.

This means population routing should not replace the skills library.

It should sit on top of it.

## Generic Versus Discipline-Linked Skills

The current sources suggest the need to distinguish two classes of skills.

### Generic Academic Skills

- reading academic text
- building paragraphs
- comparing sources
- controlling academic register
- paraphrasing and summarizing

### Discipline-Linked Skills

- social-science vocabulary use
- science-method reading
- humanities interpretive framing
- course-specific terminology use

This distinction matters because the skills library should define generic families centrally while allowing discipline-linked overlays to remain tied to courses or content libraries.

## Diagnosis Entry Rules

The current materials suggest that diagnosis can begin from different entry points.

### Entry Type 1: Initial Intake Diagnosis

Used when the system first estimates learner level.

### Entry Type 2: Ongoing Performance Diagnosis

Used when the learner works on tasks and the system infers current level from artifacts and errors.

### Entry Type 3: Re-Diagnosis

Used when the system detects a sustained shift in performance or when a new learning phase begins.

This matters because not all diagnosis should happen only once at the beginning.

## Error-To-Intervention Mapping

The paraphrase materials suggest a useful general rule for the future skills layer:

diagnosis should not stop at naming the error.

It should support matching error patterns to intervention types.

Initial generalized mapping pattern:

- copying / minimal change -> micro-task decomposition
- information loss -> fidelity checks and source tracking
- awkward structure -> model comparison and scaffolded rewrite
- weak register -> laddered language support
- weak analysis -> claim/evidence prompts

This is still partial, but it points to an important capability: diagnosis should feed support selection.

## Minimal Reusable Object Shape

This is a draft library-level object, not a final implementation schema.

```json
{
  "skillFamily": "reading_analysis",
  "skillSubdomain": "critical_reading",
  "unitOfPerformance": "article",
  "depth": "critical",
  "autonomy": "scaffolded",
  "diagnosisSignals": ["identifies_claims", "questions_assumptions"],
  "errorSignals": ["surface_summary_only"],
  "evidenceTypes": ["source_analysis", "critical_response"],
  "progressionModel": "macro_literacy"
}
```

For draft cross-product object boundaries, see the companion contracts file.

## Evidence-To-Credential Layer

The current skills library is strong enough to add a first bridge from skill evidence toward credential logic.

This layer should remain draft-level.

It should not yet define full institutional credential policy.

It should define the reusable relationship between:

- demonstrated skill
- acceptable evidence
- threshold of performance
- eligibility for credential recognition

### Core Rule

A credential should not attach directly to a skill name.

It should attach to demonstrated skill evidence that reaches a stated threshold.

### Minimal Bridge Model

1. a learner produces artifacts or process traces
2. those artifacts are interpreted as `SkillEvidence`
3. repeated or sufficient evidence updates `StudentSkillProgress`
4. reaching the required level plus required evidence pattern enables `SkillCredentialLink`
5. multiple skill-credential links may later feed a larger credential or mini-course outcome

### Draft Credential-Relevant Evidence Types

Initial evidence types that are likely to matter for credential logic:

- validated artifact
- revision trace across attempts
- process evidence showing independent reasoning
- multi-context performance on the same skill
- synthesis or integration artifact
- criterion-based confirmation by rubric or structured judgment

### Threshold Logic

The docs suggest that credentials should eventually depend on more than one event.

A reasonable draft threshold model is:

- level threshold: learner reaches a target level
- evidence threshold: learner presents one or more qualifying evidence types
- consistency threshold: learner shows the skill across more than one task or context
- autonomy threshold: learner performs with reduced support or independently

### Draft Example

For a credential such as `academic_writing_foundations`, the system could eventually require:

- paraphrase at level 3
- source summary at level 3
- paragraph argumentation at level 3
- at least one revision trace
- at least one independently completed artifact

This is still only a library-level example, but it clarifies the intended bridge.

### Why This Matters

Without this bridge, the system may track skills and also issue credentials, but the relation between them will stay weak.

With this bridge, skills become the developmental layer, evidence becomes the validation layer, and credentials become the recognition layer.

## Branch Integration Notes

### Course Branch

This library can help courses express:

- which skills a unit demands
- which artifacts demonstrate those skills
- where learners are likely to struggle

### Skills Branch

This library can help the skills branch express:

- what kind of pathway is being offered
- how learners are diagnosed into support
- how progress is tracked over time
- how population-specific support is layered onto common skills

### Credential Layer

This library can later support credentials by connecting:

- skill evidence
- progression thresholds
- qualifying artifacts

### Product Builders

This library can later support builders by helping them choose:

- which skill family a unit targets
- what evidence should be requested
- what diagnosis entry point to use
- what type of support pathway should follow

## What This Draft Does Not Yet Solve

- a full cross-disciplinary skill ontology
- a final scoring model
- a normalized evidence schema across all branches
- full population-specific adaptation rules
- full integration with credentials
- a complete intervention catalog per error pattern

## Recommended Next Extraction Step

The next pass on this library should add:

- additional skill families beyond literacy-centered ones
- stronger diagnosis patterns from broader skills materials
- clearer evidence mappings per family
- distinction between generic academic skills and discipline-linked skills
- a first routing overlay for population-sensitive diagnosis
- a first draft of course-skill and student-progress object contracts

## Final Statement

This first draft shows that MilEd already contains enough material to model skills as structured, diagnosable, evidential entities rather than as a flat checklist.

That is the necessary foundation for a real Skills Branch.