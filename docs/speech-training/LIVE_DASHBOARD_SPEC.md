# Live Dashboard — Speech Training System

## 1. Purpose

The dashboard is a **real-time decision support system** for the instructor.

It answers:

> מה קורה בכיתה עכשיו?

---

## 2. Core Design Principle

Do NOT show raw data.
Show:

```text
Signal → Meaning → Suggested Action
```

---

## 3. Main Screen Layout

### 🔹 Top Bar (Class Status)

- % speaking now
- avg fluency
- avg confidence

Example:

"78% מהסטודנטים מדברים | שטף בינוני | ביטחון בינוני"

---

### 🔹 Student Cards (Grid)

Each student:

- Name
- Status color
- 3 indicators

#### Status Colors

🟢 Active (speaking well)
🟡 Hesitating
🔴 Silent
🔵 Strong performer

---

### 🔹 Per Student Metrics

Show only:

- Fluency (Low / Medium / High)
- Confidence (Low / Medium / High)
- Latency (Fast / Slow)

NOT numbers

---

## 4. Real-Time Alerts (Right Panel)

System pushes only critical insights:

### Examples:

- "5 students are silent"
- "High hesitation detected"
- "Class is ready for challenge"

---

## 5. Suggested Actions (MOST IMPORTANT)

Each alert comes with ONE action:

### Example:

Alert:
"Many students are silent"

Action:
"כולם — משפט אחד: מה הבעיה שלכם"

---

## 6. Instructor Action Buttons

Quick triggers:

- Quick Start Round
- Add Challenge Question
- Reduce Difficulty
- Assign Audience Question

---

## 7. Roleplay Status Panel

Shows:

- current scenario
- difficulty level
- mode (supportive / challenging)

---

## 8. Intervention Engine Mapping

| Signal | Dashboard Alert | Action |
|-------|----------------|--------|
| silence | many silent | one sentence round |
| high latency | hesitation | opening sentence |
| low fluency | fragmented speech | structure frame |
| high performance | ready challenge | critical question |

---

## 9. Minimal UI Rule

Less is more.

Max:
- 3 alerts
- 3 actions

---

## 10. Technical Hook

Data source:

- speechMetricsEngine
- roleplayState
- adaptiveEngine

Render loop:

```js
onMetricsUpdate → aggregate → classify → renderDashboard
```

---

## 11. Success Criteria

Instructor:
- looks once
- understands immediately
- acts within 3 seconds

---

## 12. Anti-Patterns

Do NOT:

- show raw numbers
- show graphs
- overload screen
- require interpretation

---

## 🎯 Final Goal

Dashboard is not analytics.

It is:

→ a decision engine
→ a teaching assistant
→ a real-time cognitive amplifier
