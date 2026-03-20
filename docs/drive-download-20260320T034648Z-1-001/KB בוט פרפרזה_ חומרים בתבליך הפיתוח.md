KB בוט פרפרזה:

מצוין. עברתי על כל הגלגולים בקובץ והוצאתי מהם את **הגרסה הקנונית והשלמה ביותר האפשרית כרגע** של המאגר.
המסמך הבא הוא **MASTER KNOWLEDGE BASE v1** — כלומר הגרסה המאוחדת שמרכזת את:

- ארכיטקטורת המאגר
- כל סוגי הידע
- התבנית המלאה ביותר של משפט
- סוגי המשפטים
- Error Bank
- כלי פרפרזה
- מבנה הקורפוס של המשפטים

זה המסמך שאפשר להשתמש בו מעכשיו כ־**בסיס רשמי למאגר הידע של הבוט**.

# **MASTER KNOWLEDGE BASE v1**

## **Paraphrase Trainer Bot**

# **1. מטרת מאגר הידע**

מאגר הידע מספק את שכבת התוכן לבוט הפרפרזה האקדמית.

ה-System Prompt מנהל את תהליך ההוראה, ואילו מאגר הידע מספק:

- משפטים לתרגול
- מבני ניסוח אקדמיים
- דוגמאות פרפרזה
- סוגי תרגילים
- טעויות נפוצות
- רמזים סוקרטיים

הפרדה זו מאפשרת:

**Pedagogical Engine + Content Engine**

# **2. Knowledge Base Architecture**

מאגר הידע מחולק לשלושה סוגי ידע:

## **Linguistic Knowledge**

ידע לשוני.

כולל:

- Sentence Bank
- Paragraph Bank
- Synonym Sets
- Academic Phrases
- Paraphrase Tools

## **Pedagogical Knowledge**

ידע פדגוגי.

כולל:

- Exercise Types
- Hint Patterns
- Paraphrase Ladder
- Guided Practice Structures

## **Assessment Knowledge**

ידע להערכה.

כולל:

- Example Paraphrases
- Error Bank
- Exam Question Bank

# **3. Knowledge Base Modules**

Knowledge Base

│

├── Sentence Bank

│

├── Paragraph Bank

│

├── Paraphrase Tools

│

├── Synonym Sets

│

├── Academic Phrases

│

├── Exercise Types

│

├── Hint Patterns

│

├── Paraphrase Examples

│

├── Error Bank

│

└── Exam Question Bank

# **4. Sentence Unit Template (Canonical Structure)**

כל משפט במאגר בנוי לפי התבנית הבאה.

Sentence_ID

Sentence_Text

Category

Difficulty

Paraphrase_Level

Components

Paraphrase_Tools

Typical_Errors

Exercise_Types

Example_Paraphrase

Arabic_Explanation

Common_Arabic_Error

# **5. Sentence Fields Explained**

## **Sentence_ID**

מזהה ייחודי.

דוגמאות:

DEF_01

CAUSE_01

COMP_01

CONC_01

PR_01

## **Sentence_Text**

המשפט המקורי לתרגול.

## **Category**

סוג רטורי של המשפט.

קטגוריות עיקריות:

- Definition
- Research Claim
- Cause–Effect
- Comparison
- Hedging
- Conclusion
- Academic Skill
- Learning Process
- Research Context

## **Difficulty**

רמת מורכבות.

1 – simple

2 – intermediate

3 – complex

## **Paraphrase_Level**

עומק הפרפרזה הנדרש.

1 – lexical change

2 – structure change

3 – information reorganization

## **Components**

פירוק מבני של המשפט.

דוגמאות:

subject

action

object

context

marker

cause

effect

contrast

process

ability

הפירוק מאפשר לבוט:

- להסביר מבנה משפט
- לזהות רכיבים חסרים
- להוביל פרפרזה לפי חלקים

## **Paraphrase_Tools**

כלים אפשריים לפרפרזה.

דוגמאות:

lexical_change

structure_change

information_reorder

nominalization

modal_change

voice_change

## **Typical_Errors**

טעויות נפוצות של סטודנטים.

לדוגמה:

minimal_change

structure_copying

meaning_shift

information_loss

missing_component

awkward_structure

## **Exercise_Types**

סוגי תרגילים שהבוט יכול להפעיל.

micro_lexical_change

micro_structure_change

full_sentence_paraphrase

definition_rewrite

cause_effect_rewrite

comparison_rewrite

structure_rewrite

## **Example_Paraphrase**

דוגמה לפרפרזה תקינה.

## **Arabic_Explanation**

הסבר בערבית של משמעות המשפט.

מטרות:

- תמיכה בלומדים דוברי ערבית
- הבהרת משמעות לפני פרפרזה

## **Common_Arabic_Error**

טעויות טיפוסיות של דוברי ערבית.

לדוגמה:

- תרגום מילולי מערבית
- שימוש שגוי במילות יחס
- מבנה תחבירי ערבי

# **6. Sentence Corpus Structure**

מאגר המשפטים מתוכנן לכלול כ-60 משפטים.

Regular Practice Sentences

≈ 30–35

Core Sentences

≈ 10–12

Decomposable Sentences

≈ 8–10

Paraphrase Ladder Sentences

≈ 8–10

# **7. Regular Practice Sentences**

משפטים לתרגול פרפרזה רגיל.

מתאימים ל:

- lexical change
- structure change

דוגמאות מהמאגר:

- סטודנטים רבים מתקשים להבין טקסטים אקדמיים בתחילת לימודיהם.
- קריאה של מאמרים מחקריים עשויה להעמיק את הבנת התחום הנלמד.
- כתיבה חוזרת של טקסט מסייעת ללומד לשפר את יכולת הניסוח שלו.
- שימוש בדוגמאות יכול להבהיר רעיונות מורכבים לקוראים.
- דיון בכיתה מאפשר לסטודנטים להציג דעות שונות על נושא מסוים.
- היכולת לשאול שאלות היא חלק חשוב מתהליך הלמידה.
- ניתוח של טקסט אקדמי דורש זיהוי של הטענות המרכזיות בו.
- עבודה עם מקורות מידע מגוונים מעשירה את הידע של הלומד.
- סטודנטים לומדים בצורה יעילה יותר כאשר הם משתתפים באופן פעיל בשיעור.
- תרגול קבוע של קריאה וכתיבה עשוי לשפר את הישגי הלומדים.

# **8. Core Sentences**

משפטים מרכזיים ללמידה.

מאפיינים:

- פירוק מבני עמוק
- כמה דוגמאות פרפרזה
- הסבר רעיוני

דוגמאות:

- אוריינות אקדמית היא היכולת להבין, לנתח וליצור טקסטים בהקשר האקדמי.
- המונח למידה פעילה מתייחס למצב שבו הלומד משתתף באופן פעיל בתהליך הלמידה.
- רפלקציה היא תהליך שבו אדם בוחן את פעולותיו ואת דרכי החשיבה שלו.

# **9. Decomposable Sentences**

משפטים שניתן לפרק רעיונית.

דוגמה:

קריאה מרובה עשויה להוביל לשיפור ביכולת ההבנה של טקסטים מורכבים.

פירוק:

cause

effect

skill

# **10. Paraphrase Ladder Sentences**

משפטים ללמידה מדורגת.

מבנה:

Original

↓

Step 1 – lexical change

↓

Step 2 – structure change

↓

Step 3 – full paraphrase

דוגמה:

Original
המונח למידה פעילה מתייחס למצב שבו הלומד משתתף באופן פעיל בתהליך הלמידה.

Step 1
למידה פעילה היא מצב שבו הלומד משתתף בתהליך הלמידה.

Step 2
למידה פעילה מתארת מצב שבו הלומד מעורב בתהליך הלמידה.

Step 3
למידה פעילה היא מצב שבו הלומד משתתף באופן פעיל בלמידה.

# **11. Error Bank**

מאגר טעויות לפרפרזה.

minimal_change

structure_copying

meaning_shift

information_loss

information_addition

missing_hedge

awkward_structure

incomplete_paraphrase

missing_component

Error Bank משמש ל:

- Feedback Engine
- Hint Engine
- Student Model

# **12. Paraphrase Tools**

כלים לשינוי ניסוח.

lexical_change

structure_change

information_reorder

nominalization

voice_change

modal_change

sentence_split

sentence_merge

# **13. Exercise Types**

סוגי תרגילים שהבוט יכול להפעיל.

micro_lexical_change

micro_structure_change

component_rewrite

definition_rewrite

cause_effect_rewrite

comparison_rewrite

guided_paraphrase

full_sentence_paraphrase

# **14. Exam Question Bank**

מאגר שאלות למצב מבחן.

כל שאלה כוללת:

Question_ID

Sentence_or_Paragraph

Difficulty

Expected_Paraphrase

Common_Errors

# **15. Modes of Operation**

המאגר מאפשר לבוט להפעיל ארבעה מצבי עבודה.

Practice Mode

Core Explanation Mode

Decomposition Mode

Guided Paraphrase Mode

# **16. סיכום מצב המאגר**

יש כבר:

✔ Sentence Unit Template מלא
✔ Error Bank
✔ Exercise Types
✔ Paraphrase Tools
✔ כ-20 משפטים קיימים
✔ מבנה לקורפוס של 60 משפטים

השלב הבא:

להשלים את **Sentence Corpus המלא**.

אם תרצה, הצעד הבא שאני ממליץ עליו הוא משהו מאוד חשוב:

לבנות את **Sentence Bank המלא של 60 המשפטים** כך שהוא יהיה:

- מאוזן רטורית
- מדורג קושי
- מתאים לדוברי ערבית

וזה יהפוך את הבוט שלך ל-**Mini Curriculum לפרפרזה אקדמית**.

__________________________

מצוין נחום.
כדי שהמאגר באמת יעבוד טוב עבור **סטודנטים דוברי ערבית בקורסי אוריינות אקדמית**, חשוב שה-Sentence Bank לא יהיה אוסף אקראי של משפטים אלא **קורפוס מאוזן פדגוגית**.

אני מציע את המבנה הבא ל-**Sentence Bank המלא (60 משפטים)**.

זהו למעשה **Mini Curriculum לפרפרזה אקדמית**.

# **Sentence Bank – Canonical Structure (60 Sentences)**

המאגר מחולק ל-4 שכבות פדגוגיות.

Layer 1 – Practice Sentences

Layer 2 – Core Sentences

Layer 3 – Decomposable Sentences

Layer 4 – Paraphrase Ladder Sentences

כל שכבה משרתת **פונקציה פדגוגית אחרת**.

# **Layer 1 – Practice Sentences**

## **30 משפטים**

משפטים פשוטים יחסית לתרגול.

מתאימים ל:

- lexical change
- structure change

Difficulty:
1–2

## **Practice Sentences (PR)**

PR_01
סטודנטים רבים מתקשים להבין טקסטים אקדמיים בתחילת לימודיהם.

PR_02
קריאה של מאמרים מחקריים עשויה להעמיק את הבנת התחום הנלמד.

PR_03
כתיבה חוזרת של טקסט מסייעת ללומד לשפר את יכולת הניסוח שלו.

PR_04
שימוש בדוגמאות יכול להבהיר רעיונות מורכבים לקוראים.

PR_05
דיון בכיתה מאפשר לסטודנטים להציג דעות שונות על נושא מסוים.

PR_06
היכולת לשאול שאלות היא חלק חשוב מתהליך הלמידה.

PR_07
ניתוח של טקסט אקדמי דורש זיהוי של הטענות המרכזיות בו.

PR_08
עבודה עם מקורות מידע מגוונים מעשירה את הידע של הלומד.

PR_09
סטודנטים לומדים בצורה יעילה יותר כאשר הם משתתפים באופן פעיל בשיעור.

PR_10
תרגול קבוע של קריאה וכתיבה עשוי לשפר את הישגי הלומדים.

PR_11
הבנת מושגים מרכזיים היא תנאי ללמידה מעמיקה של תחום ידע.

PR_12
קריאה ביקורתית מאפשרת ללומד לבחון את הטענות המוצגות בטקסט.

PR_13
סיכום של טקסט מסייע בזיהוי הרעיונות המרכזיים שבו.

PR_14
הצגת טיעון ברור מחזקת את איכות הכתיבה האקדמית.

PR_15
שימוש נכון במקורות מידע תורם לאמינות העבודה האקדמית.

PR_16
למידה שיתופית עשויה לשפר את הבנת החומר הנלמד.

PR_17
קריאה מרובה יכולה להרחיב את אוצר המילים של הלומד.

PR_18
תרגול של כתיבה אקדמית דורש זמן ומאמץ מתמשך.

PR_19
שימוש במילות קישור מסייע לארגון הרעיונות בטקסט.

PR_20
טקסט אקדמי טוב מציג רעיונות בצורה ברורה ומסודרת.

PR_21
למידה פעילה מעודדת את הסטודנטים להשתתף בתהליך הלמידה.

PR_22
עבודה קבוצתית מאפשרת חילופי רעיונות בין לומדים.

PR_23
ניתוח של מאמר מחקרי דורש הבנה של מטרות המחקר.

PR_24
בחינה ביקורתית של מקורות מידע היא מיומנות אקדמית חשובה.

PR_25
כתיבה אקדמית דורשת שימוש במונחים מדויקים.

PR_26
דיון בטקסט יכול להעמיק את הבנת הקוראים.

PR_27
קריאה של מקורות שונים מאפשרת ראייה רחבה של הנושא.

PR_28
סטודנטים רבים משפרים את כתיבתם באמצעות משוב.

PR_29
שכתוב של משפטים מסייע ללומדים לפתח מיומנויות ניסוח.

PR_30
שימוש בדוגמאות מחזק את ההסבר של רעיונות מורכבים.

# **Layer 2 – Core Sentences**

## **12 משפטים**

משפטים מושגיים מרכזיים.

מתאימים במיוחד ל:

- Core Explanation Mode
- Exam Mode

CORE_01
אוריינות אקדמית היא היכולת להבין, לנתח וליצור טקסטים במסגרת ההקשר האקדמי.

CORE_02
למידה פעילה מתייחסת למצב שבו הלומד משתתף באופן פעיל בתהליך הלמידה.

CORE_03
רפלקציה היא תהליך שבו אדם בוחן את פעולותיו ואת דרכי החשיבה שלו.

CORE_04
למידה עצמית היא היכולת של הלומד ללמוד ולתרגל באופן עצמאי.

CORE_05
למידה עצמאית מתייחסת ליכולת של הלומד לנהל את תהליך הלמידה שלו.

CORE_06
הבנה עמוקה מתבטאת ביכולת להסביר רעיונות וליישם אותם בהקשרים שונים.

CORE_07
חשיבה ביקורתית מאפשרת ללומד להעריך טענות ומידע בצורה מושכלת.

CORE_08
קריאה אקדמית דורשת זיהוי של טענות, ראיות ומסקנות בטקסט.

CORE_09
כתיבה אקדמית מבוססת על הצגת רעיונות בצורה ברורה ומבוססת.

CORE_10
שימוש נכון במקורות מידע הוא חלק מרכזי בעבודה אקדמית.

CORE_11
ניתוח טקסטים אקדמיים דורש הבנה של מבנה הטיעון.

CORE_12
סיכום של טקסט מאפשר לזהות את הרעיונות המרכזיים שבו.

# **Layer 3 – Decomposable Sentences**

## **8 משפטים**

משפטים שניתן לפרק לרכיבים רעיוניים.

DEC_01
קריאה מרובה עשויה להוביל לשיפור ביכולת ההבנה של טקסטים מורכבים.

DEC_02
שימוש במשוב מתמשך עשוי לסייע לסטודנטים לשפר את עבודותיהם.

DEC_03
למידה שיתופית יכולה להגביר את המעורבות של הלומדים בשיעור.

DEC_04
שאלות פתוחות עשויות לעודד את הסטודנטים לחשיבה ביקורתית.

DEC_05
דיון בכיתה מאפשר בחינה של נקודות מבט שונות על נושא מסוים.

DEC_06
קריאה ביקורתית מסייעת ללומד לזהות את ההנחות המוצגות בטקסט.

DEC_07
כתיבה חוזרת של טקסט עשויה לשפר את בהירות הניסוח.

DEC_08
עבודה עם מקורות מידע מגוונים יכולה להעמיק את הבנת הנושא.

# **Layer 4 – Paraphrase Ladder Sentences**

## **10 משפטים**

משפטים ללמידה מדורגת.

LAD_01
המונח למידה פעילה מתייחס למצב שבו הלומד משתתף באופן פעיל בתהליך הלמידה.

LAD_02
מחקרים רבים מצביעים על קשר בין קריאה מרובה לבין הרחבת אוצר המילים.

LAD_03
למידה שיתופית היא שיטת הוראה שבה תלמידים עובדים יחד כדי להשיג מטרה משותפת.

LAD_04
קריאה ביקורתית מאפשרת ללומד לבחון את הטענות המוצגות בטקסט.

LAD_05
כתיבה אקדמית דורשת ניסוח ברור והצגת טיעונים בצורה מסודרת.

LAD_06
שימוש במשוב מתמשך עשוי לסייע לסטודנטים לשפר את עבודותיהם.

LAD_07
למידה עצמאית מחייבת את הלומד לקחת אחריות על תהליך הלמידה שלו.

LAD_08
שאלות פתוחות עשויות לעודד את הלומדים לחשיבה ביקורתית.

LAD_09
היכולת לסכם טקסט מאפשרת ללומד לזהות את הרעיונות המרכזיים שבו.

LAD_10
פיתוח מיומנויות קריאה וכתיבה הוא מרכיב מרכזי בהצלחה בלימודים אקדמיים.

# **התוצאה**

יש לך עכשיו:

Practice sentences     30

Core sentences         12

Decomposable sentences 8

Paraphrase ladders     10

--------------------------

TOTAL                  60

וזה בדיוק הקורפוס שתכננת.

# **משהו חשוב מאוד לפני שנמשיך**

יש **שדרוג אחד קטן** שיכול להפוך את המאגר הזה להרבה יותר חזק לבוט.

הוא נקרא:

**Sentence Families**

כלומר:

לכל משפט יהיו:

Original
2–3 paraphrase examples
Common errors

ואז הבוט יכול ממש **להשוות בין תשובת סטודנט לבין משפחת פרפרזות**.

_________________________

הטבלה הבאה היא **Sentence Corpus Canonical Map** – כלומר המפה הרשמית של כל המשפטים במאגר לפני מילוי התבניות המלאות.

# **Sentence Corpus – Canonical Map (60 Sentences)**

## **Layer 1 — Practice Sentences (30)**

**ID**

**Sentence**

**Category**

**Difficulty**

PR_01

סטודנטים רבים מתקשים להבין טקסטים אקדמיים בתחילת לימודיהם

Learning Process

1

PR_02

קריאה של מאמרים מחקריים עשויה להעמיק את הבנת התחום הנלמד

Academic Skill

1

PR_03

כתיבה חוזרת של טקסט מסייעת ללומד לשפר את יכולת הניסוח שלו

Learning Process

1

PR_04

שימוש בדוגמאות יכול להבהיר רעיונות מורכבים לקוראים

Explanation

1

PR_05

דיון בכיתה מאפשר לסטודנטים להציג דעות שונות על נושא מסוים

Learning Interaction

1

PR_06

היכולת לשאול שאלות היא חלק חשוב מתהליך הלמידה

Learning Skill

1

PR_07

ניתוח של טקסט אקדמי דורש זיהוי של הטענות המרכזיות בו

Academic Reading

2

PR_08

עבודה עם מקורות מידע מגוונים מעשירה את הידע של הלומד

Academic Skill

1

PR_09

סטודנטים לומדים בצורה יעילה יותר כאשר הם משתתפים באופן פעיל בשיעור

Learning Process

1

PR_10

תרגול קבוע של קריאה וכתיבה עשוי לשפר את הישגי הלומדים

Cause–Effect

1

PR_11

הבנת מושגים מרכזיים היא תנאי ללמידה מעמיקה של תחום ידע

Academic Skill

2

PR_12

קריאה ביקורתית מאפשרת ללומד לבחון את הטענות המוצגות בטקסט

Academic Reading

2

PR_13

סיכום של טקסט מסייע בזיהוי הרעיונות המרכזיים שבו

Academic Skill

1

PR_14

הצגת טיעון ברור מחזקת את איכות הכתיבה האקדמית

Academic Writing

2

PR_15

שימוש נכון במקורות מידע תורם לאמינות העבודה האקדמית

Research Skill

2

PR_16

למידה שיתופית עשויה לשפר את הבנת החומר הנלמד

Cause–Effect

1

PR_17

קריאה מרובה יכולה להרחיב את אוצר המילים של הלומד

Cause–Effect

1

PR_18

תרגול של כתיבה אקדמית דורש זמן ומאמץ מתמשך

Academic Writing

1

PR_19

שימוש במילות קישור מסייע לארגון הרעיונות בטקסט

Academic Writing

1

PR_20

טקסט אקדמי טוב מציג רעיונות בצורה ברורה ומסודרת

Academic Writing

1

PR_21

למידה פעילה מעודדת את הסטודנטים להשתתף בתהליך הלמידה

Learning Process

1

PR_22

עבודה קבוצתית מאפשרת חילופי רעיונות בין לומדים

Learning Interaction

1

PR_23

ניתוח של מאמר מחקרי דורש הבנה של מטרות המחקר

Academic Reading

2

PR_24

בחינה ביקורתית של מקורות מידע היא מיומנות אקדמית חשובה

Academic Skill

2

PR_25

כתיבה אקדמית דורשת שימוש במונחים מדויקים

Academic Writing

1

PR_26

דיון בטקסט יכול להעמיק את הבנת הקוראים

Explanation

1

PR_27

קריאה של מקורות שונים מאפשרת ראייה רחבה של הנושא

Academic Skill

1

PR_28

סטודנטים רבים משפרים את כתיבתם באמצעות משוב

Learning Process

1

PR_29

שכתוב של משפטים מסייע ללומדים לפתח מיומנויות ניסוח

Academic Writing

1

PR_30

שימוש בדוגמאות מחזק את ההסבר של רעיונות מורכבים

Explanation

1

# **Layer 2 — Core Sentences (12)**

**ID**

**Sentence**

**Category**

**Difficulty**

CORE_01

אוריינות אקדמית היא היכולת להבין, לנתח וליצור טקסטים בהקשר האקדמי

Definition

2

CORE_02

למידה פעילה מתייחסת למצב שבו הלומד משתתף באופן פעיל בתהליך הלמידה

Definition

1

CORE_03

רפלקציה היא תהליך שבו אדם בוחן את פעולותיו ואת דרכי החשיבה שלו

Definition

2

CORE_04

למידה עצמית היא היכולת של הלומד ללמוד ולתרגל באופן עצמאי

Definition

2

CORE_05

למידה עצמאית מתייחסת ליכולת של הלומד לנהל את תהליך הלמידה שלו

Definition

2

CORE_06

הבנה עמוקה מתבטאת ביכולת להסביר רעיונות וליישם אותם בהקשרים שונים

Definition

2

CORE_07

חשיבה ביקורתית מאפשרת ללומד להעריך טענות ומידע בצורה מושכלת

Academic Skill

2

CORE_08

קריאה אקדמית דורשת זיהוי של טענות, ראיות ומסקנות בטקסט

Academic Reading

2

CORE_09

כתיבה אקדמית מבוססת על הצגת רעיונות בצורה ברורה ומבוססת

Academic Writing

2

CORE_10

שימוש נכון במקורות מידע הוא חלק מרכזי בעבודה אקדמית

Research Skill

2

CORE_11

ניתוח טקסטים אקדמיים דורש הבנה של מבנה הטיעון

Academic Reading

2

CORE_12

סיכום של טקסט מאפשר לזהות את הרעיונות המרכזיים שבו

Academic Skill

1

# **Layer 3 — Decomposable Sentences (8)**

**ID**

**Sentence**

**Structure**

DEC_01

קריאה מרובה עשויה להוביל לשיפור ביכולת ההבנה של טקסטים מורכבים

cause → effect

DEC_02

שימוש במשוב מתמשך עשוי לסייע לסטודנטים לשפר את עבודותיהם

tool → improvement

DEC_03

למידה שיתופית יכולה להגביר את המעורבות של הלומדים בשיעור

method → outcome

DEC_04

שאלות פתוחות עשויות לעודד את הסטודנטים לחשיבה ביקורתית

strategy → cognitive outcome

DEC_05

דיון בכיתה מאפשר בחינה של נקודות מבט שונות על נושא מסוים

activity → perspectives

DEC_06

קריאה ביקורתית מסייעת ללומד לזהות את ההנחות המוצגות בטקסט

skill → analysis

DEC_07

כתיבה חוזרת של טקסט עשויה לשפר את בהירות הניסוח

process → improvement

DEC_08

עבודה עם מקורות מידע מגוונים יכולה להעמיק את הבנת הנושא

method → understanding

# **Layer 4 — Paraphrase Ladder Sentences (10)**

**ID**

**Sentence**

**Category**

LAD_01

המונח למידה פעילה מתייחס למצב שבו הלומד משתתף באופן פעיל בתהליך הלמידה

Definition

LAD_02

מחקרים רבים מצביעים על קשר בין קריאה מרובה לבין הרחבת אוצר המילים

Research Claim

LAD_03

למידה שיתופית היא שיטת הוראה שבה תלמידים עובדים יחד כדי להשיג מטרה משותפת

Definition

LAD_04

קריאה ביקורתית מאפשרת ללומד לבחון את הטענות המוצגות בטקסט

Academic Skill

LAD_05

כתיבה אקדמית דורשת ניסוח ברור והצגת טיעונים בצורה מסודרת

Academic Writing

LAD_06

שימוש במשוב מתמשך עשוי לסייע לסטודנטים לשפר את עבודותיהם

Cause–Effect

LAD_07

למידה עצמאית מחייבת את הלומד לקחת אחריות על תהליך הלמידה שלו

Learning Process

LAD_08

שאלות פתוחות עשויות לעודד את הלומדים לחשיבה ביקורתית

Cause–Effect

LAD_09

היכולת לסכם טקסט מאפשרת ללומד לזהות את הרעיונות המרכזיים שבו

Academic Skill

LAD_10

פיתוח מיומנויות קריאה וכתיבה הוא מרכיב מרכזי בהצלחה בלימודים אקדמיים

Conclusion

# **התוצאה**

המאגר עכשיו יציב:

**Type**

**Count**

Practice Sentences

30

Core Sentences

12

Decomposable Sentences

8

Paraphrase Ladder

10

**Total**

**60**

# **למה זה חשוב**

עכשיו מאגר הידע:

- מאוזן רטורית

- מדורג קושי

- מתאים ללומדי עברית כשפה שנייה

- מותאם במיוחד לקורסי **קריאה וכתיבה אקדמית שאתה מלמד
**

_______________________

# **הבעיה במבנה הנוכחי של המאגר**

כרגע רוב המשפטים שייכים לסוג אחד:

**משפטי הסבר או תיאור של מיומנות.**

לדוגמה:

- קריאה ביקורתית מאפשרת ללומד לבחון את הטענות המוצגות בטקסט.

- שימוש בדוגמאות יכול להבהיר רעיונות מורכבים.

- עבודה עם מקורות מידע מגוונים מעשירה את הידע של הלומד.

אלה משפטים טובים, אבל הם שייכים כולם לאותה **משפחה רטורית**.

# **למה זה בעייתי בבוט פרפרזה**

פרפרזה אינה רק שינוי מילים.

בכתיבה אקדמית היא מתרחשת בתוך **מבנים רטוריים שונים**:

- הגדרה

- טענה מחקרית

- סיבה ותוצאה

- השוואה

