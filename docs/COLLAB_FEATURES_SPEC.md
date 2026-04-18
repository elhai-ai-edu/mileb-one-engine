# Collaborative Features Specification
## MilEd.One — v1.0 · 2026-04-16 · Status: Design

> **מטרה:** מסמך זה מגדיר את סכמת Firebase, חוזי ה-API, ומודל נתוני הלקוח  
> עבור שלוש תכונות שיתופיות חדשות שמגיעות מה-demo:  
> **Peer Review**, **Group Mode**, ו-**Async Team Project**.  
> כל עדכון עתידי חייב להיות עקבי עם מסמך זה.

---

## תוכן עניינים

1. [עקרונות מחייבים](#1-עקרונות-מחייבים)
2. [Feature Flags — Firebase Path](#2-feature-flags--firebase-path)
3. [Peer Review — Data Contract](#3-peer-review--data-contract)
4. [Group Mode — Data Contract](#4-group-mode--data-contract)
5. [Async Team Project — Data Contract](#5-async-team-project--data-contract)
6. [Veto Mechanism — Data Contract](#6-veto-mechanism--data-contract)
7. [Baton Pass — Data Contract](#7-baton-pass--data-contract)
8. [Bot Context Label Binding](#8-bot-context-label-binding)
9. [Security Rules Summary](#9-security-rules-summary)
10. [API Endpoints](#10-api-endpoints)

---

## 1. עקרונות מחייבים

| # | עיקרון | נובע מ- |
|---|--------|---------|
| E-1 | Feature flags שייכים ל-`classes/{classId}` בלבד — לא ל-`config.json` | config.json הוא SPI-level; flags הם class-level |
| E-2 | אין מצב runtime בזיכרון server | One Engine Principle — serverless stateless |
| E-3 | כל contribution מזוהה ב-`authorId` — לא אנונימי | אחריות פדגוגית — attribution, לא ציון |
| E-4 | Peer review אינו מחשב ציון — הוא מחזיר insight | יש הבדל בין assessment ל-grading |
| E-5 | Contribution trace — named blocks, לא metric graph | contribution graph גמיש לניצול; attributed blocks אינם |
| E-6 | Veto חייב להיות unanimous לפני final submit | Positive Interdependence — כולם אחראים |
| E-7 | Baton pass נשמר ל-Firebase לפני exit | Async group — אי-אפשר לסמוך על sessionStorage |

---

## 2. Feature Flags — Firebase Path

### Path: `classes/{classId}/features`

```json
{
  "peerReview": {
    "enabled": true,
    "rubricId": "text_analysis_v1"
  },
  "groupMode": {
    "enabled": false,
    "groupId": "group_a",
    "roles": {
      "s_abc": "מנסח",
      "s_def": "מאתגר",
      "s_ghi": "מגיב",
      "s_jkl": "מגיב"
    }
  },
  "teamProject": {
    "enabled": false,
    "projectId": "proj_he_a2_q1",
    "allowEntry": true
  }
}
```

**כלל:** `lesson_view.html` קורא את `classes/{classId}/features` ב-mount. אם `peerReview.enabled === false` — לא מציג פאנל peer review גם אם הפעילות הוגשה.

---

## 3. Peer Review — Data Contract

### 3.1 Rubric Definition — `rubrics/{rubricId}`

```json
{
  "rubricId": "text_analysis_v1",
  "title": "הערכת ניתוח טקסט",
  "questions": [
    {
      "id": "q1",
      "text": "עד כמה הטענה המרכזית זוהתה?",
      "scale": ["כלל לא", "במידה מועטה", "ברובה", "בהחלט"]
    },
    {
      "id": "q2",
      "text": "עד כמה הניתוח מובנה לוגית?",
      "scale": ["כלל לא", "במידה מועטה", "ברובה", "בהחלט"]
    },
    {
      "id": "q3",
      "text": "עד כמה הדוגמאות תומכות בטענה?",
      "scale": ["כלל לא", "במידה מועטה", "ברובה", "בהחלט"]
    }
  ],
  "emojiBank": [
    "💡","🔥","🌟","👏","🎯","💬","🤔","📚","✍️","🧠",
    "💪","🎉","🙌","👍","✅","❓","🔍","📝","⚡","🌱"
  ]
}
```

**הערה:** `scale` הוא תמיד מערך של 4 תוויות מילוליות. הרמה הנבחרת נשמרת כ-`level` (1–4). אין ציון מספרי — insight בלבד.

### 3.2 Peer Review Submission — `peer_reviews/{classId}/{activityId}/{reviewerId}`

```json
{
  "reviewerId": "s_abc",
  "reviewedId": "s_def",
  "activityId": "activity_open_paragraph_1",
  "rubricId": "text_analysis_v1",
  "scores": {
    "q1": 3,
    "q2": 4,
    "q3": 2
  },
  "emoji": ["💡", "🔥"],
  "comment": "ניתוח מעניין, אבל חסרה דוגמה קונקרטית",
  "submittedAt": 1713360000000
}
```

**כלל:** `reviewerId !== reviewedId` — validation חובה בצד server. אין self-review.

### 3.3 UI Trigger Flow

```
סטודנט מגיש submission
  └── server שומר ל-submissions/{classId}/{activityId}/{studentId}
  └── server שולח אירוע peer_review_ready ל-Firebase Realtime
  └── lesson_view.html מאזין → מציג #peerReviewPanel (inline, מתחת להגשה)
  └── סטודנט ממלא rubric + emoji (אופציונלי: comment)
  └── לחיצת "שלח הערכה" → POST /api/peer-review
  └── server שומר ל-peer_reviews/{classId}/{activityId}/{reviewerId}
  └── client מציג confirmation + מסתיר פאנל
```

---

## 4. Group Mode — Data Contract

### 4.1 Group Definition — `classes/{classId}/features/groupMode/roles`

מוגדר ב-feature flag (ר' סעיף 2). כל member מזוהה ב-`studentId`, עם role:
- `"מנסח"` — זכות עריכת הטיוטה הסופית
- `"מאתגר"` — מגיש challenge לתוכן
- `"מגיב"` — תורם תוכן, מאשר veto

### 4.2 Group Contributions — `group_contributions/{classId}/{groupId}/{activityId}`

```json
{
  "contributions": [
    {
      "id": "contrib_001",
      "authorId": "s_abc",
      "authorName": "ירין",
      "text": "הטענה המרכזית היא שהשפה מעצבת מחשבה, לא רק מבטאת אותה",
      "addedAt": 1713360100000,
      "type": "content"
    },
    {
      "id": "contrib_002",
      "authorId": "s_def",
      "authorName": "נור",
      "text": "צריך לציין גם את גישת סאפיר-וורף",
      "addedAt": 1713360250000,
      "type": "challenge"
    }
  ],
  "masterDraft": {
    "text": "...",
    "lastEditedBy": "s_abc",
    "lastEditedAt": 1713360800000
  },
  "updatedAt": 1713360800000
}
```

**כלל:** רק `מנסח` יכול לכתוב ל-`masterDraft.text`. כל שאר החברים כותבים ל-`contributions[]`. הרשאות נאכפות ב-Firebase Security Rules.

### 4.3 Group Timer — `group_contributions/{classId}/{groupId}/{activityId}/timer`

```json
{
  "startedAt": 1713360000000,
  "durationSeconds": 900,
  "status": "running"
}
```

`status` ∈ `["running", "paused", "expired"]`. המרצה יכול לעדכן דרך cockpit.

---

## 5. Async Team Project — Data Contract

### 5.1 Project State — `team_projects/{projectId}`

```json
{
  "projectId": "proj_he_a2_q1",
  "title": "ניתוח שיח תקשורתי — פרויקט קבוצה א׳",
  "courseId": "he_a2_arabic",
  "members": ["s_abc", "s_def", "s_ghi", "s_jkl"],
  "roles": {
    "s_abc": "מנסח",
    "s_def": "מאתגר",
    "s_ghi": "מגיב",
    "s_jkl": "מגיב"
  },
  "status": "in_progress",
  "currentHolder": "s_abc",
  "lastActivity": 1713360000000,
  "createdAt": 1713100000000
}
```

### 5.2 Project Document — `team_projects/{projectId}/document`

```json
{
  "blocks": [
    {
      "id": "block_001",
      "authorId": "s_abc",
      "authorName": "ירין",
      "text": "הפרויקט עוסק בניתוח שיח...",
      "addedAt": 1713360100000,
      "editedAt": null
    },
    {
      "id": "block_002",
      "authorId": "s_def",
      "authorName": "נור",
      "text": "בהתאם לגישת ון דייק (2001)...",
      "addedAt": 1713362000000,
      "editedAt": null
    }
  ],
  "version": 4,
  "lastUpdatedBy": "s_def",
  "lastUpdatedAt": 1713362000000
}
```

**כלל:** Document הוא רשימת attributed blocks — לא doc אחד שמשתנה. כל עריכה מוסיפה block חדש. מחיקה מסומנת ב-`deleted: true`, לא מוסרת פיזית — audit trail.

### 5.3 Member Activity — `team_projects/{projectId}/presence/{studentId}`

```json
{
  "lastSeen": 1713362000000,
  "lastAction": "added_block",
  "online": false
}
```

משמש ל-"נראה לאחרונה לפני X שעות" בסיידבר.

### 5.4 AI Digest — `team_projects/{projectId}/digest/{studentId}`

```json
{
  "generatedAt": 1713362100000,
  "sinceLastVisit": 1713300000000,
  "summary": "מאז ביקורך האחרון: נור הוסיפה 2 בלוקים, אמיר אישר את הטיוטה...",
  "newBlocks": ["block_002", "block_003"],
  "pendingBaton": false
}
```

**כלל:** Digest נוצר ב-entry לפרויקט (lazy generation). אם `generatedAt` ישן מ-30 דקות — regenerate. אם אין שינויים מאז ביקור אחרון — מציג "לא היו שינויים מאז ביקורך האחרון".

---

## 6. Veto Mechanism — Data Contract

### Path: `team_projects/{projectId}/veto/{activityId}`

```json
{
  "initiatedBy": "s_abc",
  "initiatedAt": 1713363000000,
  "draftSnapshot": "...",
  "approvals": {
    "s_abc": { "approved": true,  "approvedAt": 1713363010000 },
    "s_def": { "approved": true,  "approvedAt": 1713363060000 },
    "s_ghi": { "approved": false, "approvedAt": null },
    "s_jkl": { "approved": true,  "approvedAt": 1713363120000 }
  },
  "status": "pending",
  "finalSubmittedAt": null
}
```

`status` ∈ `["pending", "approved", "vetoed", "submitted"]`

**Unanimous rule:** `status` עובר ל-`"approved"` רק כאשר כל `approvals[*].approved === true`.  
**Veto:** כל member יכול לסמן `approved: false` ולהוסיף הסבר ב-`vetoReason` (optional).  
**Submit:** רק לאחר `status === "approved"` — כפתור "הגש" enabled.

---

## 7. Baton Pass — Data Contract

### Path: `team_projects/{projectId}/baton`

```json
{
  "currentHolder": "s_abc",
  "handoffNote": "הוספתי את הפרק על תיאוריית סאפיר. צריך לבדוק את ההפניות.",
  "handoffAt": 1713363500000,
  "handoffTo": null,
  "status": "holding"
}
```

`status` ∈ `["holding", "passed", "open"]`

- `"holding"` — יש בעל הבטון, לא ניתן לעריכה ע"י אחרים
- `"passed"` — הועבר, ממתין לאישור הנמען
- `"open"` — אין בעל בטון (בתחילת פרויקט, או לאחר submit)

**כלל:** Exit מה-team project screen דורש:
1. כתיבת `handoffNote` (שדה חובה)
2. עדכון `baton.status = "passed"`
3. רק אז מאפשר חזרה ל-waiting room

**כלל נוסף:** `lesson_view.html` מציג indication ב-waiting room אם `baton.currentHolder === currentStudentId` — "הבטון אצלך".

---

## 8. Bot Context Label Binding

### הבעיה

ב-demo, `bubbleText`, `botLabel`, ו-`floatCtx` מוגדרים hardcoded ב-`MiledState`. ב-production, הם חייבים להגיע מה-SPI config.

### הפתרון — שדות ב-`config.json` ברמת הפעילות

```json
{
  "botType": "text_analysis_tutor",
  "activityContexts": {
    "default": {
      "bubbleText": "שאל שאלה חופשית",
      "botLabel": "שאלות חופשיות",
      "floatCtx": "שאלות חופשיות — אין פעילות פעילה"
    },
    "activity_open_paragraph_1": {
      "bubbleText": "צריך עזרה בניתוח?",
      "botLabel": "ניתוח פסקת פתיחה",
      "floatCtx": "ליווי למשימה: ניתוח פסקת פתיחה"
    }
  }
}
```

### Binding בקוד (`lesson_view.html`)

```js
function applyBotContext(activityId) {
  const spiConfig = window.__SPI_CONFIG; // loaded at mount from /config.json
  const ctx = spiConfig?.activityContexts?.[activityId]
            ?? spiConfig?.activityContexts?.default
            ?? { bubbleText: '...', botLabel: '...', floatCtx: '' };
  document.getElementById('bubbleText').textContent   = ctx.bubbleText;
  document.getElementById('botActivityLabel').textContent = ctx.botLabel;
  document.getElementById('botFloatCtx').textContent  = ctx.floatCtx;
}
```

**כלל:** `MiledState` ב-production אינו מחזיק label strings — הוא קורא ל-`applyBotContext(activityId)` ב-`onEnter`.

---

## 9. Security Rules Summary

```
// Peer Reviews
match /peer_reviews/{classId}/{activityId}/{reviewerId} {
  allow write: if request.auth.uid == reviewerId
                && request.auth.uid != resource.data.reviewedId;
  allow read:  if isInstructor(classId) || request.auth.uid == resource.data.reviewedId;
}

// Group Contributions — master draft gated by role
match /group_contributions/{classId}/{groupId}/{activityId} {
  allow write: if isMember(groupId) && (
    // anyone can add to contributions[]
    request.resource.data.diff(resource.data).affectedKeys().hasOnly(['contributions', 'updatedAt'])
    ||
    // only מנסח can edit masterDraft
    (getRole(groupId) == 'מנסח' &&
     request.resource.data.diff(resource.data).affectedKeys().hasAny(['masterDraft']))
  );
}

// Team Projects — baton check before write
match /team_projects/{projectId}/document {
  allow write: if isMember(projectId)
                && get(/team_projects/$(projectId)/baton).data.currentHolder == request.auth.uid;
}
```

---

## 10. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/peer-review` | POST | שמירת peer review submission |
| `/api/group/contribute` | POST | הוספת contribution לקבוצה |
| `/api/group/veto-approve` | POST | אישור veto ע"י member |
| `/api/group/submit` | POST | הגשה סופית של קבוצה (post-veto) |
| `/api/team-project/entry` | POST | כניסה לפרויקט — מחזיר digest, עדכן presence |
| `/api/team-project/add-block` | POST | הוספת block למסמך |
| `/api/team-project/baton-pass` | POST | העברת בטון עם handoff note |
| `/api/team-project/veto-approve` | POST | אישור veto בפרויקט הצוות |
| `/api/team-project/final-submit` | POST | הגשה סופית של פרויקט הצוות |

---

*מסמך זה נכתב 2026-04-16. כל שינוי ב-Firebase schema או API contract חייב לעדכן גרסה.*
