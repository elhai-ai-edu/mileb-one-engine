// project_flow_builder.js

export function buildProjectFlow(projectStructure) {

  const nodes = projectStructure.stages.map((stage, index) => ({
    node_id: `stage_${index + 1}`,
    stage_id: stage.stage_id,
    title: stage.label,
    sub_tasks: stage.sub_tasks,
    required_outputs: stage.required_outputs,
    gate: stage.suggested_gate,
    bot_role: stage.bot_role,
    prompt_style: stage.prompt_style || '',
    validation_expectations: stage.validation_expectations || [],
    runtime: {
      status: 'pending',
      unlocked: index === 0
    }
  }));

  return {
    project_id: `project_${Date.now()}`,
    project_type: projectStructure.project_type || 'generic',
    nodes,
    runtime: {
      active_stage: nodes[0]?.node_id,
      mode: 'gated_progression'
    }
  };
}

/**
 * Build a flow for the critical_text_review project type.
 * Stages are fixed and follow the canonical critical review structure.
 *
 * @returns {Object} Project flow
 */
export function buildCriticalTextReviewFlow() {
  const stages = [
    {
      stage_id: 'identify_text_details',
      label: 'שלב 1: פתיחה — פרטי הטקסט',
      sub_tasks: ['identify_title', 'identify_author', 'identify_genre', 'identify_publication_context'],
      required_outputs: ['text_details'],
      suggested_gate: { type: 'completion_required', evidence: 'text_details' },
      bot_role: 'critical_reading_coach',
      prompt_style: 'guided_identification',
      validation_expectations: ['title_present', 'author_present']
    },
    {
      stage_id: 'main_claim',
      label: 'שלב 2: הטענה המרכזית',
      sub_tasks: ['identify_main_argument', 'explain_in_own_words'],
      required_outputs: ['main_claim'],
      suggested_gate: { type: 'completion_required', evidence: 'main_claim' },
      bot_role: 'critical_reading_coach',
      prompt_style: 'socratic_question',
      validation_expectations: ['claim_identified', 'student_paraphrase_present']
    },
    {
      stage_id: 'author_values',
      label: 'שלב 3: ערכי המחבר',
      sub_tasks: ['identify_worldview', 'identify_assumptions', 'connect_to_claim'],
      required_outputs: ['author_values'],
      suggested_gate: { type: 'completion_required', evidence: 'author_values' },
      bot_role: 'critical_reading_coach',
      prompt_style: 'reflective_inquiry',
      validation_expectations: ['at_least_one_value_identified']
    },
    {
      stage_id: 'negative_evaluation',
      label: 'שלב 4: דעה אישית שלילית',
      sub_tasks: ['identify_weakness', 'justify_critique', 'use_evidence_or_reasoning'],
      required_outputs: ['negative_evaluation'],
      suggested_gate: { type: 'completion_required', evidence: 'negative_evaluation' },
      bot_role: 'review_writing_coach',
      prompt_style: 'structured_critique',
      validation_expectations: ['critique_present', 'reasoning_present']
    },
    {
      stage_id: 'positive_evaluation',
      label: 'שלב 5: דעה אישית חיובית',
      sub_tasks: ['identify_strength', 'justify_appreciation', 'connect_to_goals'],
      required_outputs: ['positive_evaluation'],
      suggested_gate: { type: 'completion_required', evidence: 'positive_evaluation' },
      bot_role: 'review_writing_coach',
      prompt_style: 'structured_appreciation',
      validation_expectations: ['strength_present', 'reasoning_present']
    },
    {
      stage_id: 'conclusion_recommendation',
      label: 'שלב 6: מסקנות והמלצות',
      sub_tasks: ['summarize_evaluation', 'recommend_audience', 'explain_rationale'],
      required_outputs: ['conclusion_recommendation'],
      suggested_gate: { type: 'completion_required', evidence: 'conclusion_recommendation' },
      bot_role: 'review_writing_coach',
      prompt_style: 'synthesis_prompt',
      validation_expectations: ['conclusion_present', 'recommendation_present']
    },
    {
      stage_id: 'compose_continuous_review',
      label: 'שלב 7: כתיבת ביקורת רציפה',
      sub_tasks: ['integrate_all_stages', 'write_continuous_text', 'use_academic_connectors', 'record_oral_reading'],
      required_outputs: ['continuous_review_text'],
      suggested_gate: { type: 'evidence_required', evidence: 'continuous_review_submitted' },
      bot_role: 'oral_expression_coach',
      prompt_style: 'writing_integration',
      validation_expectations: ['minimum_length', 'all_stages_referenced']
    }
  ];

  return buildProjectFlow({ project_type: 'critical_text_review', stages });
}