- הסתייגות (hedging)

- מסקנה

סטודנטים מתקשים דווקא במבנים האלה.

לכן אם המאגר אינו מאוזן — הבוט מתאמן רק על סוג אחד של ניסוח.

# **האיזון הרצוי למאגר**

מאגר של 60 משפטים צריך להיות מחולק בערך כך:

**סוג רטורי**

**מספר משפטים**

Definition

10

Research Claim

10

Cause–Effect

10

Comparison

8

Hedging

6

Conclusion

6

Academic Skill / Explanation

10

סה״כ: **60**

_______________________

# **פרופיל לשוני של המשפטים במאגר**

המשפטים צריכים להיראות כמו משפטים מתוך:

- סקירת ספרות

- מבוא למאמר

- דיון בממצאים

- מסקנות מחקר

לכן הם יכללו מבנים טיפוסיים של כתיבה אקדמית במדעי החברה.

# **1. מבני טענה מחקרית**

מבנים נפוצים במאמרים:

דוגמאות:

- מחקרים רבים מצביעים על קשר בין קריאה מרובה לבין הרחבת אוצר המילים.

- נמצא כי השתתפות פעילה בשיעור תורמת להבנת החומר הנלמד.

- חוקרים אחדים טוענים כי למידה שיתופית עשויה לשפר את הישגי הלומדים.

מבנים לשוניים אופייניים:

- מחקרים מצביעים על כך ש…

- נמצא כי…

- מחקר זה מראה כי…

- חוקרים טוענים כי…

# **2. קשר סיבתי (Cause–Effect)**

מבנה נפוץ מאוד במאמרים.

דוגמאות:

- שימוש במשוב מתמשך עשוי לשפר את איכות הכתיבה של הסטודנטים.

- קריאה ביקורתית עשויה לסייע ללומדים לזהות הנחות סמויות בטקסטים אקדמיים.

מבנים אופייניים:

- עשוי להוביל ל…

- עשוי לתרום ל…

- עלול להשפיע על…

# **3. השוואה בין תופעות**

דוגמאות:

- למידה שיתופית נמצאה יעילה יותר מלמידה יחידנית במצבים מסוימים.

- קריאה ביקורתית דורשת מעורבות קוגניטיבית גבוהה יותר מקריאה שטחית.

מבנים אופייניים:

- יותר מ…

- פחות מ…

- בהשוואה ל…

# **4. הסתייגות (Hedging)**

זה קריטי במיוחד בכתיבה אקדמית.

דוגמאות:

- ממצאים אלה עשויים להעיד על קשר בין קריאה מרובה לבין הבנת טקסטים מורכבים.

- ייתכן כי שימוש במשוב תורם לשיפור הדרגתי בכתיבה האקדמית.

מילות hedging טיפוסיות:

- עשוי

- ייתכן

- נראה כי

- ניתן לשער כי

# **5. מסקנות מחקר**

דוגמאות:

- ממצאי המחקר מצביעים על חשיבותה של קריאה ביקורתית בתהליך הלמידה האקדמית.

- ניתן להסיק כי תרגול כתיבה קבוע תורם לשיפור מיומנויות ניסוח.

# **כעת מאגר הידע צריך להיראות בערך כך**

**סוג משפט**

**כמות**

Research Claim

12

Cause–Effect

10

Definition

8

Comparison

8

Hedging

6

Conclusion

6

Academic Skill

10

סה״כ: **60**

___________________________

אני בונה כאן **20 Sentence Units מלאים** לפי התבנית הסופית שהגדרנו.
 המשפטים כתובים **בסגנון מאמרים במדעי החברה**, ומתאימים לקורסי **קריאה וכתיבה אקדמית לסטודנטים דוברי ערבית**.

אני שומר על התבנית המלאה של המאגר.

# **Sentence Units – Batch 1 (20)**

## **Sentence 1**

Sentence_ID
 RC_01

Sentence_Text
 מחקרים רבים מצביעים על כך שקריאה מרובה תורמת להרחבת אוצר המילים של הלומדים.

Category
 Research Claim

Difficulty
 2

Paraphrase_Level
 2

Components

marker: מחקרים רבים מצביעים על כך ש
 subject: קריאה מרובה
 action: תורמת
 object: להרחבת אוצר המילים
 context: של הלומדים

Paraphrase_Tools

lexical_change
 structure_change

Typical_Errors

minimal_change
 structure_copying

Exercise_Types

guided_paraphrase
 full_sentence_paraphrase

Example_Paraphrase

מחקרים שונים מראים כי קריאה מרובה עשויה להגדיל את אוצר המילים של לומדים.

Arabic_Explanation

تشير العديد من الدراسات إلى أن القراءة الكثيرة تساعد على توسيع المفردات لدى المتعلمين.

Common_Arabic_Error

תרגום מילולי של המבנה "מצביעים על כך ש" ללא שינוי מבני.

## **Sentence 2**

Sentence_ID
 RC_02

Sentence_Text
 נמצא כי השתתפות פעילה בדיונים בכיתה עשויה לשפר את הבנת החומר הנלמד.

Category
 Research Claim

Difficulty
 2

Paraphrase_Level
 2

Components

marker: נמצא כי
 subject: השתתפות פעילה בדיונים בכיתה
 action: עשויה לשפר
 object: את הבנת החומר הנלמד

Paraphrase_Tools

lexical_change
 structure_change

Typical_Errors

minimal_change
 missing_component

Exercise_Types

guided_paraphrase

Example_Paraphrase

מחקרים מראים כי מעורבות פעילה בדיונים בכיתה יכולה לתרום להבנה טובה יותר של החומר.

Arabic_Explanation

تبيّن أن المشاركة الفعّالة في النقاشات الصفية قد تحسن فهم المادة الدراسية.

Common_Arabic_Error

השמטת הפועל "עשויה" שמבטא הסתייגות.

## **Sentence 3**

Sentence_ID
 CE_01

Sentence_Text
 שימוש במשוב מתמשך עשוי לשפר את איכות הכתיבה האקדמית של הסטודנטים.

Category
 Cause–Effect

Difficulty
 1

Paraphrase_Level
 2

Components

subject: שימוש במשוב מתמשך
 action: עשוי לשפר
 object: את איכות הכתיבה האקדמית
 context: של הסטודנטים

Paraphrase_Tools

lexical_change
 nominalization

Typical_Errors

minimal_change
 meaning_shift

Exercise_Types

cause_effect_rewrite

Example_Paraphrase

משוב קבוע יכול לתרום לשיפור איכות הכתיבה האקדמית של סטודנטים.

Arabic_Explanation

استخدام التغذية الراجعة المستمرة قد يؤدي إلى تحسين جودة الكتابة الأكاديمية لدى الطلاب.

Common_Arabic_Error

בלבול בין "משוב" לבין "תגובה".

## **Sentence 4**

Sentence_ID
 CE_02

Sentence_Text
 קריאה ביקורתית עשויה לסייע ללומדים לזהות הנחות סמויות בטקסטים אקדמיים.

Category
 Cause–Effect

Difficulty
 2

Paraphrase_Level
 2

Components

subject: קריאה ביקורתית
 action: עשויה לסייע
 object: לזהות הנחות סמויות
 context: בטקסטים אקדמיים

Example_Paraphrase

קריאה ביקורתית יכולה לעזור ללומדים לאתר הנחות שאינן נאמרות במפורש בטקסטים אקדמיים.

Arabic_Explanation

القراءة النقدية قد تساعد المتعلمين على اكتشاف الافتراضات غير المصرح بها في النصوص الأكاديمية.

Common_Arabic_Error

תרגום מילולי של "הנחות סמויות".

## **Sentence 5**

Sentence_ID
 COMP_01

Sentence_Text
 למידה שיתופית נמצאה יעילה יותר מלמידה יחידנית במצבים מסוימים.

Category
 Comparison

Difficulty
 2

Paraphrase_Level
 2

Components

subject: למידה שיתופית
 action: נמצאה יעילה יותר
 comparison: מלמידה יחידנית
 context: במצבים מסוימים

Example_Paraphrase

במצבים מסוימים למידה בקבוצה עשויה להיות יעילה יותר מלמידה של לומד יחיד.

Arabic_Explanation

تبيّن أن التعلم التعاوني أكثر فاعلية من التعلم الفردي في بعض الحالات.

Common_Arabic_Error

שימוש שגוי במילת היחס "מ".

## **Sentence 6**

Sentence_ID
 DEF_01

Sentence_Text
 חשיבה ביקורתית היא היכולת להעריך טענות ומידע בצורה מושכלת.

Category
 Definition

Difficulty
 1

Paraphrase_Level
 1

Components

subject: חשיבה ביקורתית
 action: היא
 object: היכולת להעריך טענות ומידע
 context: בצורה מושכלת

Example_Paraphrase

חשיבה ביקורתית מתייחסת ליכולת לבחון מידע וטענות באופן מושכל.

Arabic_Explanation

التفكير النقدي هو القدرة على تقييم الادعاءات والمعلومات بشكل واعٍ ومدروس.

Common_Arabic_Error

תרגום מילולי של "בצורה מושכלת".

## **Sentence 7**

Sentence_ID
 DEF_02

Sentence_Text
 אוריינות אקדמית מתייחסת ליכולת להבין, לנתח וליצור טקסטים בהקשר האקדמי.

Category
 Definition

Difficulty
 2

Paraphrase_Level
 2

Example_Paraphrase

אוריינות אקדמית היא היכולת לקרוא, לנתח ולכתוב טקסטים במסגרת האקדמיה.

Arabic_Explanation

تشير الثقافة الأكاديمية إلى القدرة على فهم النصوص وتحليلها وإنتاجها في السياق الأكاديمي.

Common_Arabic_Error

השמטת אחד מהפעלים ברשימה.

## **Sentence 8**

Sentence_ID
 CONC_01

Sentence_Text
 לסיכום, פיתוח מיומנויות קריאה וכתיבה הוא מרכיב מרכזי בהצלחה בלימודים אקדמיים.

Category
 Conclusion

Difficulty
 1

Paraphrase_Level
 2

Components

marker: לסיכום
 subject: פיתוח מיומנויות קריאה וכתיבה
 action: הוא
 object: מרכיב מרכזי
 context: בהצלחה בלימודים אקדמיים

Example_Paraphrase

לסיכום, הצלחה בלימודים אקדמיים תלויה במידה רבה בפיתוח מיומנויות קריאה וכתיבה.

Arabic_Explanation

باختصار، تطوير مهارات القراءة والكتابة عنصر أساسي للنجاح في الدراسة الأكاديمية.

Common_Arabic_Error

שמירה על אותו סדר מידע כמו במשפט המקורי.

## **Sentence 9**

Sentence_ID
 HED_01

Sentence_Text

ייתכן כי שימוש בטכנולוגיות למידה דיגיטליות תורם להגברת המעורבות של סטודנטים.

Category
 Hedging

Difficulty
 2

Paraphrase_Level
 2

Example_Paraphrase

נראה כי טכנולוגיות למידה דיגיטליות עשויות להגביר את מעורבות הסטודנטים בלמידה.

Arabic_Explanation

قد يكون استخدام تقنيات التعلم الرقمية عاملاً في زيادة مشاركة الطلاب.

Common_Arabic_Error

השמטת מילת הסתייגות.

## **Sentence 10**

Sentence_ID
 RC_03

Sentence_Text

מחקרים אחדים מצביעים על קשר בין קריאה ביקורתית לבין הבנה עמוקה יותר של טקסטים אקדמיים.

Category
 Research Claim

Difficulty
 2

Example_Paraphrase

חוקרים מצאו כי קיים קשר בין קריאה ביקורתית לבין הבנה מעמיקה של טקסטים אקדמיים.

Arabic_Explanation

تشير بعض الدراسات إلى وجود علاقة بين القراءة النقدية والفهم العميق للنصوص الأكاديمية.

Common_Arabic_Error

תרגום מילולי של "מצביעים על קשר".

## **Sentence 11**

Sentence_ID
 CE_03

Sentence_Text

תרגול קבוע של כתיבה אקדמית עשוי להוביל לשיפור הדרגתי ביכולת הניסוח.

Category
 Cause–Effect

Difficulty
 1

Example_Paraphrase

כאשר סטודנטים מתרגלים כתיבה אקדמית באופן קבוע, יכולת הניסוח שלהם משתפרת בהדרגה.

Arabic_Explanation

قد يؤدي التدريب المنتظم على الكتابة الأكاديمية إلى تحسين تدريجي في القدرة على الصياغة.

Common_Arabic_Error

השמטת הקשר הסיבתי.

## **Sentence 12**

Sentence_ID
 COMP_02

Sentence_Text

קריאה ביקורתית דורשת מעורבות קוגניטיבית גבוהה יותר מקריאה שטחית.

Category
 Comparison

Difficulty
 2

Example_Paraphrase

בהשוואה לקריאה שטחית, קריאה ביקורתית מחייבת מעורבות קוגניטיבית רבה יותר.

Arabic_Explanation

تتطلب القراءة النقدية مشاركة معرفية أكبر مقارنة بالقراءة السطحية.

Common_Arabic_Error

שימוש שגוי במבנה ההשוואה.

## **Sentence 13**

Sentence_ID
 RC_04

Sentence_Text

מחקרים מצביעים על כך שמעורבות פעילה בלמידה עשויה לשפר את הישגי הסטודנטים.

Category
 Research Claim

Example_Paraphrase

מחקרים שונים מראים כי השתתפות פעילה בתהליך הלמידה יכולה לתרום לשיפור הישגים אקדמיים.

Arabic_Explanation

تشير الدراسات إلى أن المشاركة النشطة في التعلم قد تحسن تحصيل الطلاب.

Common_Arabic_Error

השמטת המילה "עשויה".

## **Sentence 14**

Sentence_ID
 CE_04

Sentence_Text

עבודה עם מקורות מידע מגוונים עשויה להעמיק את הבנת הנושא הנלמד.

Category
 Cause–Effect

Example_Paraphrase

שימוש במקורות מידע שונים יכול לסייע ללומדים להבין את הנושא בצורה מעמיקה יותר.

Arabic_Explanation

العمل مع مصادر معلومات متنوعة قد يعمق فهم الموضوع المدروس.

Common_Arabic_Error

תרגום מילולי של "להעמיק את הבנת".

## **Sentence 15**

Sentence_ID
 DEF_03

Sentence_Text

למידה עצמאית היא היכולת של הלומד לנהל את תהליך הלמידה שלו באופן עצמאי.

Category
 Definition

Example_Paraphrase

למידה עצמאית מתארת מצב שבו הלומד מנהל את תהליך הלמידה שלו בכוחות עצמו.

Arabic_Explanation

التعلم الذاتي هو قدرة المتعلم على إدارة عملية تعلمه بشكل مستقل.

Common_Arabic_Error

חזרה על אותו מבנה בדיוק.

## **Sentence 16**

Sentence_ID
 HED_02

Sentence_Text

נראה כי שילוב דיונים בכיתה עשוי לעודד חשיבה ביקורתית בקרב סטודנטים.

Category
 Hedging

Example_Paraphrase

ייתכן כי דיונים בכיתה תורמים לפיתוח חשיבה ביקורתית אצל סטודנטים.

Arabic_Explanation

يبدو أن دمج النقاشات الصفية قد يشجع التفكير النقدي لدى الطلاب.

Common_Arabic_Error

השמטת "נראה כי".

## **Sentence 17**

Sentence_ID
 CONC_02

Sentence_Text

ממצאים אלה מצביעים על חשיבותה של קריאה ביקורתית בלמידה האקדמית.

Category
 Conclusion

Example_Paraphrase

ממצאי המחקר מדגישים את חשיבות הקריאה הביקורתית בתהליך הלמידה האקדמית.

Arabic_Explanation

تشير هذه النتائج إلى أهمية القراءة النقدية في التعلم الأكاديمي.

Common_Arabic_Error

תרגום מילולי של "מצביעים".

## **Sentence 18**

Sentence_ID
 RC_05

Sentence_Text

מחקרים עדכניים מציעים כי שימוש במשוב מתמשך עשוי לשפר את איכות עבודות הסטודנטים.

Example_Paraphrase

מחקרים חדשים מראים כי משוב מתמשך יכול לתרום לשיפור איכות העבודות של סטודנטים.

Arabic_Explanation

تشير الدراسات الحديثة إلى أن التغذية الراجعة المستمرة قد تحسن جودة أعمال الطلاب.

Common_Arabic_Error

תרגום מילולי של "מציעים כי".

## **Sentence 19**

Sentence_ID
 COMP_03

Sentence_Text

למידה פעילה נמצאה יעילה יותר מהקשבה פסיבית בהרצאות מסוימות.

Example_Paraphrase

בכמה מצבים נמצא כי למידה פעילה יעילה יותר מהאזנה פסיבית להרצאות.

Arabic_Explanation

تبيّن أن التعلم النشط أكثر فاعلية من الاستماع السلبي في بعض المحاضرات.

Common_Arabic_Error

השמטת ההשוואה.

## **Sentence 20**

Sentence_ID
 CE_05

Sentence_Text

קריאה של מקורות מחקריים עשויה להרחיב את הבנת הסטודנטים לגבי נושא מסוים.

Example_Paraphrase

כאשר סטודנטים קוראים מקורות מחקריים, הם עשויים להבין טוב יותר את הנושא הנלמד.

Arabic_Explanation

قراءة المصادر البحثية قد توسع فهم الطلاب لموضوع معين.

Common_Arabic_Error

שמירה על אותו סדר מילים.

# **מצב המאגר עכשיו**

יש לנו:

**חלק**

**כמות**

Sentence Units מלאים

20

יעד סופי

60

המבנה כבר עובד.

_________________________

# **הרעיון: Paraphrase Training Loop**

במקום שהבוט רק יציג משפט ויבקש פרפרזה, הוא מפעיל **מחזור למידה קצר**.

מבנה המחזור:

1. הבנת המשפט

2. פירוק המבנה

3. תרגול קטן

4. פרפרזה מלאה

5. משוב

כל זה מבוסס ישירות על ה־**Sentence Unit** שבנית.

# **שלב 1 – הבנת המשפט**

הבוט מציג את המשפט.

לדוגמה:

מחקרים רבים מצביעים על כך שקריאה מרובה תורמת להרחבת אוצר המילים של הלומדים.

אם הסטודנט מתקשה — הבוט יכול להציג:

**Arabic Explanation**

זה בדיוק למה השדה הזה במאגר חשוב.

# **שלב 2 – פירוק המשפט**

הבוט משתמש ב-Components.

לדוגמה:

marker
 מחקרים רבים מצביעים על כך ש

subject
 קריאה מרובה

action
 תורמת

object
 להרחבת אוצר המילים

context
 של הלומדים

הבוט יכול לשאול:

מהו הרעיון המרכזי במשפט?

או

איזה חלק ניתן לשנות בפרפרזה?

# **שלב 3 – Micro Exercise**

כאן נכנס **Exercise_Type**.

לדוגמה:

micro_lexical_change

הבוט יבקש:

שנה מילה אחת במשפט בלי לשנות את המשמעות.

הסטודנט משנה:

תורמת → מסייעת

# **שלב 4 – פרפרזה מלאה**

הבוט מבקש:

נסח מחדש את המשפט במילים אחרות.

# **שלב 5 – אבחון אוטומטי**

כאן נכנס החלק החזק של המאגר.

הבוט בודק את התשובה לפי:

Typical_Errors

לדוגמה:

minimal_change
 structure_copying
 meaning_shift

ואז הוא נותן משוב מתאים.

# **דוגמה למשוב**

Minimal Change

הפרפרזה שלך קרובה מאוד למשפט המקורי. נסה לשנות גם את מבנה המשפט ולא רק מילים בודדות.

Structure Copying

המבנה התחבירי נשאר כמעט זהה. נסה להתחיל את המשפט בצורה אחרת.

Meaning Distortion

נראה שהמשמעות השתנתה מעט. בדוק האם עדיין נשמר הקשר בין קריאה מרובה לבין הרחבת אוצר המילים.

Good Paraphrase

מצוין. הצלחת לשמור על המשמעות תוך שינוי ניסוח.

# **כך נראה מחזור תרגול שלם**

משפט

↓

הסבר

↓

פירוק

↓

מיני תרגיל

↓

פרפרזה

↓

משוב

זה לוקח בערך **2-3 דקות לסטודנט**.

___________________________

# **מאגר הידע לפרפרזה אקדמית**

## **גרסה קנונית (Canonical Knowledge Base)**

## **1. יחידת המידע הבסיסית – Sentence Unit**

כל משפט במאגר הוא יחידת נתונים מלאה עם השדות הבאים:

Sentence_ID

Sentence_Text

Category

Difficulty

Paraphrase_Level

Components

Paraphrase_Tools

Typical_Errors

Exercise_Types

Example_Paraphrase

Arabic_Explanation

Common_Arabic_Error

זו **התבנית הסופית** של המאגר.

אין צורך להוסיף שדות נוספים.

# **2. קטגוריות רטוריות (Category)**

המאגר כולל את סוגי המשפטים האופייניים לכתיבה אקדמית במדעי החברה:

Definition

Research Claim

Cause–Effect

Comparison

Hedging

Conclusion

Academic Skill

Explanation

קטגוריות אלה משקפות מבנים רטוריים נפוצים ב:

- סקירת ספרות

- מבוא למאמר

- דיון בממצאים

- מסקנות מחקר

# **3. רמות קושי (Difficulty)**

סקאלה פשוטה של שלוש רמות:

1 – פשוט

2 – בינוני

3 – מורכב

הרמה נקבעת לפי:

- אורך המשפט

- מספר פסוקיות

- מורכבות התחביר

# **4. רמת פרפרזה נדרשת (Paraphrase Level)**

1 – שינוי מילים (Lexical change)

2 – שינוי מבנה (Structure change)

3 – שינוי מבנה + ארגון מידע מחדש

זה מייצג **עומק התערבות בפרפרזה**.

# **5. פירוק מבני של המשפט (Components)**

כל משפט מפורק לרכיבים:

marker

subject

action

object

context

הפירוק מאפשר:

- הסבר מבנה המשפט

- זיהוי רכיבים חסרים

- הדרכה לשינוי חלקי של המשפט

# **6. כלי פרפרזה (Paraphrase Tools)**

רשימה סגורה של אסטרטגיות פרפרזה:

lexical_change

structure_change

information_reorder

nominalization

voice_change

modal_change

sentence_split

sentence_merge

# **7. טעויות טיפוסיות (Typical Errors)**

המאגר כולל סוגי טעויות נפוצים בפרפרזה:

minimal_change

structure_copying

meaning_shift

information_loss

information_addition

missing_component

missing_hedge

awkward_structure

incomplete_paraphrase

# **8. סוגי תרגילים (Exercise Types)**

המאגר מגדיר סוגי תרגילים אפשריים:

micro_lexical_change

micro_structure_change

component_rewrite

definition_rewrite

cause_effect_rewrite

comparison_rewrite

guided_paraphrase

full_sentence_paraphrase

# **9. תמיכה בלומדים דוברי ערבית**

המאגר כולל שני שדות ייחודיים:

### **Arabic_Explanation**

הסבר קצר בערבית של משמעות המשפט.

מטרה:

- לוודא הבנת משמעות לפני תרגול הפרפרזה.

### **Common_Arabic_Error**

תיאור טעות נפוצה של דוברי ערבית בעברית.

לדוגמה:

- תרגום מילולי

- שימוש שגוי במילות יחס

- מבנה תחבירי מושפע מערבית

# **10. מבנה הקורפוס (Sentence Corpus)**

המאגר כולל **60 משפטים** המחולקים לארבע שכבות.

Practice Sentences       30

Core Sentences           12

Decomposable Sentences   8

Paraphrase Ladder        10

סה״כ:

60 sentences

______________________

מצוין נחום.
כדי **לסגור את מאגר הידע בצורה נקייה**, כדאי לקבוע **מערכת מזהים יציבה וברורה**.
הכי נכון שה-Sentence_ID יכיל גם **קטגוריה רטורית וגם מספר סידורי**, כדי שאפשר יהיה להבין מיד איזה סוג משפט זה.

להלן **הרשימה הקנונית של 60 מזהים**.

# **רשימת Sentence_ID הסופית (60)**

## **Definition (10)**

DEF_01

DEF_02

DEF_03

DEF_04

DEF_05

DEF_06

DEF_07

DEF_08

DEF_09

DEF_10

## **Research Claim (10)**

RC_01

RC_02

RC_03

RC_04

RC_05

RC_06

RC_07

RC_08

RC_09

RC_10

## **Cause–Effect (10)**

CE_01

CE_02

CE_03

CE_04

CE_05

CE_06

CE_07

CE_08

CE_09

CE_10

## **Comparison (8)**

COMP_01

COMP_02

COMP_03

COMP_04

COMP_05

COMP_06

COMP_07

COMP_08

## **Hedging (6)**

HED_01

HED_02

HED_03

HED_04

HED_05

HED_06

## **Conclusion (6)**

CONC_01

CONC_02

CONC_03

CONC_04

CONC_05

CONC_06

## **Academic Skill / Explanation (10)**

SKILL_01

SKILL_02

SKILL_03

SKILL_04

SKILL_05

SKILL_06

SKILL_07

SKILL_08

SKILL_09

SKILL_10

# **סיכום מבנה המאגר**

**קטגוריה**

**כמות**

Definition

10

Research Claim

10

Cause–Effect

10

Comparison

8

Hedging

6

Conclusion

6

Academic Skill

10

סה״כ:

**60 Sentence Units**

# **המשמעות**

עכשיו מאגר הידע מוגדר לחלוטין ברמת המבנה:

✔ תבנית משפט
✔ קטגוריות רטוריות
✔ רשימת מזהים
✔ מספר משפטים קבוע

כלומר:

**הארכיטקטורה של המאגר סגורה.**

מה שנשאר הוא רק **מילוי התוכן לכל מזהה**.

# **היררכיית מורכבות המשפטים במאגר**

## **Difficulty 1 — משפט פשוט**

מאפיינים:

- רעיון מרכזי אחד

- מבנה תחבירי בסיסי

- ללא פסוקיות מורכבות

מבנה טיפוסי:

Subject + Verb + Object

דוגמה:

תרגול קבוע של כתיבה אקדמית משפר את יכולת הניסוח של סטודנטים.

## **Difficulty 2 — משפט בינוני**

מאפיינים:

- פסוקית אחת

- שימוש במילות קישור

- ניסוח מעט יותר אקדמי

מבנה טיפוסי:

Main clause + subordinate clause

דוגמה:

מחקרים מצביעים על כך שקריאה מרובה עשויה להרחיב את אוצר המילים של הלומדים.

## **Difficulty 3 — משפט מורכב**

מאפיינים:

- שתי פסוקיות או יותר

- מבנה מידע מורכב

- ניסוח אקדמי טיפוסי למאמרים

מבנה טיפוסי:

Main clause + embedded clauses

דוגמה:

מחקרים שונים מצביעים על כך שסטודנטים המשתתפים באופן פעיל בדיונים בכיתה נוטים להבין טוב יותר את החומר הנלמד.

# **חלוקת הקושי במאגר**

כדי ליצור התקדמות פדגוגית, כדאי לחלק את 60 המשפטים כך:

**Difficulty**

**כמות**

1 (פשוט)

20

2 (בינוני)

25

3 (מורכב)

15

# **המשמעות הפדגוגית**

הסטודנטים מתקדמים דרך שלושה שלבים:

1️⃣ פרפרזה של משפטים פשוטים
 2️⃣ שינוי מבנה במשפטים בינוניים
 3️⃣ פרפרזה של מבנים מורכבים

כך המיומנות נבנית בהדרגה.

