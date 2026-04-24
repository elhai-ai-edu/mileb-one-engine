# PEDAGOGICAL PRINCIPLES LAYER SPEC

## MilEd.One

**גרסה:** v1.0 (Design Draft)  
**תאריך:** 2026-04-23  
**סטטוס:** Pre-implementation specification

---

## 1. מטרת המסמך

מסמך זה מגדיר את שכבת העקרונות הפדגוגיים של MilEd.One.

שכבה זו נועדה להפוך עקרונות פדגוגיים שכבר קיימים במסמכי המערכת ובתיקיית `docs` ממידע מפוזר ולא-מופעל, למנגנון פעיל שמכוון את ה-Selector, ה-Compiler, ה-Builder וה-Runtime.

---

## 2. עקרון-העל

עקרונות פדגוגיים אינם תבניות שיעור.

הם שכבת עומק שמגדירה איזו למידה המערכת מנסה ליצור.

```text
Principles define learning logic.
Templates define implementation patterns.
Scripts define classroom execution.
```

---

## 3. מיקום בארכיטקטורה

המסלול המעודכן:

```text
System Pedagogical Principles
+ Instructor Pedagogical Emphases
→ Principle Resolution Layer
→ Transformation Selector
→ Pedagogical Compilation
→ Lesson Flow Engine
→ Runtime
```

---

## 4. שני מקורות לעקרונות

## 4.1 System Pedagogical Principles

עקרונות מערכתיים שמופקים או מאורגנים מתוך מסמכי המערכת וה-docs.

דוגמאות:

- active_learning
- problem_based_learning
- inquiry_based_learning
- reflective_learning
- self_regulated_learning
- collaborative_learning
- formative_learning
- thinking_oriented_learning
- scaffolded_learning
- agency_preserving_learning

אלה הם עקרונות ברירת מחדל שמבטאים את תפיסת המערכת.

---

## 4.2 Instructor Pedagogical Emphases

דגשים שהמרצה מוסיף כחלק מהשליטה שלו בתהליך.

הם אינם מחליפים את עקרונות המערכת, אלא מתעדפים, מדגישים או מגבילים אותם בהקשר של קורס או שיעור מסוים.

דוגמאות:

- make_more_active
- avoid_overload
- emphasize_independent_thinking
- prefer_discussion
- prefer_problem_based_flow
- avoid_heavy_group_work
- add_reflection
- keep_simple

---

## 5. מודל מוצר לדגשי מרצה

המודל הנבחר הוא **B — רשימה סגורה + שדה פתוח**.

### 5.1 רשימה סגורה

המרצה בוחר מתוך chips / checkboxes מוכנים:

- להפוך את השיעור לפעיל יותר
- להוסיף רפלקציה
- להדגיש חשיבה עצמאית
- לשמור על עומס נמוך
- להעדיף למידה מבוססת בעיות
- להעדיף דיון
- להעדיף עבודה אישית או בזוגות
- להימנע מעבודה קבוצתית כבדה
- להוסיף scaffolding

### 5.2 שדה פתוח

המרצה יכול להוסיף ניסוח חופשי, למשל:

> "אני רוצה שהשיעור יהיה פשוט, עם הרבה דוגמאות, ולא ירגיש כמו עוד מטלה לסטודנטים."

או:

> "חשוב לי שהסטודנטים ינסו לחשוב לבד לפני שהבוט או המרצה נותנים כיוון."

### החלטה מחייבת #1

השדה הפתוח אינו מחליף את הרשימה הסגורה. הוא מוסיף הקשר, טון ודגשים עדינים.

---

## 6. Principle Resolution Layer

שכבה זו מקבלת:

- עקרונות מערכת
- דגשי מרצה סגורים
- דגשי מרצה פתוחים

ומחזירה:

- resolved_principles
- constraints
- preferences
- warnings/conflicts

---

## 7. מבנה אובייקט מוצע

