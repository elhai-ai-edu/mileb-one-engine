# PEDAGOGICAL COMPILATION SPEC

## MilEd.One

**גרסה:** v1.0 (Design Draft)  
**תאריך:** 2026-04-23  
**סטטוס:** Pre-implementation specification

---

## 1. מטרת המסמך

מסמך זה מגדיר את שכבת הקומפילציה הפדגוגית במערכת MilEd.One.

שכבה זו מתרגמת החלטה פדגוגית מופשטת לתוצר שמרצה יכול לעבוד איתו בפועל:

```text
Pedagogical Decision
→ Lesson Script for Lecturer
+ Structured Flow for System
```

המטרה היא לגשר בין החלטות ה-Transformation Selector לבין Lesson Flow Engine.

---

## 2. מקומה בארכיטקטורה

המסלול המעודכן הוא:

```text
Course Sources
→ Extraction Profile
→ Transformation Selector
→ Pedagogical Compilation
→ Lesson Flow Engine
→ Runtime
```

### החלטה מחייבת #1

Compilation Layer אינה מחליפה את Selector ואינה מחליפה את Builder.

- Selector מחליט כיוון
- Compiler מתרגם לתסריט פעולה
- Builder בונה Flow קנוני

---

## 3. הבעיה שהשכבה פותרת

Selector יכול להחזיר החלטה נכונה כמו:

```json
{
  "template_family": "evidence_guided_discussion",
  "pedagogical_actions": [
    "convert_to_activity",
    "add_guided_questions",
    "add_reflection_closure"
  ]
}
```

אך מרצה לא בהכרח יודע מה לעשות עם זה בכיתה.

לכן המערכת צריכה לתרגם זאת ל:

- תסריט שיעור ברור
- שלבים עם זמנים
- הנחיות למרצה
- שאלות לדוגמה
- מבנה שניתן לעריכה
- Flow שהמערכת יכולה להפעיל

---

## 4. רמת הפירוט הנבחרת

רמת הפירוט שנבחרה היא **B — בינונית**.

כל תסריט צריך לכלול:

- שלבי שיעור
- זמן משוער לכל שלב
- הנחיות פעולה למרצה
- שאלות לדוגמה
- תוצר מצופה מהלומדים

לא לכלול בשלב זה:

- דוגמאות תשובה מפורטות
- ניתוח טעויות צפויות
- תגובות מרצה מפורטות לכל מצב

### החלטה מחייבת #2

המערכת צריכה לתת למרצה מספיק כדי להתחיל ללמד, אך לא להציף אותו בתסריט כבד מדי.

---

## 5. Input Contract

הקומפיילר מקבל החלטת Selector:

```json
{
  "transformation_type": "adapt",
  "template_family": "evidence_guided_discussion",
  "pedagogical_actions": [
    "convert_to_activity",
    "add_guided_questions",
    "attach_evidence_trigger",
    "add_reflection_closure"
  ],
  "context": {
    "duration_minutes": 90,
    "target_skills": ["critical_thinking", "argumentation"],
    "content_type": "conceptual",
    "current_method": "frontal"
  }
}
```

---

## 6. Output Contract

הקומפיילר מחזיר שני תוצרים במקביל:

## 6.1 Lecturer Script

תוצר אנושי, קריא וברור למרצה.

```json
{
  "lesson_script": [
    {
      "step_title": "פתיחה: טענה מעוררת דיון",
      "duration_minutes": 10,
      "lecturer_instruction": "הצג טענה קצרה מתוך המצגת או מתוך מקרה רלוונטי, ובקש מהסטודנטים להגיב אינטואיטיבית.",
      "sample_questions": [
        "האם אתם מסכימים עם הטענה?",
        "מה גורם לכם לחשוב כך?"
      ],
      "expected_student_output": "תגובה ראשונית או עמדה קצרה"
    }
  ]
}
```

## 6.2 Structured Flow Draft

תוצר מערכתי שמועבר ל-Lesson Flow Engine.

```json
{
  "flow_draft": {
    "nodes": [
      {
        "stageLabel": "opening",
        "title": "פתיחה: טענה מעוררת דיון",
        "duration_minutes": 10,
        "botMode": "none",
        "expectedOutputs": ["short_position"],
        "gate": null
      }
    ]
  }
}
```

---

## 7. כללי קומפילציה

## 7.1 Template Family → Script Pattern

כל template family צריכה להיתרגם לדפוס תסריט קבוע אך ניתן לעריכה.

לדוגמה:

### evidence_guided_discussion

מבנה בסיסי:

1. Trigger
2. Evidence Work
3. Guided Discussion
4. Reflection Closure

---

## 7.2 Pedagogical Actions → Step Enrichment

כל פעולה פדגוגית מעשירה את השלבים.

| Action | השפעה על התסריט |
|---|---|
| convert_to_activity | הופך חלק תוכני למשימה פעילה |
| add_guided_questions | מוסיף שאלות לדוגמה |
| attach_evidence_trigger | מוסיף מקור/טענה/מקרה לפתיחה |
| add_reflection_closure | מוסיף שלב סיכום אישי |
| add_scaffolding | מוסיף הדרגתיות והכוונה |

