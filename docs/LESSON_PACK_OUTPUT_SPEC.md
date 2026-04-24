# LESSON PACK OUTPUT SPEC

## MilEd.One

**גרסה:** v1.0 (Design Draft)  
**תאריך:** 2026-04-24  
**סטטוס:** Canonical output specification before implementation

---

## 1. מטרת המסמך

מסמך זה מגדיר את מבנה הפלט הקנוני של **Lesson Pack** במערכת MilEd.One.

המטרה היא להרחיב את תוצר הקומפילציה הפדגוגית מעבר ל-lesson script בלבד, כך שהמערכת תוכל להפיק תיק שיעור מלא, שימושי, ניתן לעריכה, וניתן להפעלה בתוך ה-runtime.

---

## 2. עקרון-העל

Lesson Pack אינו רק רשימת שלבים.

Lesson Pack הוא יחידת הוראה מלאה הכוללת:

- רציונל פדגוגי
- הנחיות למרצה
- הנחיות לסטודנטים
- תסריט שיעור
- Flow מערכתי
- משאבים
- Pre-class / Post-class
- הערכה ורפלקציה
- יעדי ייצוא עתידיים

```text
Pedagogical Decision
→ Lesson Pack Draft
→ Lesson Flow
→ Runtime
```

---

## 3. מקורות רעיוניים

מבנה Lesson Pack נשען על המסמכים הקיימים במערכת:

- `docs/drive-download-20260320T045128Z-1-001/חקר יכולת יצירת בוט יוצר פדגוגי_.md`
- `docs/תבניות הוראה_.md`
- `docs/platform_libraries/active_learning_and_skills_oriented_design_pattern_library.md`
- `docs/drive-download-20260320T045128Z-1-001/פדגוגיה של פעילויות בכיתה.md`
- `docs/בוט בונה הבוטים/drive-download-20260320T035657Z-1-001/BOT_BUILDER_MODEL.md`

---

## 4. יחס למנועים הקיימים

### Transformation Selector
קובע את הכיוון:

- transformation_type
- template_family
- pedagogical_actions
- principles / constraints / preferences

### Pedagogical Compiler
מפיק Lesson Pack Draft.

### Lesson Flow Engine
לוקח את ה-flow draft מתוך ה-Lesson Pack ומייצר ממנו Flow קנוני להפעלה.

### Runtime
מריץ את ה-flow ומציג למרצה/סטודנטים את החלקים הרלוונטיים.

---

## 5. מבנה פלט קנוני

```json
{
  "lesson_pack_id": "string",
  "metadata": {},
  "pedagogical_rationale": {},
  "teacher_guide": {},
  "student_guide": {},
  "lesson_script": [],
  "flow_draft": {},
  "pre_class": [],
  "post_class": [],
  "resources_plan": [],
  "assessment": {},
  "reflection": {},
  "skills_alignment": [],
  "export_targets": [],
  "pack_report": {}
}
```

---

## 6. רכיבי הפלט

## 6.1 metadata

מגדיר את זהות השיעור וההקשר.

```json
{
  "lesson_title": "string",
  "course_id": "string",
  "unit_id": "string",
  "duration_minutes": 90,
  "audience_level": "beginner | intermediate | advanced",
  "course_type": "theoretical | practical | hybrid | project",
  "content_type": "conceptual | procedural | skill_based | mixed",
  "template_family": "string",
  "transformation_type": "adapt | rescale | rebuild"
}
```

---

## 6.2 pedagogical_rationale

מסביר למה נבחר מבנה השיעור.

```json
{
  "short_rationale": "string",
  "learning_goal": "string",
  "why_this_template": "string",
  "principles_used": ["active_learning", "reflective_learning"],
  "instructor_emphases_reflected": []
}
```

---

## 6.3 teacher_guide

דף עבודה למרצה.

```json
{
  "overview": "string",
  "before_class": ["string"],
  "during_class_focus": ["string"],
  "facilitation_tips": ["string"],
  "watch_points": ["string"],
  "adaptation_options": ["string"]
}
```

מטרה: לאפשר למרצה להבין במהירות איך להפעיל את השיעור.

---

## 6.4 student_guide

דף הנחיות לסטודנטים.

```json
{
  "opening_message": "string",
  "what_you_will_do": ["string"],
  "expected_outputs": ["string"],
  "working_norms": ["string"],
  "submission_instructions": ["string"]
}
```

מטרה: להפוך את השיעור לברור ללומדים, במיוחד כאשר יש עבודה עצמאית, זוגית או קבוצתית.

---

## 6.5 lesson_script

תסריט פעולה למרצה ברמת פירוט בינונית.

```json
[
  {
    "step_title": "string",
    "duration_minutes": 10,
    "lecturer_instruction": "string",
    "sample_questions": ["string"],
    "expected_student_output": "string"
  }
]
```

רמת הפירוט הרשמית בשלב זה: **B — שלבים + הנחיות + שאלות לדוגמה**.

---

## 6.6 flow_draft

