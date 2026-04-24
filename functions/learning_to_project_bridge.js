// learning_to_project_bridge.js
// Evaluates bridge readiness and applies bridge policy when a student
// transitions from a learning pipeline into a project pipeline.

/**
 * Evaluate whether a student is ready to cross into the project pipeline.
 *
 * @param {Object} state        - Rich process state (from process_state_manager.js)
 * @param {Object} bridgeConfig - Bridge configuration
 * @returns {Object} Readiness result
 */
export function evaluateBridgeReadiness(state, bridgeConfig = {}) {
  const required = bridgeConfig.required_preparation_outputs || [];
  const completed = state?.preparation_outputs || {};

  const missing = required.filter(key => !completed[key]);
  const ready = missing.length === 0;
  const mode = bridgeConfig.bridge_mode || 'flexible';
  const can_proceed = ready || mode === 'flexible';

  const message = buildBridgeTransitionMessage({
    state,
    missing,
    mode,
    visibility: bridgeConfig.bridge_visibility || 'visible'
  });

  return {
    ready,
    missing,
    can_proceed,
    mode,
    message
  };
}

/**
 * Build the bridge transition message shown to the student (if visibility === 'visible').
 *
 * @param {Object} options
 * @param {Object} options.state       - Rich process state
 * @param {Array}  [options.missing]   - List of incomplete preparation output keys
 * @param {string} [options.mode]      - 'flexible' | 'strict'
 * @param {string} [options.visibility] - 'visible' | 'invisible'
 * @returns {string} Message in Hebrew
 */
export function buildBridgeTransitionMessage({ state, missing = [], mode = 'flexible', visibility = 'visible' }) {
  if (visibility === 'invisible') return '';

  if (missing.length === 0) {
    return 'כל ההכנות הושלמו. אפשר להתחיל את הפרויקט!';
  }

  const missingList = missing.join(', ');

  if (mode === 'flexible') {
    return (
      `נראה שאתה מוכן להתחיל, אבל חסרים עדיין כמה חלקים מהשלב ההכנה: ${missingList}.\n` +
      'אפשר להתקדם, וכדאי לזכור להשלים אותם בהמשך.'
    );
  }

  // strict
  return (
    `לפני שמתקדמים לפרויקט, צריך להשלים את החלקים החסרים: ${missingList}.\n` +
    'השלם את כל חלקי ההכנה ואז נוכל להמשיך.'
  );
}

/**
 * Apply bridge policy to the process state.
 * Modifies state.bridge in-place and returns the updated state.
 *
 * @param {Object} state        - Rich process state
 * @param {Object} bridgeConfig - Bridge configuration
 * @returns {Object} Updated state
 */
export function applyBridgePolicy(state, bridgeConfig = {}) {
  const result = evaluateBridgeReadiness(state, bridgeConfig);

  state.bridge = state.bridge || {};
  state.bridge.status = result.ready ? 'ready' : (result.can_proceed ? 'warned' : 'blocked');
  state.bridge.missing = result.missing;
  state.bridge.can_proceed = result.can_proceed;
  state.bridge.mode = result.mode;
  state.bridge.message = result.message;

  // teacher visibility flag
  if (!result.ready && bridgeConfig.bridge_visibility !== 'invisible') {
    state.teacher_view = state.teacher_view || {};
    state.teacher_view.flags = state.teacher_view.flags || [];
    if (!state.teacher_view.flags.includes('bridge_incomplete')) {
      state.teacher_view.flags.push('bridge_incomplete');
    }
  }

  return state;
}
