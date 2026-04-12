# Product Protocol Registry

## Purpose

This document is the first Wave 1 draft of the shared product protocol registry.

Its role is to hold canonical descriptions of how major MilEd products operate.

It does not hold UI layout or implementation details.

It holds operational protocol structure.

## Source Lineage

Primary sources used in this first draft:

- `docs/BOT_ARCHITECT_SP.md`
- `docs/LESSON_SPACE_CONTRACT.md`
- `docs/LECTURER_ARCHITECTURE_PROPOSAL.md`

## Common Protocol Format

Each protocol should define:

- protocol name
- purpose
- intake
- decision stages
- internal checks
- recognition checkpoints
- review mode
- outputs
- dependency libraries
- architecture touchpoints
- risks and failure modes

## Protocol 1: Bot Architect

### Purpose

Turn faculty intent into governed bot configuration and exportable system prompt structure.

### Intake

- faculty pedagogical goals
- audience and context
- role and operation mode
- questionnaire responses
- clarifications raised during stress tests

### Decision Stages

1. data intake
2. pedagogical challenge / stress testing
3. 8-layer assembly
4. export engine

### Internal Checks

- DNA / pace mismatch
- gatekeeper without readiness signals
- emotional mode with overly strict enforcement
- long mode without real continuity need
- scaffolding with short mode mismatch
- phase mismatch
- confirmation rule gaps

### Recognition Checkpoints

- export eligibility should require resolved tensions and completed stage outputs
- any future architect credentialing should be based on completed configuration evidence, not session participation alone

### Review Mode

- hybrid
- automated structure checks may run first, but sensitive governance choices should remain reviewable by a human owner

### Outputs

- config-ready JSON snippet
- system prompt structure
- variable extraction result
- clarified pedagogical configuration

### Dependency Libraries

- architecture canon and governance rules
- bot archetype and DNA registry
- product protocol registry format

### Architecture Touchpoints

- one-engine integrity
- variable contract
- phase and function constraints
- enforcement assumptions

### Risks And Failure Modes

- intake remains superficial
- contradictions pass without stress testing
- DNA and mode mismatch survives export
- product wording drifts away from architecture constraints

## Protocol 2: Lesson Space Runtime Protocol

### Purpose

Coordinate live pedagogical runtime where Course Branch and Skills Branch meet in action.

### Intake

- course context
- lesson or unit context
- selected or relevant skills context
- current runtime phase
- learner and classroom state

### Decision Stages

1. receive inputs from course and skills branches
2. establish current lesson emphasis
3. run internal lesson layers
4. emit evidence and continuity outputs
5. return outputs back to course and skill pathways

### Internal Checks

- both branches remain distinct but connected
- lesson accepts inputs from both branches
- lesson emits outputs to both branches
- current emphasis remains coherent
- runtime stays aligned with internal layer responsibilities

### Recognition Checkpoints

- evidence emitted from the lesson may move a learner from `in_progress` to `evidence_ready`
- recognition should depend on compatible skill evidence and any credential threshold rules defined outside the runtime itself

### Review Mode

- automated or hybrid
- low-stakes evidence aggregation may be automated, while formal recognition should remain hybrid when institutional stakes are higher

### Outputs

- current lesson action frame
- evidence artifacts
- progress signals
- continuity signals
- branch-relevant outputs for follow-up
- routed support mode where population adaptation applies

### Dependency Libraries

- skill ontology and diagnosis library
- transformation template library where lesson design was transformed upstream
- evidence and continuity object library
- active learning and skills-oriented design pattern library
- population routing and adaptation library where differentiated support is needed

### Architecture Touchpoints

- lesson space contract
- branch relationship contract
- runtime governance
- evidence and continuity layer

### Risks And Failure Modes

- lesson collapses into only course delivery
- lesson collapses into only generic skill training
- outputs are not sent back into either branch
- lecturer orchestration duplicates rather than supports the runtime

## Protocol 3: Lecturer Transformation Workflow

### Purpose

