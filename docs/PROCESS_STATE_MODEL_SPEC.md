# PROCESS STATE MODEL SPEC

## MilEd.One / PAIOS

**Version:** v0.1  
**Status:** Runtime design draft  
**Purpose:** Define rich process state for guided learning pipelines, projects, bridges, validation, and future teacher visibility.

---

## 1. Purpose

Process state is the runtime memory of a learning process.

It does not only answer:

```text
Where is the learner now?
```

It also answers:

```text
What has the learner completed?
What is missing?
What quality issue appeared?
What is the next pedagogically valid move?
What should be visible to the teacher?
```

---

## 2. Architecture Position

```text
Extractor / Config
→ Process State Manager
→ Runtime Driver
→ chat.js Orchestration Layer
→ Model Response
→ Persisted State
```

`chat.js` should not own the pedagogy. It should load state, call the manager/driver, build the runtime instruction layer, call the model, and persist the updated state.

---

## 3. Canonical Rich State v0

```js
const processState = {
  process_id: 'critical_review_learning_001',
  student_id: 'student_x',

  pipeline_id: 'critical_review_learning_pipeline',
  project_type: 'critical_text_review',

  bridge: {
    bridge_type: 'learning_to_project',
    mode: 'flexible',
    visibility: 'visible',
    missing_policy: 'warn_and_track',
    transition_tone: 'soft_guiding'
  },

  current: {
    phase: 'learning',
    stage_id: 'vocabulary',
    stage_index: 0
  },

  preparation_outputs: {},
  project_outputs: {},
  missing: [],

  validation: {
    last_result: null,
    last_feedback_type: null,
    needs_refinement: false
  },

  history: [],

  teacher_view: {
    progress_percent: 0,
    current_status: 'in_progress',
    flags: []
  }
};
```

---

## 4. Bridge Policy

### Flexible Mode

Students may continue, but the system warns and tracks missing prerequisite outputs.

```js
bridge.mode = 'flexible'
bridge.missing_policy = 'warn_and_track'
```

### Strict Mode

Students cannot unlock the final project until required preparation outputs are complete.

```js
bridge.mode = 'strict'
bridge.missing_policy = 'block_until_complete'
```

---

## 5. Validation Policy

Validation is smart but non-judgmental.

It checks:

- has_content
- relevance
- completeness

It should not grade or say correct/incorrect.

Preferred feedback pattern:

```text
expand / refine / reconsider / add missing dimension
```

---

## 6. Required Manager Functions

```js
createInitialProcessState(config)
updatePreparationOutput(state, key, value)
updateProjectOutput(state, key, value)
computeMissing(state, required, options)   // options.source: 'auto' | 'preparation' | 'project' | 'both'
canAdvance(state)
advanceStage(state)
recordHistory(state, event)
computeTeacherView(state)
```

### computeMissing — Phase-Aware Behavior

`computeMissing` must be phase-aware:

- `learning` phase → checks `preparation_outputs`
- `project` phase → checks `project_outputs`
- `bridge` phase → checks both `preparation_outputs` and `project_outputs`
- explicit `source` option overrides auto-detection

Each flow node can declare `output_source: 'preparation' | 'project' | 'both'` to override the auto-detected source for that stage.

---

## 7. Current Supported Pipelines v0

### critical_review_learning_pipeline

Preparation outputs:

- vocabulary_done
- story_reflection_done
- ai_summary_done
- questions_answered
- oral_attempt_done

Project outputs:

- text_title
- author
- publication_place
- publication_date
- main_claim
- author_intent
- author_values
- negative_evaluation
- positive_evaluation
- conclusion
- recommendation
- continuous_review_draft

---

## 8. Guiding Principle

```text
State is not memory only.
State is pedagogical control.
```
