// core/roleplayEngine.js
// MilEd Speech Training System — Role-Play Engine v1.0
// Defensive, dependency-light runtime module.

(function attachRoleplayEngine(root) {
  const DEFAULT_SCENARIOS = {
    INTERVIEW_ENTRY_SUPPORTIVE_01: {
      id: "INTERVIEW_ENTRY_SUPPORTIVE_01",
      type: "job_interview",
      difficulty: 1,
      botRole: "מראיין תומך",
      studentRole: "מועמד/ת",
      scenario: {
        context: "ראיון ראשון למשרה התחלתית",
        tone: "supportive",
        openingLine: "שלום, תודה שהגעת. נתחיל בשאלה פשוטה: ספר/י לי בקצרה על עצמך."
      },
      behavior: { style: "supportive", followUp: true, interruptions: false, challengeLevel: 1 },
      completionCriteria: { minTurns: 3, requireSpeech: true, minSpeechSeconds: 10 }
    },
    PRESENTATION_CLIENT_AUDIENCE_01: {
      id: "PRESENTATION_CLIENT_AUDIENCE_01",
      type: "presentation_client_audience",
      difficulty: 2,
      botRole: "לקוח שמחפש פתרון",
      studentRole: "מציג/ת פתרון",
      scenario: {
        context: "הסטודנט מציג בעיה ופתרון בפני כיתה שמשחקת לקוחות פוטנציאליים",
        tone: "curious_client",
        openingLine: "אני לקוח שמחפש פתרון. קודם כול, מה הבעיה שאתה/את מנסה לפתור?"
      },
      behavior: { style: "professional", followUp: true, interruptions: false, challengeLevel: 2 },
      completionCriteria: { minTurns: 4, requireSpeech: true, minSpeechSeconds: 20 }
    },
    PRESENTATION_CLIENT_CHALLENGE_01: {
      id: "PRESENTATION_CLIENT_CHALLENGE_01",
      type: "presentation_client_audience",
      difficulty: 3,
      botRole: "לקוח ביקורתי",
      studentRole: "מציג/ת פתרון",
      scenario: {
        context: "הסטודנט צריך לשכנע לקוח ביקורתי שהפתרון שלו מתאים וכדאי",
        tone: "critical_client",
        openingLine: "אני לא בטוח שהפתרון שלך באמת נחוץ. תשכנע/י אותי למה זו בעיה אמיתית."
      },
      behavior: { style: "challenging", followUp: true, interruptions: false, challengeLevel: 3 },
      completionCriteria: { minTurns: 5, requireSpeech: true, minSpeechSeconds: 20 }
    }
  };

  function loadScenario(scenarioId, scenarioMap) {
    const scenarios = scenarioMap || root.MiledRoleplayScenarios || DEFAULT_SCENARIOS;
    return scenarios[scenarioId] || DEFAULT_SCENARIOS[scenarioId] || DEFAULT_SCENARIOS.PRESENTATION_CLIENT_AUDIENCE_01;
  }

  function normalizeDifficulty(value, fallback = 2) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(1, Math.min(3, Math.round(n)));
  }

  function createRolePlayState(config = {}) {
    const scenarioId = config.scenarioId || "PRESENTATION_CLIENT_AUDIENCE_01";
    const scenario = loadScenario(scenarioId, config.scenarioMap);
    return {
      active: true,
      scenarioId,
      difficultyLevel: normalizeDifficulty(config.difficulty || scenario.difficulty || 2),
      mode: config.behavior?.style || scenario.behavior?.style || "professional",
      turnCount: Number(config.turnCount || 0),
      speechRequired: config.speechPolicy?.requireSpeech ?? config.speech?.required ?? scenario.completionCriteria?.requireSpeech ?? true,
      minSpeechSeconds: Number(config.speechPolicy?.minSpeechSeconds || config.speech?.minDuration || scenario.completionCriteria?.minSpeechSeconds || 10),
      adaptiveMode: config.adaptiveMode ?? config.adaptation?.enabled ?? true,
      lastDecision: null
    };
  }

  function generateNextTurn(state = {}, scenario = {}, performance = {}) {
    const difficulty = normalizeDifficulty(state.difficultyLevel || scenario.difficulty || 2);
    const type = scenario.type || "presentation_client_audience";

    if (type === "presentation_client_audience") {
      if (difficulty === 1) return "תוכל/י להסביר שוב מה הבעיה, במשפט אחד ברור?";
      if (difficulty === 2) return "למי בדיוק הפתרון שלך מיועד, ולמה דווקא הקבוצה הזו צריכה אותו?";
      return "אני לקוח סקפטי: למה שאבחר בפתרון שלך ולא בפתרון קיים?";
    }

    if (difficulty === 1) return "ספר/י לי בקצרה על עצמך.";
    if (difficulty === 2) return "תן/י דוגמה שמראה למה את/ה מתאים/ה לתפקיד.";
    return "אני לא בטוח שהניסיון שלך מספיק. איך תשכנע/י אותי?";
  }

  function shouldCompleteRoleplay(state = {}, completionCriteria = {}) {
    const minTurns = Number(completionCriteria.minTurns || 3);
    return Number(state.turnCount || 0) >= minTurns;
  }

  function buildRoleplaySystemBlock({ state = {}, scenario = {}, performance = {}, speechMetrics = {} } = {}) {
    if (!state.active) return "";
    const lines = [
      "## Speech Role-Play Runtime Context",
      `Scenario ID: ${state.scenarioId || scenario.id}`,
      `Bot role: ${scenario.botRole || "role-play actor"}`,
      `Student role: ${scenario.studentRole || "learner"}`,
      `Context: ${scenario.scenario?.context || "speech role-play simulation"}`,
      `Difficulty: ${state.difficultyLevel}`,
      `Interaction mode: ${state.mode}`,
      "Rules:",
      "- Stay in role during the simulation.",
      "- Ask one question at a time.",
      "- Do not give teaching feedback during active role-play unless the simulation is paused or completed.",
      "- Treat the learner response as spoken performance when speech metrics are present."
    ];

    if (speechMetrics?.timing) {
      lines.push("Speech metrics:");
      lines.push(`- latency: ${speechMetrics.timing.timeToStartSpeaking}s`);
      lines.push(`- duration: ${speechMetrics.timing.speechDuration}s`);
      lines.push(`- fluency: ${Math.round((speechMetrics.fluency?.score || 0) * 100)}%`);
      lines.push(`- confidence: ${Math.round((speechMetrics.confidence?.score || 0) * 100)}%`);
    }

    return lines.join("\n");
  }

  const api = {
    DEFAULT_SCENARIOS,
    loadScenario,
    normalizeDifficulty,
    createRolePlayState,
    generateNextTurn,
    shouldCompleteRoleplay,
    buildRoleplaySystemBlock
  };

  root.MiledRoleplayEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
