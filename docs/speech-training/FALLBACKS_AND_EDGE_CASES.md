# Fallbacks & Edge Cases — Advanced Hebrew Speech Training

## 1. Purpose

This document defines what the system, instructor, and bot should do when the speech-training lesson does not progress smoothly.

The goal is not to prevent all breakdowns, but to convert breakdowns into productive learning moments.

Core principle:

> A failure in speech performance is not a system failure. It is often the exact learning moment the system is designed to surface.

---

## 2. Global Fallback Logic

Every fallback should follow this sequence:

```text
Detect → Reduce load → Give one clear action → Return to speaking
```

Do not over-explain.
Do not replace the student's answer.
Do not let the activity collapse into written text.

---

## 3. Edge Case: Student Is Silent

### Signal
- no speech input
- speechDuration = 0
- repeated empty response

### Bot Response

```text
אין בעיה. נתחיל ממש קטן.
תגיד/י רק משפט אחד: מה הבעיה שבחרת?
```

### Instructor Action
- lower difficulty
- allow 10 seconds of preparation
- ask for one sentence only

### System Action
- mark status: `silent`
- do not complete stage
- trigger quick-start practice if repeated

---

## 4. Edge Case: Student Uses Typed Text Instead of Speech

### Signal
- inputType = text
- stage requires speech

### Bot Response

```text
הטקסט ברור, אבל בשלב הזה המטרה היא תרגול דיבור.
נסה/י לומר את אותו רעיון בקול, אפילו במשפט קצר.
```

### System Action
- block completion
- preserve typed text as draft only
- ask for spoken version

---

## 5. Edge Case: Student Reads from Prepared Text

### Signal
- very long, perfect, written-like answer
- no pauses
- unnatural structure

### Bot Response

```text
זה נשמע מוכן מאוד. עכשיו נתרגל דיבור טבעי יותר:
נסה/י להסביר את אותו רעיון במילים פשוטות, בלי לקרוא.
```

### Instructor Action
- ask for shorter version
- require eye contact / no reading

### System Action
- mark possible `reading_mode`
- request paraphrased spoken attempt

---

## 6. Edge Case: High Latency / Long Hesitation

### Signal
- timeToStartSpeaking > 6 seconds

### Bot Response

```text
קח/י רגע. תתחיל/י במשפט פתיחה פשוט:
"הבעיה שבחרתי היא..."
```

### Instructor Action
- run quick-start round
- all students say only opening sentence

### System Action
- recommend intervention: `quick_start_practice`
- temporarily reduce difficulty

---

## 7. Edge Case: Very Low Fluency

### Signal
- fluency < 0.4
- many fillers
- fragmented answer

### Bot Response

```text
יש לך רעיון, עכשיו נעזור לו לצאת יותר מסודר.
נסה/י שוב לפי מבנה קצר: בעיה → פתרון → למי זה עוזר.
```

### Instructor Action
- use 3-part speaking frame
- give 30 seconds preparation

### System Action
- recommend: `structure_practice`
- keep role-play difficulty low

---

## 8. Edge Case: Student Answers Too Briefly

### Signal
- fewer than 10 words
- speechDuration < minimum

### Bot Response

```text
זו התחלה טובה.
תוסיף/י עכשיו דוגמה אחת מהחיים שמראה למה זו בעיה.
```

### System Action
- do not complete turn
- request expansion

---

## 9. Edge Case: Audience Does Not Ask Questions

### Signal
- no audience questions after presentation

### Bot / Instructor Prompt

```text
נבחר שאלה מוכנה.
קבוצה אחת תשאל שאלת לקוח:
"למה שאני אשתמש בפתרון שלך?"
```

### Instructor Action
- assign categories: BASIC / CLIENT / CRITICAL
- nominate one group, not one student

### System Action
- call audienceQuestionEngine
- produce one question only

---

## 10. Edge Case: Audience Questions Are Too Harsh

### Signal
- student freezes
- question attacks student rather than idea

### Instructor Response

```text
ננסח את זה כשאלה על הרעיון, לא על האדם.
במקום "זה לא טוב", נשאל: "מה יכול לגרום לזה לא לעבוד?"
```

### System Rule
- keep questions idea-focused
- avoid personal criticism

---

## 11. Edge Case: Bot Becomes Too Explanatory

### Signal
- bot gives long teaching explanation during roleplay

### Correction Rule

Bot must return to role:

```text
אני חוזר לתפקיד הלקוח.
השאלה שלי היא: למה הפתרון שלך מתאים לי?
```

### System Guard
- role integrity guard
- no teaching during active role-play

---

## 12. Edge Case: Bot Gives the Student the Answer

### Signal
- bot drafts full presentation or complete response

### Correction Rule

```text
אני לא אנסח את זה במקומך.
אני אשאל שאלה שתעזור לך לבנות את זה:
מה המשפט הראשון שלך על הבעיה?
```

### System Guard
- agency preservation guard
- no full-solution substitution

---

## 13. Edge Case: Speech Recognition Fails

### Signal
- microphone error
- no transcript
- browser unsupported

### Bot/System Response

```text
נראה שהזיהוי הקולי לא עבד כרגע.
אפשר לנסות שוב. אם זה לא עובד, הקלט/י או אמור/י את התשובה מול המורה, והמערכת תמשיך במצב גיבוי.
```

### System Action
- keep activity alive
- allow instructor override only as fallback
- mark input as `speech_unverified_fallback`

---

## 14. Edge Case: Class Time Is Running Out

### Instructor Action
Use compressed protocol:

```text
כל מציג נותן:
1. משפט בעיה
2. משפט פתרון
3. תשובה לשאלת לקוח אחת
```

### System Mode
- `compressed_presentation_mode`
- no extended feedback
- one improvement point only

---

## 15. Edge Case: Strong Student Needs More Challenge

### Signal
- fluency > 0.75
- confidence > 0.7
- strong response to questions

### Bot Response

```text
עכשיו שאלה קשה יותר:
מה החולשה המרכזית של הפתרון שלך, ואיך תתמודד איתה?
```

### System Action
- increase difficulty by one
- activate CRITICAL / PRESSURE question category

---

## 16. Edge Case: Student Is Anxious or Embarrassed

### Signal
- hesitation
- avoidance
- emotional language

### Bot Response

```text
זה בסדר להתחיל קטן.
לא צריך תשובה מושלמת. תגיד/י רק את הרעיון הראשון שעולה לך.
```

### Instructor Action
- reduce public pressure
- allow pair rehearsal before class performance

### System Action
- supportive mode
- no pressure questions

---

## 17. Instructor Intervention Matrix

| Signal | Diagnosis | Instructor Action | System Action |
|---|---|---|---|
| silence | low activation | one-sentence round | quick_start_practice |
| latency > 6 | hesitation | opening sentence drill | reduce difficulty |
| fluency < 0.4 | low fluency | 3-part frame | structure_practice |
| no audience questions | passive audience | assign question category | audience question prompt |
| strong performance | ready for challenge | critical question | increase difficulty |
| typed answer | speech bypass | ask spoken version | block completion |

---

## 18. Design Constraint

Fallbacks must preserve dignity.

Never label a student as weak.
Never expose private metrics publicly.
Never turn speech difficulty into embarrassment.

The system should quietly reduce load, preserve agency, and return the learner to speaking.
