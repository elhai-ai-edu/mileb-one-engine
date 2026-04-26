# Agent Implementation Prompt — Speech Training System

You are working inside the MilEd.One repository.

Your task is to continue implementing the Speech Training System based on the documentation and runtime modules that already exist.

## Existing assets already created

Documentation:
- `docs/speech-training/SPEECH_TRAINING_SYSTEM.md`
- `docs/speech-training/SPEECH_ARCHITECTURE.md`
- `docs/speech-training/SPEECH_LAYER_SPEC.md`
- `docs/speech-training/ROLEPLAY_ENGINE.md`
- `docs/speech-training/ADAPTIVE_ENGINE.md`
- `docs/speech-training/PROFILE_ENGINE.md`
- `docs/speech-training/LEARNING_JOURNEY.md`
- `docs/speech-training/ROLEPLAY_CONTROL.md`
- `docs/speech-training/DASHBOARD.md`
- `docs/speech-training/INTERVENTION_ENGINE.md`
- `docs/speech-training/SYSTEM_GUARDS.md`
- `docs/speech-training/ROLEPLAY_CONFIG_REFERENCE.md`
- `docs/speech-training/KB_AUDIENCE_QUESTIONS.md`
- `docs/speech-training/KB_PRESENTATION_RUBRIC.md`

Runtime modules:
- `core/speechMetricsEngine.js`
- `core/roleplayEngine.js`
- `core/speechHookBridge.js`

## Core implementation principle

Do not rewrite the existing system.
Do not break `functions/chat.js`, `micro_cockpit.html`, `personal_project.html`, or classroom runtime files.
Work by adding isolated modules and small safe hooks.
Every step must remain reversible.

## Pedagogical target use case

Two advanced Hebrew classes are preparing for oral presentations of their research/project idea.
Each student presents:
1. the problem they selected
2. the target audience/client
3. the proposed solution
4. why the solution is useful or better than existing alternatives

The class plays the role of potential clients who ask questions.
The bot supports preparation, role-play simulation, speech practice, and feedback.

## Mandatory architecture rule

Use this pipeline:

```text
Student input / speech
→ speech metrics
→ roleplay state
→ adaptive decision
→ system augmentation block
→ chat prompt context
→ optional persistence
→ dashboard/intervention later
```

Do not jump directly to a full dashboard before the chat loop is stable.

---

# Phase 1 — Harden Existing Runtime Modules

## 1.1 Harden `core/speechMetricsEngine.js`

Tasks:
- Add defensive validation for all public functions.
- Ensure every numeric score is clamped to `0–1`.
- Ensure no function returns `undefined`.
- Add optional debug mode, but keep default silent.
- Preserve browser/global compatibility.

Definition of Done:
- `buildSpeechMetrics()` works with:
  - empty transcript
  - missing timing
  - typed text pretending to be speech
  - short speech duration
- No runtime error in browser console.

## 1.2 Harden `core/roleplayEngine.js`

Tasks:
- Keep default scenarios.
- Add validation for `scenarioId`, `difficulty`, and `completionCriteria`.
- Add a scenario specifically for the advanced Hebrew presentation use case if missing:
  - `PRESENTATION_CLIENT_AUDIENCE_01`
  - `PRESENTATION_CLIENT_CHALLENGE_01`
- Ensure generated turns are always one question at a time.

Definition of Done:
- `createRolePlayState()` returns a valid state with no missing required fields.
- `generateNextTurn()` never returns a multi-question block.

## 1.3 Harden `core/speechHookBridge.js`

Tasks:
- Make `runSpeechPipeline()` fail gracefully if any engine is unavailable.
- Add returned fields:
  - `ok`
  - `errors`
  - `warnings`
  - `systemAugmentation`
- Do not throw unless explicitly asked via debug option.

Definition of Done:
- Calling `runSpeechPipeline()` without speechData still returns a safe object.
- Calling it without roleplayConfig still returns a safe object.

---

# Phase 2 — Add Adaptive Runtime Module

Create:
- `core/adaptiveRoleplayEngine.js`

Implement:
- `clampDifficulty(level)`
- `generateAdaptationDecision(state, metrics, config)`
- `adaptDifficulty(state, metrics, config)`
- `adaptMode(state, metrics, config)`

Rules:
- Difficulty range is 1–3.
- Never change difficulty by more than 1 level per turn.
- If fluency and confidence are high, increase challenge.
- If latency is high or fluency is low, reduce load.
- If adaptive mode is disabled, return state unchanged.

Definition of Done:
- Strong metrics increase difficulty by one.
- Weak metrics decrease difficulty by one.
- Disabled adaptive mode keeps original state.

---

# Phase 3 — Roleplay State Between Turns

Create a lightweight state manager:
- `core/roleplayStateManager.js`

Implement:
- `createInitialRoleplayRuntimeState(config)`
- `loadRoleplayRuntimeState(sessionKey)`
- `saveRoleplayRuntimeState(sessionKey, state)`
- `updateRoleplayTurn(state, metrics)`
- `resetRoleplayState(sessionKey)`

Storage policy:
- Use `sessionStorage` in browser if available.
- Use in-memory fallback if not available.
- Do not require Firebase yet.

