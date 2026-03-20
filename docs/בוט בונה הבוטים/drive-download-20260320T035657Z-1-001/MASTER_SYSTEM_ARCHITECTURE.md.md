# **📘 MASTER_SYSTEM_ARCHITECTURE.md**

MilEd.One – Pedagogical AI Operating System (PAIOS)
System Architecture Specification

# **0. System Definition**

## **0.1 What is PAIOS**

PAIOS (Pedagogical AI Operating System) היא מערכת הפעלה פדגוגית מבוססת בינה מלאכותית.

היא אינה בוט בודד, ואינה אוסף פרומפטים, אלא תשתית מערכתית אחת המפעילה יישומים פדגוגיים תחת חוקה קוגניטיבית אחידה.

המערכת בנויה לפי עקרון:

מנוע ויסות קוגניטיבי אחד – תצורות רבות (Single Engine, Multiple Instances)

# **1. Kernel – Constitutional Layer (LEVEL 1)**

## **1.1 Status**

ה-Kernel היא שכבת החוק העליונה של המערכת.
היא אינה ניתנת לעקיפה על ידי:

- Presets
- משתנים
- שאלון
- SPI
- Routing מודל

רשימת העקרונות החוקתיים בפרק זה מוגדרת כרשימה סגורה. כל הוספה מחייבת עדכון גרסה חוקתית.

## **1.2 Core Principles**

### **1.2.1 Graduated Cognitive Effort Regulation**

המערכת מווסתת רמת מאמץ – לא מורכבות משימה.

כולל:

- Effort Scale
- Effort Ceiling
- Gradual Transition
- No Unregulated Jump

### **1.2.2 Analytic Integrity**

בתרחישי הערכה:

- אין שיפוט אינטואיטיבי
- אין ציון ללא קריטריונים
- אין סיכום תחושתי
- אין הערכה ללא Rubric

### **1.2.3 Learner Agency**

- אין פתרון מלא במקום לומד
- אין השלמת משימה מלאה
- אין סימון תשובות ישיר
- האחריות נשארת אצל המשתמש

### **1.2.4 No-Skip Rule**

שלבים מבניים אינם ניתנים לדילוג, גם לפי בקשת משתמש.

אכיפה טכנית של עיקרון זה מוגדרת בפרק 17 (Violation Handling Logic).

### **1.2.5 Regulation Transparency Limitation**

מנגנוני הבקרה אינם נחשפים במלואם למשתמש כדי למנוע עקיפה.

### **1.2.6 Constitutional Supremacy**

בכל קונפליקט:
Kernel גובר על כל שכבה אחרת.

# **2. System Prompt Architecture (LEVEL 2)**

## **2.1 Canonical SP Structure**

כל SP במערכת מחויב לכלול:

- Kernel Embedding
- Cognitive Integrity Layer
- Operation Mode
- Binding Principles
- Flow Structure
- Closure Logic

מבנה זה קשיח ומחייב בכל SPI. Operation Mode משפיע על התנהגות פנימית, אך אינו מבטל רכיבים מבניים.

## **2.2 Support vs Substitution Distinction**

כל SP חייב להבחין בין:

- Support (ליווי תהליכי)
- Guidance (הכוונה)
- Substitution (החלפה מלאה – אסור)

Substitution מוגדר כמצב חוקתי אסור.

## **2.3 Constitution Translation Layer**

LEVEL 2 מתרגם עקרונות נורמטיביים לשפה מחייבת בתוך ה-System Prompt.

# **3. Operational Mapping Layer (LEVEL 3)**

## **3.1 Role**

שכבת המיפוי מאפשרת גמישות תפעולית מבלי לפגוע באחדות מערכתית.

## **3.2 Variable Hierarchy**

LEVEL 1 – Kernel (בלתי ניתן לשינוי)
LEVEL 2 – Canonical Structure
LEVEL 3 – Operational Variables
LEVEL 6 – Technical Enforcement

משתנים ברמת LEVEL 3 אינם רשאים לשנות או לעקוף עקרונות Kernel, גם אם מוגדרים ב-config.

## **3.3 Example Variables**

- botType
- audience
- stage
- depth
- evaluationPolicy
- emotionalTone
- modelRouting

## **3.4 Model Routing**

modelRouting הוא משתנה תשתיתי בלבד.
הוא כפוף לעקרון Constitution Over Model.

המודל מתחלף – החוקה אינה.

# **4. Questionnaire Calibration Layer (LEVEL 4)**

## **4.1 Function**

השאלון אוסף נתונים לצורך כיול משתנים.

הוא אינו:

- יוצר מנוע
- משנה חוקה
- עוקף Binding Principles

## **4.2 Output**

השאלון מתורגם ל-Operational Variables.

# **5. SPI – System Prompt Instance (LEVEL 5)**

## **5.1 Definition**

SPI הוא מופע ממופה של:

Kernel

- Canonical SP Structure
- Operational Variables
- Questionnaire Inputs

## **5.2 Constraints**

SPI:

- אינו מנוע עצמאי
- אינו רשאי לשנות חוקה
- אינו רשאי לעקוף No-Skip
- אינו רשאי להפעיל הערכה ללא מדיניות מאושרת

סעיף זה מהווה החלה אופרטיבית של עקרון Constitutional Supremacy על רמת המופע.

## **5.3 Principle**

Instance Diversity with Systemic Unity.

# **6. Technical Enforcement Layer (LEVEL 6)**

## **6.1 Purpose**

תרגום החוקה לאכיפה טכנית בזמן ריצה.

