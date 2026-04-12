# Lecturer Architecture Proposal

## Purpose

This document reframes the proposed lecturer-space architecture as a pedagogical operating model for MilEd.One.

The goal is not only to reduce UI confusion, but to improve the quality of teaching, classroom orchestration, and learning continuity.

## Core Judgment

The proposal is strong in three ways:

- It reduces navigation ambiguity between lecturer space, course space, and live lesson space.
- It moves the product toward course-centered teaching rather than tool-centered exploration.
- It creates a better basis for a full teaching loop: plan -> teach -> observe -> adapt.

The proposal is still incomplete in three ways:

- It defines spaces better than it defines pedagogical obligations.
- It does not yet specify what data or artifacts must flow between spaces.
- It does not yet bind each space explicitly to MilEd.One kernel principles such as Agency Preservation, No-Skip, and Evaluation by Criterion Only.

## Design Principle

The architecture should be judged by one question:

Does each space help the lecturer make better pedagogical decisions without weakening student agency or fragmenting the course flow?

If the answer is no, that space should either be merged, narrowed, or redefined.

## Recommended Space Model

| Space | Product Goal | Pedagogical Goal | Primary User | Primary Object | Inputs | Outputs | Next Flow |
|---|---|---|---|---|---|---|---|
| `lecturer_hub.html` | Main faculty entry and routing | Help the lecturer choose the right mode of work with minimal cognitive load | Lecturer | Work mode | Role, permissions, recent activity, shortcuts | Clear route selection | `my_courses.html`, `lecturer_cockpit.html`, `macro_cockpit.html`, `architect_studio.html` |
| `my_courses.html` | Course entry point | Keep teaching anchored in the course rather than in tools | Lecturer | Course | Course roster from `config.json`, class lifecycle signals | Course selection | `smart_class.html` |
| `smart_class.html` | Course home | Present the teaching context of a specific course: units, bots, student entry, lifecycle | Lecturer | Course context | `classId`, course config, unit list, bot list, class state | Course-specific launch actions | `waiting_lobby.html`, `course_units.html`, `micro_cockpit.html` |
| `course_units.html` | Unit management | Organize the instructional sequence and keep each unit pedagogically distinct | Lecturer | Unit | Course structure, saved unit metadata | Edited unit plan, unit context | `lecturer_cockpit.html`, `micro_cockpit.html` |
| `lecturer_cockpit.html` | Active faculty workspace | Support full teaching cycle in one operational dashboard when course context is known | Lecturer | Unit plus session | `courseId`, `unitId`, planning state, session state, class signals | Prepared lesson state, live session controls, post-class notes | `lesson_view.html`, analytics, next unit revision |
| `micro_cockpit.html` | Live teaching control | Manage a running session with the least possible friction | Lecturer | Live session | Active session, attendance, waiting room, broadcast, pacing | Door state, live prompts, pushed resources, session events | `lesson_view.html`, session journal |
| `macro_cockpit.html` | Cross-unit planning | Connect syllabus, skills, assessment, and longitudinal thinking | Lecturer | Course plan | Course map, unit sequence, skill alignment, research summaries | Revised plan, skill alignment decisions, intervention ideas | `micro_cockpit.html`, `course_units.html`, `architect_studio.html` |
| `cockpit.html` | Research and performance lab | Turn accumulated classroom data into actionable teaching insight | Lecturer | Evidence | Skills/performance aggregates, interaction data, trend data | Findings, risk flags, support priorities | `macro_cockpit.html`, `lecturer_cockpit.html` |
| `architect_studio.html` | Innovation workspace | Design or refine bots and pedagogical interventions without contaminating live teaching flow | Lecturer | New intervention | Faculty intent, questionnaire responses, architect workflow | New bot/system-prompt configuration | Return to course planning or faculty workspace |
| `lesson_view.html` | Live lesson surface | Give the student and lecturer a coherent learning space for the active unit | Student and lecturer | Active lesson | Session payload, unit, resources, sprints, pushed content | Student work, evidence, progression through lesson | Session updates, analytics, continuity token |
| `waiting_lobby.html` | Session gateway | Prepare student entry and preserve the transition into the lesson | Student | Session readiness | Course, unit, pre-session task, gate state | Presence, pre-session response, join event | `lesson_view.html` |

## Pedagogical Obligations Per Space

### 1. `lecturer_hub.html`

This space should reduce decision fatigue.

It should not become a work surface full of competing controls.

Its pedagogical function is indirect but important: it helps the lecturer enter the right mode quickly.

Success criterion:

- A lecturer can answer "what am I trying to do now" in one click.

### 2. `my_courses.html`

This should be the primary teaching gateway.

Its pedagogical value is that it keeps the lecturer grounded in a course container. That supports continuity, context fidelity, and alignment between unit work and live teaching.

