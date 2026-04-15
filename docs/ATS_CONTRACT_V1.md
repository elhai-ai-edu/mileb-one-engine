# Activity Translation System (ATS)
## Implementation Contract v1 — MilEd.One

> **גרסה:** v1.0 · **תאריך:** 2026-04-15 · **סטטוס:** Implemented (MVP)

---

## תוכן עניינים

1. [מטרת המערכת](#1-מטרת-המערכת)
2. [עקרון-על: ATS ≠ Bot Architect](#2-עקרון-על)
3. [גבולות המערכת](#3-גבולות-המערכת)
4. [ארכיטקטורת קבצים](#4-ארכיטקטורת-קבצים)
5. [Firebase Data Model](#5-firebase-data-model)
6. [API Contract](#6-api-contract)
7. [Parser — Hybrid Rule-Based](#7-parser--hybrid-rule-based)
8. [Taxonomy Contracts](#8-taxonomy-contracts)
9. [UI Placement](#9-ui-placement)
10. [Runtime Flow End-to-End](#10-runtime-flow-end-to-end)
11. [Feature Flags — config.json](#11-feature-flags--configjson)
12. [Integration Points](#12-integration-points)
13. [MVP Scope](#13-mvp-scope)
14. [Binding Decisions Summary](#14-binding-decisions-summary)

---

## 1. מטרת המערכת

Activity Translation System (ATS) היא שכבת **authoring רשמית של Lesson Space** ב-MilEd.One.

המערכת ממירה **יומני הוראה גולמיים** (טקסט חופשי שמרצה כותב לאחר שיעור) לאובייקטי **Activity** מובנים, שעוברים review אנושי ונשמרים ל-**Activity Bank** ב-Firebase.

### הבעיה שהמערכת פותרת

| בעיה | פתרון ATS |
|------|-----------|
| יומני הוראה נשארים כטקסט גולמי, לא נגיש | parsing אוטומטי + review |
| פעילויות לא עקביות בין שיעורים | taxonomy מוגדרת (8 שדות) |
| אין מאגר מרכזי לפעילויות | `activity_bank/{facultyId}/{courseId}/{activityId}` |
| מרצה צריך להזין activity ידנית בכל שיעור | micro_cockpit שולף מהבנק |

---

## 2. עקרון-על

### ATS ≠ Bot Architect

שתי המערכות הן **נפרדות לחלוטין**:

| | Bot Architect | Activity Translation System |
|---|---|---|
| **קובץ** | `functions/architect_api.js` | `functions/journal_api.js` |
| **Routes** | `/api/architect/*` | `/api/journal/*`, `/api/activity-bank/*` |
| **Firebase** | `architect_sessions/...` | `faculty_journals/...`, `activity_bank/...` |
| **Input** | Tally form variables | Raw teaching journal text |
| **Output** | System Prompt + bot config | Structured Activity records |
| **Pipeline** | SP generation | Activity extraction + curation |

> **החלטה מחייבת #1:** ATS לא ממומש כהרחבה של `architect_api.js` אלא כ-API נפרד.

---

## 3. גבולות המערכת

### ATS אחראי על

- ✅ קליטת יומן הוראה גולמי
- ✅ Parsing ראשוני (rule-based)
- ✅ יצירת activity candidates
- ✅ Review ואישור ע"י מרצה
- ✅ שמירה ל-Activity Bank
- ✅ שליפה לבניית שיעור (micro_cockpit)

### ATS **אינו** אחראי על

- ❌ יצירת System Prompts או בוטים
- ❌ Orchestration live של session
- ❌ Runtime chat עם סטודנטים
- ❌ Gatekeeping live
- ❌ LLM enrichment (MVP — disabled)

---

## 4. ארכיטקטורת קבצים

```
functions/
  journal_api.js          ← ATS API handler (חדש)
  architect_api.js        ← Bot Architect (קיים, נפרד)
  firebase-admin.js       ← Firebase init (shared)

macro_cockpit.html        ← ATS Review UI (tab "תרגום יומן הוראה")
config.json               ← system.activity_translation (feature flags בלבד)
netlify.toml              ← redirects: /api/journal/*, /api/activity-bank/*
docs/
  ATS_CONTRACT_V1.md      ← מסמך זה
```

### Netlify Redirects

```toml
[[redirects]]
  from = "/api/journal/*"
  to   = "/.netlify/functions/journal_api"
  status = 200

[[redirects]]
  from = "/api/activity-bank"
  to   = "/.netlify/functions/journal_api"
  status = 200

[[redirects]]
  from = "/api/activity-bank/*"
  to   = "/.netlify/functions/journal_api"
  status = 200
```

> **הערה:** `/api/activity-bank` מגיע לאותה פונקציה — ה-handler מנתח את ה-path פנימית.

---

## 5. Firebase Data Model

### 5.1 Raw Journal

```
faculty_journals/{facultyId}/{journalId}
```

| שדה | סוג | תיאור |
|-----|-----|-------|
| `journalId` | string | ID אוטומטי (`j_{timestamp}_{hex}`) |
| `facultyId` | string | מזהה המרצה |
| `courseId` | string \| null | מזהה קורס |
| `lessonDate` | string \| null | תאריך שיעור (ISO 8601) |
| `lessonTitle` | string \| null | כותרת שיעור |
| `lessonMode` | string \| null | מצב הוראה |
| `rawText` | string | טקסט היומן הגולמי |
| `sourceType` | string | `"manual_paste"` \| `"text_upload"` |
| `status` | string | `"parsed"` → `"reviewed"` → `"approved"` |
| `createdAt` | ISO string | זמן יצירה |
| `updatedAt` | ISO string | עדכון אחרון |

---

### 5.2 Parsed Lesson Summary

```
faculty_journals/{facultyId}/{journalId}/parsed_lesson
```

| שדה | תיאור |
|-----|-------|
| `lessonTitle` | כותרת שחולצה |
| `lessonDate` | תאריך |
| `courseId` | קורס |
| `lessonMode` | מצב הוראה |
| `excerpt` | 3 שורות ראשונות מהיומן |
| `candidateCount` | מספר candidates שנוצרו |
| `parseStrategy` | `"rule_based_v1"` |
| `parsedAt` | ISO timestamp |

---

### 5.3 Activity Candidates

```
faculty_journals/{facultyId}/{journalId}/activity_candidates/{activityId}
```

ראה [Activity Schema](#activity-schema) בהמשך.

---

### 5.4 Review Record

```
faculty_journals/{facultyId}/{journalId}/review
```

| שדה | תיאור |
|-----|-------|
| `reviewedBy` | מזהה מרצה |
| `reviewedAt` | ISO timestamp |
| `approvedCount` | מספר פעילויות שאושרו |
| `rejectedCount` | מספר שנדחו |
| `pendingCount` | מספר ממתינים |
| `notes` | הערות כלליות (optional) |

---

### 5.5 Activity Bank

```
activity_bank/{facultyId}/{courseId}/{activityId}
```

זה המאגר הרשמי של פעילויות מאושרות. ראה [Activity Schema](#activity-schema).

> **החלטה מחייבת #2:** Activity Bank נשמר **ב-Firebase בלבד** — לא ב-`config.json`.

---

### 5.6 Templates (עתידי)

```
activity_templates/{facultyId}/{templateId}
```

לא ממומש ב-MVP.

---

### Activity Schema

כל activity (בין אם candidate או bank record) מכיל:

```json
{
  "activityId": "cand_1744756423_a3f",
  "title": "כתוב תמצית קצרה בזוגות",
  "primaryType": "summarization",
  "secondaryTypes": ["collaborative_work"],
  "instructions": "טקסט מלא של הפעילות כפי שחולץ מהיומן",
  "stageLabel": "guided_practice",
  "deliveryMode": ["text_entry"],
  "expectedOutput": [],
  "collaborationMode": "pair",
  "sessionMode": "frontal",
  "botMode": "none",
  "skillTags": [],
  "difficultyHint": "medium",
  "estimatedMinutes": null,
  "confidence": 0.62,
  "reviewStatus": "pending_review",
  "activitySourceSpan": { "fromText": "..." },
  "source": {
    "origin": "teaching_journal",
    "journalId": "j_1744756423_abc",
    "lessonDate": "2026-03-19"
  },
  "facultyId": "f_elhai",
  "courseId": "hebrew_advanced_01",
  "reuseCount": 0,
  "createdAt": "2026-04-15T10:00:00.000Z",
  "updatedAt": "2026-04-15T10:05:00.000Z"
}
```

---

## 6. API Contract

### `POST /api/journal/parse`

קולט יומן גולמי, מריץ rule-based parser, שומר ל-Firebase.

**Request body:**
```json
{
  "facultyId": "f_elhai",
  "courseId": "hebrew_advanced_01",
  "lessonDate": "2026-03-19",
  "lessonTitle": "מבוא לחשיבה ביקורתית",
  "lessonMode": "zoom",
  "rawText": "...",
  "sourceType": "manual_paste"
}
```

**Response `200`:**
```json
{
  "ok": true,
  "journalId": "j_1744756423_abc123",
  "lessonSummary": { ... },
  "candidateCount": 5,
  "candidates": [ ... ]
}
```

---

### `GET /api/journal/review?facultyId=...&journalId=...`

מחזיר יומן + parsed_lesson + candidates + review state.

**Response `200`:**
```json
{
  "ok": true,
  "journal": { ... },
  "lessonSummary": { ... },
  "candidates": [ ... ],
  "review": null
}
```

---

### `POST /api/journal/review`

שומר את עריכות ה-review של המרצה (approve / reject / edit) על כל candidate.

**Request body:**
```json
{
  "facultyId": "f_elhai",
  "journalId": "j_...",
  "activities": [
    { "activityId": "cand_...", "reviewStatus": "approved", ... },
    { "activityId": "cand_...", "reviewStatus": "rejected" }
  ],
  "reviewNotes": "הערות כלליות"
}
```

**Response `200`:**
```json
{
  "ok": true,
  "reviewedAt": "2026-04-15T10:05:00.000Z",
  "approvedCount": 3,
  "rejectedCount": 1,
  "pendingCount": 1
}
```

---

### `POST /api/journal/approve`

מקדם פעילויות מאושרות מ-`activity_candidates` ל-`activity_bank`.

> **חוק:** פעילות עם `stageLabel: "unclassified"` **נחסמת** — לא ניתן לאשר אותה לבנק.

**Request body:**
```json
{
  "facultyId": "f_elhai",
  "journalId": "j_...",
  "courseId": "hebrew_advanced_01",
  "activities": [
    { "activityId": "cand_...", "reviewStatus": "approved", "stageLabel": "guided_practice", ... }
  ]
}
```

**Response `200`:**
```json
{
  "ok": true,
  "savedCount": 3,
  "savedIds": ["cand_...", "cand_...", "cand_..."]
}
```

---

### `GET /api/activity-bank?facultyId=...&courseId=...&primaryType=...`

שאילתא על הבנק. כל הפרמטרים (מלבד `facultyId`) הם אופציונליים.

**Query params:**

| פרמטר | תיאור |
|--------|-------|
| `facultyId` | **חובה** |
| `courseId` | סינון לקורס ספציפי |
| `primaryType` | סינון לפי סוג פעילות |
| `stageLabel` | סינון לפי שלב |
| `collaborationMode` | סינון לפי שיתוף |
| `sessionMode` | סינון לפי מצב הוראה |
| `botMode` | סינון לפי בוט |
| `difficultyHint` | `low` \| `medium` \| `high` |
| `reviewStatus` | סינון לפי סטטוס |
| `limit` | מקסימום תוצאות (default: 50, max: 200) |

**Response `200`:**
```json
{
  "ok": true,
  "count": 12,
  "total": 35,
  "activities": [ ... ]
}
```

> `count` = מספר תוצאות שהוחזרו (לאחר `limit`). `total` = מספר תוצאות לפני `limit` — מאפשר ל-UI לזהות שיש תוצאות נוספות.

---

### `POST /api/activity-bank/save`

יצירת activity ישירה ל-bank (ללא parser).

**Request body:**
```json
{
  "facultyId": "f_elhai",
  "courseId": "hebrew_advanced_01",
  "activity": { "title": "...", "primaryType": "writing", "stageLabel": "closure", "reviewStatus": "approved", ... }
}
```

**חוק:** activity חייב לעבור bank-validation (כולל חוק ה-`unclassified`).

---

### `POST /api/activity-bank/update`

עדכון activity קיים בבנק.

**Request body:**
```json
{
  "facultyId": "f_elhai",
  "courseId": "hebrew_advanced_01",
  "activityId": "act_...",
  "updates": { "estimatedMinutes": 15, "botMode": "writing_support" }
}
```

---

## 7. Parser — Hybrid Rule-Based

### שלב 1: Text Segmentation

הטקסט מפוצל לסגמנטים לפי:
- **Numbered lists**: `1.`, `2)`, `3.`
- **Bullet points**: `-`, `•`, `*`, `–`
- **Hebrew task markers**: `משימה:`, `פעילות:`, `שלב:`, `תרגיל:`, `חלק:`, `פעולה:`, `נושא:`
- **Length cap**: סגמנט > 500 תווים מפוצל לחדש

אם אין delimiter ברור — כל הטקסט מטופל כסגמנט יחיד.

---

### שלב 2: Keyword Detection

לכל סגמנט מופעלים 5 keyword maps:

#### Type Map (`primaryType`)
סדר החיפוש: מהספציפי לכללי (first match wins).

| עדיפות | type | מילות מפתח לדוגמה |
|--------|------|-------------------|
| 1 | `ai_interaction` | בוט, AI, ChatGPT, Gemini |
| 2 | `peer_response` | תגובה לעמית, peer |
| 3 | `collaborative_work` | עבודה משותפת, בצוות |
| 4 | `presentation` | פרזנטציה, מצגת |
| 5 | `research` | מחקר, חקר |
| 6 | `reflection` | רפלקציה, מה למדתי |
| 7 | `discussion` | דיון, מליאה |
| 8 | `problem_solving` | תרחיש, נסה לפתור |
| 9 | `analysis` | נתח, זיהוי קשרים |
| 10 | `classification` | מיין, סווג |
| 11 | `summarization` | סכם, סיכום |
| 12 | `paraphrasing` | נסח מחדש |
| 13 | `question_answering` | ענה על שאלות |
| 14 | `speaking` | הקלט, בעל פה |
| 15 | `listening` | האזן, קשב |
| 16 | `writing` | כתוב, כתיבה |
| 17 | `reading` | קרא, קריאה |
| 18 | `submission` | הגש, שלח |

ברירת מחדל: `"writing"`.

#### Delivery Map (`deliveryMode`)
מחזיר **מערך** (יכולים להיות כמה modes).

| mode | מילות מפתח לדוגמה |
|------|-------------------|
| `bot_conversation` | בוט, AI, chatbot |
| `padlet_post` | פדלט, padlet |
| `audio_upload` | הקלט, audio |
| `video_upload` | וידאו, video |
| `image_upload` | תמונה, image |
| `form_submission` | טופס, form |
| `oral_live` | בזמן אמת, דיבור חי |
| `in_class_physical` | בכיתה, כתב יד |
| `external_link` | קישור, URL |
| `file_upload` | קובץ, PDF, Word |
| `text_entry` | כתוב, text |

ברירת מחדל: `["text_entry"]`.

#### Stage Map (`stageLabel`)

| stage | מילות מפתח לדוגמה |
|-------|-------------------|
| `opening` | פתיחה, מבוא |
| `knowledge_building` | הסבר, הרצאה, למידה |
| `guided_practice` | תרגול מונחה, עם עזרה |
| `independent_practice` | תרגול, עצמאי |
| `discussion` | דיון, מליאה |
| `reflection` | רפלקציה, סיכום אישי |
| `closure` | סגירה, סיום שיעור |
| `homework` | עבודת בית, לאחר השיעור |

ברירת מחדל: `"unclassified"` — **חובה להחליף לפני שמירה לבנק**.

#### Collaboration Map

| mode | מילות מפתח לדוגמה |
|------|-------------------|
| `pair` | בזוגות, pair |
| `small_group` | קבוצה, group |
| `whole_class` | מליאה, כל הכיתה |
| `teacher_student` | עם המרצה |
| `asynchronous_individual` | אסינכרוני, async |
| `individual` | עצמאי, לבד |

ברירת מחדל: `"individual"`.

#### Session Map

| mode | מילות מפתח לדוגמה |
|------|-------------------|
| `zoom` | זום, zoom, online |
| `hybrid` | היברידי, hybrid |
| `asynchronous` | אסינכרוני, מוקלט |
| `homework` | עבודת בית |
| `in_class_digital` | מחשב בכיתה |
| `frontal` | פרונטלי, כיתה |

ברירת מחדל: ערך `lessonMode` מה-request, או `"frontal"`.

---

### שלב 3: Confidence Score

```
typeScore    = min(typeMatches × 0.2, 0.6)
deliveryScore = min(deliveryMatches × 0.15, 0.3)
stageScore   = stageLabel ≠ "unclassified" ? 0.1 : 0
confidence   = min(0.25 + typeScore + deliveryScore + stageScore, 0.95)
```

- טווח: `0.25` (ללא keyword + unclassified) עד `0.95` (ריבוי keywords + stage מזוהה)
- מוצג ב-UI כ-"🎯 N%"
- `confidenceBreakdown: { typeScore, deliveryScore, stageScore }` מצורף לכל candidate לשקיפות

---

### שלב 4: Human Review (חובה)

> **החלטה מחייבת #6:** אין activity שנכנס לבנק ללא review אנושי.

השלב הזה מבוצע ב-UI של macro_cockpit — ראה [UI Placement](#9-ui-placement).

---

### LLM Enrichment (disabled ב-MVP)

`use_llm_enrichment: false` ב-config.json.

כשיופעל בעתיד, ה-LLM יוכל:
- לשפר title
- להציע skill tags
- להציע stage grouping
- להציע split/merge candidates

---

## 8. Taxonomy Contracts

### `primaryType` (18 ערכים)

```
reading, writing, speaking, listening, discussion, analysis,
classification, summarization, paraphrasing, question_answering,
problem_solving, reflection, presentation, research,
ai_interaction, peer_response, collaborative_work, submission
```

---

### `deliveryMode` (13 ערכים)

```
text_entry, text_upload, image_upload, audio_upload, video_upload,
file_upload, external_link, padlet_post, form_submission,
chat_response, oral_live, in_class_physical, bot_conversation
```

> **sessionMode ≠ deliveryMode:**
> - `sessionMode` = הקשר הוראתי רחב (frontal, zoom, hybrid...)
> - `deliveryMode` = איך הסטודנט מגיש/מבצע (text_entry, audio_upload...)

---

### `stageLabel` (9 ערכים)

| ערך | עברית | מותר בבנק? |
|-----|-------|------------|
| `opening` | פתיחה | ✅ |
| `knowledge_building` | בניית ידע | ✅ |
| `guided_practice` | תרגול מונחה | ✅ |
| `independent_practice` | תרגול עצמאי | ✅ |
| `discussion` | דיון | ✅ |
| `reflection` | רפלקציה | ✅ |
| `closure` | סיכום | ✅ |
| `homework` | עבודת בית | ✅ |
| `unclassified` | לא סווג | ❌ **חסום** |

> **חוק מחייב:** `unclassified` מותר רק ב-candidate stage. חסום בשמירה ל-Activity Bank.

---

### `collaborationMode` (6 ערכים)

```
individual, pair, small_group, whole_class, teacher_student, asynchronous_individual
```

---

### `sessionMode` (6 ערכים)

```
frontal, zoom, hybrid, asynchronous, homework, in_class_digital
```

---

### `botMode` (10 ערכים)

```
none, course_support, task_support, gatekeeper, research_support,
writing_support, paraphrase_support, presentation_support,
reflection_support, diagnostic_support
```

---

### `reviewStatus` (5 ערכים)

| ערך | משמעות |
|-----|---------|
| `pending_review` | טרם נבדק |
| `approved` | אושר כמות שהוא |
| `approved_with_edits` | אושר לאחר עריכות |
| `rejected` | נדחה |

#### Journal `status` — מצב היומן (שדה נפרד מ-`reviewStatus`)

| ערך | משמעות |
|-----|---------|
| `parsed` | עובד — כל ה-candidates עדיין `pending_review` |
| `reviewed` | לפחות activity אחד קיבל החלטה (approved/rejected) |
| `partially_approved` | חלק מה-candidates נשמרו לבנק, חלק עדיין ממתינים |
| `approved` | כל ה-candidates קיבלו החלטה סופית ולפחות חלק נשמרו לבנק |

---

### `difficultyHint` (3 ערכים)

```
low, medium, high
```

---

### `expectedOutput` (20 ערכים)

```
short_answer, extended_answer, summary, paraphrase,
classification_table, list_of_examples, argument_map,
reflection_note, oral_response, recorded_speech, annotated_text,
worksheet_completion, padlet_entry, ai_output, project_fragment,
presentation_segment, research_note, peer_feedback, final_submission
```

---

## 9. UI Placement

### macro_cockpit.html — Tab "📓 תרגום יומן הוראה"

> **החלטה מחייבת #3:** ATS Review UI יושב ב-`macro_cockpit.html` — לא ב-`micro_cockpit.html`.

**נימוק:**
- `micro_cockpit` = orchestration חיה (session control, broadcast, monitoring)
- `macro_cockpit` = תכנון והכנה (course planning, alignment, pre-lesson structuring)
- תרגום יומן = authoring / preparation / curation → שייך ל-macro

---

### 3-Step Stepper

```
[1 — הזנת יומן] → [2 — בדיקה ואישור] → [3 — שמירה לבנק]
```

#### שלב 1 — הזנת יומן

Fields:
- `courseId` — מספר קורס
- `lessonDate` — תאריך שיעור (date picker)
- `lessonTitle` — כותרת שיעור
- `lessonMode` — dropdown (frontal / zoom / hybrid / asynchronous / in_class_digital)
- `rawText` — textarea לטקסט היומן

Action: כפתור **"🔍 נתח יומן"** → `POST /api/journal/parse`

---

#### שלב 2 — בדיקה ואישור

פאנל תלת-עמודי:

| עמודה שמאל | עמודה מרכז | עמודה ימין |
|-----------|-----------|------------|
| טקסט מקורי (raw journal) | רשימת candidates עם status badges | Editor לעריכת candidate נבחר |

**Status badges:**
- ⏳ `pending_review` — כתום
- ✓ `approved` — ירוק
- ✎ `approved_with_edits` — כחול
- ✕ `rejected` — אדום

**Editor fields:**
- כותרת, primaryType, stageLabel, instructions
- collaborationMode, estimatedMinutes, botMode, reviewNotes

**Actions:**
- ✓ אשר / ✎ אשר עם עריכות / ✕ מחק
- 💾 שמור שינויים (per-candidate)
- **"💾 שמור בדיקה"** → `POST /api/journal/review`

---

#### שלב 3 — שמירה לבנק

- רשימת פעילויות מאושרות
- **Validation:** מונע שמירה של `stageLabel: "unclassified"`
- **"📥 שמור לבנק הפעילויות"** → `POST /api/journal/approve`

---

## 10. Runtime Flow End-to-End

```
┌─────────────────────────────────────────────────────────┐
│                    MACRO COCKPIT                         │
│                                                          │
│  מרצה מדביק יומן → POST /api/journal/parse              │
│  ↓                                                       │
│  Review (approve / edit / reject candidates)             │
│  ↓                                                       │
│  POST /api/journal/approve                               │
│         ↓                                                │
│         activity_bank/{facultyId}/{courseId}/{actId}     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    MICRO COCKPIT                         │
│                                                          │
│  GET /api/activity-bank?facultyId=...&courseId=...       │
│  מרצה בוחר activity לשיעור → classroom.js               │
│  classroom.js → currentActivity ב-session state          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    LESSON VIEW                           │
│                                                          │
│  מציג: title, instructions, expectedOutput,              │
│         deliveryMode, botMode                            │
│  (לא יוצר / לא עורך activities)                        │
└─────────────────────────────────────────────────────────┘
```

---

## 11. Feature Flags — config.json

```json
"system": {
  "activity_translation": {
    "enabled": true,
    "use_llm_enrichment": false,
    "ui_host": "macro_cockpit",
    "require_human_review": true,
    "default_stage_taxonomy": "v1",
    "firebase_paths": {
      "journals":  "faculty_journals/{facultyId}/{journalId}",
      "bank":      "activity_bank/{facultyId}/{courseId}/{activityId}",
      "templates": "activity_templates/{facultyId}/{templateId}"
    },
    "api_routes": {
      "parse":         "POST /api/journal/parse",
      "fetch_review":  "GET  /api/journal/review",
      "save_review":   "POST /api/journal/review",
      "approve":       "POST /api/journal/approve",
      "query_bank":    "GET  /api/activity-bank",
      "save_direct":   "POST /api/activity-bank/save",
      "update_direct": "POST /api/activity-bank/update"
    },
    "createdAt": "2026-04-15"
  }
}
```

> **עיקרון:** `config.json` מכיל **policy בלבד** — לא תוכן דינמי. כל data ב-Firebase.

---

## 12. Integration Points

### micro_cockpit (עתידי)

> **החלטה מחייבת #4:** micro_cockpit לא מבצע parsing.

micro_cockpit רק:
- שולף activities מהבנק: `GET /api/activity-bank?facultyId=...&courseId=...`
- מאפשר בחירה לשיעור
- מקשר activity ל-stage/sprint
- דוחף `currentActivity` ל-`classroom.js`

**Integration point ב-`classroom.js`:**
```js
// שדה עתידי ב-session payload:
{
  classId: "...",
  currentActivity: {
    activityId: "act_...",
    title: "...",
    instructions: "...",
    deliveryMode: ["text_entry"],
    botMode: "none"
  }
}
```

---

### lesson_view (עתידי)

> **החלטה מחייבת #5:** lesson_view לא יוצר ולא עורך activities.

lesson_view רק מציג:
- `title`
- `instructions`
- `expectedOutput`
- `deliveryMode`
- `botMode` (מחבר bot session אם צריך)

---

## 13. MVP Scope

### ✅ כלול ב-MVP

| רכיב | קובץ | סטטוס |
|------|------|--------|
| `journal_api.js` — 7 endpoints | `functions/journal_api.js` | ✅ Implemented |
| Netlify redirects | `netlify.toml` | ✅ Implemented |
| Feature flags | `config.json` | ✅ Implemented |
| ATS tab ב-macro_cockpit | `macro_cockpit.html` | ✅ Implemented |
| Rule-based parser | `journal_api.js` | ✅ Implemented |
| Firebase journal paths | Firebase | ✅ (on deploy) |
| Firebase activity_bank | Firebase | ✅ (on deploy) |
| 3-step review UI | `macro_cockpit.html` | ✅ Implemented |

### ❌ לא כלול ב-MVP (עתידי)

- Template generation (`activity_templates/...`)
- LLM enrichment (`use_llm_enrichment: true`)
- Auto skill mapping מלא
- lesson_view rendering של currentActivity
- classroom.js `currentActivity` field (הגדרה ב-session payload — UI picker ממומש, handler עתידי)

---

## 14. Binding Decisions Summary

| # | החלטה | משמעות |
|---|-------|---------|
| 1 | ATS = API נפרד | `journal_api.js`, לא הרחבה של `architect_api.js` |
| 2 | Activity Bank ב-Firebase | לא ב-`config.json` — שכבת content, לא config |
| 3 | Review UI ב-macro_cockpit | tab "תרגום יומן הוראה" |
| 4 | micro_cockpit = בחירה בלבד | לא parsing, לא עריכה |
| 5 | lesson_view = תצוגה בלבד | לא יוצר ולא עורך |
| 6 | Parser = hybrid + human review חובה | rule-based v1 + mandatory review |
| 7 | stageLabel = taxonomy סגורה | 9 ערכים, `unclassified` חסום בבנק |

---

## Changelog

| גרסה | תאריך | שינוי |
|------|-------|-------|
| v1.0 | 2026-04-15 | MVP implementation — 7 endpoints, rule-based parser, macro_cockpit ATS tab |
| v1.1 | 2026-04-15 | 15 bug-fixes & improvements — ראה פירוט להלן |

### v1.1 — פירוט שינויים

| ID | תחום | שינוי |
|----|------|-------|
| FIX-01 | אבטחה | `activityId` בשלב ה-parsing משתמש ב-`generateId("cand")` (randomBytes) במקום `Date.now()+idx` |
| FIX-02 | תקינות | `handleFetchReview` — URLSearchParams בנויה נכון מ-`queryStringParameters`; מונעת encoding שגוי |
| FIX-03 | אבטחה | `handleParse` — guard על `rawText.length > 20000` (400 Bad Request) |
| FIX-04 | אבטחה | `sanitizeRawText()` — מסירה HTML comments, `[SYSTEM...]`, "ignore previous instructions", `<|token|>` לפני parsing |
| FIX-05 | State machine | `handleSaveReview` — status נשאר `"parsed"` כשכל ה-activities ב-`pending_review` |
| FIX-06 | State machine | `handleApprove` — הוסף `"partially_approved"` כ-journal status כאשר חלק מ-candidates עדיין pending |
| FIX-07 | סקלביליות | `handleQueryBank` — courseId query משתמש ב-`orderByChild("createdAt").limitToLast(200)`; בלי courseId מוגבל ל-10 courses |
| FIX-08 | parser | Confidence score מחושב ב-3 ממדים (`typeScore`, `deliveryScore`, `stageScore`); `confidenceBreakdown` מצורף ל-candidate |
| FIX-09 | parser | HEBREW_TASK regex הורחב: `חלק`, `פעולה`, `נושא` |
| FIX-10 | parser | `deriveTitle` — מסירה מספרים ו-bullets מתחילת הכותרת |
| FIX-11 | parser | Length cap הועלה מ-300 ל-500 תווים |
| FIX-12 | ולידציה | `sourceType` — ולידציה כנגד enum `{manual_paste, text_upload}`; ערכים לא תקינים → `"manual_paste"` |
| FIX-13 | UI | Activity Picker ב-`micro_cockpit.html` — מאפשר בחירת activity מהבנק לפני פתיחת שיעור; נשלח כ-`currentActivity` ב-session payload |
| FIX-14 | API | `handleQueryBank` response — הוסף `total` (לפני limit) לצד `count` (לאחר limit) |
| FIX-15 | תיעוד | ATS_CONTRACT_V1.md עודכן: v1.1 changelog, `partially_approved` בטבלת statuses, תיאור confidence חדש, segment cap מעודכן |

---

*Authority: Implementation Contract v1 · MilEd.One System v5.12*
