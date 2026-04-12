# Docs Second-Pass Decisions Review

## Purpose

This document records a second deep review of the MilEd.One documentation corpus from a different angle.

The first docs-focused pass asked:

- what important architectural elements already exist in the documentation?

This second pass asks:

- where do the docs still pull in different directions?
- where are terms duplicated or unstable?
- where is a concept present but not yet architecturally locked?
- which decisions now need to be made explicitly?

The goal is to reduce implementation drift.

## Main Judgment

The docs corpus is architecturally rich and strategically strong, but still not fully normalized.

The main problem is no longer missing depth.

The main problem is incomplete consolidation.

In other words:

- the ideas are there
- many of the layers are there
- but some critical relationships between them are still implicit, split across documents, or named inconsistently

This means a developer can read the corpus, understand most of the vision, and still make materially different implementation decisions.

## Main Tensions

### 1. Phase Versus Function As The Governance Axis

The docs clearly move toward phase supremacy, but phase is not yet fully normalized as a first-class field across the system.

Open tension:

- is phase assigned per bot, per course, per lesson, or per session state?

Why it matters:

- governance becomes unstable if bot type, function, and phase are all discussed, but phase is not explicitly owned somewhere in the architecture

Main sources:

- `docs/MASTER_LOGIC.md`
- `docs/KNOWLEDGE_AUDIT_V3.md`

### 2. Enforcement Is Described More Clearly Than It Is Positioned

The docs describe runtime enforcement, guards, readiness, and escalation logic, but they do not lock where each of these is supposed to live in the execution pipeline.

Open tension:

- is enforcement mostly prompt-level, runtime-level, response-level, or all three with explicit division?

Why it matters:

- without a positioned enforcement model, teams can believe they are implementing the same governance logic while actually building incompatible mechanisms

Main sources:

- `docs/MASTER_LOGIC.md`
- `docs/DOCS_ONLY_ARCHITECTURE_ELEMENTS.md`

### 3. Bot Type And Pedagogical DNA Are Both Strong, But Not Yet Joined

The documentation contains both bot-type logic and a sophisticated pedagogical DNA taxonomy.

Open tension:

- are these parallel classification systems, or should one be mapped onto the other in configuration?

Why it matters:

- if DNA stays descriptive-only, it will influence strategy but not implementation

Main sources:

- `docs/MASTER_LOGIC.md`
- `docs/STRATEGIC_MAP_V3.md`
- `docs/KNOWLEDGE_AUDIT_V3.md`

### 4. The Questionnaire Exists As A System, But Not Yet As One Stable Reference

The questionnaire logic is deeply developed, but the full picture still lives across more than one document.

Open tension:

- should `MASTER_LOGIC` become the single complete questionnaire source, or should it explicitly delegate to a separate canonical questionnaire spec?

Why it matters:

- split authority creates silent divergence

Main sources:

- `docs/MASTER_LOGIC.md`
- `docs/KNOWLEDGE_AUDIT_V3.md`

### 5. Course Branch And Skills Branch Are Conceptually Connected, But Operationally Under-Specified

The bridge idea is strong and strategically important.

The unresolved question is not whether the two branches should feed each other.

The unresolved question is how that bridge is represented as state, context, and output.

Main sources:

- `docs/LESSON_SPACE_CONTRACT.md`
- `docs/ARCHITECTURE_STACK.md`

## Naming Collisions And Parallel Concepts

### Governance Vocabulary Drift

The docs currently use several partially overlapping terms:

- runtime enforcement
- phase-based governance
- readiness gates
- post-guard
- design-time binding

These may refer to different layers, but they are not yet normalized into one vocabulary system.

Main risk:

- readers may collapse them into one mechanism or treat the same mechanism as multiple layers

### Process Vocabulary Drift

The documentation uses both `processMode` and `processType` in places that appear closely related.

Main risk:

- configuration and questionnaire mappings may drift because the architecture does not declare one authoritative label

### Prohibition Vocabulary Drift

The docs include both concepts such as `NEVER_DO_LIST` and `FORBIDDEN_KNOWLEDGE`.

These are not identical, but they are close enough that future implementations could blur them.

Main risk:

- safety, role boundaries, and epistemic constraints get mixed into one undifferentiated bucket

### Readiness And Confirmation Vocabulary Drift

The docs separately articulate readiness signals and evidence-based confirmation.

Main risk:

- one implementation may treat them as the same thing, while another treats one as entry validation and the other as response validation