__________________________

אילו משפטים הם **Paraphrase Ladder** (כלומר המשפטים שלגביהם נשמרות שלוש רמות פרפרזה).

המטרה היא רק **סימון פנימי במאגר**, לא שינוי במבנה כולו.

מוסיפים שדה קטן:

Paraphrase_Ladder: yes / no

לדוגמה:

Sentence_ID: RC_03

Category: Research Claim

Difficulty: 2

Paraphrase_Ladder: yes

### **יתרון גדול**

הקטגוריות הרטוריות נשארות נקיות:

- Definition

- Research Claim

- Cause–Effect

- Comparison

- Hedging

- Conclusion

- Academic Skill

והשדה החדש רק מציין שימוש פדגוגי.

# **כמה משפטים יהיו Ladder**

כפי שהגדרת קודם:

10 מתוך 60

הם יהיו מפוזרים במאגר, למשל:

DEF_03

RC_02

RC_07

CE_04

CE_09

COMP_03

COMP_06

HED_02

CONC_04

SKILL_05

# **למה זה טוב מבחינת מאגר ידע**

כך נשמרת הפרדה ברורה בין:

**מבנה רטורי של המשפט**

לבין

**אופן השימוש הפדגוגי במשפט**.

זו גישה נקייה מאוד למאגר ידע.

_____________________

# **עדכון הארכיטקטורה של Sentence Unit**

נוסיף שני שדות הסבר נוספים.

## **התבנית המעודכנת של Sentence Unit**

Sentence_ID

Sentence_Text

Category

Difficulty

Paraphrase_Level

Components

Paraphrase_Tools

Typical_Errors

Exercise_Types

Example_Paraphrase

Arabic_Explanation

English_Explanation

French_Explanation

Common_Arabic_Error

# **תפקיד שדות ההסבר**

### **Arabic_Explanation**

הסבר משמעות המשפט ללומדים דוברי ערבית.

מטרה:
 להבטיח הבנת המשמעות לפני תרגול פרפרזה.

### **English_Explanation**

הסבר קצר באנגלית.

שימושים:

- תמיכה בסטודנטים בינלאומיים

- הבהרה כאשר הסטודנט חושב דרך אנגלית

- שימוש אפשרי בקורסים דו־לשוניים

### **French_Explanation**

הסבר קצר בצרפתית.

שימושי במיוחד עבור:

- סטודנטים מצפון אפריקה

- מסגרות אקדמיות רב־לשוניות

# **כלל חשוב לשדות ההסבר**

ההסברים צריכים להיות:

- קצרים

- הסבר משמעות בלבד

- לא פרפרזה

כלומר:

✔ מה המשפט אומר
 ❌ ניסוח מחדש של המשפט

# **דוגמה קצרה לאחר העדכון**

Sentence_Text
 מחקרים רבים מצביעים על כך שקריאה מרובה תורמת להרחבת אוצר המילים של הלומדים.

Arabic_Explanation
 تشير العديد من الدراسات إلى أن القراءة الكثيرة تساعد على توسيع مفردات المتعلمين.

English_Explanation
 Many studies show that frequent reading helps learners expand their vocabulary.

French_Explanation
 De nombreuses études montrent que la lecture fréquente contribue à élargir le vocabulaire des apprenants.

__________________________

# **הנוסח שכדאי לקבוע בארכיטקטורה**

Explanation fields describe the meaning of the sentence in simpler language.
 They are not literal translations of the sentence.

# **דוגמה**

Sentence
 מחקרים רבים מצביעים על כך שקריאה מרובה תורמת להרחבת אוצר המילים של הלומדים.

Arabic Explanation

يعني هذا أن قراءة النصوص بكثرة تساعد الطلاب على تعلم كلمات جديدة وزيادة مفرداتهم.

English Explanation

The sentence means that reading a lot helps students learn more words.

French Explanation

Cette phrase explique que lire beaucoup aide les étudiants à enrichir leur vocabulaire.

שימי לב:

זה **לא תרגום**.

זה **פירוש המשמעות**.

____________________________

סגור עכשיו בצורה מסודרת את **התבנית הסופית של יחידת המשפט (Sentence Unit Template)** – כך שכל 60 המשפטים במאגר יהיו בנויים בדיוק לפי אותה ארכיטקטורה.

המטרה היא ליצור **פורמט יציב למאגר הידע**, שעל פיו נוכל להשלים את כל המשפטים בלי לשנות שוב את המבנה.

# **תבנית סופית – Sentence Unit**

## **1. מזהה המשפט**

**Sentence_ID**

מזהה ייחודי למשפט.

פורמט:

CATEGORY_NUMBER

דוגמאות:

RC_01

CE_03

DEF_02

COMP_01

HED_02

CONC_01

# **2. המשפט המקורי**

**Sentence_Text**

המשפט שעליו מתבצע תרגול הפרפרזה.

המשפט צריך להיות:

- בסגנון אקדמי

- ברור מבחינה תחבירית

- בעל רעיון אחד מרכזי

# **3. סוג רטורי**

**Category**

סוג המבנה האקדמי של המשפט.

הקטגוריות במאגר:

Definition

Research Claim

Cause–Effect

Comparison

Hedging

Conclusion

Practice

# **4. רמת מורכבות**

**Difficulty**

רמת המורכבות של המשפט.

סקאלה:

1 – פשוט

2 – בינוני

3 – מורכב

מורכבות נמדדת לפי:

- אורך המשפט

- מבנה תחבירי

- מספר רכיבי מידע

# **5. רמת הפרפרזה**

**Paraphrase_Level**

איזה שינוי נדרש מהסטודנט.

1 – שינוי מילים בלבד

2 – שינוי מבנה

3 – שינוי מבנה + ארגון מידע

# **6. פירוק מבני של המשפט**

**Components**

פירוק המשפט לרכיבים תחביריים.

הרכיבים האפשריים:

marker

subject

action

object

comparison

context

דוגמה:

marker: מחקרים רבים מצביעים על כך ש

subject: קריאה מרובה

action: תורמת

object: להרחבת אוצר המילים

context: של הלומדים

המטרה:

לאפשר לבוט להסביר את המשפט.

# **7. כלים לפרפרזה**

**Paraphrase_Tools**

טכניקות שהסטודנט יכול להשתמש בהן.

דוגמאות:

lexical_change

structure_change

information_reorder

nominalization

modal_change

# **8. טעויות נפוצות**

**Typical_Errors**

טעויות שהבוט צריך לזהות.

דוגמאות:

minimal_change

structure_copying

meaning_distortion

missing_component

# **9. סוגי תרגילים**

**Exercise_Types**

תרגילים שהבוט יכול ליצור מהמשפט.

דוגמאות:

micro_lexical_change

micro_structure_change

guided_paraphrase

full_sentence_paraphrase

definition_rewrite

cause_effect_rewrite

comparison_rewrite

# **10. דוגמת פרפרזה**

**Example_Paraphrase**

ניסוח תקין של פרפרזה למשפט.

המטרה:

להראות לסטודנט פתרון אפשרי.

# **11. הסבר משמעות בערבית**

**Arabic_Explanation**

הסבר קצר של משמעות המשפט בערבית.

לא תרגום מילולי אלא **פירוש רעיוני**.

# **12. הסבר משמעות באנגלית**

**English_Explanation**

הסבר קצר של משמעות המשפט באנגלית.

# **13. הסבר משמעות בצרפתית**

**French_Explanation**

הסבר קצר של משמעות המשפט בצרפתית.

# **14. טעות אופיינית לדוברי ערבית**

**Common_Arabic_Error**

בעיה טיפוסית של דוברי ערבית בעברית.

דוגמאות:

- תרגום מילולי

- שימוש שגוי במילות יחס

- סדר מילים ערבי

# **מבנה הנתונים הסופי**

כך נראית יחידת משפט מלאה:

Sentence_ID

Sentence_Text

Category

Difficulty

Paraphrase_Level

Components

Paraphrase_Tools

Typical_Errors

Exercise_Types

Example_Paraphrase

Arabic_Explanation

English_Explanation

French_Explanation

Common_Arabic_Error

_______________________

# **Sentence Units – Batch 1 (20)**

## **Sentence 1**

Sentence_ID
 RC_01

Sentence_Text
 מחקרים רבים מצביעים על כך שקריאה מרובה תורמת להרחבת אוצר המילים של הלומדים.

Category
 Research Claim

Difficulty
 2

Paraphrase_Level
 2

Components

marker: מחקרים רבים מצביעים על כך ש
 subject: קריאה מרובה
 action: תורמת
 object: להרחבת אוצר המילים
 context: של הלומדים

Paraphrase_Tools

lexical_change
 structure_change

Typical_Errors

minimal_change
 structure_copying

Exercise_Types

guided_paraphrase
 full_sentence_paraphrase

Example_Paraphrase

מחקרים שונים מראים כי קריאה מרובה עשויה להגדיל את אוצר המילים של לומדים.

Arabic_Explanation

تشير العديد من الدراسات إلى أن القراءة الكثيرة تساعد على توسيع المفردات لدى المتعلمين.

Common_Arabic_Error

תרגום מילולי של המבנה "מצביעים על כך ש" ללא שינוי מבני.

## **Sentence 2**

Sentence_ID
 RC_02

Sentence_Text
 נמצא כי השתתפות פעילה בדיונים בכיתה עשויה לשפר את הבנת החומר הנלמד.

Category
 Research Claim

Difficulty
 2

Paraphrase_Level
 2

Components

marker: נמצא כי
 subject: השתתפות פעילה בדיונים בכיתה
 action: עשויה לשפר
 object: את הבנת החומר הנלמד

Paraphrase_Tools

lexical_change
 structure_change

Typical_Errors

minimal_change
 missing_component

Exercise_Types

guided_paraphrase

Example_Paraphrase

מחקרים מראים כי מעורבות פעילה בדיונים בכיתה יכולה לתרום להבנה טובה יותר של החומר.

Arabic_Explanation

تبيّن أن المشاركة الفعّالة في النقاشات الصفية قد تحسن فهم المادة الدراسية.

Common_Arabic_Error

השמטת הפועל "עשויה" שמבטא הסתייגות.

## **Sentence 3**

Sentence_ID
 CE_01

Sentence_Text
 שימוש במשוב מתמשך עשוי לשפר את איכות הכתיבה האקדמית של הסטודנטים.

Category
 Cause–Effect

Difficulty
 1

Paraphrase_Level
 2

Components

subject: שימוש במשוב מתמשך
 action: עשוי לשפר
 object: את איכות הכתיבה האקדמית
 context: של הסטודנטים

Paraphrase_Tools

lexical_change
 nominalization

Typical_Errors

minimal_change
 meaning_shift

Exercise_Types

cause_effect_rewrite

Example_Paraphrase

משוב קבוע יכול לתרום לשיפור איכות הכתיבה האקדמית של סטודנטים.

Arabic_Explanation

استخدام التغذية الراجعة المستمرة قد يؤدي إلى تحسين جودة الكتابة الأكاديمية لدى الطلاب.

Common_Arabic_Error

בלבול בין "משוב" לבין "תגובה".

# **Sentence Units – תיקון מבני (4–10)**

## **Sentence 4**

Sentence_ID
 CE_02

Sentence_Text
 קריאה ביקורתית עשויה לסייע ללומדים לזהות הנחות סמויות בטקסטים אקדמיים.

Category
 Cause–Effect

Difficulty
 2

Paraphrase_Level
 2

Components

subject: קריאה ביקורתית
 action: עשויה לסייע
 object: לזהות הנחות סמויות
 context: בטקסטים אקדמיים

Paraphrase_Tools

lexical_change
 structure_change

Typical_Errors

minimal_change
 structure_copying
 meaning_shift

Exercise_Types

cause_effect_rewrite
 guided_paraphrase

Example_Paraphrase

קריאה ביקורתית יכולה לעזור ללומדים לאתר הנחות שאינן נאמרות במפורש בטקסטים אקדמיים.

Arabic_Explanation

القراءة النقدية قد تساعد المتعلمين على اكتشاف الافتراضات غير المصرح بها في النصوص الأكاديمية.

Common_Arabic_Error

תרגום מילולי של הביטוי "הנחות סמויות".

## **Sentence 5**

Sentence_ID
 COMP_01

Sentence_Text
 למידה שיתופית נמצאה יעילה יותר מלמידה יחידנית במצבים מסוימים.

Category
 Comparison

Difficulty
 2

Paraphrase_Level
 2

Components

subject: למידה שיתופית
 action: נמצאה יעילה יותר
 comparison: מלמידה יחידנית
 context: במצבים מסוימים

Paraphrase_Tools

lexical_change
 structure_change
 information_reorder

Typical_Errors

minimal_change
 structure_copying
 missing_component

Exercise_Types

comparison_rewrite
 guided_paraphrase

Example_Paraphrase

במצבים מסוימים למידה בקבוצה עשויה להיות יעילה יותר מלמידה של לומד יחיד.

Arabic_Explanation

تبيّن أن التعلم التعاوني أكثر فاعلية من التعلم الفردي في بعض الحالات.

Common_Arabic_Error

שימוש שגוי במילת היחס "מ" בהשוואה.

## **Sentence 6**

Sentence_ID
 DEF_01

Sentence_Text
 חשיבה ביקורתית היא היכולת להעריך טענות ומידע בצורה מושכלת.

Category
 Definition

Difficulty
 1

Paraphrase_Level
 1

Components

subject: חשיבה ביקורתית
 action: היא
 object: היכולת להעריך טענות ומידע
 context: בצורה מושכלת

Paraphrase_Tools

lexical_change
 structure_change

Typical_Errors

minimal_change
 meaning_shift

Exercise_Types

definition_rewrite
 micro_lexical_change

Example_Paraphrase

חשיבה ביקורתית מתייחסת ליכולת לבחון מידע וטענות באופן מושכל.

Arabic_Explanation

التفكير النقدي هو القدرة على تقييم الادعاءات والمعلومات بشكل واعٍ ومدروس.

Common_Arabic_Error

תרגום מילולי של הביטוי "בצורה מושכלת".

## **Sentence 7**

Sentence_ID
 DEF_02

Sentence_Text
 אוריינות אקדמית מתייחסת ליכולת להבין, לנתח וליצור טקסטים בהקשר האקדמי.

Category
 Definition

Difficulty
 2

Paraphrase_Level
 2

Components

subject: אוריינות אקדמית
 action: מתייחסת ליכולת
 object: להבין, לנתח וליצור טקסטים
 context: בהקשר האקדמי

Paraphrase_Tools

lexical_change
 structure_change
 sentence_split

Typical_Errors

minimal_change
 information_loss

Exercise_Types

definition_rewrite
 guided_paraphrase

Example_Paraphrase

אוריינות אקדמית היא היכולת לקרוא, לנתח ולכתוב טקסטים במסגרת האקדמיה.

Arabic_Explanation

تشير الثقافة الأكاديمية إلى القدرة على فهم النصوص وتحليلها وإنتاجها في السياق الأكاديمي.

Common_Arabic_Error

השמטת אחד מהפעלים ברשימה (להבין / לנתח / ליצור).

## **Sentence 8**

Sentence_ID
 CONC_01

Sentence_Text
 לסיכום, פיתוח מיומנויות קריאה וכתיבה הוא מרכיב מרכזי בהצלחה בלימודים אקדמיים.

Category
 Conclusion

Difficulty
 1

Paraphrase_Level
 2

Components

marker: לסיכום
 subject: פיתוח מיומנויות קריאה וכתיבה
 action: הוא
 object: מרכיב מרכזי
 context: בהצלחה בלימודים אקדמיים

Paraphrase_Tools

lexical_change
 information_reorder

Typical_Errors

minimal_change
 structure_copying

Exercise_Types

guided_paraphrase
 full_sentence_paraphrase

Example_Paraphrase

לסיכום, הצלחה בלימודים אקדמיים תלויה במידה רבה בפיתוח מיומנויות קריאה וכתיבה.

Arabic_Explanation

باختصار، تطوير مهارات القراءة والكتابة عنصر أساسي للنجاح في الدراسة الأكاديمية.

Common_Arabic_Error

שמירה על אותו סדר מידע כמו במשפט המקורי.

## **Sentence 9**

Sentence_ID
 HED_01

Sentence_Text
 ייתכן כי שימוש בטכנולוגיות למידה דיגיטליות תורם להגברת המעורבות של סטודנטים.

Category
 Hedging

Difficulty
 2

Paraphrase_Level
 2

Components

marker: ייתכן כי
 subject: שימוש בטכנולוגיות למידה דיגיטליות
 action: תורם
 object: להגברת המעורבות
 context: של סטודנטים

Paraphrase_Tools

lexical_change
 modal_change

Typical_Errors

missing_hedge
 minimal_change

Exercise_Types

guided_paraphrase
 full_sentence_paraphrase

Example_Paraphrase

נראה כי טכנולוגיות למידה דיגיטליות עשויות להגביר את מעורבות הסטודנטים בלמידה.

Arabic_Explanation

قد يكون استخدام تقنيات التعلم الرقمية عاملاً في زيادة مشاركة الطلاب.

Common_Arabic_Error

השמטת מילת ההסתייגות "ייתכן".

## **Sentence 10**

Sentence_ID
 RC_03

Sentence_Text
 מחקרים אחדים מצביעים על קשר בין קריאה ביקורתית לבין הבנה עמוקה יותר של טקסטים אקדמיים.

Category
 Research Claim

Difficulty
 2

Paraphrase_Level
 2

Components

marker: מחקרים אחדים מצביעים על קשר
 subject: קריאה ביקורתית
 action: קשורה
 object: להבנה עמוקה יותר
 context: של טקסטים אקדמיים

Paraphrase_Tools

lexical_change
 structure_change

Typical_Errors

minimal_change
 structure_copying

Exercise_Types

guided_paraphrase
 full_sentence_paraphrase

Example_Paraphrase

חוקרים מצאו כי קיים קשר בין קריאה ביקורתית לבין הבנה מעמיקה של טקסטים אקדמיים.

Arabic_Explanation

تشير بعض الدراسات إلى وجود علاقة بين القراءة النقدية والفهم العميق للنصوص الأكاديمية.

Common_Arabic_Error

תרגום מילולי של הביטוי "מצביעים על קשר".

## **Sentence 11**

Sentence_ID
 CE_03

Sentence_Text
 תרגול קבוע של כתיבה אקדמית עשוי להוביל לשיפור הדרגתי ביכולת הניסוח.

Category
 Cause–Effect

Difficulty
 1

Paraphrase_Level
 2

Components

subject: תרגול קבוע של כתיבה אקדמית
 action: עשוי להוביל
 object: לשיפור הדרגתי
 context: ביכולת הניסוח

Paraphrase_Tools

lexical_change
 structure_change
 information_reorder

Typical_Errors

minimal_change
 meaning_shift
 missing_component

Exercise_Types

cause_effect_rewrite
 guided_paraphrase

Example_Paraphrase

כאשר סטודנטים מתרגלים כתיבה אקדמית באופן קבוע, יכולת הניסוח שלהם משתפרת בהדרגה.

Arabic_Explanation

قد يؤدي التدريب المنتظم على الكتابة الأكاديمية إلى تحسين تدريجي في القدرة على الصياغة.

Common_Arabic_Error

השמטת הקשר הסיבתי בין התרגול לבין השיפור.

## **Sentence 12**

Sentence_ID
 COMP_02

Sentence_Text
 קריאה ביקורתית דורשת מעורבות קוגניטיבית גבוהה יותר מקריאה שטחית.

Category
 Comparison

Difficulty
 2

Paraphrase_Level
 2

Components

subject: קריאה ביקורתית
 action: דורשת
 object: מעורבות קוגניטיבית גבוהה יותר
 comparison: מקריאה שטחית

Paraphrase_Tools

lexical_change
 structure_change

Typical_Errors

minimal_change
 structure_copying

Exercise_Types

comparison_rewrite
 guided_paraphrase

Example_Paraphrase

בהשוואה לקריאה שטחית, קריאה ביקורתית מחייבת מעורבות קוגניטיבית רבה יותר.

Arabic_Explanation

تتطلب القراءة النقدية مشاركة معرفية أكبر مقارنة بالقراءة السطحية.

Common_Arabic_Error

שימוש שגוי במבנה ההשוואה או השמטת החלק ההשוואתי.

## **Sentence 13**

Sentence_ID
 RC_04

Sentence_Text
 מחקרים מצביעים על כך שמעורבות פעילה בלמידה עשויה לשפר את הישגי הסטודנטים.

Category
 Research Claim

Difficulty
 2

Paraphrase_Level
 2

Components

marker: מחקרים מצביעים על כך ש
 subject: מעורבות פעילה בלמידה
 action: עשויה לשפר
 object: את הישגי הסטודנטים

Paraphrase_Tools

lexical_change
 structure_change

Typical_Errors

minimal_change
 missing_hedge

Exercise_Types

guided_paraphrase
 full_sentence_paraphrase

Example_Paraphrase

מחקרים שונים מראים כי השתתפות פעילה בתהליך הלמידה יכולה לתרום לשיפור הישגים אקדמיים.

Arabic_Explanation

تشير الدراسات إلى أن المشاركة النشطة في التعلم قد تحسن تحصيل الطلاب.

Common_Arabic_Error

השמטת מילת ההסתייגות "עשויה".

## **Sentence 14**

Sentence_ID
 CE_04

Sentence_Text
 עבודה עם מקורות מידע מגוונים עשויה להעמיק את הבנת הנושא הנלמד.

Category
 Cause–Effect

Difficulty
 1

Paraphrase_Level
 2

Components

subject: עבודה עם מקורות מידע מגוונים
 action: עשויה להעמיק
 object: את הבנת הנושא
 context: הנלמד

Paraphrase_Tools

lexical_change
 structure_change

Typical_Errors

minimal_change
 meaning_shift

Exercise_Types

cause_effect_rewrite
 guided_paraphrase

Example_Paraphrase

שימוש במקורות מידע שונים יכול לסייע ללומדים להבין את הנושא בצורה מעמיקה יותר.

Arabic_Explanation

العمل مع مصادر معلومات متنوعة قد يعمق فهم الموضوع المدروس.

Common_Arabic_Error

תרגום מילולי של הביטוי "להעמיק את ההבנה".

## **Sentence 15**

Sentence_ID
 DEF_03

Sentence_Text
 למידה עצמאית היא היכולת של הלומד לנהל את תהליך הלמידה שלו באופן עצמאי.

Category
 Definition

Difficulty
 2

Paraphrase_Level
 2

Components

subject: למידה עצמאית
 action: היא
 object: היכולת של הלומד לנהל את תהליך הלמידה שלו
 context: באופן עצמאי

Paraphrase_Tools

lexical_change
 structure_change

Typical_Errors

minimal_change
 structure_copying

Exercise_Types

definition_rewrite
 guided_paraphrase

Example_Paraphrase

למידה עצמאית מתארת מצב שבו הלומד מנהל את תהליך הלמידה שלו בכוחות עצמו.

Arabic_Explanation

التعلم الذاتي هو قدرة المتعلم على إدارة عملية تعلمه بشكل مستقل.

Common_Arabic_Error

שמירה על אותו מבנה תחבירי כמו במשפט המקורי.

## **Sentence 16**

Sentence_ID
 HED_02

Sentence_Text
 נראה כי שילוב דיונים בכיתה עשוי לעודד חשיבה ביקורתית בקרב סטודנטים.

Category
 Hedging

Difficulty
 2

Paraphrase_Level
 2

Components

marker: נראה כי
 subject: שילוב דיונים בכיתה
 action: עשוי לעודד
 object: חשיבה ביקורתית
 context: בקרב סטודנטים

Paraphrase_Tools

lexical_change
 modal_change

Typical_Errors

missing_hedge
 minimal_change

Exercise_Types

guided_paraphrase
 full_sentence_paraphrase

Example_Paraphrase

ייתכן כי דיונים בכיתה תורמים לפיתוח חשיבה ביקורתית אצל סטודנטים.

Arabic_Explanation

يبدو أن دمج النقاشات الصفية قد يشجع التفكير النقدي لدى الطلاب.

Common_Arabic_Error

השמטת מילת ההסתייגות "נראה".

## **Sentence 17**

Sentence_ID
 CONC_02

Sentence_Text
 ממצאים אלה מצביעים על חשיבותה של קריאה ביקורתית בלמידה האקדמית.

Category
 Conclusion

Difficulty
 2

Paraphrase_Level
 2

Components

subject: ממצאים אלה
 action: מצביעים על
 object: חשיבותה של קריאה ביקורתית
 context: בלמידה האקדמית

Paraphrase_Tools

lexical_change
 structure_change

Typical_Errors

minimal_change
 meaning_shift

Exercise_Types

guided_paraphrase
 full_sentence_paraphrase

Example_Paraphrase

ממצאי המחקר מדגישים את חשיבות הקריאה הביקורתית בתהליך הלמידה האקדמית.

Arabic_Explanation

تشير هذه النتائج إلى أهمية القراءة النقدية في التعلم الأكاديمي.

Common_Arabic_Error

תרגום מילולי של הביטוי "מצביעים על".

## **Sentence 18**

Sentence_ID
 RC_05

Sentence_Text
 מחקרים עדכניים מציעים כי שימוש במשוב מתמשך עשוי לשפר את איכות עבודות הסטודנטים.

Category
 Research Claim

Difficulty
 2

Paraphrase_Level
 2

Components

marker: מחקרים עדכניים מציעים כי
 subject: שימוש במשוב מתמשך
 action: עשוי לשפר
 object: את איכות עבודות הסטודנטים

Paraphrase_Tools

lexical_change
 structure_change

Typical_Errors

minimal_change
 missing_hedge

Exercise_Types

guided_paraphrase
 full_sentence_paraphrase

Example_Paraphrase

מחקרים חדשים מראים כי משוב מתמשך יכול לתרום לשיפור איכות העבודות של סטודנטים.

Arabic_Explanation

تشير الدراسات الحديثة إلى أن التغذية الراجعة المستمرة قد تحسن جودة أعمال الطلاب.

Common_Arabic_Error

תרגום מילולי של הביטוי "מציעים כי".

## **Sentence 19**

Sentence_ID
 COMP_03

Sentence_Text
 למידה פעילה נמצאה יעילה יותר מהקשבה פסיבית בהרצאות מסוימות.

Category
 Comparison

Difficulty
 1

Paraphrase_Level
 2

Components

subject: למידה פעילה
 action: נמצאה יעילה יותר
 comparison: מהקשבה פסיבית
 context: בהרצאות מסוימות

Paraphrase_Tools

lexical_change
 structure_change

Typical_Errors

minimal_change
 missing_component

Exercise_Types

comparison_rewrite
 guided_paraphrase

Example_Paraphrase

בכמה מצבים נמצא כי למידה פעילה יעילה יותר מהאזנה פסיבית להרצאות.

Arabic_Explanation

تبيّن أن التعلم النشط أكثر فاعلية من الاستماع السلبي في بعض المحاضرات.

Common_Arabic_Error

השמטת חלק ההשוואה במשפט.

## **Sentence 20**

Sentence_ID
 CE_05

Sentence_Text
 קריאה של מקורות מחקריים עשויה להרחיב את הבנת הסטודנטים לגבי נושא מסוים.

Category
 Cause–Effect

Difficulty
 1

Paraphrase_Level
 2

Components

subject: קריאה של מקורות מחקריים
 action: עשויה להרחיב
 object: את הבנת הסטודנטים
 context: לגבי נושא מסוים

Paraphrase_Tools

lexical_change
 structure_change

Typical_Errors

minimal_change
 meaning_shift

Exercise_Types

cause_effect_rewrite
 guided_paraphrase

Example_Paraphrase