---

## 7.3 Duration Distribution

כאשר משך השיעור ידוע, הקומפיילר מחלק זמן בין שלבים.

לדוגמה עבור 90 דקות:

- פתיחה: 10 דקות
- עבודה על ראיות: 20 דקות
- דיון מונחה: 35 דקות
- סיכום ורפלקציה: 10 דקות
- buffer / מעבר: 15 דקות

### החלטה מחייבת #3

זמנים הם המלצה לעריכה, לא נעילה.

---

## 8. Example: Evidence Guided Discussion

### Input

```json
{
  "transformation_type": "adapt",
  "template_family": "evidence_guided_discussion",
  "pedagogical_actions": [
    "convert_to_activity",
    "add_guided_questions",
    "attach_evidence_trigger",
    "add_reflection_closure"
  ],
  "context": {
    "duration_minutes": 90,
    "target_skills": ["critical_thinking", "argumentation"],
    "content_type": "conceptual"
  }
}
```

### Lecturer Script

```json
[
  {
    "step_title": "פתיחה: טענה מעוררת דיון",
    "duration_minutes": 10,
    "lecturer_instruction": "בחר טענה מרכזית מתוך המצגת או מקור קצר, והצג אותה כמשפט חד שמעורר הסכמה או התנגדות.",
    "sample_questions": [
      "האם אתם מסכימים עם הטענה?",
      "מה חסר לכם כדי להכריע?"
    ],
    "expected_student_output": "עמדה ראשונית קצרה"
  },
  {
    "step_title": "עבודה על ראיות בזוגות",
    "duration_minutes": 20,
    "lecturer_instruction": "חלק את הסטודנטים לזוגות. כל זוג מזהה טענה אחת, ראיה אחת, והנחה סמויה אחת מתוך החומר.",
    "sample_questions": [
      "מהי הטענה המרכזית?",
      "איזו ראיה תומכת בה?",
      "איזו הנחה עומדת מאחוריה?"
    ],
    "expected_student_output": "טענה + ראיה + הנחה"
  },
  {
    "step_title": "דיון מונחה בכיתה",
    "duration_minutes": 35,
    "lecturer_instruction": "אסוף תשובות מכמה זוגות, והשווה בין דרכי הנימוק. הדגש את ההבדל בין דעה לבין טענה מבוססת.",
    "sample_questions": [
      "איזו ראיה חזקה יותר ולמה?",
      "האם אפשר לפרש את אותה ראיה אחרת?",
      "מה יגרום לכם לשנות עמדה?"
    ],
    "expected_student_output": "השתתפות בדיון מבוסס נימוקים"
  },
  {
    "step_title": "סיכום רפלקטיבי",
    "duration_minutes": 10,
    "lecturer_instruction": "בקש מכל סטודנט לנסח משפט מסכם: מה השתנה או התחדד בהבנתו בעקבות הדיון.",
    "sample_questions": [
      "איזה נימוק שכנע אתכם יותר?",
      "מה עדיין נשאר פתוח בעיניכם?"
    ],
    "expected_student_output": "משפט רפלקטיבי אישי"
  }
]
```

---

## 9. Editable Structure Principle

התסריט אינו פקודה למרצה.

הוא הצעה מבנית שניתנת לעריכה:

- שינוי כותרת שלב
- שינוי זמן
- מחיקת שלב
- הוספת שלב
- שינוי שאלות לדוגמה
- שינוי תוצר מצופה

### החלטה מחייבת #4

המרצה שומר בעלות על השיעור. המערכת מציעה תסריט, לא מחליפה את שיקול הדעת שלו.

---

## 10. Relationship to Lesson Flow Engine

הקומפיילר מחזיר flow draft, לא flow סופי.

Lesson Flow Engine אחראי לאחר מכן על:

- קישור activities קיימות
- קישור resources
- יצירת node ids
- יצירת runtime defaults
- התאמת gates

```text
Compiler output = pedagogical draft
Builder output = canonical lesson flow
```

---

## 11. Future Template Families

יש להוסיף בהמשך קומפילציות עבור:

- case_based_learning
- guided_practice_sequence
- scaffolded_skill_building
- mini_inquiry
- reflective_cycle
- flipped_intro

---

## 12. Next Implementation File

הקובץ הבא המומלץ:

```text
functions/lesson_compiler.js
```

פונקציה ראשית:

```js
export function compilePedagogicalDecisionToLesson(decision) {
  // selector decision → lecturer script + flow draft
}
```

---

## פסק דין

Pedagogical Compilation Layer היא השכבה שהופכת את MilEd.One ממערכת שמקבלת החלטות נכונות, למערכת שמספקת למרצה פעולה ברורה, זורמת וניתנת לעריכה.

זוהי שכבת התרגום בין:

```text
Pedagogical Intelligence
```

לבין:

```text
Teaching Reality
```
