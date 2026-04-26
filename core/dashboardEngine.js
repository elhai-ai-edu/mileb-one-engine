// core/dashboardEngine.js
// MilEd Speech Training System — Live Dashboard Engine v1.0
// Converts speech metrics into instructor-facing signals and one recommended action.

(function attachDashboardEngine(root) {
  function clamp01(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(1, n));
  }

  function asArray(students) {
    if (!students) return [];
    if (Array.isArray(students)) return students;
    return Object.entries(students).map(([studentId, data]) => ({ studentId, ...(data || {}) }));
  }

  function getSpeech(student = {}) {
    return student.speech || student.metrics || student.speechMetrics || {};
  }

  function getMetric(student, key, fallback = 0) {
    const speech = getSpeech(student);
    const value = speech[key] ?? speech?.fluency?.[key] ?? speech?.confidence?.[key] ?? fallback;
    return Number.isFinite(Number(value)) ? Number(value) : fallback;
  }

  function getFluency(student) {
    const speech = getSpeech(student);
    if (Number.isFinite(Number(speech.fluency))) return clamp01(speech.fluency);
    if (Number.isFinite(Number(speech?.fluency?.score))) return clamp01(speech.fluency.score);
    return 0;
  }

  function getConfidence(student) {
    const speech = getSpeech(student);
    if (Number.isFinite(Number(speech.confidence))) return clamp01(speech.confidence);
    if (Number.isFinite(Number(speech?.confidence?.score))) return clamp01(speech.confidence.score);
    return 0;
  }

  function getLatency(student) {
    const speech = getSpeech(student);
    if (Number.isFinite(Number(speech.latency))) return Number(speech.latency);
    if (Number.isFinite(Number(speech?.timing?.timeToStartSpeaking))) return Number(speech.timing.timeToStartSpeaking);
    return 0;
  }

  function getDuration(student) {
    const speech = getSpeech(student);
    if (Number.isFinite(Number(speech.duration))) return Number(speech.duration);
    if (Number.isFinite(Number(speech?.timing?.speechDuration))) return Number(speech.timing.speechDuration);
    return 0;
  }

  function classifyStudent(student = {}) {
    const duration = getDuration(student);
    const latency = getLatency(student);
    const fluency = getFluency(student);
    const confidence = getConfidence(student);

    if (!student || Object.keys(student).length === 0) return "unknown";
    if (duration <= 0) return "silent";
    if (latency > 6) return "hesitating";
    if (fluency > 0.72 && confidence > 0.68) return "strong";
    if (fluency < 0.4) return "low_fluency";
    return "active";
  }

  function labelLevel(value, type = "score") {
    const n = type === "latency" ? Number(value) : clamp01(value);
    if (type === "latency") {
      if (n <= 3) return "מהיר";
      if (n <= 6) return "בינוני";
      return "איטי";
    }
    if (n < 0.4) return "נמוך";
    if (n < 0.7) return "בינוני";
    return "גבוה";
  }

  function summarizeClass(studentsInput) {
    const students = asArray(studentsInput);
    const total = students.length;
    if (!total) {
      return {
        total: 0,
        activeStudents: 0,
        silentStudents: 0,
        hesitatingStudents: 0,
        strongStudents: 0,
        avgFluency: 0,
        avgConfidence: 0,
        avgLatency: 0,
        speakingPercent: 0,
        classState: "no_data"
      };
    }

    const statuses = students.map(classifyStudent);
    const activeStudents = statuses.filter(s => !["silent", "unknown"].includes(s)).length;
    const silentStudents = statuses.filter(s => s === "silent").length;
    const hesitatingStudents = statuses.filter(s => s === "hesitating").length;
    const strongStudents = statuses.filter(s => s === "strong").length;

    const avg = (fn) => students.reduce((sum, s) => sum + fn(s), 0) / total;
    const avgFluency = clamp01(avg(getFluency));
    const avgConfidence = clamp01(avg(getConfidence));
    const avgLatency = avg(getLatency);
    const speakingPercent = Math.round((activeStudents / total) * 100);

    let classState = "stable";
    if (silentStudents / total >= 0.25) classState = "low_activation";
    else if (avgLatency > 6 || hesitatingStudents / total >= 0.3) classState = "hesitating";
    else if (avgFluency < 0.45) classState = "low_fluency";
    else if (strongStudents / total >= 0.35 && avgFluency > 0.65) classState = "ready_for_challenge";
    else if (strongStudents > 0 && silentStudents > 0) classState = "uneven";

    return {
      total,
      activeStudents,
      silentStudents,
      hesitatingStudents,
      strongStudents,
      avgFluency,
      avgConfidence,
      avgLatency: Number(avgLatency.toFixed(1)),
      speakingPercent,
      classState
    };
  }

  function buildStudentCards(studentsInput) {
    return asArray(studentsInput).map(student => {
      const status = classifyStudent(student);
      const fluency = getFluency(student);
      const confidence = getConfidence(student);
      const latency = getLatency(student);
      return {
        studentId: student.studentId || student.id || null,
        name: student.name || student.studentName || "סטודנט/ית",
        status,
        labels: {
          fluency: labelLevel(fluency),
          confidence: labelLevel(confidence),
          latency: labelLevel(latency, "latency")
        },
        raw: { fluency, confidence, latency, duration: getDuration(student) }
      };
    });
  }

  function generatePrimaryInsight(summary = {}) {
    if (!summary.total) {
      return {
        type: "no_data",
        title: "אין עדיין נתוני דיבור",
        reason: "הסטודנטים עדיין לא שלחו קלט דיבור.",
        suggestedAction: "התחל סבב קצר: כל אחד אומר משפט בעיה אחד.",
        cockpitAction: "quick_start_round"
      };
    }

    if (summary.classState === "low_activation") {
      return {
        type: "activate_silent_students",
        title: "חלק גדול מהכיתה שקט",
        reason: `${summary.silentStudents} מתוך ${summary.total} עדיין לא דיברו.`,
        suggestedAction: "כולם — משפט אחד: מה הבעיה שבחרתם?",
        cockpitAction: "quick_start_round"
      };
    }

    if (summary.classState === "hesitating") {
      return {
        type: "quick_start_practice",
        title: "יש היסוס לפני דיבור",
        reason: `זמן התגובה הממוצע הוא ${summary.avgLatency} שניות.`,
        suggestedAction: "תרגל משפט פתיחה: הבעיה שבחרתי היא...",
        cockpitAction: "quick_start_practice"
      };
    }

    if (summary.classState === "low_fluency") {
      return {
        type: "structure_practice",
        title: "הדיבור מקוטע יחסית",
        reason: "מדד השטף הכיתתי נמוך.",
        suggestedAction: "הפעל מסגרת קצרה: בעיה → פתרון → למי זה עוזר.",
        cockpitAction: "structure_practice"
      };
    }

    if (summary.classState === "ready_for_challenge") {
      return {
        type: "increase_challenge",
        title: "הכיתה מוכנה לאתגר",
        reason: "חלק משמעותי מהסטודנטים מדברים בשטף ובביטחון.",
        suggestedAction: "הוסף שאלת לקוח ביקורתית: למה שאבחר בפתרון שלך?",
        cockpitAction: "increase_challenge"
      };
    }

    if (summary.classState === "uneven") {
      return {
        type: "split_support",
        title: "הכיתה לא אחידה",
        reason: "יש גם חזקים וגם שקטים באותו זמן.",
        suggestedAction: "תן לחזקים לשאול שאלות לקוח, ולשקטים לענות במשפט אחד בלבד.",
        cockpitAction: "split_support"
      };
    }

    return {
      type: "stable",
      title: "הכיתה במצב יציב",
      reason: `${summary.speakingPercent}% מהסטודנטים פעילים בדיבור.`,
      suggestedAction: "המשך לסבב שאלות קהל קצר.",
      cockpitAction: "continue"
    };
  }

  function buildDashboardModel(studentsInput, options = {}) {
    const summary = summarizeClass(studentsInput);
    const cards = buildStudentCards(studentsInput);
    const primaryInsight = generatePrimaryInsight(summary);
    return {
      ok: true,
      generatedAt: Date.now(),
      summary,
      cards,
      alerts: primaryInsight.type === "stable" ? [] : [primaryInsight].slice(0, options.maxAlerts || 1),
      primaryAction: primaryInsight
    };
  }

  const api = {
    classifyStudent,
    summarizeClass,
    buildStudentCards,
    generatePrimaryInsight,
    buildDashboardModel,
    labelLevel
  };

  root.MiledDashboardEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