כאשר סטודנטים קוראים מקורות מחקריים, הם עשויים להבין טוב יותר את הנושא הנלמד.

Arabic_Explanation

قراءة المصادر البحثية قد توسع فهم الطلاب لموضوع معين.

Common_Arabic_Error

שמירה על אותו סדר מילים כמו במשפט המקורי.

עברתי על **Batch 1 (משפטים 1–20)** וביצעתי **תיקוני נוסח מינימליים בלבד**, כדי לשפר:

- דיוק אקדמי

- זרימה תחבירית

- טבעיות בעברית אקדמית

- התאמה לפרפרזה

שמרתי בכוונה על שלושה דברים:

1️⃣ מבנה המשפט המקורי
 2️⃣ רמת הקושי
 3️⃣ האפשרות לפרפרזה

כלומר מדובר **בליטוש ניסוח**, לא שינוי תוכן.

אציג רק את השדה שצריך תיקון: **Sentence_Text**.

# **תיקוני נוסח – Sentence_Text**

## **RC_01**

נוסח קודם:

מחקרים רבים מצביעים על כך שקריאה מרובה תורמת להרחבת אוצר המילים של הלומדים.

תיקון:
 ✔ אין צורך בתיקון.

## **RC_02**

נוסח קודם:

נמצא כי השתתפות פעילה בדיונים בכיתה עשויה לשפר את הבנת החומר הנלמד.

תיקון מוצע:

נמצא כי השתתפות פעילה בדיונים בכיתה עשויה לשפר את הבנת החומר.

סיבה:
 המילה **"הנלמד"** מיותרת.

## **CE_01**

נוסח קודם:

שימוש במשוב מתמשך עשוי לשפר את איכות הכתיבה האקדמית של הסטודנטים.

תיקון:
 ✔ תקין.

## **CE_02**

נוסח קודם:

קריאה ביקורתית עשויה לסייע ללומדים לזהות הנחות סמויות בטקסטים אקדמיים.

תיקון:
 ✔ תקין.

## **COMP_01**

נוסח קודם:

למידה שיתופית נמצאה יעילה יותר מלמידה יחידנית במצבים מסוימים.

תיקון מוצע:

במצבים מסוימים למידה שיתופית נמצאה יעילה יותר מלמידה יחידנית.

סיבה:
 זרימה טובה יותר.

## **DEF_01**

נוסח קודם:

חשיבה ביקורתית היא היכולת להעריך טענות ומידע בצורה מושכלת.

תיקון מוצע:

חשיבה ביקורתית היא היכולת להעריך מידע וטענות באופן מושכל.

סיבה:
 סדר טבעי יותר.

## **DEF_02**

נוסח קודם:

אוריינות אקדמית מתייחסת ליכולת להבין, לנתח וליצור טקסטים בהקשר האקדמי.

תיקון:
 ✔ תקין מאוד.

## **CONC_01**

נוסח קודם:

לסיכום, פיתוח מיומנויות קריאה וכתיבה הוא מרכיב מרכזי בהצלחה בלימודים אקדמיים.

תיקון:
 ✔ תקין.

## **HED_01**

נוסח קודם:

ייתכן כי שימוש בטכנולוגיות למידה דיגיטליות תורם להגברת המעורבות של סטודנטים.

תיקון מוצע:

ייתכן כי שימוש בטכנולוגיות למידה דיגיטליות תורם להגברת מעורבות הסטודנטים.

סיבה:
 מבנה טבעי יותר.

## **RC_03**

נוסח קודם:

מחקרים אחדים מצביעים על קשר בין קריאה ביקורתית לבין הבנה עמוקה יותר של טקסטים אקדמיים.

תיקון:
 ✔ תקין.

## **CE_03**

נוסח קודם:

תרגול קבוע של כתיבה אקדמית עשוי להוביל לשיפור הדרגתי ביכולת הניסוח.

תיקון מוצע:

תרגול קבוע של כתיבה אקדמית עשוי להוביל לשיפור הדרגתי ביכולת הניסוח של הסטודנטים.

סיבה:
 הבהרת הנושא.

## **COMP_02**

נוסח קודם:

קריאה ביקורתית דורשת מעורבות קוגניטיבית גבוהה יותר מקריאה שטחית.

תיקון:
 ✔ תקין.

## **RC_04**

נוסח קודם:

מחקרים מצביעים על כך שמעורבות פעילה בלמידה עשויה לשפר את הישגי הסטודנטים.

תיקון:
 ✔ תקין.

## **CE_04**

נוסח קודם:

עבודה עם מקורות מידע מגוונים עשויה להעמיק את הבנת הנושא הנלמד.

תיקון מוצע:

עבודה עם מקורות מידע מגוונים עשויה להעמיק את הבנת הנושא.

סיבה:
 המילה **הנלמד** מיותרת.

## **DEF_03**

נוסח קודם:

למידה עצמאית היא היכולת של הלומד לנהל את תהליך הלמידה שלו באופן עצמאי.

תיקון מוצע:

למידה עצמאית היא היכולת של הלומד לנהל את תהליך הלמידה באופן עצמאי.

סיבה:
 קיצור ניסוח.

## **HED_02**

נוסח קודם:

נראה כי שילוב דיונים בכיתה עשוי לעודד חשיבה ביקורתית בקרב סטודנטים.

תיקון מוצע:

נראה כי שילוב דיונים בכיתה עשוי לעודד חשיבה ביקורתית בקרב הסטודנטים.

## **CONC_02**

נוסח קודם:

ממצאים אלה מצביעים על חשיבותה של קריאה ביקורתית בלמידה האקדמית.

תיקון:
 ✔ תקין.

## **RC_05**

נוסח קודם:

מחקרים עדכניים מציעים כי שימוש במשוב מתמשך עשוי לשפר את איכות עבודות הסטודנטים.

תיקון:
 ✔ תקין.

## **COMP_03**

נוסח קודם:

למידה פעילה נמצאה יעילה יותר מהקשבה פסיבית בהרצאות מסוימות.

תיקון מוצע:

בהרצאות מסוימות למידה פעילה נמצאה יעילה יותר מהקשבה פסיבית.

סיבה:
 זרימה טובה יותר.

## **CE_05**

נוסח קודם:

קריאה של מקורות מחקריים עשויה להרחיב את הבנת הסטודנטים לגבי נושא מסוים.

תיקון מוצע:

קריאה במקורות מחקריים עשויה להרחיב את הבנת הסטודנטים בנושא מסוים.

סיבה:
 עברית טבעית יותר.

___________________

יצרתי **טבלה מסודרת עבור המשפטים 1–20** עם שלושת שדות ההסבר:
 Arabic / English / French.

בכולם הקפדתי על העיקרון שקבענו:
 ✔ **הסבר משמעות
** ✔ לא תרגום מילולי של המשפט
 ✔ ניסוח פשוט יחסית ללומדים.

# **Multilingual Meaning Explanations – Sentences 1–20**

**Sentence**

**Arabic Explanation**

**English Explanation**

**French Explanation**

1

يعني هذا أن قراءة النصوص بكثرة تساعد الطلاب على تعلم كلمات جديدة وزيادة مفرداتهم.

The sentence means that reading many texts helps students learn new words and expand their vocabulary.

Cela signifie que lire beaucoup de textes aide les étudiants à apprendre de nouveaux mots et à enrichir leur vocabulaire.

2

المقصود أن الطلاب يفهمون المادة بشكل أفضل عندما يشاركون بفعالية في النقاشات داخل الصف.

The idea is that students understand the material better when they actively participate in class discussions.

L'idée est que les étudiants comprennent mieux la matière lorsqu'ils participent activement aux discussions en classe.

3

المعنى هو أن حصول الطلاب على ملاحظات مستمرة حول كتابتهم يساعدهم على تحسين الكتابة الأكاديمية.

The sentence explains that when students receive continuous feedback, their academic writing improves.

La phrase explique que lorsque les étudiants reçoivent des commentaires réguliers, leur écriture académique s'améliore.

4

المقصود أن القراءة النقدية تساعد الطلاب على الانتباه إلى أفكار أو افتراضات لا يذكرها الكاتب بشكل مباشر.

The idea is that critical reading helps students notice ideas or assumptions that the writer does not state directly.

L'idée est que la lecture critique aide les étudiants à repérer des idées ou des suppositions que l'auteur n'exprime pas directement.

5

يعني هذا أن التعلم أو العمل مع الآخرين قد يكون أحيانًا أكثر فائدة من التعلم بشكل فردي.

The sentence means that learning together with others can sometimes be more effective than learning alone.

Cela signifie qu'apprendre avec d'autres peut parfois être plus efficace qu'apprendre seul.

6

المقصود بالتفكير النقدي هو قدرة الشخص على فحص المعلومات والأفكار وعدم قبولها مباشرة دون تفكير.

Critical thinking means being able to examine information and ideas instead of accepting them immediately.

La pensée critique signifie être capable d'examiner les informations et les idées au lieu de les accepter immédiatement.

7

المقصود هو قدرة الطالب على قراءة النصوص الأكاديمية وفهمها وتحليلها وكتابة نصوص مشابهة في الجامعة.

Academic literacy means the ability to read, understand, analyze, and write academic texts.

La littératie académique est la capacité de lire, comprendre, analyser et produire des textes académiques.

8

المعنى أن الطلاب ينجحون في دراستهم الجامعية عندما يطورون مهارات القراءة والكتابة الأكاديمية.

The idea is that students succeed in their studies when they develop strong reading and writing skills.

L'idée est que les étudiants réussissent dans leurs études lorsqu'ils développent des compétences en lecture et en écriture.

9

المقصود أن استخدام أدوات التعلم الرقمية قد يجعل الطلاب أكثر مشاركة ونشاطًا في التعلم.

The sentence suggests that digital learning tools may help students become more engaged in learning.

La phrase suggère que les outils d'apprentissage numériques peuvent rendre les étudiants plus engagés dans l'apprentissage.

10

المعنى أن الطلاب الذين يقرؤون النصوص بطريقة نقدية يفهمونها بشكل أعمق.

The idea is that students who read texts critically usually understand them more deeply.

L'idée est que les étudiants qui lisent les textes de manière critique les comprennent plus profondément.

11

المقصود أن ممارسة الكتابة الأكاديمية بشكل منتظم تساعد الطلاب على تحسين طريقة التعبير لديهم.

The sentence means that practicing academic writing regularly helps students improve how they express their ideas.

La phrase signifie que pratiquer régulièrement l'écriture académique aide les étudiants à améliorer leur expression.

12

المعنى أن القراءة النقدية تحتاج إلى تفكير وتركيز أكثر من القراءة السريعة أو السطحية.

The idea is that critical reading requires more thinking and concentration than superficial reading.

L'idée est que la lecture critique demande plus de réflexion et de concentration que la lecture superficielle.

13

المقصود أن الطلاب يحققون نتائج أفضل عندما يكونون نشطين ويشاركون في عملية التعلم.

The sentence explains that students achieve better results when they actively participate in learning.

La phrase explique que les étudiants obtiennent de meilleurs résultats lorsqu'ils participent activement à l'apprentissage.

14

المعنى أن قراءة معلومات من مصادر مختلفة تساعد الطلاب على فهم الموضوع بشكل أعمق.

The idea is that reading information from different sources helps students understand a topic more deeply.

L'idée est que lire des informations provenant de différentes sources aide les étudiants à mieux comprendre un sujet.

15

المقصود أن الطالب في التعلم الذاتي يكون مسؤولًا عن تنظيم تعلمه بنفسه.

The sentence means that in self-directed learning the student is responsible for managing their own learning.

La phrase signifie que dans l'apprentissage autonome, l'étudiant est responsable de l'organisation de son apprentissage.

16

المعنى أن النقاشات داخل الصف قد تساعد الطلاب على التفكير بطريقة أكثر نقدية.

The idea is that classroom discussions may encourage students to think more critically.

L'idée est que les discussions en classe peuvent encourager les étudiants à penser de manière plus critique.

17

المقصود أن هذه النتائج تظهر أن القراءة النقدية مهمة لنجاح الطلاب في التعلم الجامعي.

The sentence means that the results show the importance of critical reading in academic learning.

La phrase signifie que ces résultats montrent l'importance de la lecture critique dans l'apprentissage universitaire.

18

المعنى أن حصول الطلاب على ملاحظات مستمرة حول أعمالهم يساعدهم على تحسين جودة هذه الأعمال.

The idea is that continuous feedback helps students improve the quality of their work.

L'idée est que des commentaires continus aident les étudiants à améliorer la qualité de leur travail.

19

المقصود أن مشاركة الطلاب في التعلم تجعل فهمهم أفضل من مجرد الاستماع فقط.

The sentence means that active participation helps students understand better than only listening.

La phrase signifie que la participation active aide les étudiants à mieux comprendre que la simple écoute.

20

المعنى أن قراءة الدراسات والمصادر العلمية تساعد الطلاب على فهم الموضوع بشكل أعمق.

The idea is that reading research sources helps students gain a deeper understanding of a topic.

L'idée est que lire des sources de recherche aide les étudiants à comprendre un sujet plus profondément.

## **מצב המאגר לאחר שלב זה**

יש כעת עבור משפטים **1–20**:

✔ Sentence_Text
 ✔ Example_Paraphrase
 ✔ Arabic_Explanation
 ✔ **English_Explanation
** ✔ **French_Explanation**

כלומר **יחידות הנתונים המלאות הראשונות במאגר**.

___________________________________

# **המבנה הסופי של Sentence Unit**

_(Paraphrase Training Knowledge Base – Final Schema)_

## **1. זיהוי המשפט**

**Sentence_ID
** מזהה ייחודי של המשפט.

דוגמאות:
 DEF_01
 RC_02
 CE_03
 COMP_01

## **2. המשפט המקורי**

**Sentence_Text
** המשפט המקורי שעליו מבוצע התרגול.

זהו המשפט שהסטודנט מקבל לפרפרזה.

## **3. סוג רטורי**

**Category**

סוג המשפט מבחינת מבנה רטורי.

הקטגוריות במאגר:

- Definition

- Research Claim

- Cause–Effect

- Comparison

- Hedging

- Conclusion

- Practice

קטגוריה זו עוזרת לבוט להבין **איזה סוג תרגיל להפעיל**.

## **4. רמת מורכבות**

**Difficulty**

רמת הקושי הלשונית והמבנית של המשפט.

סקאלה:

1 — פשוט
 2 — בינוני
 3 — מורכב

הרמה נקבעת לפי:

- אורך המשפט

- מספר רכיבים תחביריים

- מורכבות אוצר המילים

## **5. עומק הפרפרזה**

**Paraphrase_Level**

רמת השינוי הנדרשת.

1 — שינוי מילים
 2 — שינוי מבנה
 3 — שינוי מבנה + ארגון מידע

השדה הזה מנחה את הבוט **איזה סוג פרפרזה לבקש**.

# **6. פירוק מבני של המשפט**

**Components**

זהו אחד השדות החשובים ביותר במאגר.

הוא מפרק את המשפט לרכיבים.

מבנה טיפוסי:

marker
 subject
 action
 object
 context

דוגמה:

marker: מחקרים מראים כי
 subject: שימוש בטכנולוגיות למידה
 action: עשוי לשפר
 object: את מעורבות הסטודנטים
 context: בשיעור

הפירוק מאפשר לבוט:

✔ להסביר את המשפט
 ✔ לזהות מה השתנה בפרפרזה
 ✔ להציע תרגילי שינוי ממוקדים

# **7. כלים לפרפרזה**

**Paraphrase_Tools**

כלים אפשריים לפרפרזה.

רשימה טיפוסית:

- lexical_change

- structure_change

- information_reorder

- nominalization

- modal_change

הבוט יכול להשתמש ברשימה כדי:

- להציע תרגיל

- להסביר טעות

# **8. טעויות נפוצות**

**Typical_Errors**

טעויות שמאפיינות תלמידים בפרפרזה.

לדוגמה:

- minimal_change

- structure_copying

- meaning_distortion

- missing_component

זה מאפשר לבוט **לאבחן את סוג הטעות**.

# **9. סוגי תרגילים**

**Exercise_Types**

תרגילים שהבוט יכול להפעיל על המשפט.

לדוגמה:

- micro_lexical_change

- micro_structure_change

- full_sentence_paraphrase

- definition_rewrite

- cause_effect_rewrite

- comparison_rewrite

# **10. דוגמת פרפרזה**

**Example_Paraphrase**

דוגמה לפרפרזה נכונה.

המטרה:

✔ לתת מודל לסטודנט
 ✔ לאפשר לבוט להציג פתרון

# **11. הסבר משמעות**

כאן מגיע החלק שנוסף לאחרונה.

המטרה היא **הבנת משמעות**, לא תרגום.

### **Arabic_Explanation**

הסבר בערבית ללומדים דוברי ערבית.

### **English_Explanation**

הסבר באנגלית ללומדים בינלאומיים.

### **French_Explanation**

הסבר בצרפתית ללומדים דוברי צרפתית.

הסבר זה עוזר לסטודנט להבין:

✔ מה המשפט אומר
 ✔ לפני שהוא מנסה לפרפרז.

# **12. טעויות אופייניות לדוברי ערבית**

**Common_Arabic_Error**

טעויות טיפוסיות של דוברי ערבית בעברית.

לדוגמה:

- תרגום מילולי

- שימוש שגוי במילות יחס

- מבנה תחבירי ערבי

השדה הזה מאפשר לבוט לתת **משוב מותאם לשפה**.

# **13. Paraphrase Ladder (רכיב מתקדם)**

זהו שדה חדש.

הוא קיים **רק בחלק מהמשפטים**.

מבנה:

Original
 Level_1_Lexical
 Level_2_Structure
 Level_3_Reorganization

דוגמה:

Original
 מחקרים מראים כי שימוש בטכנולוגיות למידה עשוי לשפר את מעורבות הסטודנטים.

Level 1
 מחקרים מצביעים על כך שטכנולוגיות למידה יכולות להגביר את מעורבות הסטודנטים.

Level 2
 מעורבות הסטודנטים עשויה לגדול כאשר משתמשים בטכנולוגיות למידה.

Level 3
 שילוב טכנולוגיות למידה עשוי להוביל למעורבות גבוהה יותר של סטודנטים.

# **התבנית הסופית (Summary Schema)**

כל Sentence Unit כולל:

Sentence_ID

Sentence_Text

Category

Difficulty

Paraphrase_Level

Components

Paraphrase_Tools

Typical_Errors

Exercise_Types

Example_Paraphrase

Arabic_Explanation

English_Explanation

French_Explanation

Common_Arabic_Error

Paraphrase_Ladder (optional)

# **המשמעות של הסגירה הזו**

המאגר שלך עכשיו הוא:

**Knowledge Base פדגוגי מובנה.**

זה לא רק אוסף משפטים.

זה מאפשר לבוט:

✔ להסביר
 ✔ לתרגל
 ✔ לאבחן
 ✔ לתת משוב
 ✔ להתאים לשפה

במילים אחרות:

זה כבר **Paraphrase Training Engine**.

_________________________________

להלן **הנוסח המעודכן והסגור של מבנה יחידת המשפט (Sentence Unit)** לאחר כל השינויים שביצענו במהלך העבודה על משפטים **1–20**.
 העדכון משקף בדיוק את מה שקבענו בפועל:

- הוספת הסברים רב־לשוניים (ערבית, אנגלית, צרפתית)

- הפרדה בין הסבר משמעות לבין תרגום

- התאמה ללומדים מהגרים ולדוברי עברית

- Paraphrase Ladder כשדה אופציונלי

- היררכיית קושי ברורה

המטרה היא שיהיה **מסמך אחד רשמי של התבנית**, שעל פיו ייבנו כל 60 המשפטים במאגר.

# **מבנה סופי של יחידת משפט**

Paraphrase Training Knowledge Base – Final Sentence Unit Schema

## **1. זיהוי המשפט**

**Sentence_ID**

מזהה ייחודי של המשפט במאגר.

מבנה הקוד כולל:

סוג המשפט + מספר סידורי

דוגמאות:

DEF_01
 RC_02
 CE_03
 COMP_01
 HED_01
 CONC_01

הקידוד מאפשר לבוט להבין את סוג המשפט כבר משלב הזיהוי.

# **2. המשפט המקורי**

**Sentence_Text**

המשפט האקדמי שעליו מתבצע תרגול הפרפרזה.

המשפטים נכתבים בסגנון:

- מאמרים במדעי החברה

- טקסטים אקדמיים

- כתיבה מחקרית

# **3. קטגוריה רטורית**

**Category**

סוג המשפט מבחינת תפקידו בכתיבה אקדמית.

הקטגוריות במאגר:

Definition
 Research Claim
 Cause–Effect
 Comparison
 Hedging
 Conclusion
 Practice

הקטגוריה מאפשרת לבוט:

- לזהות מבנה רטורי

- להציע תרגיל מתאים

# **4. רמת מורכבות**

**Difficulty**

רמת המורכבות הלשונית והתחבירית של המשפט.

סקאלה:

1 — משפט פשוט
 2 — משפט בינוני
 3 — משפט מורכב

הקושי נקבע לפי:

- אורך המשפט

- מספר רכיבים תחביריים

- מורכבות אוצר המילים

# **5. עומק הפרפרזה**

**Paraphrase_Level**

רמת השינוי הנדרשת מהסטודנט.

1 — שינוי מילים בלבד
 2 — שינוי מבנה המשפט
 3 — שינוי מבנה וארגון מידע

שדה זה מאפשר לבוט לבחור את סוג התרגיל.

# **6. פירוק מבני של המשפט**

**Components**

פירוק המשפט לרכיבים תחביריים ורעיוניים.

מבנה טיפוסי:

marker
 subject
 action
 object
 context

דוגמה:

marker: מחקרים מצביעים על כך ש
 subject: שימוש בטכנולוגיות למידה
 action: עשוי לשפר
 object: את מעורבות הסטודנטים
 context: בשיעור

הפירוק מאפשר לבוט:

- להסביר את המשפט

- לבקש שינוי ברכיב מסוים

- לזהות רכיב חסר בפרפרזה

# **7. כלים לפרפרזה**

**Paraphrase_Tools**

רשימת כלים אפשריים לפרפרזה.

לדוגמה:

lexical_change
 structure_change
 information_reorder
 nominalization
 modal_change

הרשימה מאפשרת לבוט:

- להסביר איך לבצע פרפרזה

- להציע תרגיל ממוקד

# **8. טעויות נפוצות**

**Typical_Errors**

טעויות אופייניות של סטודנטים בפרפרזה.

דוגמאות:

minimal_change
 structure_copying
 meaning_distortion
 missing_component

הבוט משתמש בשדה זה כדי:

- לזהות סוג טעות

- לתת משוב מותאם

# **9. סוגי תרגילים**

**Exercise_Types**

סוגי תרגול שהבוט יכול להפעיל על המשפט.

לדוגמה:

micro_lexical_change
 micro_structure_change
 full_sentence_paraphrase
 definition_rewrite
 cause_effect_rewrite
 comparison_rewrite

כך הבוט יכול להפעיל **תרגול מדורג**.

# **10. דוגמת פרפרזה**

**Example_Paraphrase**

דוגמה לפרפרזה תקינה של המשפט.

המטרה:

- לתת מודל לסטודנט

- לאפשר לבוט להציג פתרון

# **11. הסבר משמעות המשפט**

השדה הזה נוסף במיוחד עבור תלמידים שאינם דוברי עברית.

המטרה היא **להסביר את המשמעות**, לא לתרגם מילולית.

## **Arabic_Explanation**

הסבר בערבית למשמעות המשפט.

עוזר ללומדים:

- להבין את הרעיון המרכזי

- לפני ביצוע הפרפרזה

## **English_Explanation**

הסבר באנגלית למשמעות המשפט.

מיועד ללומדים בינלאומיים.

## **French_Explanation**

הסבר בצרפתית למשמעות המשפט.

# **12. טעויות אופייניות לדוברי ערבית**

**Common_Arabic_Error**

טעויות אופייניות של דוברי ערבית בעברית.

דוגמאות:

תרגום מילולי מערבית
 שימוש שגוי במילות יחס
 מבנה תחבירי ערבי

המידע מאפשר לבוט לתת **משוב מותאם ללומד**.

# **13. Paraphrase Ladder (רכיב מתקדם)**

שדה זה קיים **רק בחלק מהמשפטים**.

הוא מציג שלוש דרגות פרפרזה.

מבנה:

Original
 Level_1_Lexical
 Level_2_Structure
 Level_3_Reorganization

דוגמה:

Original
 מחקרים מראים כי שימוש בטכנולוגיות למידה עשוי לשפר את מעורבות הסטודנטים.

Level 1
 מחקרים מצביעים על כך שטכנולוגיות למידה יכולות להגביר את מעורבות הסטודנטים.

Level 2
 מעורבות הסטודנטים עשויה לגדול כאשר משתמשים בטכנולוגיות למידה.

Level 3
 שילוב טכנולוגיות למידה עשוי להוביל למעורבות גבוהה יותר של סטודנטים.

# **הסכמה הסופית של Sentence Unit**

Sentence_ID

Sentence_Text

Category

Difficulty

Paraphrase_Level

Components

Paraphrase_Tools

Typical_Errors

Exercise_Types

Example_Paraphrase

Arabic_Explanation

English_Explanation

French_Explanation

Common_Arabic_Error

Paraphrase_Ladder (optional)

# **מצב המאגר אחרי העדכון**

המאגר כולל כרגע:

20 Sentence Units מלאים
 מבנה נתונים אחיד
 הסברים רב־לשוניים
 זיהוי טעויות ללומדים דוברי ערבית
 תבנית Paraphrase Ladder

כלומר נוצר למעשה:

**Academic Paraphrase Training Knowledge Base – Version 1**

שניתן כבר לחבר לבוט ההוראה.

_________________________________

להלן **הנוסח המלא והמעודכן של Sentence Units 1–10**, בהתאם לתבנית הארכיטקטונית שסגרנו.

כל יחידה כוללת עכשיו את כל השדות:

- Sentence_ID

- Sentence_Text

- Category

- Difficulty

- Paraphrase_Level

- Components

- Paraphrase_Tools

- Typical_Errors

- Exercise_Types

- Example_Paraphrase

- Arabic_Explanation

- English_Explanation

- French_Explanation

- Common_Arabic_Error

הקפדתי על:

✔ תיקוני נוסח בעברית
 ✔ הסברים שאינם תרגום מילולי
 ✔ אחידות בשדות.

# **Sentence Units – Batch 1 (1–10)**

# **Sentence 1**

Sentence_ID
 RC_01

Sentence_Text
 מחקרים רבים מצביעים על כך שקריאה מרובה תורמת להרחבת אוצר המילים של הלומדים.

Category
 Research Claim

Difficulty
 2

Paraphrase_Level
 2

Components
 marker: מחקרים רבים מצביעים על כך ש
 subject: קריאה מרובה
 action: תורמת
 object: להרחבת אוצר המילים
 context: של הלומדים

Paraphrase_Tools
 lexical_change
 structure_change

Typical_Errors
 minimal_change
 structure_copying

Exercise_Types
 guided_paraphrase
 full_sentence_paraphrase

Example_Paraphrase
 מחקרים שונים מראים כי קריאה מרובה עשויה להגדיל את אוצר המילים של לומדים.

Arabic_Explanation
 يعني هذا أن قراءة النصوص بكثرة تساعد الطلاب على تعلم كلمات جديدة وزيادة مفرداتهم.

English_Explanation
 The sentence means that reading many texts helps students learn new words and expand their vocabulary.

French_Explanation
 Cela signifie que lire beaucoup de textes aide les étudiants à apprendre de nouveaux mots et à enrichir leur vocabulaire.

