כרטיסיה 1

# **תהליך עבודה לבניית Project של ED421**

## **שלב 1 – הגדרה ותיחום**

- להחליט מה בדיוק המערכת יודעת לעשות בגרסה הראשונה (MVP).
 למשל: _“לקחת הרצאה → להפיק מטרות למידה → למפות מיומנויות → להציע פעילויות → לשמור בגיליון.”
_
- לקבוע: כמה סוכנים צריך בהתחלה (3–4 מספיקים).

- להגדיר אילו טבלאות חובה (Skills, Activities, Outputs).

## **שלב 2 – הכנת מסד נתונים ראשי (Google Sheets)**

לפתוח גיליון **Master DB** עם עמודות קבועות:

- מיומנות | תיאור | קטגוריה | דוגמאות פעילות | סוג תוצר

- להוסיף גיליונות נפרדים: מטרות למידה, מיפוי מיומנויות ↔ מטרות, פעילויות מיני־קורס.

- זה יהיה ה־“זיכרון” של המערכת בין כל הרצות.

## **שלב 3 – הגדרת הסוכנים בפרויקט**

- **Agent 1: Learning Objectives** → לוקח טקסט הרצאה ומחזיר מטרות למידה.

- **Agent 2: Skill Mapping** → משייך מטרות למיומנויות מה־DB.

- **Agent 3: Active Learning Design** → בונה מערך פעילויות עם תוצרים מדידים.

- **Agent 4: Data Manager** → כותב ל־Google Sheets ושולף משם.

_(אפשר להתחיל רק עם Agents 1+3 ולחבר אותם ישירות ל־Sheet אם רוצים לקצר)_

## **שלב 4 – בניית זרימת עבודה (Workflow)**

להגדיר סדר עבודה:

- מרצה מעלה חומר (טקסט הרצאה).

- Agent 1 מפיק מטרות → שולח ל־Sheet.

- Agent 2 מושך מטרות מה־Sheet → מוסיף מיומנויות.

- Agent 3 בונה פעילויות ותוצרים.

- Agent 4 שומר הכול ל־Sheet ומפיק דוח.

- אפשר להריץ את ה־workflow ידנית בהתחלה (בלחיצות), ואחר כך להפוך אותו לאוטומטי.

## **שלב 5 – בדיקות והרצה**

- להריץ את התהליך על **יחידת שיעור אחת** (למשל הרצאה על תיאוריות ההזדקנות).

לבדוק:

- האם המטרות הגיוניות?

- האם המיומנויות מתאימות?

- האם הפעילויות פרקטיות?

- לשפר את ההנחיות של כל Agent איפה שצריך.

## **שלב 6 – הרחבה והעמקה**

- להוסיף עוד Agents ייעודיים (למשל: _סוכן לניתוח תוצרים שהסטודנטים מעלים_).

- להרחיב את ה־DB עם דוגמאות זהב.

- לחבר ל־Looker Studio לדוחות ויזואליים.

- להתחיל לייבא תכנים מכמה קורסים ולא רק קורס אחד.

✨ בסוף שלב 6 יהיה לך כבר **מערכת אב־טיפוס אמיתית** – לא רק בוט, אלא סביבת עבודה עם DB מתמשך, סוכנים מוגדרים וזרימת עבודה ברורה.

הגדרה ותיחום

1

מסד נתונים DB

# **🗂️ ED421 – Database Proposal**

## **🔹 טבלאות ליבה (חובה ב־MVP)**

**Skills
**
- skill_id (string)

- name (string)

- description (text)

- category (cognitive / social / emotional / employment)

- level (1–5)

**Activities
**
- activity_id (string)

- title (string)

- description (text)

- linked_skill (Skill)

- type (discussion / case study / project / quiz / reflection)

**Outputs
**
- output_id (string)

- title (string)

- description (text)

- format (essay, presentation, video, portfolio, peer-feedback)

- linked_activity (Activity)

**TransformedUnit
**
- unit_id (string)

- original_content (text or file link)

- linked_skills (list of Skills)

- linked_activities (list of Activities)

- linked_outputs (list of Outputs)

- transformation_level (קל / בינוני / מהפכני)

## **🔹 טבלאות הרחבה (מומלץ כבר ב־MVP הראשון שלך)**

**MiniCoursePrinciples
**
- principle_id (string)

- name (string)

- description (text)

- phase (opening / core activity / reflection / assessment / wrap-up)
 👉 מאפשר להבטיח שכל מיני־קורס בנוי בצורה עקבית (כמו מתכון בסיסי).

**GoldenExamples
**
- example_id (string)

- title (string)

- description (text)

- file_link (קישור למסמך/מצגת/קובץ זהב)

- linked_principles (MiniCoursePrinciples)
 👉 משמש כ־**Benchmark** – המערכת יכולה להצליב עם דוגמאות טובות כדי להבטיח איכות.

