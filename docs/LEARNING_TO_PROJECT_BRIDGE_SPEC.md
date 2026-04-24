# LEARNING TO PROJECT BRIDGE SPEC

## MilEd.One / PAIOS

**Version:** v0.1  
**Status:** Runtime design draft  
**Purpose:** Define the bridge between the learning pipeline and the project pipeline. Determines when, how, and whether a student may transition from structured learning activities into a multi-stage project.

---

## 1. Purpose

The Learning-to-Project Bridge is a decision layer that sits between:

```
Learning Pipeline (preparation, skills, tasks)
↓ [bridge]
Project Pipeline (multi-stage project execution)
```

It answers:

- Is the student ready to start the project?
- If not — what is missing?
- Can the student proceed anyway (flexible)? Or must they complete prerequisites (strict)?
- What should the student be told about the transition?

---

## 2. Architecture Position

```
Extractor / Config
→ Process State Manager
→ Bridge Logic (learning_to_project_bridge.js)
→ Runtime Driver
→ Instruction Builder
→ chat.js Orchestration Layer
→ Model Response
```

The bridge is evaluated **before** allowing the student to enter a project stage.

---

## 3. Bridge Configuration Schema

```json
{
  "bridge_type": "learning_to_project",
  "bridge_mode": "flexible | strict",
  "bridge_visibility": "visible | invisible",
  "transition_tone": "soft_guiding",
  "missing_policy": "warn_and_track | block_until_complete",
  "required_preparation_outputs": [],
  "pipeline_id": "..."
}
```

### Field Descriptions

| Field | Description |
|-------|-------------|
| `bridge_type` | Always `learning_to_project` for this spec |
| `bridge_mode` | `flexible`: warn and allow; `strict`: block until complete |
| `bridge_visibility` | `visible`: student sees bridge status; `invisible`: silent enforcement |
| `transition_tone` | Always `soft_guiding` — no grading tone |
| `missing_policy` | `warn_and_track`: log and continue; `block_until_complete`: prevent project entry |
| `required_preparation_outputs` | List of preparation output keys that must exist before project entry |
| `pipeline_id` | Identifies which learning pipeline feeds this bridge |

---

## 4. Bridge Modes

### 4.1 Flexible + Visible (default for current implementation)

Student is warned about incomplete preparations but **allowed to proceed**.

Response example:
```
נראה שאתה מוכן להתחיל, אבל חסרים עדיין כמה חלקים מהשלב ההכנה.
אפשר להתקדם, וכדאי לזכור להשלים אותם בהמשך.
```

### 4.2 Flexible + Invisible

Student proceeds silently. Missing items are logged for teacher visibility only.

### 4.3 Strict (any visibility)

Student is **blocked** from project entry until all required preparations are complete.

Response example:
```
לפני שמתקדמים לפרויקט, צריך להשלים את החלקים החסרים.
```

---

## 5. Separation Between Pipelines

**Critical rule:** Same architecture, different pedagogical pipelines.  
Do not merge processes just because they share methods.

| Pipeline | Purpose |
|----------|---------|
| `critical_review_learning_pipeline` | Critical thinking skills, vocabulary, analysis tasks |
| `intro_social_sciences_pipeline` | Inductive concept building, peer interaction |
| `multi_stage_research_project` | Full project: problem → solution → report → presentation |

Each pipeline may have its own bridge configuration pointing to its own project.

**Never merge** `critical_review_learning_pipeline` with `intro_social_sciences_pipeline` because both include critical thinking skills.

---

## 6. Readiness Evaluation Logic

```
evaluateBridgeReadiness(state, bridgeConfig)
→ {
    ready: boolean,
    missing: [],
    can_proceed: boolean,
    message: string,
    mode: 'flexible' | 'strict'
  }
```

Steps:
1. Extract `required_preparation_outputs` from `bridgeConfig`.
2. Check which are present in `state.preparation_outputs`.
3. If all present → `ready: true`.
4. If missing → check `bridge_mode`.
   - `flexible` → `can_proceed: true`, warn message.
   - `strict` → `can_proceed: false`, block message.

---

## 7. Bridge Transition Message Format

Messages follow the PAIOS tone guidelines:

- Soft, non-judgmental
- No grading language
- Guide one step at a time
- In Hebrew

---

## 8. Runtime Integration

`applyBridgePolicy(state, bridgeConfig)` modifies the state:

- Sets `state.bridge.status`: `ready | warned | blocked`
- Sets `state.bridge.missing`: list of incomplete preparation outputs
- Sets `state.bridge.can_proceed`: boolean

The Runtime Driver reads `state.bridge.can_proceed` before allowing stage advance into project territory.

---

## 9. Teacher Visibility

When `bridge_visibility === 'visible'`:

- `state.teacher_view.flags` includes `bridge_incomplete` when missing items exist.
- Teacher sees: student entered project with incomplete preparations.

---

## 10. Future Extensions

- Asynchronous bridge: student can return to complete preparations even after project has started.
- Bridge scoring: weight preparations differently (some are critical, some optional).
- Multi-bridge: a project may require multiple sequential bridges.
