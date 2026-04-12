# Gatekeeping Execution Checklist

## מטרה

מסמך הרצה קצר לסגירת תהליך Gatekeeping מקצה לקצה.

סטטוסים:

- DONE: הושלם ומאומת
- IN_PROGRESS: בביצוע
- BLOCKED: דורש תנאי סביבה
- DEFERRED: חסם ידוע לטיפול בהמשך
- TODO: טרם בוצע

## מצב נוכחי

- DONE: UI תור מרצה + bulk + stop/retry/export
- DONE: הקשחת evaluate עם Firebase Bearer token + actor mismatch guard
- DONE: rate limiting ל-evaluate ול-webhook
- DONE: queue_by_course עם סינון + pagination
- DONE: audit_by_course + CSV export
- DONE: smoke:gatekeeping
- DONE: test:gatekeeping:auth-negative ב-Strict עם webhook secret מוגדר
- DONE: test:gatekeeping:integration במצב local controlled (`GATEKEEPING_ALLOW_LEGACY_ACTOR=true`)
- DONE: smoke מלא (`smoke:skills`, `smoke:contracts`, `smoke:gatekeeping`)

## Checklist לסגירה מלאה

1. DEFERRED: להריץ אינטגרציה ב-Strict מלא (ללא legacy mode)
- נדרש: `GATEKEEPING_BEARER_TOKEN` + `GATEKEEPING_ACTOR_ID` תואם token.
- פקודה: `npm run test:gatekeeping:integration`
- תנאי הצלחה: submit/evaluate/status/queue עוברים עם סטטוס 0.
- הערה: חסם תפעולי בלבד (השגת token/uid). לא חוסם המשך פיתוח ובדיקות שאינן תלויות זהות.

2. IN_PROGRESS: לקבע webhook secret בסביבת הרצה
- נדרש: `GATEKEEPING_WEBHOOK_SECRET` (staging + production).
- מצב: מקומית בוצע ואומת. נדרש קיבוע גם ב-staging וב-production.
- תנאי הצלחה: Negative test לא מדלג על secret assertion בכל סביבת יעד.

3. DONE: להריץ negative auth ב-Strict עם secret אמיתי
- פקודה: `npm run test:gatekeeping:auth-negative`
- תנאי הצלחה: evaluate ללא token מחזיר 403, webhook secret שגוי מחזיר 403.

4. TODO: בדיקת bulk עומס
- להריץ batch של עשרות evaluate רצופים מתור מרצה.
- תנאי הצלחה: UI נשאר יציב, failures מנוהלים דרך retry, אין שגיאות שרת קריטיות.

5. TODO: ולידציה פונקציונלית ב-Live UI
- מסכים: `micro_cockpit.html`, `lesson_view.html`.
- תרחישים: submit -> evaluate -> unlock gating -> complete sprint.
- תנאי הצלחה: gating חוסם/פותח לפי unlockState בפועל.

6. DONE: רגרסיה רוחבית
- פקודות: `npm run smoke:skills`, `npm run smoke:contracts`, `npm run smoke:gatekeeping`.
- תנאי הצלחה: כל ה-smoke ירוקים.

7. IN_PROGRESS: איסוף ראיות audit לפריסה
- לייצא CSV לדגימה ולוודא שדות actor/decision/stage קיימים.
- מצב: בוצעה הפקת דגימה מקומית ונשמר קובץ `scripts/output/gatekeeping_audit_sample.csv`.
- תנאי הצלחה: קובץ audit עקבי וניתן לבדיקה תפעולית גם בסביבת יעד.

8. TODO: נעילת תיעוד סטטוס
- לעדכן `docs/IMPLEMENTATION_SCHEMA_PLAN.md` לסטטוס final.
- תנאי הצלחה: אין סעיפי gatekeeping פתוחים ללא owner.

9. TODO: הרצת staging pre-deploy
- לבצע runbook check קצר: auth, rate-limit, queue, export.
- תנאי הצלחה: כל ה-checks עוברים בסביבת staging.

10. TODO: פריסה וניטור לאחר פריסה
- חלון ניטור 24 שעות לשגיאות evaluate/webhook/timeouts.
- תנאי הצלחה: ללא עלייה חריגה בשגיאות 4xx/5xx.

## תנאי סגירה (Definition of Done)

- אינטגרציה Strict עוברת ללא legacy mode.
- Negative auth עובר עם webhook secret מוגדר.
- כל smoke tests עוברים.
- Audit CSV נבדק בפועל.
- תיעוד סטטוס מעודכן וסגור.

## סטטוס החלטה

- הוחלט להמשיך קדימה עם הסעיפים הלא-חסומים.
- חסם ה-Strict token מסומן כ-Deferred לטיפול המשכי.
