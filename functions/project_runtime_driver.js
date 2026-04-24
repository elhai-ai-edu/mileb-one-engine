// project_runtime_driver.js

export function runProjectForward(state) {

  const currentNode = state.nodes.find(n => n.node_id === state.active_stage);

  if (!currentNode) return { error: 'No active stage' };

  const missing = detectMissingOutputs(currentNode, state);

  if (missing.length > 0) {
    return {
      type: 'prompt',
      message: `כדי להתקדם בשלב "${currentNode.title}" חסרים: ${missing.join(', ')}`
    };
  }

  if (!validateStage(currentNode, state)) {
    return {
      type: 'refinement',
      message: `יש לשפר את התשובות בשלב "${currentNode.title}" לפני המשך.`
    };
  }

  const nextIndex = state.nodes.findIndex(n => n.node_id === currentNode.node_id) + 1;
  const nextNode = state.nodes[nextIndex];

  if (!nextNode) {
    return {
      type: 'complete',
      message: 'הפרויקט הושלם בהצלחה!'
    };
  }

  state.active_stage = nextNode.node_id;

  return {
    type: 'next',
    message: `מעבר לשלב הבא: ${nextNode.title}`
  };
}

function detectMissingOutputs(stage, state) {
  const outputs = state.outputs || [];
  return stage.required_outputs.filter(r => !outputs.includes(r));
}

function validateStage(stage, state) {
  return true; // v0 placeholder
}