Definition of Done:
- `turnCount` persists across turns in the same browser session.
- roleplay state can reset safely.

---

# Phase 4 — Safe Chat Hook Integration

Goal:
Inject speech/roleplay context into the chat prompt without rewriting `functions/chat.js`.

Preferred path:
- Add a frontend-side augmentation field to the chat request body, such as:
  - `runtimeAugmentation`
  - `speechMetrics`
  - `roleplayState`

Then in `functions/chat.js`, add a narrow, defensive injection point:

```js
const runtimeAugmentation = body.runtimeAugmentation || "";
```

and append it to the system/context block only if present.

Rules:
- Do not change model routing.
- Do not alter existing process runtime path.
- Do not remove existing guards.
- If `runtimeAugmentation` is missing, behavior must remain exactly as before.

Definition of Done:
- Existing chat requests still work unchanged.
- A request with `runtimeAugmentation` causes the bot to receive role-play context.

---

# Phase 5 — Speech Required Guard

Add a soft runtime guard, preferably frontend first.

Tasks:
- If a stage/config says `requireSpeech: true`, block completion unless:
  - `inputType === "speech"`
  - `speechDuration >= minSpeechSeconds`
- Show a supportive Hebrew message when blocked.

Suggested message:

```text
בשלב הזה ההתקדמות תלויה בתרגול דיבור. נסה/י לענות בקול במשך כמה שניות, ואז נמשיך.
```

Definition of Done:
- Typed text does not satisfy a speech-required roleplay stage.
- Speech metadata can satisfy it.

---

# Phase 6 — Cockpit Configuration Hook

Goal:
Allow instructor control over role-play variables.

Update carefully:
- `micro_cockpit.html`

Add or integrate a Role-Play Control section with:
- scenario selector
- difficulty slider 1–3
- behavior style selector
- follow-up toggle
- interruptions toggle
- speech required toggle
- min speech seconds
- adaptive mode toggle
- sensitivity selector

Functions:
- `getRolePlayConfig()`
- `saveRolePlayConfig()`
- `loadRolePlayConfig()`
- `applyRolePlayConfig()`

Storage:
- localStorage first.
- If classroom broadcast exists, prepare `broadcastRolePlayConfig()` but fail gracefully.

Definition of Done:
- Instructor can save/load roleplay config.
- Existing cockpit tabs and controls still work.

---

# Phase 7 — Advanced Hebrew Presentation Preset

Create a preset file:
- `core/presets/advancedHebrewPresentationRoleplay.js`

Preset should define:
- default scenario: `PRESENTATION_CLIENT_AUDIENCE_01`
- difficulty: 2
- speech required: true
- min speech seconds: 20
- adaptive mode: true
- audience question categories:
  - BASIC
  - CLIENT
  - CRITICAL
  - PRESSURE

Definition of Done:
- The preset can be loaded by the hook bridge or cockpit.
- It is clearly named for the Hebrew advanced course use case.

---

# Phase 8 — Audience Question Runtime Helper

Create:
- `core/audienceQuestionEngine.js`

Use the logic from:
- `docs/speech-training/KB_AUDIENCE_QUESTIONS.md`

Implement:
- `getAudienceQuestion(category, difficulty)`
- `selectAudienceQuestionCategory(level)`
- `buildAudiencePrompt(category)`

Rules:
- Hebrew output.
- One question at a time.
- Match category to difficulty.

Definition of Done:
- Can generate a BASIC, CLIENT, CRITICAL, and PRESSURE question.

---

# Phase 9 — Presentation Rubric Runtime Helper

Create:
- `core/presentationRubricEngine.js`

Use the logic from:
- `docs/speech-training/KB_PRESENTATION_RUBRIC.md`

Implement:
- `getRubricDimensions()`
- `selectFeedbackDimensions(metrics, stageContext)`
- `generatePresentationFeedback({ transcript, metrics, context })`

Rules:
- Do not generate numeric score unless explicitly requested.
- Use only 2–3 dimensions per feedback.
- Feedback must be short, constructive, and in Hebrew.

Definition of Done:
- Given a transcript + metrics, the engine returns structured Hebrew feedback.

---

# Phase 10 — Minimal Smoke Tests

Create:
- `tests/speechTrainingSmokeTest.js`

Test:
1. speech metrics build with empty input.
2. roleplay scenario loads.
3. hook bridge returns safe output.
4. adaptive engine clamps difficulty.
5. state manager persists turn count.
6. audience question engine returns one Hebrew question.
7. presentation rubric engine returns concise Hebrew feedback.

Definition of Done:
- Tests can be run manually with Node or in a browser-like environment.
- No dependency on paid APIs.

---

# Required final report

When finished, report:
- Files created
- Files modified
- Functions added
- How to manually test
- What remains unimplemented
- Any risks or assumptions

---

# Hard constraints

- Do not delete existing code.
- Do not rename existing public functions.
- Do not introduce breaking imports.
- Do not require paid APIs.
- Prefer isolated modules.
- Use Hebrew labels in UI.
- Use English function names in code.
- Keep all changes reversible.
