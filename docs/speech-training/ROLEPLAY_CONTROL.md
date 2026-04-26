# Role-Play Control & Instructor Cockpit Specification

## 1. Purpose
The Role-Play Control system defines how instructors interact with, configure, and override the Speech Training Engine in real time.

It transforms the system from an autonomous adaptive engine into a **teacher-centered instructional operating system**.

---

## 2. Conceptual Model

The Cockpit operates as a **control layer above all engines**:

Instructor Intent → Configuration → Runtime Override → Engine Behavior

Core principle:

> The instructor is always the final authority over system behavior.

---

## 3. Control Dimensions

The instructor can control the system across multiple dimensions:

### 3.1 Scenario Control
- scenarioId
- role context
- simulation type

### 3.2 Difficulty Control
- difficultyLevel (1–3)
- fixed vs adaptive

### 3.3 Behavior Control
- interaction style (supportive / neutral / challenging)
- follow-up questions (on/off)
- interruptions (on/off)

### 3.4 Speech Policy Control
- requireSpeech (boolean)
- minSpeechSeconds
- allowTextFallback

### 3.5 Adaptation Control
- adaptiveMode (on/off)
- sensitivity level

---

## 4. Configuration Model

```json
{
  "scenarioId": "INTERVIEW_STANDARD_REALISTIC_01",
  "difficulty": 2,
  "adaptiveMode": true,
  "behavior": {
    "style": "neutral",
    "followUp": true,
    "interruptions": false
  },
  "speechPolicy": {
    "requireSpeech": true,
    "minSpeechSeconds": 10,
    "allowTextFallback": false
  }
}
```

---

## 5. Runtime Override Logic

### Priority Hierarchy

```text
Instructor Override > System Guards > Adaptive Engine > Default Behavior
```

---

### Example

```js
if (config.adaptiveMode === false) {
  disableAdaptiveEngine();
}

if (config.difficulty) {
  forceDifficulty(config.difficulty);
}
```

---

## 6. Classroom Broadcast

The instructor can push configuration updates to all students in real time.

```js
function broadcastConfig(config) {
  // send config to all active sessions
}
```

---

## 7. Conflict Resolution

### Case 1: Adaptive vs Instructor

- Instructor decision overrides adaptive logic

### Case 2: Speech Required vs Student Behavior

- System enforces speech requirement before progression

### Case 3: Scenario vs Journey

- Scenario override is temporary and does not break learning trajectory

---

## 8. UI Integration (Cockpit)

### Required Components
- Scenario selector
- Difficulty slider
- Behavior toggles
- Speech requirement toggle
- Adaptive mode switch

### State Handling

```js
saveConfig(config);
loadConfig();
applyConfig();
```

---

## 9. Edge Cases

- Instructor changes config mid-turn → apply next turn
- Conflicting settings → resolve by priority hierarchy
- Missing config → fallback to defaults

---

## 10. Pedagogical Implications

The Cockpit enables:

- real-time instructional intervention
- differentiated instruction
- alignment between pedagogy and system behavior

---

## 11. Research Implications

Enables study of:

- instructor intervention effects
- adaptive vs manual control outcomes
- classroom-level dynamics

---

## 12. Design Constraint

The system must allow full instructor control without breaking system integrity.

Instructor actions should feel immediate, predictable, and reversible.
