# Student Performance Dashboard Specification

## 1. Purpose
The Student Performance Dashboard provides the instructor with a real-time view of learner performance during speech-based role-play activities.

It is not only a visualization layer. It is a **decision dashboard** that helps the instructor understand classroom dynamics and take immediate pedagogical action.

---

## 2. Conceptual Model

The Dashboard converts raw learner activity into actionable instructional awareness:

Speech Data → Metrics → Status Classification → Instructor Insight → Cockpit Action

Core principle:

> The dashboard should reduce instructor cognitive load, not increase it.

---

## 3. Dashboard Responsibilities

The Dashboard is responsible for:

- displaying student-level performance data
- summarizing classroom-level status
- identifying students who may need support
- surfacing one clear recommendation at a time
- connecting insights to instructor controls in the Cockpit

---

## 4. Student Card Model

Each learner is represented by a compact performance card.

### Required Fields

```json
{
  "studentId": "123",
  "name": "Learner Name",
  "status": "active",
  "speech": {
    "latency": 3.2,
    "duration": 22.5,
    "fluency": 0.68,
    "confidence": 0.61
  },
  "lastUpdate": 1710000000
}
```

---

## 5. Core Metrics Displayed

### 5.1 Response Latency
Time between bot prompt completion and learner speech start.

### 5.2 Speech Duration
Total time spoken in the current turn or stage.

### 5.3 Fluency
Normalized score derived from speech rate, pauses, fillers, and continuity.

### 5.4 Confidence
Derived signal based on latency, hesitation, continuity, and speech stability.

---

## 6. Status Classification

The dashboard should classify each learner into a simple visible status.

```js
function getStatus(data) {
  if (!data || !data.speech) return "unknown";
  if (data.speech.duration === 0) return "silent";
  if (data.speech.latency > 6) return "hesitating";
  if (data.speech.fluency < 0.4) return "low_fluency";
  if (data.speech.confidence > 0.7 && data.speech.fluency > 0.7) return "strong";
  return "active";
}
```

---

## 7. Classroom-Level Summary

The Dashboard must compute aggregate class state:

```json
{
  "activeStudents": 24,
  "silentStudents": 3,
  "avgFluency": 0.61,
  "avgConfidence": 0.58,
  "avgLatency": 4.2,
  "classState": "stable"
}
```

### Class State Options

- `struggling`
- `stable`
- `ready_for_challenge`
- `uneven`

---

## 8. Decision Dashboard Logic

The dashboard must not overwhelm the instructor with many alerts.

It should expose:

```text
One main classroom insight + one recommended action
```

Example:

```json
{
  "insight": "Several learners are hesitating before speaking.",
  "recommendedAction": "Run a quick-start practice round.",
  "cockpitAction": "quick_start_practice"
}
```

---

## 9. Cockpit Integration

The Dashboard connects directly to the Role-Play Control layer.

### Example Actions

- reduce difficulty
- increase challenge
- switch to supportive mode
- start micro-practice
- require another speech turn

```js
function applyDashboardAction(action) {
  if (action === "reduce_load") setDifficulty(1);
  if (action === "increase_challenge") setDifficulty(3);
  if (action === "supportive_mode") setBehaviorStyle("supportive");
}
```

---

## 10. Realtime Data Flow

### Input
- Firebase classroom session data
- local fallback state
- speech metrics emitted from learner sessions

### Output
- rendered dashboard
- classroom summary
- recommended instructor action

```text
Student Speech → Firebase Update → Dashboard Listener → Render → Insight → Cockpit Action
```

---

## 11. Firebase Integration Pattern

```js
function listenToClassroom(sessionId) {
  const ref = firebase.database().ref(`classroom/${sessionId}/students`);

  ref.on("value", snapshot => {
    const students = snapshot.val() || {};
    renderDashboard(students);
  });
}
```

The implementation must fail gracefully when Firebase is unavailable.

---

## 12. Visual Design Principles

The dashboard should be:

- compact
- readable from classroom distance
- color-coded but not overloaded
- action-oriented
- stable under live updates

### Recommended Visual Units

- student card
- class summary strip
- intervention panel
- recent activity indicator

---

## 13. Edge Cases

### No Data
Show empty state:

> No student speech data available yet.

### Partial Data
Render available fields and mark missing fields as unknown.

### Late Updates
Use `lastUpdate` to indicate stale records.

### Large Class
Use grouping or filtering:
- show struggling first
- show silent students
- show strong students

---

## 14. Pedagogical Implications

The Dashboard supports:

- real-time instructional awareness
- differentiated support
- evidence-informed teaching decisions
- classroom-level orchestration

It allows the instructor to notice not only who completed the task, but who is struggling with real-time spoken performance.

---

## 15. Research Implications

The Dashboard creates a basis for studying:

- classroom fluency patterns
- instructor interventions
- group readiness
- relationship between dashboard feedback and learning outcomes

---

## 16. Design Constraint

The Dashboard must never replace instructor judgment.

It should provide clear signals and recommended actions, while leaving final decision authority to the instructor.
