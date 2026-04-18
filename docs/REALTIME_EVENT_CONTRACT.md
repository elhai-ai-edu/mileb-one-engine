# Real-Time Event Contract
## MilEd.One — v1.0 · 2026-04-16 · Status: Design

> **מטרה:** מסמך זה מגדיר את חוזה האירועים הריאלטיים בין שרת המרצה לדפדפן הסטודנט.  
> הוא משלים את `LIVE_CLASSROOM_CONTRACT.md` ומרחיב אותו לכסות גם תכונות שיתופיות.  
> כל שינוי ב-event schema חייב לעדכן מסמך זה ואת `functions/classroom.js`.

---

## תוכן עניינים

1. [ארכיטקטורת Real-Time](#1-ארכיטקטורת-real-time)
2. [Event Taxonomy](#2-event-taxonomy)
3. [Firebase Listener Map](#3-firebase-listener-map)
4. [Event Schemas](#4-event-schemas)
   - [door_status](#41-door_status)
   - [active_task](#42-active_task)
   - [live_phase](#43-live_phase)
   - [broadcast](#44-broadcast)
   - [recall](#45-recall)
   - [peer_review_ready](#46-peer_review_ready)
   - [group_contribution_added](#47-group_contribution_added)
   - [veto_update](#48-veto_update)
   - [baton_passed](#49-baton_passed)
   - [team_project_updated](#410-team_project_updated)
5. [Client Listener Registration](#5-client-listener-registration)
6. [Serverless Constraint — הגבלה חשובה](#6-serverless-constraint)
7. [Graceful Degradation](#7-graceful-degradation)

---

## 1. ארכיטקטורת Real-Time

MilEd.One רץ על Netlify Functions — serverless stateless. אין WebSocket server.  
**הפתרון:** כל real-time events עוברים דרך **Firebase Realtime Database**.

```
מרצה בוחר פעולה ב-cockpit
    └──▶ POST /api/classroom/* (Netlify Function)
              └──▶ Firebase Admin SDK writes event to DB
                        └──▶ Firebase client SDK on student browser
                                  fires onValue listener
                                        └──▶ lesson_view.html updates UI
```

**אין polling.** כל listener הוא Firebase `onValue` — push-based.  
**אין SSE / WebSocket.** הקשר הוא Firebase client ↔ Firebase DB ישירות.

---

## 2. Event Taxonomy

| קטגוריה | Events | מי כותב | מי קורא |
|----------|--------|---------|---------|
| **Session Control** | `door_status`, `recall` | מרצה → classroom.js | lesson_view.html |
| **Learning Flow** | `active_task`, `live_phase`, `broadcast` | מרצה → classroom.js | lesson_view.html |
| **Peer Review** | `peer_review_ready` | chat.js post-submission | lesson_view.html |
| **Group Sync** | `group_contribution_added`, `veto_update` | students → group API | lesson_view.html (group members) |
| **Async Project** | `baton_passed`, `team_project_updated` | students → team-project API | team_project_screen (members) |

---

## 3. Firebase Listener Map

| Listener Path | Event | Handler Function |
|---------------|-------|-----------------|
| `sessions/{classId}/state/door_status` | door_status | `handleDoorStatus(val)` |
| `sessions/{classId}/active_task` | active_task | `handleActiveTask(val)` |
| `sessions/{classId}/state/live_phase` | live_phase | `handleLivePhase(val)` |
| `sessions/{classId}/broadcast` | broadcast | `handleBroadcast(val)` |
| `sessions/{classId}/recall` | recall | `handleRecall(val)` |
| `submissions/{classId}/{activityId}/{studentId}/peer_review_ready` | peer_review_ready | `handlePeerReviewReady(val)` |
| `group_contributions/{classId}/{groupId}/{activityId}` | group_contribution_added | `handleGroupUpdate(val)` |
| `team_projects/{projectId}/veto/{activityId}` | veto_update | `handleVetoUpdate(val)` |
| `team_projects/{projectId}/baton` | baton_passed | `handleBatonUpdate(val)` |
| `team_projects/{projectId}/document` | team_project_updated | `handleProjectDocUpdate(val)` |

**כלל:** `lesson_view.html` מנהל Listener Registry — רשימת listeners פעילים שמנותקים ב-`beforeunload` ו-`disconnect`.

---

## 4. Event Schemas

### 4.1 `door_status`

**Path:** `sessions/{classId}/state/door_status`  
**Type:** `"open" | "locked" | "ended"`

| ערך | משמעות | תגובת UI |
|-----|---------|----------|
| `"open"` | שיעור פתוח | הכניסה מותרת |
| `"locked"` | נעול זמנית | הסטודנט נשאר אך כניסה חדשה חסומה |
| `"ended"` | שיעור הסתיים | מציג "השיעור הסתיים" + redirect לאחר 30 שניות |

```js
function handleDoorStatus(status) {
  if (status === 'ended') {
    showSessionEndBanner();
    setTimeout(() => window.location.href = '/students.html', 30000);
  }
}
```

---

### 4.2 `active_task`

**Path:** `sessions/{classId}/active_task`  
**Type:** object | null

```json
{
  "title": "ניתוח טקסט פתיחה",
  "instructions": "קראו את הקטע ועיינו בשאלות ההנחיה",
  "activityId": "activity_open_paragraph_1",
  "step": 1,
  "suggestedPhase": "solo",
  "pushedAt": 1713356400000
}
```

**Handler:**
```js
function handleActiveTask(task) {
  if (!task) {
    MiledState.go('lesson_empty');
    return;
  }
  MiledState.go('lesson_activity');
  applyBotContext(task.activityId);
  renderActivityCard(task);
}
```

**כלל:** כאשר `active_task` מתעדכן, `MiledState` עובר ל-`lesson_activity`. כאשר מתנקה (`null`) — עובר ל-`lesson_empty`. המעבר הוא אוטומטי — הסטודנט לא שולט בזה.

---

### 4.3 `live_phase`

**Path:** `sessions/{classId}/state/live_phase`  
**Type:** `"listening" | "interactive" | "solo" | "pairs" | "plenary" | null`

ר' `LIVE_CLASSROOM_CONTRACT.md` לפירוט מלא. עדכון live_phase מציג/מסתיר badge בסרגל המפגש.

---

### 4.4 `broadcast`

**Path:** `sessions/{classId}/broadcast`

```json
{
  "text": "כולם עוצרים — נדון בתשובה של נור",
  "type": "attention",
  "sentAt": 1713357000000
}
```

`type` ∈ `["attention", "info", "reminder"]`

**Handler:**
```js
function handleBroadcast(msg) {
  if (!msg || !msg.text) return;
  showBroadcastBanner(msg.text, msg.type);
  // banner נעלם אוטומטית לאחר 8 שניות
  setTimeout(hideBroadcastBanner, 8000);
}
```

**כלל:** `broadcast` הוא ephemeral — לא נשמר בהיסטוריה. המרצה כותב ערך חדש; clients מגיבים ל-`onValue`.

---

### 4.5 `recall`

**Path:** `sessions/{classId}/recall`

```json
{
  "targetStudentId": "s_abc",
  "message": "אנא עצרי ועברי לשקף המשותף",
  "sentAt": 1713357500000
}
```

אם `targetStudentId === currentStudentId` — מציג modal אישי. אם `targetStudentId === "all"` — מציג לכולם.

---

### 4.6 `peer_review_ready`

**Path:** `submissions/{classId}/{activityId}/{studentId}/peer_review_ready`  
**Type:** `boolean`

```js
function handlePeerReviewReady(isReady) {
  if (isReady && MiledState.current === 'lesson_activity') {
    document.getElementById('peerReviewPanel').style.display = 'block';
    document.getElementById('peerReviewPanel')
      .scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
```

**כלל:** `peer_review_ready` נכתב ל-`true` על ידי `/api/submit` לאחר שמירת ה-submission. הוא גורם לחשיפת פאנל הpeer review אוטומטית. אחרי שהסטודנט שולח peer review — field מתאפס ל-`false`.

---

### 4.7 `group_contribution_added`

**Path:** `group_contributions/{classId}/{groupId}/{activityId}`  
**Type:** full document snapshot (Firebase `onValue`)

```js
function handleGroupUpdate(snapshot) {
  const data = snapshot.val();
  if (!data) return;
  renderGroupContributions(data.contributions);
  if (data.masterDraft) renderMasterDraft(data.masterDraft);
}
```

**כלל:** Firebase `onValue` מחזיר snapshot מלא — לא diff. ה-renderer מנקה ומצייר מחדש. זה בסדר כי contribution list אינו ארוך (עשרות מקסימום).

---

### 4.8 `veto_update`

**Path:** `team_projects/{projectId}/veto/{activityId}`  
**Type:** full document snapshot

```js
function handleVetoUpdate(snapshot) {
  const veto = snapshot.val();
  if (!veto) return;
  renderVetoChips(veto.approvals);
  if (veto.status === 'approved') {
    document.getElementById('vetoFinalBtn').disabled = false;
    document.getElementById('vetoFinalBtn').classList.add('ready');
    document.getElementById('vetoFinalBtn').textContent = '🎉 כולם אישרו — הגש/י עכשיו';
  }
}
```

---

### 4.9 `baton_passed`

**Path:** `team_projects/{projectId}/baton`

```json
{
  "currentHolder": "s_def",
  "handoffNote": "הוספתי את הפרק על תיאוריית סאפיר. צריך לבדוק את ההפניות.",
  "handoffAt": 1713363500000,
  "status": "holding"
}
```

**Handler (in team_project_screen):**
```js
function handleBatonUpdate(baton) {
  const isMine = baton.currentHolder === currentStudentId;
  document.getElementById('batonHolder').textContent =
    isMine ? 'הבטון אצלך — עכשיו תורך לערוך' : `הבטון אצל ${baton.currentHolder}`;
  document.getElementById('addBlockBtn').disabled = !isMine;
  if (baton.handoffNote) {
    document.getElementById('handoffNoteDisplay').textContent = baton.handoffNote;
  }
}
```

**כלל:** כאשר הבטון עובר אל `currentStudentId` — מצלצל notification קל + מציג `handoffNote`. כאשר הבטון אצל אחר — כפתורי עריכה מושבתים.

---

### 4.10 `team_project_updated`

**Path:** `team_projects/{projectId}/document`  
**Type:** full document snapshot

```js
function handleProjectDocUpdate(snapshot) {
  const doc = snapshot.val();
  if (!doc) return;
  renderProjectBlocks(doc.blocks.filter(b => !b.deleted));
}
```

---

## 5. Client Listener Registration

```js
// lesson_view.html — מנהל מחזור חיי Listeners
const _listeners = [];

function registerListener(ref, callback) {
  const unsub = ref.on('value', callback);
  _listeners.push({ ref, unsub });
}

function teardownAllListeners() {
  _listeners.forEach(({ ref, unsub }) => ref.off('value', unsub));
  _listeners.length = 0;
}

window.addEventListener('beforeunload', teardownAllListeners);
```

**כלל:** כל listener רשום ב-`_listeners`. `teardownAllListeners` נקרא ב-`beforeunload`. זה מונע memory leaks ב-SPA navigation.

**כלל נוסף:** `team_project_screen` מנהל Listeners שלו בנפרד — נרשמים ב-entry, מנותקים ב-baton pass (exit).

---

## 6. Serverless Constraint

**הגבלה חשובה:**  
Netlify Functions הן stateless HTTP handlers. הן לא יכולות:
- לשמור WebSocket connections
- לדחוף events ל-clients
- להריץ background tasks

**הפתרון המלא:**
- **Writes:** client → Netlify Function → Firebase Admin SDK write → Firebase DB
- **Reads / Listeners:** client → Firebase client SDK → Firebase DB (direct, no function)

משמעות: **clients מאזינים ישירות ל-Firebase**, לא לשרת. Netlify Function היא רק write gateway.

**מה זה אומר לפיתוח:**
- אין צורך ב-SSE endpoint ב-Netlify
- אין צורך ב-WebSocket adapter
- Firebase Realtime Database rules מחליפות auth middleware לחלק מה-reads
- Latency: Firebase Realtime DB latency ~ 50–200ms — מספיק לאירועי classroom

---

## 7. Graceful Degradation

| כשל | התנהגות |
|-----|---------|
| Firebase listener מנותק | מציג indicator "מנותק מהשרת" — UI לא קורס |
| `active_task` לא מגיע | `lesson_empty` נשמר — הסטודנט יכול לשאול שאלות חופשיות |
| `peer_review_ready` לא מגיע | כפתור "הצג הערכת עמיתים" ידני נחשף לאחר 2 שניות מ-submission |
| `baton_passed` לא מגיע | refresh ידני + הצגת מצב נוכחי מ-Firebase על demand |
| `veto_update` לא מגיע | כפתור "רענן מצב אישורים" ידני |

---

*מסמך זה נכתב 2026-04-16. כל שינוי ב-event schema, listener paths, או handler logic חייב לעדכן גרסה.*
