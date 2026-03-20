# **📘 SP_GENERATION_ARCHITECTURE.md**

MilEd.One – System Prompt Generation Architecture

# **1. Purpose of This Document**

מסמך זה מתאר באופן קריא וברור כיצד מערכת MilEd.One מייצרת System Prompt פדגוגי מותאם־מרצה מתוך שאלון מובנה, תחת החוקה והעקרונות המוגדרים במסמך MASTER_SYSTEM_ARCHITECTURE.

המסמך מתמקד במנגנון היצירה בלבד:

- ללא תיאוריה
- ללא מניפסט
- ללא הרחבות פילוסופיות

זהו תיעוד מנוע יצירת ה‑SP.

# **2. Overview – The Generation Pipeline**

תהליך יצירת ה‑System Prompt מתבצע בשלבים הבאים:

- מילוי שאלון מרצה
- תרגום תשובות למשתנים מובְנים
- יצירת SPI (System Prompt Instance)
- הרכבת SP מלא
- Binding לחוקה (Kernel Enforcement)
- הפעלה

המערכת פועלת תמיד תחת מנוע אחד בלבד.

# **3. Stage 1 – Questionnaire Layer**

בשלב זה נאספים נתונים פדגוגיים מהמרצה.

קטגוריות עיקריות:

- זהות פדגוגית
- קהל יעד
- מטרות הבוט
- סוגי פעולות רצויות
- גבולות ואתיקה
- רמת עומק קוגניטיבי
- סגנון שיח
- מוד פעולה (Short / Long)

בשלב זה לא נוצר טקסט SP.
נוצרים נתונים בלבד.

# **4. Stage 2 – Variable Translation Layer**

כל תשובה מתורגמת למשתנים פנימיים.

דוגמאות למשתנים:

- depth_level
- dialogic_style
- enforcement_level
- substitution_policy
- stage_awareness
- evaluation_policy
- effort_regulation_mode
- response_granularity
- tone_intensity

המשתנים אינם SP סופי.
הם פרמטרים מובְנים המוזנים למנוע ההרכבה.

# **5. Stage 3 – SPI (System Prompt Instance)**

SPI הוא מופע ביניים.

הוא כולל:

- הפניה ל‑Kernel
- אוסף משתנים
- מוד פעולה
- פרופיל אכיפה
- גרסה

SPI אינו פועל מול משתמש.
הוא משמש תצורת ביניים לפני יצירת SP.

# **6. Stage 4 – SP Assembly**

בשלב זה נוצר ה‑System Prompt המלא מתוך ה‑SPI.

ההרכבה אינה חיבור טקסט חופשי, אלא בנייה שכבתית ומדורגת.

## **6.1 Macro Structural Layers**

ה‑SP בנוי מארבע שכבות עיקריות:

### **1. Kernel Layer (Immutable)**

- עקרונות חוקתיים
- No-Skip
- Support vs Substitution
- Analytic Integrity
- Governance Constraints

שכבה זו אינה ניתנת לשינוי ע"י משתני שאלון.

### **2. Variable Layer**

- נגזרי depth_level
- dialogic_style
- effort_regulation_mode
- evaluation_policy
- stage_awareness
- tone_intensity

שכבה זו מותאמת לכל מרצה.

### **3. Style Layer**

- רמת פורמליות
- אורך תשובות
- שימוש בשאלות לעומת הצהרות
- קצב דיאלוגי

### **4. Enforcement Layer**

- מנגנון ויסות מאמץ
- בדיקות No-Skip
- מניעת ביצוע במקום לומד
- אכיפה הדרגתית

## **6.2 Internal Micro-Structure of the SP**

מעבר לשכבות המאקרו, לכל SP יש מבנה פנימי לוגי קבוע יחסית.
גם אם הוא לא מוצג למשתמש ככותרות, הוא מאורגן כך:

Opening Block
- הגדרת תפקיד הבוט
- הגדרת הקשר קורס
- מסגור אינטראקציה
- הצגת ציפיות בסיסיות

Identity & Tone Block
- מיקום על ציר Directive ↔ Dialogic
- רמת ישירות
- רכות / אסרטיביות
- יחס לתלמיד

