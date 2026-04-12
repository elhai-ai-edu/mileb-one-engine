# Knowledge Containers Decisions

## Purpose

This document turns the knowledge-classification framework into concrete architectural decisions.

Its goal is to prevent MilEd.One from collapsing all pedagogical knowledge into one undifferentiated mass.

The system now contains enough material that it needs explicit containers.

Without them, the project will keep confusing:

- architecture
- reusable pedagogical libraries
- product workflows
- bot-local knowledge

## Main Decision

MilEd.One should maintain four first-class knowledge containers and one supporting content layer.

These containers are not all equal.

They exist at different levels of authority and reuse.

## Container 1: Architecture Rules And Contracts

### Role

This container holds the rules that define how the platform itself is organized and governed.

### What belongs here

- kernel rules
- one-engine constraints
- runtime governance and enforcement model
- branch contracts
- continuity and evidence contracts
- object contracts shared across multiple products
- architectural ownership rules

### What does not belong here

- pedagogical pattern catalogs
- diagnostic questionnaires for local use
- discipline-specific models
- transformation recipes
- specific bot playbooks

### Canonical examples

- One-Engine Principle
- phase ownership
- enforcement pipeline
- Lesson Space runtime role
- course-skill bridge contract
- credential object boundary

### Main repository candidates

- `docs/MASTER_LOGIC.md`
- `docs/ARCHITECTURE_STACK.md`
- future ADR-style decisions docs

## Container 2: Shared Capability Libraries

### Role

This container holds reusable pedagogical and analytical libraries that many products and bots may call into.

It is below architecture, but above any single bot.

### What belongs here

- skill ontologies
- skill diagnosis models
- academic literacy maps
- active-learning pattern libraries
- transformation template libraries
- differentiated pedagogy libraries
- population-routing models
- credential logic libraries
- rubric families intended for reuse

### What does not belong here

- immutable kernel rules
- product-specific intake flows
- one-bot-only scaffolds

### Main architectural reason this container must exist

If these materials stay hidden inside individual bots or raw notes, the platform cannot reuse them consistently.

### Example families

- academic literacy architecture
- skills taxonomies and assessment heuristics
- active-learning and task-design pattern banks
- ED421 transformation templates
- OPAL-like action libraries

## Container 3: Product Orchestration Protocols

### Role

This container holds the structured workflows through which system products operate.

It is the layer that turns reusable capabilities into working products.

### What belongs here

- Bot Architect intake and stress-test flow
- lecturer lesson-transformation flow
- mini-course builder workflow
- credential composer workflow
- course-to-skill bridge workflow
- live lesson orchestration flow

### What does not belong here

- universal system law
- generic pattern libraries with no workflow
- domain content assets

### Canonical examples

- the Bot Architect questionnaire as a required intake mechanism
- transformation-level selection logic in ED421-like flows
- staged export logic for course redesign outputs

### Main repository candidates

- `docs/BOT_ARCHITECT_SP.md`
- lesson-space and lecturer workflow specs
- future builder flow specs

## Container 4: Bot And Feature Knowledge Packs

### Role

This container holds bounded knowledge used by one bot family, one feature family, or one narrow pedagogical assistant.

### What belongs here

- paraphrase bot progression logic
- presentation-coaching heuristics
- one-domain research readiness flow
- feature-specific diagnostics
- narrow rubrics and support protocols

### What does not belong here

- cross-platform skills ontology
- platform-wide governance
- transformation libraries intended for many products

### Main rule

This container is allowed to be deep and sophisticated.

It is not lesser knowledge.

It is simply narrower in scope.

## Supporting Layer: Content And Pedagogical Assets

### Role

This is the payload layer that feeds the system.

### What belongs here

- examples
- readings
- assignment prompts
- domain texts
- local cases
- prompt snippets
- instructional fragments
- course-specific artifacts

### Why it is not a first-class architecture container

Because it does not define the operating logic of the platform.

It feeds the containers above.

## Decision Set

### Decision 1

The Bot Architect questionnaire is not classified as generic assessment content.

It is a product orchestration protocol with architectural significance.

### Decision 2

Skill diagnosis and skill classification research should not be pushed directly into architecture unless they define a shared cross-system ontology, state contract, or interoperability rule.

Otherwise they belong in shared capability libraries.

### Decision 3

Active-learning and skills-oriented learning principles should usually live as shared capability libraries.

Only their mandatory runtime implications should rise into architecture.

### Decision 4

Transformation templates for course and lesson redesign should be treated as shared capability libraries plus product orchestration assets.

They should not be absorbed into the kernel.

### Decision 5

Mini-course and credential materials should be split into:

- architectural contracts
- shared credential logic
- product builder workflows
- specific credential recipes

### Decision 6

No future document should be promoted to architecture only because it is pedagogically rich.

Promotion requires satisfying one of these tests:

- shared governance requirement
- shared data-contract requirement
- shared runtime-state requirement
- cross-product enforcement requirement

## Recommended Repository Structure

MilEd.One should progressively normalize its documentation and knowledge assets into a structure like this:

### A. Architecture

- constitutional rules
- system contracts
- runtime governance
- object boundaries
- cross-product interfaces

### B. Shared Capabilities

- skills library
- literacy library
- active-learning pattern library
- transformation-template library
- credential logic library
- differentiation library

### C. Product Protocols

- Bot Architect
- Lesson Space orchestration
- lecturer redesign flows
- credential builders
- branch bridge workflows

### D. Bot Packs

- presentation bot pack
- paraphrase bot pack
- research bot pack
- discipline-specific instructional packs

### E. Content Assets

- readings
- prompt snippets
- examples
- assignments
- rubrics
- local policy inserts

## Operational Rule For Future Work

Any new body of material should be classified before it is integrated.

The classification question should be mandatory in future architecture work:

- architecture rule?
- shared capability?
- product protocol?
- bot pack?
- content asset?

This should become a standard review step before adding new docs to canonical system design.

## Final Statement

MilEd.One now needs knowledge governance, not only feature growth.

The system is mature enough that its main risk is no longer lack of ideas.

Its main risk is storing different kinds of knowledge at the wrong level of the system.