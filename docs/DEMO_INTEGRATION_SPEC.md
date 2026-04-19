# Demo → System Integration Spec

**Version:** 1.0  
**Date:** 2026-04-19  
**Status:** Phase 1 live — Phases 2-3 pending

---

## 1. Integration Target

The canonical student runtime is a three-hop flow — no parallel demo pages:

```
students.html
  └─▶ waiting_lobby.html?courseId=<id>          (session gateway)
        └─▶ lesson_view.html?sessionId=<id>&courseId=<id>&unitId=<id>  (live runtime)
```

---

## 2. Demo Component → System Surface Mapping

| Demo Component | System Surface | API Action | Status |
|---|---|---|---|
| Waiting room hero + door status | `waiting_lobby.html` — `.status-box` / `#doorPill` | `lesson_payload` → `state.door_status` | ✅ Integrated |
| AI Warmup (multiple-choice) | `waiting_lobby.html` — `#warmupAnswers` | `pre_session` → warmup question; `warmup_vote` | ✅ Integrated |
| Warmup free-text fallback | `waiting_lobby.html` — `#warmupFallback` | `warmup_vote` | ✅ Integrated |
| Memory Game | `waiting_lobby.html` — `#memoryBoard` | Local (client-only) — pairs hardcoded | ⚠️ Gap: no API for course-specific pairs |
| Golden Ticket (entrance ticket) | `waiting_lobby.html` — `#ticketBox` | `entrance_ticket_submit` | ✅ Integrated |
| Peer presence count | `waiting_lobby.html` — `#peerCountNote` | `pre_session` → `waitingStudentsCount`; `waiting_count` (poll) | ✅ Added in Phase 1 |
| Door-open animation (welcome) | `lesson_view.html` — `#welcomeTransition` | Firebase `sessions/{id}` → `state.door_status` | ✅ Integrated |
| Live meeting Zoom link | `waiting_lobby.html` — `#liveMeetingCard`; `lesson_view.html` — `#liveMeetingBar` | `pre_session` / `lesson_payload` → `liveMeeting` | ✅ Integrated |
| Broadcast banner | `lesson_view.html` — `#broadcastBanner` | Firebase RT → `broadcast` / `broadcastedAt` | ✅ Integrated |
| Recall alert | `lesson_view.html` — `#recallAlert` | Firebase RT → `recall_all`; `recall_ack` | ✅ Integrated |
| Live-phase mode badge (topbar) | `lesson_view.html` — `#livePhaseChip` | `lesson_payload` → `state.live_phase`; Firebase RT | ✅ Added in Phase 1 |
| Live-phase badge (meeting bar) | `lesson_view.html` — `#liveMeetingBarPhase` | `lesson_payload` → `state.live_phase` | ✅ Integrated |
| Active task indicator | `lesson_view.html` — `#liveMeetingBarActiveTask` | Firebase RT → `active_task` | ✅ Integrated |
| Sprint stepper | `lesson_view.html` — `#sprintStepper` | `lesson_payload` → `sprintDefinitions` / `state.active_sprint` | ✅ Integrated |
| Project stages stepper | `lesson_view.html` — `#projectStepperWrap` | `lesson_payload` → `projectStages` / `currentStep`; `set_step` | ✅ Integrated |
| Bookshelf (resources panel) | `lesson_view.html` — `#resourceList` | `lesson_payload` → `resources` | ✅ Integrated |
| Bot chat iframe | `lesson_view.html` — `#chatFrame` | `/chat.html?classId=&botType=&sessionId=` | ✅ Integrated |
| Student work / message submit | `lesson_view.html` — `#writePanel` | `submit` (type: message \| submission \| audio) | ✅ Integrated |
| WAF (lecturer → student replies) | `lesson_view.html` — `#wafMessages` | Firebase RT → `sessions/{id}/students/{sid}/lecturer_replies` | ✅ Integrated |
| Speaker stage / peer bubbles | `lesson_view.html` — `#speakerStage` | Firebase RT → `speakerFocus` / `students` | ✅ Integrated |
| Group mode (team roles) | `lesson_view.html` — `#teamRoleOverlay`, `#teamRoleChip` | `lesson_payload` → `roleAssignment` | ✅ Integrated |
| Project mode (stage tabs) | `lesson_view.html` — `#projectStepper` | Config → `course_units.*.project.stages` | ✅ Integrated |
| Multi-bot switcher tabs | `lesson_view.html` — `#botTabsBar` | `config.json` → `my_courses.{id}.bots` | ✅ Integrated |

---

## 3. Feature Flag: `waiting_lobby`

Courses that have `"waiting_lobby": true` in `config.json → my_courses` receive the full pre-session flow (warmup + memory game + golden ticket).

Courses **without** this flag run in pass-through mode: `waiting_lobby.html` discovers the active `sessionId` silently and redirects to `lesson_view.html` immediately.

**Pilot courses with `waiting_lobby: true` (Phase 1):**
- `hebrew_advanced_optics`
- `hebrew_advanced_management`

---

## 4. Known API Gaps

| Gap ID | Description | Resolution Path |
|---|---|---|
| G-WL-1 | Memory game card pairs are hardcoded on the client (Sprint / AI / Evidence). Courses cannot customise them. | Add `warmup.memoryPairs` array to `pre_session` response → render dynamically in `waiting_lobby`. |
| G-WL-2 | Peer list (names/avatars) not shown — only the count is displayed. | `waiting_count` already returns `waitingStudents` array; expose avatars in the Identity card. |
| G-LV-1 | Group mode is not linked to Firebase attendee presence; team-role assignment is session-storage only. | Write `teamRole` to `sessions/{id}/students/{sid}` via `classroom` POST on assignment. |
| G-LV-2 | Project mode tabs are rendered from `config.json` template only, not from a faculty-authored stage list per session. | Extend `lesson_open` to accept `projectStages` override. |

---

## 5. Phased Rollout

### Phase 1 — Waiting Lobby (delivered)
- `waiting_lobby: true` enabled for `hebrew_advanced_optics` and `hebrew_advanced_management`
- Peer-presence count (`#peerCountNote`) wired from `pre_session` + periodic `waiting_count` poll
- Live-phase chip (`#livePhaseChip`) added to `lesson_view.html` topbar
- Duplicate `phaseLabels` object consolidated into shared `_LIVE_PHASE_LABELS` constant

**Success criteria:**
- Students see warmup + memory + golden ticket on entry
- Peer count updates every 5 s
- Live phase chip updates in real time without page reload

### Phase 2 — Lesson Runtime (in progress)
- All broadcast / recall / sprint / bot features already operational
- Remaining: link memory-game pairs to `pre_session` API (G-WL-1)
- Remaining: expose peer name/avatar list in waiting lobby (G-WL-2)

### Phase 3 — Project / Group Mode (planned)
- Group team-role persistence to Firebase (G-LV-1)
- Faculty-authored project stage list per session (G-LV-2)

---

## 6. Architecture Guardrails

1. **One engine.** No bot logic in `chat.js`. All configuration stays in `config.json`.
2. **courseId in routing, classId in payloads.** `waiting_lobby.html` and `lesson_view.html` use `courseId` in URL params; classroom API POST bodies use `classId` (aliased).
3. **Persistent state in Firebase only.** No session state in page memory or localStorage beyond UI preferences.
4. **Smoke tests** (`npm run smoke:contracts`) must pass after every Phase.
