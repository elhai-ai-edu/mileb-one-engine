# BOT LAYER ORCHESTRATION SPEC

## MilEd.One

**גרסה:** v1.0 (Design Draft)  
**תאריך:** 2026-04-24  
**סטטוס:** Pre-implementation specification

---

## 1. מטרת המסמך

מסמך זה מגדיר את שכבת הבוטים / הסוכנים הפדגוגיים במערכת MilEd.One.

המטרה היא להרחיב את מודל השיעור מ־Flow של שלבים בלבד, למודל שבו לכל שלב יכולה להיות תמיכה של סוכן פדגוגי מתאים, עם גבולות פעולה, מקור ידע, ומנגנון מעבר ברור בין מרצה, לומדים ובוט.

```text
Lesson Pack
→ Bot Plan
→ Lesson Flow
→ Runtime Orchestration
```

---

## 2. עקרון-העל

בוט אינו "פיצ'ר" כללי בתוך שיעור.

בוט הוא תפקיד פדגוגי ממוקם בתוך שלב מסוים של תהליך הלמידה.

לכן אין להסתפק בשדה שטוח כמו:

```json
{
  "botMode": "task_support"
}
```

אלא יש להגדיר binding מלא:

```json
{
  "bot_role": "skill_practice_coach",
  "support_mode": "guided_hinting",
  "allowed_actions": [],
  "forbidden_actions": [],
  "kb_scope": [],
  "handoff": {}
}
```

---

## 3. מיקום בארכיטקטורה

המסלול המעודכן:

```text
Principles + Instructor Identity + Instructor Emphases
→ Transformation Selector
→ Lesson Pack Compiler
→ Bot Layer Orchestration
→ Lesson Flow Engine
→ Runtime
```

### החלטה מחייבת #1

Bot Layer אינו מחליף את Lesson Flow Engine. הוא מוסיף לכל node את תכנון הסיוע הפדגוגי.

---

## 4. הבחנה בין Bot Role לבין Support Mode

### Bot Role
מי הבוט מבחינה פדגוגית.

דוגמאות:
- paraphrase_coach
- inquiry_guide
- reflection_guide
- task_coach

### Support Mode
איך הבוט פועל בשלב הנתון.

דוגמאות:
- guided_hinting
- socratic_questioning
- feedback_on_attempt
- reflection_prompting
- evidence_checking

### החלטה מחייבת #2

אותו bot role יכול לפעול בכמה support modes שונים לפי שלב השיעור.

---

## 5. Bot Role Catalog v1

## 5.1 course_explainer

### תפקיד
מסביר מושגים, הקשר ורקע, בלי לבצע משימות עבור הלומד.

### מתאים ל:
- פתיחה
- הבהרת מושגים
- תמיכה בהבנה ראשונית

### אסור לו:
- לכתוב תשובות מלאות
- לבצע ניתוח במקום הסטודנט

---

## 5.2 task_coach

### תפקיד
מלווה ביצוע משימה צעד אחר צעד.

### מתאים ל:
- עבודה עצמאית
- עבודה בזוגות
- משימות כיתה

### אסור לו:
- לדלג על ניסיון של הלומד
- לתת פתרון מלא לפני ניסיון

---

## 5.3 skill_practice_coach

### תפקיד
מאמן מיומנות מדורגת.

### מתאים ל:
- כתיבה
- פרפרזה
- חיפוש מידע
- ניסוח טיעון

### דפוס פעולה
דוגמה → פירוק → ניסיון מודרך → ניסיון עצמאי → משוב.

---

## 5.4 paraphrase_coach

### תפקיד
מאמן פרפרזה אקדמית תוך שמירה על משמעות ושינוי ניסוח.

### מתאים ל:
- קורסי אוריינות אקדמית
- כתיבה בעברית
- עבודה עם משפטים ומקורות

### KB Scope אפשרי
- KB_paraphrase_tools
- KB_hints
- KB_feedback
- KB_errors

### גבולות
אסור להפיק פרפרזה מלאה במקום הסטודנט כאשר זו משימת הלומד.

---

## 5.5 inquiry_guide

### תפקיד
מלווה חקר, ניסוח שאלות, בדיקת ראיות והסקת מסקנות.

### מתאים ל:
- inquiry
- problem-based learning
- mini research

