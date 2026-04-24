// pedagogical_structure_extractor.js
// v0.1 — rule-based extraction of pedagogical structure + task patterns from raw content

export function extractPedagogicalStructureFromContent(input = {}) {
  const text = input.raw_text || "";

  const stages = detectStages(text);
  const taskPatterns = detectTaskPatterns(text);
  const pattern = detectPattern(stages, taskPatterns);

  return {
    detected_structure: stages,
    task_patterns: taskPatterns,
    pedagogical_pattern: pattern,
    strengths: detectStrengths(pattern, taskPatterns),
    gaps: detectGaps(stages, taskPatterns),
    recommended_template_family: mapPatternToTemplate(pattern, taskPatterns),
    enriched_decision: buildDecision(pattern, taskPatterns, input.context || {})
  };
}

function detectStages(text) {
  const stages = [];

  if (text.includes("מי אני")) {
    stages.push(buildStage("identity", "מי אני", "personal_expression", "self_description"));
  }

  if (text.includes("מי אנחנו")) {
    stages.push(buildStage("group", "מי אנחנו", "social_construction", "group_characteristics"));
  }

  if (text.includes("מי זו עליזה")) {
    stages.push(buildStage("concept_bridge", "מי זו עליזה", "narrative_abstraction", "explain_character"));
  }

  if (text.includes("מה זה מדעי החברה")) {
    stages.push(buildStage("concept_definition", "מה זה מדעי החברה", "student_generated_concept", "concept_definition"));
  }

  if (text.includes("אוצר מילים")) {
    stages.push(buildStage("language", "אוצר מילים", "linguistic_processing", "vocabulary_usage"));
  }

  if (text.includes("מה למדתי") || text.includes("שיעורי בית")) {
    stages.push(buildStage("reflection", "רפלקציה", "metacognitive_reflection", "summary_output"));
  }

  return stages;
}

function buildStage(id, label, type, evidence) {
  return {
    stage_id: id,
    label,
    type,
    suggested_gate: {
      type: "completion_required",
      evidence
    }
  };
}

export function detectTaskPatterns(rawText = "") {
  const text = rawText || "";
  const tasks = [];

  const isVocabularySentenceTask =
    text.includes("אוצר מילים") &&
    (text.includes("לנסח 10 משפטים") || text.includes("10 משפטים") || text.includes("משפט 10")) &&
    (text.includes("כל משפט כולל") || text.includes("לפחות מילה אחת") || text.includes("משפט 1"));

  if (isVocabularySentenceTask) {
    const vocabularyItems = extractVocabularyItems(text);

    tasks.push({
      task_type: "vocabulary_sentence_production",
      title: "תרגיל אוצר מילים",
      domain: "academic_hebrew_social_sciences",
      source_material: detectSourceMaterial(text),
      expected_output_count: detectExpectedSentenceCount(text),
      required_output_type: "sentence",
      vocabulary_items: vocabularyItems,
      assessment_mode: "formative_language_practice",
      develops: [
        "vocabulary_usage_in_context",
        "sentence_production",
        "academic_hebrew_fluency",
        "semantic_distinction"
      ],
      suggested_gate: {
        type: "completion_required",
        evidence: "10_sentences_submitted"
      },
      suggested_bot_role: "vocabulary_practice_coach",
      support_mode: "guided_sentence_practice",
      allowed_actions: [
        "clarify_word_meaning",
        "ask_student_to_try_sentence",
        "check_word_usage",
        "suggest_correction_hint",
        "distinguish_similar_meanings"
      ],
      forbidden_actions: [
        "write_all_10_sentences_for_student",
        "replace_student_sentence_production",
        "give_final_answer_before_attempt"
      ]
    });
  }

  return tasks;
}

