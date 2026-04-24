// process_runtime_smoke_test.js
// Smoke test for the full process runtime pipeline.
// No external API calls. No model calls.
// Run with: node --experimental-vm-modules functions/process_runtime_smoke_test.js
// Or: import and call runAllSmokeTests() from a test runner.

import { extractPedagogicalStructureFromContent, detectLearningPipelines, detectCriticalReviewProject, buildLearningToProjectBridge } from './pedagogical_structure_extractor.js';
import { buildCriticalTextReviewFlow, buildProjectFlow } from './project_flow_builder.js';
import { createInitialProcessState, computeMissing, canAdvance, updateProjectOutput } from './process_state_manager.js';
import { runProjectForward } from './project_runtime_driver.js';
import { buildRuntimeInstructionLayer } from './runtime_instruction_builder.js';
import { evaluateBridgeReadiness, applyBridgePolicy } from './learning_to_project_bridge.js';
import { validateStageResponse, selectFeedbackType, buildValidationFeedback } from './process_validation.js';

// ─── Test helpers ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}${detail ? ': ' + detail : ''}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n── ${title} ─────────────────────────────`);
}

// ─── Test 1: Critical review pipeline detection ───────────────────────────────

section('Test 1: Critical review pipeline detection');

const learningText = `
שיעור 3: חשיבה ביקורתית
- אוצר מילים: לעסוק, עוסק
- יובל ושרון מסכמים קטע
- שאלו שאלת הבהרה על הנושא
- סכמו את הקטע הבא בעזרת AI
`;

const pipelines = detectLearningPipelines(learningText);
assert('Detects at least one pipeline', pipelines.length >= 1);
assert('Detects critical_review_learning_pipeline', pipelines.some(p => p.pipeline_id === 'critical_review_learning_pipeline'));

// ─── Test 2: Critical text review project detection ───────────────────────────

section('Test 2: Critical text review project detection');

const projectText = `
פרויקט ביקורת טקסט:
שלבי כתיבת הביקורת:
1. פתיחה = הפרטים של הטקסט
2. מה הטענה המרכזית
3. דעה אישית שלילית
4. מסקנות והמלצות
`;

const criticalProjects = detectCriticalReviewProject(projectText);
assert('Detects critical text review project', criticalProjects.length >= 1);
assert('Project type is critical_text_review', criticalProjects[0]?.project_type === 'critical_text_review');
assert('Has 7 stages', criticalProjects[0]?.stages?.length === 7);

// ─── Test 3: Bridge creation ──────────────────────────────────────────────────

section('Test 3: Bridge creation');

const pipeline = pipelines[0];
const project = criticalProjects[0];
const bridge = buildLearningToProjectBridge(pipeline, project);

assert('Bridge has correct type', bridge.bridge_type === 'learning_to_project');
assert('Bridge links pipeline correctly', bridge.pipeline_id === pipeline.pipeline_id);
assert('Bridge links project correctly', bridge.project_type === project.project_type);
assert('Bridge has required_preparation_outputs', Array.isArray(bridge.required_preparation_outputs));

// ─── Test 4: State creation ───────────────────────────────────────────────────

section('Test 4: State creation');

const state = createInitialProcessState({
  student_id: 'smoke_student_1',
  pipeline_id: 'critical_review_learning_pipeline',
  project_type: 'critical_text_review',
  initial_stage: 'identify_text_details',
  bridge: bridge
});

assert('State has process_id', !!state.process_id);
assert('State has correct student_id', state.student_id === 'smoke_student_1');
assert('State initial phase is learning', state.current.phase === 'learning');
assert('State initial stage is correct', state.current.stage_id === 'identify_text_details');
assert('State missing array is empty', Array.isArray(state.missing) && state.missing.length === 0);

// ─── Test 5: Missing output detection ────────────────────────────────────────

section('Test 5: Missing output detection');

const requiredOutputs = ['text_details', 'main_claim'];
const missing = computeMissing(state, requiredOutputs);

assert('Missing outputs detected correctly', missing.length === 2);
assert('text_details is missing', missing.includes('text_details'));
assert('canAdvance is false when missing', !canAdvance(state));

// Add one output
updateProjectOutput(state, 'text_details', 'שם הטקסט: מאמר על חשיבה ביקורתית, מחבר: ד"ר לוי');
const missingAfter = computeMissing(state, requiredOutputs);
assert('Missing count reduced after update', missingAfter.length === 1);
assert('text_details no longer missing', !missingAfter.includes('text_details'));

// ─── Test 6: Runtime action generation ───────────────────────────────────────

section('Test 6: Runtime action generation');

const flow = buildCriticalTextReviewFlow();
assert('Flow has nodes', flow.nodes.length === 7);
assert('First node is identify_text_details', flow.nodes[0].stage_id === 'identify_text_details');

// State still missing main_claim — action should be 'missing'
const stateForDriver = createInitialProcessState({
  student_id: 'smoke_student_2',
  pipeline_id: 'critical_review_learning_pipeline',
  project_type: 'critical_text_review',
  initial_stage: 'stage_1'
});

const action = runProjectForward(stateForDriver, { nodes: flow.nodes });
assert('Action type is missing when no outputs', action.type === 'missing');
assert('Action has message', typeof action.message === 'string');
assert('Action has missing array', Array.isArray(action.missing));

// Provide all required outputs for stage 1
updateProjectOutput(stateForDriver, 'text_details', 'פרטי הטקסט הושלמו');
computeMissing(stateForDriver, ['text_details']);
const actionAfter = runProjectForward(stateForDriver, { nodes: flow.nodes });
assert('Action advances when outputs complete', ['advance', 'needs_refinement', 'complete'].includes(actionAfter.type));