### פעולות מותרות
- לעזור לנסח שאלה
- לבקש ראיות
- להצביע על חוסר בהנמקה

---

## 5.6 reflection_guide

### תפקיד
מלווה רפלקציה, מטא־קוגניציה והפקת תובנות.

### מתאים ל:
- סיכום שיעור
- אחרי ניסיון ביצוע
- אחרי משוב

### פעולות מותרות
- לשאול שאלות רפלקטיביות
- לעזור לדייק כלל אישי
- לעודד זיהוי תהליך למידה

---

## 5.7 peer_discussion_support

### תפקיד
תומך בשיח בין סטודנטים, הסבר עמיתים והשוואת רעיונות.

### מתאים ל:
- peer explanation
- pair work
- debate
- collaborative reasoning

### פעולות מותרות
- לתת פרומפט לשיחה
- לעזור לחלק תפקידים
- להציע שאלת הבהרה

---

## 5.8 assessment_feedback_assistant

### תפקיד
נותן משוב מעצב לפי קריטריונים קיימים.

### מתאים ל:
- בדיקה עצמית
- משוב על ניסיון
- רובריקה קיימת

### גבולות
אין ציון או הערכה מסכמת ללא קריטריונים מפורשים.

---

## 5.9 teacher_runtime_assistant

### תפקיד
מסייע למרצה בזמן ההרצה: תזכורת לשלב, הצעת שאלות, איתור עומס, סיכום מצב.

### מתאים ל:
- cockpit
- classroom runtime
- monitoring

### אינו גלוי בהכרח לסטודנטים.

---

## 6. Support Modes v1

```json
[
  "none",
  "concept_explanation",
  "guided_hinting",
  "socratic_questioning",
  "feedback_on_attempt",
  "evidence_checking",
  "reflection_prompting",
  "peer_prompting",
  "teacher_runtime_support"
]
```

---

## 7. Node-to-Bot Binding Schema

```json
{
  "node_key": "guided_practice",
  "node_id": "optional_runtime_id",
  "bot_role": "skill_practice_coach",
  "support_mode": "guided_hinting",
  "student_visible": true,
  "teacher_visible": true,
  "activation": {
    "trigger": "node_start | student_request | teacher_enable | submission_received",
    "default_state": "enabled | disabled | teacher_only"
  },
  "allowed_actions": [
    "ask_guiding_question",
    "give_hint",
    "check_attempt"
  ],
  "forbidden_actions": [
    "write_full_answer",
    "skip_student_attempt"
  ],
  "kb_scope": [
    "KB_hints",
    "KB_feedback"
  ],
  "handoff": {
    "from": "teacher_runtime",
    "to": "student_practice_bot",
    "trigger": "node_start"
  }
}
```

---

## 8. Allowed Actions Catalog

```json
[
  "ask_guiding_question",
  "give_hint",
  "clarify_instruction",
  "check_attempt",
  "request_evidence",
  "prompt_reflection",
  "suggest_next_step",
  "summarize_student_progress",
  "offer_peer_discussion_prompt",
  "explain_concept_briefly"
]
```

---

## 9. Forbidden Actions Catalog

```json
[
  "write_full_answer",
  "complete_assignment_for_student",
  "skip_required_stage",
  "grade_without_criteria",
  "replace_student_reasoning",
  "provide_final_paraphrase_for_student_task",
  "invent_source_evidence",
  "override_teacher_runtime_decision"
]
```

---

## 10. KB Scope Binding

Bot binding may define which knowledge sources are available to the bot in that node.

### Example

```json
{
  "bot_role": "paraphrase_coach",
  "kb_scope": [
    "KB_paraphrase_tools",
    "KB_hints",
    "KB_feedback",
    "KB_errors"
  ]
}
```

### החלטה מחייבת #3

KB scope is node-specific. A bot should not automatically access all knowledge for all stages.

---

## 11. Handoff Model

Bot orchestration must support transitions:

```text
Teacher introduces
→ Students act
→ Bot supports
→ Students submit / explain
→ Bot reflects or checks
→ Teacher reviews / advances
```

### Handoff Object

```json
{
  "from": "teacher_runtime | student | peer_group | bot_role",
  "to": "bot_role | teacher_runtime | student",
  "trigger": "node_start | student_request | submission_received | gate_met | teacher_advance",
  "message": "optional"
}
```

