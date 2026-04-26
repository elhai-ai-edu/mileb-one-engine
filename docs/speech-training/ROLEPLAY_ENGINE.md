# Role-Play Engine Specification

## 1. Purpose
The Role-Play Engine is responsible for creating structured, interactive simulations in which the learner practices real-time communication skills.

Unlike static Q&A systems, the Role-Play Engine generates a dynamic conversational environment where the AI agent adopts a role and interacts with the learner as another human participant would.

---

## 2. Conceptual Model

Role-play is treated as a **situated interaction system**:

- The learner acts within a defined social role
- The system enforces contextual constraints
- Learning emerges from performance, not explanation

Core principle:

> The system must remain in role during simulation.

---

## 3. Scenario Model

Each role-play scenario is defined in `KB_ROLEPLAY_SCENARIOS.json`.

### Example

```json
{
  "id": "INTERVIEW_STANDARD_REALISTIC_01",
  "type": "job_interview",
  "difficulty": "moderate",
  "botRole": "interviewer",
  "studentRole": "candidate",
  "scenario": {
    "context": "Interview for a competitive position",
    "tone": "neutral",
    "openingLine": "Why do you think you are a good fit for this role?"
  },
  "behavior": {
    "style": "professional",
    "followUp": true,
    "challengeLevel": 2
  }
}
```

---

## 4. Engine Logic

### 4.1 State Object

```js
state = {
  scenarioId,
  difficultyLevel,
  turnCount,
  mode
}
```

---

### 4.2 Turn Generation

```js
function generateNextTurn(state, performance) {
  if (state.difficultyLevel === 1) return askBasicQuestion();
  if (state.difficultyLevel === 2) return askFollowUp();
  if (state.difficultyLevel === 3) return askChallenge();
}
```

---

### 4.3 Completion Logic

```js
function shouldComplete(state, criteria) {
  return state.turnCount >= criteria.minTurns;
}
```

---

## 5. Interaction Rules

- One question at a time
- Stay in character
- No teaching during simulation
- No skipping stages

---

## 6. Integration Points

The Role-Play Engine receives:
- speechMetrics from Speech Layer
- difficulty signals from Adaptive Engine

It outputs:
- next conversational turn

---

## 7. Edge Cases

- No response → repeat question or simplify
- Very long latency → switch to supportive mode
- Repeated failure → reduce difficulty

---

## 8. Pedagogical Implications

This engine enables:
- situated learning
- real-time decision making
- performance-based assessment

---

## 9. Research Implications

The Role-Play Engine provides structured data for:
- interaction analysis
- response timing studies
- communication behavior modeling

---

## 10. Key Constraint

The system must never break role unless explicitly instructed (pause or end of simulation).
