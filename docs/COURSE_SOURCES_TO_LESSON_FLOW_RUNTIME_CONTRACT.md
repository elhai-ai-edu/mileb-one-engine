# Course Sources → Lesson Flow → Runtime Contract v1

## MilEd.One

**גרסה:** v1.1 (Expanded Draft)  
**תאריך:** 2026-04-23  
**סטטוס:** Architectural draft for implementation design

---

## תוכן עניינים

1. [מטרת המסמך](#1-מטרת-המסמך)
2. [הבעיה שהמסמך פותר](#2-הבעיה-שהמסמך-פותר)
3. [עקרון-העל](#3-עקרון-העל)
4. [סוגי מקורות המידע במערכת](#4-סוגי-מקורות-המידע-במערכת)
5. [היררכיית סמכות בין מקורות](#5-היררכיית-סמכות-בין-מקורות)
6. [הגדרת Lesson Flow](#6-הגדרת-lesson-flow)
7. [מילון המושגים המחייב](#7-מילון-המושגים-המחייב)
8. [לוגיקת המיזוג: איך המקורות הופכים ל-Flow](#8-לוגיקת-המיזוג-איך-המקורות-הופכים-ל-flow)
9. [חוקי הכרעה וקונפליקטים](#9-חוקי-הכרעה-וקונפליקטים)
10. [מבנה Lesson Flow הקנוני](#10-מבנה-lesson-flow-הקנוני)
11. [אחריות שכבות המערכת](#11-אחריות-שכבות-המערכת)
12. [השלכות ארכיטקטוניות](#12-השלכות-ארכיטקטוניות)
13. [מה לא נכלל עדיין](#13-מה-לא-נכלל-עדיין)
14. [הצעד הבא](#14-הצעד-הבא)

---

## 1. מטרת המסמך

מטרת המסמך היא להגדיר חוזה קנוני למעבר ממצב שבו קיימים במערכת מקורות ידע שונים אך מפוצלים, למצב שבו כל מקורות הקורס הרלוונטיים מתלכדים לאובייקט אחד של **Lesson Flow**, אשר ממנו נגזר ה-runtime של השיעור.

המסמך מגדיר לא רק אילו מקורות קיימים, אלא גם:

- מה התפקיד של כל מקור
- מה ההיררכיה ביניהם
- כיצד הם מתמזגים לישות אחת
- מי רשאי לקבוע מבנה, מי רשאי להציע פעילות, ומי משקף רק מצב ריצה

---

## 2. הבעיה שהמסמך פותר

במערכת כבר קיימים מקורות מידע משמעותיים:

- סיליבוס
- lesson plan
- Moodle metadata
- course metadata
- playlist / selectedUnits / resources / sprintDefinitions
- ATS activity bank
- runtime state

הבעיה איננה חוסר במקורות, אלא חוסר באובייקט קנוני אחד שמארגן אותם.

בפועל, המערכת כבר יודעת להחזיק:

- יחידות
- משאבים
- תכנון שיעור
- פעילויות
- מצבי runtime

אך עדיין אינה מגדירה באופן מחייב:

**מהו השיעור כרצף פדגוגי פעיל אחד.**

---

## 3. עקרון-העל

### Lesson Flow אינו נגזר ממקור יחיד

Lesson Flow נבנה מתוך **מערכת רב-מקורית**.

לכן הניסוח הנכון איננו:

```text
ATS → Lesson Flow → Runtime
```

אלא:

```text
Course Sources → Lesson Builder → Lesson Flow → Runtime
```

כאשר Course Sources כוללים:

- Syllabus
- Lesson Plan
- Moodle / Course Metadata
- Course Bundle
- ATS Activity Bank

### החלטה מחייבת #1

אין מקור יחיד במערכת שמספיק לבדו ליצירת Lesson Flow מלא.

### החלטה מחייבת #2

Lesson Flow הוא שכבת תיווך רשמית בין מקורות הקורס לבין runtime.

---

## 4. סוגי מקורות המידע במערכת

## 4.1 Syllabus — שכבה נורמטיבית

הסיליבוס מגדיר את התמונה הרשמית והמחייבת של הקורס:

- מטרות למידה
- רצף יחידות מוצהר
- תוצרים צפויים
- ציפיות הערכה
- הקשר רעיוני של הקורס

הסיליבוס אינו אומר בהכרח מה קורה בכל רגע בשיעור, אך הוא כן מגדיר את ה"למה" וה"לאן".

---

## 4.2 Lesson Plan — שכבה פדגוגית תכנונית

Lesson Plan מגדיר את צורת ההוראה המתוכננת:

- שלבי שיעור
- קצב פדגוגי
- רצף פתיחה–בניית ידע–תרגול–סגירה
- כוונה של המרצה לגבי מבנה ההפעלה

זהו המקור הקרוב ביותר ל-flow ברמת התכנון, אך הוא עדיין לא runtime.

---

## 4.3 Moodle / Course Metadata — שכבה מבנית

Moodle metadata וקבצי course metadata מספקים את המבנה המערכתי הקיים:

- יחידות
- נושאים
- משאבים
- קישורים
- קבצים
- עמודי תוכן

זוהי שכבה שמייצגת **מה קיים בפועל במרחב הקורס**.

---

## 4.4 Course Bundle — שכבה אופרטיבית

Course Bundle כולל אובייקטים שכבר קיימים במערכת, כגון:

- playlist
- selectedUnits
- resources
- sprintDefinitions

אלו נתונים שכבר נמצאים קרוב ל-runtime, ולכן הם מקור אופרטיבי חשוב לבניית flow.

---

## 4.5 ATS Activity Bank — שכבת פעילויות

ATS מספק את יחידות הפעולה עצמן:

- activities מובְנות
- דפוסים פדגוגיים מזוהים
- פעילויות שעברו review
- ניסוחי הוראות שנולדו מתוך יומן ההוראה

ATS הוא מקור activity-level, לא source of truth למבנה הקורס כולו.

---

## 4.6 Runtime State — שכבת מצב

Runtime state משקף:

- מה פעיל עכשיו
- איזה node רץ כרגע
- אילו gates פתוחים או סגורים
- האם יש evidence מספק
- מצב משתתפים, pacing, התקדמות

Runtime state אינו מקור תכנוני ואינו מקור נורמטיבי. הוא שכבת שיקוף והפעלה.

---

## 5. היררכיית סמכות בין מקורות

המערכת חייבת להבחין בין מקורות שמגדירים כיוון, מקורות שמגדירים מבנה, מקורות שמציעים פעילויות, ומקורות שמשקפים מצב.

לכן מוגדרת היררכיית הסמכות הבאה:

### רמה 1 — Syllabus
קובע:
- מטרות
- גבולות
- תוצרים רשמיים
- רצף על

### רמה 2 — Lesson Plan
קובע:
- פירוק פדגוגי אופרטיבי
- מבנה שיעור מתוכנן
- חלוקת שלבים

### רמה 3 — Moodle / Course Metadata
קובע:
- אילו יחידות ומשאבים באמת קיימים
- אילו חומרים זמינים להצמדה

### רמה 4 — ATS Activity Bank
קובע:
- אילו יחידות פעילות אפשר לשבץ
- אילו פעילויות מתאימות לכל שלב

### רמה 5 — Runtime State
קובע:
- רק את מצב הריצה הנוכחי
- לא את מבנה ה-flow עצמו

### החלטה מחייבת #3

Runtime state לעולם אינו גובר על syllabus או lesson plan בקביעת מבנה.

### החלטה מחייבת #4

ATS אינו רשאי לבדו לשנות את הרצף הנורמטיבי של הקורס; הוא ממלא את ה-flow בפעילויות, אך אינו מחליף את הגדרת כיוון הקורס.

---

## 6. הגדרת Lesson Flow

Lesson Flow הוא האובייקט הקנוני שמתאר שיעור כיחידת ריצה פדגוגית.

הוא כולל:

- מקור והקשר
- רצף nodes
- activities משויכות
- resources משויכים
- bot modes
- gates
- expected outputs
- runtime pointer

Lesson Flow איננו:

- לא syllabus
- לא activity bank
- לא playlist
- לא runtime state

הוא אובייקט ביניים קנוני שמאחד את כל אלה לתוכנית ריצה אחת.

---

## 7. מילון המושגים המחייב

### Syllabus
מקור נורמטיבי המגדיר למה הקורס קיים ולאן הוא הולך.

### Lesson Plan
מקור תכנוני המתאר כיצד המרצה מבקש להפעיל יחידה או שיעור.

### Activity
יחידת פעולה פדגוגית אטומית, לרוב שמקורה ב-ATS.

### Node
צומת ב-lesson flow. יכול להכיל activity אחת או יותר.

### Lesson Flow
רצף קנוני של nodes, המחבר בין מטרות, משאבים, פעילויות ותנאי מעבר.

### Runtime
מופע ריצה פעיל של Lesson Flow בזמן אמת.

### Gate
תנאי מעבר בין nodes.

### Expected Output
התוצר המצופה מצומת מסוים.

---

## 8. לוגיקת המיזוג: איך המקורות הופכים ל-Flow

בניית Lesson Flow תתבצע בשלבים, ולא כמיזוג שטוח.

## שלב 1 — יצירת שלד נורמטיבי

מקורות:
- syllabus
- lesson plan

תוצר:
- שלד ראשוני של השיעור
- הגדרת מטרות לכל שלב
- expected outputs ראשוניים
- חלוקה בסיסית ל-stages / nodes

בשלב הזה עדיין לא מצמידים פעילויות קונקרטיות.

---

## שלב 2 — עיגון מבני

מקורות:
- Moodle metadata
- course metadata
- course bundle

תוצר:
- זיהוי אילו יחידות קיימות
- זיהוי משאבים לכל node
- זיהוי sprintDefinitions רלוונטיים
- זיהוי playlist / selectedUnits המתאימים לשיעור

בשלב זה נבדק האם השלד התכנוני נשען על תשתית קורסית שבפועל קיימת במערכת.

---

## שלב 3 — מילוי activity layer

מקורות:
- ATS activity bank

תוצר:
- התאמת activities ל-nodes
- grouping של activities לפי stageLabel
- מיפוי botMode לפי סוג הפעילות
- הצמדת instructions ו-output types לצמתים

בשלב זה ה-flow מקבל גוף פדגוגי ממשי.

---

## שלב 4 — בניית flow קנוני

תוצר:
- Lesson Flow אחד
- כל node מוגדר היטב
- resources מוצמדים
- gates מוגדרים
- runtime defaults מוכנים

---

## 9. חוקי הכרעה וקונפליקטים

מערכת רב-מקורית מחייבת כללי הכרעה. בלעדיהם, ה-builder יהפוך למנגנון אקראי.

## 9.1 קונפליקט בין syllabus לבין lesson plan

אם lesson plan מציע רצף שסותר את רצף-העל של הסיליבוס:

- הסיליבוס גובר ברמת המטרות והכיוון
- lesson plan יכול להתאים את אופן ההוראה, אך לא להפוך את היגיון היחידה

### כלל
Lesson Plan רשאי לשנות **איך מלמדים**, אך לא **לשם מה היחידה קיימת**.

---

## 9.2 קונפליקט בין lesson plan לבין Moodle structure

אם lesson plan מניח משאבים או יחידות שלא קיימים בפועל ב-Moodle / course metadata:

- ה-flow נשאר תקף ברמת הכוונה
- אך המשאב או היחידה מסומנים כחסרים
- builder חייב לייצר fallback או warning

### כלל
Moodle מגדיר מה זמין, אך אינו מגדיר לבדו את המבנה הפדגוגי.

---

## 9.3 קונפליקט בין ATS לבין lesson plan

אם ATS מציע activity מצוינת אך stageLabel שלה אינו מתאים למבנה התכנוני:

- lesson plan גובר על מיקום הפעילות ברצף
- activity יכולה להיות משויכת מחדש ל-node מתאים
- אם אין node מתאים, הפעילות תישמר כ-candidate שלא שובצה

### כלל
ATS מספק activities; הוא אינו מחליף את ארכיטקטורת השיעור.

---

## 9.4 קונפליקט בין runtime reality לבין planned flow

אם בזמן אמת המרצה משנה כיוון, מדלג, עוצר או פותח gate לא מתוכנן:

- runtime state רשאי לשנות את המופע הפעיל
- אך lesson flow definition נשאר האובייקט הקנוני
- יש לתעד override או deviation, ולא לכתוב אוטומטית מחדש את ה-flow כולו

### כלל
Runtime רשאי לחרוג מהתכנון; הוא אינו כותב אותו מחדש כברירת מחדל.

---

## 9.5 כאשר אין מספיק מידע ממקור אחד

אם אחד המקורות חסר:

- ללא syllabus: אפשר לבנות flow זמני ברמת unit/lesson plan
- ללא lesson plan: אפשר לבנות flow על בסיס syllabus + ATS + bundle
- ללא ATS: אפשר לבנות flow skeleton ללא activities מלאות
- ללא Moodle metadata: אפשר לבנות flow, אך חלק מה-resources יישארו לא מעוגנים

### החלטה מחייבת #5

ה-builder צריך לתמוך בבנייה חלקית ובהצפת gaps, לא רק בהצלחה מלאה או כישלון מלא.

---

## 10. מבנה Lesson Flow הקנוני

```json
{
  "lessonId": "lesson_unit_03_2026_04_23",
  "courseId": "hebrew_advanced_01",
  "unitId": "unit_03",
  "sourceContext": {
    "syllabusId": "syllabus_01",
    "lessonPlanId": "lp_unit_03",
    "moodleImportId": "moodle_2026_04_10",
    "playlistId": "playlist_unit_03",
    "generatedFrom": ["syllabus", "lesson_plan", "moodle", "course_bundle", "ats"]
  },
  "nodes": [
    {
      "nodeId": "opening_01",
      "stageLabel": "opening",
      "title": "פתיחה והכוונה",
      "goal": "מיקוד הסטודנטים בנושא היחידה",
      "activities": ["act_001"],
      "resources": ["res_001"],
      "botMode": "none",
      "expectedOutputs": [],
      "gate": null
    },
    {
      "nodeId": "guided_practice_01",
      "stageLabel": "guided_practice",
      "title": "תרגול מונחה",
      "goal": "הפעלה ראשונית של המיומנות",
      "activities": ["act_014", "act_018"],
      "resources": ["res_008", "res_010"],
      "botMode": "task_support",
      "expectedOutputs": ["short_answer"],
      "gate": {
        "type": "evidence_required",
        "minSubmissions": 1
      }
    }
  ],
  "runtimeDefaults": {
    "activeNodeId": "opening_01",
    "status": "draft"
  }
}
```

### החלטה מחייבת #6

Lesson Flow definition ו-runtime state הם שני אובייקטים נפרדים אך מקושרים.

---

## 11. אחריות שכבות המערכת

## 11.1 `lesson_builder.js`

קובץ חדש מוצע.

אחריות:
- לקרוא מקורות
- למזג אותם לפי היררכיית סמכות
- ליצור nodes
- להצמיד resources
- לשבץ activities
- לבנות Lesson Flow canonical object

ה-builder אינו runtime authority.

---

## 11.2 `functions/classroom.js`

אחריות:
- להגיש course sources רלוונטיים
- להחזיק או לטעון את Lesson Flow
- לנהל runtime state
- לעדכן active node
- לנהל gates ו-status

`classroom.js` אינו builder רעיוני, אלא layer של runtime authority והגשה.

---

## 11.3 `lesson_view.html`

אחריות:
- לרנדר את Lesson Flow
- להראות את node הפעיל
- להציג resources ותוצרים
- להפעיל bot mode בהתאם לצומת
- לשקף gates והתקדמות

---

## 11.4 `micro_cockpit.html`

אחריות:
- לשלוט ב-flow
- לקדם node
- להחזיר node אחורה
- לפתוח או לנעול gate
- לנטר pacing והתקדמות

---

## 12. השלכות ארכיטקטוניות

### 12.1 המערכת עוברת מ-tool model ל-flow model

במקום מערכת שמתנהלת דרך כלים מפוזרים, נבנית מערכת שמנוהלת דרך אובייקט flow קנוני.

### 12.2 ה-course נשאר organizational container

הקורס נשאר המכלול הארגוני, אך Lesson Flow הופך ליחידת העבודה הפדגוגית של השיעור.

### 12.3 ATS מקבל מקום מדויק יותר

ATS אינו יורד בחשיבותו; הוא פשוט מוגדר נכון יותר כ-activity source, לא כ-source of total structure.

### 12.4 הסיליבוס מקבל מעמד מערכתִי אמיתי

הסיליבוס מפסיק להיות מסמך רקע והופך להיות מקור נורמטיבי פעיל בבניית flow.

---

## 13. מה לא נכלל עדיין

המסמך הזה עדיין אינו מגדיר:

- storage contract מלא בפיירבייס
- endpointים מפורטים
- אלגוריתם קוד מלא ל-builder
- binding מפורט ל-UI element ברמת selector / function

כל אלה שייכים למסמך ההמשך.

---

## 14. הצעד הבא

הצעד הבא המומלץ הוא מסמך המשך ברמת design-spec:

## `LESSON_FLOW_ENGINE_SPEC.md`

שיכלול:

- merge algorithm מפורט
- JSON schemas מלאים
- data storage paths
- contract between builder and classroom.js
- runtime action set
- UI binding responsibilities

---

## פסק דין

המערכת אינה צריכה להתפתח מ-

```text
ATS + Tools
```

ל-

```text
More Tools
```

אלא מ-

```text
Course Sources
```

ל-

```text
Canonical Lesson Flow
```

ומשם ל-

```text
Runtime + Control
```

זהו המעבר הארכיטקטוני המרכזי של השלב הבא במערכת.
