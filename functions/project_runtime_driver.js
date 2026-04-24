// project_runtime_driver.js
// v1 — Rich state-aware runtime driver.
// Uses process_state_manager helpers and is compatible with process_validation and learning_to_project_bridge.

import { computeMissing, canAdvance, advanceStage } from './process_state_manager.js';
import { applyBridgePolicy } from './learning_to_project_bridge.js';
import { validateStageResponse, selectFeedbackType } from './process_validation.js';

/**
 * Advance the project forward one step based on rich process state.
 *
 * @param {Object} state              - Rich process state (from process_state_manager.js)
 * @param {Object} [options]
 * @param {Object} [options.nodes]       - Array of flow nodes (from project_flow_builder); used as
 *                                         fallback if state does not embed nodes.
 * @param {string} [options.lastAnswer]  - Latest student answer (used for validation)
 * @param {Object} [options.bridgeConfig] - Bridge config (used when crossing phase boundary)
 * @returns {Object} Action object
 */
export function runProjectForward(state, options = {}) {
  const nodes = options.nodes || state.nodes || [];
  const lastAnswer = options.lastAnswer || '';
  const bridgeConfig = options.bridgeConfig || state.bridge_config || null;

  // Resolve current node from rich state
  const currentNode = resolveCurrentNode(state, nodes);

  if (!currentNode) {
    return {
      type: 'missing',
      message: 'לא נמצא שלב פעיל. אנא וודא שהתהליך אותחל כראוי.',
      next_stage: null,
      missing: [],
      validation: {}
    };
  }

  // Bridge check: if we are crossing from learning → project phase
  if (bridgeConfig && state.current?.phase === 'learning') {
    applyBridgePolicy(state, bridgeConfig);
    if (!state.bridge.can_proceed) {
      return {
        type: 'blocked',
        message: state.bridge.message || 'השלם את ההכנות לפני המשך.',
        next_stage: null,
        missing: state.bridge.missing || [],
        validation: {}
      };
    }
    if (state.bridge.status === 'warned') {
      return {
        type: 'bridge_warning',
        message: state.bridge.message,
        next_stage: currentNode.node_id,
        missing: state.bridge.missing || [],
        validation: {}
      };
    }
  }

  // Compute missing outputs for current stage (phase-aware)
  const required = currentNode.required_outputs || [];
  const missing = computeMissing(state, required, { source: currentNode.output_source || 'project' });

  if (missing.length > 0) {
    return {
      type: 'missing',
      message: `כדי להתקדם בשלב "${currentNode.title}" חסרים: ${missing.join(', ')}`,
      next_stage: null,
      missing,
      validation: {}
    };
  }

  // Validate last answer if provided
  if (lastAnswer) {
    const validation = validateStageResponse({
      answer: lastAnswer,
      stage: currentNode,
      expectedOutputs: required
    });

    state.validation.last_result = validation;
    state.validation.last_feedback_type = selectFeedbackType(validation);

    if (validation.completeness !== 'sufficient' || validation.relevance === 'low') {
      state.validation.needs_refinement = true;
      return {
        type: 'needs_refinement',
        message: `יש לשפר את התשובות בשלב "${currentNode.title}" לפני המשך.`,
        next_stage: null,
        missing: [],
        validation
      };
    }

    state.validation.needs_refinement = false;
  }

  // Check if advance is allowed
  if (!canAdvance(state)) {
    return {
      type: 'needs_refinement',
      message: `יש לשפר את התשובות בשלב "${currentNode.title}" לפני המשך.`,
      next_stage: null,
      missing: state.missing || [],
      validation: state.validation?.last_result || {}
    };
  }

  // Advance to next stage
  const nextNode = resolveNextNode(currentNode, nodes);

  if (!nextNode) {
    return {
      type: 'complete',
      message: 'הפרויקט הושלם בהצלחה!',
      next_stage: null,
      missing: [],
      validation: {}
    };
  }

  advanceStage(state, nextNode.node_id || nextNode.stage_id);

  return {
    type: 'advance',
    message: `מעבר לשלב הבא: ${nextNode.title || nextNode.label}`,
    next_stage: nextNode.node_id || nextNode.stage_id,
    missing: [],
    validation: state.validation?.last_result || {}
  };
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function resolveCurrentNode(state, nodes) {
  const stageId = state?.current?.stage_id || state?.active_stage;
  if (!stageId || !nodes.length) return null;
  return nodes.find(n => n.node_id === stageId || n.stage_id === stageId) || null;
}

function resolveNextNode(currentNode, nodes) {
  const idx = nodes.findIndex(n =>
    n.node_id === currentNode.node_id || n.stage_id === currentNode.stage_id
  );
  if (idx === -1 || idx >= nodes.length - 1) return null;
  return nodes[idx + 1];
}
