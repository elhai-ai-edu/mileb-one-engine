(() => {
  const MAX_STAGES = 7;
  const DEFAULT_STAGES = [
    {
      title: "בחירת בעיה",
      instructions: "תאר/י את הבעיה המקצועית שבחרת: מה הבעיה, מה חשיבותה ומי מושפע ממנה.",
      subtitle: "הגדרת הבעיה המקצועית שתחקור/י",
      taskPrompt: "תאר/י את הבעיה שבחרת: מה הבעיה? מה חשיבותה? מי מושפע ממנה?",
      botHint: "בחירת הבעיה — שלב 1"
    },
    {
      title: "ניסיונות קדומים",
      instructions: "תאר/י ניסיונות קודמים לפתרון הבעיה ומה מנע מהם להצליח.",
      subtitle: "ניסיונות קודמים וסיבות לאי הצלחה",
      taskPrompt: "תאר/י מה נוסה בעבר, מה עבד חלקית, ומה מנע הצלחה מלאה.",
      botHint: "ניסיונות קדומים — שלב 2"
    },
    {
      title: "מקורות מידע",
      instructions: "אסוף/י 3-5 מקורות מידע רלוונטיים וסכם/י מה למדת מכל מקור.",
      subtitle: "איסוף וסיכום מקורות רלוונטיים",
      taskPrompt: "מצא/י 3-5 מקורות רלוונטיים ולכל מקור כתוב/י מה למדת ממנו.",
      botHint: "מקורות מידע — שלב 3"
    },
    {
      title: "שתי אלטרנטיבות",
      instructions: "הצג/י שתי גישות שונות לפתרון הבעיה עם יתרונות וחסרונות לכל אחת.",
      subtitle: "הצגת שתי גישות שונות לפתרון הבעיה",
      taskPrompt: "הצג/י שתי גישות שונות לפתרון הבעיה. לכל גישה פרט/י יתרונות וחסרונות.",
      botHint: "שתי אלטרנטיבות — שלב 4"
    },
    {
      title: "בחירת פתרון",
      instructions: "בחר/י פתרון מנומק והסבר/י את ההיגיון שמאחורי הבחירה.",
      subtitle: "בחירה מנומקת של הפתרון הטוב ביותר",
      taskPrompt: "איזה פתרון בחרת ומדוע? הסבר/י את ההיגיון מאחורי הבחירה.",
      botHint: "בחירת פתרון — שלב 5"
    },
    {
      title: "כתיבת מסמך",
      instructions: "כתוב/י מסמך מסכם: הבעיה, ניסיונות קודמים, חלופות, פתרון נבחר ונימוק.",
      subtitle: "כתיבת מסמך מסכם",
      taskPrompt: "כתוב/י סיכום פרויקט מלא: הבעיה, הניסיונות, החלופות והפתרון שבחרת.",
      botHint: "כתיבת מסמך — שלב 6"
    },
    {
      title: "הצגה",
      instructions: "כתוב/י תקציר קצר להצגת הפרויקט בכיתה: בעיה, ניסיונות, פתרון ומה למדת.",
      subtitle: "הכנת תקציר להצגה בכיתה",
      taskPrompt: "כתוב/י תקציר קצר להצגת הפרויקט בכיתה: בעיה, ניסיונות, פתרון ומה למדת.",
      botHint: "הצגה — שלב 7"
    }
  ];

  function asText(value) {
    return String(value || "").trim();
  }

  function normalizeSingleStage(rawStage, index = 0, fallbackStage = null) {
    if (!rawStage || typeof rawStage !== "object" || Array.isArray(rawStage)) return null;
    const fallbackTitle = `שלב ${index + 1}`;
    const base = fallbackStage && typeof fallbackStage === "object" ? fallbackStage : {};
    const title = asText(rawStage.title) || asText(base.title) || fallbackTitle;
    const instructions = asText(rawStage.instructions) || asText(base.instructions);
    const subtitle = asText(rawStage.subtitle) || asText(base.subtitle) || title;
    const taskPrompt = asText(rawStage.taskPrompt) || instructions || asText(base.taskPrompt);
    const botHint = asText(rawStage.botHint) || asText(base.botHint) || title;

    if (!asText(rawStage.title) && !asText(rawStage.instructions) && !asText(rawStage.subtitle) && !asText(rawStage.taskPrompt) && !asText(rawStage.botHint)) {
      return null;
    }
    return { title, instructions, subtitle, taskPrompt, botHint };
  }

  function getDefaultStages() {
    return DEFAULT_STAGES.map(stage => ({ ...stage }));
  }

  function normalizeStages(rawStages, { maxStages = MAX_STAGES, fallbackToDefaults = true } = {}) {
    const source = Array.isArray(rawStages) ? rawStages.slice(0, maxStages) : [];
    const defaults = getDefaultStages();
    const normalized = source
      .map((stage, idx) => normalizeSingleStage(stage, idx, defaults[idx] || null))
      .filter(Boolean);
    if (normalized.length) return normalized;
    return fallbackToDefaults ? defaults.slice(0, maxStages) : [];
  }

  window.MiledPersonalProjectStageSchema = {
    MAX_STAGES,
    getDefaultStages,
    normalizeSingleStage,
    normalizeStages
  };
})();