Help a lecturer move from existing course material toward a transformed, skill-aware, activity-based learning structure.

### Intake

- source course or unit materials
- stated goals and constraints
- desired transformation level
- class conditions and modality
- policy and effort constraints

### Decision Stages

1. analyze incoming material
2. identify structure, goals, and gaps
3. choose transformation level
4. select candidate transformation templates
5. compose transformed unit or course path
6. review skills, outputs, and effort implications
7. prepare output for implementation or export

### Internal Checks

- source gaps are explicit
- transformation level matches intent
- selected templates are feasible
- skill links are visible
- outputs and rubrics are not detached from activities

### Recognition Checkpoints

- transformed outputs should declare whether they create credential-relevant evidence opportunities
- pathway or module recognition should only be signaled when transformed outputs align to explicit threshold-bearing credentials

### Review Mode

- hybrid or lecturer review
- design proposals may surface credential opportunities automatically, but actual recognition logic should remain reviewable

### Outputs

- transformed unit proposals
- skill-linked activity structures
- output and rubric suggestions
- policy-aware redesign path
- selected design pattern families where relevant

### Dependency Libraries

- transformation template library
- skill ontology and diagnosis library
- credential logic library where relevant
- active learning and skills-oriented design pattern library
- population routing and adaptation library where differentiated redesign is required

### Architecture Touchpoints

- planning and design layer
- branch bridge logic
- evidence expectations

### Risks And Failure Modes

- redesign becomes cosmetic only
- transformation overreaches course constraints
- skill links stay rhetorical instead of operational
- exportable outputs lack enough structure to implement

## Protocol 4: External Gatekeeper Approval Flow

### Purpose

Control stage progression through an external evaluation loop where the coaching bot does not decide final passage alone.

### Intake

- student coaching interaction outcomes
- form submission content
- rubric or criteria used for approval
- student identity or submission key
- stage target that remains locked pending approval

### Decision Stages

1. coaching bot prepares learner for formal submission
2. learner submits stage work through an external form or structured intake
3. automation layer routes submission to external AI or rules-based evaluation
4. evaluation returns `approved` or `rejected` with feedback
5. system issues approval code or return-for-revision message
6. learner re-enters the coaching environment with the code
7. coaching bot unlocks the next stage only after code validation

### Internal Checks

- coaching and evaluation roles remain separated
- approval depends on submitted work, not chat participation alone
- stage unlock depends on valid external approval token
- rejected submissions return actionable revision guidance
- identity and submission linkage remain stable enough to prevent bypass

### Recognition Checkpoints

- submission approval may move evidence from `in_progress` to `evidence_ready`
- code issuance may mark a credential or stage checkpoint as eligible for review, but should not by itself equal full recognition unless the credential rules allow it
- unlock events should remain traceable to explicit approval evidence

### Review Mode

- hybrid
- automated evaluation may perform first-pass screening, but external approval flows should remain reviewable where institutional or grading stakes are meaningful

### Outputs

- approval or rejection decision
- revision feedback
- approval code or unlock token
- updated stage access state
- traceable evidence of passage decision
- routed support recommendation for resubmission where applicable

### Dependency Libraries

- skill ontology and diagnosis library
- credential logic library
- evidence and continuity object library
- population routing and adaptation library where resubmission support differs by entry profile

### Architecture Touchpoints

- gatekeeper logic
- evidence-based confirmation
- continuity between external systems and the coaching bot
- separation between learning support and evaluation authority

### Risks And Failure Modes

- learners bypass the gate through chat-only requests
- approval codes become disconnected from real evidence
- evaluation criteria drift from rubric logic
- external automation grants passage where human review should remain active
- stage access is unlocked without a traceable validation event

## Registry Use Rule

Product protocols should reference shared libraries explicitly.

If a protocol requires a skill definition, template family, or evidence rule, it should consume that from the relevant library instead of redefining it locally.

## Final Statement

This registry makes MilEd's major product flows legible as operating sequences rather than scattered narrative descriptions.