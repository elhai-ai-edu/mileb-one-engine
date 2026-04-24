// pedagogical_structure_extractor.js
// v0.3 — rule-based extraction of pedagogical structure + task/project patterns from raw content
//        Now includes: learning pipeline detection, critical review project detection, bridge generation.

export function extractPedagogicalStructureFromContent(input = {}) {
  const text = input.raw_text || "";

  const stages = detectStages(text);
  const taskPatterns = detectTaskPatterns(text);
  const projectStructures = detectProjectStructures(text);
  const learning_pipelines = detectLearningPipelines(text);
  const critical_projects = detectCriticalReviewProject(text);
  const allProjects = [...projectStructures, ...critical_projects];
  const bridges = learning_pipelines.flatMap(pipeline =>
    allProjects.map(project => buildLearningToProjectBridge(pipeline, project))
  );
  const pattern = detectPattern(stages, taskPatterns, allProjects);

  return {
    detected_structure: stages,
    task_patterns: taskPatterns,
    project_structures: allProjects,
    learning_pipelines,
    bridges,
    pedagogical_pattern: pattern,
    strengths: detectStrengths(pattern, taskPatterns, allProjects),
    gaps: detectGaps(stages, taskPatterns, allProjects),
    recommended_template_family: mapPatternToTemplate(pattern, taskPatterns, allProjects),
    enriched_decision: buildDecision(pattern, taskPatterns, allProjects, input.context || {})
  };
}

function detectStages(text) {
  const stages = [];

  if (text.includes("מי אני")) stages.push(buildStage("identity", "מי אני", "personal_expression", "self_description"));
  if (text.includes("מי אנחנו")) stages.push(buildStage("group", "מי אנחנו", "social_construction", "group_characteristics"));
  if (text.includes("מי זו עליזה")) stages.push(buildStage("concept_bridge", "מי זו עליזה", "narrative_abstraction", "explain_character"));
  if (text.includes("מה זה מדעי החברה")) stages.push(buildStage("concept_definition", "מה זה מדעי החברה", "student_generated_concept", "concept_definition"));
  if (text.includes("אוצר מילים")) stages.push(buildStage("language", "אוצר מילים", "linguistic_processing", "vocabulary_usage"));
  if (text.includes("מה למדתי") || text.includes("שיעורי בית")) stages.push(buildStage("reflection", "רפלקציה", "metacognitive_reflection", "summary_output"));

  return stages;
}

function buildStage(id, label, type, evidence) {
  return {
    stage_id: id,
    label,
    type,
    suggested_gate: { type: "completion_required", evidence }
  };
}

export function detectTaskPatterns(rawText = "") {
  const text = rawText || "";
  const tasks = [];

  const isVocabularySentenceTask =
    text.includes("אוצר מילים") &&
    (text.includes("לנסח 10 משפטים") || text.includes("10 משפטים") || text.includes("משפט 10")) &&
    (text.includes("כל משפט כולל") || text.includes("לפחות מילה אחת") || text.includes("משפט 1"));

  if (isVocabularySentenceTask) tasks.push(buildVocabularySentenceTask(text));

  return tasks;
}

