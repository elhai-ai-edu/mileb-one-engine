# System Guards Specification (Pedagogical Constitution)

## 1. Purpose
The System Guards layer defines the non-negotiable rules that preserve the pedagogical integrity, structural coherence, and reliability of the Speech Training System.

It acts as the **constitutional layer** of the system.

Core principle:

> No component, including instructor overrides, may violate core pedagogical constraints.

---

## 2. Conceptual Model

The guards operate as a **pre-execution validation layer**:

Action → Guard Check → Allow / Block / Modify → Execution

---

## 3. Guard Categories

### 3.1 Structural Guards
Prevent invalid learning flow.

Rules:
- No skipping required stages
- No completion without minimum interaction
- No transition without readiness

---

### 3.2 Pedagogical Guards
Preserve learning quality.

Rules:
- Maintain learner agency
- Prevent full solution substitution
- Require active participation

---

### 3.3 Speech Enforcement Guards
Ensure real speech practice occurs.

Rules:
- If `requireSpeech = true`, block progression without speech
- Enforce `minSpeechSeconds`

```js
if (config.requireSpeech && speech.duration < config.minSpeechSeconds) {
  block("Speech requirement not met");
}
```

---

### 3.4 Role Integrity Guards
Preserve simulation validity.

Rules:
- System must stay in role during role-play
- No teaching explanations during active simulation

---

### 3.5 Evaluation Guards
Ensure valid assessment.

Rules:
- No evaluation without explicit criteria
- No grading without evidence

---

---

## 4. Guard Enforcement Logic

```js
function applyGuards(action, context) {
  const violations = checkViolations(action, context);

  if (violations.length === 0) return action;

  return resolveViolation(action, violations);
}
```

---

## 5. Priority Hierarchy

```text
System Guards > Instructor Control > Adaptive Engine > Default Behavior
```

---

## 6. Conflict Resolution

### Case: Instructor vs Guard

If an instructor attempts to override a protected rule:

```js
if (violatesGuard(action)) {
  blockAction();
}
```

Examples:
- cannot skip required stage
- cannot bypass speech requirement

---

## 7. Visible vs Invisible Guards

### Invisible Guards
- effort regulation
- adaptation smoothing

### Visible Guards
- speech requirement prompts
- stage completion requirements

---

## 8. Integration Points

Guards must be checked in:

- chat.js (before response execution)
- roleplayEngine (before next turn)
- journeyEngine (before stage transition)
- cockpit (before applying instructor override)

---

## 9. Edge Cases

- missing data → fallback validation
- partial speech → request continuation
- conflicting constraints → prioritize guards

---

## 10. Pedagogical Implications

The guards ensure:

- active learning
- learner responsibility
- structural consistency
- valid skill development

---

## 11. Research Implications

Allows examination of:

- effects of enforced participation
- impact of structure on learning outcomes
- boundary conditions of adaptive systems

---

## 12. Design Constraint

Guards must be:
- consistent
- predictable
- minimally intrusive

They should shape behavior without disrupting the learning experience.

---

## 13. Core Guard Set (Summary)

```text
1. No-Skip Guard
2. Speech Requirement Guard
3. Role Integrity Guard
4. Evaluation Integrity Guard
5. Agency Preservation Guard
```

These form the constitutional backbone of the system.
