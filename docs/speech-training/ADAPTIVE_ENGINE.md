# Adaptive Engine Specification

## 1. Purpose
The Adaptive Engine is responsible for dynamically adjusting the learning experience in real time based on the learner’s spoken performance.

It transforms the system from a reactive chatbot into an active pedagogical agent that regulates difficulty, pacing, and interaction style.

---

## 2. Conceptual Model

The Adaptive Engine operates as a **decision layer** between performance signals and instructional behavior.

Core loop:

Performance → Interpretation → Decision → Adaptation

The engine does not evaluate correctness of content alone, but **quality of performance under real-time constraints**.

---

## 3. Input Signals

### 3.1 Speech Metrics

```json
{
  "fluency": 0.65,
  "confidence": 0.58,
  "latency": 3.2
}
```

### 3.2 Context Signals

- current difficulty level
- turn count
- scenario type
- role-play mode

---

## 4. Core Decision Functions

### 4.1 Difficulty Adjustment

```js
function adaptDifficulty(state, performance) {
  if (performance.fluency > 0.75 && performance.confidence > 0.7) {
    return increaseDifficulty(state);
  }

  if (performance.fluency < 0.4 || performance.latency > 5) {
    return decreaseDifficulty(state);
  }

  return state;
}
```

---

### 4.2 Mode Switching

```js
function adaptMode(performance) {
  if (performance.latency > 5) return "supportive";
  if (performance.fluency > 0.7) return "challenging";
  return "neutral";
}
```

---

### 4.3 Difficulty Constraints

```js
function clampDifficulty(level) {
  return Math.max(1, Math.min(3, level));
}
```

---

## 5. Adaptation Policies

### Increase Challenge

Conditions:
- high fluency
- high confidence

Actions:
- deeper questions
- request examples
- introduce ambiguity

---

### Reduce Load

Conditions:
- low fluency
- long latency

Actions:
- simplify questions
- slow interaction pace
- remove pressure

---

### Stabilize

Conditions:
- mid-range performance

Actions:
- maintain difficulty
- reinforce structure

---

## 6. Temporal Constraints

- Adaptation occurs once per turn
- No more than ±1 difficulty change per turn
- Avoid oscillation (up/down repeatedly)

---

## 7. Integration Points

Input:
- speechMetrics (Speech Engine)
- rolePlayState (Roleplay Engine)

Output:
- updated difficulty level
- interaction mode
- adaptation flags

---

## 8. Edge Cases

- No speech input → fallback to supportive mode
- Extremely high latency → insert pause-friendly prompt
- Repeated low performance → trigger reinforcement loop

---

## 9. Pedagogical Implications

The Adaptive Engine operationalizes:

- scaffolding
- zone of proximal development
- effort regulation

It ensures that the learner is continuously challenged but not overwhelmed.

---

## 10. Research Implications

Enables study of:

- performance under adaptive difficulty
- learning curves
- response latency vs confidence
- real-time skill acquisition

---

## 11. Design Constraint

The system must adapt behavior without explicitly exposing adaptation logic to the learner.

Adaptation must feel natural, not mechanical.