Common_Arabic_Error
 תרגום מילולי של המבנה "מצביעים על כך ש" ללא שינוי מבני.

# **Sentence 2**

Sentence_ID
 RC_02

Sentence_Text
 נמצא כי השתתפות פעילה בדיונים בכיתה עשויה לשפר את הבנת החומר.

Category
 Research Claim

Difficulty
 2

Paraphrase_Level
 2

Components
 marker: נמצא כי
 subject: השתתפות פעילה בדיונים בכיתה
 action: עשויה לשפר
 object: את הבנת החומר

Paraphrase_Tools
 lexical_change
 structure_change

Typical_Errors
 minimal_change
 missing_component

Exercise_Types
 guided_paraphrase

Example_Paraphrase
 מחקרים מראים כי מעורבות פעילה בדיונים בכיתה יכולה לתרום להבנה טובה יותר של החומר.

Arabic_Explanation
 المقصود أن الطلاب يفهمون المادة بشكل أفضل عندما يشاركون بفعالية في النقاشات داخل الصف.

English_Explanation
 The idea is that students understand the material better when they actively participate in class discussions.

French_Explanation
 L'idée est que les étudiants comprennent mieux la matière lorsqu'ils participent activement aux discussions en classe.

Common_Arabic_Error
 השמטת הפועל "עשויה" שמבטא הסתייגות.

# **Sentence 3**

Sentence_ID
 CE_01

Sentence_Text
 שימוש במשוב מתמשך עשוי לשפר את איכות הכתיבה האקדמית של הסטודנטים.

Category
 Cause–Effect

Difficulty
 1

Paraphrase_Level
 2

Components
 subject: שימוש במשוב מתמשך
 action: עשוי לשפר
 object: את איכות הכתיבה האקדמית
 context: של הסטודנטים

Paraphrase_Tools
 lexical_change
 nominalization

Typical_Errors
 minimal_change
 meaning_distortion

Exercise_Types
 cause_effect_rewrite

Example_Paraphrase
 משוב קבוע יכול לתרום לשיפור איכות הכתיבה האקדמית של סטודנטים.

Arabic_Explanation
 المعنى هو أن حصول الطلاب على ملاحظات مستمرة حول كتابتهم يساعدهم على تحسين الكتابة الأكاديمية.

English_Explanation
 The sentence explains that when students receive continuous feedback, their academic writing improves.

French_Explanation
 La phrase explique que lorsque les étudiants reçoivent des commentaires réguliers, leur écriture académique s'améliore.

Common_Arabic_Error
 בלבול בין "משוב" לבין "תגובה".

# **Sentence 4**

Sentence_ID
 CE_02

Sentence_Text
 קריאה ביקורתית עשויה לסייע ללומדים לזהות הנחות סמויות בטקסטים אקדמיים.

Category
 Cause–Effect

Difficulty
 2

Paraphrase_Level
 2

Components
 subject: קריאה ביקורתית
 action: עשויה לסייע
 object: לזהות הנחות סמויות
 context: בטקסטים אקדמיים

Paraphrase_Tools
 lexical_change
 structure_change

Typical_Errors
 minimal_change
 structure_copying
 meaning_distortion

Exercise_Types
 cause_effect_rewrite
 guided_paraphrase

Example_Paraphrase
 קריאה ביקורתית יכולה לעזור ללומדים לאתר הנחות שאינן נאמרות במפורש בטקסטים אקדמיים.

Arabic_Explanation
 المقصود أن القراءة النقدية تساعد الطلاب على الانتباه إلى أفكار أو افتراضات لا يذكرها الكاتب بشكل مباشر.

English_Explanation
 The idea is that critical reading helps students notice ideas or assumptions that the writer does not state directly.

French_Explanation
 L'idée est que la lecture critique aide les étudiants à repérer des idées ou des suppositions que l'auteur n'exprime pas directement.

Common_Arabic_Error
 תרגום מילולי של הביטוי "הנחות סמויות".

# **Sentence 5**

Sentence_ID
 COMP_01

Sentence_Text
 במצבים מסוימים למידה שיתופית נמצאה יעילה יותר מלמידה יחידנית.

Category
 Comparison

Difficulty
 2

Paraphrase_Level
 2

Components
 context: במצבים מסוימים
 subject: למידה שיתופית
 action: נמצאה יעילה יותר
 comparison: מלמידה יחידנית

Paraphrase_Tools
 lexical_change
 structure_change
 information_reorder

Typical_Errors
 minimal_change
 structure_copying
 missing_component

Exercise_Types
 comparison_rewrite
 guided_paraphrase

Example_Paraphrase
 במצבים מסוימים למידה בקבוצה עשויה להיות יעילה יותר מלמידה של לומד יחיד.

Arabic_Explanation
 يعني هذا أن التعلم أو العمل مع الآخرين قد يكون أحيانًا أكثر فائدة من التعلم بشكل فردي.

English_Explanation
 The sentence means that learning together with others can sometimes be more effective than learning alone.

French_Explanation
 Cela signifie qu'apprendre avec d'autres peut parfois être plus efficace qu'apprendre seul.

Common_Arabic_Error
 שימוש שגוי במילת היחס "מ" בהשוואה.

# **Sentence 6**

Sentence_ID
 DEF_01

Sentence_Text
 חשיבה ביקורתית היא היכולת להעריך מידע וטענות באופן מושכל.

Category
 Definition

Difficulty
 1

Paraphrase_Level
 1

Components
 subject: חשיבה ביקורתית
 action: היא
 object: היכולת להעריך מידע וטענות
 context: באופן מושכל

Paraphrase_Tools
 lexical_change
 structure_change

Typical_Errors
 minimal_change
 meaning_distortion

Exercise_Types
 definition_rewrite
 micro_lexical_change

Example_Paraphrase
 חשיבה ביקורתית מתייחסת ליכולת לבחון מידע וטענות בצורה מושכלת.

Arabic_Explanation
 المقصود بالتفكير النقدي هو قدرة الشخص على فحص المعلومات والأفكار وعدم قبولها مباشرة دون تفكير.

English_Explanation
 Critical thinking means being able to examine information and ideas instead of accepting them immediately.

French_Explanation
 La pensée critique signifie être capable d'examiner les informations et les idées au lieu de les accepter immédiatement.

Common_Arabic_Error
 תרגום מילולי של הביטוי "באופן מושכל".

# **Sentence 7**

Sentence_ID
 DEF_02

Sentence_Text
 אוריינות אקדמית מתייחסת ליכולת להבין, לנתח וליצור טקסטים בהקשר האקדמי.

Category
 Definition

Difficulty
 2

Paraphrase_Level
 2

Components
 subject: אוריינות אקדמית
 action: מתייחסת ליכולת
 object: להבין, לנתח וליצור טקסטים
 context: בהקשר האקדמי

Paraphrase_Tools
 lexical_change
 structure_change
 sentence_split

Typical_Errors
 minimal_change
 information_loss

Exercise_Types
 definition_rewrite
 guided_paraphrase

Example_Paraphrase
 אוריינות אקדמית היא היכולת לקרוא, לנתח ולכתוב טקסטים במסגרת האקדמיה.

Arabic_Explanation
 المقصود هو قدرة الطالب على قراءة النصوص الأكاديمية وفهمها وتحليلها وكتابة نصوص مشابهة في الجامعة.

English_Explanation
 Academic literacy means the ability to read, understand, analyze, and write academic texts.

French_Explanation
 La littératie académique est la capacité de lire, comprendre, analyser et produire des textes académiques.

Common_Arabic_Error
 השמטת אחד מהפעלים ברשימה.

# **Sentence 8**

Sentence_ID
 CONC_01

Sentence_Text
 לסיכום, פיתוח מיומנויות קריאה וכתיבה הוא מרכיב מרכזי בהצלחה בלימודים אקדמיים.

Category
 Conclusion

Difficulty
 1

Paraphrase_Level
 2

Components
 marker: לסיכום
 subject: פיתוח מיומנויות קריאה וכתיבה
 action: הוא
 object: מרכיב מרכזי
 context: בהצלחה בלימודים אקדמיים

Paraphrase_Tools
 lexical_change
 information_reorder

Typical_Errors
 minimal_change
 structure_copying

Exercise_Types
 guided_paraphrase
 full_sentence_paraphrase

Example_Paraphrase
 לסיכום, הצלחה בלימודים אקדמיים תלויה במידה רבה בפיתוח מיומנויות קריאה וכתיבה.

Arabic_Explanation
 المعنى أن الطلاب ينجحون في دراستهم الجامعية عندما يطورون مهارات القراءة والكتابة الأكاديمية.

English_Explanation
 The idea is that students succeed in their studies when they develop strong reading and writing skills.

French_Explanation
 L'idée est que les étudiants réussissent dans leurs études lorsqu'ils développent des compétences en lecture et en écriture.

Common_Arabic_Error
 שמירה על אותו סדר מידע כמו במשפט המקורי.

# **Sentence 9**

Sentence_ID
 HED_01

Sentence_Text
 ייתכן כי שימוש בטכנולוגיות למידה דיגיטליות תורם להגברת מעורבות הסטודנטים.

Category
 Hedging

Difficulty
 2

Paraphrase_Level
 2

Components
 marker: ייתכן כי
 subject: שימוש בטכנולוגיות למידה דיגיטליות
 action: תורם
 object: להגברת מעורבות
 context: הסטודנטים

Paraphrase_Tools
 lexical_change
 modal_change

Typical_Errors
 missing_hedge
 minimal_change

Exercise_Types
 guided_paraphrase
 full_sentence_paraphrase

Example_Paraphrase
 נראה כי טכנולוגיות למידה דיגיטליות עשויות להגביר את מעורבות הסטודנטים בלמידה.

Arabic_Explanation
 المقصود أن استخدام أدوات التعلم الرقمية قد يجعل الطلاب أكثر مشاركة ونشاطًا في التعلم.

English_Explanation
 The sentence suggests that digital learning tools may help students become more engaged in learning.

French_Explanation
 La phrase suggère que les outils d'apprentissage numériques peuvent rendre les étudiants plus engagés dans l'apprentissage.

Common_Arabic_Error
 השמטת מילת ההסתייגות.

# **Sentence 10**

Sentence_ID
 RC_03

Sentence_Text
 מחקרים אחדים מצביעים על קשר בין קריאה ביקורתית לבין הבנה עמוקה יותר של טקסטים אקדמיים.

Category
 Research Claim

Difficulty
 2

Paraphrase_Level
 2

Components
 marker: מחקרים אחדים מצביעים על קשר בין
 subject: קריאה ביקורתית
 comparison: לבין הבנה עמוקה יותר
 context: של טקסטים אקדמיים

Paraphrase_Tools
 lexical_change
 structure_change

Typical_Errors
 minimal_change
 structure_copying

Exercise_Types
 guided_paraphrase
 full_sentence_paraphrase

Example_Paraphrase
 חוקרים מצאו כי קיים קשר בין קריאה ביקורתית לבין הבנה מעמיקה של טקסטים אקדמיים.

Arabic_Explanation
 المعنى أن الطلاب الذين يقرؤون النصوص بطريقة نقدية يفهمونها بشكل أعمق.

English_Explanation
 The idea is that students who read texts critically usually understand them more deeply.

French_Explanation
 L'idée est que les étudiants qui lisent les textes de manière critique les comprennent plus profondément.

Common_Arabic_Error
 תרגום מילולי של הביטוי "מצביעים על קשר".

# **Sentence 11**

**Sentence_ID
** CE_03

**Sentence_Text
** תרגול קבוע של כתיבה אקדמית עשוי להוביל לשיפור הדרגתי ביכולת הניסוח של הסטודנטים.

**Category
** Cause–Effect

**Difficulty
** 1

**Paraphrase_Level
** 2

**Components
** subject: תרגול קבוע של כתיבה אקדמית
 action: עשוי להוביל
 object: לשיפור הדרגתי
 context: ביכולת הניסוח של הסטודנטים

**Paraphrase_Tools
** lexical_change
 structure_change
 information_reorder

**Typical_Errors
** minimal_change
 meaning_distortion
 missing_component

**Exercise_Types
** cause_effect_rewrite
 guided_paraphrase

**Example_Paraphrase
** כאשר סטודנטים מתרגלים כתיבה אקדמית באופן קבוע, יכולת הניסוח שלהם משתפרת בהדרגה.

**Arabic_Explanation
** المقصود أن ممارسة الكتابة الأكاديمية بشكل منتظم تساعد الطلاب على تحسين طريقة التعبير والكتابة لديهم.

**English_Explanation
** The sentence means that regular practice of academic writing helps students gradually improve how they express their ideas.

**French_Explanation
** La phrase signifie que pratiquer régulièrement l'écriture académique aide les étudiants à améliorer progressivement leur expression.

**Common_Arabic_Error
** השמטת הקשר הסיבתי בין התרגול לבין השיפור.

# **Sentence 12**

**Sentence_ID
** COMP_02

**Sentence_Text
** קריאה ביקורתית דורשת מעורבות קוגניטיבית גבוהה יותר מקריאה שטחית.

**Category
** Comparison

**Difficulty
** 2

**Paraphrase_Level
** 2

**Components
** subject: קריאה ביקורתית
 action: דורשת
 object: מעורבות קוגניטיבית גבוהה יותר
 comparison: מקריאה שטחית

**Paraphrase_Tools
** lexical_change
 structure_change

**Typical_Errors
** minimal_change
 structure_copying

**Exercise_Types
** comparison_rewrite
 guided_paraphrase

**Example_Paraphrase
** בהשוואה לקריאה שטחית, קריאה ביקורתית מחייבת מעורבות קוגניטיבית רבה יותר.

**Arabic_Explanation
** المعنى أن القراءة النقدية تحتاج إلى تفكير وتركيز أكثر من القراءة السريعة أو السطحية.

**English_Explanation
** The idea is that critical reading requires more thinking and concentration than superficial reading.

**French_Explanation
** L'idée est que la lecture critique demande plus de réflexion et de concentration que la lecture superficielle.

**Common_Arabic_Error
** שימוש שגוי במבנה ההשוואה או השמטת החלק ההשוואתי.

# **Sentence 13**

**Sentence_ID
** RC_04

**Sentence_Text
** מחקרים מצביעים על כך שמעורבות פעילה בלמידה עשויה לשפר את הישגי הסטודנטים.

**Category
** Research Claim

**Difficulty
** 2

**Paraphrase_Level
** 2

**Components
** marker: מחקרים מצביעים על כך ש
 subject: מעורבות פעילה בלמידה
 action: עשויה לשפר
 object: את הישגי הסטודנטים

**Paraphrase_Tools
** lexical_change
 structure_change

**Typical_Errors
** minimal_change
 missing_hedge

**Exercise_Types
** guided_paraphrase
 full_sentence_paraphrase

**Example_Paraphrase
** מחקרים שונים מראים כי השתתפות פעילה בתהליך הלמידה יכולה לתרום לשיפור הישגים אקדמיים.

**Arabic_Explanation
** المقصود أن الطلاب يحققون نتائج أفضل عندما يكونون نشطين ويشاركون في عملية التعلم.

**English_Explanation
** The sentence explains that students achieve better results when they actively participate in the learning process.

**French_Explanation
** La phrase explique que les étudiants obtiennent de meilleurs résultats lorsqu'ils participent activement au processus d'apprentissage.

**Common_Arabic_Error
** השמטת מילת ההסתייגות "עשויה".

# **Sentence 14**

**Sentence_ID
** CE_04

**Sentence_Text
** עבודה עם מקורות מידע מגוונים עשויה להעמיק את הבנת הנושא.

**Category
** Cause–Effect

**Difficulty
** 1

**Paraphrase_Level
** 2

**Components
** subject: עבודה עם מקורות מידע מגוונים
 action: עשויה להעמיק
 object: את הבנת הנושא

**Paraphrase_Tools
** lexical_change
 structure_change

**Typical_Errors
** minimal_change
 meaning_distortion

**Exercise_Types
** cause_effect_rewrite
 guided_paraphrase

**Example_Paraphrase
** שימוש במקורות מידע שונים יכול לסייע ללומדים להבין את הנושא בצורה מעמיקה יותר.

**Arabic_Explanation
** المعنى أن قراءة معلومات من مصادر مختلفة تساعد الطلاب على فهم الموضوع بشكل أفضل وأعمق.

**English_Explanation
** The idea is that reading information from different sources helps students understand a topic more deeply.

**French_Explanation
** L'idée est que lire des informations provenant de différentes sources aide les étudiants à mieux comprendre un sujet.

**Common_Arabic_Error
** תרגום מילולי של הביטוי "להעמיק את ההבנה".

# **Sentence 15**

**Sentence_ID
** DEF_03

**Sentence_Text
** למידה עצמאית היא היכולת של הלומד לנהל את תהליך הלמידה באופן עצמאי.

**Category
** Definition

**Difficulty
** 2

**Paraphrase_Level
** 2

**Components
** subject: למידה עצמאית
 action: היא
 object: היכולת של הלומד לנהל את תהליך הלמידה
 context: באופן עצמאי

**Paraphrase_Tools
** lexical_change
 structure_change

**Typical_Errors
** minimal_change
 structure_copying

**Exercise_Types
** definition_rewrite
 guided_paraphrase

**Example_Paraphrase
** למידה עצמאית מתארת מצב שבו הלומד מנהל את תהליך הלמידה בכוחות עצמו.

**Arabic_Explanation
** المقصود أن الطالب في التعلم الذاتي يكون مسؤولًا عن تنظيم تعلمه بنفسه.

**English_Explanation
** The sentence means that in self-directed learning the student is responsible for managing their own learning.

**French_Explanation
** La phrase signifie que dans l'apprentissage autonome, l'étudiant est responsable de l'organisation de son apprentissage.

**Common_Arabic_Error
** שמירה על אותו מבנה תחבירי כמו במשפט המקורי.

# **Sentence 16**

**Sentence_ID
** HED_02

**Sentence_Text
** נראה כי שילוב דיונים בכיתה עשוי לעודד חשיבה ביקורתית בקרב הסטודנטים.

**Category
** Hedging

**Difficulty
** 2

**Paraphrase_Level
** 2

**Components
** marker: נראה כי
 subject: שילוב דיונים בכיתה
 action: עשוי לעודד
 object: חשיבה ביקורתית
 context: בקרב הסטודנטים

**Paraphrase_Tools
** lexical_change
 modal_change

**Typical_Errors
** missing_hedge
 minimal_change

**Exercise_Types
** guided_paraphrase
 full_sentence_paraphrase

**Example_Paraphrase
** ייתכן כי דיונים בכיתה תורמים לפיתוח חשיבה ביקורתית אצל סטודנטים.

**Arabic_Explanation
** المعنى أن النقاشات داخل الصف قد تساعد الطلاب على التفكير بطريقة أكثر نقدية.

**English_Explanation
** The idea is that classroom discussions may encourage students to think more critically.

**French_Explanation
** L'idée est que les discussions en classe peuvent encourager les étudiants à penser de manière plus critique.

**Common_Arabic_Error
** השמטת מילת ההסתייגות.

# **Sentence 17**

**Sentence_ID
** CONC_02

**Sentence_Text
** ממצאים אלה מצביעים על חשיבותה של קריאה ביקורתית בלמידה האקדמית.

**Category
** Conclusion

**Difficulty
** 2

**Paraphrase_Level
** 2

**Components
** subject: ממצאים אלה
 action: מצביעים על
 object: חשיבותה של קריאה ביקורתית
 context: בלמידה האקדמית

**Paraphrase_Tools
** lexical_change
 structure_change

**Typical_Errors
** minimal_change
 meaning_distortion

**Exercise_Types
** guided_paraphrase
 full_sentence_paraphrase

**Example_Paraphrase
** ממצאי המחקר מדגישים את חשיבות הקריאה הביקורתית בתהליך הלמידה האקדמית.

**Arabic_Explanation
** المقصود أن هذه النتائج تظهر أن القراءة النقدية مهمة لنجاح الطلاب في التعلم الجامعي.

**English_Explanation
** The sentence means that the results show the importance of critical reading in academic learning.

**French_Explanation
** La phrase signifie que ces résultats montrent l'importance de la lecture critique dans l'apprentissage universitaire.

**Common_Arabic_Error
** תרגום מילולי של הביטוי "מצביעים על".

# **Sentence 18**

**Sentence_ID
** RC_05

**Sentence_Text
** מחקרים עדכניים מציעים כי שימוש במשוב מתמשך עשוי לשפר את איכות עבודות הסטודנטים.

**Category
** Research Claim

**Difficulty
** 2

**Paraphrase_Level
** 2

**Components
** marker: מחקרים עדכניים מציעים כי
 subject: שימוש במשוב מתמשך
 action: עשוי לשפר
 object: את איכות עבודות הסטודנטים

**Paraphrase_Tools
** lexical_change
 structure_change

**Typical_Errors
** minimal_change
 missing_hedge

**Exercise_Types
** guided_paraphrase
 full_sentence_paraphrase

**Example_Paraphrase
** מחקרים חדשים מראים כי משוב מתמשך יכול לתרום לשיפור איכות העבודות של סטודנטים.

**Arabic_Explanation
** المعنى أن حصول الطلاب على ملاحظات مستمرة حول أعمالهم يساعدهم على تحسين جودة هذه الأعمال.

**English_Explanation
** The idea is that continuous feedback helps students improve the quality of their work.

**French_Explanation
** L'idée est que des commentaires continus aident les étudiants à améliorer la qualité de leur travail.

**Common_Arabic_Error
** תרגום מילולי של הביטוי "מציעים כי".

# **Sentence 19**

**Sentence_ID
** COMP_03

**Sentence_Text
** בהרצאות מסוימות למידה פעילה נמצאה יעילה יותר מהקשבה פסיבית.

**Category
** Comparison

**Difficulty
** 1

**Paraphrase_Level
** 2

**Components
** context: בהרצאות מסוימות
 subject: למידה פעילה
 action: נמצאה יעילה יותר
 comparison: מהקשבה פסיבית

**Paraphrase_Tools
** lexical_change
 structure_change

**Typical_Errors
** minimal_change
 missing_component

**Exercise_Types
** comparison_rewrite
 guided_paraphrase

**Example_Paraphrase
** בכמה מצבים נמצא כי למידה פעילה יעילה יותר מהאזנה פסיבית להרצאות.

**Arabic_Explanation
** المقصود أن مشاركة الطلاب في التعلم تجعل فهمهم أفضل من مجرد الاستماع فقط.

**English_Explanation
** The sentence means that active participation helps students understand better than only listening.

**French_Explanation
** La phrase signifie que la participation active aide les étudiants à mieux comprendre que la simple écoute.

**Common_Arabic_Error
** השמטת חלק ההשוואה במשפט.

# **Sentence 20**

**Sentence_ID
** CE_05

**Sentence_Text
** קריאה במקורות מחקריים עשויה להרחיב את הבנת הסטודנטים בנושא מסוים.

**Category
** Cause–Effect

**Difficulty
** 1

**Paraphrase_Level
** 2

**Components
** subject: קריאה במקורות מחקריים
 action: עשויה להרחיב
 object: את הבנת הסטודנטים
 context: בנושא מסוים

**Paraphrase_Tools
** lexical_change
 structure_change

**Typical_Errors
** minimal_change
 meaning_distortion

**Exercise_Types
** cause_effect_rewrite
 guided_paraphrase

**Example_Paraphrase
** כאשר סטודנטים קוראים מקורות מחקריים, הם עשויים להבין טוב יותר את הנושא הנלמד.

**Arabic_Explanation
** المعنى أن قراءة الدراسات والمصادر العلمية تساعد الطلاب على فهم الموضوع بشكل أعمق.

**English_Explanation
** The idea is that reading research sources helps students gain a deeper understanding of a topic.

**French_Explanation
** L'idée est que lire des sources de recherche aide les étudiants à comprendre un sujet plus profondément.

**Common_Arabic_Error
** שמירה על אותו סדר מילים כמו במשפט המקורי.

# **PARAPHRASE BOT KNOWLEDGE BASE**

# **1. PARAPHRASE_KB_SCHEMA**

## **Final Sentence Unit Schema**

מסמך זה מתאר את המבנה הקבוע של יחידת משפט במאגר הפרפרזה.

### **Sentence_ID**

מזהה ייחודי של המשפט.
מבנה:
TYPE_NUMBER

דוגמאות:
DEF_01
RC_02
CE_03
COMP_01
HED_01
CONC_01

### **Sentence_Text**

המשפט האקדמי שעליו מבוצע תרגול הפרפרזה.

### **Category**

תפקיד רטורי של המשפט.

קטגוריות:
Definition
Research Claim
Cause–Effect
Comparison
Hedging
Conclusion
Practice

### **Difficulty**

רמת מורכבות:
1 — פשוט
2 — בינוני
3 — מורכב

### **Paraphrase_Level**

רמת השינוי הנדרשת:
1 — שינוי מילים
2 — שינוי מבנה
3 — שינוי מבנה וארגון מידע

### **Components**

מבנה קבוע:
marker
subject
action
object
context

### **Paraphrase_Tools**

lexical_change
structure_change
information_reorder
nominalization
modal_change
sentence_split
sentence_merge

### **Typical_Errors**

minimal_change
structure_copying
meaning_distortion
missing_component

### **Exercise_Types**

micro_lexical_change
micro_structure_change
full_sentence_paraphrase
definition_rewrite
cause_effect_rewrite
comparison_rewrite
sentence_split_exercise
sentence_merge_exercise

### **Example_Paraphrase**

דוגמה לפרפרזה תקינה.

### **Arabic_Explanation**

הסבר משמעות המשפט בערבית.

### **English_Explanation**

הסבר משמעות המשפט באנגלית.

### **French_Explanation**

הסבר משמעות המשפט בצרפתית.

### **Common_Arabic_Error**

טעויות אופייניות של דוברי ערבית.

### **Paraphrase_Ladder (optional)**

Original
Level_1_Lexical
Level_2_Structure
Level_3_Reorganization

# **2. PARAPHRASE_KB_SENTENCES**

מאגר המשפטים של הבוט.

המאגר כולל 60 יחידות משפט.

כל יחידה בנויה לפי הסכמה:

Sentence_ID
Sentence_Text
Category
Difficulty
Paraphrase_Level
Components
Paraphrase_Tools
Typical_Errors
Exercise_Types
Example_Paraphrase
Arabic_Explanation
English_Explanation
French_Explanation
Common_Arabic_Error
Paraphrase_Ladder (optional)

# **3. PARAPHRASE_EXERCISE_RULES**

## **בחירת משפט**

הבוט בוחר משפט לפי:
Difficulty
Category
Paraphrase_Level

## **התאמת תרגיל**

הבוט משתמש בשדה Exercise_Types כדי להפעיל תרגול מתאים.

## **שימוש ב‑Components**

הבוט יכול:

- להסביר את מבנה המשפט
- לבקש שינוי ברכיב מסוים
- לזהות רכיבים חסרים

## **שימוש ב‑Typical_Errors**

השדה מאפשר לבוט לזהות טעויות אופייניות ולספק משוב מותאם.

## **שימוש ב‑Paraphrase_Ladder**

כאשר קיים Ladder, הבוט יכול להציג דרגות שונות של פרפרזה.

___________________________

# **KB Index (Sentence Categories)**

Definitions
DEF_01
DEF_02
DEF_03
DEF_04
DEF_05

Research Claims
RC_01
RC_02
RC_03
RC_04
RC_05

Cause–Effect
CE_01
CE_02
CE_03
CE_04
CE_05

Comparison
COMP_01
COMP_02
COMP_03
COMP_04
COMP_05

Hedging
HED_01
HED_02
HED_03
HED_04

