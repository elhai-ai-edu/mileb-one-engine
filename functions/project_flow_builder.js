// project_flow_builder.js

export function buildProjectFlow(projectStructure) {

  const nodes = projectStructure.stages.map((stage, index) => ({
    node_id: `stage_${index + 1}`,
    stage_id: stage.stage_id,
    title: stage.label,
    sub_tasks: stage.sub_tasks,
    required_outputs: stage.required_outputs,
    output_source: stage.output_source,
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
 * Build a flow for the personal_project type.
 * Stages are fixed and follow the canonical 7-step personal project structure.
 * Stage IDs mirror the validation profiles in process_validation.js.
 *
 * @returns {Object} Project flow
 */
export function buildPersonalProjectFlow() {
  const stages = [
    {
      stage_id: 'problem_definition',
      label: 'שלב 1: בחירת בעיה',
      sub_tasks: ['identify_problem', 'explain_importance', 'identify_affected'],
      required_outputs: ['problem_definition'],
      output_source: 'project',
      suggested_gate: { type: 'completion_required', evidence: 'problem_definition' },
      bot_role: 'problem_framing_coach',
      prompt_style: 'guided_identification',
      validation_expectations: ['problem_present', 'importance_present', 'affected_present'],
      min_length: 50
    },
    {
      stage_id: 'prior_attempts',
      label: 'שלב 2: ניסיונות קדומים',
      sub_tasks: ['describe_past_attempts', 'explain_partial_success', 'identify_blockers'],
      required_outputs: ['prior_attempts'],
      output_source: 'project',
      suggested_gate: { type: 'completion_required', evidence: 'prior_attempts' },
      bot_role: 'problem_framing_coach',
      prompt_style: 'reflective_inquiry',
      validation_expectations: ['attempt_described', 'blocker_identified'],
      min_length: 60
    },
    {
      stage_id: 'information_sources',
      label: 'שלב 3: מקורות מידע',
      sub_tasks: ['gather_sources', 'summarize_each_source', 'connect_to_problem'],
      required_outputs: ['information_sources'],
      output_source: 'project',
      suggested_gate: { type: 'completion_required', evidence: 'information_sources' },
      bot_role: 'research_coach',
      prompt_style: 'source_reflection',
      validation_expectations: ['source_markers_present', 'multiple_sources'],
      min_length: 80
    },
    {
      stage_id: 'two_alternatives',
      label: 'שלב 4: שתי אלטרנטיבות',
      sub_tasks: ['describe_option_a', 'describe_option_b', 'compare_pros_cons'],
      required_outputs: ['two_alternatives'],
      output_source: 'project',
      suggested_gate: { type: 'completion_required', evidence: 'two_alternatives' },
      bot_role: 'critical_thinking_coach',
      prompt_style: 'comparative_analysis',
      validation_expectations: ['two_options_present', 'pros_cons_present'],
      min_length: 100
    },
    {
      stage_id: 'solution_choice',
      label: 'שלב 5: בחירת פתרון',
      sub_tasks: ['state_chosen_solution', 'justify_choice', 'connect_to_prior_stages'],
      required_outputs: ['solution_choice'],
      output_source: 'project',
      suggested_gate: { type: 'completion_required', evidence: 'solution_choice' },
      bot_role: 'decision_coach',
      prompt_style: 'structured_reasoning',
      validation_expectations: ['choice_stated', 'reasoning_present'],
      min_length: 60
    },
    {
      stage_id: 'summary_document',
      label: 'שלב 6: כתיבת מסמך',
      sub_tasks: ['integrate_all_stages', 'write_coherent_document', 'include_all_components'],
      required_outputs: ['summary_document'],
      output_source: 'project',
      suggested_gate: { type: 'evidence_required', evidence: 'summary_document_submitted' },
      bot_role: 'writing_coach',
      prompt_style: 'writing_integration',
      validation_expectations: ['minimum_length', 'all_stages_referenced'],
      min_length: 300
    },
    {
      stage_id: 'presentation_abstract',
      label: 'שלב 7: הצגה',
      sub_tasks: ['write_abstract', 'include_problem_and_solution', 'reflect_on_learning'],
      required_outputs: ['presentation_abstract'],
      output_source: 'project',
      suggested_gate: { type: 'completion_required', evidence: 'presentation_abstract' },
      bot_role: 'presentation_coach',
      prompt_style: 'synthesis_prompt',
      validation_expectations: ['abstract_present', 'learning_reflection_present'],
      min_length: 100
    }
  ];

  return buildProjectFlow({ project_type: 'personal_project', stages });
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
      output_source: 'project',
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
      output_source: 'project',
      suggested_gate: { type: 'completion_required', evidence: 'main_claim' },
      bot_role: 'critical_reading_coach',
      prompt_style: 'socratic_question',
      prompts: [
        'מה הרעיון המרכזי שהכותב מנסה להעביר?',
        'מה גרם לך לחשוב שזה הרעיון המרכזי?'
      ],
      validation_expectations: ['claim_identified', 'student_paraphrase_present']
    },
    {
      stage_id: 'author_values',
      label: 'שלב 3: ערכי המחבר',
      sub_tasks: ['identify_worldview', 'identify_assumptions', 'connect_to_claim'],
      required_outputs: ['author_values'],
      output_source: 'project',
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
      output_source: 'project',
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
      output_source: 'project',
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
      output_source: 'project',
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
      output_source: 'project',
      suggested_gate: { type: 'evidence_required', evidence: 'continuous_review_submitted' },
      bot_role: 'oral_expression_coach',
      prompt_style: 'writing_integration',
      validation_expectations: ['minimum_length', 'all_stages_referenced']
    }
  ];

  return buildProjectFlow({ project_type: 'critical_text_review', stages });
}
