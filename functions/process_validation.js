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

/**
 * Return stage-specific validation profile for Hebrew classroom answers.
 * Returns null for unknown stage ids (fallback to generic logic).
 *
 * @param {string} stageId
 * @returns {Object|null}
 */
function getStageValidationProfile(stageId) {
  const profiles = {
    identify_text_details: {
      relevance_hints: ['שם', 'כותרת', 'מחבר', 'כותב', 'פורסם', 'תאריך', 'שנה', 'מקור', 'אתר', 'עיתון'],
      completeness_patterns: [/שם[^:]*:/, /מחבר[^:]*:/, /\d{4}/, /פורסם/, /כותב/],
      min_matches: 2,
      min_length: 0
    },
    main_claim: {
      relevance_hints: ['טוען', 'טענה', 'לדעתו', 'לדעתה', 'הכותב חושב', 'הטקסט אומר', 'המסר', 'המטרה'],
      completeness_patterns: [/טוע|טענ|לדעת|חושב|אומר|מסר|מטרה/],
      min_matches: 1,
      min_length: 25
    },
    author_values: {
      relevance_hints: ['מאמין', 'חושב', 'חשוב לו', 'ערך', 'תפיסה', 'גישה', 'רוצה', 'מעדיף'],
      completeness_patterns: [/מאמין|חושב|ערך|תפיס|גישה|רוצ|מעדיף/],
      min_matches: 1,
      min_length: 0
    },
    negative_evaluation: {
      relevance_hints: ['לא אהבתי', 'בעיה', 'חלש', 'חסר', 'לא ברור', 'לא מדויק', 'משעמם', 'לא אובייקטיבי', 'מוגזם'],
      completeness_patterns: [/לא אהב|בעי|חלש|חסר|לא ברור|לא מדוי|משעמ|לא אובייקט|מוגזם/],
      reasoning_hints: ['כי', 'מפני ש', 'בגלל', 'לדעתי'],
      min_matches: 1,
      requires_reasoning: true,
      min_length: 0
    },
    positive_evaluation: {
      relevance_hints: ['אהבתי', 'חשוב', 'מעניין', 'ברור', 'מעמיק', 'טוב', 'משכנע', 'יפה', 'מוצלח'],
      completeness_patterns: [/אהבתי|חשוב|מעניין|ברור|מעמיק|טוב|משכנע|יפה|מוצלח/],
      reasoning_hints: ['כי', 'מפני ש', 'בגלל', 'לדעתי'],
      min_matches: 1,
      requires_reasoning: true,
      min_length: 0
    },
    conclusion_recommendation: {
      relevance_hints: ['לסיכום', 'לכן', 'ממליץ', 'ממליצה', 'כדאי', 'לא כדאי', 'חשוב לקרוא', 'לא חובה'],
      completeness_patterns: [/לסיכום|לכן|ממליצ|כדאי|לא כדאי|חשוב לקרוא|לא חובה/],
      min_matches: 1,
      min_length: 0
    },
    compose_continuous_review: {
      relevance_hints: [],
      completeness_patterns: [],
      min_matches: 0,
      min_length: 250,
      review_parts_hints: ['טוען', 'טענה', 'אהבתי', 'לא אהבתי', 'לסיכום', 'ממליץ', 'ממליצה', 'בעיה', 'חשוב'],
      min_review_parts: 3
    }
  };
  return profiles[stageId] || null;
}

function assessRelevance(answer, stage) {
  const text = answer || '';
  const stageId = stage.stage_id || '';
  const profile = getStageValidationProfile(stageId);

  if (profile) {
    const hints = profile.relevance_hints || [];
    if (!hints.length) return 'partial';
    const matchCount = hints.filter(h => text.includes(h)).length;
    if (matchCount >= profile.min_matches && matchCount >= Math.ceil(hints.length * 0.2)) return 'high';
    if (matchCount >= 1) return 'partial';
    return 'low';
  }

  // Fallback: generic keyword matching
  const keywords = stage.relevance_keywords || stage.required_outputs || [];
  if (!keywords.length) return 'partial';

  const lowerText = text.toLowerCase();
  const matchCount = keywords.filter(kw => lowerText.includes((kw || '').toLowerCase())).length;
  const ratio = matchCount / keywords.length;

  if (ratio >= 0.6) return 'high';
  if (ratio >= 0.2) return 'partial';
  return 'low';
}

function assessCompleteness(answer, stage, expectedOutputs) {
  const text = answer || '';
  const stageId = stage.stage_id || '';
  const profile = getStageValidationProfile(stageId);

  if (profile) {
    if (!hasContent(answer)) return { completeness: 'missing', missing_dimensions: [] };

    // Special case: compose_continuous_review needs minimum length + multiple review parts
    if (stageId === 'compose_continuous_review') {
      if (text.trim().length < profile.min_length) {
        return { completeness: 'partial', missing_dimensions: ['אורך מינימלי'] };
      }
      const partsFound = (profile.review_parts_hints || []).filter(h => text.includes(h)).length;
      if (partsFound < profile.min_review_parts) {
        return { completeness: 'partial', missing_dimensions: ['חלקי ביקורת'] };
      }
      return { completeness: 'sufficient', missing_dimensions: [] };
    }

    // Check minimum length requirement
    if (profile.min_length && text.trim().length < profile.min_length) {
      return { completeness: 'partial', missing_dimensions: [] };
    }

    // Check pattern matches
    const patterns = profile.completeness_patterns || [];
    const patternMatch = patterns.length === 0 || patterns.some(p => p.test(text));

    // Check reasoning if required
    const reasoningOk = !profile.requires_reasoning ||
      (profile.reasoning_hints || []).some(h => text.includes(h));

    if (patternMatch && reasoningOk) return { completeness: 'sufficient', missing_dimensions: [] };
    if (patternMatch && !reasoningOk) return { completeness: 'partial', missing_dimensions: ['נימוק'] };
    return { completeness: 'partial', missing_dimensions: [] };
  }

  // Fallback: generic output-key matching
  const outputs = expectedOutputs.length ? expectedOutputs : (stage.required_outputs || []);

  if (!outputs.length) {
    if (!hasContent(answer)) return { completeness: 'missing', missing_dimensions: [] };
    if (answer.trim().length < 40) return { completeness: 'partial', missing_dimensions: [] };
    return { completeness: 'sufficient', missing_dimensions: [] };
  }

  const lowerText = text.toLowerCase();
  const missing_dimensions = outputs.filter(o => !lowerText.includes((o || '').toLowerCase().replace(/_/g, ' ')));
  const found = outputs.length - missing_dimensions.length;
  const ratio = found / outputs.length;

  if (ratio >= 0.8) return { completeness: 'sufficient', missing_dimensions };
  if (ratio >= 0.3) return { completeness: 'partial', missing_dimensions };
  return { completeness: 'missing', missing_dimensions };
}
