# Intervention Engine Specification

## 1. Purpose
The Intervention Engine translates performance signals into concrete instructional actions.

It acts as a real-time pedagogical assistant, helping the instructor decide what to do next based on both individual and classroom-level dynamics.

---

## 2. Conceptual Model

The engine operates as a **decision-mapping system**:

Signal → Diagnosis → Intervention → Action

Core principle:

> Always provide one clear, actionable recommendation.

---

## 3. Input Signals

### 3.1 Individual Signals
- latency
- fluency
- confidence
- speech duration

### 3.2 Group Signals
- average fluency
- number of silent students
- distribution of performance

### 3.3 Profile Signals
- dominant pattern (hesitant / confident / mixed)
- trend (improving / declining / stable)

---

## 4. Diagnosis Layer

### 4.1 Rule-Based Diagnosis

```js
function diagnose(data) {
  if (data.silentStudents > 3) return "low_engagement";
  if (data.avgLatency > 5) return "hesitation";
  if (data.avgFluency < 0.5) return "low_fluency";
  if (data.avgConfidence < 0.5) return "low_confidence";
  return "stable";
}
```

---

## 5. Intervention Library

### Core Interventions

- `reduce_load`
- `increase_challenge`
- `quick_start_practice`
- `fluency_micro_practice`
- `structure_practice`
- `activate_silent_students`
- `stabilize`

---

## 6. Mapping Logic

```js
function mapIntervention(diagnosis) {
  switch (diagnosis) {
    case "low_engagement": return "activate_silent_students";
    case "hesitation": return "quick_start_practice";
    case "low_fluency": return "fluency_micro_practice";
    case "low_confidence": return "reduce_load";
    default: return "stabilize";
  }
}
```

---

## 7. Action Binding

Each intervention maps to a cockpit action:

```js
function getCockpitAction(intervention) {
  const actions = {
    reduce_load: "setDifficulty(1)",
    increase_challenge: "setDifficulty(3)",
    quick_start_practice: "triggerQuickStart()",
    fluency_micro_practice: "triggerFluencyDrill()",
    structure_practice: "triggerStructureTask()",
    activate_silent_students: "promptAllStudents()",
    stabilize: "maintainState()"
  };

  return actions[intervention];
}
```

---

## 8. Output Model

```json
{
  "diagnosis": "hesitation",
  "intervention": "quick_start_practice",
  "title": "Students are hesitating",
  "reason": "Average response time is high",
  "suggestedAction": "Run a short speaking warm-up",
  "cockpitAction": "triggerQuickStart()"
}
```

---

## 9. Noise Reduction

Rules:
- Only one recommendation at a time
- Do not repeat same recommendation within short window
- Require meaningful signal change for new recommendation

---

## 10. Integration Points

Input:
- Dashboard (class state)
- Profile Engine (long-term patterns)
- Adaptive Engine (recent performance)

Output:
- recommendation object
- cockpit action trigger

---

## 11. Edge Cases

- conflicting signals → prioritize group-level patterns
- no data → return null
- unstable class → choose stabilize

---

## 12. Pedagogical Implications

The Intervention Engine supports:

- real-time instructional decisions
- adaptive classroom management
- targeted support for struggling learners

---

## 13. Research Implications

Enables study of:

- intervention effectiveness
- timing of pedagogical actions
- classroom adaptation patterns

---

## 14. Design Constraint

The system must support instructor decision-making without overwhelming or replacing it.

It should suggest, not command.
