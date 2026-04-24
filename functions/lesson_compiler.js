// lesson_compiler.js — MilEd.One
// Config-driven pedagogical compilation engine v1
//
// Purpose:
// Transform a pedagogical decision into:
// 1. lecturer-facing lesson script
// 2. system-facing flow draft
// 3. compilation report
//
// Architectural rule:
// Templates are pedagogical knowledge. Code is only the interpreter.

const DEFAULT_DURATION_MINUTES = 90;

const COMPILATION_TEMPLATES = {
  evidence_guided_discussion: {
    family: "evidence_guided_discussion",
    label: "דיון מונחה ראיות",
    principles: ["active_learning", "thinking_oriented_learning"],
    stages: [
      {
        key: "trigger",
        stageLabel: "opening",
        title: "פתיחה: טענה מעוררת דיון",
        durationRatio: 0.12,
        lecturerInstruction: "הצג טענה, מקרה קצר או שקף מרכזי שמעורר הסכמה או התנגדות, ובקש תגובה ראשונית.",
        sampleQuestions: [
          "האם אתם מסכימים עם הטענה?",
          "מה חסר לכם כדי להכריע?"
        ],
        expectedOutput: "עמדה ראשונית קצרה",
        expectedOutputs: ["short_position"],
        botMode: "none",
        gate: null
      },
      {
        key: "evidence_work",
        stageLabel: "guided_practice",
        title: "עבודה על ראיות",
        durationRatio: 0.25,
        lecturerInstruction: "בקש מהסטודנטים לעבוד בזוגות או בקבוצות קטנות ולזהות טענה, ראיה והנחה מתוך החומר.",
        sampleQuestions: [
          "מהי הטענה המרכזית?",
          "איזו ראיה תומכת בה?",
          "איזו הנחה עומדת מאחוריה?"
        ],
        expectedOutput: "טענה + ראיה + הנחה",
        expectedOutputs: ["evidence_map"],
        botMode: "task_support",
        gate: { type: "evidence_required", evidence: "evidence_map" }
      },
      {
        key: "guided_discussion",
        stageLabel: "discussion",
        title: "דיון מונחה בכיתה",
        durationRatio: 0.43,
        lecturerInstruction: "אסוף תשובות מהסטודנטים, השווה בין דרכי הנימוק, והדגש את ההבדל בין דעה לבין טענה מבוססת.",
        sampleQuestions: [
          "איזו ראיה חזקה יותר ולמה?",
          "האם אפשר לפרש את אותה ראיה אחרת?",
          "מה יגרום לכם לשנות עמדה?"
        ],
        expectedOutput: "השתתפות בדיון מבוסס נימוקים",
        expectedOutputs: ["reasoned_participation"],
        botMode: "course_support",
        gate: null
      },
      {
        key: "reflection_closure",
        stageLabel: "reflection",
        title: "סיכום רפלקטיבי",
        durationRatio: 0.20,
        lecturerInstruction: "בקש מכל סטודנט לנסח תובנה קצרה או שאלה שנותרה פתוחה בעקבות הדיון.",
        sampleQuestions: [
          "איזה נימוק שכנע אתכם יותר?",
          "מה עדיין נשאר פתוח בעיניכם?"
        ],
        expectedOutput: "משפט רפלקטיבי אישי",
        expectedOutputs: ["reflection_note"],
        botMode: "reflection_support",
        gate: null
      }
    ]
  },

  scaffolded_skill_building: {
    family: "scaffolded_skill_building",
    label: "בניית מיומנות מדורגת",
    principles: ["scaffolded_learning", "formative_learning", "agency_preserving_learning"],
    stages: [
      {
        key: "surface_problem",
        stageLabel: "opening",
        title: "פתיחה: זיהוי הקושי",
        durationRatio: 0.12,
        lecturerInstruction: "הצג דוגמה לביצוע חלקי או שגוי, ובקש מהסטודנטים לזהות מה עדיין חסר.",
        sampleQuestions: ["מה עובד כאן?", "מה עדיין לא מספיק?"],
        expectedOutput: "זיהוי ראשוני של קושי",
        expectedOutputs: ["error_identification"],
        botMode: "none",
        gate: null
      },
      {
        key: "decompose",
        stageLabel: "knowledge_building",
        title: "פירוק המיומנות לרכיבים",
        durationRatio: 0.18,
        lecturerInstruction: "פרק את המיומנות לשלבים קטנים והראה מה צריך לבדוק בכל שלב.",
        sampleQuestions: ["מהו הצעד הראשון?", "איזה רכיב אסור לאבד?"],
        expectedOutput: "מפת רכיבי מיומנות",
        expectedOutputs: ["skill_components_map"],
        botMode: "course_support",
        gate: null
      },
      {
        key: "guided_practice",
        stageLabel: "guided_practice",
        title: "תרגול מודרך בשלבים",
        durationRatio: 0.30,
        lecturerInstruction: "בצעו יחד ניסיון אחד בשלבים. עצור בכל שלב ובדוק הבנה לפני המעבר לשלב הבא.",
        sampleQuestions: ["מה עשינו עכשיו?", "איך נבדוק שזה נכון?"],
        expectedOutput: "ניסיון מודרך בשלבים",
        expectedOutputs: ["guided_attempt"],
        botMode: "task_support",
        gate: { type: "completion_required", evidence: "guided_attempt" }
      },
      {
        key: "independent_practice",
        stageLabel: "independent_practice",
        title: "תרגול עצמאי קצר",
        durationRatio: 0.27,
        lecturerInstruction: "תן משימה קצרה דומה אך חדשה. בקש מהסטודנטים לבצע לבד ולסמן מה שינו או בדקו.",
        sampleQuestions: ["מה עשיתם אחרת?", "איך בדקתם את עצמכם?"],
        expectedOutput: "ניסיון עצמאי קצר",
        expectedOutputs: ["independent_attempt"],
        botMode: "task_support",
        gate: { type: "evidence_required", evidence: "independent_attempt" }
      },
      {
        key: "reflection",
        stageLabel: "reflection",
        title: "סיכום: כלל אישי להמשך",
        durationRatio: 0.13,
        lecturerInstruction: "בקש מכל סטודנט לנסח כלל פעולה אישי שיעזור לו בפעם הבאה.",
        sampleQuestions: ["מה היה קשה?", "מה תבדקו בפעם הבאה?"],
        expectedOutput: "כלל אישי קצר",
        expectedOutputs: ["personal_rule"],
        botMode: "reflection_support",
        gate: null
      }
    ]
  },

  inductive_peer_learning: {
    family: "inductive_peer_learning",
    label: "למידה אינדוקטיבית עם הסבר עמיתים",
    principles: ["constructivist_learning", "collaborative_learning", "agency_preserving_learning", "active_learning"],
    stages: [
      {
        key: "examples_first",
        stageLabel: "opening",
        title: "דוגמאות לפני כלל",
        durationRatio: 0.18,
        lecturerInstruction: "הצג כמה דוגמאות ללא הסבר מקדים של הכלל. בקש מהסטודנטים להתבונן ולחפש דפוסים.",
        sampleQuestions: ["מה משותף לדוגמאות?", "מה משתנה בין הדוגמאות?"],
        expectedOutput: "תצפיות ראשוניות על הדוגמאות",
        expectedOutputs: ["pattern_observations"],
        botMode: "none",
        gate: null
      },
      {
        key: "pattern_detection",
        stageLabel: "guided_practice",
        title: "זיהוי דפוסים",
        durationRatio: 0.22,
        lecturerInstruction: "בקש מהסטודנטים לעבוד בזוגות ולנסח מהו הדפוס שהם מזהים מתוך הדוגמאות.",
        sampleQuestions: ["איזה סימן חוזר?", "מה קורה בכל פעם ש...?"],
        expectedOutput: "דפוס מנוסח בזוגות",
        expectedOutputs: ["detected_pattern"],
        botMode: "task_support",
        gate: { type: "evidence_required", evidence: "detected_pattern" }
      },
      {
        key: "rule_construction",
        stageLabel: "independent_practice",
        title: "בניית כלל ראשוני",
        durationRatio: 0.22,
        lecturerInstruction: "בקש מכל זוג לנסח כלל זמני מתוך הדפוס שזיהה, גם אם הכלל עדיין לא מושלם.",
        sampleQuestions: ["איך הייתם מנסחים את הכלל?", "באיזה מקרה הכלל לא יעבוד?"],
        expectedOutput: "כלל ראשוני של סטודנטים",
        expectedOutputs: ["student_generated_rule"],
        botMode: "task_support",
        gate: { type: "completion_required", evidence: "student_generated_rule" }
      },
      {
        key: "peer_explanation",
        stageLabel: "discussion",
        title: "הסבר בין עמיתים",
        durationRatio: 0.20,
        lecturerInstruction: "חבר בין זוגות. כל זוג מסביר לזוג אחר את הכלל שגיבש ומקבל שאלה או הסתייגות אחת.",
        sampleQuestions: ["איך תסבירו את הכלל במילים פשוטות?", "איזו דוגמה מוכיחה אותו?"],
        expectedOutput: "הסבר עמיתים ושאלה אחת",
        expectedOutputs: ["peer_explanation"],
        botMode: "none",
        gate: null
      },
      {
        key: "formalization",
        stageLabel: "closure",
        title: "דיוק וסיכום הכלל",
        durationRatio: 0.18,
        lecturerInstruction: "אסוף את הכללים, דייק יחד עם הכיתה את הניסוח, ורק עכשיו הצג ניסוח מסכם ברור.",
        sampleQuestions: ["מה צריך להוסיף לכלל?", "איזה ניסוח הכי מדויק?"],
        expectedOutput: "כלל מסכם ומדויק",
        expectedOutputs: ["refined_rule"],
        botMode: "course_support",
        gate: null
      }
    ]
  },

  problem_based_inquiry: {
    family: "problem_based_inquiry",
    label: "למידה מבוססת בעיה וחקר",
    principles: ["problem_based_learning", "inquiry_based_learning", "active_learning", "thinking_oriented_learning"],
    stages: [
      {
        key: "problem",
        stageLabel: "opening",
        title: "הצגת בעיה או דילמה",
        durationRatio: 0.15,
        lecturerInstruction: "פתח בבעיה, מקרה או דילמה אמיתית. אל תפתור אותה מיד; בקש מהסטודנטים לנסח מה צריך להבין.",
        sampleQuestions: ["מה הבעיה כאן?", "מה עדיין לא ברור לנו?"],
        expectedOutput: "ניסוח ראשוני של הבעיה",
        expectedOutputs: ["problem_statement"],
        botMode: "none",
        gate: null
      },
      {
        key: "inquiry_questions",
        stageLabel: "knowledge_building",
        title: "שאלות חקר ראשוניות",
        durationRatio: 0.18,
        lecturerInstruction: "בקש מהסטודנטים להציע שאלות שצריך לבדוק כדי להבין את הבעיה.",
        sampleQuestions: ["איזה מידע חסר?", "איזו הנחה צריך לבדוק?"],
        expectedOutput: "רשימת שאלות חקר",
        expectedOutputs: ["inquiry_questions"],
        botMode: "research_support",
        gate: null
      },
      {
        key: "small_group_inquiry",
        stageLabel: "guided_practice",
        title: "חקר בקבוצות קטנות",
        durationRatio: 0.30,
        lecturerInstruction: "חלק את הסטודנטים לקבוצות. כל קבוצה בוחנת אפשרות הסבר או פתרון ומבססת אותה על ראיה או מושג.",
        sampleQuestions: ["איזה הסבר אפשרי?", "מה תומך בו?", "מה מחליש אותו?"],
        expectedOutput: "הצעת הסבר או פתרון מבוסס",
        expectedOutputs: ["hypothesis_or_solution"],
        botMode: "research_support",
        gate: { type: "evidence_required", evidence: "hypothesis_or_solution" }
      },
      {
        key: "response",
        stageLabel: "discussion",
        title: "השוואת פתרונות / הסברים",
        durationRatio: 0.22,
        lecturerInstruction: "אסוף כמה פתרונות או הסברים והשווה ביניהם. הדגש את הקשר בין מושגים לבין הכרעה מעשית.",
        sampleQuestions: ["איזו הצעה משכנעת יותר?", "מה המחיר של כל פתרון?"],
        expectedOutput: "השוואת פתרונות או הסברים",
        expectedOutputs: ["comparison_response"],
        botMode: "course_support",
        gate: null
      },
      {
        key: "transfer_reflection",
        stageLabel: "reflection",
        title: "רפלקציה והעברה",
        durationRatio: 0.15,
        lecturerInstruction: "בקש מהסטודנטים לנסח מה הבעיה חשפה על המושג או על דרך החשיבה שלהם.",
        sampleQuestions: ["מה למדנו מהבעיה על המושג?", "איפה נראה בעיה דומה?"],
        expectedOutput: "תובנת העברה קצרה",
        expectedOutputs: ["transfer_reflection"],
        botMode: "reflection_support",
        gate: null
      }
    ]
  },

  reflective_practice_cycle: {
    family: "reflective_practice_cycle",
    label: "מחזור תרגול ורפלקציה",
    principles: ["reflective_learning", "self_regulated_learning", "formative_learning", "agency_preserving_learning"],
    stages: [
      {
        key: "attempt",
        stageLabel: "opening",
        title: "ניסיון קצר ראשון",
        durationRatio: 0.18,
        lecturerInstruction: "בקש מהסטודנטים לבצע ניסיון קצר או להציג תוצר ראשוני בלי להפוך זאת להערכה מסכמת.",
        sampleQuestions: ["מה ניסיתם לעשות?", "איפה הרגשתם קושי?"],
        expectedOutput: "תוצר ראשוני קצר",
        expectedOutputs: ["initial_attempt"],
        botMode: "none",
        gate: null
      },
      {
        key: "self_check",
        stageLabel: "guided_practice",
        title: "בדיקה עצמית לפי קריטריונים",
        durationRatio: 0.20,
        lecturerInstruction: "הצג 2–3 קריטריונים קצרים ובקש מהסטודנטים לבדוק את התוצר שלהם בעצמם.",
        sampleQuestions: ["מה עומד בקריטריון?", "מה דורש שיפור?"],
        expectedOutput: "סימון עצמי של נקודת חוזק ושיפור",
        expectedOutputs: ["self_check"],
        botMode: "reflection_support",
        gate: { type: "completion_required", evidence: "self_check" }
      },
      {
        key: "peer_or_guided_feedback",
        stageLabel: "discussion",
        title: "משוב קצר וממוקד",
        durationRatio: 0.20,
        lecturerInstruction: "אפשר משוב עמיתים קצר או משוב מונחה. התמקד בנקודת שיפור אחת ולא ברשימת תיקונים ארוכה.",
        sampleQuestions: ["מה הדבר האחד שכדאי לחזק?", "איזו הצעה אחת תעזור?"],
        expectedOutput: "משוב ממוקד אחד",
        expectedOutputs: ["focused_feedback"],
        botMode: "reflection_support",
        gate: null
      },
      {
        key: "improvement_principle",
        stageLabel: "knowledge_building",
        title: "עקרון שיפור אישי",
        durationRatio: 0.18,
        lecturerInstruction: "בקש מהסטודנטים לנסח כלל פעולה אישי לשיפור, המבוסס על הבדיקה והמשוב.",
        sampleQuestions: ["מה תשנו בפעם הבאה?", "איזה כלל יעזור לכם?"],
        expectedOutput: "עקרון שיפור אישי",
        expectedOutputs: ["improvement_principle"],
        botMode: "reflection_support",
        gate: null
      },
      {
        key: "revision_plan",
        stageLabel: "closure",
        title: "תכנון ניסיון הבא",
        durationRatio: 0.24,
        lecturerInstruction: "בקש מהסטודנטים לתכנן תיקון או ניסיון נוסף קצר על בסיס עקרון השיפור שגיבשו.",
        sampleQuestions: ["מה הצעד הבא שלכם?", "איך תדעו שהשתפרתם?"],
        expectedOutput: "תוכנית תיקון או ניסיון הבא",
        expectedOutputs: ["revision_plan"],
        botMode: "reflection_support",
        gate: null
      }
    ]
  }
};

