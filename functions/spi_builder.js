// spi_builder.js — MilEd.One (starter)
// Purpose: build SPI object + final System Prompt text (template-based, no LLM required)

const DEFAULTS = {
  language: "he",
  tone: "warm_socratic",
  channel: "teaching", // teaching | learning | admin
  courseName: "",
  institutionName: "MilEd.One",
};

function normStr(x) {
  return (typeof x === "string" ? x.trim() : "");
}

function pick(obj, keys, fallback = "") {
  for (const k of keys) {
    const v = obj?.[k];
    const s = normStr(v);
    if (s) return s;
  }
  return fallback;
}

function normalizeLanguage(langRaw) {
  const lang = normStr(langRaw).toLowerCase();
  if (["he", "עברית", "hebrew"].includes(lang)) return "he";
  if (["ar", "ערבית", "arabic"].includes(lang)) return "ar";
  if (["en", "english", "אנגלית"].includes(lang)) return "en";
  return DEFAULTS.language;
}

function normalizeChannel(channelRaw) {
  const ch = normStr(channelRaw).toLowerCase();
  if (["admin", "management", "הנהלה", "ניהול"].includes(ch)) return "admin";
  if (["learning", "student", "לומד", "סטודנט", "למידה"].includes(ch)) return "learning";
  if (["teaching", "faculty", "מרצה", "הוראה"].includes(ch)) return "teaching";
  return DEFAULTS.channel;
}

function normalizeTone(toneRaw) {
  const t = normStr(toneRaw).toLowerCase();
  if (["warm", "חם", "מכיל"].includes(t)) return "warm";
  if (["direct", "חד", "אסרטיבי"].includes(t)) return "direct";
  if (["socratic", "סוקרטי"].includes(t)) return "socratic";
  if (["warm_socratic", "חם סוקרטי", "warm-socratic"].includes(t)) return "warm_socratic";
  return DEFAULTS.tone;
}

function buildLanguageInstruction(lang) {
  if (lang === "ar") return "ענה בערבית (Arabic). אם חייבים מונחים באנגלית – בסוגריים.";
  if (lang === "en") return "Answer in English. If you must use Hebrew terms – put them in parentheses.";
  return "ענה בעברית. אם צריך מונחים באנגלית – בסוגריים.";
}

function buildRoleByChannel(channel) {
  if (channel === "admin") {
    return "אתה עוזר ניהולי־אנליטי למוסד אקדמי. אתה מסייע בקבלת החלטות, ניסוח מדיניות, תיעדוף, מדידה ותובנות.";
  }
  if (channel === "learning") {
    return "אתה עוזר למידה אישי ללומד. המטרה היא לקדם הבנה, תהליך חשיבה, ויסות מאמץ ועצמאות.";
  }
  // teaching
  return "אתה עוזר הוראה למרצה. המטרה היא לתכנן הוראה, לבנות מערכי שיעור, משימות, הערכה ורצפים פדגוגיים.";
}

function buildToneInstruction(tone) {
  switch (tone) {
    case "direct":
      return "סגנון: חד, בהיר, תמציתי. שאל שאלות רק כשחסר מידע, אחרת תן הצעה מעשית.";
    case "socratic":
      return "סגנון: סוקרטי. קדם את המשתמש עם שאלות, פירוק והכוונה במקום פתרון מיידי.";
    case "warm":
      return "סגנון: חם, מכיל ומעודד. תן תחושת התקדמות וביטחון.";
    default:
      return "סגנון: חם וסוקרטי. תן הכוונה ושאלות, עם ניסוח אנושי ומעודד.";
  }
}

/**
 * Core: Build SPI + Prompt
 * @param {object} args
 * @param {object} args.answers - questionnaire answers (raw)
 * @param {object} args.engine - config.engine (for kernel flags)
 * @param {object} args.policy - functionPolicies resolved for selected function
 * @param {string} args.kernelText - kernel.txt content (optional; if you want to include it here)
 * @returns {{ spi: object, systemPrompt: string, meta: object }}
 */
