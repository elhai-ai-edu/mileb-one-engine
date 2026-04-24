// process_state_manager.js

export function createInitialProcessState(config = {}) {
  return {
    process_id: `process_${Date.now()}`,
    student_id: config.student_id || 'anonymous',

    pipeline_id: config.pipeline_id,
    project_type: config.project_type,

    bridge: config.bridge || {},

    current: {
      phase: 'learning',
      stage_id: config.initial_stage || 'start',
      stage_index: 0
    },

    preparation_outputs: {},
    project_outputs: {},

    missing: [],

    validation: {
      last_result: null,
      last_feedback_type: null,
      needs_refinement: false
    },

    history: [],

    teacher_view: {
      progress_percent: 0,
      current_status: 'in_progress',
      flags: []
    }
  };
}

export function updatePreparationOutput(state, key, value = true) {
  state.preparation_outputs[key] = value;
  return state;
}

export function updateProjectOutput(state, key, value) {
  state.project_outputs[key] = value;
  return state;
}

export function computeMissing(state, required = []) {
  const missing = required.filter(r => !state.project_outputs[r]);
  state.missing = missing;
  return missing;
}

export function canAdvance(state) {
  return state.missing.length === 0 && !state.validation.needs_refinement;
}

export function advanceStage(state, nextStage) {
  state.current.stage_id = nextStage;
  state.current.stage_index += 1;
  return state;
}

export function recordHistory(state, event) {
  state.history.push({
    timestamp: new Date().toISOString(),
    ...event
  });
  return state;
}

export function computeTeacherView(state) {
  const total = Object.keys(state.project_outputs).length || 1;
  const completed = Object.values(state.project_outputs).filter(Boolean).length;

  state.teacher_view.progress_percent = Math.round((completed / total) * 100);

  return state.teacher_view;
}