export function compilePedagogicalDecisionToLesson(decision = {}) {
  const family = normalizeTemplateFamily(decision.template_family);
  const template = COMPILATION_TEMPLATES[family] || COMPILATION_TEMPLATES.evidence_guided_discussion;
  const context = normalizeContext(decision.context || {});
  const duration = context.duration_minutes;

  const stages = template.stages.map((stage, index) => compileStage(stage, {
    index,
    duration,
    decision,
    context,
    template
  }));

  const lessonScript = stages.map(toLecturerScriptStep);
  const flowDraft = {
    template_family: template.family,
    template_label: template.label,
    nodes: stages.map(toFlowDraftNode)
  };

  return {
    lesson_script: lessonScript,
    flow_draft: flowDraft,
    compilation_report: buildCompilationReport({ decision, context, template, stages })
  };
}

export function getCompilationTemplateFamilies() {
  return Object.keys(COMPILATION_TEMPLATES);
}

export function getCompilationTemplate(family) {
  return COMPILATION_TEMPLATES[normalizeTemplateFamily(family)] || null;
}

function normalizeTemplateFamily(value) {
  const family = String(value || "").trim();
  return family || "evidence_guided_discussion";
}

function normalizeContext(context = {}) {
  const duration = Number(context.duration_minutes);
  return {
    ...context,
    duration_minutes: Number.isFinite(duration) && duration > 0 ? duration : DEFAULT_DURATION_MINUTES,
    target_skills: Array.isArray(context.target_skills) ? context.target_skills : [],
    principles: Array.isArray(context.principles) ? context.principles : [],
    constraints: Array.isArray(context.constraints) ? context.constraints : [],
    preferences: Array.isArray(context.preferences) ? context.preferences : []
  };
}

