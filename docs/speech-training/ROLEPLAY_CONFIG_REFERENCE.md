# Role-Play Configuration Reference (Full System Spec)

## 1. Purpose
This document defines the complete configuration model for the Speech Training System.

It centralizes all runtime parameters, validation rules, dependencies, and default values.

Core principle:

> The system is fully config-driven. All behavior must be controllable via structured configuration.

---

## 2. Configuration Schema

```json
{
  "scenarioId": "string",
  "difficulty": 1,
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
  },
  "adaptation": {
    "sensitivity": "medium",
    "maxStepChange": 1
  }
}
```

---

## 3. Field Definitions

### 3.1 scenarioId
- Type: string
- Source: KB_ROLEPLAY_SCENARIOS
- Required: yes

---

### 3.2 difficulty
- Type: integer
- Range: 1–3
- Default: 2

---

### 3.3 adaptiveMode
- Type: boolean
- Default: true

---

### 3.4 behavior.style
- Values: supportive | neutral | challenging

### 3.5 behavior.followUp
- Type: boolean

### 3.6 behavior.interruptions
- Type: boolean

---

### 3.7 speechPolicy.requireSpeech
- Type: boolean
- If true → Speech Guard enforced

### 3.8 speechPolicy.minSpeechSeconds
- Type: integer
- Range: 3–60

### 3.9 speechPolicy.allowTextFallback
- Type: boolean

---

### 3.10 adaptation.sensitivity
- Values: low | medium | high

### 3.11 adaptation.maxStepChange
- Range: 1–2

---

## 4. Default Configuration

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
  },
  "adaptation": {
    "sensitivity": "medium",
    "maxStepChange": 1
  }
}
```

---

## 5. Dependency Rules

### Rule 1: Speech Enforcement

```js
if (requireSpeech === true) {
  enforce(minSpeechSeconds);
}
```

---

### Rule 2: Adaptive Mode Off

```js
if (adaptiveMode === false) {
  disableAdaptiveEngine();
}
```

---

### Rule 3: Difficulty Bound

```js
difficulty = clamp(difficulty, 1, 3);
```

---

## 6. Validation Logic

```js
function validateConfig(config) {
  if (!config.scenarioId) throw Error("Missing scenarioId");
  if (config.difficulty < 1 || config.difficulty > 3) throw Error("Invalid difficulty");
  if (config.speechPolicy.minSpeechSeconds < 0) throw Error("Invalid speech duration");
  return true;
}
```

---

## 7. Integration Points

- Cockpit UI → sets config
- Roleplay Engine → uses scenario + behavior
- Adaptive Engine → uses adaptation rules
- Guards → enforce speechPolicy

---

## 8. Edge Cases

- Missing fields → fallback to defaults
- Conflicting rules → resolved by System Guards

---

## 9. Pedagogical Implications

The configuration model enables:

- controlled experimentation
- instructor customization
- adaptive + manual hybrid teaching

---

## 10. Research Implications

Enables experimentation with:

- different difficulty levels
- speech requirements
- adaptive vs fixed learning

---

## 11. Design Constraint

Configuration must be:
- explicit
- validated
- versionable
- compatible with all engines

---

## 12. Versioning

```json
{
  "configVersion": "1.0"
}
```

All future changes must increment version.
