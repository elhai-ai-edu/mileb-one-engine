# MilEd.One Architecture Stack

## Purpose

This document unifies the architecture work produced so far into one layered model.

Its job is not to replace the existing documents, but to place them in the right order and show how they depend on each other.

The main correction is this:

MilEd.One should not be described only as a set of spaces, pages, or interfaces.

It should be described as a pedagogical operating stack in which each visible space is only one expression of deeper layers: constitution, governance, phase logic, differentiation, runtime orchestration, evidence, and redesign.

## Why A Stack Is Needed

The previous architecture work established several important truths:

- the lecturer environment needs a clearer division of responsibilities
- Lesson Space is the real pedagogical center of the system
- Course Branch and Skills Branch must remain distinct but connected
- current UI surfaces are partly overlapping and partly mispositioned

The docs-only review added an equally important correction:

- MilEd already contains canonical layers that are not visible if we describe the system only through screens and flows

Without those layers, the architecture becomes too interface-oriented and too weakly tied to the documented MilEd logic.

## Core Claim

MilEd.One is a one-engine pedagogical system organized as a layered stack:

1. Constitutional layer
2. Runtime governance layer
3. Pedagogical identity layer
4. Branch and route layer
5. Planning and design layer
6. Lesson runtime layer
7. Orchestration and control layer
8. Evidence and continuity layer
9. Research and redesign layer
10. Interface layer

The visible pages must be aligned to these layers, not treated as the architecture itself.

## Layer 1: Constitutional Layer

This is the system kernel.

It includes:

- the One-Engine Principle
- the immutable kernel principles
- the mandatory 8-layer system prompt skeleton
- the rule that customization lives in configuration, not in engine forks

This layer answers:

- what is non-negotiable
- what no bot or page is allowed to violate
- what must remain constant across all modes

Primary sources:

- `docs/MASTER_LOGIC.md`
- `docs/01_kernel_constitution.md`
- `docs/02_sp_structure.md`
- `config.json`

Architectural consequence:

No UI or workflow decision should bypass kernel rules. The product is not a collection of bots; it is one governed engine expressed through multiple pedagogical forms.

## Layer 2: Runtime Governance Layer

This layer determines how the system behaves under different pedagogical conditions.

It includes:

- phase-based runtime governance
- runtime enforcement logic
- readiness gates
- escalation and drift handling
- evidence-based confirmation instead of loose conversational affirmation

This layer answers:

- when a bot may guide, gate, refuse, or escalate
- how strict the system should be in diagnostic, development, reflection, design, and analytics phases
- how the system protects pedagogical integrity during live use

Primary sources:

- `docs/MASTER_LOGIC.md`
- `docs/DOCS_ONLY_ARCHITECTURE_ELEMENTS.md`
- `docs/ARCHITECTURE_INTEGRATION_AUDIT.md`

Architectural consequence:

Lesson runtime is not just content delivery. It is governed runtime. The lesson surface must therefore expose phase, gates, evidence state, and allowed action regime.

## Layer 3: Pedagogical Identity Layer

This layer defines what kind of pedagogical actor is operating.

It includes:

- pedagogical DNA taxonomy
- bot type and archetype logic
- audience and role definition
- variable classification such as BIND, CONFIG, STRUCT, SOFT, EXPRESSIVE, and DYNAMIC

This layer answers:

- what kind of educational work this bot or flow is doing
- who it serves
- what is fixed versus configurable

Primary sources:

- `docs/MASTER_LOGIC.md`
- `docs/STRATEGIC_MAP_V3.md`
- `docs/BOT_ARCHITECT_SP.md`

Architectural consequence:

The system should not only know which page a user is on. It should know what pedagogical identity and enforcement regime are active in that moment.

## Layer 4: Branch And Route Layer

This is where the system organizes the learner's and lecturer's macro paths.

It includes:

- Course Branch
- Skills Branch
- the bridge between them
- population routing and Hebrew adaptation
- classroom integration level selection

This layer answers:

- whether learning is currently course-led, skill-led, or balanced
- what kind of support route is appropriate for this population and context
- how the system connects discipline progression to transferable skill development

Primary sources:

