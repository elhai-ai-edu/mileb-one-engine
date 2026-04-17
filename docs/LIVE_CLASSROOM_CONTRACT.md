# Live Classroom Orchestration Contract
## MilEd.One — v1.0 · 2026-04-17

> **מטרה:** מסמך קצר ורשמי המגדיר את מודל מצבי השיעור החי.
> כל עדכון עתידי לשכבה זו חייב להיות עקבי עם מסמך זה.

---

## 1. מודל דו-שכבתי

| שכבה | שם שדה | Firebase Path | תיאור |
|-------|---------|---------------|-------|
| תוכן | `active_step` | `sessions/{sid}/active_task` | מה לומדים/עושים עכשיו — המשימה הפעילה שהמרצה דחף |
| אינטראקציה | `live_phase` | `sessions/{sid}/state/live_phase` | איך עובדים עכשיו — מצב האינטראקציה הכיתתית |
| מקור | `phase_source` | `sessions/{sid}/state/phase_source` | כיצד נקבע live_phase: `"derived"` \| `"manual"` \| `null` |

> **עיקרון:** `active_step` מגדיר את המשימה; `live_phase` מגדיר את פורמט ההשתתפות.
> שני השדות יכולים להשתנות בצורה עצמאית, אך בדרך כלל `live_phase` נגזר אוטומטית מ-`active_step`.

---

## 2. ערכים מותרים — live_phase

| ערך | תצוגה לסטודנט | מתי משתמשים |
|-----|---------------|-------------|
| `listening` | 🎧 מקשיבים | הרצאה, הסבר, הצגת חומר |
| `interactive` | 💬 דיון פעיל | דיון פתוח, שאלות-תשובות |
| `solo` | ✍️ עבודה עצמאית | עבודה אישית עם הבוט / כתיבה |
| `pairs` | 👥 עבודה בזוגות | עבודה משותפת בזוגות |
| `plenary` | 🏛️ מליאה | חזרה לשיעור כולו, סיכום |
| `null` | (ללא תצוגה) | לא הוגדר מצב — badge מוסתר |

**Enum רשמי (בקוד):** `ALLOWED_LIVE_PHASES = ["listening", "interactive", "solo", "pairs", "plenary"]`
מוגדר ב-`functions/classroom.js` ומשמש לולידציה בכל endpoint.

---

## 3. כללי גזירה (Derivation Policy)

```
push_task(suggestedPhase=X) נקרא
  └── phase_source === "manual"?
        ├── כן  → live_phase לא משתנה (override ידני שמור)
        └── לא  → live_phase = X, phase_source = "derived"

setLivePhase(phase=X) נקרא ידנית על ידי מרצה
  └── X ≠ ""  → live_phase = X, phase_source = "manual"
      X === "" → live_phase = null, phase_source = null

resetPhaseToActivity() נקרא (כפתור "הצמד לפעילות")
  └── קורא active_task.suggestedPhase
      └── יש ערך → live_phase = suggestedPhase, phase_source = "derived"
          אין    → live_phase = null, phase_source = null
```

**כלל מרכזי:** המרצה תמיד יכול לעקוף (manual override). הגזירה האוטומטית פעילה רק כשאין override ידני.

---

## 4. Firebase Data Model

### `sessions/{sessionId}/active_task`
```json
{
  "title": "ניתוח טקסט פתיחה",
  "instructions": "קראו את הקטע ועיינו בשאלות ההנחיה",
  "step": 1,
  "suggestedPhase": "solo",
  "pushedAt": 1713356400000
}
```

### `sessions/{sessionId}/state` (שדות רלוונטיים)
```json
{
  "live_phase": "solo",
  "phase_source": "derived",
  "active_sprint": null,
  "door_status": "open",
  "updatedAt": 1713356400000
}
```

---

## 5. API Contract

### `push_task` (POST)
שידור משימה חדשה לסטודנטים. אם `suggestedPhase` מוגדר ואין override ידני — מעדכן את `live_phase` אוטומטית.

| שדה | סוג | חובה | תיאור |
|-----|-----|------|-------|
| `title` | string | ✅ | כותרת המשימה |
| `instructions` | string | | הוראות |
| `step` | number | | מספר שלב רצף |
| `suggestedPhase` | enum | | מצב אינטראקציה מוצע |

### `session_state_update` (POST)
עדכון מצב השיעור. ניהול `live_phase` ו-`phase_source`.

| שדה | סוג | תיאור |
|-----|-----|-------|
| `livePhase` | enum \| `""` | קבע מצב ידני (או נקה) |
| `resetPhaseSource` | boolean | שחרר override ידני, גזור מ-`active_task.suggestedPhase` |

---

## 6. השפעה על UI

### תצוגת סטודנט (`lesson_view.html`)
| אלמנט | מה מציג | מתי מוצג |
|-------|---------|----------|
| `liveMeetingBarActiveTask` | כותרת המשימה הפעילה (`active_task.title`) + רמז מצב | כשיש משימה פעילה ו-`status !== ended` |
| `liveMeetingBarPhase` | Badge מצב כיתתי (`live_phase`) | כש-`live_phase` מוגדר |

**תרחיש לדוגמה:**
```
📝 עכשיו: ניתוח טקסט פתיחה (✍️ עבודה עצמאית)
✍️ עבודה עצמאית                          ← badge נפרד
```

### תצוגת מרצה (`micro_cockpit.html`)
- **כפתורי phase ידניים** — 5 ערכים + ניקוי → `setLivePhase()`
- **כפתור "📌 הצמד לפעילות"** — מבטל override ידני, נגזר מ-`active_task.suggestedPhase` → `resetPhaseToActivity()`
- **status text** — מציין אם המצב "ידני" או "נגזר מפעילות"

---

## 7. מחזור חיים לדוגמה

```
1. מרצה פותח שיעור     → live_phase = null, phase_source = null
2. מרצה דוחף משימה 1  → push_task(suggestedPhase="listening")
                          live_phase = "listening", phase_source = "derived"
3. מרצה עובר לדיון     → setLivePhase("interactive")
                          live_phase = "interactive", phase_source = "manual"
4. מרצה דוחף משימה 2  → push_task(suggestedPhase="solo")
                          live_phase נשאר "interactive" (manual override פעיל!)
5. מרצה לוחץ "הצמד"   → resetPhaseToActivity()
                          live_phase = "solo", phase_source = "derived"
6. מרצה נוקה            → setLivePhase("")
                          live_phase = null, phase_source = null
7. שיעור מסתיים         → status = "ended"
```

---

## 8. קשר ל-ATS

ATS (Activity Translation System) הוא כלי Authoring בלבד — ממיר יומני הוראה ל-Activity Bank.
**ATS לא מנהל runtime.** הקשר היחיד הוא שפעילויות מהבנק יכולות לשמש כ-`lessonSteps` ב-DJ Booth של ה-micro_cockpit, שם `step.mode` ממופה ל-`suggestedPhase` בעת דחיפה.

---

_מסמך זה חייב להיות מסונכרן עם `ALLOWED_LIVE_PHASES` ב-`functions/classroom.js`._
