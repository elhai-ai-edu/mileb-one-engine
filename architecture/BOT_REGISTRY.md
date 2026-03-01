# MilEd.One – Bot Registry
Version: 1.0  
Last Updated: 2026-03-02  

---

## מטרת המסמך

Bot Registry הוא שכבת תיעוד פנימית המשמשת כ־Single Source of Truth לרשימת כל הבוטים הפעילים במערכת.

הוא מאפשר:

- מניעת כפילויות botType
- בדיקת התאמה בין function ↔ phase
- בקרה על scope והרשאות
- תשתית לניתוח מוסדי עתידי
- שקיפות ארכיטקטונית

---

# סיכום כמותי

| שכבה | מספר בוטים |
|-------|------------|
| אוניברסליים | 4 |
| קורסים | 7 |
| סגל | 4 |
| מוסדי | 6 |
| **סה"כ** | **21** |

---

# 🛠 שכבה אוניברסלית (Universal Tools)

| key | botType | function | phase | scope |
|------|----------|----------|--------|--------|
| support | universal_support | learning | development | global |
| presentation | universal_presentation | learning | development | global |
| academic_writing | universal_writing | learning | development | global |
| research_skills | universal_research | learning | development | global |

---

# 🎓 בוטי קורסים (Course Layer)

| key | botType | function | phase | scope |
|------|----------|----------|--------|--------|
| course_academic_writing | course_academic_writing | learning | development | global |
| course_qualitative_research | course_qualitative_research | learning | development | global |
| course_gerontology | course_gerontology | learning | development | global |
| course_interpersonal_communication | course_interpersonal_communication | learning | development | global |
| hebrew_optometry | socratic_student | learning | development | global |
| hebrew_optometry_final | task_final_project | learning | development | course_specific |
| course_intro_social_science_mechina | course_intro_social_science_mechina | learning | development | global |

---

# 👩‍🏫 בוטי סגל (Faculty Layer)

| key | botType | function | phase | scope |
|------|----------|----------|--------|--------|
| faculty_support_extended | faculty_support_extended | teaching | development | institution |
| faculty_assessment_model_builder | faculty_assessment_model_builder | teaching | design | institution |
| pedagogical_transformation | faculty_lesson_builder | teaching | design | global |
| faculty_bot_builder | faculty_bot_builder | teaching | design | global |

---

# 🏛 בוטים מוסדיים (Institutional Layer)

| key | botType | function | phase | scope |
|------|----------|----------|--------|--------|
| learning_skills_full | skills_learning_full | learning | diagnostic | global |
| employability_skills_full | skills_employability_full | learning | diagnostic | global |
| institutional_skill_dashboard | institutional_skill_dashboard | institutional | analytics | institution |
| institutional_faculty_usage_analytics | institutional_faculty_usage_analytics | institutional | analytics | institution |
| institutional_student_progress_tracker | institutional_student_progress_tracker | institutional | analytics | institution |
| analytics | admin_analytics | institutional | analytics | institution |

---

# תקינות ארכיטקטונית

- כל botType ייחודי
- כל בוט כולל function + phase
- כל phase ממופה ל-engine.kernel.binding.contextEnforcement
- אין תלות ב-functionPolicies (deprecated)
- scope תואם ל-toolGovernance.scopes

---

# עקרונות ניהול עתידיים

1. אין להוסיף botType חדש ללא בדיקה ברג׳יסטרי
2. כל שינוי phase מחייב בדיקת binding
3. אין לשנות function ללא בדיקת enforcement
4. לפני הרחבת שכבה – לעדכן את המסמך

---

# הערת ארכיטקטורה

Bot Registry אינו חלק מ-runtime.  
זהו מסמך Governance פנימי בלבד.

בעתיד ניתן להמירו ל־JSON לצורך בדיקות אוטומטיות.