```json
{
  "system_principles": [
    "active_learning",
    "agency_preserving_learning",
    "thinking_oriented_learning"
  ],
  "instructor_emphases": {
    "selected": [
      {
        "emphasis_id": "emphasize_independent_thinking",
        "weight": "high"
      },
      {
        "emphasis_id": "avoid_overload",
        "weight": "medium"
      }
    ],
    "free_text": "Keep the lesson simple and let students think before receiving hints."
  },
  "resolved_principles": [
    "active_learning",
    "thinking_oriented_learning",
    "self_regulated_learning",
    "agency_preserving_learning"
  ],
  "constraints": [
    "no_long_passive_segments",
    "preserve_student_agency",
    "limit_number_of_parallel_tasks",
    "include_reflection_prompt"
  ],
  "preferences": [
    "prefer_open_questions",
    "prefer_individual_or_pair_work",
    "use_short_clear_steps"
  ],
  "resolution_report": {
    "warnings": [],
    "notes": [
      "Instructor emphasis strengthens independent thinking and reduces overload."
    ]
  }
}
```

---

## 8. קטלוג עקרונות ראשוני

## 8.1 Active Learning

### Meaning
למידה שבה הלומד מבצע פעולה משמעותית ולא רק מקבל מידע.

### Selector Effect
מעדיף תבניות הכוללות פעולה, דיון, תרגול, חקר או פתרון בעיה.

### Compiler Effect
מוסיף פעולה של סטודנטים בכל שלב מרכזי.

### Builder Constraint
אין מקטע פסיבי ארוך ללא learner action.

---

## 8.2 Problem-Based Learning

### Meaning
למידה שנפתחת מבעיה, מקרה, שאלה או אתגר.

### Selector Effect
מעדיף case_based_learning, mini_inquiry, simulation_based.

### Compiler Effect
פותח את התסריט בבעיה ומוביל לחקירה / הצעת פתרון / רפלקציה.

### Builder Constraint
חייבים להיות nodes של problem → inquiry/action → response → reflection.

---

## 8.3 Thinking-Oriented Learning

### Meaning
למידה שמדגישה ניתוח, נימוק, השוואה, בחינה ביקורתית וחשיבה עצמאית.

### Selector Effect
מעדיף evidence_guided_discussion, inquiry, argumentation tasks.

### Compiler Effect
מוסיף שאלות פתוחות, שאלות נימוק והשוואת טענות.

### Builder Constraint
לפחות node אחד חייב לכלול reasoning output.

---

## 8.4 Self-Regulated Learning

### Meaning
למידה שבה הלומד מתכנן, בודק, מעריך ומכוון את עצמו.

### Selector Effect
מוסיף פעולות של monitoring/reflection.

### Compiler Effect
מוסיף prompts מסוג: מה תכננת? מה בדקת? מה תשנה?

### Builder Constraint
חייב להופיע לפחות reflection / check node אחד.

---

## 8.5 Reflective Learning

### Meaning
למידה שבה הלומד מנסח תובנה, שינוי הבנה או כלל פעולה אישי.

### Selector Effect
מוסיף add_reflection_closure.

### Compiler Effect
מסיים בתוצר רפלקטיבי קצר.

### Builder Constraint
flow כולל reflection או closure output.

---

## 8.6 Scaffolded Learning

### Meaning
למידה שמפרקת משימה מורכבת לשלבים קטנים ותומכים.

### Selector Effect
מעדיף scaffolded_skill_building כאשר יש skill_gap או complexity_gap.

### Compiler Effect
מייצר מעבר מדוגמה → פירוק → תרגול מודרך → תרגול עצמאי.

### Builder Constraint
חייבת להיות הדרגתיות בין guided_practice לבין independent_practice.

---

## 8.7 Agency-Preserving Learning

### Meaning
המערכת שומרת על אחריות הלומד ואינה מחליפה את פעולת החשיבה או הביצוע שלו.

### Selector Effect
מונע תבניות שבהן המערכת מייצרת פתרון מלא עבור הלומד.

