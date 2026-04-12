# Lecturer Architecture Implementation Matrix

## Purpose

This document translates the lecturer-space architecture proposal into an implementation matrix.

It is intentionally operational.

Each row answers three questions:

1. What the file is now
2. What it should become
3. What concrete action is required

## Status Keys

- `keep`: keep as a first-class page with clarified purpose
- `narrow`: keep, but reduce scope to a sharper role
- `merge-behavior`: reduce duplicated logic across pages
- `reposition`: keep the page, but move it to a different place in the hierarchy
- `student-only`: explicitly keep outside lecturer architecture
- `promote`: make the page an official architectural anchor

## Matrix

| File | As-Is | Target Role | Status | Action |
|---|---|---|---|---|
| `lecturer_hub.html` | Lecturer landing page with direct links to multiple workspaces | Main routing layer for lecturer work modes | `narrow` | Remove ambiguity; make its primary job route selection, not mixed execution |
| `my_courses.html` | Course listing page sourced from `config.json` | Official teaching gateway | `promote` | Treat as the required start point for course-based work |
| `smart_class.html` | Course shell with units, bots, lifecycle, and student entry links | Official course home | `promote` | Explicitly define it as the lecturer's course context page |
| `course_units.html` | Unit manager and entry to unit-scoped editing | Unit planning and structure management | `keep` | Keep course-bound; ensure edits feed the course and session flows clearly |
| `lecturer_cockpit.html` | Broad operational cockpit with live-session controls and multi-stage workflow | Full faculty workspace for course-scoped operational work | `narrow` | Reduce overlap with `micro_cockpit.html`; clarify when this page should be used instead of micro |
| `micro_cockpit.html` | Live lesson management page with session controls | Exclusive live-session orchestration page | `narrow` | Strip planning/analytics spillover; optimize for speed and runtime control |
| `macro_cockpit.html` | Hybrid page mixing planning, research, and some operational constructs | Longitudinal planning and alignment workspace | `narrow` | Keep planning/research functions; remove or avoid duplicated live-session behavior |
| `cockpit.html` | Research Lab and performance analytics page | Research and evidence lab | `keep` | Keep separate from live teaching; feed outputs into planning and intervention decisions |
| `architect_studio.html` | Dedicated bot architect and innovation flow | Innovation workspace | `keep` | Preserve isolation from daily teaching flow; route outputs back into course planning |
| `lesson_view.html` | Live session surface for students and lecturer | Official live lesson surface | `keep` | Continue aligning payloads to course/unit context so it reflects the actual course |
| `waiting_lobby.html` | Student pre-session entry page | Official session gateway | `keep` | Keep focused on readiness, presence, and controlled transition into `lesson_view.html` |
| `skills.html` | Student-facing skills hub | Outside lecturer architecture unless a lecturer-facing variant is created | `student-only` | Do not position as a lecturer workspace unless access model and UX are redesigned |
| `students.html` | Student-side entry surface | Outside lecturer architecture | `student-only` | Keep separate from faculty navigation |
| `student_dashboard.html` | Student dashboard | Outside lecturer architecture | `student-only` | Keep separate from faculty navigation |
| `admin_cockpit.html` | System/admin management | Outside lecturer architecture | `keep` | Keep outside faculty workspace to prevent governance leakage |
| `institution_dashboard.html` | Institutional dashboard | Outside lecturer architecture | `keep` | Keep separate from individual lecturer workflows |

## Critical Architectural Problems To Solve

### 1. Duplicate live-session behavior

The biggest implementation risk is that live-classroom actions are still duplicated across:

- `lecturer_cockpit.html`
- `micro_cockpit.html`
- `macro_cockpit.html`

This creates both conceptual and maintenance debt.

Recommended action:

- Make `micro_cockpit.html` the authoritative live-session control page
- Reduce or remove overlapping runtime session logic elsewhere

### 2. Under-defined course home

`smart_class.html` already behaves like a course home, but may still be treated as optional or transitional.

Recommended action:

- Officially define `smart_class.html` as the lecturer-facing course home
- Route course-level actions from there in a consistent way

### 3. Weak artifact flow

The pages exist, but the architecture still needs explicit artifact transitions.

Recommended artifacts to define:

- course plan
- unit plan
- pre-session task
- live session state
- student evidence
- analytics insight
- redesign action

## Recommended Flow Model

### Teaching Flow

1. `lecturer_hub.html`
2. `my_courses.html`
3. `smart_class.html`
4. `course_units.html` or `micro_cockpit.html`
5. `waiting_lobby.html`
6. `lesson_view.html`

### Improvement Flow

1. `lesson_view.html`
2. `cockpit.html`
3. `macro_cockpit.html`
4. `course_units.html` or `smart_class.html`

### Innovation Flow

1. `lecturer_hub.html`
2. `architect_studio.html`
3. return to `macro_cockpit.html` or `smart_class.html`

## Immediate Implementation Priorities

### Priority 1

Clarify `lecturer_hub.html` as a router, not a competing execution surface.

### Priority 2

Promote `smart_class.html` to official course home.

### Priority 3

Consolidate live-session behavior into `micro_cockpit.html`.

### Priority 4

Define what artifacts move between course, session, research, and planning pages.

### Priority 5

Keep student-only pages out of lecturer architecture unless explicitly redesigned.

## Final Recommendation

Do not create new top-level pages yet.

First:

1. lock role definitions for existing pages
2. reduce duplicate behavior
3. formalize the course as the main teaching container
4. define artifact flow between spaces

Only after that should new hubs or new top-level categories be introduced.