export function detectProjectStructures(rawText = "") {
  const text = rawText || "";
  const projects = [];

  const isResearchProject =
    text.includes("משימת חקר") ||
    text.includes("מחלקת מחקר ופיתוח") ||
    text.includes("ללקוח שלכם יש בעיה") ||
    (text.includes("קביעת הבעיה") && text.includes("מקורות") && text.includes("פתרון")) ||
    (text.includes("בדיקת אמינות") && text.includes("דוח רישמי"));

  if (isResearchProject) {
    projects.push({
      project_type: "multi_stage_research_project",
      title: "משימת חקר רב-שלבית: בעיה, פתרונות, אמינות, דוח והצגה",
      domain: "introductory_research_and_innovation",
      stages: buildResearchProjectStages(text),
      required_outputs: [
        "problem_definition",
        "background_review",
        "source_list",
        "causes_analysis",
        "effects_analysis",
        "solution_1_description",
        "solution_2_description",
        "solution_comparison",
        "chosen_solution_rationale",
        "source_credibility_solution_1",
        "source_credibility_solution_2",
        "final_report",
        "oral_presentation_recording"
      ],
      output_modes: ["written", "oral", "link_submission"],
      suggested_template_family: "problem_based_inquiry",
      suggested_bot_roles: [
        "research_project_coach",
        "solution_analysis_coach",
        "source_credibility_coach",
        "academic_writing_coach",
        "presentation_coach"
      ],
      suggested_gate: {
        type: "evidence_required",
        evidence: "final_report_and_oral_presentation"
      },
      forbidden_actions: [
        "write_full_research_document_for_student",
        "invent_sources",
        "fabricate_evidence",
        "skip_research_steps",
        "replace_student_problem_definition",
        "produce_final_solution_without_student_reasoning"
      ]
    });
  }

  return projects;
}

function buildResearchProjectStages(text) {
  const stages = [];

  stages.push({
    stage_id: "exploration",
    label: "שלב 1: חקר והגדרת הבעיה",
    type: "problem_exploration",
    sub_tasks: [
      "choose_problem",
      "define_problem",
      "research_background",
      "identify_sources",
      "analyze_causes",
      "analyze_effects",
      "review_existing_solutions"
    ],
    required_outputs: ["problem_definition", "background_review", "source_list", "causes_analysis", "effects_analysis", "existing_solution_review"],
    suggested_gate: { type: "evidence_required", evidence: "problem_research_document_link" },
    bot_role: "research_project_coach"
  });

  if (text.includes("פתרון") || text.includes("פיתרון")) {
    stages.push({
      stage_id: "solution_analysis",
      label: "שלב 2א: השוואת פתרונות ובחירה",
      type: "solution_comparison",
      sub_tasks: ["describe_solution_1", "describe_solution_2", "compare_solutions", "choose_solution", "justify_choice", "future_development"],
      required_outputs: ["solution_1_description", "solution_2_description", "solution_comparison", "chosen_solution_rationale", "future_development_note"],
      suggested_gate: { type: "evidence_required", evidence: "chosen_solution_with_rationale" },
      bot_role: "solution_analysis_coach"
    });
  }

  if (text.includes("בדיקת אמינות") || text.includes("אמינות המקורות") || text.includes("ציטוטים")) {
    stages.push({
      stage_id: "source_credibility",
      label: "שלב 2ב: בדיקת אמינות מקורות",
      type: "critical_information_literacy",
      sub_tasks: ["source_link", "solution_name_and_organization", "about_page_check", "publication_date", "supporting_quotes", "author_credentials", "secondary_source_check"],
      required_outputs: ["source_link", "publication_date", "two_relevant_quotes", "author_credentials", "non_commercial_check"],
      suggested_gate: { type: "evidence_required", evidence: "source_credibility_checklist_completed" },
      bot_role: "source_credibility_coach"
    });
  }

  if (text.includes("דוח") || text.includes("דוח רישמי") || text.includes("לפחות 200 מילים")) {
    stages.push({
      stage_id: "synthesis",
      label: "שלב 3א: כתיבת דוח רשמי",
      type: "academic_synthesis_writing",
      sub_tasks: ["integrate_previous_steps", "organize_logical_report", "use_connectors", "explain_problem_to_solution", "write_minimum_200_words"],
      required_outputs: ["final_report", "logical_structure", "minimum_200_words"],
      suggested_gate: { type: "evidence_required", evidence: "final_report_submitted" },
      bot_role: "academic_writing_coach"
    });
  }

  if (text.includes("הקלט") || text.includes("הקלטה") || text.includes("הצגה בקול")) {
    stages.push({
      stage_id: "presentation",
      label: "שלב 3ב: הצגת הפתרון בקול",
      type: "oral_client_presentation",
      sub_tasks: ["prepare_client_pitch", "speak_from_report", "record_presentation", "upload_recording"],
      required_outputs: ["oral_presentation_recording"],
      suggested_gate: { type: "evidence_required", evidence: "recording_link" },
      bot_role: "presentation_coach"
    });
  }

  return stages;
}