// ─── Test 7: Instruction layer output ────────────────────────────────────────

section('Test 7: Instruction layer output');

const advanceState = createInitialProcessState({
  student_id: 'smoke_student_3',
  pipeline_id: 'critical_review_learning_pipeline',
  project_type: 'critical_text_review',
  initial_stage: 'stage_2'
});

const sampleAction = {
  type: 'missing',
  message: 'חסרים פרטי הטקסט',
  next_stage: null,
  missing: ['text_details'],
  validation: {}
};

const instructionLayer = buildRuntimeInstructionLayer({
  state: advanceState,
  action: sampleAction,
  context: {}
});

assert('Instruction layer has system_addendum', typeof instructionLayer.system_addendum === 'string');
assert('Instruction layer has stage_prompt', typeof instructionLayer.stage_prompt === 'string');
assert('Instruction layer has allowed_actions', Array.isArray(instructionLayer.allowed_actions));
assert('Instruction layer has forbidden_actions', Array.isArray(instructionLayer.forbidden_actions));
assert('Forbidden actions include write_full_answer_for_student', instructionLayer.forbidden_actions.includes('write_full_answer_for_student'));
assert('Runtime policies enforce no_skip', instructionLayer.runtime_policies?.no_skip === true);
assert('Runtime policies enforce no_full_solution', instructionLayer.runtime_policies?.no_full_solution === true);
assert('Runtime trace has phase', !!instructionLayer.runtime_trace?.phase);

// ─── Test 8: Validation helper ────────────────────────────────────────────────

section('Test 8: Smart validation helper');

const goodAnswer = 'שם הטקסט: מאמר על חשיבה ביקורתית. מחבר: ד"ר לוי. ז\'אנר: מאמר אקדמי.';
const emptyAnswer = '';
const shortAnswer = 'כן';

const stage = flow.nodes[0]; // identify_text_details

const goodValidation = validateStageResponse({ answer: goodAnswer, stage, expectedOutputs: ['text_details'] });
assert('Good answer has_content', goodValidation.has_content === true);

const emptyValidation = validateStageResponse({ answer: emptyAnswer, stage });
assert('Empty answer has_content is false', emptyValidation.has_content === false);
assert('Empty answer completeness is missing', emptyValidation.completeness === 'missing');
assert('Empty answer feedback_type is reconsider', emptyValidation.feedback_type === 'reconsider');

const feedback = buildValidationFeedback(emptyValidation, stage);
assert('Feedback is Hebrew string', typeof feedback === 'string' && feedback.length > 0);
assert('Feedback does not use grading language', !feedback.includes('נכון') && !feedback.includes('לא נכון'));

// ─── Test 9: Bridge readiness ─────────────────────────────────────────────────

section('Test 9: Bridge readiness evaluation');

const bridgeConfig = {
  bridge_type: 'learning_to_project',
  bridge_mode: 'flexible',
  bridge_visibility: 'visible',
  required_preparation_outputs: ['vocabulary_task_complete', 'clarifying_question_submitted']
};

const stateNoPrepared = createInitialProcessState({ student_id: 'smoke_student_4' });
const readinessNotReady = evaluateBridgeReadiness(stateNoPrepared, bridgeConfig);
assert('Bridge not ready when no preparations', !readinessNotReady.ready);
assert('Bridge can_proceed (flexible)', readinessNotReady.can_proceed === true);
assert('Bridge missing list correct', readinessNotReady.missing.length === 2);

const statePrepared = createInitialProcessState({ student_id: 'smoke_student_5' });
statePrepared.preparation_outputs.vocabulary_task_complete = true;
statePrepared.preparation_outputs.clarifying_question_submitted = true;
const readinessReady = evaluateBridgeReadiness(statePrepared, bridgeConfig);
assert('Bridge ready when all preparations complete', readinessReady.ready === true);
assert('Bridge missing is empty when ready', readinessReady.missing.length === 0);

const stateForBridgePolicy = createInitialProcessState({ student_id: 'smoke_student_6' });
applyBridgePolicy(stateForBridgePolicy, bridgeConfig);
assert('Bridge state set to warned (flexible, missing)', stateForBridgePolicy.bridge.status === 'warned');
assert('Bridge can_proceed true in flexible mode', stateForBridgePolicy.bridge.can_proceed === true);
assert('Teacher view flagged with bridge_incomplete', stateForBridgePolicy.teacher_view?.flags?.includes('bridge_incomplete'));

// ─── Test 10: Full extraction pipeline ────────────────────────────────────────

section('Test 10: Full extraction pipeline');

const fullText = learningText + '\n' + projectText;
const extracted = extractPedagogicalStructureFromContent({ raw_text: fullText });

assert('Extraction returns learning_pipelines', Array.isArray(extracted.learning_pipelines));
assert('Extraction returns project_structures', Array.isArray(extracted.project_structures));
assert('Extraction returns bridges', Array.isArray(extracted.bridges));
assert('Extraction detects critical_text_review project', extracted.project_structures.some(p => p.project_type === 'critical_text_review'));
assert('Extraction detects learning pipeline', extracted.learning_pipelines.length >= 1);
assert('Bridges created for pipeline-project pair', extracted.bridges.length >= 1);

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n════════════════════════════════════════`);
console.log(`Smoke tests complete: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('❌ Some smoke tests failed.');
  // Only exit with error code when run directly (not when imported programmatically)
  if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('process_runtime_smoke_test')) {
    process.exit(1);
  }
} else {
  console.log('✅ All smoke tests passed.');
}

export function runAllSmokeTests() {
  // Re-export entry point for programmatic use
  return { passed, failed };
}