function compileStage(stage, { index, duration, decision, context, template }) {
  const baseDuration = Math.max(5, Math.round(duration * Number(stage.durationRatio || 0)));
  const enriched = enrichStageFromActions(stage, decision.pedagogical_actions || [], context);

  return {
    ...enriched,
    nodeId: `draft_${template.family}_${String(index + 1).padStart(2, "0")}`,
    duration_minutes: baseDuration
  };
}

function enrichStageFromActions(stage, actions, context) {
  let next = { ...stage };
  const actionSet = new Set(Array.isArray(actions) ? actions : []);
  const constraints = new Set(context.constraints || []);
  const preferences = new Set(context.preferences || []);

  if (actionSet.has("add_guided_questions") && (!next.sampleQuestions || !next.sampleQuestions.length)) {
    next.sampleQuestions = ["מה אתם מזהים כאן?", "איך אפשר להסביר זאת?", "מה חסר כדי להכריע?"];
  }

  if (actionSet.has("add_reflection_closure") && next.stageLabel === "closure") {
    next.stageLabel = "reflection";
    next.botMode = next.botMode || "reflection_support";
  }

  if (actionSet.has("delay_explanation") && next.key === "examples_first") {
    next.lecturerInstruction += " שמור את ההסבר הפורמלי לסוף התהליך, אחרי שהסטודנטים ניסו לזהות את הכלל בעצמם.";
  }

  if (constraints.has("preserve_student_agency")) {
    next.lecturerInstruction = next.lecturerInstruction.replace(/הסבר להם/g, "כוון אותם לזהות");
  }

  if (preferences.has("use_short_clear_steps")) {
    next.lecturerInstruction = shortenInstruction(next.lecturerInstruction);
  }

  return next;
}

