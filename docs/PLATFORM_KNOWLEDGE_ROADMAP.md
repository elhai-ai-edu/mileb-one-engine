# Platform Knowledge Roadmap

## Purpose

This document defines the next practical step after the knowledge-container decisions.

The question is no longer only:

- how should knowledge be classified?

The new question is:

- which shared platform knowledge libraries should MilEd.One build first?

The answer should be pragmatic.

Not every valuable body of knowledge needs immediate formalization.

The roadmap should prioritize libraries that are both:

- strategically central to the MilEd model
- likely to unlock multiple products, branches, and runtime layers

## Priority Logic

The strongest candidates for first-class shared libraries are those that satisfy most of these criteria:

- reused across more than one branch or product
- needed by both planning and runtime
- currently fragmented across many documents
- likely to become data contracts or service layers later
- able to reduce duplication across bots

## Priority 1: Skill Ontology And Diagnosis Library

### Why this comes first

MilEd is increasingly structured around the relationship between Course Branch and Skills Branch.

That relationship remains weak unless the system has a stable way to express:

- what a skill is
- how skills are grouped
- how skills are diagnosed
- how evidence of growth is represented

Without this library, the Skills Branch risks staying rhetorically important but operationally thin.

### What the library should contain

- skill families
- skill definitions
- diagnostic indicators
- level/progression models
- evidence types per skill
- mappings between skills and course artifacts
- mappings between skills and credentials

### What it should not try to do yet

- solve every domain-specific skill model
- enforce one global rubric for all disciplines

### Main inputs from existing docs

- skill diagnosis materials scattered across docs
- `docs/academic-literacy-map.md`
- ED421 and skills-branch materials in `drive-download` docs

### Why this is a platform library and not only a feature

Because it can feed:

- skill pathways
- credentials
- course-skill bridges
- dashboards
- bot routing
- lesson evidence capture

## Priority 2: Transformation Template Library

### Why this comes second

The project contains strong material on transforming courses, lessons, and units into more active, skill-oriented, and measurable forms.

This knowledge is too rich to stay in raw notes, and too reusable to remain inside one product concept.

### What the library should contain

- transformation archetypes
- transformation levels
- gap checks
- recommended activities
- recommended artifacts
- rubric alignments
- policy overlays
- effort and feasibility signals

### Main inputs from existing docs

- ED421 transformation docs
- active-learning conversion material
- skills-oriented course redesign material

### Why this matters system-wide

This library can support:

- lecturer redesign products
- course planning
- Lesson Space design
- mini-course construction
- future export to LMS structures

## Priority 3: Active Learning And Skills-Oriented Design Pattern Library

### Why this is separate from transformation templates

Transformation templates are applied scenarios.

This library should hold the underlying reusable design patterns beneath them.

### What the library should contain

- active-learning patterns
- collaborative patterns
- reflective patterns
- scaffolding patterns
- inquiry patterns
- authentic assessment patterns
- task-to-evidence patterns

### What it enables

- lesson builders can use it directly
- transformation templates can call into it
- bots can select patterns without hardcoding them into prompts

### Main inputs from existing docs

- active-learning materials
- pedagogical principles documents
- lesson transformation notes

## Priority 4: Credential Logic Library

### Why it matters

The moment MilEd wants mini-courses and stackable learning outputs to produce recognized value, it needs a reusable credential logic layer.

### What the library should contain

- credential types
- stacking rules
- evidence thresholds
- skill-to-credential mappings
- artifact qualification rules
- progression and completion rules

### What should remain outside for now

- institution-specific credential policies
- local domain recipes

### Main inputs from existing docs

- mini-course and micro-credential materials in ED421-like docs
- skills-to-outputs linkage ideas in `drive-download` materials

## Priority 5: Product Protocol Registry

### Why this matters

MilEd already has multiple complex products or product-like flows:

- Bot Architect
- Lesson Space
- lecturer orchestration
- transformation workflows
- future mini-course builders

These should not remain implicit across many documents.

### What the registry should contain

- named product protocol
- intake
- decision stages
- required inputs
- shared capabilities it calls
- outputs produced
- which contracts it depends on

### Why this is not just documentation hygiene

Because it is the bridge between architecture and implementation.

It tells the system how reusable knowledge is turned into actual operating products.

## Secondary Priorities

These matter, but should follow after the top five.

### Population Routing And Adaptation Library

- Hebrew adaptation
- immigrant / Haredi / language support routing
- differentiated pathway decisions

### Evidence And Continuity Object Library

- continuity token schemas
- evidence event types
- portfolio object patterns

### Bot Archetype And DNA Registry

- pedagogical DNA definitions
- mapping to runtime behavior
- mapping to product/bot presets

## Recommended Sequencing

### Phase 1

- Skill Ontology And Diagnosis Library
- Transformation Template Library

Reason:

- these create the strongest bridge between branches, lesson runtime, and product builders

### Phase 2

- Active Learning And Skills-Oriented Design Pattern Library
- Product Protocol Registry

Reason:

- these reduce duplication and stabilize design logic across flows

### Phase 3

- Credential Logic Library
- Population Routing And Adaptation Library
- Evidence And Continuity Object Library

Reason:

- these become more valuable once the first cross-system libraries are stabilized

## What This Changes Practically

This roadmap means the project should stop growing only by adding more documents or more bots.

Instead, it should begin extracting stable shared libraries from the document corpus.

That creates a middle layer between:

- top-level architecture
- local bot knowledge

This middle layer is what will make the platform scalable.

## Final Statement

The next maturity step for MilEd.One is not more architecture theory and not only more product ideas.

It is the creation of shared platform knowledge libraries that can be reused systematically across branches, lessons, builders, and bots.