export function buildSPI({ answers = {}, engine = {}, policy = {}, kernelText = "" } = {}) {
  // ---- Normalize key fields from answers ----
  const facultyName = pick(answers, ["facultyName", "name", "fullName", "מרצה"], "");
  const facultyId   = pick(answers, ["facultyId", "email", "mail"], "");
  const courseName  = pick(answers, ["courseName", "course", "קורס"], DEFAULTS.courseName);

  const channel = normalizeChannel(pick(answers, ["channel", "audienceChannel", "mode"], DEFAULTS.channel));
  const language = normalizeLanguage(pick(answers, ["language", "lang"], DEFAULTS.language));
  const tone = normalizeTone(pick(answers, ["tone", "styleTone"], DEFAULTS.tone));

  // "function" determines policy (learning/teaching/admin) – you can map it however you like
  const fn = pick(answers, ["function", "botFunction"], channel);

  // ---- Kernel flags (base + channel policies) ----
  const publicKernel  = engine?.kernel?.public  || {};
  const privateKernel = engine?.kernel?.private || {};

  // mergedKernel: private first, public overrides (as you already chose)
  const mergedKernel = { ...privateKernel, ...publicKernel };

  // Effective policy: policy overrides kernel only where needed
  // (Example: teaching allows full lesson plans, learning blocks full solutions)
  const effective = {
    allowFullSolution: policy?.allowFullSolution ?? true,
    requireCriteriaForEvaluation: policy?.requireCriteriaForEvaluation ?? mergedKernel.evaluationRequiresExplicitCriteria ?? false,
    noFullSolutionForStudent: mergedKernel.noFullSolutionForStudent ?? false,
  };

  // enforce noFullSolution if policy says not allowed
  const effectiveNoFullSolution =
    (effective.allowFullSolution === false) || (effective.noFullSolutionForStudent === true);

  // ---- SPI object ----
  const spi = {
    version: "0.1",
    channel,          // teaching | learning | admin
    function: fn,     // matches your config.functionPolicies keys
    language,
    tone,
    identity: {
      facultyName,
      facultyId,
      courseName,
    },
    governance: {
      // minimal flags you can later expand
      allowFullSolution: effective.allowFullSolution,
      noFullSolution: effectiveNoFullSolution,
      requireCriteriaForEvaluation: effective.requireCriteriaForEvaluation,
    },
    timestamps: {
      createdAt: new Date().toISOString(),
    },
    rawAnswers: answers, // keep for audit (optional)
  };

  // ---- Build Prompt blocks (template) ----
  const langLine = buildLanguageInstruction(language);
  const roleLine = buildRoleByChannel(channel);
  const toneLine = buildToneInstruction(tone);

  const contextLine =
    courseName
      ? `הקשר: הקורס "${courseName}".`
      : "הקשר: עבודה כללית במסגרת אקדמית.";

  // Governance lines (minimal + clear)
  const govLines = [];
  if (effectiveNoFullSolution && channel === "learning") {
    govLines.push("כלל ליבה: אל תפתור משימות במלואן עבור לומד. תן הכוונה, שאלות, פירוק ושלבי חשיבה.");
  }
  if (effective.requireCriteriaForEvaluation) {
    govLines.push("כלל ליבה: אין לבצע הערכה/שיפוט ללא קריטריונים מפורשים. אם אין קריטריונים — בקש אותם או הצע סט קריטריונים אפשרי.");
  }
  if (mergedKernel.noSkipStructuralSteps) {
    govLines.push("כלל ליבה: אל תדלג על שלבים מבניים; בנה תהליך מדורג.");
  }
  if (mergedKernel.preserveAgency) {
    govLines.push("כלל ליבה: שמור על סוכנות המשתמש. העדף העצמה על פני החלפה.");
  }

  const header = [
    "=== MilEd.One — System Prompt ===",
    facultyName ? `מרצה/משתמש: ${facultyName}` : null,
    facultyId ? `זיהוי: ${facultyId}` : null,
    contextLine,
  ].filter(Boolean).join("\n");

  const core = [
    roleLine,
    langLine,
    toneLine,
    govLines.length ? ("\n" + govLines.map(x => `- ${x}`).join("\n")) : null,
  ].filter(Boolean).join("\n\n");

  // Optional: include kernel.txt at the top (constitution layer)
  // If you prefer to keep kernel injection in chat.js only, leave kernelText empty.
  const systemPrompt = [kernelText?.trim(), header, core].filter(Boolean).join("\n\n");

  return {
    spi,
    systemPrompt,
    meta: {
      effectiveNoFullSolution,
      channel,
      function: fn,
      language,
      tone,
    },
  };
}
