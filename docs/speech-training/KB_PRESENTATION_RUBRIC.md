# KB_PRESENTATION_RUBRIC (Speech & Presentation Evaluation Framework)

## 1. Purpose
This Knowledge Base defines a structured rubric for evaluating student presentations in a problem–solution format.

It is designed to work with:
- speech-based interaction
- role-play simulations
- classroom presentations

Core principle:

> Evaluation must support learning, not replace it.

---

## 2. Evaluation Dimensions

Each presentation is evaluated across 5 core dimensions.

---

### 2.1 PROBLEM CLARITY

Question:
> האם הבעיה ברורה ומשכנעת?

Levels:
- 1 — לא ברור
- 2 — חלקית ברור
- 3 — ברור
- 4 — ברור ומשכנע

---

### 2.2 SOLUTION QUALITY

Question:
> האם הפתרון מתאים לבעיה?

Levels:
- 1 — לא מתאים
- 2 — חלקית מתאים
- 3 — מתאים
- 4 — מתאים ומשכנע

---

### 2.3 STRUCTURE

Question:
> האם ההצגה בנויה בצורה מסודרת?

Expected Structure:
1. בעיה
2. קהל יעד
3. פתרון
4. יתרון

Levels:
- 1 — לא מסודר
- 2 — חלקית מסודר
- 3 — מסודר
- 4 — מסודר מאוד וזורם

---

### 2.4 SPEECH FLUENCY

Measured via system signals.

Indicators:
- pauses
- continuity
- sentence completion

Levels:
- 1 — עצירות רבות
- 2 — שטף נמוך
- 3 — שטף טוב
- 4 — שטף גבוה מאוד

---

### 2.5 RESPONSE TO QUESTIONS

Question:
> איך הסטודנט מגיב לשאלות?

Indicators:
- response time
- clarity
- confidence

Levels:
- 1 — מתקשה לענות
- 2 — עונה חלקית
- 3 — עונה בצורה טובה
- 4 — עונה בביטחון ומשכנע

---

## 3. Scoring Model

```js
score = average(all dimensions)
```

Optional weighting:

```js
score = (problem * 0.2 + solution * 0.2 + structure * 0.2 + fluency * 0.2 + response * 0.2)
```

---

## 4. Feedback Templates

### Positive
- "ההצגה שלך הייתה ברורה מאוד"
- "הפתרון שלך משכנע"
- "התגובה לשאלות הייתה טובה"

### Improvement
- "נסה להסביר את הבעיה בצורה ברורה יותר"
- "הוסף דוגמה אמיתית"
- "שמור על רצף בדיבור"

---

## 5. Bot Usage Instructions

The bot should:

1. Evaluate only after full presentation
2. Use 2–3 dimensions max per feedback (avoid overload)
3. Provide short, constructive feedback
4. Avoid numeric scoring unless explicitly required

---

## 6. Dashboard Integration

Each dimension can be mapped to dashboard signals:

- fluency → speech metrics
- response → latency + confidence
- structure → detected sequence

---

## 7. Pedagogical Value

Supports:
- clear expectations
- structured improvement
- reflective learning

---

## 8. Research Implications

Enables:
- tracking speaking development
- linking fluency to performance
- evaluating intervention impact

---

## 9. Design Constraint

The rubric must:
- remain simple
- avoid cognitive overload
- support growth, not judgment
