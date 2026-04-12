# Lesson Space Contract

## Purpose

This document defines the Lesson Space contract for MilEd.One.

It connects five things that have been discussed separately until now:

1. course architecture
2. skills architecture
3. the live lesson runtime
4. lecturer orchestration
5. typed AI support

The purpose of this contract is to prevent MilEd from becoming either:

- only a course shell
- only a skills hub
- only a live classroom controller
- or only a set of bots

Instead, MilEd should become a coherent pedagogical operating system.

## Core Principle

There are two legitimate pedagogical containers in the system, and they are not the same:

- **Course branch**: the disciplinary container
- **Skills branch**: the transversal developmental container

Neither should replace the other.

Lesson Space is the runtime where they meet.

## High-Level Model

### 1. Course Branch

The course branch organizes disciplinary learning.

It answers:

- what course this is
- what unit the class is in
- what domain problem or topic is being addressed
- what project or disciplinary progression exists

In the current system this is represented mainly by:

- `config.json -> my_courses`
- `my_courses.html`
- `smart_class.html`
- `course_units.html`

### 2. Skills Branch

The skills branch organizes cross-course development.

It answers:

- what academic, study, research, social, or employability skills are being developed
- what diagnostic state the student is in
- what reinforcement path or support track is needed
- what pillar balance exists between academic and skill growth

In the current system this is represented mainly by:

- `config.json -> branches.skills`
- `skills.html`
- `balance.js`
- skill bots and diagnostics

### 3. Lesson Space

Lesson Space is the pedagogical runtime of the actual lesson.

It is where:

- a course unit becomes a live learning event
- skill development becomes visible and actionable
- communication, activity, outputs, and AI support coexist

### 4. Lecturer Control Layer

The lecturer does not live inside Lesson Space as a system designer.

The lecturer controls Lesson Space through operational surfaces such as:

- `micro_cockpit.html`
- selected course-scoped workflows in `lecturer_cockpit.html`

### 5. Planning and Redesign Layer

Longitudinal adjustment happens outside Lesson Space and feeds back into it.

Likely pages:

- `macro_cockpit.html`
- `cockpit.html`
- later, any faculty-facing skill-planning surfaces

## Main Architectural Claim

MilEd should not force a choice between:

- disciplinary learning
- skill development

Instead, the system should support flexible emphasis.

The same lesson may be:

- primarily course-driven and secondarily skill-aware
- primarily skill-driven and secondarily course-contextualized
- or explicitly balanced between both

This is where the current dual-balance logic becomes strategically important.

## The Two-Branch Pedagogical Model

## Branch A: Course-Led Learning

In this mode, the course is primary.

Questions asked by the system:

- what is the unit?
- what is the disciplinary task?
- what project stage are we in?
- what bot or process belongs to this unit?

Skills are not absent here.

They are embedded as support, assessment, or development dimensions.

Example:

- Optics course
- Unit on client problem solving
- task bot supports project progression
- research skill or writing skill appears as reinforcement when needed

## Branch B: Skill-Led Learning

In this mode, the skill is primary.

Questions asked by the system:

- what skill is being diagnosed or reinforced?
- what support path does the student need?
- what pillar or competency needs strengthening?
- in which course context should this skill be practiced or transferred?

The course is not absent here.

It becomes the application context.

Example:

- academic writing skill process
- student practices paraphrasing or research reasoning
- examples and outputs are anchored inside an actual course unit

## Why This Matters

If MilEd is only course-led, it risks reproducing conventional LMS logic.

If MilEd is only skill-led, it risks disconnecting skill growth from actual disciplinary work.

The innovation is the bridge.

## Contract Rule 1: Course Branch And Skills Branch Must Be Distinct But Connected

They must not collapse into one taxonomy.

They answer different pedagogical questions.

But they must exchange structured signals.

## Contract Rule 2: Lesson Space Must Accept Inputs From Both Branches

Lesson Space should accept the following classes of input:

### Course Inputs

- `courseId`
- `unitId` or `lessonId`
- course title and unit title
- unit resources
- course bots
- project stage
- lifecycle state

### Skills Inputs

- relevant skill pathway or diagnostic state
- skill bot or skill module association
- target pillar tags
- support intensity
- balance settings between academic and skill emphasis

### Lecturer Inputs

- active session state
- pacing choice
- pushed resources
- communication permissions
- gate state

## Contract Rule 3: Lesson Space Must Emit Outputs To Both Branches

Lesson Space should emit structured outputs such as:

### Runtime Outputs

- stage progression
- participation signals
- communication events
- resource usage
- help requests
- lecturer interventions

### Course Outputs

- unit completion state
- project stage evidence
- lesson summary
- continuation state for next unit or next lesson

### Skills Outputs

- skill practice traces
- skill diagnostic updates
- pillar evidence
- improvement or struggle signals
- recommended reinforcement path

### Research Outputs

- aggregate patterns
- bottleneck indicators
- intervention candidates

## Contract Rule 4: Lesson Space Must Support Flexible Learning Emphasis

Each lesson instance should be able to run in one of three pedagogical emphases:

### Mode A: Course-Primary

The lesson is mainly about the disciplinary unit.

Skills appear as support or embedded assessment.

### Mode B: Skill-Primary

The lesson is mainly about skill development.

The course provides context, examples, and authentic transfer.

### Mode C: Balanced

The lesson explicitly aims at both:

- progression in course content
- progression in targeted skill pillars

This should align with the dual-balance logic already present in `balance.js`.

## Required Internal Layers Of Lesson Space

### 1. Structure Layer

Always visible.

Contains:

- current lesson identity
- current unit or stage
- progression rail
- current mode or emphasis if relevant

### 2. Activity Layer

Primary action area.

Contains:

- the current task
- disciplinary prompt or skill task
- relevant activity UI

### 3. Output Layer

Visible evidence area.

Contains:

- student work
- shared artifacts
- selected exemplars
- feedback surfaces

### 4. Communication Layer

Split by scope.

Contains:

- class communication
- lecturer announcements
- optional private lecturer-student channel
- optional pair or group communication

### 5. Presence Layer

Persistent awareness layer.

Contains:

- who is connected
- who is active
- who needs help
- optional audio/video status if later implemented

### 6. AI Layer

Typed support layer.

Contains possible bot modes:

- course companion bot
- task-specific bot
- gatekeeper bot
- skill support bot
- open inquiry bot

## Bot Rules Inside Lesson Space

### Rule A

Human leads, AI supports.

This is non-negotiable.

### Rule B

Bot role must be explicit and legible.

The system should distinguish among:

- course support
- task support
- process enforcement
- skill development
- open inquiry

### Rule C

Skill bots and course bots are not the same object.

They may both appear in the same lesson, but they serve different purposes.

### Rule D

Gatekeeper bots should only control process transitions tied to explicit instructional design.

They should not become a general ambient assistant.

## File Responsibilities In The Current Architecture

### `smart_class.html`

Role:

course home

Responsibilities:

- show course context
- show course units
- show assigned course bots
- expose launch paths into live lesson flow
- later, surface skill mappings relevant to the course

### `lesson_view.html`

Role:

official Lesson Space runtime anchor

Responsibilities:

- render lesson structure
- render activity
- render resources
- render outputs
- embed communication component
- host typed AI support contexts

### `micro_cockpit.html`

Role:

lecturer orchestration layer over Lesson Space

Responsibilities:

- open lesson
- manage access gates
- push resources
- change pacing
- broadcast to the class
- monitor presence and progress

### `macro_cockpit.html`

Role:

course-skill alignment and redesign layer

Responsibilities:

- align units to skills and pillars
- decide balance between academic and skill emphasis
- use research outputs to redesign lessons

### `skills.html`

Role today:

student-facing skills hub

Strategic role:

the visible surface of the skills branch for learners

Implication:

it should stay distinct from course home, but connect to course contexts more deliberately in the future.

## Required Data Bridges Between Branches

To make the architecture real, MilEd should define explicit bridges such as:

### Bridge 1: Course -> Skill Tags

Each course unit should be able to declare:

- required pillars
- relevant skill tags
- optional reinforcement links

This is already partially foreshadowed by `requiredPillars` in course project definitions.

### Bridge 2: Skill -> Course Context

A skill process should be able to know:

- which course or unit it is currently serving
- whether the context is disciplinary practice, remediation, or enrichment

### Bridge 3: Lesson -> Balance State

Lesson Space should know the intended balance for the lesson or course:

- academic-heavy
- skill-heavy
- balanced

### Bridge 4: Runtime -> Analytics

Lesson events should feed both:

- course progression understanding
- skill development understanding

## Recommended User Flows

### Flow A: Lecturer Starts From Course

1. `lecturer_hub.html`
2. `my_courses.html`
3. `smart_class.html`
4. choose unit
5. open Lesson Space via `micro_cockpit.html`
6. run lesson with embedded skill support as needed

### Flow B: Student Starts From Course

1. student enters course-related path
2. `waiting_lobby.html`
3. `lesson_view.html`
4. interacts with course task and relevant skill support in one runtime space

### Flow C: Student Starts From Skill Pathway

1. student enters `skills.html`
2. diagnostic or skill process identifies relevant path
3. system optionally links the skill work back into a current course or unit context
4. skill evidence feeds future course lessons

### Flow D: Lecturer Starts From Skill Concern

1. lecturer reviews research or skill signals
2. `macro_cockpit.html` identifies weak skill patterns
3. redesign links the next course unit to targeted skill support
4. Lesson Space runs the adjusted lesson

## Non-Negotiables

### 1. Course and skills are two branches, not two rival products.

### 2. Lesson Space is the runtime meeting point, not a third disconnected branch.

### 3. Skill development must be contextualized when possible, not isolated by default.

### 4. Course progression must remain visible even in skill-primary lessons.

### 5. AI support must remain typed and bounded.

### 6. Analytics must feed redesign across both branches.

## Final Architectural Statement

MilEd.One should be understood as a system with:

- a course branch for disciplinary progression
- a skills branch for transversal development
- a Lesson Space runtime where both are enacted together
- a lecturer orchestration layer that controls the runtime
- a redesign layer that continuously adjusts the relationship between course goals and skill goals

That is the basis for genuine pedagogical flexibility.

It allows MilEd to move between:

- discipline-first learning
- skill-first learning
- hybrid learning

without losing coherence.

## Recommended Next Step

Translate this contract into a concrete implementation spec for:

1. UI wireframe zones in `lesson_view.html`
2. runtime events and payloads in `functions/classroom.js`
3. course-skill mapping surfaces in `macro_cockpit.html` and course configuration