function shortenInstruction(text) {
  const clean = String(text || "").trim();
  if (clean.length <= 180) return clean;
  return clean.slice(0, 177).trim() + "...";
}

function toLecturerScriptStep(stage) {
  return {
    step_title: stage.title,
    duration_minutes: stage.duration_minutes,
    lecturer_instruction: stage.lecturerInstruction,
    sample_questions: stage.sampleQuestions || [],
    expected_student_output: stage.expectedOutput || "תוצר קצר של הלומדים"
  };
}

function toFlowDraftNode(stage) {
  return {
    nodeId: stage.nodeId,
    stageLabel: stage.stageLabel,
    title: stage.title,
    duration_minutes: stage.duration_minutes,
    botMode: stage.botMode || "none",
    expectedOutputs: stage.expectedOutputs || [],
    gate: stage.gate || null
  };
}

function buildCompilationReport({ decision, context, template, stages }) {
  const requestedFamily = decision?.template_family || null;
  const usedFallback = requestedFamily && requestedFamily !== template.family;

  return {
    template_family: template.family,
    template_label: template.label,
    requested_template_family: requestedFamily,
    used_fallback: !!usedFallback,
    duration_minutes: context.duration_minutes,
    stage_count: stages.length,
    principles: template.principles || [],
    applied_actions: Array.isArray(decision.pedagogical_actions) ? decision.pedagogical_actions : [],
    warnings: usedFallback ? [`Unknown template_family '${requestedFamily}', used '${template.family}' instead.`] : [],
    notes: [
      "Compilation output is a pedagogical draft; Lesson Flow Engine should attach resources, activities, ids, and runtime defaults."
    ]
  };
}
