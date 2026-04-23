# PEDAGOGICAL TRANSFORMATION SELECTOR SPEC

## MilEd.One

**גרסה:** v1.0 (Design Draft)  
**תאריך:** 2026-04-23  
**סטטוס:** Pre-implementation specification

---

## תוכן עניינים

1. [מטרת המסמך](#1-מטרת-המסמך)
2. [מקומו של ה-Selector בארכיטקטורה](#2-מקומו-של-ה-selector-בארכיטקטורה)
3. [הבעיה שה-Selector פותר](#3-הבעיה-שה-selector-פותר)
4. [עקרון-העל](#4-עקרון-העל)
5. [קלטי ה-Selector](#5-קלטי-ה-selector)
6. [Extraction Profile](#6-extraction-profile)
7. [Gap Analysis](#7-gap-analysis)
8. [Transformation Types](#8-transformation-types)
9. [Template Family Selection](#9-template-family-selection)
10. [Pedagogical Actions](#10-pedagogical-actions)
11. [Selector Output Contract](#11-selector-output-contract)
12. [יחס בין Selector לבין Lesson Flow Engine](#12-יחס-בין-selector-לבין-lesson-flow-engine)
13. [חיבור למקורות הידע ב-docs](#13-חיבור-למקורות-הידע-ב-docs)
14. [דוגמה מלאה לתרחיש](#14-דוגמה-מלאה-לתרחיש)
15. [מה לא נכלל עדיין](#15-מה-לא-נכלל-עדיין)
16. [הצעד הבא](#16-הצעד-הבא)

---

## 1. מטרת המסמך

מסמך זה מגדיר את שכבת ההחלטה הפדגוגית של המערכת.

מטרת ה-Selector היא לענות על השאלה:

**מה צריך לשנות בקורס או בשיעור, ואיזה סוג טרנספורמציה פדגוגית נכון להפעיל?**

ה-Selector אינו בונה lesson flow בפועל. הוא קובע:

- מהו סוג הפער
- מהו סוג השינוי הנדרש
- איזו משפחת תבניות פדגוגיות מתאימה
- אילו פעולות פדגוגיות צריך להעביר למנוע הבא

---

## 2. מקומו של ה-Selector בארכיטקטורה

המסלול המלא הוא:

```text
Course Sources
→ Extraction Profile
→ Transformation Selector
→ Lesson Flow Engine
→ Canonical Lesson Flow
→ Runtime
```

כאשר:

- **Extraction Profile** מתאר את מצב הקורס/השיעור הנוכחי
- **Transformation Selector** מחליט מה צריך להשתנות
- **Lesson Flow Engine** בונה את מבנה השיעור בהתאם להחלטה

### החלטה מחייבת #1

Transformation Selector ו-Lesson Flow Engine הם שני מנועים נפרדים.

---

## 3. הבעיה שה-Selector פותר

למערכת יש כבר:

- מקורות ידע עשירים
- מבני קורס קיימים
- lesson flow engine ראשוני
- תבניות והיגיון פדגוגי במסמכי docs

אך עדיין חסר המנגנון שמכריע:

- האם צריך adapt, rescale, או rebuild
- האם השיעור/הקורס במצב טוב אבל פסיבי מדי
- האם הבעיה היא ברמת התוכן, המיומנות, הקצב, או הפורמט
- איזו pedagogical family אמורה להנחות את הבנייה מחדש

בלי שכבה זו, המערכת יודעת לבנות flow, אך אינה יודעת עדיין **למה לבנות אותו כך**.

---

## 4. עקרון-העל

ה-Selector אינו אמור "להמציא פדגוגיה".

הוא אמור:

- לחלץ מצב
- לזהות פערים
- לבחור סוג טרנספורמציה
- לקשור את ההחלטה לידע פדגוגי שכבר קיים במערכת

### החלטה מחייבת #2

ה-Selector הוא **decision layer**, לא authoring layer ולא runtime layer.

---

## 5. קלטי ה-Selector

ה-Selector צריך לקבל תמונת מצב מרוכזת אחת:

```json
{
  "course_sources": {
    "syllabus": {},
    "lesson_plan": [],
    "course_topology": {},
    "activity_bank": [],
    "materials": []
  },
  "audience_profile": {
    "level": "...",
    "skills": [],
    "constraints": []
  },
  "teaching_intent": {
    "desired_change": "...",
    "preserve_structure": true,
    "target_skills": []
  }
}
```

### החלטה מחייבת #3

ה-Selector חייב לכלול גם מידע על קהל היעד וגם מידע על כוונת המרצה, ולא רק על התוכן הקיים.

---

## 6. Extraction Profile

השלב הראשון של ה-Selector הוא בניית profile תיאורי של מצב הקורס/השיעור.

### שדות הליבה

```json
{
  "course_type": "theoretical | practical | hybrid | project",
  "content_type": "conceptual | procedural | skill_based | mixed",
  "current_method": "frontal | guided | workshop | task_based | mixed",
  "target_skills": ["critical_thinking", "writing", "analysis"],
  "activity_level": "low | medium | high",
  "structure_valid": true,
  "assessment_mode": "none | formative | summative | mixed"
}
```

### תפקיד Extraction Profile

הוא אינו מחליט. הוא מתאר.

זהו שלב התרגום הראשוני של חומרי הקורס לשפה פדגוגית תפעולית.

---

## 7. Gap Analysis

לאחר בניית profile, ה-Selector מזהה פערים.

### סוגי הפערים העיקריים

#### 7.1 Level Gap
פער בין מורכבות המשימה/התוכן לבין רמת הלומדים.

#### 7.2 Skill Gap
פער בין המיומנויות הנדרשות לבין המיומנויות הקיימות או המשוערות של הקהל.

#### 7.3 Pedagogical Gap
פער בין היעד הפדגוגי לבין שיטת ההוראה הקיימת.

#### 7.4 Activity Gap
פער בין רמת הפעילות/המעורבות הרצויה לבין זו הקיימת בפועל.

#### 7.5 Pace Gap
פער בין היקף החומר/השלבים לבין זמן הלמידה הזמין.

### ייצוג מוצע

```json
{
  "level_gap": "low | medium | high",
  "skill_gap": true,
  "pedagogical_gap": "low | medium | high",
  "activity_gap": "low | medium | high",
  "pace_gap": "low | medium | high"
}
```

---

## 8. Transformation Types

ה-Selector צריך להכריע בין שלושה סוגי טרנספורמציה ראשיים.

## 8.1 Adapt

מתאים כאשר:
- מבנה הקורס תקין
- מטרות הקורס נשמרות
- הבעיה היא בעיקר בפורמט ההוראה, ברמת הפעילות, או בתבנית השיעור

### דוגמאות
- הרצאה פרונטלית → דיון מונחה ראיות
- מצגת מושגית → מקרה ללמידה

---

## 8.2 Rescale

מתאים כאשר:
- היעד נשמר
- אך הקצב, העומק או חלוקת התוכן אינם מתאימים לקהל או למסגרת הזמן

### דוגמאות
- אותו קורס, אך איטי יותר
- אותה יחידה, אך בפירוק ליותר שלבים

---

## 8.3 Rebuild

מתאים כאשר:
- יש פער רמה מהותי
- יש mismatch חזק בין קהל היעד לבין הקורס הקיים
- יש צורך לפרק ולהרכיב מחדש את יחידת ההוראה

### דוגמאות
- קורס אקדמי מתקדם → גרסה למכינה
- קורס תיאורטי מאוד → גרסה יסודית עם scaffolding כבד

### החלטה מחייבת #4

Transformation type הוא output רשמי של ה-Selector, ולא inference לא מתועד בתוך builder.

---

## 9. Template Family Selection

לאחר שנקבע transformation type, ה-Selector צריך לבחור משפחת תבנית פדגוגית מתאימה.

### דוגמאות למשפחות אפשריות

- evidence_guided_discussion
- case_based_learning
- flipped_intro
- guided_practice_sequence
- scaffolded_skill_building
- reflective_cycle
- pair_work_discussion
- mini_inquiry
- simulation_based

### עקרון הבחירה

הבחירה נעשית מתוך חיבור בין:
- course_type
- content_type
- target_skills
- activity_gap
- pedagogical_gap
- transformation_type

### דוגמה

```json
{
  "transformation_type": "adapt",
  "template_family": "evidence_guided_discussion"
}
```

---

## 10. Pedagogical Actions

לאחר בחירת transformation type ו-template family, ה-Selector צריך להחזיר פעולות פדגוגיות קונקרטיות למנוע הבא.

### דוגמאות לפעולות

- split_content
- break_into_micro_tasks
- add_scaffolding
- convert_to_activity
- reduce_concept_density
- add_guided_questions
- preserve_assessment_structure
- attach_case_trigger
- add_reflection_closure
- prevent_full_solution

### ייצוג מוצע

```json
{
  "pedagogical_actions": [
    "convert_to_activity",
    "add_guided_questions",
    "add_reflection_closure"
  ]
}
```

---

## 11. Selector Output Contract

הפלט הקנוני של ה-Selector צריך להיות:

```json
{
  "extraction_profile": {
    "course_type": "theoretical",
    "content_type": "conceptual",
    "current_method": "frontal",
    "target_skills": ["critical_thinking", "analysis"],
    "activity_level": "low",
    "structure_valid": true
  },
  "gap_analysis": {
    "level_gap": "low",
    "skill_gap": false,
    "pedagogical_gap": "high",
    "activity_gap": "high",
    "pace_gap": "low"
  },
  "transformation_type": "adapt",
  "template_family": "evidence_guided_discussion",
  "pedagogical_actions": [
    "convert_to_activity",
    "add_guided_questions",
    "add_reflection_closure"
  ],
  "selector_report": {
    "confidence": "medium",
    "warnings": [],
    "notes": [
      "Structure preserved; change required mainly in teaching method"
    ]
  }
}
```

### החלטה מחייבת #5

ה-Selector חייב להחזיר גם report נלווה, ולא רק החלטה סופית.

---

## 12. יחס בין Selector לבין Lesson Flow Engine

## ה-Selector קובע:

- מהי הבעיה
- מהו סוג הטרנספורמציה
- איזו משפחת תבניות להפעיל
- אילו פעולות פדגוגיות יש לבצע

## Lesson Flow Engine קובע:

- איך לבנות את ה-flow בפועל
- איך לפרק ל-nodes
- אילו resources ו-activities לשייך
- איך להפיק runtime defaults

### כלל מפתח

```text
Selector decides direction.
Lesson Flow Engine decides structure.
```

---

## 13. חיבור למקורות הידע ב-docs

ה-Selector צריך להיתמך במסמכי הידע שכבר קיימים במערכת.

### מקורות רלוונטיים במיוחד

- `WAVE_1_EXTRACTION_SPEC.md`
- `LESSON_SPACE_PEDAGOGICAL_ANALYSIS.md`
- `LECTURER_ARCHITECTURE_PROPOSAL.md`
- `תבניות הוראה_.md`
- `KNOWLEDGE_CLASSIFICATION_FRAMEWORK.md`
- `KNOWLEDGE_MATERIALS_MAPPING.md`

### תפקיד המסמכים

#### Framework Docs
תומכים ב-extraction profile ובשפה לוגית של סוגי ידע, חומרים ופעולות.

#### Template Docs
תומכים ב-template family selection.

#### Lesson Space / Lecturer Architecture
תומכים בקישור בין pedagogical decision לבין runtime / artifact flow.

### החלטה מחייבת #6

ה-Selector חייב להיות traceable למקורות ידע קיימים, ולא להתבסס רק על inference חופשי.

---

## 14. דוגמה מלאה לתרחיש

### תרחיש

מרצה מעלה מצגת קיימת לשיעור של 90 דקות בקורס מבוא עיוני במדעי החברה.
הכוונה החדשה: לשמור על היעד של חשיבה ביקורתית, אך להפוך שיעור פרונטלי לשיעור פעיל.

### Extraction Profile

```json
{
  "course_type": "theoretical",
  "content_type": "conceptual",
  "current_method": "frontal",
  "target_skills": ["critical_thinking", "argumentation"],
  "activity_level": "low",
  "structure_valid": true
}
```

### Gap Analysis

```json
{
  "level_gap": "low",
  "skill_gap": false,
  "pedagogical_gap": "high",
  "activity_gap": "high",
  "pace_gap": "low"
}
```

### Selector Decision

```json
{
  "transformation_type": "adapt",
  "template_family": "evidence_guided_discussion",
  "pedagogical_actions": [
    "convert_to_activity",
    "add_guided_questions",
    "add_reflection_closure"
  ]
}
```

### המשמעות

המערכת אינה מפרקת את הקורס ואינה בונה אותו מחדש.
היא משמרת את מבנה היחידה, אך משנה את התצורה הפדגוגית של השיעור.

---

## 15. מה לא נכלל עדיין

המסמך הנוכחי עדיין אינו מגדיר:

- אלגוריתם קוד מלא ל-Selector
- scoring mechanism מפורט
- schema של template library עצמה
- persistence / storage contract
- integration API מול lesson_builder.js

אלו שייכים לשלב הבא.

---

## 16. הצעד הבא

הצעד הבא המומלץ הוא יצירת מודול קוד ראשוני:

## `functions/transformation_selector.js`

שיכלול:

- buildExtractionProfile()
- detectGaps()
- decideTransformationType()
- selectTemplateFamily()
- emitPedagogicalActions()

---

## פסק דין

Pedagogical Transformation Selector הוא השכבה שהופכת את MilEd.One ממערכת שיודעת לבנות מבנים, למערכת שיודעת גם לקבל החלטות פדגוגיות על שינוי, התאמה, פירוק ובנייה מחדש.

זהו מנוע ה"למה לשנות" של המערכת.

Lesson Flow Engine נשאר מנוע ה"איך לבנות".
