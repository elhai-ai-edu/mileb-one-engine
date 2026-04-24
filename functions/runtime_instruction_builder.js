// runtime_instruction_builder.js
// Translates current process state + runtime action into a model-facing instruction layer.
// Does NOT own pedagogy — it translates state decisions into safe model directives.

/**
 * Build a runtime instruction layer from state + action.
 *
 * @param {Object} options
 * @param {Object} options.state   - Rich process state (from process_state_manager.js)
 * @param {Object} options.action  - Current runtime action (from project_runtime_driver.js)
 * @param {Object} [options.context] - Optional extra context (course, student, config)
 * @returns {Object} Runtime instruction layer
 */
export function buildRuntimeInstructionLayer({ state, action, context = {} }) {
  const phase = state?.current?.phase || 'learning';
  const stage_id = state?.current?.stage_id || 'unknown';
  const action_type = action?.type || 'unknown';

  const system_addendum = buildSystemAddendum({ phase, stage_id, action_type, action, state });
  const stage_prompt = buildStagePrompt({ action, state });
  const allowed_actions = buildAllowedActions(action_type);
  const forbidden_actions = buildForbiddenActions();
  const response_style = buildResponseStyle(action_type);

  return {
    system_addendum,
    stage_prompt,
    allowed_actions,
    forbidden_actions,
    response_style,
    runtime_policies: {
      no_skip: true,
      preserve_student_agency: true,
      no_full_solution: true,
      require_attempt_before_feedback: true
    },
    runtime_trace: {
      phase,
      stage_id,
      action_type
    }
  };
}

function buildSystemAddendum({ phase, stage_id, action_type, action, state }) {
  const lines = [
    `שלב נוכחי: ${stage_id} | שלב תהליך: ${phase} | פעולה: ${action_type}`
  ];

  if (action_type === 'missing') {
    const missing = action?.missing || state?.missing || [];
    if (missing.length > 0) {
      lines.push(`חסרות תוצרים: ${missing.join(', ')}`);
      lines.push('בקש מהסטודנט להשלים את החלקים החסרים לפני המשך.');
    }
  }

  if (action_type === 'needs_refinement') {
    lines.push('התשובה האחרונה דורשת שכלול. הנח את הסטודנט לחדד בעצמו — אל תכתוב עבורו.');
  }

  if (action_type === 'bridge_warning') {
    lines.push('הסטודנט עובר לשלב הפרויקט. חלק מהתנאים עדיין לא הושלמו.');
    lines.push('אפשר להמשיך בגמישות, אך כדאי להזכיר את החסרים.');
  }

  if (action_type === 'blocked') {
    lines.push('המעבר לשלב הבא חסום עד להשלמת התנאים הנדרשים. הסבר בעדינות מה נדרש.');
  }

  if (action_type === 'complete') {
    lines.push('התהליך הושלם. אפשר לאשר לסטודנט ולהציע סיכום.');
  }

  return lines.join('\n');
}

function buildStagePrompt({ action, state }) {
  if (!action) return '';

  const stage_id = state?.current?.stage_id || '';
  const message = action.message || '';

  if (action.type === 'missing') {
    return `${message}\nבקש מהסטודנט לענות על החלקים החסרים.`;
  }

  if (action.type === 'needs_refinement') {
    const fb = state?.validation?.last_feedback_type || 'expand';
    return `${message}\nהצע לסטודנט לחדד: ${mapFeedbackTypeToHint(fb)}.`;
  }

  if (action.type === 'advance') {
    return action.next_stage
      ? `עבר לשלב: ${action.next_stage}. ${message}`
      : message;
  }

  if (action.type === 'bridge_warning') {
    return message;
  }

  if (action.type === 'blocked') {
    return message;
  }

  if (action.type === 'complete') {
    return message;
  }

  return message;
}

function mapFeedbackTypeToHint(feedbackType) {
  const hints = {
    expand: 'הרחב את תשובתך',
    refine: 'חדד את הניסוח',
    reconsider: 'שקול שוב את הגישה',
    add_missing_dimension: 'הוסף ממד שחסר'
  };
  return hints[feedbackType] || 'הרחב את תשובתך';
}

function buildAllowedActions(actionType) {
  const base = [
    'ask_clarifying_question',
    'offer_hint',
    'reflect_back_student_words',
    'ask_for_missing_output',
    'ask_student_to_try'
  ];

  if (actionType === 'advance' || actionType === 'complete') {
    base.push('acknowledge_progress', 'summarize_stage', 'transition_to_next');
  }

  if (actionType === 'needs_refinement') {
    base.push('ask_to_expand', 'ask_to_refine', 'point_to_missing_dimension');
  }

  if (actionType === 'bridge_warning') {
    base.push('soft_warn_incomplete', 'allow_progress_with_note');
  }

  return base;
}

function buildForbiddenActions() {
  return [
    'write_full_answer_for_student',
    'skip_stage',
    'substitute_student_work',
    'invent_sources',
    'fabricate_information',
    'grade_without_rubric',
    'use_evaluative_tone_without_rubric',
    'bypass_kernel_rules'
  ];
}

function buildResponseStyle(actionType) {
  return {
    tone: actionType === 'blocked' ? 'firm_but_kind' : 'soft_guiding',
    structure: 'short_stage_aware',
    avoid_grading_tone: true,
    language: 'hebrew',
    response_length: 'brief_focused',
    soft_validation_phrases: [
      'נראה שיש כאן התחלה...',
      'אפשר לחדד...',
      'חסר לי דבר אחד...',
      'מה דעתך להוסיף...',
      'אפשר להרחיב על...'
    ]
  };
}