## **🔹 טבלאות אופציונליות (שלב 2–3)**

**TransformationPatterns
**
- pattern_id (string)

- title (string)

- description (text)

- use_case (lecture → active, exam → project, etc.)
 👉 מאפשר להפעיל _תבניות טרנספורמציה_ מוכנות מראש.

**AssessmentModels
**
- model_id (string)

- title (string)

- description (text)

- linked_skills (list of Skills)
 👉 מאגר מודלים להערכת מיומנויות (Rubrics, שאלונים, מודלי AI).

## **🧭 מיפוי קשרים**

- **Skill ↔ Activity ↔ Output** (שלישייה בסיסית).

- **TransformedUnit ↔ Skills/Activities/Outputs** (יחידה הופכת לצירוף של כל אלה).

- **MiniCoursePrinciples ↔ GoldenExamples** (ביחד הם יוצרים סטנדרט איכותי).

- **TransformationPatterns ↔ TransformedUnit** (בוחרים את רמת השינוי לפי פטרן).

## **🚀 מה זה נותן לך ב־MVP?**

- **פשטות + עקביות**: גם אם המערכת בונה לך שיעור חדש, הוא תמיד יתיישר לפי ה־Principles.

- **איכות**: GoldenExamples שומרים על רף גבוה.

- **התרחבות קלה**: תוכל בהמשך להוסיף Patterns ו־Assessment Models בלי לשבור את ה־DB.

יפה שאתה דוחף את זה קדימה 💪.
 בוא נעבור לפרקטיקה: איך מחר בבוקר אתה פותח את הלפטופ ומתחיל לבנות את קבצי ה־DB הראשונים לפרויקט ED421.

# **🚀 צעדים ראשונים – בניית DB ב־Google Sheets (MVP)**

### **1️⃣ החלטה על הכלי**

- הכי קל להתחיל עם **Google Sheets**.

- למה? כי זה **חינמי**, נגיש, ו־GPT/פרויקט/סוכן יודעים להתחבר אליו בקלות (דרך Connectors או API).

### **2️⃣ יצירת קובץ ראשי**

- פתח Google Drive → צור **Google Sheet חדש** בשם:
 ED421_DB_Master

### **3️⃣ יצירת טבלאות (גיליונות בתוך הקובץ)**

ב־Google Sheets כל טבלה תהיה גיליון (Sheet) נפרד.
 ההצעה שלי: תתחיל עם 5 גיליונות בלבד, זה מספיק ל־MVP.

**Skills
** עמודות:

- skill_id

- name

- description

- category (קוגניטיבי / רגשי / חברתי / תעסוקתי)

- level (1–5)

**Activities
**
- activity_id

- title

- description

- linked_skill (מקשר ל־skill_id)

- type (case study, quiz, reflection…)

**Outputs
**
- output_id

- title

- description

- format (essay, video, presentation…)

- linked_activity (מקשר ל־activity_id)

**TransformedUnit
**
- unit_id

- original_content (קישור לטקסט/קובץ)

- linked_skills (רשימת skill_id)

- linked_activities (רשימת activity_id)

- linked_outputs (רשימת output_id)

- transformation_level (קל / בינוני / מהפכני)

**MiniCoursePrinciples
**
- principle_id

- name

- description

- phase (opening / activity / reflection / wrap-up)

### **4️⃣ להזין דוגמאות ראשונות**

לפני שאתה חושב בגדול – תכניס 3–4 שורות לדוגמה בכל טבלה:

- **Skill**: "Critical Thinking", "Teamwork".

- **Activity**: "Case Discussion: Aging in Society".

- **Output**: "Reflection essay, 500 words".

- **TransformedUnit**: יחידה מתוך _מבוא לגרונטולוגיה_.

- **Principle**: "Start every mini-course with an engaging case".

### **5️⃣ חיבור ל־GPT Project**

- בפרויקט תוסיף Connector ל־Google Sheets.

- כך הסוכנים שלך יוכלו לשאוב/לעדכן את הטבלאות ישירות.

- לדוגמה: Agent "Skill Mapper" יקרא את גיליון Skills כדי לדעת על מה להתבסס.

### **6️⃣ צעדי המשך**

אחרי שיש לך טבלאות בסיס, אפשר:

- להתחיל להזין תוכן אמיתי מהקורס שלך.

להגדיר את **שלושת הסוכנים הראשונים** (MVP):

- Extractor – לוקח טקסט ומוציא מטרות למידה.

- Skill Mapper – מחבר את המטרות ל־Skills.

- Activity Generator – בונה פעילות מתאימה לפי ה־Skills וה־Principles.

## **למה לאחד הכל לקובץ אחד?**

- **ניהול פשוט** – במקום עשרה קבצים שונים שאתה קופץ ביניהם, הכל יושב תחת קובץ "ED421_DB_Master".