Conclusion
CONC_01
CONC_02
CONC_03
CONC_04

Limitation
LIM_01
LIM_02
LIM_03
LIM_04
LIM_05
LIM_06

Implication
IMP_01
IMP_02
IMP_03
IMP_04
IMP_05
IMP_06

Explanation
EXP_01
EXP_02
EXP_03
EXP_04
EXP_05

Process
PROC_01
PROC_02
PROC_03
PROC_04
PROC_05

# **Sentence 01**

Sentence_ID
DEF_01

Sentence_Text
למידה אקדמית היא תהליך שיטתי של רכישת ידע ופיתוח מיומנויות חשיבה.

Category
Definition

Difficulty
1

Paraphrase_Level
2

Components
subject: למידה אקדמית
action: היא
object: תהליך שיטתי של רכישת ידע
context: ופיתוח מיומנויות חשיבה

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
minimal_change
structure_copying

Exercise_Types
definition_rewrite
full_sentence_paraphrase

Example_Paraphrase
למידה אקדמית מתארת תהליך מובנה שבו נרכש ידע ומתפתחות מיומנויות חשיבה.

Arabic_Explanation
المقصود أن التعلم الأكاديمي هو عملية منظمة يكتسب فيها الطلاب المعرفة ويطورون مهارات التفكير.

English_Explanation
The sentence explains that academic learning is an organized process through which knowledge is acquired and thinking skills are developed.

French_Explanation
La phrase explique que l’apprentissage académique est un processus organisé permettant d’acquérir des connaissances et de développer des compétences de réflexion.

Common_Arabic_Error
שמירה על אותו מבנה תחבירי של משפט ההגדרה.

# **Sentence 02**

Sentence_ID
RC_01

Sentence_Text
מחקרים רבים מצביעים על כך ששימוש בטכנולוגיות למידה עשוי לשפר את מעורבות הסטודנטים.

Category
Research Claim

Difficulty
2

Paraphrase_Level
2

Components
marker: מחקרים רבים מצביעים על כך ש
subject: שימוש בטכנולוגיות למידה
action: עשוי לשפר
object: את מעורבות הסטודנטים

Paraphrase_Tools
lexical_change
structure_change
modal_change

Typical_Errors
minimal_change
missing_hedge

Exercise_Types
full_sentence_paraphrase
guided_paraphrase

Example_Paraphrase
מחקרים שונים מראים כי שילוב טכנולוגיות למידה יכול להגביר את מעורבות הסטודנטים.

Arabic_Explanation
المعنى أن استخدام التقنيات التعليمية قد يساعد على زيادة مشاركة الطلاب في التعلم.

English_Explanation
The idea is that learning technologies may increase students' engagement in learning.

French_Explanation
L’idée est que l’utilisation des technologies éducatives peut augmenter l’engagement des étudiants.

Common_Arabic_Error
השמטת מילת ההסתייגות "עשוי".

# **Sentence 03**

Sentence_ID
CE_01

Sentence_Text
שימוש קבוע בתרגול כתיבה עשוי להוביל לשיפור הדרגתי ביכולת הניסוח.

Category
Cause–Effect

Difficulty
1

Paraphrase_Level
2

Components
subject: שימוש קבוע בתרגול כתיבה
action: עשוי להוביל
object: לשיפור הדרגתי
context: ביכולת הניסוח

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
minimal_change
meaning_distortion

Exercise_Types
cause_effect_rewrite

Example_Paraphrase
תרגול כתיבה באופן קבוע יכול לשפר בהדרגה את יכולת הניסוח.

Arabic_Explanation
المقصود أن ممارسة الكتابة بشكل منتظم تساعد على تحسين القدرة على التعبير.

English_Explanation
The sentence means that regular writing practice helps improve expression skills.

French_Explanation
La phrase signifie que pratiquer l’écriture régulièrement améliore progressivement la capacité d’expression.

Common_Arabic_Error
תרגום מילולי של הביטוי "להוביל לשיפור".

# **Sentence 04**

Sentence_ID
COMP_01

Sentence_Text
למידה פעילה נמצאה יעילה יותר מהקשבה פסיבית בהרצאות מסוימות.

Category
Comparison

Difficulty
1

Paraphrase_Level
2

Components
subject: למידה פעילה
action: נמצאה יעילה יותר
comparison: מהקשבה פסיבית
context: בהרצאות מסוימות

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
minimal_change
missing_component

Exercise_Types
comparison_rewrite

Example_Paraphrase
במצבים מסוימים נמצא כי למידה פעילה יעילה יותר מהאזנה פסיבית להרצאות.

Arabic_Explanation
المعنى أن مشاركة الطلاب في التعلم تكون أحيانًا أكثر فاعلية من مجرد الاستماع للمحاضرة.

English_Explanation
The sentence suggests that active learning can be more effective than passive listening in some lectures.

French_Explanation
La phrase suggère que l’apprentissage actif peut être plus efficace que l’écoute passive dans certaines conférences.

Common_Arabic_Error
השמטת חלק ההשוואה במשפט.

# **Sentence 05**

Sentence_ID
HED_01

Sentence_Text
ייתכן כי שילוב דיונים בכיתה תורם לפיתוח חשיבה ביקורתית.

Category
Hedging

Difficulty
2

Paraphrase_Level
2

Components
marker: ייתכן כי
subject: שילוב דיונים בכיתה
action: תורם
object: לפיתוח חשיבה ביקורתית

Paraphrase_Tools
lexical_change
modal_change

Typical_Errors
missing_hedge
minimal_change

Exercise_Types
full_sentence_paraphrase

Example_Paraphrase
נראה כי דיונים בכיתה יכולים לעודד חשיבה ביקורתית.

Arabic_Explanation
المقصود أن النقاشات داخل الصف قد تساعد الطلاب على التفكير بشكل نقدي.

English_Explanation
The idea is that classroom discussions may encourage critical thinking.

French_Explanation
L’idée est que les discussions en classe peuvent favoriser la pensée critique.

Common_Arabic_Error
השמטת מילת ההסתייגות.

# **Sentence 06**

Sentence_ID
CONC_01

Sentence_Text
לסיכום, פיתוח מיומנויות קריאה וכתיבה הוא מרכיב מרכזי בהצלחה בלימודים אקדמיים.

Category
Conclusion

Difficulty
1

Paraphrase_Level
2

Components
marker: לסיכום
subject: פיתוח מיומנויות קריאה וכתיבה
action: הוא
object: מרכיב מרכזי
context: בהצלחה בלימודים אקדמיים

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
minimal_change

Exercise_Types
full_sentence_paraphrase

Example_Paraphrase
לסיכום, מיומנויות קריאה וכתיבה הן גורם חשוב להצלחה אקדמית.

Arabic_Explanation
المعنى أن مهارات القراءة والكتابة مهمة جدًا لنجاح الطلاب في الدراسة الجامعية.

English_Explanation
The sentence means that reading and writing skills are essential for academic success.

French_Explanation
La phrase signifie que les compétences en lecture et en écriture sont essentielles pour réussir dans les études académiques.

Common_Arabic_Error
תרגום מילולי של הביטוי "מרכיב מרכזי".

# **Sentence 07**

Sentence_ID
RC_02

Sentence_Text
מחקרים עדכניים מדגישים את החשיבות של משוב מתמשך בתהליך הלמידה.

Category
Research Claim

Difficulty
2

Paraphrase_Level
2

Components
marker: מחקרים עדכניים מדגישים
object: את החשיבות של משוב מתמשך
context: בתהליך הלמידה

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
minimal_change

Exercise_Types
full_sentence_paraphrase

Example_Paraphrase
מחקרים חדשים מצביעים על חשיבותו של משוב מתמשך בלמידה.

Arabic_Explanation
المقصود أن إعطاء ملاحظات مستمرة للطلاب يساعد على تحسين عملية التعلم.

English_Explanation
The sentence suggests that continuous feedback plays an important role in learning.

French_Explanation
La phrase indique que les commentaires continus jouent un rôle important dans l’apprentissage.

Common_Arabic_Error
תרגום מילולי של הביטוי "מדגישים את החשיבות".

# **Sentence 08**

Sentence_ID
CE_02

Sentence_Text
עבודה עם מקורות מידע שונים יכולה להעמיק את הבנת הסטודנטים בנושא הנלמד.

Category
Cause–Effect

Difficulty
1

Paraphrase_Level
2

Components
subject: עבודה עם מקורות מידע שונים
action: יכולה להעמיק
object: את הבנת הסטודנטים
context: בנושא הנלמד

Paraphrase_Tools
lexical_change

Typical_Errors
minimal_change

Exercise_Types
cause_effect_rewrite

Example_Paraphrase
כאשר סטודנטים משתמשים במקורות מידע מגוונים, הבנתם בנושא עשויה להעמיק.

Arabic_Explanation
المعنى أن قراءة معلومات من مصادر مختلفة تساعد الطلاب على فهم الموضوع بشكل أفضل.

English_Explanation
The idea is that using different information sources helps students understand the topic better.

French_Explanation
L’idée est que l’utilisation de différentes sources d’information aide les étudiants à mieux comprendre le sujet.

Common_Arabic_Error
תרגום מילולי של הביטוי "להעמיק את ההבנה".

# **Sentence 09**

Sentence_ID
COMP_02

Sentence_Text
קריאה ביקורתית דורשת מעורבות קוגניטיבית גבוהה יותר מקריאה שטחית.

Category
Comparison

Difficulty
2

Paraphrase_Level
2

Components
subject: קריאה ביקורתית
action: דורשת
object: מעורבות קוגניטיבית גבוהה יותר
comparison: מקריאה שטחית

Paraphrase_Tools
lexical_change

Typical_Errors
structure_copying

Exercise_Types
comparison_rewrite

Example_Paraphrase
בהשוואה לקריאה שטחית, קריאה ביקורתית מצריכה רמת חשיבה גבוהה יותר.

Arabic_Explanation
المقصود أن القراءة النقدية تحتاج إلى تفكير أعمق من القراءة السريعة.

English_Explanation
The sentence explains that critical reading requires deeper thinking than superficial reading.

French_Explanation
La phrase explique que la lecture critique demande une réflexion plus profonde que la lecture superficielle.

Common_Arabic_Error
השמטת חלק ההשוואה.

# **Sentence 10**

Sentence_ID
DEF_02

Sentence_Text
חשיבה ביקורתית היא היכולת לבחון מידע באופן שיטתי ולהעריך את אמינותו.

Category
Definition

Difficulty
2

Paraphrase_Level
2

Components
subject: חשיבה ביקורתית
action: היא
object: היכולת לבחון מידע
context: ולהעריך את אמינותו

Paraphrase_Tools
lexical_change

Typical_Errors
minimal_change

Exercise_Types
definition_rewrite

Example_Paraphrase
חשיבה ביקורתית מתייחסת ליכולת לנתח מידע ולבדוק את מידת אמינותו.

Arabic_Explanation
المعنى أن التفكير النقدي يعني تحليل المعلومات والتأكد من مدى صحتها.

English_Explanation
The sentence means that critical thinking involves analyzing information and evaluating its reliability.

French_Explanation
La phrase signifie que la pensée critique consiste à analyser l’information et à évaluer sa fiabilité.

Common_Arabic_Error
שמירה על אותו מבנה תחבירי.

# **Sentence 11**

Sentence_ID
CE_03

Sentence_Text
תרגול קבוע של כתיבה אקדמית עשוי להוביל לשיפור הדרגתי ביכולת הניסוח של הסטודנטים.

Category
Cause–Effect

Difficulty
1

Paraphrase_Level
2

Components
subject: תרגול קבוע של כתיבה אקדמית
action: עשוי להוביל
object: לשיפור הדרגתי
context: ביכולת הניסוח של הסטודנטים

Paraphrase_Tools
lexical_change
structure_change
information_reorder

Typical_Errors
minimal_change
meaning_distortion

Exercise_Types
cause_effect_rewrite
guided_paraphrase

Example_Paraphrase
כאשר סטודנטים מתרגלים כתיבה אקדמית באופן קבוע, יכולת הניסוח שלהם משתפרת בהדרגה.

Arabic_Explanation
المقصود أن ممارسة الكتابة الأكاديمية بشكل منتظم تساعد الطلاب على تحسين طريقة التعبير والكتابة لديهم.

English_Explanation
The sentence means that regular practice of academic writing helps students gradually improve how they express their ideas.

French_Explanation
La phrase signifie que pratiquer régulièrement l'écriture académique aide les étudiants à améliorer progressivement leur expression.

Common_Arabic_Error
השמטת הקשר הסיבתי בין התרגול לבין השיפור.

# **Sentence 12**

Sentence_ID
COMP_03

Sentence_Text
קריאה ביקורתית דורשת מעורבות קוגניטיבית גבוהה יותר מקריאה שטחית.

Category
Comparison

Difficulty
2

Paraphrase_Level
2

Components
subject: קריאה ביקורתית
action: דורשת
object: מעורבות קוגניטיבית גבוהה יותר
comparison: מקריאה שטחית

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
minimal_change
structure_copying

Exercise_Types
comparison_rewrite
guided_paraphrase

Example_Paraphrase
בהשוואה לקריאה שטחית, קריאה ביקורתית מחייבת מעורבות קוגניטיבית רבה יותר.

Arabic_Explanation
المعنى أن القراءة النقدية تحتاج إلى تفكير وتركيز أكثر من القراءة السريعة أو السطحية.

English_Explanation
The idea is that critical reading requires more thinking and concentration than superficial reading.

French_Explanation
L'idée est que la lecture critique demande plus de réflexion et de concentration que la lecture superficielle.

Common_Arabic_Error
שימוש שגוי במבנה ההשוואה או השמטת החלק ההשוואתי.

# **Sentence 13**

Sentence_ID
RC_03

Sentence_Text
מחקרים מצביעים על כך שמעורבות פעילה בלמידה עשויה לשפר את הישגי הסטודנטים.

Category
Research Claim

Difficulty
2

Paraphrase_Level
2

Components
marker: מחקרים מצביעים על כך ש
subject: מעורבות פעילה בלמידה
action: עשויה לשפר
object: את הישגי הסטודנטים

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
minimal_change
missing_hedge

Exercise_Types
full_sentence_paraphrase
guided_paraphrase

Example_Paraphrase
מחקרים שונים מראים כי השתתפות פעילה בתהליך הלמידה יכולה לתרום לשיפור הישגים אקדמיים.

Arabic_Explanation
المقصود أن الطلاب يحققون نتائج أفضل عندما يكونون نشطين ويشاركون في عملية التعلم.

English_Explanation
The sentence explains that students achieve better results when they actively participate in the learning process.

French_Explanation
La phrase explique que les étudiants obtiennent de meilleurs résultats lorsqu'ils participent activement au processus d'apprentissage.

Common_Arabic_Error
השמטת מילת ההסתייגות "עשויה".

# **Sentence 14**

Sentence_ID
CE_04

Sentence_Text
עבודה עם מקורות מידע מגוונים עשויה להעמיק את הבנת הנושא.

Category
Cause–Effect

Difficulty
1

Paraphrase_Level
2

Components
subject: עבודה עם מקורות מידע מגוונים
action: עשויה להעמיק
object: את הבנת הנושא

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
minimal_change
meaning_distortion

Exercise_Types
cause_effect_rewrite
guided_paraphrase

Example_Paraphrase
שימוש במקורות מידע שונים יכול לסייע ללומדים להבין את הנושא בצורה מעמיקה יותר.

Arabic_Explanation
المعنى أن قراءة معلومات من مصادر مختلفة تساعد الطلاب على فهم الموضوع بشكل أفضل وأعمق.

English_Explanation
The idea is that reading information from different sources helps students understand a topic more deeply.

French_Explanation
L'idée est que lire des informations provenant de différentes sources aide les étudiants à mieux comprendre un sujet.

Common_Arabic_Error
תרגום מילולי של הביטוי "להעמיק את ההבנה".

# **Sentence 15**

Sentence_ID
DEF_03

Sentence_Text
למידה עצמאית היא היכולת של הלומד לנהל את תהליך הלמידה באופן עצמאי.

Category
Definition

Difficulty
2

Paraphrase_Level
2

Components
subject: למידה עצמאית
action: היא
object: היכולת של הלומד לנהל את תהליך הלמידה
context: באופן עצמאי

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
minimal_change
structure_copying

Exercise_Types
definition_rewrite
guided_paraphrase

Example_Paraphrase
למידה עצמאית מתארת מצב שבו הלומד מנהל את תהליך הלמידה בכוחות עצמו.

Arabic_Explanation
المقصود أن الطالب في التعلم الذاتي يكون مسؤولًا عن تنظيم تعلمه بنفسه.

English_Explanation
The sentence means that in self‑directed learning the student is responsible for managing their own learning.

French_Explanation
La phrase signifie que dans l'apprentissage autonome, l'étudiant est responsable de l'organisation de son apprentissage.

Common_Arabic_Error
שמירה על אותו מבנה תחבירי כמו במשפט המקורי.

# **Sentence 16**

Sentence_ID
HED_02

Sentence_Text
נראה כי שילוב דיונים בכיתה עשוי לעודד חשיבה ביקורתית בקרב הסטודנטים.

Category
Hedging

Difficulty
2

Paraphrase_Level
2

Components
marker: נראה כי
subject: שילוב דיונים בכיתה
action: עשוי לעודד
object: חשיבה ביקורתית
context: בקרב הסטודנטים

Paraphrase_Tools
lexical_change
modal_change

Typical_Errors
missing_hedge
minimal_change

Exercise_Types
full_sentence_paraphrase

Example_Paraphrase
ייתכן כי דיונים בכיתה תורמים לפיתוח חשיבה ביקורתית אצל סטודנטים.

Arabic_Explanation
المعنى أن النقاشات داخل الصف قد تساعد الطلاب على التفكير بطريقة أكثر نقدية.

English_Explanation
The idea is that classroom discussions may encourage students to think more critically.

French_Explanation
L'idée est que les discussions en classe peuvent encourager les étudiants à penser de manière plus critique.

Common_Arabic_Error
השמטת מילת ההסתייגות.

# **Sentence 17**

Sentence_ID
CONC_02

Sentence_Text
ממצאים אלה מצביעים על חשיבותה של קריאה ביקורתית בלמידה האקדמית.

Category
Conclusion

Difficulty
2

Paraphrase_Level
2

Components
subject: ממצאים אלה
action: מצביעים על
object: חשיבותה של קריאה ביקורתית
context: בלמידה האקדמית

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
minimal_change

Exercise_Types
full_sentence_paraphrase

Example_Paraphrase
ממצאי המחקר מדגישים את חשיבות הקריאה הביקורתית בתהליך הלמידה האקדמית.

Arabic_Explanation
المقصود أن هذه النتائج تظهر أن القراءة النقدية مهمة لنجاح الطلاب في التعلم الجامعي.

English_Explanation
The sentence means that the results show the importance of critical reading in academic learning.

French_Explanation
La phrase signifie que ces résultats montrent l'importance de la lecture critique dans l'apprentissage universitaire.

Common_Arabic_Error
תרגום מילולי של הביטוי "מצביעים על".

# **Sentence 18**

Sentence_ID
RC_04

Sentence_Text
מחקרים עדכניים מציעים כי שימוש במשוב מתמשך עשוי לשפר את איכות עבודות הסטודנטים.

Category
Research Claim

Difficulty
2

Paraphrase_Level
2

Components
marker: מחקרים עדכניים מציעים כי
subject: שימוש במשוב מתמשך
action: עשוי לשפר
object: את איכות עבודות הסטודנטים

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
minimal_change
missing_hedge

Exercise_Types
full_sentence_paraphrase

Example_Paraphrase
מחקרים חדשים מראים כי משוב מתמשך יכול לתרום לשיפור איכות העבודות של סטודנטים.

Arabic_Explanation
المعنى أن حصول الطلاب على ملاحظات مستمرة حول أعمالهم يساعدهم على تحسين جودة هذه الأعمال.

English_Explanation
The idea is that continuous feedback helps students improve the quality of their work.

French_Explanation
L'idée est que des commentaires continus aident les étudiants à améliorer la qualité de leur travail.

Common_Arabic_Error
תרגום מילולי של הביטוי "מציעים כי".

# **Sentence 19**

Sentence_ID
COMP_04

Sentence_Text
בהרצאות מסוימות למידה פעילה נמצאה יעילה יותר מהקשבה פסיבית.

Category
Comparison

Difficulty
1

Paraphrase_Level
2

Components
context: בהרצאות מסוימות
subject: למידה פעילה
action: נמצאה יעילה יותר
comparison: מהקשבה פסיבית

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
minimal_change
missing_component

Exercise_Types
comparison_rewrite

Example_Paraphrase
בכמה מצבים נמצא כי למידה פעילה יעילה יותר מהאזנה פסיבית להרצאות.

Arabic_Explanation
المقصود أن مشاركة الطلاب في التعلم تجعل فهمهم أفضل من مجرد الاستماع فقط.

English_Explanation
The sentence means that active participation helps students understand better than only listening.

French_Explanation
La phrase signifie que la participation active aide les étudiants à mieux comprendre que la simple écoute.

Common_Arabic_Error
השמטת חלק ההשוואה במשפט.

# **Sentence 20**

Sentence_ID
CE_05

Sentence_Text
קריאה במקורות מחקריים עשויה להרחיב את הבנת הסטודנטים בנושא מסוים.

Category
Cause–Effect

Difficulty
1

Paraphrase_Level
2

Components
subject: קריאה במקורות מחקריים
action: עשויה להרחיב
object: את הבנת הסטודנטים
context: בנושא מסוים

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
minimal_change

Exercise_Types
cause_effect_rewrite

Example_Paraphrase
כאשר סטודנטים קוראים מקורות מחקריים, הם עשויים להבין טוב יותר את הנושא הנלמד.

Arabic_Explanation
المعنى أن قراءة الدراسات والمصادر العلمية تساعد الطلاب على فهم الموضوع بشكل أعمق.

English_Explanation
The idea is that reading research sources helps students gain a deeper understanding of a topic.

French_Explanation
L'idée est que lire des sources de recherche aide les étudiants à comprendre un sujet plus profondément.

Common_Arabic_Error
שמירה על אותו סדר מילים כמו במשפט המקורי.

# **משפטים הכוללים Paraphrase Ladder**

בהתאם לארכיטקטורה הפדגוגית של המאגר, לא כל משפט כולל Ladder.
נבחרו **10 משפטי עוגן (Anchor Sentences)** שעליהם ניתן להדגים שלוש רמות פרפרזה.

רשימת המשפטים הכוללים Paraphrase_Ladder:

DEF_01
RC_01
CE_01
COMP_01
HED_01
CONC_01
RC_03
CE_03
COMP_02
RC_04

משפטים אלו מייצגים את המבנים המרכזיים של כתיבה אקדמית:

- הגדרה (Definition)
- טענה מחקרית (Research Claim)
- סיבה ותוצאה (Cause–Effect)
- השוואה (Comparison)
- הסתייגות אקדמית (Hedging)
- מסקנה (Conclusion)

מטרת ה‑Paraphrase Ladder היא להדגים שלושה שלבי שינוי:

Level 1 — שינוי מילים (Lexical Change)
Level 2 — שינוי מבנה משפט (Structure Change)
Level 3 — ארגון מחדש של המידע (Information Reorganization)

כך המאגר מאפשר ללומדים להבין בהדרגה כיצד לעבור מפרפרזה בסיסית לפרפרזה אקדמית מלאה.

# **Sentence 21**

Sentence_ID
LIM_01

Sentence_Text
עם זאת, למחקר זה מספר מגבלות שיש להביא בחשבון בעת פרשנות הממצאים.

Category
Limitation

Difficulty
2

Paraphrase_Level
2

Components
marker: עם זאת
subject: למחקר זה
action: יש
object: מספר מגבלות
context: שיש להביא בחשבון בעת פרשנות הממצאים

Paraphrase_Tools
lexical_change
structure_change
sentence_split

Typical_Errors
minimal_change
missing_marker

Exercise_Types
limitation_rewrite
sentence_split

Example_Paraphrase
למחקר זה קיימות מספר מגבלות ולכן יש לפרש את ממצאיו בזהירות.

Arabic_Explanation
المقصود أن نتائج هذا البحث لها بعض القيود التي يجب أخذها بعين الاعتبار عند تفسيرها.

English_Explanation
The sentence explains that the study has several limitations that should be considered when interpreting its findings.

French_Explanation
La phrase indique que cette étude comporte plusieurs limites qu’il faut prendre en compte lors de l’interprétation des résultats.

Common_Arabic_Error
השמטת מילת הקישור "עם זאת".

Paraphrase_Ladder
Original
עם זאת, למחקר זה מספר מגבלות שיש להביא בחשבון בעת פרשנות הממצאים.

Level_1_Lexical
עם זאת, למחקר קיימות כמה מגבלות שיש לשקול בעת פירוש הממצאים.

Level_2_Structure
יש להביא בחשבון מספר מגבלות של המחקר בעת פרשנות ממצאיו.

Level_3_Reorganization
בעת פירוש ממצאי המחקר חשוב להתחשב במגבלותיו.

# **Sentence 22**

Sentence_ID
LIM_02

Sentence_Text
למרות הממצאים החיוביים, יש לפרש את תוצאות המחקר בזהירות.

Category
Limitation

Difficulty
1

Paraphrase_Level
2

Components
marker: למרות
subject: הממצאים החיוביים
action: יש לפרש
object: את תוצאות המחקר
context: בזהירות

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
missing_marker
minimal_change

Exercise_Types
limitation_rewrite

Example_Paraphrase
אף שהממצאים חיוביים, יש לבחון את תוצאות המחקר בזהירות.

Arabic_Explanation
المعنى أن النتائج إيجابية لكن يجب تفسيرها بحذر.

English_Explanation
Even though the findings are positive, they should be interpreted carefully.

French_Explanation
Même si les résultats sont positifs, ils doivent être interprétés avec prudence.

Common_Arabic_Error
תרגום מילולי של "למרות".

Paraphrase_Ladder
Original
למרות הממצאים החיוביים, יש לפרש את תוצאות המחקר בזהירות.

Level_1_Lexical
על אף הממצאים החיוביים, יש לבחון את תוצאות המחקר בזהירות.

Level_2_Structure
יש לפרש את תוצאות המחקר בזהירות, אף שהממצאים חיוביים.

Level_3_Reorganization
הממצאים אמנם חיוביים, אך פרשנותם דורשת זהירות.

# **Sentence 23**

Sentence_ID
IMP_01

Sentence_Text
ממצא זה עשוי להשפיע על האופן שבו מתוכננות תוכניות לימוד במוסדות להשכלה גבוהה.

Category
Implication

Difficulty
2

Paraphrase_Level
2

Components
subject: ממצא זה
action: עשוי להשפיע
object: על האופן שבו מתוכננות תוכניות לימוד
context: במוסדות להשכלה גבוהה

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
minimal_change

Exercise_Types
implication_rewrite

Example_Paraphrase
לממצא זה עשויות להיות השלכות על תכנון תוכניות לימוד באקדמיה.

Arabic_Explanation
المقصود أن هذه النتيجة قد تؤثر في طريقة تصميم البرامج التعليمية في الجامعات.

English_Explanation
This finding may influence how study programs are designed in higher education.

French_Explanation
Ce résultat peut influencer la manière dont les programmes d’études sont conçus dans l’enseignement supérieur.

Common_Arabic_Error
השמטת מילת ההסתייגות "עשוי".

Paraphrase_Ladder
Original
ממצא זה עשוי להשפיע על האופן שבו מתוכננות תוכניות לימוד במוסדות להשכלה גבוהה.

