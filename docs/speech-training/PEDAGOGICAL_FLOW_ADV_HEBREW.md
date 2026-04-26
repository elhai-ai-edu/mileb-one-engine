# Pedagogical Flow — Advanced Hebrew Presentation (In-Class Execution)

## 1. Purpose

This document defines the real-time pedagogical flow for running a class session using the Speech Training System.

Focus:
- active speaking
- client-oriented thinking
- real-time interaction
- structured feedback

---

## 2. Core Flow Structure

```text
Preparation → Roleplay → Presentation → Audience Questions → Feedback → Iteration
```

---

## 3. Stage 1 — Preparation (with Bot)

### Goal
Students prepare their presentation through guided speaking.

### Bot Behavior
- supportive
- slow pacing
- one question at a time

### Bot Script

1. "מה הבעיה שאתה רוצה להציג?"
2. "למי הבעיה הזו חשובה?"
3. "מה הפתרון שאתה מציע?"
4. "למה הפתרון שלך עדיף על מה שקיים היום?"

### Constraints
- speech required
- minimum 15 seconds per answer

---

## 4. Stage 2 — Roleplay Simulation (Client Mode)

### Goal
Simulate a real client conversation.

### Bot Role
"לקוח שמתעניין בפתרון"

### Bot Behavior
- slightly challenging
- asks follow-up questions

### Example Turns

- "אני לא בטוח שהבעיה הזו מספיק חשובה — תסביר למה כן"
- "מי בדיוק ישלם על זה?"
- "מה היתרון שלך על פתרונות אחרים?"

---

## 5. Stage 3 — Presentation (Classroom)

### Goal
Deliver structured oral presentation

### Structure (mandatory)

1. Problem
2. Target audience
3. Solution
4. Advantage

### Constraints
- 2–3 minutes speaking
- no reading from text

---

## 6. Stage 4 — Audience Questions

### Goal
Train response under pressure

### Audience Roles

- BASIC group
- CLIENT group
- CRITICAL group

### Question Types

BASIC:
- "מה הבעיה בדיוק?"

CLIENT:
- "למה שאני אשלם על זה?"

CRITICAL:
- "למה שזה יעבוד?"

---

## 7. Stage 5 — Feedback

### Goal
Provide focused improvement

### Source
- bot + instructor

### Focus Areas (max 3)
- clarity
- fluency
- response to questions

### Example Feedback

"ההצגה שלך הייתה ברורה, אבל כדאי להוסיף דוגמה אמיתית כדי לחזק את הטענה"

---

## 8. Stage 6 — Iteration

### Goal
Second attempt with improvement

### Instruction

"נסה להציג שוב את הרעיון שלך, הפעם עם דגש על נקודה אחת לשיפור"

---

## 9. Instructor Role

The instructor should:
- monitor speaking engagement
- trigger interventions when needed
- maintain pacing
- avoid over-correcting during speaking

---

## 10. System Integration Notes

- Stage 1 → speechMetrics + low difficulty
- Stage 2 → roleplayEngine active
- Stage 3 → speech only, no bot interruption
- Stage 4 → audienceQuestionEngine
- Stage 5 → presentationRubricEngine

---

## 11. Pedagogical Principle

> The system does not replace the student’s thinking.
> It structures effort, pressure, and reflection.
