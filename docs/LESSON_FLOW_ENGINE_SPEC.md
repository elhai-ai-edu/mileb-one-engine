# LESSON FLOW ENGINE SPEC

## MilEd.One

**גרסה:** v1.0 (Architecture Draft)  
**תאריך:** 2026-04-23  
**סטטוס:** Design-spec before implementation

---

## תוכן עניינים

1. [מטרת המסמך](#1-מטרת-המסמך)
2. [מקומו של המסמך בארכיטקטורה](#2-מקומו-של-המסמך-בארכיטקטורה)
3. [מהו Lesson Flow Engine](#3-מהו-lesson-flow-engine)
4. [קלטי המנוע](#4-קלטי-המנוע)
5. [עקרונות פעולה מחייבים](#5-עקרונות-פעולה-מחייבים)
6. [שלבי האלגוריתם](#6-שלבי-האלגוריתם)
7. [לוגיקת בניית Nodes](#7-לוגיקת-בניית-nodes)
8. [לוגיקת שיוך Activities](#8-לוגיקת-שיוך-activities)
9. [לוגיקת שיוך Resources](#9-לוגיקת-שיוך-resources)
10. [Gates, Outputs, Bot Modes](#10-gates-outputs-bot-modes)
11. [Fallbacks ו-Missing Data](#11-fallbacks-ו-missing-data)
12. [תוצרי המנוע](#12-תוצרי-המנוע)
13. [חלוקת אחריות בין הקבצים](#13-חלוקת-אחריות-בין-הקבצים)
14. [מה עדיין מחוץ למסמך](#14-מה-עדיין-מחוץ-למסמך)

---

## 1. מטרת המסמך

מסמך זה מגדיר את מנוע הבנייה של Lesson Flow ברמה ארכיטקטונית.

מטרתו היא לענות על השאלה:

**איך מקורות הקורס השונים הופכים בפועל ל-Lesson Flow קנוני אחד?**

זהו מסמך משלים ל-`COURSE_SOURCES_TO_LESSON_FLOW_RUNTIME_CONTRACT.md`:

- החוזה הקודם הגדיר את המקורות, היררכיית הסמכות וחוקי ההכרעה
- המסמך הנוכחי מגדיר את מנגנון הפעולה של ה-builder עצמו

---

## 2. מקומו של המסמך בארכיטקטורה

המסלול הארכיטקטוני המלא הוא:

```text
Course Sources
→ Lesson Flow Engine
→ Canonical Lesson Flow
→ Runtime Layer
→ Control Layer
```

כאשר:

- **Course Sources** = syllabus + lesson plan + Moodle metadata + course bundle + ATS
- **Lesson Flow Engine** = שכבת הבנייה וההכרעה
- **Canonical Lesson Flow** = האובייקט הפדגוגי שנבנה
- **Runtime Layer** = השכבה שמריצה את ה-flow
- **Control Layer** = השכבה שמנהלת את ה-flow בזמן אמת

---

## 3. מהו Lesson Flow Engine

Lesson Flow Engine הוא מנגנון תרגום פדגוגי־מבני.

הוא אינו:

- runtime
- authoring UI
- ATS
- viewer
- cockpit

הוא כן:

- קורא כמה מקורות מידע
- מפעיל עליהם היררכיית סמכות
- מייצר מהם אובייקט lesson flow קנוני
- מסמן gaps, conflicts ו-fallbacks

### החלטה מחייבת #1

Lesson Flow Engine אינו יוצר ידע יש מאין; הוא **מתרגם ומארגן** ידע קיים.

---

## 4. קלטי המנוע

המנוע צריך לעבוד מול אובייקט קלט מרוכז, גם אם חלק מהשדות חסרים.

### מבנה קלט מופשט

```json
{
  "syllabus": {},
  "lessonPlan": [],
  "moodleMetadata": {},
  "courseBundle": {
    "playlist": {},
    "selectedUnits": [],
    "resources": [],
    "sprintDefinitions": []
  },
  "activityBank": []
}
```

### החלטה מחייבת #2

המנוע צריך לתמוך בקלט חלקי, ולא רק בתרחיש שבו כל המקורות קיימים במלואם.

---

## 5. עקרונות פעולה מחייבים

### 5.1 Build From Hierarchy, Not From Flat Merge

המנוע אינו מבצע merge שטוח של כל הנתונים, אלא בנייה היררכית.

### 5.2 Build Structure First, Fill Content Later

קודם בונים שלד flow, אחר כך ממלאים אותו בפעילויות, משאבים, gates ו-bot modes.

### 5.3 Preserve Normative Intent

הסיליבוס וה-lesson plan שומרים על הכיוון הפדגוגי. מקורות מאוחרים יותר לא רשאים למחוק אותו, אלא רק לפרש או לממש אותו.

### 5.4 Missing Data Is Legitimate Output

אם חסר מקור, זה אינו בהכרח כישלון. זה יכול להיות מצב חוקי, כל עוד הפלט כולל סימון ברור של פערים.

### 5.5 Runtime Is Not The Builder

ה-runtime רשאי להפעיל flow, לחרוג ממנו או לשקף סטטוס, אך אינו המנוע שבונה אותו.

---

## 6. שלבי האלגוריתם

## שלב 1 — Normalize Inputs

המנוע מנרמל כל מקור למבנה קריא אחיד:

- syllabus → goals, sequence, expected outputs
- lesson plan → stages, timing, pedagogical intentions
- moodle metadata → units, resources
- course bundle → playlist, selectedUnits, sprintDefinitions
- activity bank → stageLabel, instructions, outputs, botMode, tags

### תוצר
Normalized Source Map

---

## שלב 2 — Build Structural Skeleton

על בסיס הסיליבוס וה-lesson plan, נבנה שלד ראשוני של nodes.

### הפעולה
- זיהוי unit scope
- קביעת lesson scope
- יצירת רצף בסיסי של nodes
- הגדרת role לכל node: opening / knowledge / guided practice / independent practice / reflection / closure / homework

### תוצר
Draft Flow Skeleton

---

## שלב 3 — Anchor To Existing Course Structure

המנוע מעגן את השלד אל המבנה הקיים בפועל:

- selectedUnits
- playlist
- Moodle sections
- resources
- sprintDefinitions

### הפעולה
- התאמת node ל-unit מתאים
- מציאת משאבים רלוונטיים
- זיהוי משאבים חסרים
- שיוך sprintDefinitions כאשר הם תומכים בצומת מסוים

### תוצר
Anchored Flow Skeleton

---

## שלב 4 — Fill Activity Layer

כאן נעשה שימוש ב-ATS activity bank.

### הפעולה
- מיפוי activities ל-nodes לפי stageLabel
- שימוש בתגיות משניות כדי לדייק התאמה
- זיהוי candidate activities שלא שובצו
- grouping של כמה activities לאותו node בעת הצורך

### תוצר
Activity-Filled Flow

---

## שלב 5 — Infer Outputs, Gates, Bot Modes

המנוע בונה את שכבת ההפעלה:

- expected outputs
- gate logic
- bot mode per node
- evidence expectations

### תוצר
Operational Flow Definition

---

## שלב 6 — Emit Canonical Lesson Flow

לבסוף נבנה אובייקט Lesson Flow קנוני, יחד עם:

- warnings
- gaps
- unresolved activities
- runtime defaults

---

## 7. לוגיקת בניית Nodes

Node הוא יחידת ה-flow הבסיסית.

### 7.1 מקור בניית node

node נבנה קודם כל מתוך השילוב של:

- stage intention מה-lesson plan
- goal / sequence מה-syllabus

### 7.2 כלל בסיסי

לא בונים node מתוך ATS activity בלבד.

ATS activity יכולה **לאכלס** node, אך לא להחליף את עצם הגדרתו.

### 7.3 מתי מפצלים node

node יפוצל כאשר מתקיים לפחות אחד מהתנאים:

- יש שתי מטרות פדגוגיות שונות באותו stage
- יש output types שונים מהותית
- יש שינוי ברור במצב העבודה (למשל מליאה → זוגות → עבודה עצמאית)
- יש צורך ב-gate נפרד בין שני חלקים

### 7.4 מתי מאחדים nodes

מאחדים כאשר:

- מדובר באותה מטרה פדגוגית
- אותה אוכלוסיית פעולה
- אותו סוג תוצר
- אין צורך ב-gate ביניים

---

## 8. לוגיקת שיוך Activities

### 8.1 עוגן ראשוני: stageLabel

stageLabel הוא שדה השיוך הראשוני.

### 8.2 עוגנים משניים

כאשר יש כמה nodes באותו stageLabel, משתמשים גם ב:

- skillTags
- collaborationMode
- expectedOutput
- botMode
- sessionMode
- הוראות הפעילות עצמן

### 8.3 פעילויות שלא שובצו

אם activity אינה מתאימה בבירור לאף node:

- היא לא נמחקת
- היא לא משובצת בכוח
- היא מסומנת תחת `unassignedActivities`

### 8.4 reclassification allowed

אם ATS ייצר stageLabel חלש או חלקי, והמיקום ההגיוני של הפעילות ברור מתוך flow context, engine רשאי לבצע reclassification מתועד.

### החלטה מחייבת #3

כל reclassification חייב להיות traceable, ולא silent rewrite.

---

## 9. לוגיקת שיוך Resources

### 9.1 מקור המשאבים

Resources מגיעים מ:

- Moodle metadata
- selectedUnits
- playlist
- course bundle

### 9.2 כלל שיוך

resource יוצמד ל-node אם הוא עומד באחד או יותר:

- unit match
- title/topic match
- explicit plan reference
- sprint reference
- activity reference

### 9.3 resource ambiguity

אם משאב מתאים ליותר מ-node אחד:

- אפשר לשייך אותו לכמה nodes
- אבל יש לציין primary node כאשר אפשר

### 9.4 resource absence

אם node דורש resource אך לא נמצא resource מתאים:

- node נשאר תקף
- נרשם warning
- מסומן `resourceGap: true`

---

## 10. Gates, Outputs, Bot Modes

## 10.1 Expected Outputs

expected outputs נגזרים מ:

- syllabus expectations
- lesson plan intentions
- ATS activity outputs

## 10.2 Gates

gate ייווצר כאשר:

- יש מעבר בין שלבים שדורש evidence
- יש שלב gatekeeping מוצהר
- יש output required לפני התקדמות

## 10.3 Bot Modes

botMode ייגזר מהצומת ולא מן השיעור כולו.

דוגמאות:

- opening → none / course_support
- guided_practice → task_support
- independent_practice → writing_support / research_support
- reflection → reflection_support

### החלטה מחייבת #4

Bot mode הוא property של node, לא של lesson flow כולו.

---

## 11. Fallbacks ו-Missing Data

### 11.1 בלי syllabus

המנוע יבנה flow חלקי מתוך lesson plan + structure + ATS.

### 11.2 בלי lesson plan

המנוע יבנה שלד חלש יותר על בסיס syllabus + ATS + unit structure.

### 11.3 בלי ATS

המנוע יבנה skeleton עם nodes ומשאבים, אך עם activity layer חלקי או ריק.

### 11.4 בלי Moodle metadata

המנוע יבנה flow, אך resources anchoring יהיה חלש יותר.

### 11.5 בלי course bundle

המנוע יפיק flow ללא runtime-oriented enrichment.

### החלטה מחייבת #5

המנוע תמיד חייב להחזיר גם:

- `warnings`
- `gaps`
- `confidenceHints`

ולא רק flow object.

---

## 12. תוצרי המנוע

Lesson Flow Engine צריך להחזיר שלושה outputs:

## 12.1 Canonical Lesson Flow

האובייקט המרכזי.

## 12.2 Build Report

דוח שמסביר:

- אילו מקורות היו זמינים
- אילו היו חסרים
- אילו פעילויות שובצו
- אילו נשארו בחוץ
- אילו conflicts נפתרו
- אילו warnings נוצרו

## 12.3 Runtime Defaults

לדוגמה:

- first active node
- initial status
- initial gates state

---

## 13. חלוקת אחריות בין הקבצים

## 13.1 `lesson_builder.js`

אחריות:
- implement engine logic
- normalize inputs
- build skeleton
- attach resources
- attach activities
- emit canonical flow + build report

## 13.2 `functions/classroom.js`

אחריות:
- collect source inputs
- invoke builder
- persist / expose lesson flow
- manage runtime state

## 13.3 `lesson_view.html`

אחריות:
- render emitted flow
- reflect runtime status
- show active node

## 13.4 `micro_cockpit.html`

אחריות:
- control runtime over emitted flow
- not build the flow itself

---

## 14. מה עדיין מחוץ למסמך

המסמך הנוכחי עדיין לא מגדיר:

- Firebase paths
- exact API actions
- JSON schemas מלאים לכל אובייקט
- persistence lifecycle
- detailed UI bindings

הם יוגדרו במסמך הבא.

---

## פסק דין

Lesson Flow Engine הוא המנגנון שהופך את MilEd.One ממערכת של מקורות מידע וכלי הוראה מפוזרים, למערכת שמסוגלת לתרגם קורס ליחידת ריצה פדגוגית אחת.

זהו המנוע הארכיטקטוני החסר בין:

```text
Course Knowledge
```

לבין:

```text
Pedagogical Runtime
```

והוא תנאי לכך שהמערכת תפעל כ-Flow-Based Pedagogical Operating System.
