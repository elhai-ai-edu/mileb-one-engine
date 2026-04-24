// lesson_compiler.js — MilEd.One
// Config-driven pedagogical compilation engine v1.1
//
// Purpose:
// Transform a pedagogical decision into:
// 1. lecturer-facing lesson script
// 2. system-facing flow draft
// 3. lesson_pack_draft with bot_plan placeholders
// 4. compilation report
//
// Architectural rule:
// Templates are pedagogical knowledge. Code is only the interpreter.
// Current status: Lesson Pack Draft v0 — not yet a full document/form/slide exporter.

const DEFAULT_DURATION_MINUTES = 90;

const COMMON_FORBIDDEN_ACTIONS = [
  'write_full_answer',
  'complete_assignment_for_student',
  'skip_required_stage',
  'replace_student_reasoning',
  'grade_without_criteria'
];

const COMPILATION_TEMPLATES = {
  evidence_guided_discussion: {
    family: 'evidence_guided_discussion',
    label: 'דיון מונחה ראיות',
    pattern_family: 'inquiry + feedback + collaborative',
    learning_cycle: ['input', 'processing', 'sharing', 'feedback', 'reflection'],
    principles: ['active_learning', 'thinking_oriented_learning'],
    stages: [
      stage('trigger', 'opening', 'פתיחה: טענה מעוררת דיון', 0.12,
        'הצג טענה, מקרה קצר או שקף מרכזי שמעורר הסכמה או התנגדות, ובקש תגובה ראשונית.',
        ['האם אתם מסכימים עם הטענה?', 'מה חסר לכם כדי להכריע?'],
        'עמדה ראשונית קצרה', ['short_position'], 'none', null, botNone()),
      stage('evidence_work', 'guided_practice', 'עבודה על ראיות', 0.25,
        'בקש מהסטודנטים לעבוד בזוגות או בקבוצות קטנות ולזהות טענה, ראיה והנחה מתוך החומר.',
        ['מהי הטענה המרכזית?', 'איזו ראיה תומכת בה?', 'איזו הנחה עומדת מאחוריה?'],
        'טענה + ראיה + הנחה', ['evidence_map'], 'task_support', { type: 'evidence_required', evidence: 'evidence_map' },
        botBinding('inquiry_guide', 'evidence_checking', ['request_evidence', 'ask_guiding_question', 'check_attempt'])),
      stage('guided_discussion', 'discussion', 'דיון מונחה בכיתה', 0.43,
        'אסוף תשובות מהסטודנטים, השווה בין דרכי הנימוק, והדגש את ההבדל בין דעה לבין טענה מבוססת.',
        ['איזו ראיה חזקה יותר ולמה?', 'האם אפשר לפרש את אותה ראיה אחרת?', 'מה יגרום לכם לשנות עמדה?'],
        'השתתפות בדיון מבוסס נימוקים', ['reasoned_participation'], 'course_support', null,
        botBinding('peer_discussion_support', 'peer_prompting', ['offer_peer_discussion_prompt', 'ask_guiding_question'])),
      stage('reflection_closure', 'reflection', 'סיכום רפלקטיבי', 0.20,
        'בקש מכל סטודנט לנסח תובנה קצרה או שאלה שנותרה פתוחה בעקבות הדיון.',
        ['איזה נימוק שכנע אתכם יותר?', 'מה עדיין נשאר פתוח בעיניכם?'],
        'משפט רפלקטיבי אישי', ['reflection_note'], 'reflection_support', null,
        botBinding('reflection_guide', 'reflection_prompting', ['prompt_reflection', 'summarize_student_progress']))
    ]
  },

  scaffolded_skill_building: {
    family: 'scaffolded_skill_building',
    label: 'בניית מיומנות מדורגת',
    pattern_family: 'scaffolding + feedback',
    learning_cycle: ['input', 'processing', 'practice', 'feedback', 'reflection'],
    principles: ['scaffolded_learning', 'formative_learning', 'agency_preserving_learning'],
    stages: [
      stage('surface_problem', 'opening', 'פתיחה: זיהוי הקושי', 0.12,
        'הצג דוגמה לביצוע חלקי או שגוי, ובקש מהסטודנטים לזהות מה עדיין חסר.',
        ['מה עובד כאן?', 'מה עדיין לא מספיק?'], 'זיהוי ראשוני של קושי', ['error_identification'], 'none', null, botNone()),
      stage('decompose', 'knowledge_building', 'פירוק המיומנות לרכיבים', 0.18,
        'פרק את המיומנות לשלבים קטנים והראה מה צריך לבדוק בכל שלב.',
        ['מהו הצעד הראשון?', 'איזה רכיב אסור לאבד?'], 'מפת רכיבי מיומנות', ['skill_components_map'], 'course_support', null,
        botBinding('course_explainer', 'concept_explanation', ['explain_concept_briefly', 'clarify_instruction'])),
      stage('guided_practice', 'guided_practice', 'תרגול מודרך בשלבים', 0.30,
        'בצעו יחד ניסיון אחד בשלבים. עצור בכל שלב ובדוק הבנה לפני המעבר לשלב הבא.',
        ['מה עשינו עכשיו?', 'איך נבדוק שזה נכון?'], 'ניסיון מודרך בשלבים', ['guided_attempt'], 'task_support', { type: 'completion_required', evidence: 'guided_attempt' },
        botBinding('skill_practice_coach', 'guided_hinting', ['ask_guiding_question', 'give_hint', 'check_attempt'])),
      stage('independent_practice', 'independent_practice', 'תרגול עצמאי קצר', 0.27,
        'תן משימה קצרה דומה אך חדשה. בקש מהסטודנטים לבצע לבד ולסמן מה שינו או בדקו.',
        ['מה עשיתם אחרת?', 'איך בדקתם את עצמכם?'], 'ניסיון עצמאי קצר', ['independent_attempt'], 'task_support', { type: 'evidence_required', evidence: 'independent_attempt' },
        botBinding('skill_practice_coach', 'feedback_on_attempt', ['check_attempt', 'give_hint', 'suggest_next_step'])),
      stage('reflection', 'reflection', 'סיכום: כלל אישי להמשך', 0.13,
        'בקש מכל סטודנט לנסח כלל פעולה אישי שיעזור לו בפעם הבאה.',
        ['מה היה קשה?', 'מה תבדקו בפעם הבאה?'], 'כלל אישי קצר', ['personal_rule'], 'reflection_support', null,
        botBinding('reflection_guide', 'reflection_prompting', ['prompt_reflection']))
    ]
  },

  inductive_peer_learning: {
    family: 'inductive_peer_learning',
    label: 'למידה אינדוקטיבית עם הסבר עמיתים',
    pattern_family: 'inquiry + collaborative',
    learning_cycle: ['input', 'processing', 'sharing', 'feedback', 'reflection'],
    principles: ['constructivist_learning', 'collaborative_learning', 'agency_preserving_learning', 'active_learning'],
    stages: [
      stage('examples_first', 'opening', 'דוגמאות לפני כלל', 0.18,
        'הצג כמה דוגמאות ללא הסבר מקדים של הכלל. בקש מהסטודנטים להתבונן ולחפש דפוסים.',
        ['מה משותף לדוגמאות?', 'מה משתנה בין הדוגמאות?'], 'תצפיות ראשוניות על הדוגמאות', ['pattern_observations'], 'none', null, botNone()),
      stage('pattern_detection', 'guided_practice', 'זיהוי דפוסים', 0.22,
        'בקש מהסטודנטים לעבוד בזוגות ולנסח מהו הדפוס שהם מזהים מתוך הדוגמאות.',
        ['איזה סימן חוזר?', 'מה קורה בכל פעם ש...?'], 'דפוס מנוסח בזוגות', ['detected_pattern'], 'task_support', { type: 'evidence_required', evidence: 'detected_pattern' },
        botBinding('task_coach', 'socratic_questioning', ['ask_guiding_question', 'check_attempt'])),
      stage('rule_construction', 'independent_practice', 'בניית כלל ראשוני', 0.22,
        'בקש מכל זוג לנסח כלל זמני מתוך הדפוס שזיהה, גם אם הכלל עדיין לא מושלם.',
        ['איך הייתם מנסחים את הכלל?', 'באיזה מקרה הכלל לא יעבוד?'], 'כלל ראשוני של סטודנטים', ['student_generated_rule'], 'task_support', { type: 'completion_required', evidence: 'student_generated_rule' },
        botBinding('task_coach', 'guided_hinting', ['ask_guiding_question', 'give_hint'])),
      stage('peer_explanation', 'discussion', 'הסבר בין עמיתים', 0.20,
        'חבר בין זוגות. כל זוג מסביר לזוג אחר את הכלל שגיבש ומקבל שאלה או הסתייגות אחת.',
        ['איך תסבירו את הכלל במילים פשוטות?', 'איזו דוגמה מוכיחה אותו?'], 'הסבר עמיתים ושאלה אחת', ['peer_explanation'], 'none', null,
        botBinding('peer_discussion_support', 'peer_prompting', ['offer_peer_discussion_prompt'])),
      stage('formalization', 'closure', 'דיוק וסיכום הכלל', 0.18,
        'אסוף את הכללים, דייק יחד עם הכיתה את הניסוח, ורק עכשיו הצג ניסוח מסכם ברור.',
        ['מה צריך להוסיף לכלל?', 'איזה ניסוח הכי מדויק?'], 'כלל מסכם ומדויק', ['refined_rule'], 'course_support', null,
        botBinding('course_explainer', 'concept_explanation', ['explain_concept_briefly']))
    ]
  },

  problem_based_inquiry: {
    family: 'problem_based_inquiry',
    label: 'למידה מבוססת בעיה וחקר',
    pattern_family: 'inquiry + authentic performance',
    learning_cycle: ['input', 'processing', 'representation', 'sharing', 'reflection'],
    principles: ['problem_based_learning', 'inquiry_based_learning', 'active_learning', 'thinking_oriented_learning'],
    stages: [
      stage('problem', 'opening', 'הצגת בעיה או דילמה', 0.15,
        'פתח בבעיה, מקרה או דילמה אמיתית. אל תפתור אותה מיד; בקש מהסטודנטים לנסח מה צריך להבין.',
        ['מה הבעיה כאן?', 'מה עדיין לא ברור לנו?'], 'ניסוח ראשוני של הבעיה', ['problem_statement'], 'none', null,
        botBinding('inquiry_guide', 'socratic_questioning', ['ask_guiding_question'])),
      stage('inquiry_questions', 'knowledge_building', 'שאלות חקר ראשוניות', 0.18,
        'בקש מהסטודנטים להציע שאלות שצריך לבדוק כדי להבין את הבעיה.',
        ['איזה מידע חסר?', 'איזו הנחה צריך לבדוק?'], 'רשימת שאלות חקר', ['inquiry_questions'], 'research_support', null,
        botBinding('inquiry_guide', 'socratic_questioning', ['ask_guiding_question', 'request_evidence'])),
      stage('small_group_inquiry', 'guided_practice', 'חקר בקבוצות קטנות', 0.30,
        'חלק את הסטודנטים לקבוצות. כל קבוצה בוחנת אפשרות הסבר או פתרון ומבססת אותה על ראיה או מושג.',
        ['איזה הסבר אפשרי?', 'מה תומך בו?', 'מה מחליש אותו?'], 'הצעת הסבר או פתרון מבוסס', ['hypothesis_or_solution'], 'research_support', { type: 'evidence_required', evidence: 'hypothesis_or_solution' },
        botBinding('inquiry_guide', 'evidence_checking', ['request_evidence', 'suggest_next_step'])),
      stage('response', 'discussion', 'השוואת פתרונות / הסברים', 0.22,
        'אסוף כמה פתרונות או הסברים והשווה ביניהם. הדגש את הקשר בין מושגים לבין הכרעה מעשית.',
        ['איזו הצעה משכנעת יותר?', 'מה המחיר של כל פתרון?'], 'השוואת פתרונות או הסברים', ['comparison_response'], 'course_support', null,
        botBinding('peer_discussion_support', 'peer_prompting', ['offer_peer_discussion_prompt'])),
      stage('transfer_reflection', 'reflection', 'רפלקציה והעברה', 0.15,
        'בקש מהסטודנטים לנסח מה הבעיה חשפה על המושג או על דרך החשיבה שלהם.',
        ['מה למדנו מהבעיה על המושג?', 'איפה נראה בעיה דומה?'], 'תובנת העברה קצרה', ['transfer_reflection'], 'reflection_support', null,
        botBinding('reflection_guide', 'reflection_prompting', ['prompt_reflection']))
    ]
  },

  reflective_practice_cycle: {
    family: 'reflective_practice_cycle',
    label: 'מחזור תרגול ורפלקציה',
    pattern_family: 'reflection + feedback',
    learning_cycle: ['practice', 'feedback', 'processing', 'reflection'],
    principles: ['reflective_learning', 'self_regulated_learning', 'formative_learning', 'agency_preserving_learning'],
    stages: [
      stage('attempt', 'opening', 'ניסיון קצר ראשון', 0.18,
        'בקש מהסטודנטים לבצע ניסיון קצר או להציג תוצר ראשוני בלי להפוך זאת להערכה מסכמת.',
        ['מה ניסיתם לעשות?', 'איפה הרגשתם קושי?'], 'תוצר ראשוני קצר', ['initial_attempt'], 'none', null, botNone()),
      stage('self_check', 'guided_practice', 'בדיקה עצמית לפי קריטריונים', 0.20,
        'הצג 2–3 קריטריונים קצרים ובקש מהסטודנטים לבדוק את התוצר שלהם בעצמם.',
        ['מה עומד בקריטריון?', 'מה דורש שיפור?'], 'סימון עצמי של נקודת חוזק ושיפור', ['self_check'], 'reflection_support', { type: 'completion_required', evidence: 'self_check' },
        botBinding('assessment_feedback_assistant', 'feedback_on_attempt', ['check_attempt', 'prompt_reflection'])),
      stage('peer_or_guided_feedback', 'discussion', 'משוב קצר וממוקד', 0.20,
        'אפשר משוב עמיתים קצר או משוב מונחה. התמקד בנקודת שיפור אחת ולא ברשימת תיקונים ארוכה.',
        ['מה הדבר האחד שכדאי לחזק?', 'איזו הצעה אחת תעזור?'], 'משוב ממוקד אחד', ['focused_feedback'], 'reflection_support', null,
        botBinding('peer_discussion_support', 'peer_prompting', ['offer_peer_discussion_prompt'])),
      stage('improvement_principle', 'knowledge_building', 'עקרון שיפור אישי', 0.18,
        'בקש מהסטודנטים לנסח כלל פעולה אישי לשיפור, המבוסס על הבדיקה והמשוב.',
        ['מה תשנו בפעם הבאה?', 'איזה כלל יעזור לכם?'], 'עקרון שיפור אישי', ['improvement_principle'], 'reflection_support', null,
        botBinding('reflection_guide', 'reflection_prompting', ['prompt_reflection'])),
      stage('revision_plan', 'closure', 'תכנון ניסיון הבא', 0.24,
        'בקש מהסטודנטים לתכנן תיקון או ניסיון נוסף קצר על בסיס עקרון השיפור שגיבשו.',
        ['מה הצעד הבא שלכם?', 'איך תדעו שהשתפרתם?'], 'תוכנית תיקון או ניסיון הבא', ['revision_plan'], 'reflection_support', null,
        botBinding('reflection_guide', 'reflection_prompting', ['prompt_reflection', 'suggest_next_step']))
    ]
  }
};

