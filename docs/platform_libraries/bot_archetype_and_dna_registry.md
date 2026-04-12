# Bot Archetype And DNA Registry

## Purpose

This document is the first draft of a shared bot archetype and pedagogical DNA registry for MilEd.One.

Its job is to define reusable archetypal behavior patterns that sit below core architecture and above individual bot packs.

## Source Lineage

Primary sources used in this first draft:

- `docs/STRATEGIC_MAP_V3.md`
- `docs/KNOWLEDGE_AUDIT_V3.md`
- `docs/BOT_ARCHITECT_SP.md`

## Core Design Claim

MilEd should not describe every bot as a separate invention.

Many bots are structured combinations of recurring pedagogical DNA types.

The registry should stabilize those recurring types so products and builders can reference them without re-inventing the behavior model each time.

## What This Registry Owns

This registry owns:

- pedagogical DNA names
- archetypal behavior summaries
- common phase alignments
- common enforcement tendencies
- common risk patterns for DNA combinations

This registry does not own:

- architecture law
- product workflow sequence
- local bot-specific content packs

## Draft DNA Types

### 1. Socratic

- Core behavior: advances by questioning rather than telling
- Typical phases: development, reflection
- Enforcement tendency: strict when answer-giving would bypass thinking

### 2. Scaffolding

- Core behavior: reduces cognitive load through staged support
- Typical phases: diagnostic, development
- Enforcement tendency: moderate, with support fading over time

### 3. Informational

- Core behavior: explains and clarifies directly
- Typical phases: diagnostic
- Enforcement tendency: minimal unless governance rules override

### 4. Evaluative

- Core behavior: judges performance against explicit criteria
- Typical phases: analytics, reflection, evaluative development states
- Enforcement tendency: strict and rubric-sensitive

### 5. Transformational

- Core behavior: changes conceptual, stylistic, or structural performance deeply
- Typical phases: development, reflection, design
- Enforcement tendency: moderate, often paired with scaffolding

### 6. Emotional

- Core behavior: regulates affect, safety, and persistence
- Typical phases: any
- Enforcement tendency: soft unless paired with gatekeeping or evaluative logic

### 7. Gatekeeper

- Core behavior: blocks advancement until readiness or evidence conditions are met
- Typical phases: development, diagnostic gates
- Enforcement tendency: strict

### 8. Metacognitive

- Core behavior: triggers reflection, self-observation, and ownership
- Typical phases: reflection, development
- Enforcement tendency: adaptive

### 9. Analytical

- Core behavior: interprets patterns, evidence, or institutional signals
- Typical phases: analytics
- Enforcement tendency: low in pedagogy, high in interpretive clarity

### 10. Hybrid

- Core behavior: combines multiple DNA types in one governed configuration
- Typical phases: varies
- Enforcement tendency: derived from the active combination and phase

## Phase Fit Tendencies

The registry should not treat all DNA types as equally appropriate in every phase.

### Diagnostic Fit

- strongest fit: Informational, Scaffolding, Gatekeeper
- conditional fit: Emotional, Analytical
- risk fit: pure Socratic without enough scaffolding

### Development Fit

- strongest fit: Scaffolding, Socratic, Transformational, Gatekeeper
- conditional fit: Emotional, Metacognitive
- risk fit: purely Informational behavior that removes productive struggle

### Reflection Fit

- strongest fit: Metacognitive, Emotional, Socratic, Evaluative
- conditional fit: Transformational
- risk fit: heavy Gatekeeper without reflective justification

### Design Fit

- strongest fit: Transformational, Analytical, Socratic
- conditional fit: Scaffolding
- risk fit: Emotional-first behavior with no design rigor

### Analytics Fit

- strongest fit: Analytical, Evaluative
- conditional fit: Informational
- risk fit: Scaffolding and Emotional modes that soften necessary interpretive clarity

## Draft Archetype Families

### Builder Archetypes

- faculty-facing configuration or design support
- often combine Socratic, Transformational, and Analytical DNA

### Skill Developer Archetypes

- student-facing guided progression bots
- often combine Scaffolding and Transformational DNA

### Gatekeeper Archetypes

- progression-control bots
- often combine Gatekeeper, Evaluative, and Scaffolding DNA

### Reflection Archetypes

- ownership and meaning-making bots
- often combine Emotional and Metacognitive DNA

### Companion Archetypes

- long-form contextual course support
- often combine Scaffolding, Socratic, Informational, and Emotional DNA

### Evaluator Archetypes

- evidence- and rubric-sensitive judgment bots
- often combine Evaluative and Analytical DNA, sometimes with Gatekeeper constraints

### Transition Archetypes

- bots that convert diagnosis or evaluation into a learning pathway
- often combine Diagnostic, Emotional, and Scaffolding tendencies

## Combination Tensions

Some DNA combinations are productive.

Some are unstable unless governance rules explicitly compensate.

### Productive Combinations

- Scaffolding + Transformational
- Socratic + Metacognitive
- Evaluative + Analytical
- Gatekeeper + Scaffolding

### High-Risk Combinations

- Emotional + strict Gatekeeper without a supportive transition rule
- Informational + Socratic with no active phase selection
- Evaluative + Emotional where criteria become softened by comfort logic
- Transformational + Short Mode when the design requires cumulative progression

## Example Bot Mapping

### Bot Builder Bot

- DNA tendency: Socratic + Transformational + Analytical
- phase tendency: design
- core risk: allowing attractive wording to hide governance contradictions

### Paraphrase Trainer Bot

- DNA tendency: Scaffolding + Transformational
- phase tendency: development
- core risk: slipping into substitution under pressure for examples

### Innovation Project Bot

- DNA tendency: Scaffolding + Gatekeeper
- phase tendency: development with evaluative gates
- core risk: gate strictness without enough preparatory coaching

### Faculty Mentor Bot

- DNA tendency: Socratic + Transformational
- phase tendency: design
- core risk: over-general advice without course-grounded constraints

## Registry Use Rule

The DNA registry should be used to classify and constrain bot behavior.

It should not be used as a substitute for phase governance, review mode, or architecture law.

## Combination Rule

DNA combinations are legitimate only when their enforcement tendencies and phase logic remain coherent.

The registry should therefore be used with governance checks, not as a free-mix menu.

## Risks And Failure Modes

- DNA labels become style tags instead of behavior contracts
- products mix incompatible DNA types without phase-aware governance
- local bot descriptions replace registry-level naming
- the registry is used as a marketing taxonomy instead of a control taxonomy

## Final Statement

This registry gives MilEd a shared language for how bots behave pedagogically.

That is necessary if the platform is going to scale bot creation without multiplying disconnected bot identities.