---

## 12. Integration with Lesson Pack

Lesson Pack should include a `bot_plan` section.

```json
{
  "bot_plan": [
    {
      "node_key": "guided_practice",
      "bot_role": "skill_practice_coach",
      "support_mode": "guided_hinting",
      "student_visible": true,
      "teacher_visible": true,
      "kb_scope": [],
      "allowed_actions": [],
      "forbidden_actions": []
    }
  ]
}
```

---

## 13. Integration with Flow Draft

Each flow node may include either:

### Backward-compatible field

```json
{
  "botMode": "task_support"
}
```

### Future canonical field

```json
{
  "bot_binding_ref": "binding_id"
}
```

### החלטה מחייבת #4

`botMode` remains for compatibility. `bot_plan` / `bot_binding` is the future canonical structure.

---

## 14. Runtime Visibility

Bot bindings may be visible to:

- teacher only
- student only
- both
- system only

### Examples

Teacher-only:
- teacher_runtime_assistant
- pacing assistant

Student-visible:
- paraphrase_coach
- reflection_guide

Both:
- task_coach
- inquiry_guide

---

## 15. Example: Paraphrase Skill Lesson

```json
{
  "bot_plan": [
    {
      "node_key": "opening",
      "bot_role": "course_explainer",
      "support_mode": "concept_explanation",
      "student_visible": false,
      "teacher_visible": true,
      "allowed_actions": ["explain_concept_briefly"],
      "forbidden_actions": ["write_full_answer"]
    },
    {
      "node_key": "guided_practice",
      "bot_role": "paraphrase_coach",
      "support_mode": "guided_hinting",
      "student_visible": true,
      "teacher_visible": true,
      "kb_scope": ["KB_paraphrase_tools", "KB_hints", "KB_errors"],
      "allowed_actions": ["ask_guiding_question", "give_hint", "check_attempt"],
      "forbidden_actions": ["provide_final_paraphrase_for_student_task", "skip_student_attempt"]
    },
    {
      "node_key": "reflection",
      "bot_role": "reflection_guide",
      "support_mode": "reflection_prompting",
      "student_visible": true,
      "teacher_visible": true,
      "allowed_actions": ["prompt_reflection", "summarize_student_progress"],
      "forbidden_actions": ["grade_without_criteria"]
    }
  ]
}
```

---

## 16. Example: Problem-Based Inquiry Lesson

```json
{
  "bot_plan": [
    {
      "node_key": "problem",
      "bot_role": "inquiry_guide",
      "support_mode": "socratic_questioning",
      "allowed_actions": ["ask_guiding_question", "request_evidence"],
      "forbidden_actions": ["provide_final_solution", "replace_student_reasoning"]
    },
    {
      "node_key": "small_group_inquiry",
      "bot_role": "inquiry_guide",
      "support_mode": "evidence_checking",
      "allowed_actions": ["request_evidence", "suggest_next_step"],
      "forbidden_actions": ["invent_source_evidence"]
    }
  ]
}
```

---

## 17. Relation to chat.js

Future runtime behavior in `chat.js` should eventually receive:

- bot_role
- support_mode
- allowed_actions
- forbidden_actions
- kb_scope
- node context
- lesson context

And compose or select the appropriate runtime instruction layer.

### החלטה מחייבת #5

chat.js should not infer bot behavior from botType alone when node-level bot bindings exist.

---

## 18. Implementation Roadmap

### Phase 1 — Spec only
- Define bot roles
- Define binding schema
- Add bot_plan to Lesson Pack spec

### Phase 2 — Compiler placeholders
- lesson_compiler.js emits basic bot_plan per template stage

### Phase 3 — Builder integration
- Lesson Flow Engine links node ids to bot bindings

### Phase 4 — Runtime integration
- classroom / chat runtime reads node-specific bot binding

### Phase 5 — KB binding
- Bot role restricts or selects relevant knowledge sources

---

## 19. פסק דין

שכבת הבוטים הופכת את MilEd.One ממערכת שמייצרת שיעור, למערכת שמנהלת אקוסיסטם של סיוע פדגוגי בתוך השיעור.

היא מגדירה לא רק מה קורה בכל שלב, אלא מי תומך בשלב, איך, עם איזה ידע, ובאילו גבולות.
