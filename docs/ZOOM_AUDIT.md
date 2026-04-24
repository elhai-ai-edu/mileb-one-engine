# Zoom Integration Audit — MilEd.One
## Issue #44 · v1.0 · 2026-04-24

---

## 1. מצב נוכחי — מה כבר קיים בקוד

האינטגרציה **מפותחת יותר ממה שנחשב בתחילה**. הטבלה הבאה מסכמת את השכבות הקיימות:

| שכבה | מה קיים | קובץ |
|---|---|---|
| **מרצה — הגדרה** | פאנל "מפגש חי" עם שדות source / status / title / joinUrl / moodleActivityId | `micro_cockpit.html` |
| **מרצה — פרסום הקלטה** | שדה `recordingUrl` + כפתור "פרסם הקלטה לסטודנטים" | `micro_cockpit.html` |
| **מרצה — כניסה כמנחה** | כפתור "כניסה כמנחה" (`joinMeetingAsHost`) | `micro_cockpit.html` |
| **שרת — שמירה** | `meeting_save` → `courses/{courseId}/liveMeeting` | `functions/classroom.js` |
| **שרת — propagation** | בעת `meeting_save`, מפיץ `liveMeetingSnapshot` לכל sessions פעילים | `functions/classroom.js:1949` |
| **שרת — הקלטה** | `meeting_recording_save` → מעדכן `liveMeeting.recordingUrl` + propagation | `functions/classroom.js:1958` |
| **שרת — מידע** | `meeting_info` endpoint מחזיר `courses/{courseId}/liveMeeting` | `functions/classroom.js:770` |
| **תלמיד — Lobby** | `liveMeetingCard` עם join/recording — גלוי בעת status=live | `waiting_lobby.html` |
| **תלמיד — Lesson space** | `liveMeetingBar` עם join/recording/active-task/ended-card + Live RT sync | `lesson_view.html` |
| **תלמיד — Student view** | `liveMeetingCard` — נוסף כחלק מ-issue #44 | `student_view.html` ✅ |
| **Live sync** | Firebase RT listener מעדכן `liveMeetingBar` ברגע שה-instructor משנה | `lesson_view.html:3250` |
| **קישור לפדגוגיה** | `liveMeeting` מוזרם בתוך `lesson_payload` ביחד עם `active_task` + `live_phase` | `classroom.js:857–895` |

---

## 2. חולשות שזוהו (לפני תיקון)

### 2a. `student_view.html` — ללא liveMeeting
סטודנטים שנכנסים ישירות ל-student dashboard (ולא דרך waiting_lobby) **לא ראו** כרטיס "מפגש חי" גם כאשר session פעיל. — **תוקן ב-issue #44**.

### 2b. Zoom הוא course-level, לא lesson-level
`liveMeeting` נשמר ב-`courses/{courseId}/liveMeeting` — כלומר קישור אחד לכל ה-course, לא לכל שיעור בנפרד. כשמרצה פותח session חדש, `liveMeetingSnapshot` מועתק מהnode הקורסי לsession — אבל לא ניתן להגדיר joinUrl שונה לשיעור 3 לעומת שיעור 5.  
**השפעה:** מרצה שמשנה קישור זום לכל שיעור צריך לעדכן ידנית דרך הפאנל לפני כל שיעור.  
**סטטוס:** מקובל ב-MVP; ניתן לתיקון בגרסה עתידית (ראו סעיף 5).

### 2c. `macro_cockpit.html` — stub בלבד
ב-macro_cockpit יש רק `<option value="zoom">זום</option>` בתוך dropdown פלטפורמה — אין אינטגרציה מלאה לניהול liveMeeting ברמת ה-course. המרצה מנהל Zoom **רק** דרך micro_cockpit.  
**השפעה:** course-level config של Zoom אינו חשוף ב-macro_cockpit.  
**סטטוס:** out of scope ב-MVP.

### 2d. `smart_class.html` / `demo_student_view.html` — לא נסרקו
שתי עמודות אלה לא כוללות `liveMeetingCard`. נחשב **out of scope** עד לאחר פיילוט.

---

## 3. אבחון ארכיטקטוני

### Zoom כ-"Session Gateway + Live Lesson Component"

ב-MilEd.One, Zoom ממלא **שתי תפקידים** בו-זמנית:

