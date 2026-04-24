// pedagogical_structure_extractor.js
// v0 — rule-based extraction of pedagogical structure from raw content

export function extractPedagogicalStructureFromContent(input) {
  const text = input.raw_text || "";

  const stages = [];

  // --- Rule-based detection ---

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

  const pattern = detectPattern(stages);

  return {
    detected_structure: stages,
    pedagogical_pattern: pattern,
    strengths: detectStrengths(pattern),
    gaps: [],
    recommended_template_family: mapPatternToTemplate(pattern),
    enriched_decision: buildDecision(pattern)
  };
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

function detectPattern(stages) {
  const ids = stages.map(s => s.stage_id);

  if (
    ids.includes("identity") &&
    ids.includes("group") &&
    ids.includes("concept_definition")
  ) {
    return "inductive_social_learning";
  }

  return "unknown";
}

function detectStrengths(pattern) {
  if (pattern === "inductive_social_learning") {
    return [
      "student_generated_knowledge",
      "peer_interaction",
      "gradual_abstraction"
    ];
  }

  return [];
}

function mapPatternToTemplate(pattern) {
  if (pattern === "inductive_social_learning") {
    return "inductive_peer_learning";
  }

  return "generic_template";
}

function buildDecision(pattern) {
  return {
    template_family: mapPatternToTemplate(pattern),
    pedagogical_actions: [
      "preserve_existing_sequence",
      "add_reflection_closure"
    ]
  };
}