- **גישה לסוכנים** – כשתרצה לחבר את זה ל־GPT Project / Make / Notion, הרבה יותר נוח לעבוד מול קובץ אחד עם כמה Sheets.

- **יחסים בין טבלאות** – קל יותר לקשר (למשל: activity_id מתוך גיליון Activities מקושר ל־skill_id מתוך Skills).

## **🧩 איך עושים את זה בפועל**

- פתח קובץ חדש בשם: **ED421_DB_Master**.

צור **Sheet נפרד לכל טבלה**. למשל:

- Skills

- Activities

- Outputs

- TransformedUnits

- MiniCoursePrinciples

- GoldenExamples

- TransformationPatterns

- AssessmentModels

- מהטבלאות הקיימות שלך (אלה שכבר בנינו בתהליך) – **תעתיק את הכותרות ואת הנתונים** לכל Sheet מתאים.

- תשמור על **מפתחות ID ייחודיים** (למשל skill_id או activity_id) כדי שאפשר יהיה לקשר ביניהם.

## **⚖️ מה חשוב לשים לב**

- **קונסיסטנטיות בשמות**: אם כתבת פעם "Critical Thinking" ופעם "critical thinking" – תאחד.

**פורמטים אחידים**: עדיף שה־IDs יהיו קצרים וברורים, לדוגמה:

- SK001, SK002 (למיומנויות).

- AC001, AC002 (לפעילויות).

- **עמודות חובה**: גם אם אין לך עדיין נתונים, שים את העמודות שהגדרנו קודם (name, description, type וכו’) כדי שיהיה מוכן לעבודה עתידית.

מעולה 🙌 – הנה **מבנה מלא לקובץ Google Sheets ראשי** (ED421_DB_Master).
 מחר בבוקר פשוט פתח קובץ חדש ותיצור את הגיליונות (Sheets) לפי הרשימה הזאת, עם הכותרות כבר מוכנות.

# **🗂️ ED421_DB_Master – מבנה מוצע**

## **1. Skills**

**skill_id**

**name**

**description**

**category**

**level**

SK001

Critical Thinking

היכולת לנתח ולהסיק מסקנות

קוגניטיבי

3

SK002

Teamwork

עבודה אפקטיבית עם אחרים

חברתי

2

## **2. Activities**

**activity_id**

**title**

**description**

**linked_skill**

**type**

**duration**

AC001

Case Discussion

דיון מונחה סביב מאמר

SK001

דיון

30 דק’

AC002

Group Project

פרויקט צוות בנושא גרונטולוגיה

SK002

פרויקט

שבועיים

## **3. Outputs**

**output_id**

**title**

**description**

**format**

**linked_activity**

**evaluation_criteria**

OP001

Reflection Essay

חיבור בן 500 מילים על נושא הגיל השלישי

Essay

AC001

עומק ניתוח, בהירות כתיבה

OP002

Group Presentation

מצגת קבוצתית מול הכיתה

Presentation

AC002

שיתוף פעולה, בהירות מסר

## **4. TransformedUnits**

**unit_id**

**original_content**

**linked_skills**

**linked_activities**

**linked_outputs**

**transformation_level**

TU001

הרצאה: "מבוא לגרונטולוגיה"

SK001;SK002

AC001;AC002

OP001;OP002

בינוני

## **5. MiniCoursePrinciples**

**principle_id**

**name**

**description**

**phase**

PR001

Engaging Opening

להתחיל כל יחידה בשאלה או מקרה

Opening

PR002

Active Anchor

פעילות מרכזית עם אינטראקציה

Core Activity

## **6. GoldenExamples**

**example_id**

**title**

**description**

**file_link**

**linked_principles**

GE001

Mini-course: Aging Case Study

יחידה לדוגמה על חשיבה ביקורתית

link-to-doc

PR001;PR002

## **7. TransformationPatterns (אופציונלי)**

**pattern_id**

**title**

**description**

**use_case**

TP001

Lecture → Active Learning

הפיכת הרצאה לדיון ופעילות

שימוש בהרצאות קיימות

## **8. AssessmentModels (אופציונלי)**

**model_id**

**title**

**description**

**linked_skills**

AM001

Critical Thinking Rubric

רובריקה בת 5 קריטריונים

SK001

# **✅ מה עושים מחר בבוקר?**

- פותח Google Sheet חדש בשם **ED421_DB_Master**.

- יוצר **8 גיליונות** (או לפחות את ה־5 הראשונים).

- מדביק את שמות העמודות מהטבלאות למעלה.

- מזין **כמה שורות דמה** כדי לבדוק שהמבנה עובד.

רוצה שאבנה לך גם **גרסת CSV ריקה** עם כל הכותרות מוכלות מראש, שתוכל להעלות ישירות ל־Sheets ולחסוך הקלדה?

הגדרת סוכנים

Workflow