- `docs/LESSON_SPACE_CONTRACT.md`
- `docs/DOCS_ONLY_ARCHITECTURE_ELEMENTS.md`
- `docs/ARCHITECTURE_INTEGRATION_AUDIT.md`
- `config.json`
- `balance.js`

Architectural consequence:

Course Branch and Skills Branch are not separate products. They are distinct pedagogical trunks with shared runtime meeting points.

## Layer 5: Planning And Design Layer

This layer is where educational structure is authored before a live lesson begins.

It includes:

- course planning
- unit planning
- branch balancing
- bot creation through the Architect flow
- playlist and sprint definition
- pre-session design

This layer answers:

- what this course is trying to achieve
- what unit logic drives the lesson
- what bot logic is needed
- what evidence or readiness structure will be used

Primary sources:

- `docs/LECTURER_ARCHITECTURE_PROPOSAL.md`
- `docs/LECTURER_ARCHITECTURE_IMPLEMENTATION_MATRIX.md`
- `docs/MASTER_LOGIC.md`

Current interface anchors:

- `my_courses.html`
- `smart_class.html`
- `architect_studio.html`

Architectural consequence:

Planning spaces should prepare runtime conditions, not duplicate live lesson behavior.

## Layer 6: Lesson Runtime Layer

This is the pedagogical heart of the system.

Lesson Space lives here.

It includes:

- live mission framing
- opening sequence
- stage and sprint progression
- books, resources, and prompts
- presentation and shared lesson focus
- student interaction with bots inside a lesson frame
- branch-sensitive support during live activity

This layer answers:

- what the class is doing now
- what students should attend to
- what help is allowed at this moment
- what branch emphasis currently dominates

Primary sources:

- `docs/LESSON_SPACE_CONTRACT.md`
- `docs/LESSON_SPACE_PEDAGOGICAL_ANALYSIS.md`
- `docs/ARCHITECTURE_INTEGRATION_AUDIT.md`

Current interface anchor:

- `lesson_view.html`

Architectural consequence:

This page should become the coherent runtime meeting point of course logic, skills logic, bot support, evidence capture, and pacing.

## Layer 7: Orchestration And Control Layer

This layer belongs primarily to the lecturer.

It includes:

- gate opening and locking
- student presence visibility
- warmup launch
- resource push
- pacing updates
- live intervention control
- runtime monitoring

This layer answers:

- how the lecturer shapes the room in real time
- how transitions are controlled
- how the class moves between phases and tasks

Primary sources:

- `docs/LECTURER_ARCHITECTURE_PROPOSAL.md`
- `docs/ARCHITECTURE_INTEGRATION_AUDIT.md`

Current interface anchors:

- `micro_cockpit.html`
- selected pieces of `lecturer_cockpit.html`

Architectural consequence:

This layer must support Lesson Space, not compete with it. The lecturer cockpit should be a control surface beside the lesson runtime, not a second classroom.

## Layer 8: Evidence And Continuity Layer

This layer preserves learning across time.

It includes:

- evidence submission
- portfolio and process traces
- entrance tickets and warmup residues
- continuity token logic
- session state preservation
- class lock and retention rules

This layer answers:

- what was learned
- what was demonstrated
- what must continue into the next session
- how the system remembers meaningful unfinished work

Primary sources:

- `docs/ARCHITECTURE_INTEGRATION_AUDIT.md`
- `docs/DOCS_ONLY_ARCHITECTURE_ELEMENTS.md`
- `functions/classroom.js`

Architectural consequence:

MilEd should not reset after each live encounter. Lesson Space should emit continuity objects that feed later course or skill work.

## Layer 9: Research And Redesign Layer

This layer turns classroom activity into iterative pedagogical improvement.

It includes:

- pattern reading
- architecture reflection
- branch-balance recalibration
- bot redesign
- course redesign
- strategic analysis of what is working or failing

This layer answers:

- what should change after seeing the class in action
- what kind of support is missing
- what pedagogical assumptions need revision

Current interface anchors:

- `macro_cockpit.html`
- selected research-facing parts of `lecturer_cockpit.html`

Architectural consequence:

Research and redesign should consume evidence from runtime rather than act as a detached thinking room.

## Layer 9.5: Lecturer Professional Development Layer (LL Socket)

Status: reserved. Not yet implemented.

This layer is a structural placeholder for a future lifelong learning (LL) track oriented toward the lecturer, not the student.

It is distinct from Layer 9 (Research and Redesign), which focuses on improving course and lesson design.

This layer will eventually address:

- the lecturer's own skill and competency development as a digital educator
- reflection loops fed by lesson and research evidence, oriented at personal professional growth
- structured self-assessment tools for pedagogical practice
- optional peer or institutional feedback pathways

It differs from Layer 9 in that:

- Layer 9 asks: what should change in the course or lesson
- This layer asks: what should change in the lecturer's own practice and identity

Reserved config entry: `branches.lecturer_development` in `config.json`.

Reserved interface anchor: to be determined. Likely a dedicated section within `lecturer_hub.html` or a future `lecturer_growth.html`.

## Layer 10: Interface Layer

Only here do pages appear as pages.

The visible surfaces are delivery mechanisms for the deeper architecture.

Current role alignment:

- `my_courses.html`: branch and course entry
- `smart_class.html`: course home and planning shell
- `architect_studio.html`: bot design environment
- `waiting_lobby.html`: pre-runtime threshold and gating surface
- `lesson_view.html`: live Lesson Space
- `micro_cockpit.html`: lecturer orchestration surface
- `macro_cockpit.html`: redesign and research surface
- `skills.html`: skill-led route and branch expression

Architectural consequence:

If a page tries to do work that belongs to multiple deeper layers at once, it becomes noisy, duplicative, and conceptually unstable.

## How The Stack Reorders The System

The architecture should now be understood through four linked movements:

1. Constitution defines what is allowed.
2. Governance defines how it behaves in context.
3. Branches and planning define what is being prepared.
4. Lesson runtime, orchestration, continuity, and redesign define how the educational process unfolds across time.

This replaces a flatter picture in which each HTML page was treated as its own domain.

## Main Corrections To The Current Picture

### Correction 1: Lesson Space Is Central, But Not Sufficient By Itself

Lesson Space is the center of live pedagogy, but it must be fed by planning, governed by phase logic, and followed by continuity and redesign.

### Correction 2: Lecturer Spaces Must Be Separated By Time Function

There should be a sharper difference between:

- planning before class
- orchestration during class
- research and redesign after class

### Correction 3: Branches Are Structural, Not Decorative

Course Branch and Skills Branch are not menu sections. They are two legitimate pedagogical routes that must meet in runtime and re-separate in follow-up.

### Correction 4: Documentation Already Defines More Than The Current UI Shows

Population routing, classroom integration levels, continuity tokens, opening sequences, effort regulation, and governance logic should be treated as architectural layers, not optional detail.

## Implementation Implications

### `lesson_view.html`

Should evolve into the explicit runtime hub for:

- mission and opening sequence
- current stage and sprint
- branch emphasis
- bot support inside lesson constraints
- evidence prompts and continuity capture

### `smart_class.html`

Should remain a course home and planning shell, with less leakage of live-runtime behavior.

### `micro_cockpit.html`

Should narrow toward lecturer control, pacing, gate management, and live monitoring.

### `macro_cockpit.html`

Should focus on analytics, reflection, redesign, and research loops.

### `functions/classroom.js`

Should increasingly model runtime state in stack terms, not just transport data between pages.

## Non-Negotiables

- The one-engine model remains intact.
- Kernel rules remain above product flexibility.
- Lesson runtime must stay phase-aware.
- Branches must stay distinct but bridged.
- Lecturer control must support the lesson, not replace it.
- Continuity and evidence must be first-class outputs.
- Redesign must be grounded in live evidence, not detached preference.

## Final Statement

MilEd.One is best understood as a layered pedagogical operating stack.

The outer spaces matter, but only as interface expressions of deeper system layers.

The strategic center is therefore not simply the cockpit, not simply the course page, and not simply the bot.

It is the governed relationship between constitutional logic, branch structure, live lesson runtime, orchestration, evidence, and redesign.