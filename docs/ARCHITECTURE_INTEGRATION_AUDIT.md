# Architecture Integration Audit

## Purpose

This document identifies additional pedagogical and architectural elements that already exist in MilEd.One documentation or code and should be incorporated into the emerging architecture picture.

The point is not to invent more layers.

The point is to avoid under-describing the system by ignoring capabilities that are already present.

## Main Conclusion

The current architecture picture is directionally strong, but still incomplete.

What is still underrepresented are five already-developed layers:

1. classroom integration levels
2. adaptive governance and drift control
3. pre-session and in-session pedagogical rituals
4. course-skill bridges and evidence flows
5. differentiated population/language routing

These are not speculative ideas.

Most of them already exist either in code, in canonical docs, or in both.

## Priority Elements To Add

## 1. Classroom Integration Continuum

### What it is

A staged model of how bots are integrated into classroom teaching, from light support to co-design.

### Where it appears

- [docs/MASTER_LOGIC.md](c:/Users/User/AI_Work/mileb-one-engine/docs/MASTER_LOGIC.md#L1218)

### Why it matters

This gives the architecture a maturity model.

It helps answer not only "what spaces exist" but also "how deeply is AI integrated into the lesson?"

### Why it should be added

Without this continuum, Lesson Space risks staying structurally clear but pedagogically flat.

### Integration recommendation

Add a deployment-depth dimension to:

- `macro_cockpit.html`
- course planning
- Lesson Space design

So each lesson can be tagged by integration level, not only by content or skill emphasis.

### Status

Documented, not yet surfaced in architecture documents.

## 2. OPAL 30-Tool Library

### What it is

A structured micro-tool library across tiers and population tracks.

### Where it appears

- [docs/MASTER_LOGIC.md](c:/Users/User/AI_Work/mileb-one-engine/docs/MASTER_LOGIC.md#L1233)
- [docs/opal-library-map.md](c:/Users/User/AI_Work/mileb-one-engine/docs/opal-library-map.md)

### Why it matters

This is not just content inventory.

It is a missing middle layer between high-level architecture and actual learning moves.

### Why it should be added

The current picture says there is a Skills Branch, but it still says too little about what operational tools that branch actually contributes to lessons.

### Integration recommendation

Treat OPAL as the action library of the Skills Branch:

- selectable in planning
- activatable in Lesson Space
- analyzable in research flows

### Status

Documented strongly; not yet integrated into runtime architecture.

## 3. Population Routing And Hebrew Adaptation

### What it is

Explicit differentiation between learner populations and Hebrew-level adaptation.

### Where it appears

- [docs/MASTER_LOGIC.md](c:/Users/User/AI_Work/mileb-one-engine/docs/MASTER_LOGIC.md#L1320)
- [config.json](c:/Users/User/AI_Work/mileb-one-engine/config.json#L216)

### Why it matters

This changes how Lesson Space should behave.

It affects:

- wording
- task complexity
- example design
- support mode
- tool selection

### Why it should be added

Right now the architecture picture is still too generic in its learner model.

### Integration recommendation

Make population/language routing a first-class runtime input to Lesson Space and skill pathways.

### Status

Documented in depth; only partially reflected in configuration and not clearly surfaced architecturally.

## 4. Session Continuity Token

### What it is

A structured continuity mechanism that preserves session state across discontinuous interactions.

### Where it appears

- [docs/MASTER_LOGIC.md](c:/Users/User/AI_Work/mileb-one-engine/docs/MASTER_LOGIC.md#L346)
- [kernel.txt](c:/Users/User/AI_Work/mileb-one-engine/kernel.txt)

### Why it matters

This is critical if Lesson Space is meant to be more than a transient page.

It provides continuity between:

- previous lesson state
- student trajectory
- next action
- hidden runtime metadata

### Why it should be added

The current architecture emphasizes flow, but not yet continuity strongly enough.

### Integration recommendation

Connect Lesson Space outputs to session continuity state in Firebase and course progression summaries.

### Status

Strongly specified in docs; not clearly integrated into runtime state management.

## 5. 6-Step Opening Sequence

### What it is

A structured opening sequence that prevents modal confusion and stabilizes context before interaction begins.

### Where it appears

- referenced across [docs/MASTER_LOGIC.md](c:/Users/User/AI_Work/mileb-one-engine/docs/MASTER_LOGIC.md)
- [docs/BOT_ARCHITECT_SP.md](c:/Users/User/AI_Work/mileb-one-engine/docs/BOT_ARCHITECT_SP.md)

### Why it matters

This is pedagogically important because it creates safe orientation at the start of work.

### Why it should be added

Our current architecture picture starts at page routing and runtime layout, but this sequence adds a human/pedagogical entry ritual.

### Integration recommendation

Make it part of:

- waiting/lobby flow
- Lesson Space initialization
- bot mode confirmation

### Status

Documented; implementation scattered.

## 6. Binding Principles, Drift Handling, And Escalation

### What it is

Hard governance layer: no-skip, no-substitution, evaluation gates, effort regulation, model drift prevention, escalation of repeated violations.

### Where it appears

- [docs/MASTER_LOGIC.md](c:/Users/User/AI_Work/mileb-one-engine/docs/MASTER_LOGIC.md#L1329)
- [docs/MASTER_LOGIC.md](c:/Users/User/AI_Work/mileb-one-engine/docs/MASTER_LOGIC.md#L1361)

### Why it matters

This is the invisible constitutional layer of the system.

Without it, architecture becomes layout rather than governed pedagogy.

### Why it should be added

The current architecture docs mention roles and layers, but not enough about what remains constitutionally enforced during long classroom sessions.

### Integration recommendation

Add a governance overlay to the architecture stack:

- kernel
- phase governance
- branch context
- Lesson Space runtime

### Status

Well documented; only partially implemented systematically.

## 7. Pre-Session Rituals: Mission, Warmup, Entrance Ticket

### What it is

A real pre-session pedagogical layer already implemented in classroom backend logic.

### Where it appears

- [functions/classroom.js](c:/Users/User/AI_Work/mileb-one-engine/functions/classroom.js#L653)
- [functions/classroom.js](c:/Users/User/AI_Work/mileb-one-engine/functions/classroom.js#L1156)
- [functions/classroom.js](c:/Users/User/AI_Work/mileb-one-engine/functions/classroom.js#L1450)

### Why it matters

This means Lesson Space does not actually begin only at the live lesson page.

There is already a pedagogically meaningful threshold before entry:

- orientation content
- warmup generation
- entrance ticket submission

### Why it should be added

The architecture should represent lesson flow as:

pre-session -> live runtime -> post-session/research

not only as one page.

### Integration recommendation

Elevate pre-session into the Lesson Space contract as an official part of runtime staging.

### Status

Implemented in code, underrepresented in architecture documents.

## 8. Pacing, Guidance, And Evidence Submission

### What it is

Runtime adaptation already present in classroom logic:

- pacing updates
- support/fast-path guidance
- evidence submission
- pushed resources

### Where it appears

- [functions/classroom.js](c:/Users/User/AI_Work/mileb-one-engine/functions/classroom.js#L1615)
- [functions/classroom.js](c:/Users/User/AI_Work/mileb-one-engine/functions/classroom.js#L1647)
- [functions/classroom.js](c:/Users/User/AI_Work/mileb-one-engine/functions/classroom.js#L1728)

### Why it matters

This is a major clue that Lesson Space is already becoming an adaptive runtime, not just a static content screen.

### Why it should be added

The architecture picture should explicitly include:

- pace signals
- help/support branching
- proof-of-work flows

### Integration recommendation

Represent evidence and pacing as core Lesson Space outputs and lecturer control hooks.

### Status

Implemented in code, not yet made central in architecture docs.

## 9. KB Module Architecture

### What it is

A standard model for knowledge base modules: domain, exercises, tools, hints, feedback, errors, L2 errors, examples.

### Where it appears

- [docs/MASTER_LOGIC.md](c:/Users/User/AI_Work/mileb-one-engine/docs/MASTER_LOGIC.md#L1320)

### Why it matters

This is the missing content architecture beneath bots and lesson activities.

### Why it should be added

The pedagogical architecture currently has branches and spaces, but not enough articulation of the content modules those spaces consume.

### Integration recommendation

Treat KB modules as one layer beneath Course Branch and Skills Branch, feeding bots and lesson activities.

### Status

Canonical template documented; unevenly implemented.

## 10. Readiness, Stage Gates, And Evaluation Gates

### What it is

Formal gating logic for readiness, progression, and criterion-based evaluation.

### Where it appears

- [docs/MASTER_LOGIC.md](c:/Users/User/AI_Work/mileb-one-engine/docs/MASTER_LOGIC.md#L1361)
- [docs/MASTER_LOGIC.md](c:/Users/User/AI_Work/mileb-one-engine/docs/MASTER_LOGIC.md#L558)

### Why it matters

This gives the architecture a state-machine dimension.

### Why it should be added

Without it, the current picture describes spaces but not transitions and permissions well enough.

### Integration recommendation

Add stage/readiness/gate state explicitly to:

- Lesson Space runtime
- lecturer orchestration layer
- analytics/research outputs

### Status

Strongly specified; not systematically surfaced in implementation architecture.

## 11. Portfolio And Process Evidence Orientation

### What it is

A process-oriented assessment logic that values artifacts across time, not only final products.

### Where it appears

- [docs/academic-literacy-map.md](c:/Users/User/AI_Work/mileb-one-engine/docs/academic-literacy-map.md)
- audit materials referenced across docs

### Why it matters

This fits directly with Lesson Space outputs, evidence submission, and course-skill integration.

### Why it should be added

It gives a pedagogical reason for storing runtime artifacts beyond immediate session management.

### Integration recommendation

Position Lesson Space artifacts as inputs to portfolio-oriented growth tracking.

### Status

Documented pedagogically; only partially represented in current runtime design.

## 12. Real-Time Classroom Manager Vision

### What it is

An instructor-only cohort layer: stage visibility, lock/unlock, synchronized prompts, export.

### Where it appears

- [docs/MASTER_LOGIC.md](c:/Users/User/AI_Work/mileb-one-engine/docs/MASTER_LOGIC.md#L1341)
- current cockpit and classroom function surfaces

### Why it matters

This connects individual bot interactions to whole-class pedagogy.

### Why it should be added

It strengthens the role of `micro_cockpit.html` as an instructor control layer, not just another page with buttons.

### Integration recommendation

Add cohort state and stage visibility formally to the architecture stack.

### Status

Partially implemented in code/UI; better specified in docs than in system architecture maps.

## Status Summary

### Implemented In Code And Should Be Surfaced More Clearly

- pre-session mission/warmup/tickets
- resource push
- pacing update
- evidence submission
- lesson playlists and sprint definitions

### Documented Strongly But Not Yet Surfaced Architecturally

- classroom integration continuum
- OPAL library
- continuity token
- opening sequence
- drift handling
- KB module architecture
- population routing

### Partially Implemented / Split Between Vision And Code

- readiness and stage-gate logic
- classroom manager cohort visibility
- portfolio evidence logic
- adaptive stress/emotion regulation

## What This Changes In The Big Picture

The architecture should no longer be described only as:

- hub
- courses
- lesson space
- micro
- macro
- research
- innovation

It should now be understood as including additional cross-cutting layers:

1. **Governance Layer**
2. **Differentiation Layer**
3. **Pre-Session Layer**
4. **Lesson Runtime Layer**
5. **Evidence Layer**
6. **Research/Redesign Layer**

## Final Recommendation

Before moving further into implementation, the next architecture pass should explicitly absorb these already-developed capabilities.

The most important additions are:

1. classroom integration continuum
2. pre-session layer
3. pacing and evidence flows
4. governance and drift handling
5. population/language routing
6. OPAL and KB modules as underlying pedagogical assets

These elements will make the architecture picture more faithful to the actual MilEd system and significantly more pedagogically robust.