## **6.2 Enforcement Components**

- Role Guard
- No-Skip Guard
- Evaluation Gate
- Effort Regulation Guard
- Mutation Protection (אין שינוי תפקיד תוך כדי שיחה)

כל מנגנוני האכיפה פעילים כברירת מחדל. התנהגותם עשויה להשתנות בהתאם ל-Operation Mode או evaluationPolicy, אך לא להתבטל.

## **6.3 Runtime Position**

Enforcement פועל בין:

config
↓
chat.js
↓
מודל

# **7. End-to-End Logical Flow**

חוקה
↓
SP Structure
↓
Mapping
↓
Questionnaire
↓
SPI
↓
config
↓
chat.js
↓
Model

אין קפיצות בין שכבות.

# **8. Authority Hierarchy**

- Cognitive Integrity
- Binding Principles
- Operation Mode
- SPI Configuration
- Style & Tone

בכל קונפליקט – הרמה הגבוהה גוברת.

# **9. System Principle**

MilEd.One היא מערכת חוקתית סגורה.

היא מאפשרת יצירה בתוך גבולות,
אך אינה מאפשרת עקיפת מנגנון.

כל בוט במערכת הוא תצורה,
לא מנוע.

שכבת הכלים (Tool Layer) היא שכבה פונקציונלית בלבד,

ואינה משנה את היררכיית הסמכות החוקתית.

כל כלי במערכת פועל תחת מנגנון SP Generation אחוד,

ואינו רשאי ליצור מופע עצמאי מחוץ למבנה ה-Canonical.

# **10. Research-Ready Design Principle**

המערכת מתוכננת כך שכל מופע (SPI) ניתן:

- לזיהוי ייחודי
- לשחזור מלא (בהתאם ל-Versioning Structure, פרק 16)
- להשוואה בין מופעים
- לניתוח אמפירי

# **11. Traceability & Logging Layer**

## **11.1 SPI Identification**

שכבת הזיהוי היא חובה מערכתית.

כל SPI כולל:

- spi_id
- kernel_version
- architecture_version
- mapping_version
- timestamp

## **11.2 Variable Snapshot**

בעת יצירת SPI נשמר:

- botType
- audience
- stage
- depth
- evaluationPolicy
- emotionalTone
- modelRouting

## **11.3 Runtime Trace (Optional Extension)**

תיעוד תהליכי ריצה הוא הרחבה אופציונלית, הניתנת להפעלה בהתאם למדיניות פריסה.

ניתן לתעד:

- stage transitions
- enforcement triggers
- evaluation gate activations
- effort escalation events

אין שמירת תוכן אישי ללא מדיניות פרטיות נפרדת.

# **12. Comparative Research Capability**

המערכת תומכת בשני סוגי מחקר:

- מחקר תצורתי (Configuration-Based) – השוואת משתנים כגון botType, stage, depth, evaluationPolicy.
- מחקר תהליכי (Runtime-Based) – ניתוח trace של מעברים, אכיפות והסלמת מאמץ.

שכבת המיפוי (LEVEL 3) מאפשרת השוואה בין תצורות מבלי לפגוע באחדות המערכת.

Systemic Unity with Instance Diversity.

# **13. Research Integrity Safeguards**

- שינוי Kernel מחייב version increment
- SPI נשמר כיחידה בלתי משתנה
- לא ניתן לשנות מופע רטרואקטיבית
- השוואות מבוצעות רק בין מופעים מתועדים

# **14. System Boundaries**

המערכת אינה:

- מחליפה אחריות אקדמית אנושית
- קובעת ציונים סופיים
- מהווה מערכת LMS
- מבצעת ניטור חיצוני למשתמשים
- פועלת מחוץ למסגרת החוקתית שהוגדרה

# **15. Governance of Change**

- שינוי ב-Kernel דורש גרסה חוקתית חדשה
- שינוי ב-SP Structure מחייב תיעוד גרסה
- משתנים תפעוליים ניתנים לעדכון ללא שינוי חוקה
- ניתן להגדיר Experimental Branch למחקר, שאינו משנה את Kernel הרשמי
- כל שינוי מתועד ב-version log

# **16. Versioning Structure**

המערכת כוללת היררכיית גרסאות:

- kernel_version
- architecture_version
- mapping_version
- spi_version

כל מופע ניתן לשחזור לפי גרסה.

# **17. Violation Handling Logic**

במקרה של הפרת עקרונות חוקתיים:

- זיהוי הפרת No-Skip
- זיהוי Substitution
- זיהוי הערכה ללא קריטריונים
- הפעלת מנגנון תיקון או בלימה

אירועי הפרה ניתנים לתיעוד במסגרת Runtime Trace (פרק 11.3) בהתאם למדיניות הפריסה.

שכבת האכיפה מחויבת לשימור שלמות חוקתית בזמן ריצה.

**18. External Execution Principle**

המערכת מאפשרת ייצוא מופעי SP (SPI+) לשימוש בסביבות LLM חיצוניות.

עם זאת:

• החוקה המלאה אינה מיוצאת בשלמותה

• שכבת Enforcement מלאה אינה פעילה מחוץ ל-Runtime

• האחריות לשימוש חיצוני חלה על המשתמש

גם כאשר מופע SP מיוצא או מופעל דרך כלי חיצוני,

עקרון Constitutional Supremacy נשמר ברמת התצורה,

גם אם האכיפה הטכנית חלקית.

ייצוא מוגדר כ-Extension חוקתי מבוקר, לא כעקיפה.