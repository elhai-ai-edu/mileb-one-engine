# Wave 1 Extraction Spec

## Purpose

This document defines the first concrete extraction wave for stabilizing MilEd.One's shared knowledge layer.

It translates the roadmap and migration table into immediate work packages.

Wave 1 focuses on the three most strategically useful extractions:

1. Skill Ontology And Diagnosis Library
2. Transformation Template Library
3. Product Protocol Registry

## Wave 1 Goal

Produce three platform-ready library drafts from existing documentation without rewriting the whole corpus.

The goal is extraction and normalization, not total cleanup.

## Extraction Principles

### Principle 1: Extract Contracts And Reusable Structures First

Do not begin with prose cleanup.

Begin with:

- definitions
- objects
- mappings
- reusable stages
- selection logic
- evidence models

### Principle 2: Preserve Source Documents As Rationale And History

Do not flatten source documents into generic summaries.

Keep them as design history and evidence.

### Principle 3: Separate Reusable Structure From Product Wording

Especially in Bot Architect and transformation materials, separate:

- stable workflow structure
- exact conversational phrasing

## Work Package 1: Skill Ontology And Diagnosis Library

### Target Output

A first draft shared library that defines:

- skill families
- skill dimensions
- diagnosis signals
- progression logic
- evidence types
- branch links to courses and credentials

### Main Source Docs

- `docs/academic-literacy-map.md`
- skill-related materials in `drive-download` docs
- skills references surfaced in architecture and audit docs

### What To Extract

- skill categories and subcategories
- progression or level logic where explicit
- diagnosis indicators
- bridges between reading, writing, research, language, and academic performance
- evidence types that show skill growth

### What Not To Extract Yet

- domain-local examples with low reuse
- one-course-only skills lists
- narrative explanation that does not affect ontology or diagnosis logic

### Draft Output Shape

- glossary of skill families
- diagnosis model
- progression model
- evidence map
- branch integration notes

## Work Package 2: Transformation Template Library

### Target Output

A first draft shared library of course and lesson redesign patterns.

### Main Source Docs

- `docs/drive-download-20260320T045128Z-1-001/שלבים בבניית אפליקציה_  מערכת ED421.md`
- ED421 transformation materials in `docs/drive-download-20260320T044443Z-1-001/מסמך RAW 1– כל החומרים הלא מסודרים שלי.md`
- active-learning redesign materials in the docs corpus

### What To Extract

- transformation levels
- transformation archetypes
- transformed unit logic
- gap checks
- links among principles, activities, artifacts, rubrics, skills, and credits
- feasibility and effort signals where explicit

### What Not To Extract Yet

- all market-scan prose
- long source quotations that do not define reusable structures
- local implementation details that depend on one future product only

### Draft Output Shape

- transformation families
- transformed unit object
- transformation-level selector
- gap-check catalog
- mapping model: principles -> activities -> artifacts -> rubrics -> skills

## Work Package 3: Product Protocol Registry

### Target Output

A first draft registry of major product flows with a common format.

### Initial Protocols To Include

- Bot Architect
- Lesson Space runtime protocol
- lecturer transformation workflow

### Main Source Docs

- `docs/BOT_ARCHITECT_SP.md`
- `docs/LESSON_SPACE_CONTRACT.md`
- `docs/LECTURER_ARCHITECTURE_PROPOSAL.md`
- selected architecture docs that define runtime or planning stages

### What To Extract

- named protocol
- purpose
- required inputs
- decision stages
- internal checks or stress tests
- outputs
- which shared libraries it depends on
- where it touches architecture contracts

### What Not To Extract Yet

- exact UI language
- implementation details that belong to HTML page layout
- speculative future products with weak documentation support

### Draft Output Shape

- protocol name
- protocol type
- intake
- decision flow
- capability dependencies
- outputs
- risks or failure modes

## Recommended Order Inside Wave 1

### Step 1

Extract the Skill Ontology And Diagnosis Library.

Reason:

- it stabilizes the Course Branch / Skills Branch relationship early

### Step 2

Extract the Transformation Template Library.

Reason:

- it creates reusable planning and redesign power immediately after the skill layer is clearer

### Step 3

Extract the Product Protocol Registry.

Reason:

- once the first two reusable libraries are clearer, product protocols can reference them cleanly instead of carrying their own hidden models

## Success Criteria

Wave 1 is successful if it produces:

- three named draft libraries or registries
- each with reusable structures rather than only summaries
- each with clear source lineage back to current docs
- reduced dependence on raw or duplicated notes for core cross-system knowledge

## Final Statement

Wave 1 should not try to solve the whole knowledge corpus.

Its purpose is more focused:

extract the first reusable platform layer that sits between core architecture and local bot knowledge.