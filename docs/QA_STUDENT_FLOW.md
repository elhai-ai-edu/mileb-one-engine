# QA — תרחישי סטודנט קצה-לקצה
## MilEd.One · v1.0 · 2026-04-21

> **מטרה:** מסמך זה מגדיר סבב בדיקות QA מלא לזרימת הסטודנט.  
> כל תרחיש מכיל תנאי כניסה, צעדים, ותנאי יציאה (pass/fail).  
> הבדיקות אמורות לרוץ בסביבת staging עם Firebase אמיתי לפני כל release.

---

## תוכן עניינים

1. [תנאים מקדימים לכל הבדיקות](#1-תנאים-מקדימים)
2. [תרחיש א — כניסה ראשונה + המתנה](#2-תרחיש-א--כניסה-ראשונה--המתנה)
3. [תרחיש ב — פתיחת דלת ומעבר לשיעור](#3-תרחיש-ב--פתיחת-דלת-ומעבר-לשיעור)
4. [תרחיש ג — פעילות + הגשה](#4-תרחיש-ג--פעילות--הגשה)
5. [תרחיש ד — Peer Review](#5-תרחיש-ד--peer-review)
6. [תרחיש ה — מעבר ללובי באמצע שיעור](#6-תרחיש-ה--מעבר-ללובי-באמצע-שיעור)
7. [תרחיש ו — מצב קבוצה (Group Mode)](#7-תרחיש-ו--מצב-קבוצה-group-mode)
8. [תרחיש ז — פרויקט צוות (Team Project)](#8-תרחיש-ז--פרויקט-צוות-team-project)
9. [תרחיש ח — idle 5 דקות (memory leaks)](#9-תרחיש-ח--idle-5-דקות)
10. [מטריצת כיסוי](#10-מטריצת-כיסוי)

---

## 1. תנאים מקדימים

לפני הרצת הסבב כולו, ודא:

- [ ] Firebase פרויקט staging פעיל עם RTDB
- [ ] קורס test קיים ב-Firebase תחת `classes/{testClassId}` עם:
  - `features.peerReview.enabled: true`, `rubricId: "default"`
  - `features.groupMode.enabled: true`, `groupId: "test_group"`, `roles: { testStudentId: "מנסח", testStudent2Id: "מאתגר" }`
  - `features.teamProject.enabled: true`, `projectId: "test_project"`
- [ ] Session פעיל תחת `sessions/{testSessionId}` עם `state.door_status: "closed"`
- [ ] שני דפדפנים פתוחים: דפדפן A (סטודנט), דפדפן B (מרצה / cockpit)
- [ ] Chrome DevTools פתוח בדפדפן A (Console + Network)

---

## 2. תרחיש א — כניסה ראשונה + המתנה

**תיאור:** סטודנט נכנס ל-`waiting_lobby.html` ומחכה לפתיחת שיעור.

**תנאי כניסה:** session קיים, `door_status: "closed"`.

### צעדים

| # | פעולה | תוצאה צפויה |
|---|-------|-------------|
| 1 | נווט ל-`/waiting_lobby.html?courseId={testClassId}&sessionId={testSessionId}` | דף נטען; topbar כהה מוצג; badge "ממתין לפתיחה" |
| 2 | הכנס שם ב-`studentNameInput` ולחץ Enter / כל מקום אחר | שם נשמר; chip "Hybrid Sprint Lobby" מוצג |
| 3 | השלם AI Warmup (בחר תשובה) | `warmupStatus` מתעדכן ל-"הושלם ✓" |
| 4 | השלם Memory Game (3 זוגות) | `memoryStatus` מתעדכן ל-"הושלם ✓"; Golden Ticket מנופק |
| 5 | בדוק `ticketCode` — חייב להכיל מחרוזת שאינה "ממתין לאימות" | ✅ PASS |
| 6 | בדוק שאין console errors | ✅ PASS |

**תנאי יציאה:** Golden Ticket הונפק; אין console errors; דפדפן ממשיך לסנן `door_status`.

---

## 3. תרחיש ב — פתיחת דלת ומעבר לשיעור

**תיאור:** מרצה פותח דלת → סטודנט מועבר אוטומטית ל-`lesson_view.html`.

**תנאי כניסה:** סטודנט נמצא ב-lobby מתרחיש א'.

### צעדים

| # | פעולה | תוצאה צפויה |
|---|-------|-------------|
| 1 | בדפדפן B: פתח דלת דרך cockpit (door_status → "open") | Firebase `sessions/{sessionId}/state/door_status` = "open" |
| 2 | בדפדפן A: תוך 3 שניות | אנימציית דלת מוצגת (#doorAnim visible) |
| 3 | לאחר האנימציה | מעבר אוטומטי ל-`/lesson_view.html?sessionId=...&courseId=...` |
| 4 | ב-lesson_view: topbar מוצג עם שם הקורס | ✅ PASS |
| 5 | ב-lesson_view: אין console errors ב-Network tab | ✅ PASS |
| 6 | ב-lesson_view: `MiledState.sub === "empty"` (בדוק ב-Console: `MiledState.sub`) | ✅ PASS |

**תנאי יציאה:** הסטודנט נמצא ב-lesson_view עם session תקין; אין שגיאות.

---

## 4. תרחיש ג — פעילות + הגשה

**תיאור:** מרצה דוחף פעילות → סטודנט מבצע ומגיש.

**תנאי כניסה:** סטודנט נמצא ב-lesson_view מתרחיש ב'.

### צעדים

| # | פעולה | תוצאה צפויה |
|---|-------|-------------|
| 1 | בדפדפן B: דחוף active_task (action: session_state_update) | Firebase `sessions/{sessionId}/active_task` מתעדכן |
| 2 | בדפדפן A: תוך 3 שניות | activity card מוצג; `studentText` textarea זמין |
| 3 | בדפדפן A: לחץ "התחל ספרינט" | `MiledState.sub === "doing"` |
| 4 | כתוב טקסט ב-`studentText` ולחץ "הגש עבודה" | `setWriteStatus("מגיש...")` → לאחר מכן "✓ עבודה הוגשה" |
| 5 | `subSuccessBanner` מוצג | ✅ PASS |
| 6 | `.writePanel` מקבל class `submitted` | ✅ PASS |
| 7 | `MiledState.sub === "submitted"` | ✅ PASS |
| 8 | Firebase: `sessions/{studentId}/{courseId}/miled_sub === "submitted"` | ✅ PASS |

**תנאי יציאה:** הגשה ב-Firebase; state מסונכרן.

---

## 5. תרחיש ד — Peer Review

**תיאור:** לאחר הגשה — Peer Review panel מופיע ומוגש.

**תנאי כניסה:** סטודנט הגיש עבודה (תרחיש ג'); `features.peerReview.enabled: true`.

### תת-תרחיש 1: triggerBy "system" (automatic)

| # | פעולה | תוצאה צפויה |
|---|-------|-------------|
| 1 | לאחר הגשה (triggerBy: "system") | `peerReviewPanel` מופיע אוטומטית; `MiledState.overlay === "peer_review"` |
| 2 | בדוק rubric: שאלות מוצגות (3 ב-embedded_light, 5 ב-extended) | ✅ PASS |
| 3 | בחר ציון לכל שאלה + emoji + כתוב comment | כפתורים מתעדכנים בהתאם |
| 4 | לחץ "שלח הערכה" | `peerReviewSent` מוצג; `submitBtn` מוסתר |
| 5 | `MiledState.sub === "completed"` | ✅ PASS |
| 6 | Firebase: `sessions/{studentId}/{courseId}/miled_sub === "completed"` | ✅ PASS |

### תת-תרחיש 2: triggerBy "teacher"

| # | פעולה | תוצאה צפויה |
|---|-------|-------------|
| 1 | בדפדפן B: cockpit → "שלח peer review" → מעדכן `sessions/{sessionId}/peer_review_broadcast_at` | Firebase עדכון |
| 2 | בדפדפן A (אם `MiledState.sub === "submitted"`) | `peerReviewPanel` מופיע |
| 3 | אם `MiledState.sub !== "submitted"` | panel לא מופיע (guard) ✅ PASS |

**תנאי יציאה:** Peer review נשמר ב-Firebase; overlay מנוקה.

---

## 6. תרחיש ה — מעבר ללובי באמצע שיעור

**תיאור:** מרצה מפעיל Recall → סטודנט מועבר ללובי ויכול לחזור.

**תנאי כניסה:** סטודנט נמצא ב-lesson_view.

### צעדים

| # | פעולה | תוצאה צפויה |
|---|-------|-------------|
| 1 | בדפדפן B: cockpit → Recall (`sessions/{sessionId}/recall` מתעדכן) | Firebase עדכון |
| 2 | בדפדפן A: banner "חזרה ללובי" מופיע | ✅ PASS |
| 3 | בדפדפן A: לחץ "חזרה ללובי" (או אוטומטית) | redirect ל-`/waiting_lobby.html?mid_session=1&sessionId=...` |
| 4 | ב-lobby: `readyBanner` מוצג ("המסלול הושלם"); כפתור "כניסה לשיעור" פעיל | ✅ PASS |
| 5 | בדפדפן B: פתח דלת שוב | בדפדפן A: redirect אוטומטי חזרה ל-lesson_view |
| 6 | ב-lesson_view: state מתוחזר נכון; session listeners פעילים | ✅ PASS |

**תנאי יציאה:** חזרה לשיעור תקינה; אין memory leaks.

---

## 7. תרחיש ו — מצב קבוצה (Group Mode)

**תיאור:** מרצה מפעיל Group Mode → סטודנטים מורידים תרומות.

**תנאי כניסה:** `features.groupMode.enabled: true`; 2 סטודנטים (דפדפן A = מנסח, דפדפן C = מאתגר).

### צעדים

| # | פעולה | תוצאה צפויה |
|---|-------|-------------|
| 1 | בדפדפן B: session_state_update stationType=GROUP_STATION | `MiledState.root === "group"` בשני הדפדפנים |
| 2 | בדפדפן A: תפקיד "מנסח" מוצג ב-role chip | ✅ PASS |
| 3 | בדפדפן C: תפקיד "מאתגר" מוצג | ✅ PASS |
| 4 | בדפדפן C: כתוב תרומה + לחץ "הוסף אתגר" | Firebase: `group_contributions/{classId}/{groupId}/{actId}/contributions` מתעדכן |
| 5 | בדפדפן A: תרומה מופיעה ב-feed תוך ~1 שנייה | ✅ PASS |
| 6 | בדפדפן C: נסה לערוך master draft | נחסם (textarea מושבת; server מחזיר 400) ✅ PASS |
| 7 | בדפדפן A (מנסח): כתוב בmaster draft → לחץ "שמור טיוטה" | Firebase: `masterDraft.text` מתעדכן |
| 8 | בדפדפן C: טיוטה מוצגת כ-readonly | ✅ PASS |
| 9 | בדפדפן A: לחץ "פתח הצבעה" | veto panel מופיע; chip מנסח = ✅; שאר = ⏳ |
| 10 | בדפדפן C: לחץ "אשר" | Firebase: approval מתעדכן; בדפדפן A chip C = ✅ |
| 11 | כשכולם אישרו → finalBtn מופעל בדפדפן A | ✅ PASS |
| 12 | בדפדפן A: לחץ "הגש סופית" | Firebase: veto.status = "submitted"; groupSubmittedBanner מוצג |

**תנאי יציאה:** הגשה קבוצתית ב-Firebase; כל participants ראו את התהליך real-time.

---

## 8. תרחיש ז — פרויקט צוות (Team Project)

**תיאור:** סטודנט נכנס לפרויקט הצוות, מוסיף בלוק, מעביר בטון.

**תנאי כניסה:** `lessonData.teamProjectId` קיים; פרויקט ב-Firebase `team_projects/{projectId}` עם `members: [studentId]`.

### צעדים

| # | פעולה | תוצאה צפויה |
|---|-------|-------------|
| 1 | בדפדפן A: לחץ כפתור "פרויקט צוות" ב-lesson_view | `enterTeamProjectMode()` → team_project.html נטען ב-iframe |
| 2 | entry request ל-server | AI Digest מוצג ב-modal (≤ 5 שניות) |
| 3 | לחץ "המשך" לדלג על digest | document blocks מוצגים |
| 4 | כתוב טקסט ב-editor + לחץ "הוסף בלוק" | Firebase: block חדש עם authorId + authorName + addedAt |
| 5 | בדפדפן D (עמית): block חדש מופיע real-time | ✅ PASS |
| 6 | לחץ "העבר בטון" — ללא הערה | modal נפתח; שדה חובה; שליחה ללא הערה → toast "יש לכתוב הערת מסירה" |
| 7 | כתוב הערה + לחץ "העבר" | Firebase: baton.currentHolder = עמית; baton.handoffNote = הערה |
| 8 | redirect ל-lobby | ✅ PASS |
| 9 | בדפדפן D: notification על בטון חדש | ✅ PASS |

**תנאי יציאה:** בלוקים ב-Firebase; baton נמסר; handoff note נשמר.

---

## 9. תרחיש ח — Idle 5 דקות

**תיאור:** בדיקת memory leaks — אין console errors לאחר 5 דקות idle.

**תנאי כניסה:** סטודנט ב-lesson_view עם session פעיל.

### צעדים

| # | פעולה | תוצאה צפויה |
|---|-------|-------------|
| 1 | פתח Chrome DevTools → Console | נקה errors קיימות |
| 2 | המתן 5 דקות ללא פעילות | אין errors חדשות |
| 3 | עבור ל-Network tab | אין failed requests (404/500) |
| 4 | בדוק Firebase connections | לא יותר מ-4 listeners פתוחים (session, peer_review_ready, group אם רלוונטי, baton) |
| 5 | סגור את הדף | beforeunload: כל listeners מנותקים (בדוק ב-Firebase Console שה-connections ירדו) |

**תנאי יציאה:** אפס console errors; listeners מנוקים ב-unload.

---

## 10. מטריצת כיסוי

| תרחיש | שלב Roadmap | קריטיות | אוטומציה אפשרית |
|-------|-------------|---------|----------------|
| א — כניסה + המתנה | Phase 1 | גבוהה | חלקית (smoke test) |
| ב — פתיחת דלת | Phase 1 | גבוהה | ידנית (Firebase write נדרש) |
| ג — פעילות + הגשה | Phase 1 | גבוהה | ידנית |
| ד — Peer Review (system) | Phase 2 | גבוהה | ידנית |
| ד — Peer Review (teacher) | Phase 2 | בינונית | ידנית |
| ה — Recall + חזרה | Phase 1 | בינונית | ידנית |
| ו — Group Mode | Phase 3 | גבוהה | ידנית (2 דפדפנים) |
| ז — Team Project | Phase 3 | בינונית | ידנית (2 דפדפנים) |
| ח — Idle 5 דקות | Phase 1 | בינונית | ידנית |

### מה **לא** מכוסה כאן (scope out)

- בדיקות עומס (>20 סטודנטים)
- בדיקות נגישות (a11y)
- בדיקות mobile (<768px) — מדיה קוורי קיים, אך לא נבדק מלא
- בדיקות browser compat (ה-stack מניח Chrome 120+)
- LMS grade integration (לא ב-MVP)

---

*מסמך זה נכתב 2026-04-21. יש לעדכן בעת הוספת features חדשים.*
