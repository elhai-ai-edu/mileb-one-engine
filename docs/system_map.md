# System Structure Map

מטרת המסמך:
למפות את שכבות המערכת ולחבר בין המסמכים לבין היישום בפועל.

---

## טבלת שכבות

| שכבה | מסמך | תפקיד |
|------|-------|--------|
| חוקה | DOCUMENT A – Cognitive Effort & Analytic Integrity Framework | עקרונות לא משתנים |
| מבנה SP | DOCUMENT B – Architectural SP Structure | שלד חוקתי מחייב לכל בוט |
| משתנים | DOCUMENT C – System Mapping Framework | מיפוי תפעולי למשתנים |
| שאלון | DOCUMENT D – Questionnaire | איסוף נתונים ותרגומם למשתנים |
| SPI | DOCUMENT E – System Prompt Instance | מופע בוט ספציפי |
| יישום | Implementation Spec | חיבור לקוד ול-config |

---

## היררכיה לוגית

חוקה  
↓  
מבנה SP  
↓  
משתנים  
↓  
שאלון  
↓  
SPI  
↓  
config.json  
↓  
chat.js  
↓  
מודל

---

## עיקרון מערכת

יש מנוע אחד.

כל הבוטים הם תצורות (SPI) של אותו מנוע.

אין מנועים מקבילים.
אין חוקים מקומיים.
אין עקיפת ליבה.
