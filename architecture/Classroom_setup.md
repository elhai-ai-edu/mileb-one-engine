# הוראות הקמה — כיתה חכמה MilEd.One
## 4 שלבים, ~30 דקות

---

## שלב 1 — Firebase (10 דקות)

1. עבור ל-https://console.firebase.google.com
2. **Add project** → שם: `miled-one-classroom`
3. בתפריט שמאל: **Realtime Database** → Create database → Start in test mode
4. העתק את ה-URL (נראה כך: `https://miled-one-classroom-default-rtdb.europe-west1.firebasedatabase.app`)
5. **Project Settings** → Service accounts → **Generate new private key** → הורד JSON

---

## שלב 2 — Netlify Environment Variables (5 דקות)

ב-Netlify Dashboard → Site settings → Environment variables → הוסף:

```
FIREBASE_DB_URL        = https://miled-one-classroom-default-rtdb.europe-west1.firebasedatabase.app
FIREBASE_SERVICE_ACCOUNT = [תוכן קובץ ה-JSON שהורדת — הכל בשורה אחת]
```

**חשוב:** את ה-JSON של ה-service account — העתק את כל התוכן כמחרוזת אחת.

---

## שלב 3 — העלאה לגיטהב (5 דקות)

העלה 3 קבצים לגיטהב:

```
netlify/functions/classroom.js   ← הקובץ החדש
classroom-teacher.html           ← ממשק המרצה
classroom-inject.js              ← סקריפט לשילוב ב-chat.html
```

---

## שלב 4 — שילוב ב-chat.html (5 דקות)

פתח את `chat.html` הקיים והוסף **שתי שורות בלבד** לפני `</body>`:

```html
<!-- Classroom sync — add only if sessionId in URL -->
<script src="/classroom-inject.js"></script>
```

זהו. הסקריפט לא עושה כלום אם אין `sessionId` ב-URL — כך שלא שובר שום דבר.

---

## שלב 5 — הוסף לינק לממשק המרצה ב-lecturer_hub.html

מצא את אזור הקישורים ב-`lecturer_hub.html` והוסף:

```html
<a class="btn" href="/lecturer_cockpit.html">🏫 כיתה חכמה</a>
```

---

## שלב 6 — package.json (אם צריך)

אם ה-Firebase Admin SDK לא מותקן, הוסף ל-`package.json`:

```json
{
  "dependencies": {
    "firebase-admin": "^12.0.0"
  }
}
```

Netlify יתקין אוטומטית בפריסה.

---

## איך זה עובד בכיתה

### המרצה:
1. נכנס ל-`/classroom-teacher.html`
2. בוחר קורס/בוט
3. לוחץ **▶ פתח שיעור** → מקבל לינק לתלמידים
4. שולח את הלינק לתלמידים (WhatsApp / מייל)
5. מדביק טקסט/שאלה → לוחץ **📡 שדר לכולם**
6. רואה תשובות בזמן אמת ← מאשר/נועל שלבים

### התלמיד:
1. פותח את הלינק שהמרצה שלח
2. רואה באנר כחול עם הטקסט שהמרצה הכניס
3. עובד עם הבוט כרגיל
4. לוחץ **📤 שלח למרצה** כשמוכן
5. אם שלב נעול → רואה הודעה אדומה ומחכה לאישור

---

## מה לא משתנה

- `chat.js` — לא נגעת בו
- `config.json` — לא נגעת בו  
- OpenRouter / Gemini — ממשיך לעבוד בדיוק אותו דבר
- כל הבוטים הקיימים — עובדים כרגיל

---

## עלות Firebase

לכיתה של 30 תלמידים, שיעור של שעה:
- ~2,000 reads, ~500 writes
- Free tier: 100,000 reads/יום, 100MB storage
- **עלות: $0**
