# PEDAGOGICAL STRUCTURE EXTRACTOR SPEC

## MilEd.One

**גרסה:** v0.1 (Design + Implementation Draft)  
**תאריך:** 2026-04-24  
**סטטוס:** Ready for initial implementation

---

## 1. מטרת המסמך

מסמך זה מגדיר את שכבת ה־Pedagogical Structure Extractor.

מטרת השכבה היא לזהות בתוך חומרי הוראה קיימים — כגון Padlet, סילבוס, מסמך שיעור, דף משימות, או תוצרי סטודנטים — את המבנה הפדגוגי שכבר קיים בפועל, לפני שהמערכת מנסה לבנות שיעור מחדש.

```text
Input Material
→ Pedagogical Structure Extractor
→ Enriched Decision / Detected Lesson Structure
→ Lesson Pack Compiler
→ Lesson Flow Builder
→ Runtime
```

---

## 2. עקרון-העל

המערכת לא צריכה תמיד להמציא שיעור חדש.

כאשר חומר קיים כבר מכיל רצף הוראה חכם, המערכת צריכה קודם כל לזהות אותו, לשמר אותו, ולתרגם אותו למבנה קנוני.

```text
Do not replace existing pedagogy.
Detect it, formalize it, then enhance it.
```

---

## 3. הבעיה שה־Extractor פותר

המערכת הנוכחית יודעת:

- לבחור template
- לייצר Lesson Pack Draft
- לבנות canonical flow

אבל ללא Extractor היא עלולה להתעלם מהפדגוגיה שכבר קיימת בחומר המקורי.

דוגמה: Padlet של שיעור מבוא למדעי החברה כבר כולל רצף ברור:

```text
מי אני
→ מי אנחנו
→ מי זו עליזה
→ מה זה מדעי החברה
→ אוצר מילים
→ מה למדתי
```

זהו רצף פדגוגי אינדוקטיבי־חברתי, ולא רק אוסף תגובות.

---

## 4. תפקיד ה־Extractor

ה־Extractor מחלץ:

1. כותרות / משימות / מקטעים
2. סוג הפעילות בכל מקטע
3. מטרת הלמידה המשוערת
4. דפוס פדגוגי כולל
5. חוזקות של התהליך הקיים
6. פערים או רכיבים חסרים
7. המלצה ל־template_family
8. אובייקט decision מועשר לקומפיילר

---

## 5. קלט

```json
{
  "source_type": "padlet | syllabus | lesson_doc | worksheet | transcript | mixed",
  "title": "string",
  "raw_text": "string",
  "external_resources": [],
  "context": {}
}
```

---

## 6. פלט קנוני

```json
{
  "detected_structure": [
    {
      "stage_id": "identity",
      "label": "מי אני",
      "type": "personal_expression",
      "learning_goal": "בניית ביטחון וזהות אישית",
      "evidence": ["מי אני"],
      "suggested_gate": {
        "type": "completion_required",
        "evidence": "self_description"
      }
    }
  ],
  "pedagogical_pattern": "inductive_social_learning",
  "strengths": [],
  "gaps": [],
  "recommended_template_family": "inductive_peer_learning",
  "enriched_decision": {}
}
```

---

## 7. Stage Types v0

```json
[
  "personal_expression",
  "social_construction",
  "narrative_abstraction",
  "student_generated_concept",
  "linguistic_processing",
  "metacognitive_reflection",
  "practice",
  "assessment",
  "unknown"
]
```

---

## 8. Pattern Detection v0

### inductive_social_learning

מזוהה כאשר החומר כולל מעבר:

```text
פרט אישי
→ קבוצה
→ סיפור/דוגמה
→ מושג כללי
→ רפלקציה / שפה
```

### scaffolded_skill_learning

מזוהה כאשר החומר כולל:

```text
דוגמה
→ פירוק
→ תרגול מודרך
→ תרגול עצמאי
→ משוב/רפלקציה
```

### problem_based_inquiry

מזוהה כאשר החומר כולל:

```text
בעיה / דילמה
→ שאלות חקר
→ בדיקת ראיות
→ הצעה / פתרון
→ רפלקציה
```

---

## 9. שילוב עם Selector

ה־Extractor אינו מחליף את ה־Selector.

הוא מייצר קלט מועשר עבורו:

```text
Extractor = What is already here?
Selector = What transformation is needed?
Compiler = How to package it as a lesson?
Builder = How to run it?
```

---

## 10. שילוב עם Lesson Pack Compiler

ה־Extractor יכול להציע:

```json
{
  "template_family": "inductive_peer_learning",
  "pedagogical_actions": [
    "preserve_existing_sequence",
    "add_peer_explanation",
    "add_reflection_closure"
  ]
}
```

הקומפיילר ישתמש בכך כדי לא לבנות תבנית חדשה מאפס, אלא לשמר את רצף השיעור שכבר קיים.

---

## 11. החלטות מחייבות

### החלטה #1
Extractor must run before rebuilding when rich source material exists.

### החלטה #2
Detected structure should be traceable to source headings / phrases.

### החלטה #3
The system should prefer preserving an effective teacher-designed sequence over replacing it with a generic template.

### החלטה #4
The Extractor must output both human-readable interpretation and machine-readable structure.

---

## 12. Implementation v0

קובץ מוצע:

```text
functions/pedagogical_structure_extractor.js
```

פונקציה ראשית:

```js
extractPedagogicalStructureFromContent(input)
```

בשלב v0 הזיהוי יהיה rule-based:

- זיהוי כותרות
- מיפוי ביטויים לסוגי stages
- זיהוי pattern כולל
- יצירת enriched decision

בהמשך ניתן להוסיף LLM-based extraction.

---

## 13. פסק דין

Pedagogical Structure Extractor הוא הרכיב שמאפשר ל־MilEd.One ללמוד מתוך הוראה קיימת.

הוא מונע מהמערכת להיות מחולל שיעורים גנרי, והופך אותה למערכת שמזהה, משמרת ומפעילה אינטליגנציה פדגוגית שכבר קיימת אצל המרצה.