function extractVocabularyItems(text) {
  const knownItems = [
    "לעסוק", "עוסק", "עוסקים",
    "אנושי", "אנושית",
    "מחקר", "מחקרים", "לחקור",
    "לבדוק", "בדיקה", "בדיקות",
    "התנהגות", "להתנהג",
    "קבוצה", "קבוצות",
    "חברה", "חברות",
    "תחום", "תחומים",
    "מסגרת", "מסגרות",
    "בצורה", "באופן", "באופן כללי", "באופן ספציפי",
    "יחיד", "רבים",
    "מאפיין", "מאפיינים",
    "מדע מדויק", "מדע לא מדויק",
    "רווק", "רווקה", "נשוי", "נשואה",
    "תיאוריה", "תאוריות",
    "ריאלי", "הומאני",
    "אתגר", "אתגרים", "לאתגר",
    "עובדה", "עובדות",
    "מורכב", "מורכבים", "פשוט", "פשוטים",
    "להשפיע", "השפעה", "השפעות",
    "ניסוי", "ניסויים",
    "סיבה עיקרית", "סיבה מישנית", "גורם עיקרי",
    "קורס", "קורסים",
    "רחב", "צר",
    "סקרנות", "סקרן", "להסתקרן",
    "קשר", "קשרים", "להתקשר", "קשור"
  ];

  return knownItems.filter(item => text.includes(item));
}

function detectSourceMaterial(text) {
  const match = text.match(/טקסט\s+"([^"]+)"/);
  if (match?.[1]) return match[1];

  if (text.includes("מאפיינים של מדעי החברה")) {
    return "מאפיינים של מדעי החברה";
  }

  return null;
}

function detectExpectedSentenceCount(text) {
  const explicit = text.match(/לנסח\s+(\d+)\s+משפטים/);
  if (explicit?.[1]) return Number(explicit[1]);

  const sentenceFields = text.match(/משפט\s+\d+/g) || [];
  if (sentenceFields.length) return Math.max(...sentenceFields.map(field => Number(field.match(/\d+/)?.[0] || 0)));

  return 10;
}

function detectPattern(stages, taskPatterns = []) {
  const ids = stages.map(s => s.stage_id);

  if (
    ids.includes("identity") &&
    ids.includes("group") &&
    ids.includes("concept_definition")
  ) {
    return "inductive_social_learning";
  }

  if (taskPatterns.some(task => task.task_type === "vocabulary_sentence_production")) {
    return "language_practice_task";
  }

  return "unknown";
}

function detectStrengths(pattern, taskPatterns = []) {
  const strengths = [];

  if (pattern === "inductive_social_learning") {
    strengths.push(
      "student_generated_knowledge",
      "peer_interaction",
      "gradual_abstraction"
    );
  }

  if (taskPatterns.some(task => task.task_type === "vocabulary_sentence_production")) {
    strengths.push(
      "contextual_vocabulary_practice",
      "productive_language_use",
      "clear_completion_gate"
    );
  }

  return strengths;
}

function detectGaps(stages, taskPatterns = []) {
  const gaps = [];

  if (taskPatterns.some(task => task.task_type === "vocabulary_sentence_production")) {
    gaps.push({
      gap_type: "feedback_policy_missing",
      note: "Vocabulary sentence tasks need criteria for word usage, grammar, and meaning accuracy."
    });
  }

  if (!stages.length && !taskPatterns.length) {
    gaps.push({
      gap_type: "no_structure_detected",
      note: "No known lesson stage or task pattern was detected."
    });
  }

  return gaps;
}

function mapPatternToTemplate(pattern, taskPatterns = []) {
  if (pattern === "inductive_social_learning") {
    return "inductive_peer_learning";
  }

  if (taskPatterns.some(task => task.task_type === "vocabulary_sentence_production")) {
    return "scaffolded_skill_building";
  }

  return "generic_template";
}

function buildDecision(pattern, taskPatterns = [], context = {}) {
  const hasVocabularyTask = taskPatterns.some(task => task.task_type === "vocabulary_sentence_production");

  const decision = {
    template_family: mapPatternToTemplate(pattern, taskPatterns),
    pedagogical_actions: [
      "preserve_existing_sequence",
      "add_reflection_closure"
    ],
    context: {
      ...context
    }
  };

  if (hasVocabularyTask) {
    decision.transformation_type = "adapt";
    decision.pedagogical_actions.push(
      "add_formative_feedback",
      "add_guided_sentence_practice",
      "preserve_student_sentence_production"
    );
    decision.context.target_skills = [
      ...(Array.isArray(context.target_skills) ? context.target_skills : []),
      "vocabulary_usage",
      "sentence_production",
      "academic_hebrew"
    ];
    decision.context.task_patterns = taskPatterns;
  }

  return decision;
}
