// process_validation.js
// Smart (non-judgmental) validation of student stage responses.
// Does NOT grade. Uses soft, agency-preserving language.

/**
 * Validate a student's response against expected stage outputs.
 *
 * @param {Object} options
 * @param {string} options.answer            - Raw student answer text
 * @param {Object} options.stage             - Current stage definition (from project_flow_builder)
 * @param {Array}  [options.expectedOutputs] - Expected output keys for this stage
 * @returns {Object} Validation result
 */
export function validateStageResponse({ answer = '', stage = {}, expectedOutputs = [] }) {
  const has_content = hasContent(answer);
  const relevance = assessRelevance(answer, stage);
  const { completeness, missing_dimensions } = assessCompleteness(answer, stage, expectedOutputs);
  const feedback_type = selectFeedbackType({ has_content, relevance, completeness, missing_dimensions });

  return {
    has_content,
    relevance,
    completeness,
    missing_dimensions,
    feedback_type
  };
}

/**
 * Select the appropriate feedback type from a validation result.
 *
 * @param {Object} validation - Output of validateStageResponse
 * @returns {string} 'expand' | 'refine' | 'reconsider' | 'add_missing_dimension'
 */
export function selectFeedbackType(validation) {
  if (!validation.has_content) return 'reconsider';
  if (validation.completeness === 'missing') return 'reconsider';
  if (validation.missing_dimensions && validation.missing_dimensions.length > 0) return 'add_missing_dimension';
  if (validation.relevance === 'low') return 'reconsider';
  if (validation.completeness === 'partial' && validation.relevance === 'partial') return 'expand';
  if (validation.completeness === 'partial') return 'expand';
  if (validation.relevance === 'partial') return 'refine';
  return 'expand';
}

/**
 * Build the Hebrew feedback message for the student.
 * Does NOT grade. Does NOT say "correct" or "incorrect".
 *
 * @param {Object} validation - Output of validateStageResponse
 * @param {Object} stage      - Current stage definition
 * @returns {string} Hebrew feedback message
 */
export function buildValidationFeedback(validation, stage = {}) {
  const stageLabel = stage.label || stage.title || 'השלב הנוכחי';
  const feedbackType = validation.feedback_type || selectFeedbackType(validation);

  if (feedbackType === 'reconsider') {
    if (!validation.has_content) {
      return `נראה שעדיין לא הגבת ל${stageLabel}. מה דעתך לנסות ולכתוב משהו?`;
    }
    return `אפשר לשקול שוב את הגישה ב${stageLabel}. מה חשבת על...?`;
  }

  if (feedbackType === 'add_missing_dimension') {
    const missing = validation.missing_dimensions || [];
    if (missing.length > 0) {
      return `נראה שיש כאן התחלה טובה, אבל חסר לי עוד ממד אחד: ${missing.join(', ')}. אפשר להוסיף?`;
    }
    return 'נראה שיש כאן התחלה. חסר עוד ממד אחד — אפשר לחדד?';
  }

  if (feedbackType === 'expand') {
    return `נראה שיש כאן התחלה... אפשר להרחיב קצת יותר על ${stageLabel}?`;
  }

  if (feedbackType === 'refine') {
    return `אפשר לחדד את הניסוח ב${stageLabel}. מה היית משנה?`;
  }

  return 'נראה שיש כאן התחלה... אפשר לחדד?';
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function hasContent(answer) {
  if (typeof answer !== 'string') return false;
  return answer.trim().length > 5;
}

function assessRelevance(answer, stage) {
  const text = (answer || '').toLowerCase();

  // Use keywords from the stage if present
  const keywords = stage.relevance_keywords || stage.required_outputs || [];
  if (!keywords.length) return 'partial'; // default when no keywords defined

  const matchCount = keywords.filter(kw => text.includes((kw || '').toLowerCase())).length;
  const ratio = matchCount / keywords.length;

  if (ratio >= 0.6) return 'high';
  if (ratio >= 0.2) return 'partial';
  return 'low';
}

function assessCompleteness(answer, stage, expectedOutputs) {
  const text = (answer || '').toLowerCase();
  const outputs = expectedOutputs.length ? expectedOutputs : (stage.required_outputs || []);

  if (!outputs.length) {
    // No outputs defined — assess by length alone
    if (!hasContent(answer)) return { completeness: 'missing', missing_dimensions: [] };
    if (answer.trim().length < 40) return { completeness: 'partial', missing_dimensions: [] };
    return { completeness: 'sufficient', missing_dimensions: [] };
  }

  const missing_dimensions = outputs.filter(o => !text.includes((o || '').toLowerCase().replace(/_/g, ' ')));
  const found = outputs.length - missing_dimensions.length;
  const ratio = found / outputs.length;

  if (ratio >= 0.8) return { completeness: 'sufficient', missing_dimensions };
  if (ratio >= 0.3) return { completeness: 'partial', missing_dimensions };
  return { completeness: 'missing', missing_dimensions };
}
