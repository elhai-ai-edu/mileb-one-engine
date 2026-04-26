# Learning Journey Engine Specification

## 1. Purpose
The Learning Journey Engine defines the structured, adaptive progression of learners through different stages of speech development.

It transforms isolated practice sessions into a **coherent developmental pathway**, ensuring continuity, progression, and pedagogical integrity.

---

## 2. Conceptual Model

The system models learning as a **multi-phase adaptive trajectory**:

Profile → Readiness → Stage Decision → Experience → Update Profile → Next Stage

Core principle:

> Progression is based on readiness, not completion alone.

---

## 3. Journey Structure

### 3.1 Phases

```text
1. FOUNDATION
2. DEVELOPMENT
3. ADVANCED
```

---

### 3.2 Phase Definitions

#### FOUNDATION
- Goal: reduce hesitation, enable basic response
- Focus: latency reduction, sentence initiation

#### DEVELOPMENT
- Goal: improve fluency and structure
- Focus: continuity, clarity, expansion

#### ADVANCED
- Goal: handle complexity and pressure
- Focus: argumentation, flexibility, depth

---

## 4. Readiness Function

```js
function checkReadiness(profile) {
  return {
    fluencyReady: profile.avgFluency > 0.65,
    confidenceReady: profile.avgConfidence > 0.6,
    latencyReady: profile.avgLatency < 4
  };
}
```

---

## 5. Stage Transition Logic

```js
function getNextStage(profile, currentStage) {
  const readiness = checkReadiness(profile);

  if (currentStage === "FOUNDATION" && readiness.fluencyReady && readiness.latencyReady) {
    return "DEVELOPMENT";
  }

  if (currentStage === "DEVELOPMENT" && readiness.fluencyReady && readiness.confidenceReady) {
    return "ADVANCED";
  }

  return currentStage;
}
```

---

## 6. Adaptive Branching

The system supports multiple development paths:

- Fluency Path → repeated speaking exercises
- Confidence Path → supportive interactions
- Challenge Path → high-pressure simulations

```js
function selectPath(profile) {
  if (profile.avgConfidence < 0.5) return "confidence";
  if (profile.avgFluency < 0.5) return "fluency";
  return "challenge";
}
```

---

## 7. Anti-Skip Mechanism

Rules:
- No direct transition from FOUNDATION to ADVANCED
- Stage must be validated by readiness
- Reinforcement loops triggered if performance drops

```js
if (!readiness.fluencyReady) {
  return "reinforce";
}
```

---

## 8. Integration with Other Engines

### Input:
- Profile Engine (long-term data)
- Adaptive Engine (short-term signals)

### Output:
- next stage
- recommended path
- learning focus

---

## 9. Edge Cases

- fluctuating performance → delay transition
- sudden drop → revert to reinforcement
- plateau → introduce variation

---

## 10. Pedagogical Implications

The Learning Journey Engine operationalizes:

- developmental progression
- mastery-based advancement
- individualized learning paths

---

## 11. Research Implications

Enables study of:

- progression rates across learners
- transition thresholds
- relationship between fluency and confidence development

---

## 12. Design Constraint

The system must guide progression implicitly without exposing rigid stage boundaries to the learner.

Learning should feel continuous, not segmented.