טיוטת Flow למערכת.

```json
{
  "template_family": "string",
  "nodes": [
    {
      "stageLabel": "opening",
      "title": "string",
      "duration_minutes": 10,
      "botMode": "none | course_support | task_support | reflection_support",
      "expectedOutputs": ["string"],
      "gate": null
    }
  ]
}
```

חשוב: זה אינו ה-flow הסופי. Lesson Flow Engine אחראי להעשיר אותו ב-resources, activities, ids ו-runtime defaults.

---

## 6.7 pre_class

פעולות הכנה לפני השיעור.

```json
[
  {
    "title": "string",
    "type": "reading | video | question | short_task | none",
    "instruction": "string",
    "estimated_minutes": 10,
    "required": false
  }
]
```

---

## 6.8 post_class

פעולות המשך אחרי השיעור.

```json
[
  {
    "title": "string",
    "type": "reflection | practice | submission | extension",
    "instruction": "string",
    "estimated_minutes": 15,
    "required": false
  }
]
```

---

## 6.9 resources_plan

תכנון משאבים וחומרים.

```json
[
  {
    "resource_role": "trigger | example | evidence | worksheet | rubric | slide | form",
    "description": "string",
    "source": "existing | generate | optional",
    "linked_node": "node_key_or_stageLabel"
  }
]
```

מטרה: להבחין בין משאבים קיימים לבין משאבים שהמערכת צריכה לייצר או להציע.

---

## 6.10 assessment

הערכה מעצבת / מסכמת / רפלקטיבית.

```json
{
  "assessment_type": "none | formative | summative | reflective | mixed",
  "criteria": [
    {
      "criterion": "string",
      "evidence": "string",
      "level": "basic | good | strong"
    }
  ],
  "rubric_needed": false,
  "feedback_mode": "self | peer | lecturer | bot | mixed"
}
```

---

## 6.11 reflection

רכיב רפלקציה.

```json
{
  "reflection_prompt": "string",
  "student_output": "string",
  "teacher_use": "string"
}
```

---

## 6.12 skills_alignment

מיפוי למיומנויות רוחב.

```json
[
  {
    "skill": "critical_thinking",
    "where_it_appears": "guided discussion",
    "evidence": "reasoned claim",
    "development_mode": "practice | reflection | collaboration"
  }
]
```

---

## 6.13 export_targets

יעדי ייצוא עתידיים.

```json
[
  {
    "target": "google_doc | google_form | slides | moodle | padlet | pdf | notion",
    "artifact": "teacher_guide | student_guide | form_spec | slide_outline | rubric",
    "status": "planned | ready | not_supported"
  }
]
```

---

## 6.14 pack_report

דוח פנימי לשקיפות ובקרה.

```json
{
  "generated_from": ["selector", "principles", "compiler_template"],
  "template_family": "string",
  "principles": [],
  "constraints_applied": [],
  "preferences_applied": [],
  "warnings": [],
  "missing_elements": []
}
```

---

## 7. Minimal v0 Output

בשלב הקרוב, אין חובה לממש את כל הרכיבים.

הפלט המינימלי התקף הוא:

```json
{
  "lesson_script": [],
  "flow_draft": {},
  "lesson_pack_draft": {
    "teacher_guide": {},
    "student_guide": {},
    "assessment": {},
    "reflection": {},
    "resources_plan": [],
    "export_targets": []
  },
  "compilation_report": {}
}
```

---

## 8. החלטות מחייבות

### החלטה #1
Compiler אינו רק script generator. הוא Lesson Pack Compiler.

### החלטה #2
Lesson script ו-flow draft הם רק שני רכיבים בתוך Lesson Pack רחב יותר.

### החלטה #3
Teacher guide ו-student guide הם first-class artifacts, גם אם בשלב v0 הם placeholders.

### החלטה #4
Assessment, reflection ו-resources plan חייבים להופיע במבנה הפלט, גם אם חלקם ריקים בשלבי MVP.

### החלטה #5
Export targets אינם מבוצעים בשלב זה, אך הם צריכים להיות מיוצגים כדי לאפשר אינטגרציה עתידית.

---

## 9. יחס ל-lesson_compiler.js

בשלב הקרוב יש לעדכן את `functions/lesson_compiler.js` כך ש:

- ישמור על הפלט הקיים: `lesson_script`, `flow_draft`, `compilation_report`
- יוסיף `lesson_pack_draft`
- יוסיף metadata בסיסי לתבניות
- יוסיף placeholders ל-teacher/student/assessment/reflection/resources/export
- לא ינסה עדיין לייצר Google Docs, Forms או Slides בפועל

---

## 10. פסק דין

Lesson Pack הוא האובייקט הפדגוגי המלא שמחבר בין החלטה, תסריט, משאבים, הנחיות, הערכה ו-runtime.

הוא מאפשר ל-MilEd.One לעבור מיצירת Flow בלבד ליצירת תיק הוראה שניתן באמת להשתמש בו בכיתה.