function buildVocabularySentenceTask(text) {
  return {
    task_type: "vocabulary_sentence_production",
    title: "תרגיל אוצר מילים",
    domain: "academic_hebrew_social_sciences",
    source_material: detectSourceMaterial(text),
    expected_output_count: detectExpectedSentenceCount(text),
    required_output_type: "sentence",
    vocabulary_items: extractVocabularyItems(text),
    assessment_mode: "formative_language_practice",
    develops: ["vocabulary_usage_in_context", "sentence_production", "academic_hebrew_fluency", "semantic_distinction"],
    suggested_gate: { type: "completion_required", evidence: "10_sentences_submitted" },
    suggested_bot_role: "vocabulary_practice_coach",
    support_mode: "guided_sentence_practice",
    allowed_actions: ["clarify_word_meaning", "ask_student_to_try_sentence", "check_word_usage", "suggest_correction_hint", "distinguish_similar_meanings"],
    forbidden_actions: ["write_all_10_sentences_for_student", "replace_student_sentence_production", "give_final_answer_before_attempt"]
  };
}

function extractVocabularyItems(text) {
  const knownItems = [
    "לעסוק", "עוסק", "עוסקים", "אנושי", "אנושית", "מחקר", "מחקרים", "לחקור", "לבדוק", "בדיקה", "בדיקות",
    "התנהגות", "להתנהג", "קבוצה", "קבוצות", "חברה", "חברות", "תחום", "תחומים", "מסגרת", "מסגרות",
    "בצורה", "באופן", "באופן כללי", "באופן ספציפי", "יחיד", "רבים", "מאפיין", "מאפיינים", "מדע מדויק", "מדע לא מדויק",
    "רווק", "רווקה", "נשוי", "נשואה", "תיאוריה", "תאוריות", "ריאלי", "הומאני", "אתגר", "אתגרים", "לאתגר",
    "עובדה", "עובדות", "מורכב", "מורכבים", "פשוט", "פשוטים", "להשפיע", "השפעה", "השפעות", "ניסוי", "ניסויים",
    "סיבה עיקרית", "סיבה מישנית", "גורם עיקרי", "קורס", "קורסים", "רחב", "צר", "סקרנות", "סקרן", "להסתקרן",
    "קשר", "קשרים", "להתקשר", "קשור"
  ];

  return knownItems.filter(item => text.includes(item));
}

function detectSourceMaterial(text) {
  const match = text.match(/טקסט\s+"([^"]+)"/);
  if (match?.[1]) return match[1];
  if (text.includes("מאפיינים של מדעי החברה")) return "מאפיינים של מדעי החברה";
  return null;
}

function detectExpectedSentenceCount(text) {
  const explicit = text.match(/לנסח\s+(\d+)\s+משפטים/);
  if (explicit?.[1]) return Number(explicit[1]);
  const sentenceFields = text.match(/משפט\s+\d+/g) || [];
  if (sentenceFields.length) return Math.max(...sentenceFields.map(field => Number(field.match(/\d+/)?.[0] || 0)));
  return 10;
}

function detectPattern(stages, taskPatterns = [], projectStructures = []) {
  const ids = stages.map(s => s.stage_id);

  if (projectStructures.some(project => project.project_type === "critical_text_review")) return "critical_text_review";
  if (projectStructures.some(project => project.project_type === "multi_stage_research_project")) return "multi_stage_research_project";

  if (ids.includes("identity") && ids.includes("group") && ids.includes("concept_definition")) return "inductive_social_learning";

  if (taskPatterns.some(task => task.task_type === "vocabulary_sentence_production")) return "language_practice_task";

  return "unknown";
}

