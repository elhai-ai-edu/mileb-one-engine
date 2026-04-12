# Knowledge Materials Mapping

## Purpose

This document maps existing MilEd.One materials into the knowledge-container model.

It is a working classification, not a final archive decision.

Its purpose is to show where key material families should live conceptually so future architecture work does not over-promote or underuse them.

## Legend

- `Architecture`: platform rules, contracts, governance, shared runtime boundaries
- `Shared Capability`: reusable libraries and models called by many products or bots
- `Orchestration`: named product workflows and operating protocols
- `Bot/Feature`: narrow knowledge used by one bot family or feature family
- `Content Asset`: payload material, examples, prompts, local content

## Mapping Table

| Material Family | Main Container | Secondary Container | Why |
|---|---|---|---|
| `MASTER_LOGIC` kernel + one-engine rules | Architecture | None | Defines non-negotiable system law |
| phase-based governance and enforcement logic | Architecture | Orchestration | Governs runtime behavior across system products |
| branch model: courses / skills / faculty / admin | Architecture | Orchestration | Defines cross-product macro routes |
| Lesson Space contract | Architecture | Orchestration | Defines the runtime meeting point plus workflow consequences |
| session continuity token and evidence rules | Architecture | Shared Capability | Shared runtime and follow-up contract |
| Bot Architect mandatory intake model | Orchestration | Architecture | Core product flow with system-wide significance |
| Bot Architect stress tests | Orchestration | Shared Capability | Reusable evaluation logic inside one core product |
| bot prompt variable model (BIND / CONFIG / STRUCT / SOFT / EXPRESSIVE / DYNAMIC) | Architecture | Orchestration | Shared contract for prompt construction |
| pedagogical DNA taxonomy | Shared Capability | Architecture | Reusable behavioral model; becomes architectural only if bound into config/runtime |
| skill diagnosis research and competency classification | Shared Capability | Orchestration | Reusable across skills branch, credentials, and diagnostics |
| academic literacy map | Shared Capability | Bot/Feature | Reusable literacy scaffold, not kernel law |
| active-learning principles | Shared Capability | Content Asset | Pattern library for design and transformation |
| skills-oriented lesson design principles | Shared Capability | Orchestration | Reusable design logic that powers builder flows |
| OPAL library and population routing | Shared Capability | Architecture | Library first; architecture if it defines routing contracts |
| classroom integration continuum | Architecture | Shared Capability | Shared depth-of-deployment model that shapes runtime choices |
| ED421 transformation templates | Shared Capability | Orchestration | Template library plus lecturer-product engine |
| transformation levels: light / medium / radical | Orchestration | Shared Capability | Product decision model for redesign workflows |
| mini-course builder concepts | Orchestration | Shared Capability | Product flow using reusable modular logic |
| credential and micro-credential schemas | Shared Capability | Architecture | Shared model; architecture only for object contract |
| credential recipes for specific domains | Bot/Feature | Content Asset | Narrow, local implementation logic |
| presentation-bot pedagogical framework | Bot/Feature | Content Asset | Strong but bounded to one bot family |
| paraphrase skill progression model | Bot/Feature | Shared Capability | Local now; could graduate if reused across skills layer |
| research-readiness rubrics for one discipline | Bot/Feature | Content Asset | Narrow pedagogical use |
| local rubrics for one assignment | Content Asset | Bot/Feature | Instructional payload rather than platform logic |
| domain readings, case studies, prompts | Content Asset | None | Content used by flows, not governing the platform |

## Specific Materials Already In The Repo

### Architecture-Oriented

- `docs/MASTER_LOGIC.md`
- `docs/system_map.md`
- `docs/system_overview.md`
- `docs/ARCHITECTURE_STACK.md`
- `docs/DOCS_SECOND_PASS_DECISIONS.md`

### Shared Capability Candidates

- `docs/academic-literacy-map.md`
- `docs/opal-populations.md`
- `docs/ARCHITECTURE_INTEGRATION_AUDIT.md`
- `docs/DOCS_ONLY_ARCHITECTURE_ELEMENTS.md`
- ED421 transformation-template material under the `drive-download` docs

### Product Orchestration Candidates

- `docs/BOT_ARCHITECT_SP.md`
- `docs/LESSON_SPACE_CONTRACT.md`
- `docs/LECTURER_ARCHITECTURE_PROPOSAL.md`
- `docs/drive-download-20260320T045128Z-1-001/שלבים בבניית אפליקציה_  מערכת ED421.md`

### Bot Or Feature Packs

- `docs/בניית בוט מלווה סטודנטים בהכנת פרזנטציה.md`
- `docs/drive-download-20260320T034648Z-1-001/סיכום חומרים למאגר הידע של בוט פרפרזה.md`
- domain-specific support materials in legacy bot-building docs

## Promotion Rules

Some material can move upward over time.

This should happen only when reuse or governance demands it.

### Example 1: Pedagogical DNA

Current best fit:

- shared capability

Promotion condition:

- it becomes part of config schema, runtime routing, or enforcement logic

### Example 2: Paraphrase Skill Model

Current best fit:

- bot/feature pack

Promotion condition:

- it becomes a generalized skill-diagnosis model used across the skills branch

### Example 3: Credential Logic

Current best fit:

- shared capability plus orchestration

Promotion condition:

- a stable credential object and evidence contract becomes system-wide

### Example 4: Active Learning Principles

Current best fit:

- shared capability

Promotion condition:

- the system declares mandatory runtime affordances derived from them

## What Should Be Added Next To The Architecture Picture

Based on this mapping, the strongest missing first-class containers are:

1. shared skill ontology and diagnosis library
2. transformation-template library
3. active-learning and skills-oriented design pattern library
4. credential logic library
5. product protocols registry

These are important enough to become named platform containers, but not all of them should be merged into architecture.

## Final Statement

The key discipline for MilEd.One now is selective elevation.

Important material should not automatically become architecture.

But important reusable material also should not remain buried in local notes or single-bot documents.

This mapping is the bridge between those two mistakes.