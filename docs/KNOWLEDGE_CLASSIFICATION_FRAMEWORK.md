# Knowledge Classification Framework

## Purpose

This document answers a critical design question for MilEd.One:

When new pedagogical or research material is discovered, how do we decide whether it belongs to the system architecture, to shared platform capabilities, or only to specific bots and features?

This question matters because the project now contains a large amount of strong material in several families:

- the Bot Architect questionnaire and bot-building logic
- skill diagnosis and skill classification research
- active learning and skill-oriented learning design principles
- lesson transformation and course redesign logic
- mini-course and credential design material
- course-specific and bot-specific pedagogical assets

Not all of these should become architecture.

If everything becomes architecture, the system becomes bloated and rigid.

If too little becomes architecture, the system becomes fragmented and every bot reinvents core logic.

## Main Principle

MilEd.One should classify knowledge by the level of reuse and governance it requires.

The correct question is not:

- is this material important?

The correct question is:

- what level of the system must consistently know, enforce, or reuse this material?

## The Five Knowledge Layers

### Layer A: System Architecture Knowledge

This is knowledge that shapes how the whole system is organized and constrained.

It belongs in architecture if it determines at least one of the following:

- engine behavior across the whole platform
- governance or enforcement logic
- branch or routing logic
- shared runtime state structure
- universal object schemas
- relations between major system layers

Typical examples:

- One-Engine Principle
- kernel rules
- phase-based governance
- enforcement pipeline
- branch model
- Lesson Space as runtime layer
- continuity object boundaries
- shared contracts between course, skill, and lesson layers

Sources that clearly belong here:

- `docs/MASTER_LOGIC.md`
- `docs/ARCHITECTURE_STACK.md`
- `docs/DOCS_SECOND_PASS_DECISIONS.md`

Rule:

If a change would require multiple products, branches, or bots to behave differently in a coordinated way, it is probably architecture.

### Layer B: Shared Platform Capability Knowledge

This is not architecture proper, but it is still cross-system infrastructure.

It belongs here if it provides reusable capabilities that many bots, lessons, or planning flows can draw from.

Typical examples:

- skill taxonomy frameworks
- skill-diagnosis frameworks
- active learning pattern libraries
- transformation-template libraries
- academic literacy maps
- credential-building schemas
- population-routing knowledge models

These should not live in the kernel.

But they also should not be trapped inside one bot if they are intended for wide reuse.

Sources that strongly point here:

- `docs/academic-literacy-map.md`
- `docs/ARCHITECTURE_INTEGRATION_AUDIT.md`
- `docs/DOCS_ONLY_ARCHITECTURE_ELEMENTS.md`
- `docs/drive-download-20260320T045128Z-1-001/שלבים בבניית אפליקציה_  מערכת ED421.md`
- `docs/drive-download-20260320T044443Z-1-001/מסמך RAW 1– כל החומרים הלא מסודרים שלי.md`

Rule:

If the material defines a reusable library, model, taxonomy, or pattern family that many experiences may call into, it belongs in shared capabilities.

### Layer C: Product Orchestration Knowledge

This layer translates shared capabilities into actual system products and flows.

It belongs here if it determines how a major product surface works, without needing to become kernel-level logic.

Typical examples:

- the Bot Architect workflow
- lesson-transformation workflow for lecturer support
- mini-course builder flow
- credential pathway composer
- course-to-skill bridge workflow

This is where system products use shared capabilities in a structured way.

Examples:

- Bot Architect questionnaire logic is not just “a questionnaire.” It is the intake protocol of a core system product.
- ED421 transformation templates are not mere content. They are orchestration assets for a lecturer-facing transformation product.

Sources that point here:

- `docs/BOT_ARCHITECT_SP.md`
- `docs/LESSON_SPACE_CONTRACT.md`
- `docs/LECTURER_ARCHITECTURE_PROPOSAL.md`
- `docs/drive-download-20260320T045128Z-1-001/שלבים בבניית אפליקציה_  מערכת ED421.md`

Rule:

If the knowledge defines how a named product flow operates from intake to output, it belongs to orchestration, not to kernel architecture.

### Layer D: Feature Or Bot-Specific Knowledge

This layer contains logic that is reusable only within a narrow zone.

It belongs here if it serves a particular bot family, feature family, or bounded workflow.

Typical examples:

- a paraphrase skill progression model for a paraphrase bot
- a presentation coaching framework for a presentation bot
- a research-readiness rubric for one disciplinary research companion
- diagnostic prompts for one faculty-support workflow

These can be sophisticated and valuable without becoming general platform architecture.

Sources that point here:

- `docs/בניית בוט מלווה סטודנטים בהכנת פרזנטציה.md`
- `docs/drive-download-20260320T034648Z-1-001/סיכום חומרים למאגר הידע של בוט פרפרזה.md`

Rule:

If removing the material would affect one bot or one narrow product family, but not the overall system model, it is feature-level knowledge.

### Layer E: Content, Domain, And Pedagogical Asset Knowledge

This is the knowledge that feeds the system, but does not define how the system works.

Typical examples:

- discipline-specific examples
- sample cases
- task prompts
- readings
- course artifacts
- rubrics for a particular assignment
- local instructional snippets

This material is essential for usefulness, but it should not be mistaken for architecture.

Rule:

If the material is mainly used as payload, instructional content, or context for a specific learning situation, it belongs here.

## Where The Bot Architect Questionnaire Belongs

This requires a precise distinction.

The Bot Architect questionnaire is not a generic questionnaire.

It is a core orchestration instrument of the bot-building system.

That means it has three layers at once:

### Architectural Aspect

The existence of a mandatory structured intake process for bot creation is architectural.

Why:

- it governs how new bots enter the system
- it protects one-engine integrity
- it standardizes variable extraction and prompt assembly

### Orchestration Aspect

The actual staged questionnaire flow belongs to the Bot Architect product flow.

Why:

- it is the runtime procedure through which faculty input becomes bot configuration

### Non-Architectural Aspect

The exact wording of every question is not necessarily architectural.

Some question wording may evolve as product design, UX, or stress-test quality improves.

So the right distinction is:

- the existence, role, and output contract of the Bot Architect questionnaire are architectural or orchestration-level
- the exact prompts and interaction details are product-level assets

## Where Skill Diagnosis Research Belongs

Skill diagnosis is usually not architecture by itself.

It becomes architectural only when it changes shared system contracts.

### It belongs in shared capability when:

- the platform needs a common skill ontology
- multiple bots should diagnose skill levels in compatible ways
- course and skills branches must exchange skill evidence using the same model

### It belongs in product orchestration when:

- a skill diagnosis flow is part of a named product, such as a skill pathway intake or lesson transformation wizard

### It belongs in bot-specific logic when:

- diagnosis is tailored to one bot, one discipline, or one narrow skill family

Practical test:

If the diagnosis model must be shared across multiple skill bots, credentials, and dashboards, it should become a platform capability rather than staying inside one bot.

## Where Active Learning And Skill-Oriented Design Principles Belong

These principles usually belong in shared platform capabilities, not in the kernel.

Why:

- they are reusable design knowledge
- they can inform transformation templates, lesson-space design, and lecturer support
- they do not need to become immutable constitutional logic

However, some of their consequences may rise into architecture.

For example:

- if Lesson Space must always support activity, evidence, and reflection, that requirement becomes architectural
- but the specific catalog of active-learning patterns belongs to a capability library or transformation template DB

So the split is:

- active learning as mandatory runtime affordance may be architectural
- active learning techniques and pattern libraries are shared capabilities

## Where Mini-Course And Credential Design Belong

This material spans multiple layers.

### Architecture Level

Only the cross-system contract belongs here:

- what a credential object is
- how it relates to skills, evidence, and course work
- whether credentials are branch outputs, standalone products, or both

### Shared Capability Level

Reusable models for:

- stacking micro-units
- skill-to-credential mapping
- evidence thresholds
- progression logic

### Product Orchestration Level

Actual flows such as:

- mini-course builder
- credential composer
- lecturer credential design workflow

### Feature Level

Specific credential recipes for one domain or one institution

This is critical because credential logic can easily be over-architected.

The architecture should define the contract, not every credential pattern.

## Decision Rules: What Belongs Where

Use these tests before promoting any material into the architecture stack.

### Test 1: Scope Of Reuse

Ask:

- does this need to be reused across many bots, branches, or products?

If no, it likely does not belong in architecture.

### Test 2: Governance Dependence

Ask:

- must the system enforce this consistently, or is it advisory knowledge?

If it must be enforced, it leans toward architecture.

### Test 3: Data Contract Impact

Ask:

- does this require shared objects, fields, state, or interoperability contracts?

If yes, it leans toward architecture or shared capability.

### Test 4: Product Specificity

Ask:

- is this mainly part of one product flow?

If yes, it belongs to orchestration.

### Test 5: Asset Versus Engine

Ask:

- is this a reusable asset library, or a rule about how the engine must behave?

If it is an asset library, keep it below the kernel.

## Practical Classification Of The Materials You Mentioned

### 1. Bot Architect Questionnaire

- architecture: yes, as mandatory bot-intake contract
- shared capability: partially, through variable model and stress-test logic
- product orchestration: yes, strongly
- feature-specific: only at exact wording/interview UX level

### 2. Research On Skill Diagnosis And Skill Classification

- architecture: only if it defines a shared system-wide skill ontology or evidence contract
- shared capability: yes, strongly
- product orchestration: yes, for skill-routing or pathway-building flows
- feature-specific: yes, when tailored to one bot or one discipline

### 3. Active Learning And Skills-Oriented Teaching Principles

- architecture: only as runtime requirements or transformation constraints
- shared capability: yes, strongly
- product orchestration: yes, for lesson transformation flows
- feature-specific: yes, when used inside one bot's teaching method

### 4. Mini-Courses And Credentials

- architecture: only for object model and branch/output contracts
- shared capability: yes, for reusable credential logic
- product orchestration: yes, for builders and pathway flows
- feature-specific: yes, for specific credential recipes

### 5. Existing Course Transformation Material For ED421

- architecture: partially, where it defines shared system contracts
- shared capability: strongly, as template and pattern libraries
- product orchestration: strongly, as lecturer transformation workflow
- feature-specific: partially, where templates are domain-bound

## Main Recommendation

MilEd.One should stop treating “important pedagogical knowledge” as one bucket.

Instead, it should maintain at least four explicit repositories of knowledge:

1. architecture rules and contracts
2. shared capability libraries
3. product orchestration protocols
4. bot- or feature-specific knowledge assets

This will allow the system to grow in depth without confusing:

- platform law
- reusable pedagogy
- product workflows
- local instructional content

## What This Means For The Next Architecture Pass

The next architecture step should not be to absorb all valuable material into the stack.

It should be to define which families of knowledge deserve first-class platform containers.

The strongest candidates are:

- shared skill ontology and diagnosis layer
- transformation template library
- credential object and pathway contract
- active-learning and skills-oriented design pattern library
- population-routing and adaptation layer

These are not all kernel architecture.

But they are too central to remain trapped inside isolated bots or raw documents.

## Final Statement

The real architectural task is not deciding whether a body of pedagogical knowledge is valuable.

It is deciding the correct depth at which the system should institutionalize that knowledge.

That is the difference between a coherent platform and a pile of good ideas.