### Compiler Effect
ניסוחי ההנחיות מובילים את הלומד לחשיבה, לא לתשובה מוכנה.

### Builder Constraint
אין node שמבקש מהבוט להפיק תוצר מלא במקום הלומד.

---

## 9. דגשי מרצה: מיפוי לעקרונות

| Instructor Emphasis | Principles Strengthened | Typical Constraints / Preferences |
|---|---|---|
| make_more_active | active_learning | no_long_passive_segments |
| avoid_overload | scaffolded_learning | limit_number_of_parallel_tasks |
| emphasize_independent_thinking | thinking_oriented_learning, agency_preserving_learning | prefer_open_questions |
| prefer_problem_based_flow | problem_based_learning | start_with_problem_or_case |
| add_reflection | reflective_learning, self_regulated_learning | include_reflection_prompt |
| avoid_heavy_group_work | active_learning | prefer_individual_or_pair_work |
| keep_simple | scaffolded_learning | use_short_clear_steps |

---

## 10. השפעה על המנועים

## 10.1 Transformation Selector

מקבל resolved principles ומושפע בבחירת:

- transformation_type
- template_family
- pedagogical_actions

## 10.2 Pedagogical Compiler

משתמש ב-constraints/preferences כדי לבנות script:

- כמה שלבים
- איזה סוג שאלות
- כמה פעילות
- האם יש רפלקציה
- האם מתחילים מבעיה

## 10.3 Lesson Flow Engine

בודק שה-flow עומד באילוצים:

- אין פסיביות ארוכה
- יש reflection אם נדרש
- יש scaffolding אם נדרש
- יש agency preservation

---

## 11. יחס לדוקס הקיימים

עקרונות המערכת צריכים להיאסף מתוך מסמכים קיימים, ולא להיכתב מחדש מאפס.

מקורות אפשריים:

- LESSON_SPACE_PEDAGOGICAL_ANALYSIS.md
- WAVE_1_EXTRACTION_SPEC.md
- LECTURER_ARCHITECTURE_PROPOSAL.md
- תבניות הוראה_.md
- KNOWLEDGE_CLASSIFICATION_FRAMEWORK.md
- KNOWLEDGE_MATERIALS_MAPPING.md
- MASTER_LOGIC.md
- ARCHITECTURE_CANON_AND_SHARED_LIBRARIES.md

### החלטה מחייבת #2

Principle catalog צריך להיות traceable למקורות הידע הקיימים במערכת.

---

## 12. UI Implication

ב-Macro / Lesson Design יש להוסיף רכיב קל:

### Pedagogical Emphasis

לא שאלון כבד.

ממשק מוצע:

- chips/checkboxes מוכנים
- שדה פתוח קצר
- אפשרות לדלג
- ברירות מחדל מערכתיות

### דוגמה:

```text
מה חשוב לך בשיעור הזה?
[ ] להפוך את השיעור לפעיל יותר
[ ] לשמור על עומס נמוך
[ ] להדגיש חשיבה עצמאית
[ ] להעדיף למידה מבוססת בעיה
[ ] להוסיף רפלקציה

דגש חופשי:
____________________________
```

---

## 13. Next Implementation File

קובץ עתידי מומלץ:

```text
functions/pedagogical_principles.js
```

פונקציות אפשריות:

```js
resolvePedagogicalPrinciples({ systemPrinciples, instructorEmphases })
getConstraintsForPrinciples(resolvedPrinciples)
getPreferencesForEmphases(instructorEmphases)
```

---

## פסק דין

שכבת העקרונות היא שכבת הערכים והכיוון הפדגוגי של המערכת.

היא מאפשרת למערכת להישען על הידע שכבר קיים במסמכים, ובמקביל מאפשרת למרצה לשלוט בדגשים של שיעור או קורס מסוים.

כך MilEd.One לא רק בונה שיעור, אלא בונה שיעור בהתאם לתפיסה פדגוגית גלויה, ניתנת לשליטה, וניתנת לבדיקה.
