// pedagogical_structure_extractor.js
// v0.2 — rule-based extraction of pedagogical structure + task/project patterns from raw content

export function extractPedagogicalStructureFromContent(input = {}) {
  const text = input.raw_text || "";

  const stages = detectStages(text);
  const taskPatterns = detectTaskPatterns(text);
  const projectStructures = detectProjectStructures(text);
  const pattern = detectPattern(stages, taskPatterns, projectStructures);

  return {
    detected_structure: stages,
    task_patterns: taskPatterns,
    project_structures: projectStructures,
    pedagogical_pattern: pattern,
    strengths: detectStrengths(pattern, taskPatterns, projectStructures),
    gaps: detectGaps(stages, taskPatterns, projectStructures),
    recommended_template_family: mapPatternToTemplate(pattern, taskPatterns, projectStructures),
    enriched_decision: buildDecision(pattern, taskPatterns, projectStructures, input.context || {})
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
  if (pattern === "multi_stage_research_project" || projectStructures.length) return "problem_based_inquiry";
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

  return decision;
}