function detectStrengths(pattern, taskPatterns = [], projectStructures = []) {
  const strengths = [];

  if (pattern === "inductive_social_learning") strengths.push("student_generated_knowledge", "peer_interaction", "gradual_abstraction");

  if (taskPatterns.some(task => task.task_type === "vocabulary_sentence_production")) strengths.push("contextual_vocabulary_practice", "productive_language_use", "clear_completion_gate");

  if (projectStructures.some(project => project.project_type === "multi_stage_research_project")) {
    strengths.push("problem_based_learning", "critical_information_literacy", "multi_modal_outputs", "stage_based_research_process");
  }

  if (projectStructures.some(project => project.project_type === "critical_text_review")) {
    strengths.push("critical_reading", "structured_review_writing", "oral_expression", "multi_stage_project");
  }

  return strengths;
}

function detectGaps(stages, taskPatterns = [], projectStructures = []) {
  const gaps = [];

  if (taskPatterns.some(task => task.task_type === "vocabulary_sentence_production")) {
    gaps.push({ gap_type: "feedback_policy_missing", note: "Vocabulary sentence tasks need criteria for word usage, grammar, and meaning accuracy." });
  }

  if (projectStructures.some(project => project.project_type === "multi_stage_research_project")) {
    gaps.push({ gap_type: "project_runtime_required", note: "Multi-stage research projects require project-level persistence, gates, and stage locking." });
  }

  if (!stages.length && !taskPatterns.length && !projectStructures.length) {
    gaps.push({ gap_type: "no_structure_detected", note: "No known lesson stage, task pattern, or project structure was detected." });
  }

  return gaps;
}

function mapPatternToTemplate(pattern, taskPatterns = [], projectStructures = []) {
  if (pattern === "critical_text_review") return "critical_review_writing";
  if (pattern === "multi_stage_research_project" || projectStructures.some(p => p.project_type === "multi_stage_research_project")) return "problem_based_inquiry";
  if (pattern === "inductive_social_learning") return "inductive_peer_learning";
  if (taskPatterns.some(task => task.task_type === "vocabulary_sentence_production")) return "scaffolded_skill_building";
  return "generic_template";
}

function buildDecision(pattern, taskPatterns = [], projectStructures = [], context = {}) {
  const hasVocabularyTask = taskPatterns.some(task => task.task_type === "vocabulary_sentence_production");
  const hasResearchProject = projectStructures.some(project => project.project_type === "multi_stage_research_project");

  const decision = {
    template_family: mapPatternToTemplate(pattern, taskPatterns, projectStructures),
    pedagogical_actions: ["preserve_existing_sequence", "add_reflection_closure"],
    context: { ...context }
  };

  if (hasVocabularyTask) {
    decision.transformation_type = "adapt";
    decision.pedagogical_actions.push("add_formative_feedback", "add_guided_sentence_practice", "preserve_student_sentence_production");
    decision.context.target_skills = [...(Array.isArray(context.target_skills) ? context.target_skills : []), "vocabulary_usage", "sentence_production", "academic_hebrew"];
    decision.context.task_patterns = taskPatterns;
  }

  if (hasResearchProject) {
    decision.transformation_type = "rescale";
    decision.pedagogical_actions.push("add_project_stage_gates", "add_source_credibility_check", "add_written_synthesis", "add_oral_presentation");
    decision.context.target_skills = [
      ...(Array.isArray(context.target_skills) ? context.target_skills : []),
      "problem_formulation",
      "information_literacy",
      "source_evaluation",
      "causal_reasoning",
      "solution_comparison",
      "academic_writing",
      "oral_presentation"
    ];
    decision.context.project_structures = projectStructures;
  }

  const hasCriticalReview = projectStructures.some(p => p.project_type === "critical_text_review");
  if (hasCriticalReview) {
    decision.transformation_type = decision.transformation_type || "adapt";
    decision.pedagogical_actions.push("add_critical_reading_stages", "add_review_writing_scaffold", "add_oral_expression_stage");
    decision.context.target_skills = [
      ...(Array.isArray(decision.context.target_skills) ? decision.context.target_skills : []),
      "critical_reading",
      "text_analysis",
      "structured_review_writing",
      "oral_expression"
    ];
  }

  return decision;
}