export function compilePedagogicalDecisionToLesson(decision = {}) {
  const family = normalizeTemplateFamily(decision.template_family);
  const template = COMPILATION_TEMPLATES[family] || COMPILATION_TEMPLATES.evidence_guided_discussion;
  const context = normalizeContext(decision.context || {});
  const duration = context.duration_minutes;

  const stages = template.stages.map((stageDef, index) => compileStage(stageDef, {
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
    pattern_family: template.pattern_family,
    learning_cycle: template.learning_cycle,
    nodes: stages.map(toFlowDraftNode)
  };
  const botPlan = stages.map(toBotPlanItem).filter(Boolean);
  const lessonPackDraft = buildLessonPackDraft({ decision, context, template, stages, lessonScript, flowDraft, botPlan });

  return {
    lesson_script: lessonScript,
    flow_draft: flowDraft,
    lesson_pack_draft: lessonPackDraft,
    compilation_report: buildCompilationReport({ decision, context, template, stages, botPlan })
  };
}

export function getCompilationTemplateFamilies() {
  return Object.keys(COMPILATION_TEMPLATES);
}

export function getCompilationTemplate(family) {
  return COMPILATION_TEMPLATES[normalizeTemplateFamily(family)] || null;
}

function stage(key, stageLabel, title, durationRatio, lecturerInstruction, sampleQuestions, expectedOutput, expectedOutputs, botMode, gate, botBindingDef) {
  return { key, stageLabel, title, durationRatio, lecturerInstruction, sampleQuestions, expectedOutput, expectedOutputs, botMode, gate, botBinding: botBindingDef };
}

function botNone() {
  return null;
}

function botBinding(botRole, supportMode, allowedActions = [], overrides = {}) {
  return {
    bot_role: botRole,
    support_mode: supportMode,
    student_visible: overrides.student_visible ?? true,
    teacher_visible: overrides.teacher_visible ?? true,
    activation: overrides.activation || { trigger: 'node_start', default_state: 'enabled' },
    allowed_actions: allowedActions,
    forbidden_actions: overrides.forbidden_actions || COMMON_FORBIDDEN_ACTIONS,
    kb_scope: overrides.kb_scope || [],
    handoff: overrides.handoff || { from: 'teacher_runtime', to: botRole, trigger: 'node_start' }
  };
}

function normalizeTemplateFamily(value) {
  const family = String(value || '').trim();
  return family || 'evidence_guided_discussion';
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

function compileStage(stageDef, { index, duration, decision, context, template }) {
  const baseDuration = Math.max(5, Math.round(duration * Number(stageDef.durationRatio || 0)));
  const enriched = enrichStageFromActions(stageDef, decision.pedagogical_actions || [], context);

  return {
    ...enriched,
    nodeId: `draft_${template.family}_${String(index + 1).padStart(2, '0')}`,
    duration_minutes: baseDuration
  };
}

function enrichStageFromActions(stageDef, actions, context) {
  const next = { ...stageDef };
  const actionSet = new Set(Array.isArray(actions) ? actions : []);
  const constraints = new Set(context.constraints || []);
  const preferences = new Set(context.preferences || []);

  if (actionSet.has('add_guided_questions') && (!next.sampleQuestions || !next.sampleQuestions.length)) {
    next.sampleQuestions = ['מה אתם מזהים כאן?', 'איך אפשר להסביר זאת?', 'מה חסר כדי להכריע?'];
  }

  if (actionSet.has('add_reflection_closure') && next.stageLabel === 'closure') {
    next.stageLabel = 'reflection';
    next.botMode = next.botMode || 'reflection_support';
  }

  if (actionSet.has('delay_explanation') && next.key === 'examples_first') {
    next.lecturerInstruction += ' שמור את ההסבר הפורמלי לסוף התהליך, אחרי שהסטודנטים ניסו לזהות את הכלל בעצמם.';
  }

  if (constraints.has('preserve_student_agency')) {
    next.lecturerInstruction = next.lecturerInstruction.replace(/הסבר להם/g, 'כוון אותם לזהות');
  }

  if (preferences.has('use_short_clear_steps')) {
    next.lecturerInstruction = shortenInstruction(next.lecturerInstruction);
  }

  return next;
}

function shortenInstruction(text) {
  const clean = String(text || '').trim();
  if (clean.length <= 180) return clean;
  return clean.slice(0, 177).trim() + '...';
}

function toLecturerScriptStep(stage) {
  return {
    step_title: stage.title,
    duration_minutes: stage.duration_minutes,
    lecturer_instruction: stage.lecturerInstruction,
    sample_questions: stage.sampleQuestions || [],
    expected_student_output: stage.expectedOutput || 'תוצר קצר של הלומדים'
  };
}

function toFlowDraftNode(stage) {
  return {
    nodeId: stage.nodeId,
    node_key: stage.key,
    stageLabel: stage.stageLabel,
    title: stage.title,
    duration_minutes: stage.duration_minutes,
    botMode: stage.botMode || 'none',
    bot_binding_ref: stage.botBinding ? `bot_${stage.nodeId}` : null,
    expectedOutputs: stage.expectedOutputs || [],
    gate: stage.gate || null
  };
}

function toBotPlanItem(stage) {
  if (!stage.botBinding) return null;
  return {
    binding_id: `bot_${stage.nodeId}`,
    node_key: stage.key,
    node_id: stage.nodeId,
    stageLabel: stage.stageLabel,
    ...stage.botBinding
  };
}

function buildLessonPackDraft({ decision, context, template, stages, lessonScript, flowDraft, botPlan }) {
  return {
    metadata: {
      lesson_title: context.lesson_title || template.label,
      duration_minutes: context.duration_minutes,
      audience_level: context.audience_level || null,
      course_type: context.course_type || null,
      content_type: context.content_type || null,
      template_family: template.family,
      transformation_type: decision.transformation_type || null
    },
    pedagogical_rationale: {
      short_rationale: `השיעור נבנה לפי תבנית ${template.label}, בהתאם לעקרונות: ${(template.principles || []).join(', ')}`,
      learning_goal: context.learning_goal || null,
      why_this_template: context.why_this_template || null,
      principles_used: template.principles || [],
      instructor_emphases_reflected: context.instructor_emphases || []
    },
    teacher_guide: {
      overview: `טיוטת שיעור מסוג ${template.label}.`,
      before_class: [],
      during_class_focus: stages.map(s => s.title),
      facilitation_tips: ['שמור על אחריות הלומד', 'השתמש בשאלות לדוגמה כדי לקדם חשיבה ולא כדי לתת תשובה מוכנה'],
      watch_points: [],
      adaptation_options: []
    },
    student_guide: {
      opening_message: 'בשיעור זה תעבדו באופן פעיל ותפיקו תוצרי ביניים לאורך התהליך.',
      what_you_will_do: stages.map(s => s.expectedOutput).filter(Boolean),
      expected_outputs: stages.flatMap(s => s.expectedOutputs || []),
      working_norms: ['נסו קודם בעצמכם', 'הסבירו את החשיבה שלכם', 'השתמשו במשוב לשיפור'],
      submission_instructions: []
    },
    lesson_script: lessonScript,
    flow_draft: flowDraft,
    bot_plan: botPlan,
    pre_class: [],
    post_class: [],
    resources_plan: buildResourcePlan(stages),
    assessment: buildAssessmentDraft(stages),
    reflection: buildReflectionDraft(stages),
    skills_alignment: buildSkillsAlignment(context, stages),
    export_targets: [],
    pack_report: {
      generated_from: ['selector', 'principles', 'compiler_template'],
      template_family: template.family,
      principles: template.principles || [],
      constraints_applied: context.constraints || [],
      preferences_applied: context.preferences || [],
      warnings: [],
      missing_elements: ['pre_class', 'post_class', 'export_targets']
    }
  };
}

function buildResourcePlan(stages) {
  return stages.map(stage => ({
    resource_role: inferResourceRole(stage),
    description: `משאב תומך לשלב: ${stage.title}`,
    source: 'optional',
    linked_node: stage.key
  }));
}

function inferResourceRole(stage) {
  if (stage.stageLabel === 'opening') return 'trigger';
  if (stage.stageLabel === 'reflection') return 'reflection_prompt';
  if (stage.stageLabel.includes('practice')) return 'worksheet';
  if (stage.stageLabel === 'discussion') return 'shared_board';
  return 'supporting_material';
}

function buildAssessmentDraft(stages) {
  const evidence = stages.flatMap(stage => stage.expectedOutputs || []);
  return {
    assessment_type: evidence.length ? 'formative' : 'none',
    criteria: evidence.map(item => ({ criterion: item, evidence: item, level: 'basic' })),
    rubric_needed: false,
    feedback_mode: 'mixed'
  };
}

function buildReflectionDraft(stages) {
  const hasReflection = stages.some(stage => stage.stageLabel === 'reflection' || stage.key.includes('reflection'));
  return {
    reflection_prompt: hasReflection ? 'מה התחדד לך בעקבות הפעילות, ומה תרצה לבדוק או לשפר בפעם הבאה?' : '',
    student_output: hasReflection ? 'reflection_note' : '',
    teacher_use: hasReflection ? 'איתור הבנה, קושי ותובנות להמשך השיעור או השיעור הבא.' : ''
  };
}

function buildSkillsAlignment(context, stages) {
  return (context.target_skills || []).map(skill => ({
    skill,
    where_it_appears: stages.find(stage => stage.stageLabel !== 'opening')?.title || null,
    evidence: stages.flatMap(stage => stage.expectedOutputs || [])[0] || null,
    development_mode: 'practice | reflection | collaboration'
  }));
}

function buildCompilationReport({ decision, context, template, stages, botPlan }) {
  const requestedFamily = decision?.template_family || null;
  const usedFallback = requestedFamily && requestedFamily !== template.family;

  return {
    template_family: template.family,
    template_label: template.label,
    requested_template_family: requestedFamily,
    used_fallback: !!usedFallback,
    duration_minutes: context.duration_minutes,
    stage_count: stages.length,
    bot_binding_count: botPlan.length,
    principles: template.principles || [],
    pattern_family: template.pattern_family,
    learning_cycle: template.learning_cycle,
    applied_actions: Array.isArray(decision.pedagogical_actions) ? decision.pedagogical_actions : [],
    warnings: usedFallback ? [`Unknown template_family '${requestedFamily}', used '${template.family}' instead.`] : [],
    notes: [
      'Compilation output is a Lesson Pack Draft v0; Lesson Flow Engine should attach resources, activities, ids, and runtime defaults.',
      'bot_plan is a placeholder-level orchestration plan; runtime/chat integration is not implemented here.'
    ]
  };
}
