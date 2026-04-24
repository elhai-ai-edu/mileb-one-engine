# CHAT RUNTIME PROCESS INTEGRATION SPEC

## MilEd.One / PAIOS

**Version:** v0.1  
**Status:** Architecture design draft  
**Purpose:** Define how `chat.js` will integrate with the process runtime pipeline once all helper layers are stable.

---

## 1. Principle

`chat.js` must not own pedagogy.

Its role in the process runtime is:

1. **Orchestrate** — call helpers in the right order.
2. **Persist** — save and restore state from Firebase.
3. **Inject** — pass runtime instruction layer to the model.
4. **Respond** — return the model response to the student.

All pedagogical decisions are delegated to dedicated helper modules.

---

## 2. Future `chat.js` Flow

```
onUserMessage
→ resolveProcessContext
→ loadOrCreateProcessState
→ updateStateFromMessage
→ validateStageResponse
→ runProjectForward
→ buildRuntimeInstructionLayer
→ call model
→ persist updated state
→ return response
```

---

## 3. Step-by-Step Description

### Step 1: `resolveProcessContext`

Determine if this session is a process-driven session (project or pipeline).

```js
const processContext = resolveProcessContext({ courseId, botConfig, sessionData });
// { isProcessSession: boolean, pipeline_id, project_type, bridgeConfig }
```

If `isProcessSession === false`, skip all process steps and proceed normally.

---

### Step 2: `loadOrCreateProcessState`

Load existing state from Firebase or create a new initial state.

```js
const state = await loadOrCreateProcessState({ studentId, courseId, processContext });
// Uses createInitialProcessState() if no state exists.
// Firebase path: sessions/{studentId}/{courseId}/process_state
```

---

### Step 3: `updateStateFromMessage`

Update the state with the student's latest message.

```js
updateStateFromMessage(state, { message, attachments });
// Updates state.history, marks relevant outputs as draft if detected.
```

---

### Step 4: `validateStageResponse`

Run smart validation on the student's answer.

```js
const validation = validateStageResponse({
  answer: message,
  stage: currentNode,
  expectedOutputs: currentNode.required_outputs
});
state.validation.last_result = validation;
state.validation.last_feedback_type = selectFeedbackType(validation);
state.validation.needs_refinement = (validation.completeness !== 'sufficient');
```

Source: `functions/process_validation.js`

---

### Step 5: `runProjectForward`

Evaluate the action for this turn: missing / needs_refinement / advance / bridge_warning / blocked / complete.

```js
const action = runProjectForward(state, {
  nodes: flow.nodes,
  lastAnswer: message,
  bridgeConfig: processContext.bridgeConfig
});
```

Source: `functions/project_runtime_driver.js`

---

### Step 6: `buildRuntimeInstructionLayer`

Translate state + action into model-facing directives.

```js
const instructionLayer = buildRuntimeInstructionLayer({ state, action, context: processContext });
// { system_addendum, stage_prompt, allowed_actions, forbidden_actions, response_style, runtime_trace }
```

Source: `functions/runtime_instruction_builder.js`

---

### Step 7: Call Model

Inject the instruction layer into the model call.

```js
const modelResponse = await callModel({
  systemPrompt: baseSystemPrompt + '\n\n' + instructionLayer.system_addendum,
  userMessage: instructionLayer.stage_prompt || message,
  responseStyle: instructionLayer.response_style
});
```

The model must never:
- Write a full answer for the student.
- Invent source information.
- Skip stages.
- Grade without rubric.
- Use evaluative tone without explicit rubric.

---

### Step 8: Persist Updated State

Save the updated process state back to Firebase.

```js
await persistProcessState({ studentId, courseId, state });
// Firebase path: sessions/{studentId}/{courseId}/process_state
```

---

### Step 9: Return Response

Return the model response to the student, including any bridge warnings or stage transition messages.

---

## 4. Module Dependency Map

```
chat.js
├── process_state_manager.js        (state CRUD)
├── project_runtime_driver.js       (action engine)
├── process_validation.js           (smart validation)
├── learning_to_project_bridge.js   (bridge policy)
├── runtime_instruction_builder.js  (model directives)
├── pedagogical_structure_extractor.js  (optional: first-time setup)
└── project_flow_builder.js         (optional: first-time setup)
```

---

## 5. Implementation Guard

**Do not implement heavy `chat.js` mutation until:**

- [x] `process_state_manager.js` exists and is tested.
- [x] `project_runtime_driver.js` uses rich state.
- [x] `process_validation.js` exists and is tested.
- [x] `learning_to_project_bridge.js` exists and is tested.
- [x] `runtime_instruction_builder.js` exists and is tested.
- [ ] Smoke test (`process_runtime_smoke_test.js`) passes end-to-end.
- [ ] Integration reviewed with PAIOS kernel rules.

---

## 6. Firebase State Paths

| Purpose | Path |
|---------|------|
| Process state | `sessions/{studentId}/{courseId}/process_state` |
| Session context | `sessions/{studentId}/{courseId}` |
| Enforcement log | `enforcement_log/{studentId}` |
| Teacher view | `sessions/{studentId}/{courseId}/teacher_view` |

---

## 7. Kernel Rules — Never Bypass

All process runtime operations must respect:

1. **No-Skip** — stages advance only when conditions are met.
2. **Student Agency** — bot asks, never substitutes.
3. **No Full Solution** — bot never writes the student's final answer.
4. **No Invented Sources** — bot never fabricates information.
5. **No Unrubric-ed Grading** — bot uses soft guidance only.
6. **Bridge Policy** — bridge mode (flexible/strict) is respected.
7. **Visibility Policy** — teacher visibility flags are maintained.
