# Course Sources → Lesson Flow → Runtime Contract v1

## MilEd.One

**Version:** v1.0 (Draft)  
**Date:** 2026-04-23  
**Status:** Ready for implementation discussion

---

## 1. Purpose

Define a canonical contract for transforming multiple course knowledge sources into a unified Lesson Flow, and executing it as a runtime in MilEd.One.

---

## 2. Core Principle

Lesson Flow is NOT generated from a single source.

It is generated from a **multi-source system**:

- Syllabus (normative)
- Lesson Plan (pedagogical)
- Moodle / Course Metadata (structural)
- Course Bundle (resources, units, sprints)
- ATS Activity Bank (activities)

---

## 3. Source Roles

### 3.1 Syllabus (Normative Layer)
Defines:
- Learning goals
- Unit intent
- Expected outputs
- Official sequence

### 3.2 Lesson Plan (Pedagogical Layer)
Defines:
- Teaching strategy
- Stage breakdown
- Flow intention

### 3.3 Moodle Metadata (Structural Layer)
Defines:
- Units
- Resources
- Content structure

### 3.4 Course Bundle (Operational Layer)
Includes:
- playlist
- selectedUnits
- resources
- sprintDefinitions

### 3.5 ATS Activity Bank (Activity Layer)
Defines:
- Activities
- Patterns
- Instructional units

---

## 4. Lesson Flow Definition

Lesson Flow is a canonical object:

```
Course Sources → Lesson Builder → Lesson Flow → Runtime
```

---

## 5. Lesson Flow Schema (v1)

```json
{
  "lessonId": "string",
  "courseId": "string",
  "unitId": "string",
  "nodes": [
    {
      "nodeId": "string",
      "stageLabel": "string",
      "activities": ["activityId"],
      "resources": ["resourceId"],
      "botMode": "string",
      "gate": null
    }
  ],
  "runtime": {
    "activeNodeId": "string"
  }
}
```

---

## 6. Builder Responsibility

New module: `lesson_builder.js`

Responsible for:
- merging sources
- mapping activities to nodes
- attaching resources
- building canonical flow

---

## 7. Runtime Authority

`functions/classroom.js`

Responsibilities:
- store lesson flow
- manage runtime state
- update active node
- handle gates

---

## 8. Rendering Layer

`lesson_view.html`

Responsibilities:
- render nodes
- show active stage
- display resources
- activate bot per node

---

## 9. Control Layer

`micro_cockpit.html`

Responsibilities:
- advance flow
- control nodes
- manage gates
- monitor lesson

---

## 10. Architectural Decision

The system evolves from:

Activities + Tools

To:

Canonical Lesson Flow + Runtime + Control

---

## 11. Next Step

Implement Lesson Builder and connect to classroom.js
