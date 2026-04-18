# Integration Roadmap — Collaborative Features
## MilEd.One — v1.0 · 2026-04-16 · Status: Design

> **מטרה:** תוכנית הטמעה מפורטת של תכונות ה-demo לתוך מערכת MilEd.One האמיתית.  
> מכסה שלושה שלבים: Infrastructure → Peer Review → Group + Team Project.  
> כל שלב מסתיים בכניסה/יציאה מוגדרת (go/no-go).

---

## תוכן עניינים

1. [סקירת שלושת השלבים](#1-סקירת-שלושת-השלבים)
2. [תנאי כניסה גלובליים](#2-תנאי-כניסה-גלובליים)
3. [שלב 1 — Infrastructure](#3-שלב-1--infrastructure)
4. [שלב 2 — Peer Review](#4-שלב-2--peer-review)
5. [שלב 3 — Group + Team Project](#5-שלב-3--group--team-project)
6. [Migration Path — Demo to Production](#6-migration-path--demo-to-production)
7. [מה לא להגיע אליו עוד](#7-מה-לא-להגיע-אליו-עוד)

---

## 1. סקירת שלושת השלבים

```
Demo (standalone HTML) ──▶ Phase 1: Infrastructure ──▶ Phase 2: Peer Review ──▶ Phase 3: Group + Team Project
                              (Firebase wiring,           (inline panel,             (group mode,
                               feature flags,              rubric engine,             veto mechanism,
                               bot context binding)        submission sync)           async team project)
```

| שלב | מה מתווסף | תנאי כניסה | תנאי יציאה |
|-----|-----------|-----------|-----------|
| 1 | Firebase listeners, feature flags, bot context binding | `lesson_view.html` פועל עם session קיים | Listeners פועלים בלי memory leaks; feature flags נקראים נכון מ-Firebase |
| 2 | Peer Review panel, rubric engine, `/api/peer-review` | שלב 1 יצא בהצלחה | Peer review נשמר ב-Firebase; instructor רואה ב-cockpit; panel מופיע inline |
| 3 | Group mode, veto, async team project | שלב 2 יצא בהצלחה; CRDT מוחלט בפתרון attributed blocks | Group contributions נשמרות; veto unanimous עובד; baton pass נשמר; digest נוצר |

---

## 2. תנאי כניסה גלובליים

לפני שמתחילים שלב 1, הסטטוס הבא חייב להיות נכון:

- [x] `lesson_view.html` פועל עם routing מ-`waiting_lobby.html` → `lesson_view.html?classId=X`
- [x] `functions/classroom.js` מטפל ב-`push_task` ו-`session_state_update`
- [x] `LIVE_CLASSROOM_CONTRACT.md` מיושם (`active_task`, `live_phase`, `door_status`)
- [x] Firebase Security Rules בסיסיות מוגדרות (auth required)
- [ ] `COLLAB_FEATURES_SPEC.md` נקרא ומובן על ידי כל המפתחים
- [ ] `REALTIME_EVENT_CONTRACT.md` נקרא ומובן על ידי כל המפתחים

---

## 3. שלב 1 — Infrastructure

### 3.1 מה עושים

#### A. Feature Flag Reader

**קובץ:** `lesson_view.html`  
**תיאור:** בעת mount, קרא `classes/{classId}/features` מ-Firebase.

```js
// lesson_view.html — onMount
async function loadClassFeatures(classId) {
  const snap = await firebase.database().ref(`classes/${classId}/features`).get();
  window.__CLASS_FEATURES = snap.val() ?? {};
}
```

**כלל:** `window.__CLASS_FEATURES` הוא ה-single source of truth לכל feature visibility. לא `config.json`, לא hardcoded booleans.

#### B. Firebase Listener Registration

**קובץ:** `lesson_view.html`  
**תיאור:** רשום listeners לכל events מ-`REALTIME_EVENT_CONTRACT.md`:

```js
function registerClassroomListeners(classId) {
  const db = firebase.database();
  registerListener(db.ref(`sessions/${classId}/state/door_status`), handleDoorStatus);
  registerListener(db.ref(`sessions/${classId}/active_task`),       handleActiveTask);
  registerListener(db.ref(`sessions/${classId}/state/live_phase`),  handleLivePhase);
  registerListener(db.ref(`sessions/${classId}/broadcast`),         handleBroadcast);
  registerListener(db.ref(`sessions/${classId}/recall`),            handleRecall);
  // peer_review_ready — נרשם אחרי submission, ב-Phase 2
}
```

#### C. Bot Context Label Binding

**קובץ:** `lesson_view.html` + `config.json`  
**תיאור:** הוסף `activityContexts` לכל SPI ב-`config.json`. הסר label strings מ-`MiledState`. כל `onEnter` שמתחיל lesson activity קורא ל-`applyBotContext(activityId)`.

**שינויים ב-`config.json`:**  
לכל `botType` עם פעילויות — הוסף `activityContexts` בפורמט שב-`COLLAB_FEATURES_SPEC.md` §8.

#### D. Submission Flow Sync

**קובץ:** `lesson_view.html`, `functions/submit.js`  
**תיאור:** `/api/submit` כבר קיים. יש לוודא שהוא:
1. שומר ל-`submissions/{classId}/{activityId}/{studentId}`
2. כותב `peer_review_ready: false` לאותו path (יוחלף ל-`true` ב-Phase 2)

### 3.2 קריטריי יציאה — שלב 1

- [ ] `window.__CLASS_FEATURES` נטען נכון ב-`lesson_view.html` mount
- [ ] `door_status` listener מגיב: שיעור מסתיים → banner מופיע → redirect עובד
- [ ] `active_task` listener מגיב: `MiledState.go('lesson_activity')` נקרא אוטומטית
- [ ] `applyBotContext` עובד עם `activityId` אמיתי מ-`config.json`
- [ ] `teardownAllListeners` נקרא ב-`beforeunload` ללא errors
- [ ] אין console errors ב-Chrome DevTools Network tab אחרי 5 דקות idle

---

## 4. שלב 2 — Peer Review

### 4.1 מה עושים

#### A. Rubric Engine

**קובץ חדש:** `functions/rubrics.js`  
**תיאור:** CRUD פשוט ל-`rubrics/{rubricId}` ב-Firebase.

```
GET  /api/rubric/:rubricId       → קרא rubric definition
POST /api/rubric                 → צור rubric (admin only)
```

**ב-`lesson_view.html`:** בעת load של class features, אם `peerReview.enabled`, טען גם `rubrics/{rubricId}` ושמור ב-`window.__RUBRIC`.

#### B. Peer Review Panel — Production Wiring

**קובץ:** `lesson_view.html`  
**תיאור:** ה-panel כבר קיים ב-demo. הוצאות:
1. rubric questions — מגיעות מ-`window.__RUBRIC`, לא hardcoded
2. trigger — מגיע מ-`peer_review_ready` Firebase listener, לא מ-`sendSubmit` timeout
3. submit — `POST /api/peer-review` במקום `console.log`

**שינוי ב-`sendSubmit`:**
```js
// הסר את setTimeout שמציג פאנל
// הפאנל מופיע רק כאשר Firebase מחזיר peer_review_ready = true
```

**הוסף ב-`registerClassroomListeners`:**
```js
// נרשם לאחר submission
function registerPeerReviewListener(classId, activityId, studentId) {
  const path = `submissions/${classId}/${activityId}/${studentId}/peer_review_ready`;
  registerListener(db.ref(path), handlePeerReviewReady);
}
```

#### C. `/api/peer-review` Endpoint

**קובץ חדש:** `functions/peer_review.js`  

```js
// POST /api/peer-review
// body: { classId, activityId, reviewerId, reviewedId, rubricId, scores, emoji, comment }
// 1. validate reviewer ≠ reviewed
// 2. validate scores keys match rubric questions
// 3. write to peer_reviews/{classId}/{activityId}/{reviewerId}
// 4. write peer_review_ready = false back to submissions path
// 5. return { ok: true }
```

#### D. Cockpit — Peer Review Summary

**קובץ:** `lecturer_hub.html` (לאחר שייבנה) או `micro_cockpit`  
**תיאור:** תצוגה aggregate של peer review scores לכל פעילות. לא ב-MVP — placeholder בלבד.

### 4.2 קריטריי יציאה — שלב 2

- [ ] הגשת submission → `peer_review_ready` מתעדכן ב-Firebase → panel מופיע ב-UI
- [ ] מילוי rubric + לחיצת "שלח" → `/api/peer-review` מחזיר 200 → panel מסתתר
- [ ] Data ב-`peer_reviews/{classId}/{activityId}/{reviewerId}` תואמת rubric schema
- [ ] Self-review נחסם בצד server (400 error)
- [ ] rubric questions מגיעות מ-`window.__RUBRIC`, לא hardcoded
- [ ] emoji bank — 20 פריטים בדיוק, מגיע מ-rubric definition

---

## 5. שלב 3 — Group + Team Project

### 5.1 Group Mode

#### A. Group Composition Loading

**קובץ:** `lesson_view.html`  
**תיאור:** אם `features.groupMode.enabled`, בעת mount:
1. קרא `roles` מ-`classes/{classId}/features/groupMode`
2. קבע `currentRole = roles[currentStudentId]`
3. שמור ב-`window.__GROUP_ROLE`

#### B. Group Workspace Wiring

**קובץ:** `lesson_view.html`  
**תיאור:** group workspace כבר קיים ב-demo. הוצאות:
1. כל `addMyContrib()` → `POST /api/group/contribute` ואז Firebase listener מעדכן UI
2. master draft — edit button disabled אם `window.__GROUP_ROLE !== 'מנסח'`
3. timer — מגיע מ-`group_contributions/{classId}/{groupId}/{activityId}/timer` ב-Firebase
4. `submitGroupWork` → `showVetoPanel` → `POST /api/group/veto-approve`

#### C. Group API Endpoints

**קובץ חדש:** `functions/group.js`

```
POST /api/group/contribute         → הוסף contribution
POST /api/group/veto-approve       → אשר/דחה veto
POST /api/group/submit             → הגשה סופית (post unanimous veto)
```

#### D. Veto Real-Time Sync

Firebase `onValue` ל-`team_projects/{projectId}/veto/{activityId}` →  
`handleVetoUpdate` מעדכן chips אוטומטית כשחבר אחר מאשר.

### 5.2 Async Team Project

#### A. Team Project Entry Flow

```
waiting_lobby.html → לחיצת "פרויקט צוות" → POST /api/team-project/entry
  → server: עדכן presence, חשב digest
  → return: { digest, document, baton }
  → client: showDigestModal() → renderProjectBlocks() → registerBatonListener()
```

#### B. Team Project API Endpoints

**קובץ חדש:** `functions/team_project.js`

```
POST /api/team-project/entry         → entry + digest generation
POST /api/team-project/add-block     → הוסף block למסמך
POST /api/team-project/baton-pass    → העבר בטון + handoff note
POST /api/team-project/veto-approve  → אישור veto פרויקט
POST /api/team-project/final-submit  → הגשה סופית
```

#### C. AI Digest Generation

**קובץ:** `functions/team_project.js`  
**תיאור:** ב-`/api/team-project/entry`:
1. קרא `team_projects/{projectId}/presence/{studentId}.lastSeen`
2. קרא `team_projects/{projectId}/document.blocks` שנוספו מאז `lastSeen`
3. בנה prompt → `/api/chat` (botType: `team_project_digest`, classId: projectId)
4. שמור digest ב-`team_projects/{projectId}/digest/{studentId}`
5. עדכן `presence.lastSeen = Date.now()`

**כלל:** אם אין שינויים מאז lastSeen — לא קוראים LLM. מחזירים static "לא היו שינויים".

#### D. Baton Pass Flow

```
exit button → modal עם textarea חובה → submitBaton()
  → POST /api/team-project/baton-pass { handoffNote, fromStudentId }
  → server: updates baton.currentHolder (לפי roster round-robin, או manual)
  → Firebase listener של הנמען: handleBatonUpdate() → notification
  → client: MiledState.go('waiting')
```

### 5.3 קריטריי יציאה — שלב 3

- [ ] Group contribution נשמר ב-Firebase → מופיע ב-UI של כל חברי הקבוצה ב-real-time
- [ ] Master draft עריכה חסומה לחברים שאינם מנסח
- [ ] Veto panel מעודכן real-time כאשר חבר אחר מאשר
- [ ] Veto unanimous → כפתור "הגש" מופעל
- [ ] Team project entry מציג AI Digest שנוצר בצד server
- [ ] Block חדש מסומן עם שם המחבר ו-timestamp
- [ ] Baton pass → handoff note נשמר ב-Firebase → נמען מקבל notification
- [ ] Exit מ-team project ללא handoff note → blocked (UX + API validation)
- [ ] `presence.lastSeen` מתעדכן בכניסה ויציאה

---

## 6. Migration Path — Demo to Production

### ה-Demo הוא Reference Implementation, לא קוד לעתק

קוד ה-demo ב-`demo_student_view.html` הוא **proof-of-concept** — standalone, ללא backend. אסור להעתיק אותו ישירות ל-`lesson_view.html`.

**מה לקחת מה-Demo:**
- CSS לכל הרכיבים החדשים (peer review panel, group workspace, veto chips, team project layout, baton modal)
- UX flow ו-interaction patterns
- MiledState architecture (state machine, `go()` method)
- HTML structure של panels

**מה לשכתב:**
- כל `setTimeout` שמדמה backend → replace עם Firebase listeners
- כל `data-xxx` hardcoded → replace עם data מ-Firebase / config
- כל simulated group members → replace עם real member data
- Digest text → replace עם LLM-generated digest מ-server

### CSS Migration

1. העתק CSS שייכות לתכונות חדשות מ-`demo_student_view.html` לקובץ `style.css`
2. הוסף כ-section מסומן: `/* === Collaborative Features v1.0 === */`
3. בדוק תאימות עם CSS קיים — אין namespace collisions

### HTML Migration

1. הוסף panels חדשים ל-`lesson_view.html` בתוך sections הנכונים
2. panels נסתרים ב-default (`display: none`), מופיעים ע"פ feature flags + events
3. team project screen — מוסיפים כ-`<div id="teamProjectScreen">` נפרד

### JS Migration

1. `MiledState` — הוסף states חדשים (`group`, `team_project`) עם production `onEnter` handlers
2. הסר label strings מ-`MiledState` — כולם מגיעים מ-`applyBotContext()`
3. Listener Registry — הוסף ל-mount flow

---

## 7. מה לא להגיע אליו עוד

| פריט | סיבה |
|------|------|
| CRDT (Yjs) | ארכיטקטורת serverless לא תומכת ב-CRDT server; attributed blocks מחליפים את הצורך |
| Contribution graph / metrics | גמיש לניצול ו-gaming; attributed blocks מספיקים לאחריות פדגוגית |
| Real-time cursor sync | מורכבות גבוהה יחסית לערך; בטון pass ממיר את הצורך |
| Peer review score → grade | Peer review הוא insight tool, לא grading tool; אין חיבור ל-LMS grade |
| WebSocket server | Firebase Realtime DB מספיק; אין צורך להוסיף תשתית |
| Peer review anonymity toggle | מסבך logic; attribution הוא כלי פדגוגי, לא limitation |

---

*מסמך זה נכתב 2026-04-16. Go/No-Go per phase נקבע במפגש סקירה עם lead developer ו-product owner.*