## Hierarchy Gaps

### Questionnaire Completeness Gap

The full A-I questionnaire logic is not yet fully consolidated in one clearly dominant specification.

Effect:

- design and implementation teams may rely on different subsets of the questionnaire

### DNA Placement Gap

Pedagogical DNA is well-developed as an intellectual layer, but not yet clearly positioned as either:

- strategy-only classification
- config-level field
- runtime routing input
- or all three

### Classroom Integration Gap

The classroom integration continuum exists, but it is not yet sufficiently placed inside the stack as a planner decision that shapes runtime form.

### OPAL Routing Gap

OPAL appears as a rich asset system, but its relation to Skills Branch, population routing, and live Lesson Space still needs explicit hierarchy.

## Missing Explicit Decisions

### 1. Who Owns Phase

The docs need one explicit answer to all of the following:

- where phase is declared
- whether it can change over time
- who is allowed to change it
- whether it is visible in UI

### 2. Where Enforcement Actually Lives

The docs need to state where each guard or enforcement stage operates:

- config validation
- prompt assembly
- runtime request check
- response validation
- lesson gating

### 3. How Language Mode Interacts With Hebrew Adaptation

The current materials imply multiple layers of language control but do not define precedence.

The docs need a conflict-resolution rule.

### 4. What The Session Persistence Schema Is

Continuity is presented as important, but the persisted object boundary is still not explicit enough.

The docs need to specify what is stored, what is transient, and what is recoverable later.

### 5. What The Course-Skill Bridge Contract Actually Transfers

The bridge needs an explicit contract describing:

- inputs from course into skill support
- outputs from skill work back into course progression
- how Lesson Space participates as the meeting point

## Top Decisions To Lock Now

### 1. Make Phase Mandatory In The Core Schema

Phase should become a required first-class declaration across bot definitions and lesson/runtime design.

Reason:

- this removes ambiguity about governance ownership

### 2. Publish One Enforcement Pipeline

The docs should publish a single authoritative enforcement pipeline with named stages and expected responsibilities.

Reason:

- this converts governance from aspiration into testable architecture

### 3. Map Pedagogical DNA Into The Operating Model

The docs should explicitly decide whether DNA is:

- descriptive only
- config-level
- routing-level
- or mixed

Reason:

- otherwise DNA remains analytically impressive but operationally weak

### 4. Consolidate The Full Questionnaire Into One Canonical Home

The docs should either:

- make `MASTER_LOGIC` fully complete on questionnaire details
- or explicitly designate another file as the canonical questionnaire source

Reason:

- split authority creates drift in bot-building

### 5. Formalize The Course-Skill Bridge As A Data Contract

The docs should define:

- shared context
- shared signals
- return outputs
- branch handoff logic

Reason:

- the bridge is currently one of the strongest strategic ideas and one of the weakest operationally specified layers

## Top Ambiguities That Could Create Drift

### 1. Phase Mutability

If phase is not clearly fixed or clearly changeable, runtime governance will vary by implementer.

### 2. Guard Invocation Mechanism

If the docs do not say how violations are blocked, corrected, or logged, teams will build different safety behavior while thinking they complied.

### 3. Language Precedence

If language mode and Hebrew adaptation are not given explicit precedence rules, localization logic can become inconsistent.

### 4. Continuity Persistence Boundary

If the continuity object is not clearly bounded, evidence and follow-up will remain ad hoc.

### 5. Population Routing Relationship To Classroom Integration

The docs still need to say whether population routing and classroom integration level are independent selectors, linked selectors, or one derived from the other.

## What This Changes Relative To The First Docs Pass

The first docs pass expanded the architecture picture.

This second pass changes the task.

The main need is no longer only to incorporate more documented layers.

The next need is to normalize and lock the relationships between those layers.

That means the architecture work should now move from:

- inventory
- synthesis

to:

- canonical naming
- explicit ownership
- decision locking
- contract definition

## Recommended Next Move

The next document should not be another broad synthesis.

It should be a short architectural decisions record for the docs corpus itself.

Its job should be to lock:

- governance terminology
- phase ownership
- enforcement pipeline
- DNA placement
- course-skill bridge contract
- continuity object boundary

## Final Statement

The MilEd.One docs corpus is no longer weak because it lacks ideas.

It is strong enough that the main architectural risk has shifted.

The risk is now conceptual drift between rich documents that are individually strong but not yet fully normalized into one enforceable operating language.