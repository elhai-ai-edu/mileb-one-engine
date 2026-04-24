# LESSON FLOW BUILDER INTEGRATION SPEC

## MilEd.One

**גרסה:** v0.1 (Implementation Draft)  
**תאריך:** 2026-04-24  
**סטטוס:** Ready for initial builder implementation

---

## 1. מטרת המסמך

מסמך זה מגדיר את שכבת ה-Builder שמתרגמת `lesson_pack_draft` לאובייקט ריצה קנוני: `canonical_lesson_flow`.

ה-Compiler מייצר תכנון פדגוגי עשיר. ה-Builder הופך אותו למבנה יציב שה-runtime יכול להריץ.

```text
Lesson Pack Draft
→ Lesson Flow Builder
→ Canonical Lesson Flow
→ Runtime
```

---

## 2. החלטה מחייבת: Builder עם Gates

המערכת תתחיל כבר בגרסת v0 עם תמיכה ב-gates.

כלומר, ה-flow אינו רק לינארי, אלא יכול לכלול תנאי מעבר:

```text
node → gate check → next node
```

---

## 3. קלט ה-Builder

הקלט המרכזי הוא:

```json
{
  "lesson_pack_draft": {
    "metadata": {},
    "flow_draft": {},
    "bot_plan": [],
    "resources_plan": [],
    "assessment": {},
    "reflection": {}
  }
}
```

ה-Builder צריך להמשיך לתמוך גם בקלט ישיר של `flow_draft` לצורכי בדיקות.

---

## 4. פלט ה-Builder

```json
{
  "canonical_lesson_flow": {
    "lesson_id": "string",
    "metadata": {},
    "nodes": [],
    "edges": [],
    "runtime_defaults": {},
    "bot_bindings": [],
    "resource_bindings": [],
    "assessment_plan": {},
    "reflection_plan": {}
  },
  "build_report": {}
}
```

---

## 5. אחריות ה-Builder

## 5.1 Stable Runtime IDs

ה-Builder מייצר מזהים יציבים ל-nodes:

```text
node_001, node_002, node_003
```

הוא שומר גם את `draft_node_id` המקורי לצורך traceability.

---

## 5.2 Node Normalization

כל node חייב לכלול:

- node_id
- node_key
- stageLabel
- title
- duration_minutes
- expectedOutputs
- gate
- bot_binding_ref
- resource_refs
- runtime

---

## 5.3 Gate Handling

Gate יכול להיות:

- null
- completion_required
- evidence_required

כל Gate מקבל מצב runtime התחלתי:

```json
{
  "status": "open | locked | pending_evidence",
  "evidence_required": "string | null"
}
```

---

## 5.4 Edge Generation

בגרסת v0 ה-flow לינארי עם gates:

```text
node_001 → node_002 → node_003
```

אבל edge יכול לכלול gate condition:

```json
{
  "from": "node_002",
  "to": "node_003",
  "condition": {
    "type": "evidence_required",
    "evidence": "student_output"
  }
}
```

---

## 5.5 Bot Binding

ה-Builder מחבר בין:

```text
flow_draft.nodes[].bot_binding_ref
```

לבין:

```text
lesson_pack_draft.bot_plan[]
```

אם binding חסר, ה-Builder משאיר warning ולא נכשל.

---

## 5.6 Resource Binding

ה-Builder מחבר משאבים לפי:

- linked_node
- node_key
- stageLabel

בשלב v0 זה binding בסיסי בלבד.

---

## 6. Runtime Defaults

```json
{
  "active_node_id": "node_001",
  "status": "draft",
  "progression_mode": "gated_linear",
  "gate_policy": "respect_node_gates"
}
```

---

## 7. Build Report

ה-Builder חייב להחזיר דוח:

- מספר nodes
- מספר gates
- מספר bot bindings
- מספר resources
- warnings
- missing bindings

---

## 8. יחס ל-classroom.js

בשלב הבא `classroom.js` יוכל לקרוא:

```js
buildCanonicalLessonFlow({ lesson_pack_draft })
```

ולשמור את התוצאה ב-Firebase/session state.

---

## 9. פסק דין

Lesson Flow Builder הוא הגשר בין תכנון פדגוגי עשיר לבין runtime. הוא אינו מחליט מה ללמד ואינו מייצר תסריט; הוא הופך Lesson Pack למבנה יציב שניתן להרצה, לנעילה, לפתיחה ולמעקב.
