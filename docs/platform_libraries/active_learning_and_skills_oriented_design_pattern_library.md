# Active Learning And Skills-Oriented Design Pattern Library

## Purpose

This document is the first draft of a shared active-learning and skills-oriented design pattern library for MilEd.One.

Its job is to hold reusable pedagogical patterns that can be called by redesign workflows, lesson builders, and support bots.

## Source Lineage

Primary sources used in this first draft:

- `docs/ARCHITECTURE_CANON_AND_SHARED_LIBRARIES.md`
- `docs/PLATFORM_KNOWLEDGE_ROADMAP.md`
- `docs/drive-download-20260320T034946Z-1-001/הבסיס התיאורטי של הרצף הפדגוגי-טכנולוגי בשילוב בוט בכיתה.md`
- reflective and scaffolded process materials across the docs corpus

## Core Design Claim

MilEd should not let every product hardcode its own teaching patterns.

Reusable pedagogical patterns should be named once and re-used across transformation, lesson runtime, and bot support.

## What This Library Owns

This library owns:

- named design patterns
- pattern families
- when a pattern is pedagogically appropriate
- what kinds of evidence a pattern tends to produce

This library does not own:

- transformation workflow sequence
- skill meaning
- product-local UI steps

## Draft Pattern Families

### 1. Scaffolding Patterns

- micro-task decomposition
- hint ladder
- graduated release
- bounded correction load

### 2. Inquiry Patterns

- guided inquiry
- scaffolded inquiry
- question-to-evidence progression
- curiosity trigger followed by evidence requirement

### 3. Reflection Patterns

- reflective checkpoint
- metacognitive pause
- error normalization with revision prompt
- post-performance reflection

### 4. Collaborative Patterns

- pair comparison
- role-based discussion
- shared knowledge mapping
- collective option evaluation

### 5. Authentic Performance Patterns

- task-to-artifact
- artifact-to-defense
- source evaluation before claim building
- real audience framing

### 6. Feedback Patterns

- immediate self-check
- evidence-based confirmation
- revision loop with actionable feedback
- feedback before pathway choice

## Draft Pattern Records

### Guided Inquiry

- best fit: development phase
- typical artifact: question-response chain, source-backed answer
- likely evidence: explanation quality, evidence use, claim revision

### Bounded Correction Load

- best fit: early development and language support contexts
- typical artifact: revised micro-response
- likely evidence: repair attempt, retained correction, lower overload signal

### Reflective Checkpoint

- best fit: reflection and post-performance transitions
- typical artifact: reflective note, revision rationale
- likely evidence: metacognitive articulation, ownership signal

### Artifact-To-Defense

- best fit: advanced development or assessment-to-learning transition
- typical artifact: presentation, oral defense, explanation of choices
- likely evidence: transfer, verbal reasoning, evidence-backed defense

## Pattern Selection Logic

Patterns should be selected by fit, not by fashion.

Useful selection dimensions include:

- learner readiness
- phase
- evidence needed
- cognitive load
- autonomy target

Additional useful selectors:

- collaboration need
- feedback latency
- output formality

## Pattern-To-Evidence Direction

The library should eventually support a simple directional logic:

- pattern family -> likely artifact type
- artifact type -> likely evidence signal
- evidence signal -> possible skill or credential relevance

## Pattern Limits

Patterns should not be treated as universally good.

Examples:

- guided inquiry can fail when learners need vocabulary access before inquiry begins
- reflective checkpoints can become empty ritual when no artifact or event anchors them
- bounded correction load can under-correct if the task is already at advanced revision stage

## Risks And Failure Modes

- patterns become inspirational prose instead of reusable units
- products duplicate pattern logic with different names
- pattern choice ignores phase or evidence needs

## Final Statement

This library gives MilEd a reusable pedagogical pattern layer beneath transformation and runtime design.

That is necessary if the platform is going to scale intentionally rather than by repeating similar teaching logic in new wording.