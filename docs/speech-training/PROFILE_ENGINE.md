# Performance Profile Engine Specification

## 1. Purpose
The Profile Engine maintains a persistent, longitudinal representation of the learner’s spoken performance over time.

Its goal is not only to store data, but to **model the learner’s evolving capabilities**, detect patterns, and inform future adaptation and learning decisions.

---

## 2. Conceptual Model

The Profile Engine operates as a **temporal aggregation system**:

Session Data → Aggregation → Pattern Detection → Trend Analysis → Adaptive Influence

Core principle:

> The system should adapt based on the learner’s trajectory, not only their last response.

---

## 3. Data Model

### 3.1 Profile Structure

```json
{
  "studentId": "123",
  "profileVersion": "1.0",
  "speechProfile": {
    "avgFluency": 0.62,
    "avgConfidence": 0.58,
    "avgLatency": 3.9
  },
  "behaviorProfile": {
    "dominantPattern": "hesitant",
    "responseStyle": "short"
  },
  "learningState": {
    "currentLevel": 2,
    "recommendedDifficulty": 2
  },
  "history": {
    "sessions": 6
  }
}
```

---

## 4. Aggregation Logic

### 4.1 Moving Average

```js
function movingAverage(oldValue, newValue, alpha = 0.3) {
  return oldValue * (1 - alpha) + newValue * alpha;
}
```

Explanation:
- alpha controls weight of recent performance
- higher alpha → more reactive profile
- lower alpha → more stable profile

---

### 4.2 Temporal Decay

Older data gradually loses influence:

```js
adjustedValue = value * decayFactor^time
```

---

## 5. Pattern Detection

### 5.1 Rule-Based Classification

```js
function detectPattern(profile) {
  if (profile.avgLatency > 5 && profile.avgFluency < 0.5) {
    return "hesitant";
  }

  if (profile.avgFluency > 0.7 && profile.avgConfidence > 0.7) {
    return "confident";
  }

  return "mixed";
}
```

---

## 6. Trend Analysis

### 6.1 Directional Change

```js
function calculateTrend(values) {
  if (isIncreasing(values)) return "improving";
  if (isDecreasing(values)) return "declining";
  return "stable";
}
```

---

## 7. Derived Metrics

### 7.1 Confidence Interval Approximation

```js
confidenceRange = avg ± variance
```

Used to estimate stability of performance.

---

## 8. Integration with Adaptive Engine

The profile modifies adaptation decisions:

- hesitant profile → slower progression
- confident profile → faster escalation

```js
if (profile.behaviorProfile.dominantPattern === "hesitant") {
  state.mode = "supportive";
}
```

---

## 9. Learning State Logic

```js
function updateLearningLevel(profile) {
  if (profile.avgFluency > 0.7 && profile.avgConfidence > 0.7) {
    return 3;
  }

  if (profile.avgFluency < 0.5) {
    return 1;
  }

  return 2;
}
```

---

## 10. Edge Cases

- Sparse data → avoid strong conclusions
- Sudden spikes → smooth via moving average
- inconsistent performance → mark as unstable

---

## 11. Pedagogical Implications

The Profile Engine enables:

- longitudinal skill tracking
- adaptive pacing
- personalized learning paths

It shifts the system from session-based interaction to **developmental modeling**.

---

## 12. Research Implications

Enables investigation of:

- fluency development over time
- latency as indicator of cognitive load
- confidence growth patterns
- stability vs variability in learning

---

## 13. Design Constraint

The profile must not label or stigmatize the learner.

All adaptations must be implicit and supportive.