Level_1_Lexical
ממצא זה יכול להשפיע על הדרך שבה מתכננים תוכניות לימוד באוניברסיטאות.

Level_2_Structure
תכנון תוכניות הלימוד באקדמיה עשוי להיות מושפע מממצא זה.

Level_3_Reorganization
לממצא זה עשויות להיות השלכות על תכנון תוכניות לימוד.

# **Sentence 24**

Sentence_ID
IMP_02

Sentence_Text
לתוצאות המחקר עשויות להיות השלכות על מדיניות חינוכית.

Category
Implication

Difficulty
1

Paraphrase_Level
1

Components
subject: תוצאות המחקר
action: עשויות להיות
object: השלכות
context: על מדיניות חינוכית

Paraphrase_Tools
lexical_change

Typical_Errors
minimal_change

Exercise_Types
implication_rewrite

Example_Paraphrase
ייתכן שתוצאות המחקר ישפיעו על קביעת מדיניות בתחום החינוך.

Arabic_Explanation
المقصود أن نتائج البحث قد تؤثر في السياسات التعليمية.

English_Explanation
The study results may influence educational policy.

French_Explanation
Les résultats de l’étude peuvent influencer la politique éducative.

Common_Arabic_Error
תרגום מילולי של "השלכות".

# **Sentence 25**

Sentence_ID
EXP_01

Sentence_Text
ניתן להסביר תופעה זו בכך שסטודנטים נוטים ללמוד בצורה פעילה יותר כאשר הם משתתפים בדיונים.

Category
Explanation

Difficulty
2

Paraphrase_Level
2

Components
marker: ניתן להסביר
subject: תופעה זו
action: בכך ש
object: סטודנטים לומדים בצורה פעילה יותר
context: כאשר הם משתתפים בדיונים

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
meaning_distortion

Exercise_Types
explanation_rewrite

Example_Paraphrase
הסבר אפשרי לתופעה זו הוא שדיונים מעודדים למידה פעילה של סטודנטים.

Arabic_Explanation
المقصود أن الطلاب يتعلمون بشكل أكثر نشاطًا عندما يشاركون في النقاش.

English_Explanation
The phenomenon can be explained by the fact that students learn more actively when they participate in discussions.

French_Explanation
Ce phénomène peut s’expliquer par le fait que les étudiants apprennent plus activement lorsqu’ils participent aux discussions.

Common_Arabic_Error
תרגום מילולי של "ניתן להסביר".

# **Sentence 26**

Sentence_ID
EXP_02

Sentence_Text
הסיבה האפשרית לכך היא שתהליך הלמידה מושפע מהאינטראקציה בין הסטודנטים.

Category
Explanation

Difficulty
2

Paraphrase_Level
2

Components
marker: הסיבה האפשרית
subject: תהליך הלמידה
action: מושפע
object: מהאינטראקציה
context: בין הסטודנטים

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
structure_copying

Exercise_Types
explanation_rewrite

Example_Paraphrase
ייתכן שהאינטראקציה בין סטודנטים משפיעה על תהליך הלמידה.

Arabic_Explanation
المقصود أن التفاعل بين الطلاب قد يؤثر في عملية التعلم.

English_Explanation
Student interaction may influence the learning process.

French_Explanation
L’interaction entre les étudiants peut influencer le processus d’apprentissage.

Common_Arabic_Error
תרגום מילולי של "הסיבה האפשרית".

# **Sentence 27**

Sentence_ID
PROC_01

Sentence_Text
תהליך הכתיבה האקדמית כולל קריאה, ניתוח מקורות וניסוח טיעון מבוסס.

Category
Process

Difficulty
1

Paraphrase_Level
2

Components
subject: תהליך הכתיבה האקדמית
action: כולל
object: קריאה וניתוח מקורות
context: וניסוח טיעון מבוסס

Paraphrase_Tools
lexical_change
sentence_split

Typical_Errors
minimal_change

Exercise_Types
process_rewrite

Example_Paraphrase
בכתיבה אקדמית יש לקרוא מקורות, לנתח אותם ולנסח טיעון מבוסס.

Arabic_Explanation
المقصود أن الكتابة الأكاديمية تمر بعدة مراحل مثل قراءة المصادر وتحليلها وصياغة حجة.

English_Explanation
Academic writing includes reading sources, analyzing them, and forming an argument.

French_Explanation
L’écriture académique comprend la lecture des sources, leur analyse et la formulation d’un argument.

Common_Arabic_Error
השמטת אחד משלבי התהליך.

# **Sentence 28**

Sentence_ID
PROC_02

Sentence_Text
בתהליך המחקר החברתי נאספים נתונים, מנותחים ומפורשים.

Category
Process

Difficulty
1

Paraphrase_Level
1

Components
subject: נתונים
action: נאספים ומנותחים
context: בתהליך המחקר החברתי

Paraphrase_Tools
lexical_change

Typical_Errors
structure_copying

Exercise_Types
process_rewrite

Example_Paraphrase
במחקר חברתי החוקרים אוספים נתונים, מנתחים אותם ומפרשים אותם.

Arabic_Explanation
المقصود أن البحث الاجتماعي يشمل جمع البيانات وتحليلها وتفسيرها.

English_Explanation
Social research involves collecting, analyzing, and interpreting data.

French_Explanation
La recherche sociale comprend la collecte, l’analyse et l’interprétation des données.

Common_Arabic_Error
תרגום מילולי של "נאספים".

# **Sentence 29**

Sentence_ID
IMP_03

Sentence_Text
ממצא זה עשוי לתרום להבנה רחבה יותר של תהליכי למידה.

Category
Implication

Difficulty
1

Paraphrase_Level
1

Components
subject: ממצא זה
action: עשוי לתרום
object: להבנה רחבה יותר
context: של תהליכי למידה

Paraphrase_Tools
lexical_change

Typical_Errors
minimal_change

Exercise_Types
implication_rewrite

Example_Paraphrase
ייתכן שממצא זה יסייע להבין טוב יותר את תהליכי הלמידה.

Arabic_Explanation
المقصود أن هذه النتيجة قد تساعد على فهم عمليات التعلم بشكل أعمق.

English_Explanation
This finding may contribute to a broader understanding of learning processes.

French_Explanation
Ce résultat peut contribuer à une meilleure compréhension des processus d’apprentissage.

Common_Arabic_Error
השמטת מילת ההסתייגות.

# **Sentence 30**

Sentence_ID
LIM_03

Sentence_Text
עם זאת, יש לזכור כי המדגם במחקר זה היה מצומצם יחסית.

Category
Limitation

Difficulty
1

Paraphrase_Level
2

Components
marker: עם זאת
action: יש לזכור
object: המדגם היה מצומצם
context: במחקר זה

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
missing_marker

Exercise_Types
limitation_rewrite

Example_Paraphrase
עם זאת, חשוב לציין כי המחקר התבסס על מדגם קטן יחסית.

Arabic_Explanation
المقصود أن عدد المشاركين في الدراسة كان صغيرًا نسبيًا.

English_Explanation
The study was based on a relatively small sample.

French_Explanation
L’étude reposait sur un échantillon relativement limité.

Common_Arabic_Error
השמטת מילת הקישור "עם זאת".

# **Sentence 31**

Sentence_ID
DEF_03

Sentence_Text
אוריינות אקדמית מתייחסת ליכולת לקרוא, לנתח ולכתוב טקסטים אקדמיים.

Category
Definition

Difficulty
1

Paraphrase_Level
2

Components
subject: אוריינות אקדמית
action: מתייחסת
object: ליכולת לקרוא, לנתח ולכתוב
context: טקסטים אקדמיים

Paraphrase_Tools
lexical_change
structure_change
sentence_split

Typical_Errors
minimal_change

Exercise_Types
definition_rewrite

Example_Paraphrase
אוריינות אקדמית היא היכולת להתמודד עם קריאה וכתיבה של טקסטים אקדמיים.

Arabic_Explanation
المقصود أن محو الأمية الأكاديمية يعني القدرة على قراءة النصوص الأكاديمية وتحليلها وكتابتها.

English_Explanation
The sentence explains that academic literacy refers to the ability to read, analyze, and write academic texts.

French_Explanation
La phrase explique que la littératie académique est la capacité de lire, analyser et écrire des textes académiques.

Common_Arabic_Error
תרגום מילולי של הביטוי "מתייחסת ל".

Paraphrase_Ladder
Original
אוריינות אקדמית מתייחסת ליכולת לקרוא, לנתח ולכתוב טקסטים אקדמיים.

Level_1_Lexical
אוריינות אקדמית קשורה ליכולת לקרוא, לנתח ולכתוב טקסטים אקדמיים.

Level_2_Structure
היכולת לקרוא, לנתח ולכתוב טקסטים אקדמיים נקראת אוריינות אקדמית.

Level_3_Reorganization
אוריינות אקדמית מבוססת על קריאה, ניתוח וכתיבה של טקסטים אקדמיים.

# **Sentence 32**

Sentence_ID
RC_03

Sentence_Text
מחקרים רבים מראים כי למידה שיתופית יכולה לשפר את הישגי הסטודנטים.

Category
Research Claim

Difficulty
1

Paraphrase_Level
2

Components
marker: מחקרים רבים מראים כי
subject: למידה שיתופית
action: יכולה לשפר
object: את הישגי הסטודנטים

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
minimal_change
missing_marker

Exercise_Types
research_claim_rewrite

Example_Paraphrase
מחקרים מצביעים על כך שלמידה בשיתוף פעולה עשויה להעלות את הישגי הסטודנטים.

Arabic_Explanation
المقصود أن الدراسات تشير إلى أن التعلم التعاوني قد يحسن أداء الطلاب.

English_Explanation
The sentence suggests that collaborative learning may improve students' academic performance.

French_Explanation
La phrase suggère que l’apprentissage collaboratif peut améliorer les résultats des étudiants.

Common_Arabic_Error
השמטת מילת ההסתייגות.

Paraphrase_Ladder
Original
מחקרים רבים מראים כי למידה שיתופית יכולה לשפר את הישגי הסטודנטים.

Level_1_Lexical
מחקרים רבים מצביעים על כך שלמידה שיתופית עשויה לשפר את הישגי הסטודנטים.

Level_2_Structure
הישגי הסטודנטים יכולים להשתפר באמצעות למידה שיתופית.

Level_3_Reorganization
למידה שיתופית עשויה לתרום לשיפור בהישגי הסטודנטים.

# **Sentence 33**

Sentence_ID
CE_03

Sentence_Text
חשיפה למקורות מידע מגוונים עשויה להרחיב את נקודת המבט של הסטודנטים.

Category
Cause–Effect

Difficulty
1

Paraphrase_Level
2

Components
subject: חשיפה למקורות מידע מגוונים
action: עשויה להרחיב
object: את נקודת המבט של הסטודנטים

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
minimal_change

Exercise_Types
cause_effect_rewrite

Example_Paraphrase
כאשר סטודנטים נחשפים למקורות מידע שונים, נקודת מבטם עשויה להתרחב.

Arabic_Explanation
المقصود أن الاطلاع على مصادر معلومات مختلفة يساعد الطلاب على رؤية الموضوع من زوايا متعددة.

English_Explanation
The sentence means that exposure to diverse sources of information can broaden students' perspectives.

French_Explanation
La phrase signifie que l’exposition à différentes sources d’information peut élargir la perspective des étudiants.

Common_Arabic_Error
תרגום מילולי של הביטוי "נקודת מבט".

Paraphrase_Ladder
Original
חשיפה למקורות מידע מגוונים עשויה להרחיב את נקודת המבט של הסטודנטים.

Level_1
חשיפה למקורות מידע שונים יכולה להרחיב את נקודת מבטם של הסטודנטים.

Level_2
נקודת מבטם של הסטודנטים עשויה להתרחב כאשר הם נחשפים למקורות מידע מגוונים.

Level_3
מקורות מידע מגוונים יכולים לסייע לסטודנטים לפתח נקודת מבט רחבה יותר.

# **Sentence 34**

Sentence_ID
COMP_03

Sentence_Text
למידה מבוססת פרויקטים דורשת מעורבות גבוהה יותר מאשר למידה המבוססת על הרצאות בלבד.

Category
Comparison

Difficulty
2

Paraphrase_Level
2

Components
subject: למידה מבוססת פרויקטים
action: דורשת
object: מעורבות גבוהה יותר
comparison: מאשר למידה המבוססת על הרצאות

Paraphrase_Tools
lexical_change

Typical_Errors
structure_copying

Exercise_Types
comparison_rewrite

Example_Paraphrase
בהשוואה ללמידה המבוססת רק על הרצאות, למידה מבוססת פרויקטים מחייבת מעורבות רבה יותר.

Arabic_Explanation
المقصود أن التعلم القائم على المشاريع يتطلب مشاركة أكبر من التعلم الذي يعتمد فقط على المحاضرات.

English_Explanation
The sentence explains that project-based learning requires more engagement than lecture-based learning.

French_Explanation
La phrase explique que l’apprentissage par projets demande plus d’implication que l’apprentissage basé uniquement sur des conférences.

Common_Arabic_Error
השמטת חלק ההשוואה.

Paraphrase_Ladder
Level_1
למידה מבוססת פרויקטים מחייבת מעורבות רבה יותר.

Level_2
בהשוואה להרצאות בלבד, למידה מבוססת פרויקטים דורשת מעורבות גבוהה יותר.

Level_3
מעורבות הסטודנטים גבוהה יותר כאשר הלמידה מבוססת על פרויקטים.

# **Sentence 35**

Sentence_ID
HED_02

Sentence_Text
ייתכן כי שימוש בדוגמאות מוחשיות מסייע להבנת מושגים מורכבים.

Category
Hedging

Difficulty
1

Paraphrase_Level
2

Components
marker: ייתכן כי
subject: שימוש בדוגמאות מוחשיות
action: מסייע
object: להבנת מושגים מורכבים

Paraphrase_Tools
lexical_change

Typical_Errors
missing_hedge

Exercise_Types
hedging_rewrite

Example_Paraphrase
נראה כי דוגמאות מוחשיות יכולות לעזור להבין מושגים מורכבים.

Arabic_Explanation
المقصود أن استخدام أمثلة واضحة قد يساعد الطلاب على فهم مفاهيم معقدة.

English_Explanation
The sentence suggests that concrete examples may help explain complex concepts.

French_Explanation
La phrase suggère que des exemples concrets peuvent aider à comprendre des concepts complexes.

Common_Arabic_Error
השמטת מילת הסתייגות.

Paraphrase_Ladder
Level_1
ייתכן ששימוש בדוגמאות מוחשיות עוזר להבין מושגים מורכבים.

Level_2
הבנת מושגים מורכבים עשויה להשתפר באמצעות דוגמאות מוחשיות.

Level_3
דוגמאות מוחשיות עשויות להקל על הבנת מושגים מורכבים.

# **Sentence 36**

Sentence_ID
CONC_02

Sentence_Text
לסיכום, שילוב של קריאה וכתיבה הוא מרכיב חשוב בפיתוח מיומנויות אקדמיות.

Category
Conclusion

Difficulty
1

Paraphrase_Level
2

Components
marker: לסיכום
subject: שילוב של קריאה וכתיבה
action: הוא
object: מרכיב חשוב
context: בפיתוח מיומנויות אקדמיות

Paraphrase_Tools
lexical_change

Typical_Errors
minimal_change

Exercise_Types
conclusion_rewrite

Example_Paraphrase
לסיכום, קריאה וכתיבה יחד תורמות לפיתוח מיומנויות אקדמיות.

Arabic_Explanation
المقصود أن القراءة والكتابة معًا تساعدان على تطوير المهارات الأكاديمية.

English_Explanation
The sentence concludes that reading and writing together contribute to academic skill development.

French_Explanation
La phrase conclut que la lecture et l’écriture contribuent au développement des compétences académiques.

Common_Arabic_Error
תרגום מילולי של הביטוי "מרכיב חשוב".

# **Sentence 37**

Sentence_ID
LIM_04

Sentence_Text
עם זאת, יש לקחת בחשבון כי הנתונים נאספו בתקופה מוגבלת.

Category
Limitation

Difficulty
1

Paraphrase_Level
2

Components
marker: עם זאת
action: יש לקחת בחשבון
object: הנתונים נאספו
context: בתקופה מוגבלת

Paraphrase_Tools
lexical_change

Typical_Errors
missing_marker

Exercise_Types
limitation_rewrite

Example_Paraphrase
עם זאת, חשוב לציין כי הנתונים נאספו במהלך תקופה קצרה.

Arabic_Explanation
المقصود أن البيانات في هذا البحث جُمعت خلال فترة زمنية محدودة.

English_Explanation
The sentence notes that the data were collected during a limited time period.

French_Explanation
La phrase indique que les données ont été collectées pendant une période limitée.

Common_Arabic_Error
השמטת מילת הקישור.

# **Sentence 38**

Sentence_ID
IMP_04

Sentence_Text
ממצאי המחקר עשויים לסייע בפיתוח שיטות הוראה יעילות יותר.

Category
Implication

Difficulty
1

Paraphrase_Level
1

Components
subject: ממצאי המחקר
action: עשויים לסייע
object: בפיתוח שיטות הוראה יעילות יותר

Paraphrase_Tools
lexical_change

Typical_Errors
minimal_change

Exercise_Types
implication_rewrite

Example_Paraphrase
ייתכן שממצאי המחקר יתרמו לפיתוח דרכי הוראה יעילות יותר.

Arabic_Explanation
المقصود أن نتائج البحث قد تساعد في تطوير طرق تدريس أفضل.

English_Explanation
The sentence suggests that the findings may help develop more effective teaching methods.

French_Explanation
La phrase suggère que les résultats de l’étude peuvent contribuer au développement de méthodes d’enseignement plus efficaces.

Common_Arabic_Error
השמטת מילת הסתייגות.

# **Sentence 39**

Sentence_ID
EXP_03

Sentence_Text
ניתן להבין תופעה זו באמצעות הקשר בין חוויית הלמידה לבין המוטיבציה של הסטודנטים.

Category
Explanation

Difficulty
2

Paraphrase_Level
2

Components
marker: ניתן להבין
subject: תופעה זו
action: באמצעות הקשר
object: בין חוויית הלמידה לבין המוטיבציה של הסטודנטים

Paraphrase_Tools
structure_change

Typical_Errors
meaning_distortion

Exercise_Types
explanation_rewrite

Example_Paraphrase
הקשר בין חוויית הלמידה לבין מוטיבציית הסטודנטים עשוי להסביר תופעה זו.

Arabic_Explanation
المقصود أن العلاقة بين تجربة التعلم ودافعية الطلاب تساعد على تفسير هذه الظاهرة.

English_Explanation
The sentence explains that the phenomenon can be understood through the relationship between learning experience and student motivation.

French_Explanation
La phrase explique que le phénomène peut être compris à travers la relation entre l’expérience d’apprentissage et la motivation des étudiants.

Common_Arabic_Error
תרגום מילולי של הביטוי "ניתן להבין".

# **Sentence 40**

Sentence_ID
PROC_03

Sentence_Text
בתהליך הכתיבה האקדמית הסטודנטים מנסחים טיעון ומבססים אותו על מקורות.

Category
Process

Difficulty
1

Paraphrase_Level
2

Components
subject: הסטודנטים
action: מנסחים ומבססים
object: טיעון
context: על מקורות

Paraphrase_Tools
sentence_merge
lexical_change

Typical_Errors
structure_copying

Exercise_Types
process_rewrite

Example_Paraphrase
בכתיבה אקדמית סטודנטים מפתחים טיעון הנשען על מקורות מידע.

Arabic_Explanation
المقصود أن الطلاب في الكتابة الأكاديمية يبنون حجة ويعتمدون فيها على مصادر.

English_Explanation
The sentence explains that in academic writing students develop an argument supported by sources.

French_Explanation
La phrase explique que dans l’écriture académique les étudiants formulent un argument basé sur des sources.

Common_Arabic_Error
השמטת המילה "מבוסס".

# **Sentence 41**

Sentence_ID
DEF_04

Sentence_Text
טיעון אקדמי הוא טענה מבוססת הנתמכת בנימוקים ובמקורות מידע.

Category
Definition

Difficulty
1

Paraphrase_Level
2

Components
subject: טיעון אקדמי
action: הוא
object: טענה מבוססת
context: הנתמכת בנימוקים ובמקורות מידע

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
minimal_change

Exercise_Types
definition_rewrite

Example_Paraphrase
טיעון אקדמי הוא עמדה הנתמכת בנימוקים ובהפניות למקורות.

Arabic_Explanation
المقصود أن الحجة الأكاديمية هي ادعاء يعتمد على أسباب ومصادر معلومات.

English_Explanation
The sentence explains that an academic argument is a claim supported by reasons and sources.

French_Explanation
La phrase explique qu’un argument académique est une affirmation soutenue par des raisons et des sources.

Common_Arabic_Error
תרגום מילולי של הביטוי "מבוססת".

Paraphrase_Ladder
Original
טיעון אקדמי הוא טענה מבוססת הנתמכת בנימוקים ובמקורות מידע.

Level_1
טיעון אקדמי הוא טענה הנתמכת בנימוקים ובמקורות.

Level_2
טענה אקדמית צריכה להיות מבוססת על נימוקים ומקורות מידע.

Level_3
נימוקים ומקורות מידע מהווים בסיס לטיעון אקדמי.

# **Sentence 42**

Sentence_ID
RC_04

Sentence_Text
מחקרים עדכניים מצביעים על קשר בין מעורבות סטודנטים לבין הצלחתם בלימודים.

Category
Research Claim

Difficulty
1

Paraphrase_Level
2

Components
marker: מחקרים עדכניים מצביעים על
object: קשר
context: בין מעורבות סטודנטים לבין הצלחתם בלימודים

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
missing_marker

Exercise_Types
research_claim_rewrite

Example_Paraphrase
מחקרים חדשים מראים כי מעורבות גבוהה של סטודנטים קשורה להצלחה בלימודים.

Arabic_Explanation
المقصود أن الدراسات الحديثة تشير إلى وجود علاقة بين مشاركة الطلاب ونجاحهم في الدراسة.

English_Explanation
The sentence suggests that research shows a link between student engagement and academic success.

French_Explanation
La phrase suggère que des études récentes montrent un lien entre l’engagement des étudiants et leur réussite académique.

Common_Arabic_Error
השמטת חלק הקשר במשפט.

# **Sentence 43**

Sentence_ID
CE_04

Sentence_Text
קריאה ביקורתית של מקורות עשויה להוביל להבנה מעמיקה יותר של הנושא הנחקר.

Category
Cause–Effect

Difficulty
1

Paraphrase_Level
2

Components
subject: קריאה ביקורתית של מקורות
action: עשויה להוביל
object: להבנה מעמיקה יותר
context: של הנושא הנחקר

Paraphrase_Tools
lexical_change

Typical_Errors
minimal_change

Exercise_Types
cause_effect_rewrite

Example_Paraphrase
כאשר סטודנטים קוראים מקורות באופן ביקורתי, הבנתם בנושא עשויה להעמיק.

Arabic_Explanation
المقصود أن قراءة المصادر بشكل نقدي تساعد على فهم الموضوع بشكل أعمق.

English_Explanation
The sentence explains that critical reading of sources can lead to deeper understanding.

French_Explanation
La phrase explique que la lecture critique des sources peut conduire à une compréhension plus profonde.

Common_Arabic_Error
תרגום מילולי של הביטוי "להוביל ל".

# **Sentence 44**

Sentence_ID
COMP_04

Sentence_Text
למידה עצמאית מחייבת אחריות גבוהה יותר מצד הסטודנט מאשר למידה מונחית.

Category
Comparison

Difficulty
2

Paraphrase_Level
2

Components
subject: למידה עצמאית
action: מחייבת
object: אחריות גבוהה יותר מצד הסטודנט
comparison: מאשר למידה מונחית

Paraphrase_Tools
lexical_change

Typical_Errors
structure_copying

Exercise_Types
comparison_rewrite

Example_Paraphrase
בהשוואה ללמידה מונחית, למידה עצמאית דורשת אחריות רבה יותר מצד הסטודנטים.

Arabic_Explanation
المقصود أن التعلم الذاتي يتطلب مسؤولية أكبر من التعلم الموجه.

English_Explanation
The sentence explains that independent learning requires more responsibility than guided learning.

French_Explanation
La phrase explique que l’apprentissage autonome demande plus de responsabilité que l’apprentissage guidé.

Common_Arabic_Error
השמטת חלק ההשוואה.

# **Sentence 45**

Sentence_ID
HED_03

Sentence_Text
ייתכן כי שילוב של משוב מתמשך משפר את תהליך הלמידה.

Category
Hedging

Difficulty
1

Paraphrase_Level
2

Components
marker: ייתכן כי
subject: שילוב של משוב מתמשך
action: משפר
object: את תהליך הלמידה

Paraphrase_Tools
lexical_change

Typical_Errors
missing_hedge

Exercise_Types
hedging_rewrite

Example_Paraphrase
נראה כי משוב מתמשך עשוי לשפר את תהליך הלמידה.

Arabic_Explanation
المقصود أن تقديم ملاحظات مستمرة قد يحسن عملية التعلم.

English_Explanation
The sentence suggests that continuous feedback may improve the learning process.

French_Explanation
La phrase suggère que des retours continus peuvent améliorer le processus d’apprentissage.

Common_Arabic_Error
השמטת מילת הסתייגות.

# **Sentence 46**

Sentence_ID
CONC_03

Sentence_Text
לסיכום, ניתן לומר כי פיתוח מיומנויות מחקר הוא חלק מרכזי בלמידה אקדמית.

Category
Conclusion

Difficulty
1

Paraphrase_Level
2

Components
marker: לסיכום
action: ניתן לומר
object: פיתוח מיומנויות מחקר
context: חלק מרכזי בלמידה אקדמית

Paraphrase_Tools
lexical_change

Typical_Errors
minimal_change

Exercise_Types
conclusion_rewrite

Example_Paraphrase
לסיכום, מיומנויות מחקר הן מרכיב חשוב בלמידה האקדמית.

Arabic_Explanation
المقصود أن مهارات البحث تعتبر جزءًا أساسيًا من التعلم الأكاديمي.

English_Explanation
The sentence concludes that research skills are an important part of academic learning.

French_Explanation
La phrase conclut que les compétences de recherche sont une partie importante de l’apprentissage académique.

Common_Arabic_Error
תרגום מילולי של הביטוי "חלק מרכזי".

# **Sentence 47**

Sentence_ID
LIM_05

Sentence_Text
עם זאת, המחקר התבסס על מדגם קטן יחסית של משתתפים.

Category
Limitation

Difficulty
1

Paraphrase_Level
2

Components
marker: עם זאת
subject: המחקר
action: התבסס
object: על מדגם קטן יחסית
context: של משתתפים

Paraphrase_Tools
lexical_change

Typical_Errors
missing_marker

Exercise_Types
limitation_rewrite

Example_Paraphrase
עם זאת, מספר המשתתפים במחקר היה קטן יחסית.

Arabic_Explanation
المقصود أن عدد المشاركين في الدراسة كان صغيرًا نسبيًا.

English_Explanation
The sentence states that the study relied on a relatively small sample of participants.

French_Explanation
La phrase indique que l’étude reposait sur un échantillon relativement petit de participants.

Common_Arabic_Error
השמטת מילת הקישור.

# **Sentence 48**

Sentence_ID
IMP_05

Sentence_Text
ממצאים אלו עשויים לתרום לפיתוח דרכי הוראה חדשות.

Category
Implication

Difficulty
1

Paraphrase_Level
1

Components
subject: ממצאים אלו
action: עשויים לתרום
object: לפיתוח דרכי הוראה חדשות

