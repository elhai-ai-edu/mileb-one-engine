# Knowledge Migration Table

## Purpose

This document translates the knowledge-container model into concrete migration work.

Its job is to answer:

- from which existing docs should we extract material?
- into which target container should that material move?
- what exactly should be extracted first?

This is not a final archive plan.

It is a practical migration table for the next documentation and platform-normalization pass.

## Migration Table

| Source Doc / Family | Main Material To Extract | Target Container | Priority | Notes |
|---|---|---|---|---|
| `docs/MASTER_LOGIC.md` | kernel rules, phase logic, enforcement concepts, branch contracts, continuity logic | Architecture Rules And Contracts | High | Keep as core authority; extract stable contracts, not every narrative explanation |
| `docs/BOT_ARCHITECT_SP.md` | intake protocol, stress-test logic, export contract, DNA/pacing conflict rules | Product Protocol Registry | High | Split orchestration protocol from prompt wording |
| `docs/BOT_ARCHITECT_SP.md` | pedagogical DNA structures and default behavior tables | Bot Archetype And DNA Registry | Medium | Only if promoted to shared registry |
| `docs/academic-literacy-map.md` | literacy domains, progression axes, reading-writing bridge logic | Skill Ontology And Diagnosis Library | High | Strong candidate for shared literacy capability |
| `docs/LESSON_SPACE_CONTRACT.md` | lesson runtime inputs, outputs, branch bridge logic, runtime layer definition | Architecture Rules And Contracts | High | Extract contracts and interfaces; keep the narrative separately |
| `docs/LESSON_SPACE_CONTRACT.md` | lesson operating flow and runtime rules | Product Protocol Registry | High | Useful as protocol, not only architecture |
| `docs/ARCHITECTURE_INTEGRATION_AUDIT.md` | continuity, opening sequence, OPAL role, classroom integration continuum | Architecture Rules And Contracts | Medium | Extract normalized contracts and terms |
| `docs/DOCS_ONLY_ARCHITECTURE_ELEMENTS.md` | docs-native layers worth institutionalizing | Architecture Rules And Contracts | Medium | Use as source checklist, not direct canonical home |
| `docs/KNOWLEDGE_AUDIT_V3.md` | questionnaire extensions, governance variables, DNA taxonomy notes | Architecture Rules And Contracts | Medium | Extract only canonical decisions; leave audit evidence in place |
| `docs/KNOWLEDGE_AUDIT_V3.md` | pedagogical DNA taxonomy | Bot Archetype And DNA Registry | High | Strong source for shared registry if formalized |
| `docs/drive-download-20260320T045128Z-1-001/שלבים בבניית אפליקציה_  מערכת ED421.md` | transformation levels, transformed unit schema, workflow phases | Transformation Template Library | High | Rich extraction source for lecturer redesign capabilities |
| `docs/drive-download-20260320T045128Z-1-001/שלבים בבניית אפליקציה_  מערכת ED421.md` | builder flow from intake to transformed outputs | Product Protocol Registry | High | Product protocol candidate |
| `docs/drive-download-20260320T044443Z-1-001/מסמך RAW 1– כל החומרים הלא מסודרים שלי.md` | DB transformation templates, gap checks, principles, artifacts, rubrics, skills, credits | Transformation Template Library | High | Needs careful curation because it is raw and broad |
| `docs/drive-download-20260320T044443Z-1-001/מסמך RAW 1– כל החומרים הלא מסודרים שלי.md` | credential and micro-credential logic | Credential Logic Library | Medium | Extract object logic, not all market-scan prose |
| `docs/drive-download-20260320T044443Z-1-001/מסמך RAW 1– כל החומרים הלא מסודרים שלי.md` | active-learning principles and pattern descriptions | Active Learning And Skills-Oriented Design Pattern Library | High | Good source, but requires deduplication |
| `docs/opal-populations.md` | population-specific routing, adaptation logic | Population Routing And Adaptation Library | Medium | Best extracted as reusable routing layer |
| `docs/classroom-architecture.md` | live classroom manager vision, orchestration assumptions | Product Protocol Registry | Medium | Useful for lecturer orchestration and lesson operations |
| `docs/STRATEGIC_MAP_V3.md` | bot zoo, cross-system synthesis, strategic typologies | Product Protocol Registry | Low | More synthesis than canonical source; use selectively |
| `docs/בניית בוט מלווה סטודנטים בהכנת פרזנטציה.md` | presentation coaching methods, active-learning presentation logic | Bot And Feature Knowledge Packs | Medium | Keep local unless generalized |
| `docs/drive-download-20260320T034648Z-1-001/סיכום חומרים למאגר הידע של בוט פרפרזה.md` | paraphrase progression model and diagnostics | Bot And Feature Knowledge Packs | Medium | Promote only if reused across broader skill pathways |

## First Extraction Wave

If the migration work must start now, the best first wave is:

1. `docs/academic-literacy-map.md` → Skill Ontology And Diagnosis Library
2. ED421 transformation docs → Transformation Template Library
3. `docs/BOT_ARCHITECT_SP.md` → Product Protocol Registry
4. `docs/LESSON_SPACE_CONTRACT.md` → Architecture contracts + protocol layer
5. `docs/KNOWLEDGE_AUDIT_V3.md` DNA material → Bot Archetype And DNA Registry

Reason:

- this wave creates reusable shared layers that connect strategy, runtime, and builders

## Extraction Rules

Each migration should separate three things:

### 1. Contract

What must become stable and reusable.

### 2. Pattern Library

What becomes a catalog, registry, or taxonomy.

### 3. Narrative / Rationale

What should remain in source documents as explanation, evidence, or design history.

This is important because migration does not mean flattening every source doc into a database-like format.

## What Not To Migrate Too Early

These materials should not be aggressively normalized yet:

- highly local instructional snippets
- one-assignment rubrics
- domain examples with low reuse
- exact conversational phrasing from bot-specific docs
- market-scan prose that has no operational target yet

## Final Statement

The migration task should focus first on extracting stable reusable layers from rich source documents.

The goal is not to tidy the docs for their own sake.

The goal is to create platform-ready shared knowledge structures without losing the depth of the original materials.