Task Processing Logic Block
- פירוק משימות
- זיהוי שלב
- ויסות מורכבות

Cognitive Regulation Block
- מנגנון No-Skip
- דרישת ניסוח ביניים
- דרישת הנמקה
- התאמת עומק לפי depth_level

Support Policy Block
- מה הבוט רשאי להציע
- מה אסור לו לבצע
- תנאי מעבר מהכוונה להרחבה

Reflection Block (אם רלוונטי)
- הזמנה למודעות לחשיבה
- עידוד מטה־קוגניציה
- בדיקת הבנה עצמית

Evaluation Logic Block (בבוט הערכה)
- עבודה לפי Rubric
- איסור שיפוט אינטואיטיבי
- פירוק הערכה לקריטריונים
- ניסוח משוב תהליכי

## **6.3 Mode-Specific Differences**

### **Short Mode**

- פחות שכבות רפלקציה
- ויסות מאמץ מינימלי
- תשובות קצרות יותר
- פחות חזרות מבניות

### **Long Mode**

- דיאלוג מדורג
- רפלקציה מפורשת
- בדיקת הבנה חוזרת
- ויסות מאמץ מתקדם

בשני המודים:

- Kernel זהה
- גבולות זהים
- Enforcement פעיל

## **6.4 Adaptive Extensions (Advanced Layer)**

בגרסאות מתקדמות ניתן לאפשר:

- העלאת רמת עומק לאורך השיחה
- הקשחת אכיפה לאחר דילוג
- התאמת רמת פירוט לפי תגובת לומד
- מעבר דינמי בין חקירה להסבר

התאמות אלו אינן משנות את החוקה,
רק את עוצמת היישום שלה.

## **6.5 Structural Integrity Rule**

כל שינוי ב‑SP חייב:

- לא לפגוע ב‑Kernel
- לא לבטל Enforcement
- לא לעקוף Support Policy
- לשמור על סדר מבני

## **6.6 Export Layer**

לאחר יצירת SPI והרכבת SP מלא, המערכת מאפשרת יצירת גרסה לייצוא (SPI+).

גרסת הייצוא כוללת:

- SPI
- קבועים פדגוגיים מרכזיים
- מבנה SP סדור
- ייחוס למערכת MilEd.One

גרסת הייצוא אינה כוללת:

- שכבת Enforcement מלאה בזמן ריצה
- מנגנוני Governance פנימיים
- לוגיקות מערכתיות עמוקות

הייצוא מוגדר כ‑First-Class Feature ואינו תוספת טכנית בלבד.

האחריות על שימוש חיצוני ב‑SP היא על המשתמש.

# **7. Constitutional Binding**

כל SP כפוף לחוקה.

לא ניתן:

- לבטל No-Skip
- לבטל Support vs Substitution
- לעקוף מנגנון אכיפה
- לשנות Kernel

ה‑Kernel תמיד גובר על משתנים.

# **8. Tool Layer Compatibility**

מנגנון יצירת ה‑SP מתוכנן לשרת כל כלי בשכבת הכלים של MilEd.One.

Bot Builder הוא אחד ממקורות ה‑SPI, אך אינו היחיד.

כל כלי עתידי במערכת חייב להשתמש באותו מנגנון הרכבה, תחת אותה חוקה.

# **9. Versioning and Updates**

כל SPI ו‑SP משויכים לגרסה.

בעת שינוי:

- שינוי במשתנה → עדכון במסמך BOT_BUILDER_MODEL בלבד
- שינוי בהרכבה → עדכון במסמך זה בלבד
- שינוי חוקתי → עדכון ב‑MASTER בלבד

מבנה זה מונע כפילויות ועדכונים חופפים.

# **10. Scope Boundaries**

מסמך זה אינו כולל:

- תיאוריות למידה
- צירים פדגוגיים
- תזות מוסדיות
- הצדקות פילוסופיות

אלו נמצאים במסמכים ייעודיים אחרים.

# **Closing Note**

SP_GENERATION_ARCHITECTURE מתאר מנוע אחד,
המאפשר יצירת בוטים מותאמים אישית,
בתוך מערכת חוקתית סגורה,
באופן קריא, עקבי וניתן לעדכון.