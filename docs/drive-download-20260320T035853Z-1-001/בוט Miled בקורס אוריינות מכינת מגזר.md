**מפתח OPEN AI**

[REDACTED — OpenAI API key removed before publishing]

מעולה. הבחירה ב-**Assistants API** היא הנכונה ביותר. היא תחסוך לך המון כאב ראש בקוד, כי כל הניהול של הקבצים (ה-Knowledge) וההנחיות (System Prompt) יישב בשרתים של OpenAI, והקוד שלנו יהיה רק הצינור שמחבר את הסטודנטים לשם.

הנה המדריך המלא והקוד המעודכן.

### **שלב 1: הכנת הבוט ב-OpenAI (לפני הקוד)**

- כנס לקישור:[ https://platform.openai.com/assistants](https://platform.openai.com/assistants)
- לחץ על **Create**.
- תן לו שם (למשל: "Academic Tutor").
- ב-**Instructions**: הדבק את ה-System Prompt המקורי שלך.
- ב-**Model**: בחר gpt-4o או gpt-4o-mini (המיני זול משמעותית ומספיק טוב לרוב הדברים).
- ב-**Tools**: סמן את **File Search** (זה מה שמאפשר לו לקרוא קבצים).
- העלה את קבצי ה-PDF/Word שלך.
- **חשוב מאוד:** אחרי שיצרת אותו, תראה למעלה מתחת לשם הבוט כיתוב שמתחיל ב-asst_.... **העתק את המזהה הזה ושמור אותו בצד.**

### **שלב 2: הקוד המעודכן (Python + Streamlit)**

הקוד הזה יודע להתחבר ל-Assistant שיצרת, לפתוח "שיחה" (Thread) לכל סטודנט בנפרד, ולהמתין לתשובה החכמה.

צור קובץ app.py והדבק בו את זה:

Python

import streamlit as st

from openai import OpenAI

import time

# --- הגדרת כותרת ועיצוב הדף ---

st.set_page_config(page_title="עוזר אקדמי - מכינה", page_icon="🎓")

st.title("🎓 צ'אט בוט לסיוע אקדמי")

st.caption("הבוט מתבסס על חומרי הלימוד של הקורס.")

# --- בדיקת מפתחות ---

if "OPENAI_API_KEY" not in st.secrets or "ASSISTANT_ID" not in st.secrets:

    st.error("חסרים מפתחות התחברות (Secrets). נא להגדיר OPENAI_API_KEY ו-ASSISTANT_ID.")

    st.stop()

# חיבור ל-OpenAI

client = OpenAI(api_key=st.secrets["OPENAI_API_KEY"])

assistant_id = st.secrets["ASSISTANT_ID"]

# --- ניהול שיחה (Thread) ---

# אנחנו בודקים אם כבר יש שיחה פתוחה לסטודנט הזה. אם לא - יוצרים חדשה.

if "thread_id" not in st.session_state:

    thread = client.beta.threads.create()

    st.session_state.thread_id = thread.id

    st.session_state.messages = [] # רשימה מקומית לתצוגה

# --- הצגת היסטוריית ההודעות ---

for message in st.session_state.messages:

    with st.chat_message(message["role"]):

        st.markdown(message["content"])

# --- קבלת שאלה מהסטודנט ---

if prompt := st.chat_input("כתוב את השאלה שלך כאן..."):

    # 1. הצגה מיידית של השאלה במסך

    st.session_state.messages.append({"role": "user", "content": prompt})

    with st.chat_message("user"):

        st.markdown(prompt)

    # 2. שליחת השאלה ל-OpenAI (הוספה ל-Thread)

    client.beta.threads.messages.create(

        thread_id=st.session_state.thread_id,

        role="user",

        content=prompt

    )

    # 3. הפעלת הבוט (Run) והמתנה לתשובה

    with st.chat_message("assistant"):

        with st.spinner("הבוט חושב ומעיין בחומרים..."):

            # יצירת ה-Run

            run = client.beta.threads.runs.create(

                thread_id=st.session_state.thread_id,

                assistant_id=assistant_id

            )

            # בדיקה בלולאה מתי הבוט סיים לענות

            while run.status != "completed":

                time.sleep(1) # מחכים שנייה

                run = client.beta.threads.runs.retrieve(

                    thread_id=st.session_state.thread_id,

                    run_id=run.id

                )

                

                # טיפול במקרה של כישלון (למשל בעיה בקבצים)

                if run.status in ["failed", "cancelled", "expired"]:

                    st.error("ארעה שגיאה בעיבוד הבקשה. נסה שנית.")

                    st.stop()

            # 4. שליפת התשובה החדשה

            messages = client.beta.threads.messages.list(

                thread_id=st.session_state.thread_id

            )

            

            # OpenAI מחזיר את כל ההודעות, אנחנו צריכים רק את האחרונה של הבוט

            last_message = messages.data[0]

            if last_message.role == "assistant":

                response_text = last_message.content[0].text.value

                

                # ניקוי הערות שוליים (בדרך כלל OpenAI מוסיף סימונים כמו 【4:0†source】)

                # בקוד פשוט נשאיר את זה, או שאפשר להוסיף כאן ניקוי טקסט

                

                st.markdown(response_text)

                st.session_state.messages.append({"role": "assistant", "content": response_text})

### **שלב 3: הגדרת הסיסמאות ב-Streamlit Cloud**

כשאתה מעלה את הקוד הזה ל-Streamlit, אתה חייב להגדיר לו את שני המשתנים הסודיים, אחרת הוא לא יידע לאן להתחבר.

בהגדרות (Settings) של האפליקציה ב-Streamlit, תחת הלשונית **Secrets**, תכתוב את זה בדיוק כך:

Ini, TOML

OPENAI_API_KEY = "sk-proj-....."

ASSISTANT_ID = "asst_....."

- במקום sk-proj... תשים את המפתח הרגיל שלך.
- במקום asst_... תשים את המזהה שהעתקת בשלב 1.

### **מה היתרון הגדול של הקוד הזה?**

עכשיו, אם תרצה מחר בבוקר לעדכן את ההוראות לבוט או להוסיף קובץ PDF חדש, **אתה לא צריך לגעת בקוד בכלל**. אתה פשוט נכנס לאתר של OpenAI, מעדכן שם את ה-Assistant, והאתר של הסטודנטים יתעדכן אוטומטית בפעם הבאה שהם ישאלו שאלה.

תגיד לי כשסיימת ליצור את ה-Assistant ואם הצלחת למצוא את ה-ID שלו.

________________________

שאלה מצוינת. אני אענה לך בכנות כדי שתבין את "הלוגיקה" של הדברים, כי זה באמת נראה מוזר מבחוץ.

**למה בעצם ביקשתי ממך לפתוח GitHub?**

תחשוב על האתר שאתה בונה כמו על "מסעדה".

- **Streamlit (סטרימליט):** זה "חדר האוכל" שהסטודנטים יושבים בו (האתר עצמו).
- **הקוד שכתבתי לך:** זה ה"מתכון".
- **GitHub:** זה "המחסן" שבו המתכון שמור.

**למה אי אפשר ישר לסטרימליט?**

סטרימליט (הפלטפורמה החינמית) לא מאפשרת לך "לכתוב" את הקוד ישירות בתוכה. היא חייבת "למשוך" את הקוד ממקום כלשהו שפתוח 24/7 באינטרנט. המקום הזה הוא **GitHub**.

אז אנחנו שמים את הקוד ב-GitHub (המחסן), ואומרים ל-Streamlit: "תסתכל כל הזמן על המחסן הזה, וכל מה שיש שם – תציג באתר".

### **חדשות טובות: אתה לא צריך "לדעת" GitHub**

אתה לא צריך להיות מתכנת. אנחנו נשתמש בזה רק בתור "כונן גוגל דרייב לקוד". אנחנו עושים פעולה חד-פעמית של "העתק-הדבק" ושוכחים מזה.

הנה ההוראות הכי פשוטות שיש, צעד-אחר-צעד, כדי לשים את הקוד שלך שם:

#### **שלב 1: יצירת "תיקייה" (Repository)**

- היכנס ל-GitHub לחשבון שלך.
- בצד שמאל למעלה (או בפלוס בצד ימין למעלה) לחץ על הכפתור הירוק **New** (או New Repository).
- בתיבה **Repository name** תן שם באנגלית (למשל: mechina-bot).
- סמן את העיגול **Public** (פומבי).
- גלול למטה ולחץ על **Create repository**.

#### **שלב 2: יצירת הקובץ הראשי (app.py)**

עכשיו אתה בתוך התיקייה הריקה.

- לחץ על הקישור הכחול קטן: **creating a new file**.
- בתיבת השם למעלה (Name your file...) כתוב: app.py
- בתיבה הגדולה למטה (Edit new file) – **תדביק את קוד ה-Python הארוך** שנתתי לך בתגובה הקודמת (הגרסה עם ה-Assistants).
- לחץ על הכפתור הירוק בצד ימין למעלה: **Commit changes...** ואז שוב **Commit changes**.

#### **שלב 3: יצירת קובץ התקנות (חובה!)**

כדי שהשרת ידע שהוא צריך להתקין את כלי הבינה המלאכותית, צריך עוד קובץ קטן.

- באותו מסך, לחץ שוב על כפתור ה-+ או על **Add file** > **Create new file**.
- בשם הקובץ כתוב: requirements.txt
- בתוכן הקובץ כתוב רק שתי מילים (כל אחת בשורה נפרדת):
- Plaintext

streamlit

openai

- לחץ שוב על **Commit changes** (פעמיים) לשמירה.

**זהו! סיימת עם GitHub.**

יש לך עכשיו "מחסן" עם שני קבצים: אחד עם הקוד, ואחד עם רשימת הציוד.

השלב הבא הוא להיכנס ל-**Streamlit** וללחוץ על הכפתור שמחבר ביניהם.

**תגיד לי כשסיימת את שלב 3, ואדריך אותך בצעד האחרון (חיבור ל-Streamlit והכנסת הסיסמאות).**

__________________________

אתה ממש על קו הסיום! עשית את החלק ה"קשה" (הכנת הקבצים ב-GitHub).

כרגע יש לך את "המחסן" (GitHub) מוכן. נשאר לנו רק צעד אחד אחרון: **להפעיל את האתר ב-Streamlit ולחבר לו את הסיסמאות.**

הנה הצעד האחרון בהחלט – "חיבור לתקע":

### **שלב 4: הפעלת האתר ב-Streamlit Cloud**

- היכנס לאתר:[ share.streamlit.io](https://share.streamlit.io/).
- לחץ על הכפתור הכחול: **Sign in with GitHub** (זה יחבר אוטומטית את החשבון שיצרת).
- במסך הראשי, לחץ על הכפתור הכחול הגדול: **New app** (בפינה הימנית למעלה).
עכשיו תראה טופס:
- **Repository:** לחץ על הרשימה ותבחר את השם של המחסן שיצרת (למשל mechina-bot).
- **Main file path:** תוודא שכתוב שם app.py.

- **עצור! אל תלחץ עדיין על Deploy.**

### **שלב 5: הכנסת המפתחות (החלק הכי חשוב)**

לפני שמפעילים, חייבים לתת לבוט את המפתחות ל-OpenAI (כי לא שמנו אותם בקוד עצמו מטעמי אבטחה).

- באותו מסך של ה-New App, חפש למטה כפתור שנקרא **Advanced settings** (הגדרות מתקדמות).
- ייפתח חלון קטן. תבחר בצד שמאל את **Secrets**.
- בתיבה השחורה הגדולה שתופיע, תעתיק ותדביק את הטקסט הבא (ותשלים את הפרטים שלך):

Ini, TOML

OPENAI_API_KEY = "sk-proj-....."

ASSISTANT_ID = "asst_....."

_(במקום הנקודות – תדביק את המפתח הארוך של OpenAI ואת ה-ID של ה-Assistant שיצרת קודם)._

- לחץ על **Save**.
- עכשיו לחץ על הכפתור הגדול למטה: **Deploy!**

### **מה קורה עכשיו?**

תראה אנימציה של "אפיית עוגה" או "התקנת בלונים". המערכת לוקחת את הקוד שלך מ-GitHub, מתקינה את מה שרשום ב-requirements, ומפעילה את האתר.

תוך דקה-שתיים, האתר ייפתח ותראה את הצ'אט שכתבנו! 🚀

### **איך שמים את זה בגוגל סייטס?**

- אחרי שהאתר נפתח, **תעתיק את הכתובת (URL)** למעלה בדפדפן (זה יהיה משהו כמו mechina-bot.streamlit.app).
- לך לאתר שלך ב-Google Sites.
- לחץ על **הטמעה (Embed)** > **לפי כתובת אתר**.
- הדבק את הלינק.

**זהו, זה באוויר!**

תעדכן אותי אם ה-Deploy עבר בהצלחה או אם קפצה איזו הודעת שגיאה אדומה (זה קורה לפעמים בגלל פסיק חסר בסיסמה, ונפתור את זה בשנייה).