Success criterion:

- Every teaching action can be traced back to a course.

### 3. `smart_class.html`

This should become the official course home.

Its role is not only launch and navigation, but context framing:

- what course this is
- what units exist
- what student entry looks like
- what the lecturer can do next

Success criterion:

- The lecturer understands the course state before opening or editing anything.

### 4. `micro_cockpit.html`

This space should optimize for speed, clarity, and low-friction teaching moves.

Its pedagogical role is not planning. Its role is orchestration:

- open the lesson
- admit students
- pace the class
- push resources
- monitor evidence of work

Success criterion:

- The lecturer can manage a live session without having to think about architecture.

### 5. `macro_cockpit.html`

This space should connect teaching decisions across time.

Its pedagogical role is longitudinal coherence:

- connect units to skills
- compare lesson intentions and outcomes
- plan the next intervention

Success criterion:

- Planning decisions in this space improve future live teaching, rather than duplicate work already done elsewhere.

### 6. `cockpit.html`

This should remain a research and evidence space, not an operational cockpit.

Its pedagogical value is reflective intelligence:

- identify patterns
- detect support needs
- feed decisions back into course planning

Success criterion:

- Every major metric shown here points to an actionable change elsewhere.

### 7. `architect_studio.html`

This is the innovation space.

Its role is to create or refine pedagogical interventions without polluting routine teaching flows.

Success criterion:

- Innovation exits as a usable intervention that can be inserted into a course or planning loop.

## What Makes The Proposal Strong For Teaching And Learning

### Strength 1: It is course-centered

This aligns with MilEd.One's logic that bots and spaces should be configured by context, not treated as disconnected products.

### Strength 2: It separates orchestration from reflection

Live teaching, planning, and research are distinct cognitive tasks.

Separating them is good pedagogy because it reduces mode confusion for the lecturer.

### Strength 3: It can support a real instructional loop

If implemented well, the architecture can create this cycle:

1. Plan in `macro_cockpit.html`
2. Prepare in `smart_class.html` or `lecturer_cockpit.html`
3. Run the lesson in `micro_cockpit.html`
4. Observe outcomes in `lesson_view.html` and `cockpit.html`
5. Adapt the next unit in `course_units.html` or `macro_cockpit.html`

That is a meaningful pedagogical operating loop, not just a menu system.

## What Still Weakens The Proposal

### Weakness 1: It does not yet specify mandatory outputs per space

Without this, spaces risk becoming vague destinations.

Examples of missing explicit outputs:

- `macro_cockpit.html` should produce a planning decision, not only display planning tools.
- `cockpit.html` should produce support priorities or intervention flags.
- `smart_class.html` should produce a clear next action for the lecturer.

### Weakness 2: It does not define the artifact flow

For MilEd.One, the important question is not only where work happens, but what moves between spaces.

Examples:

- unit goals
- pre-session prompts
- live session state
- evidence of student work
- research findings
- redesign actions

If those artifacts are not explicit, the architecture stays visually clean but pedagogically shallow.

### Weakness 3: It still risks too many top-level concepts

If the lecturer must mentally distinguish among hub, workspace, macro, micro, course home, and research lab, the naming burden may still be too high.

The spaces should be pedagogically distinct, but their naming and routing must be simpler than the underlying architecture.

## Recommended Non-Negotiables

### Non-Negotiable 1

The course must remain the main pedagogical container.

The lecturer should not feel that the cockpit is the real home and the course is secondary.

### Non-Negotiable 2

Live session control must stay separate from research and planning.

Combining them increases friction exactly where the lecturer needs the fastest response.

### Non-Negotiable 3

Every analytics surface must feed a teaching action.

If not, analytics becomes observational decoration.

### Non-Negotiable 4

Innovation must remain isolated enough to protect production teaching flows.

That is especially important in a system where new bots are created through a formal architecture and not ad hoc.

## Practical Decision Framework

Use these tests to evaluate any future page or space:

1. What is the pedagogical decision made here?
2. What is the primary object here: course, unit, session, evidence, or intervention?
3. What is produced here that another space must consume?
4. Does this space reduce or increase lecturer cognitive load?
5. Does this space preserve student agency and course continuity?

If a page cannot answer those five questions clearly, it should not become a first-class space.

## Final Verdict

The proposal is good and directionally correct for MilEd.One.

It is likely to improve teaching and learning because it:

- reduces navigational ambiguity
- re-centers the course as a meaningful container
- separates live teaching from planning and research
- creates the basis for a closed pedagogical improvement loop

Its main limitation is that it is still a space architecture more than a pedagogical contract.

To become fully strong, the next version should add two more layers:

1. Mandatory outputs per space
2. Artifact and data flow between spaces

At that point, the proposal will no longer be only a cleaner navigation model. It will become a real teaching architecture for MilEd.One.