// ─── New exports (Step 6) ────────────────────────────────────────────────────

const CRITICAL_REVIEW_PROJECT_SIGNALS = [
  'חלקי הביקורת',
  'פתיחה = הפרטים של הטקסט',
  'מה הטענה המרכזית',
  'דעה אישית שלילית',
  'דעה אישית חיובית',
  'מסקנות והמלצות',
  'שלבי כתיבת הביקורת'
];

const CRITICAL_THINKING_LEARNING_PIPELINE_SIGNALS = [
  'אוצר מילים',
  'יובל ושרון',
  'חשיבה ביקורתית',
  'סכמו את הקטע הבא בעזרת AI',
  'שאלו שאלת הבהרה',
  'פייק ניוז',
  'הקליטו את עצמכם'
];

/**
 * Detect learning pipelines present in raw text.
 * Returns an array of pipeline descriptor objects.
 *
 * @param {string} rawText
 * @returns {Array}
 */
export function detectLearningPipelines(rawText = "") {
  const text = rawText || "";
  const pipelines = [];

  const criticalSignalCount = CRITICAL_THINKING_LEARNING_PIPELINE_SIGNALS.filter(s => text.includes(s)).length;
  if (criticalSignalCount >= 2) {
    pipelines.push({
      pipeline_id: "critical_review_learning_pipeline",
      label: "צינור למידה: חשיבה ביקורתית",
      detected_signals: CRITICAL_THINKING_LEARNING_PIPELINE_SIGNALS.filter(s => text.includes(s)),
      required_preparation_outputs: [
        "vocabulary_task_complete",
        "clarifying_question_submitted",
        "critical_reading_complete"
      ]
    });
  }

  // Inductive social sciences pipeline signals
  const socialSignals = ["מי אני", "מי אנחנו", "מה זה מדעי החברה"];
  const socialSignalCount = socialSignals.filter(s => text.includes(s)).length;
  if (socialSignalCount >= 2) {
    pipelines.push({
      pipeline_id: "intro_social_sciences_pipeline",
      label: "צינור למידה: מבוא למדעי החברה",
      detected_signals: socialSignals.filter(s => text.includes(s)),
      required_preparation_outputs: [
        "self_description_submitted",
        "concept_definition_submitted"
      ]
    });
  }

  return pipelines;
}

/**
 * Detect if the text describes a critical text review project.
 *
 * @param {string} rawText
 * @returns {Array}
 */
export function detectCriticalReviewProject(rawText = "") {
  const text = rawText || "";
  const projects = [];

  const signalCount = CRITICAL_REVIEW_PROJECT_SIGNALS.filter(s => text.includes(s)).length;
  if (signalCount >= 2) {
    projects.push({
      project_type: "critical_text_review",
      title: "פרויקט ביקורת טקסט",
      domain: "critical_reading_and_writing",
      stages: buildCriticalReviewProjectStages(),
      required_outputs: [
        "text_details",
        "main_claim",
        "author_values",
        "negative_evaluation",
        "positive_evaluation",
        "conclusion_recommendation",
        "continuous_review_text"
      ],
      output_modes: ["written", "oral"],
      suggested_template_family: "critical_review_writing",
      suggested_bot_roles: [
        "critical_reading_coach",
        "review_writing_coach",
        "oral_expression_coach"
      ],
      suggested_gate: {
        type: "evidence_required",
        evidence: "continuous_review_submitted"
      },
      forbidden_actions: [
        "write_full_review_for_student",
        "give_final_evaluation_text",
        "skip_reading_stages",
        "invent_author_claims",
        "replace_student_critical_voice"
      ]
    });
  }

  return projects;
}

/**
 * Build a bridge descriptor between a learning pipeline and a project.
 *
 * @param {Object} pipeline - Learning pipeline descriptor
 * @param {Object} project  - Project structure descriptor
 * @returns {Object} Bridge descriptor
 */