```
┌──────────────────────────────────────────────────────┐
│  תפקיד 1 — Session Gateway                           │
│  Zoom הוא הצינור בו הסטודנט "נוכח פיזית" בשיעור.   │
│  MilEd.One לא מחליף את Zoom; הוא פועל לצידו.        │
│                                                      │
│  תפקיד 2 — Live Lesson Component                     │
│  liveMeeting מקושר ל-active_task + live_phase +      │
│  speakerFocus — מרצה שולט בכל השכבות ממקום אחד.     │
└──────────────────────────────────────────────────────┘
```

**עיקרון:** `window.open(..., "_blank")` — Zoom נפתח בחלון נפרד. MilEd נשאר פתוח לצידו. זהו פתרון נכון: הוא שומר על המשכיות תהליך הלמידה (chatbot, active_task, stage progress) גם בזמן המפגש.

**Firebase path:** `courses/{courseId}/liveMeeting` (course-scoped) + propagation ל-`sessions/{sid}/liveMeetingSnapshot` (session-scoped).

---

## 4. אבחון פדגוגי

| היבט | מצב |
|---|---|
| הסטודנט יכול לראות שיש מפגש חי עוד לפני הכניסה | ✅ — waiting_lobby + student_view (לאחר תיקון) |
| המרצה מגדיר Zoom מנקודה מרכזית אחת | ✅ — micro_cockpit פאנל |
| קישור לזום מסונכרן ב-RT לכל הסטודנטים | ✅ — Firebase propagation + RT listener |
| Zoom מחובר לפעילות הפדגוגית (active_task, live_phase) | ✅ — lesson_view מציג active task בתוך liveMeetingBar |
| speakerFocus מוצג לצד Zoom | ✅ — lesson_view liveMeetingBar |
| הקלטה מפורסמת לסטודנטים לאחר השיעור | ✅ — meeting_recording_save + propagation |
| Zoom-per-lesson (קישור שונה לכל שיעור) | ⚠️ — course-level only ב-MVP |
| student_view מציג מפגש חי | ✅ — נוסף ב-issue #44 |

---

## 5. מודל יעד מומלץ (Post-MVP)

```
courses/{courseId}/liveMeeting          ← default course-level (קיים)
  └── status, joinUrl, title, source, recordingUrl

sessions/{sessionId}/liveMeetingSnapshot ← snapshot at session open (קיים)
  └── (override per-lesson if needed)

[POST-MVP] lessons/{lessonId}/liveMeeting ← per-lesson override
  └── allows different Zoom per class meeting
```

**שלבים מומלצים:**
1. (**MVP — הושלם**) מרצה מגדיר Zoom דרך micro_cockpit; Zoom מוצג ב-waiting_lobby, student_view, lesson_view.
2. (**Phase 2**) הוספת `lessonId`-scoped override ב-classroom.js; מרצה יכול להגדיר joinUrl לכל session בנפרד.
3. (**Phase 3**) אינטגרציה עם Moodle Zoom Plugin API — auto-fetch joinUrl לפי `moodleActivityId`.

---

## 6. Deliverable C — כיצד Zoom אמור לפעול ב-MilEd.One

> **Zoom should function as the live presence channel within the lesson space — not as a replacement for it.**
>
> MilEd.One הוא **מרחב הלמידה הפעיל**: הבוט, המשימות, ה-active_task, ה-stage progress — כולם נשארים פתוחים לצד Zoom, לא בתוכו.  
> Zoom הוא **ערוץ הנוכחות החיה**: קול, פנים, שיתוף מסך, תגובות קהל.
>
> שני הכלים פועלים במקביל; אף אחד לא מחליף את השני.  
> המרצה מנחה דרך Zoom; הסטודנט מתרגל, כותב, ומקיים שיח עם הבוט דרך MilEd.  
> כניסה לזום — חלון נפרד (`window.open`); MilEd נשאר פתוח בחלון הראשי.

---

## 7. Scope Summary

| Item | Status |
|---|---|
| Zoom core integration (micro_cockpit → Firebase → lesson_view) | ✅ Existing |
| `waiting_lobby.html` liveMeetingCard | ✅ Existing |
| `student_view.html` liveMeetingCard | ✅ Fixed in issue #44 |
| `docs/ZOOM_AUDIT.md` | ✅ This document |
| iframe embedding | ❌ Out of scope |
| Per-lesson Zoom URLs | ⚠️ Post-MVP |
| `smart_class.html` / `demo_student_view.html` | ⚠️ Out of scope until post-pilot |
| `macro_cockpit.html` full liveMeeting management | ⚠️ Out of scope |