Paraphrase_Tools
lexical_change

Typical_Errors
minimal_change

Exercise_Types
implication_rewrite

Example_Paraphrase
ייתכן שממצאים אלו יסייעו לפתח שיטות הוראה חדשות.

Arabic_Explanation
المقصود أن نتائج البحث قد تساعد في تطوير طرق تدريس جديدة.

English_Explanation
The sentence suggests that these findings may contribute to developing new teaching methods.

French_Explanation
La phrase suggère que ces résultats peuvent contribuer au développement de nouvelles méthodes d’enseignement.

Common_Arabic_Error
השמטת מילת הסתייגות.

# **Sentence 49**

Sentence_ID
EXP_04

Sentence_Text
ניתן להסביר את הקושי בלמידה בכך שהסטודנטים אינם מכירים את השפה האקדמית.

Category
Explanation

Difficulty
2

Paraphrase_Level
2

Components
marker: ניתן להסביר
subject: הקושי בלמידה
action: בכך ש
object: הסטודנטים אינם מכירים
context: את השפה האקדמית

Paraphrase_Tools
structure_change

Typical_Errors
meaning_distortion

Exercise_Types
explanation_rewrite

Example_Paraphrase
אחת הסיבות לקושי בלמידה היא חוסר היכרות של הסטודנטים עם השפה האקדמית.

Arabic_Explanation
المقصود أن الطلاب يواجهون صعوبة في التعلم لأنهم غير معتادين على اللغة الأكاديمية.

English_Explanation
The sentence explains that learning difficulties may result from students’ unfamiliarity with academic language.

French_Explanation
La phrase explique que les difficultés d’apprentissage peuvent être liées au manque de familiarité des étudiants avec la langue académique.

Common_Arabic_Error
תרגום מילולי של המבנה "ניתן להסביר".

# **Sentence 50**

Sentence_ID
PROC_04

Sentence_Text
בתהליך המחקר החוקרים מגדירים שאלה, אוספים נתונים ומנתחים אותם.

Category
Process

Difficulty
1

Paraphrase_Level
2

Components
subject: החוקרים
action: מגדירים, אוספים ומנתחים
object: נתונים
context: בתהליך המחקר

Paraphrase_Tools
sentence_merge
lexical_change

Typical_Errors
structure_copying

Exercise_Types
process_rewrite

Example_Paraphrase
במחקר החוקרים מגדירים שאלת מחקר, אוספים נתונים ולאחר מכן מנתחים אותם.

Arabic_Explanation
المقصود أن الباحثين في البحث العلمي يحددون سؤال البحث ثم يجمعون البيانات ويحللونها.

English_Explanation
The sentence explains that in research, scholars define a question, collect data, and analyze it.

French_Explanation
La phrase explique que dans la recherche les chercheurs définissent une question, collectent des données et les analysent.

Common_Arabic_Error
השמטת אחד משלבי התהליך.

# **Sentence 51**

Sentence_ID
DEF_05

Sentence_Text
סקירת ספרות היא הצגה שיטתית של מחקרים קודמים בנושא מסוים.

Category
Definition

Difficulty
1

Paraphrase_Level
2

Components
subject: סקירת ספרות
action: היא
object: הצגה שיטתית
context: של מחקרים קודמים בנושא מסוים

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
minimal_change

Exercise_Types
definition_rewrite

Example_Paraphrase
סקירת ספרות מציגה באופן שיטתי מחקרים שנערכו בעבר בנושא מסוים.

Arabic_Explanation
المقصود أن مراجعة الأدبيات هي عرض منظم للدراسات السابقة حول موضوع معين.

English_Explanation
The sentence explains that a literature review is a systematic presentation of previous studies on a topic.

French_Explanation
La phrase explique qu’une revue de littérature est une présentation systématique des recherches antérieures sur un sujet.

Common_Arabic_Error
תרגום מילולי של הביטוי "סקירת".

# **Sentence 52**

Sentence_ID
RC_05

Sentence_Text
מחקרים שונים מצביעים על כך ששימוש בכלי AI משפיע על דרכי הלמידה של סטודנטים.

Category
Research Claim

Difficulty
2

Paraphrase_Level
2

Components
marker: מחקרים שונים מצביעים על כך ש
subject: שימוש בכלי AI
action: משפיע
object: על דרכי הלמידה של סטודנטים

Paraphrase_Tools
lexical_change
structure_change

Typical_Errors
missing_marker

Exercise_Types
research_claim_rewrite

Example_Paraphrase
מחקרים מראים כי שימוש בבינה מלאכותית עשוי לשנות את דרכי הלמידה של סטודנטים.

Arabic_Explanation
المقصود أن الدراسات تشير إلى أن استخدام أدوات الذكاء الاصطناعي يؤثر في طرق تعلم الطلاب.

English_Explanation
The sentence suggests that studies show AI tools influence how students learn.

French_Explanation
La phrase suggère que des études montrent que les outils d’IA influencent les modes d’apprentissage des étudiants.

Common_Arabic_Error
השמטת מילת ההסתייגות.

# **Sentence 53**

Sentence_ID
CE_05

Sentence_Text
שילוב של דיון קבוצתי בכיתה עשוי להגביר את מעורבות הסטודנטים בלמידה.

Category
Cause–Effect

Difficulty
1

Paraphrase_Level
2

Components
subject: שילוב של דיון קבוצתי בכיתה
action: עשוי להגביר
object: את מעורבות הסטודנטים בלמידה

Paraphrase_Tools
lexical_change

Typical_Errors
minimal_change

Exercise_Types
cause_effect_rewrite

Example_Paraphrase
כאשר מתקיים דיון קבוצתי בכיתה, מעורבות הסטודנטים בלמידה עשויה לגדול.

Arabic_Explanation
المقصود أن النقاش الجماعي في الصف يمكن أن يزيد من مشاركة الطلاب في التعلم.

English_Explanation
The sentence explains that group discussion in class can increase student engagement.

French_Explanation
La phrase explique que la discussion en groupe en classe peut augmenter l’engagement des étudiants.

Common_Arabic_Error
תרגום מילולי של הביטוי "מעורבות".

# **Sentence 54**

Sentence_ID
COMP_05

Sentence_Text
למידה מקוונת מציעה גמישות רבה יותר בהשוואה ללמידה המתקיימת בכיתה.

Category
Comparison

Difficulty
1

Paraphrase_Level
2

Components
subject: למידה מקוונת
action: מציעה
object: גמישות רבה יותר
comparison: בהשוואה ללמידה בכיתה

Paraphrase_Tools
lexical_change

Typical_Errors
structure_copying

Exercise_Types
comparison_rewrite

Example_Paraphrase
בהשוואה ללמידה בכיתה, למידה מקוונת מאפשרת גמישות גבוהה יותר.

Arabic_Explanation
المقصود أن التعلم عبر الإنترنت يوفر مرونة أكبر من التعلم في الصف.

English_Explanation
The sentence explains that online learning offers more flexibility than classroom learning.

French_Explanation
La phrase explique que l’apprentissage en ligne offre plus de flexibilité que l’apprentissage en classe.

Common_Arabic_Error
השמטת חלק ההשוואה.

# **Sentence 55**

Sentence_ID
HED_04

Sentence_Text
ייתכן כי שימוש בשאלות פתוחות מעודד חשיבה ביקורתית אצל סטודנטים.

Category
Hedging

Difficulty
1

Paraphrase_Level
2

Components
marker: ייתכן כי
subject: שימוש בשאלות פתוחות
action: מעודד
object: חשיבה ביקורתית אצל סטודנטים

Paraphrase_Tools
lexical_change

Typical_Errors
missing_hedge

Exercise_Types
hedging_rewrite

Example_Paraphrase
נראה כי שאלות פתוחות עשויות לעודד חשיבה ביקורתית אצל סטודנטים.

Arabic_Explanation
المقصود أن استخدام الأسئلة المفتوحة قد يشجع التفكير النقدي لدى الطلاب.

English_Explanation
The sentence suggests that open questions may encourage critical thinking.

French_Explanation
La phrase suggère que les questions ouvertes peuvent encourager la pensée critique.

Common_Arabic_Error
השמטת מילת הסתייגות.

# **Sentence 56**

Sentence_ID
CONC_04

Sentence_Text
לסיכום, פיתוח מיומנויות קריאה וכתיבה הוא מרכיב מרכזי בהצלחה בלימודים אקדמיים.

Category
Conclusion

Difficulty
1

Paraphrase_Level
2

Components
marker: לסיכום
subject: פיתוח מיומנויות קריאה וכתיבה
action: הוא
object: מרכיב מרכזי
context: בהצלחה בלימודים אקדמיים

Paraphrase_Tools
lexical_change

Typical_Errors
minimal_change

Exercise_Types
conclusion_rewrite

Example_Paraphrase
לסיכום, מיומנויות קריאה וכתיבה תורמות להצלחה בלימודים אקדמיים.

Arabic_Explanation
المقصود أن مهارات القراءة والكتابة مهمة للنجاح في الدراسة الأكاديمية.

English_Explanation
The sentence concludes that reading and writing skills are central to academic success.

French_Explanation
La phrase conclut que les compétences en lecture et écriture sont essentielles à la réussite académique.

Common_Arabic_Error
תרגום מילולי של הביטוי "מרכיב מרכזי".

# **Sentence 57**

Sentence_ID
LIM_06

Sentence_Text
עם זאת, יש לזכור כי המחקר התמקד בקבוצה מצומצמת של סטודנטים.

Category
Limitation

Difficulty
1

Paraphrase_Level
2

Components
marker: עם זאת
subject: המחקר
action: התמקד
object: בקבוצה מצומצמת של סטודנטים

Paraphrase_Tools
lexical_change

Typical_Errors
missing_marker

Exercise_Types
limitation_rewrite

Example_Paraphrase
עם זאת, חשוב לציין כי המחקר בחן קבוצה קטנה יחסית של סטודנטים.

Arabic_Explanation
المقصود أن الدراسة ركزت على مجموعة صغيرة من الطلاب.

English_Explanation
The sentence notes that the research focused on a relatively small group of students.

French_Explanation
La phrase indique que l’étude s’est concentrée sur un groupe relativement restreint d’étudiants.

Common_Arabic_Error
השמטת מילת הקישור.

# **Sentence 58**

Sentence_ID
IMP_06

Sentence_Text
ממצאים אלו יכולים לסייע למרצים בתכנון קורסים יעילים יותר.

Category
Implication

Difficulty
1

Paraphrase_Level
1

Components
subject: ממצאים אלו
action: יכולים לסייע
object: למרצים
context: בתכנון קורסים יעילים יותר

Paraphrase_Tools
lexical_change

Typical_Errors
minimal_change

Exercise_Types
implication_rewrite

Example_Paraphrase
ייתכן שממצאים אלו יעזרו למרצים לפתח קורסים יעילים יותר.

Arabic_Explanation
المقصود أن هذه النتائج قد تساعد المدرسين في تصميم مقررات أكثر فاعلية.

English_Explanation
The sentence suggests that the findings may help instructors design more effective courses.

French_Explanation
La phrase suggère que ces résultats peuvent aider les enseignants à concevoir des cours plus efficaces.

Common_Arabic_Error
השמטת מילת הסתייגות.

# **Sentence 59**

Sentence_ID
EXP_05

Sentence_Text
ניתן להבין תהליך זה באמצעות הקשר בין אסטרטגיות למידה לבין הצלחת הסטודנטים.

Category
Explanation

Difficulty
2

Paraphrase_Level
2

Components
marker: ניתן להבין
subject: תהליך זה
action: באמצעות הקשר
object: בין אסטרטגיות למידה לבין הצלחת הסטודנטים

Paraphrase_Tools
structure_change

Typical_Errors
meaning_distortion

Exercise_Types
explanation_rewrite

Example_Paraphrase
הקשר בין אסטרטגיות למידה לבין הצלחת הסטודנטים עשוי להסביר תהליך זה.

Arabic_Explanation
المقصود أن العلاقة بين استراتيجيات التعلم ونجاح الطلاب تساعد على تفسير هذه العملية.

English_Explanation
The sentence explains that the process can be understood through the link between learning strategies and student success.

French_Explanation
La phrase explique que ce processus peut être compris à travers la relation entre les stratégies d’apprentissage et la réussite des étudiants.

Common_Arabic_Error
תרגום מילולי של המבנה "ניתן להבין".

# **Sentence 60**

Sentence_ID
PROC_05

Sentence_Text
בתהליך הלמידה הסטודנטים קוראים מקורות, מנתחים מידע ומפתחים טיעון עצמאי.

Category
Process

Difficulty
1

Paraphrase_Level
2

Components
subject: הסטודנטים
action: קוראים, מנתחים ומפתחים
object: טיעון עצמאי
context: בתהליך הלמידה

Paraphrase_Tools
sentence_merge
lexical_change

Typical_Errors
structure_copying

Exercise_Types
process_rewrite

Example_Paraphrase
במהלך הלמידה הסטודנטים קוראים מקורות, מנתחים את המידע ובונים טיעון עצמאי.

Arabic_Explanation
المقصود أن الطلاب في عملية التعلم يقرؤون مصادر ويحللون المعلومات ويطورون حجة مستقلة.

English_Explanation
The sentence explains that during learning students read sources, analyze information, and develop an independent argument.

French_Explanation
La phrase explique que dans le processus d’apprentissage les étudiants lisent des sources, analysent l’information et développent un argument indépendant.

Common_Arabic_Error
השמטת אחד משלבי התהליך.

_______________________________

# **PARAPHRASE_EXERCISE_RULES.md**

## **Purpose of the Exercise Engine**

מסמך זה מגדיר כיצד הבוט משתמש במאגר המשפטים כדי להפעיל תרגול פרפרזה מדורג עבור הסטודנט.

הבוט אינו מציג רק משפטים לתרגול, אלא מנהל **תהליך למידה מובנה** הכולל:

- הצגת המשפט

- הבנת המשמעות

- ביצוע פרפרזה

- ניתוח התשובה

- מתן משוב

- הצעת שיפור

# **1. Selecting a Sentence**

כאשר הבוט מתחיל תרגול הוא בוחר משפט מתוך המאגר לפי השדות:

Difficulty
 Category
 Paraphrase_Level

עקרונות בחירה:

Difficulty
 מאפשר התאמת רמת הקושי ללומד.

Category
 מאפשר תרגול מבנים רטוריים שונים של כתיבה אקדמית.

Paraphrase_Level
 קובע את סוג השינוי הנדרש בפרפרזה.

# **2. Presenting the Sentence**

הבוט מציג לסטודנט:

Sentence_Text

לפני התרגול הבוט יכול להציג גם הסבר משמעות:

Arabic_Explanation
 English_Explanation
 French_Explanation

מטרת ההסבר:

להבטיח שהסטודנט מבין את המשמעות לפני ביצוע הפרפרזה.

הבוט אינו מציג תרגום מילולי אלא **הסבר של הרעיון המרכזי**.

# **3. Activating an Exercise**

הבוט בוחר סוג תרגיל מתוך:

Exercise_Types

דוגמאות לתרגילים:

micro_lexical_change
 שינוי מילים בודדות.

micro_structure_change
 שינוי מבנה המשפט.

full_sentence_paraphrase
 פרפרזה מלאה של המשפט.

definition_rewrite
 ניסוח מחדש של הגדרה.

cause_effect_rewrite
 ניסוח מחדש של קשר סיבתי.

comparison_rewrite
 ניסוח מחדש של השוואה.

sentence_split_exercise
 פיצול משפט מורכב לשני משפטים.

sentence_merge_exercise
 חיבור שני משפטים למשפט מורכב אחד.

# **4. Using Sentence Components**

הבוט משתמש בשדה:

Components

כדי לפרק את המשפט.

הרכיבים הם:

marker
 subject
 action
 object
 context

השימושים:

הסבר מבנה המשפט

זיהוי רכיבים חסרים בפרפרזה

בקשה לשינוי רכיב מסוים בלבד

דוגמה:

"נסה לשנות את ה-subject אך לשמור על אותה משמעות."

# **5. Analyzing the Student Answer**

כאשר הסטודנט מגיש פרפרזה, הבוט בודק:

האם המשמעות נשמרה

האם המבנה השתנה

האם כל הרכיבים מופיעים

לשם כך הבוט משתמש בשדות:

Typical_Errors
 Components

# **6. Providing Feedback**

לאחר הניתוח הבוט בוחר תבנית משוב מתוך:

PARAPHRASE_FEEDBACK_TEMPLATES

ומספק משוב פדגוגי.

המשוב צריך להיות:

קצר
 ברור
 ומכוון לשיפור.

# **7. Using the Paraphrase Ladder**

כאשר במשפט קיים השדה:

Paraphrase_Ladder

הבוט יכול להציג פרפרזות מדורגות.

המטרה:

להדגים דרגות שונות של שינוי:

Level 1 – שינוי מילים
 Level 2 – שינוי מבנה
 Level 3 – שינוי ארגון מידע

הבוט משתמש ב-Ladder בעיקר כאשר:

הסטודנט מתקשה
 או כאשר נדרש הסבר.

# **8. Adaptive Difficulty**

הבוט יכול להתאים את הקושי לפי ביצועי הסטודנט.

אם הפרפרזה מוצלחת:

Difficulty עולה

אם הסטודנט מתקשה:

הבוט מציע תרגיל פשוט יותר או משתמש ב-Paraphrase_Ladder.

# **PARAPHRASE_FEEDBACK_TEMPLATES.md**

## **Purpose**

מסמך זה כולל תבניות משוב שהבוט משתמש בהן לאחר ניתוח הפרפרזה של הסטודנט.

המטרה:

לספק משוב ברור, תומך ומכוון לשיפור.

המשוב מבוסס על סוג הטעות שזוהתה.

# **1. Minimal Change**

השינוי במשפט קטן מדי והמשפט נשאר קרוב מאוד למקור.

Feedback Template

המשפט שלך דומה מאוד למשפט המקורי.
 נסה לשנות לא רק מילים בודדות אלא גם את מבנה המשפט.

# **2. Structure Copying**

מבנה המשפט נשאר כמעט זהה למקור.

Feedback Template

נראה שמבנה המשפט עדיין דומה מאוד למשפט המקורי.
 נסה להתחיל את המשפט מרעיון אחר או לשנות את סדר המידע.

# **3. Meaning Distortion**

המשמעות השתנתה ביחס למשפט המקורי.

Feedback Template

נראה שהמשמעות של המשפט השתנתה מעט.
 נסה לשמור על אותו רעיון מרכזי תוך שינוי הניסוח בלבד.

# **4. Missing Component**

רכיב מרכזי מהמשפט המקורי חסר בפרפרזה.

Feedback Template

ייתכן שחסר רכיב חשוב מהמשפט המקורי.
 בדוק האם כל הרעיונות המרכזיים מופיעים בפרפרזה שלך.

# **5. Good Paraphrase**

הפרפרזה נכונה ושומרת על המשמעות תוך שינוי הניסוח.

Feedback Template

פרפרזה טובה.
 הצלחת לשמור על המשמעות של המשפט תוך שינוי הניסוח והמבנה.

# **6. Advanced Suggestion**

הפרפרזה נכונה אך ניתן לשפר אותה עוד.

Feedback Template

זו פרפרזה טובה.
 נסה כעת לנסח את המשפט מחדש בדרך שונה לגמרי, למשל על ידי שינוי סדר המידע במשפט.

# **7. Support for Arabic Speakers**

כאשר מזוהות טעויות אופייניות לדוברי ערבית, הבוט משתמש בשדה:

Common_Arabic_Error

ומספק משוב מותאם.

לדוגמה:

ייתכן שהמבנה של המשפט מושפע ממבנה תחבירי בערבית.
 נסה לבנות את המשפט מחדש לפי מבנה עברי רגיל.

# **Summary**

שני הקבצים משלימים את מאגר המשפטים:

**קובץ**

**תפקיד**

PARAPHRASE_KB_SCHEMA

מבנה הנתונים

PARAPHRASE_KB_SENTENCES

מאגר המשפטים

PARAPHRASE_EXERCISE_RULES

מנוע התרגול

PARAPHRASE_FEEDBACK_TEMPLATES

מנוע המשוב

יחד הם יוצרים:

**Paraphrase Training Engine**

לבוט הוראה בקורסי אוריינות אקדמית.

א

_______________________

# הצעות להוספה:

**Socratic Question Bank**

זה בנק של שאלות שהבוט משתמש בהן כדי להוביל את הסטודנט לחשיבה במקום לתת תשובה.

לדוגמה:

- מהו הרעיון המרכזי במשפט?

- איזה חלק במשפט ניתן לשנות בלי לפגוע במשמעות?

- האם ניתן להתחיל את המשפט בצורה אחרת?

_________________________

# **מאגר פרפרזה אקדמית – משפטים 1–20**

להלן **הנוסח המעודכן והסגור של מבנה יחידת המשפט (Sentence Unit)** השינויים **1–20**.
העדכון משקף בדיוק את מה שקבענו:

- הוספת הסברים רב־לשוניים (ערבית, אנגלית, צרפתית)
\
- הפרדה בין הסבר משמעות לבין תרגום
\
- התאמה ללומדים מהגרים ולדוברי עברית
\
- Paraphrase Ladder כשדה אופציונלי
\
- היררכיית קושי ברורה
\

המטרה היא שיהיה **מסמך אחד רשמי של התבנית**, שעל פיו ייבנו כל 60 המשפטים במאגר.

# **מבנה סופי של יחידת משפט**

Paraphrase Training Knowledge Base – Final Sentence Unit Schema

## **1. זיהוי המשפט**

**Sentence_ID**

מזהה ייחודי של המשפט במאגר.

מבנה הקוד כולל:

סוג המשפט + מספר סידורי

דוגמאות:

DEF_01
RC_02
CE_03
COMP_01
HED_01
CONC_01

הקידוד מאפשר לבוט להבין את סוג המשפט כבר משלב הזיהוי.

# **2. המשפט המקורי**

**Sentence_Text**

המשפט האקדמי שעליו מתבצע תרגול הפרפרזה.

המשפטים נכתבים בסגנון:

- מאמרים במדעי החברה
\
- טקסטים אקדמיים
\
- כתיבה מחקרית
\

# **3. קטגוריה רטורית**

**Category**

סוג המשפט מבחינת תפקידו בכתיבה אקדמית.

הקטגוריות במאגר:

Definition
Research Claim
Cause–Effect
Comparison
Hedging
Conclusion
Practice

הקטגוריה מאפשרת לבוט:

- לזהות מבנה רטורי
\
- להציע תרגיל מתאים
\

# **4. רמת מורכבות**

**Difficulty**

רמת המורכבות הלשונית והתחבירית של המשפט.

סקאלה:

1 — משפט פשוט
2 — משפט בינוני
3 — משפט מורכב

הקושי נקבע לפי:

- אורך המשפט
\
- מספר רכיבים תחביריים
\
- מורכבות אוצר המילים
\

# **5. עומק הפרפרזה**

**Paraphrase_Level**

רמת השינוי הנדרשת מהסטודנט.

1 — שינוי מילים בלבד
2 — שינוי מבנה המשפט
3 — שינוי מבנה וארגון מידע

שדה זה מאפשר לבוט לבחור את סוג התרגיל.

# **6. פירוק מבני של המשפט**

**Components**

פירוק המשפט לרכיבים תחביריים ורעיוניים.

מבנה טיפוסי:

marker
subject
action
object
context

דוגמה:

marker: מחקרים מצביעים על כך ש
subject: שימוש בטכנולוגיות למידה
action: עשוי לשפר
object: את מעורבות הסטודנטים
context: בשיעור

הפירוק מאפשר לבוט:

- להסביר את המשפט
\
- לבקש שינוי ברכיב מסוים
\
- לזהות רכיב חסר בפרפרזה
\

# **7. כלים לפרפרזה**

**Paraphrase_Tools**

רשימת כלים אפשריים לפרפרזה.

לדוגמה:

lexical_change
structure_change
information_reorder
nominalization
modal_change

הרשימה מאפשרת לבוט:

- להסביר איך לבצע פרפרזה
- להציע תרגיל ממוקד

בנוסף נוספו שני כלים חשובים לפרפרזה מבנית:

sentence_split
sentence_merge

כלים אלה מאפשרים לבוט להפעיל תרגילים שבהם:

• משפט אחד מפוצל לשני משפטים קצרים יותר תוך שמירה על המשמעות.
• שני משפטים מחוברים למשפט מורכב אחד.

מיומנויות אלו חשובות במיוחד בלמידת כתיבה אקדמית משום שהן מאפשרות:

- שינוי עמוק של מבנה המשפט
- גיוון תחבירי
- מעבר בין מבנים פשוטים ומורכבים

# **8. טעויות נפוצות**

**Typical_Errors**

טעויות אופייניות של סטודנטים בפרפרזה.

דוגמאות:

minimal_change
structure_copying
meaning_distortion
missing_component

הבוט משתמש בשדה זה כדי:

- לזהות סוג טעות
\
- לתת משוב מותאם
\

# **9. סוגי תרגילים**

**Exercise_Types**

סוגי תרגול שהבוט יכול להפעיל על המשפט.

לדוגמה:

micro_lexical_change
micro_structure_change
full_sentence_paraphrase
definition_rewrite
cause_effect_rewrite
comparison_rewrite

כך הבוט יכול להפעיל **תרגול מדורג**.

נוספו גם שני סוגי תרגילים מתקדמים:

sentence_split_exercise – פיצול משפט מורכב לשני משפטים.

sentence_merge_exercise – חיבור שני משפטים למשפט מורכב אחד.

תרגילים אלו מאפשרים ללומד להתנסות בשינוי מבני עמוק של המשפט, מעבר להחלפת מילים בלבד.

# **10. דוגמת פרפרזה**

**Example_Paraphrase**

דוגמה לפרפרזה תקינה של המשפט.

המטרה:

- לתת מודל לסטודנט
\
- לאפשר לבוט להציג פתרון
\

# **11. הסבר משמעות המשפט**

השדה הזה נוסף במיוחד עבור תלמידים שאינם דוברי עברית.

המטרה היא **להסביר את המשמעות**, לא לתרגם מילולית.

## **Arabic_Explanation**

הסבר בערבית למשמעות המשפט.

עוזר ללומדים:

- להבין את הרעיון המרכזי
\
- לפני ביצוע הפרפרזה
\

## **English_Explanation**

הסבר באנגלית למשמעות המשפט.

מיועד ללומדים בינלאומיים.

## **French_Explanation**

הסבר בצרפתית למשמעות המשפט.

# **12. טעויות אופייניות לדוברי ערבית**

**Common_Arabic_Error**

טעויות אופייניות של דוברי ערבית בעברית.

דוגמאות:

תרגום מילולי מערבית
שימוש שגוי במילות יחס
מבנה תחבירי ערבי

המידע מאפשר לבוט לתת **משוב מותאם ללומד**.

# **13. Paraphrase Ladder (רכיב מתקדם)**

שדה זה קיים **רק בחלק מהמשפטים**.

הוא מציג שלוש דרגות פרפרזה.

מבנה:

Original
Level_1_Lexical
Level_2_Structure
Level_3_Reorganization

דוגמה:

Original
מחקרים מראים כי שימוש בטכנולוגיות למידה עשוי לשפר את מעורבות הסטודנטים.

Level 1
מחקרים מצביעים על כך שטכנולוגיות למידה יכולות להגביר את מעורבות הסטודנטים.

Level 2
מעורבות הסטודנטים עשויה לגדול כאשר משתמשים בטכנולוגיות למידה.

Level 3
שילוב טכנולוגיות למידה עשוי להוביל למעורבות גבוהה יותר של סטודנטים.