export function buildLearningToProjectBridge(pipeline, project) {
  return {
    bridge_type: "learning_to_project",
    pipeline_id: pipeline.pipeline_id,
    project_type: project.project_type,
    bridge_mode: "flexible",
    bridge_visibility: "visible",
    transition_tone: "soft_guiding",
    missing_policy: "warn_and_track",
    required_preparation_outputs: pipeline.required_preparation_outputs || []
  };
}

function buildCriticalReviewProjectStages() {
  return [
    {
      stage_id: "identify_text_details",
      label: "שלב 1: פתיחה — פרטי הטקסט",
      type: "text_identification",
      sub_tasks: ["identify_title", "identify_author", "identify_genre", "identify_publication_context"],
      required_outputs: ["text_details"],
      suggested_gate: { type: "completion_required", evidence: "text_details" },
      bot_role: "critical_reading_coach",
      prompt_style: "guided_identification",
      validation_expectations: ["title_present", "author_present"]
    },
    {
      stage_id: "main_claim",
      label: "שלב 2: הטענה המרכזית",
      type: "claim_analysis",
      sub_tasks: ["identify_main_argument", "explain_in_own_words"],
      required_outputs: ["main_claim"],
      suggested_gate: { type: "completion_required", evidence: "main_claim" },
      bot_role: "critical_reading_coach",
      prompt_style: "socratic_question",
      validation_expectations: ["claim_identified", "student_paraphrase_present"]
    },
    {
      stage_id: "author_values",
      label: "שלב 3: ערכי המחבר",
      type: "values_extraction",
      sub_tasks: ["identify_worldview", "identify_assumptions", "connect_to_claim"],
      required_outputs: ["author_values"],
      suggested_gate: { type: "completion_required", evidence: "author_values" },
      bot_role: "critical_reading_coach",
      prompt_style: "reflective_inquiry",
      validation_expectations: ["at_least_one_value_identified"]
    },
    {
      stage_id: "negative_evaluation",
      label: "שלב 4: דעה אישית שלילית",
      type: "critical_evaluation",
      sub_tasks: ["identify_weakness", "justify_critique", "use_evidence_or_reasoning"],
      required_outputs: ["negative_evaluation"],
      suggested_gate: { type: "completion_required", evidence: "negative_evaluation" },
      bot_role: "review_writing_coach",
      prompt_style: "structured_critique",
      validation_expectations: ["critique_present", "reasoning_present"]
    },
    {
      stage_id: "positive_evaluation",
      label: "שלב 5: דעה אישית חיובית",
      type: "positive_evaluation",
      sub_tasks: ["identify_strength", "justify_appreciation", "connect_to_goals"],
      required_outputs: ["positive_evaluation"],
      suggested_gate: { type: "completion_required", evidence: "positive_evaluation" },
      bot_role: "review_writing_coach",
      prompt_style: "structured_appreciation",
      validation_expectations: ["strength_present", "reasoning_present"]
    },
    {
      stage_id: "conclusion_recommendation",
      label: "שלב 6: מסקנות והמלצות",
      type: "synthesis_and_recommendation",
      sub_tasks: ["summarize_evaluation", "recommend_audience", "explain_rationale"],
      required_outputs: ["conclusion_recommendation"],
      suggested_gate: { type: "completion_required", evidence: "conclusion_recommendation" },
      bot_role: "review_writing_coach",
      prompt_style: "synthesis_prompt",
      validation_expectations: ["conclusion_present", "recommendation_present"]
    },
    {
      stage_id: "compose_continuous_review",
      label: "שלב 7: כתיבת ביקורת רציפה",
      type: "academic_writing_synthesis",
      sub_tasks: ["integrate_all_stages", "write_continuous_text", "use_academic_connectors", "record_oral_reading"],
      required_outputs: ["continuous_review_text"],
      suggested_gate: { type: "evidence_required", evidence: "continuous_review_submitted" },
      bot_role: "oral_expression_coach",
      prompt_style: "writing_integration",
      validation_expectations: ["minimum_length", "all_stages_referenced"]
    }
  ];
}
