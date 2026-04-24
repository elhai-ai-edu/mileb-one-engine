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

// ─── Test 11: Realistic Hebrew pilot simulation ────────────────────────────────

section('Test 11: Realistic Hebrew critical review pilot simulation');

const pilotFlow = buildCriticalTextReviewFlow();
const pilotState = createInitialProcessState({
  student_id: 'pilot_student_1',
  pipeline_id: 'critical_review_learning_pipeline',
  project_type: 'critical_text_review',
  initial_stage: 'stage_1'
});
// Phase for this flow is project (not learning), so outputs go to project_outputs
pilotState.current.phase = 'project';

// Hebrew answers that do NOT contain internal output key names
const hebrewAnswers = {
  identify_text_details: 'שם הטקסט הוא חשיבה ביקורתית. כתב אותו ד״ר לוי והוא פורסם באתר חינוכי בשנת 2024.',
  main_claim: 'הכותב טוען שחשיבה ביקורתית חשובה כי היא עוזרת לנו לבדוק מידע ולא להאמין לכל דבר מיד.',
  negative_evaluation: 'לא אהבתי שהטקסט קצת כללי מדי, כי הוא לא נותן מספיק דוגמאות מהחיים של סטודנטים.',
  positive_evaluation: 'אהבתי שהנושא חשוב וברור, כי היום יש הרבה מידע ברשת וצריך לדעת לבדוק אותו.'
};

// Stage 1 — identify_text_details
const stage1 = pilotFlow.nodes[0]; // identify_text_details
const v1 = validateStageResponse({ answer: hebrewAnswers.identify_text_details, stage: stage1, expectedOutputs: [] });
assert('Stage 1: Hebrew answer has_content', v1.has_content === true);
assert('Stage 1: Hebrew answer not rejected as missing', v1.completeness !== 'missing');
assert('Stage 1: feedback_type is not reconsider for good answer', v1.feedback_type !== 'reconsider');

// Stage 2 — main_claim
const stage2 = pilotFlow.nodes[1]; // main_claim
const v2 = validateStageResponse({ answer: hebrewAnswers.main_claim, stage: stage2, expectedOutputs: [] });
assert('Stage 2: main_claim Hebrew answer has_content', v2.has_content === true);
assert('Stage 2: main_claim completeness not missing', v2.completeness !== 'missing');

// Stage 4 — negative_evaluation (requires reasoning)
const stage4 = pilotFlow.nodes[3]; // negative_evaluation
const v4 = validateStageResponse({ answer: hebrewAnswers.negative_evaluation, stage: stage4, expectedOutputs: [] });
assert('Stage 4: negative_evaluation has_content', v4.has_content === true);
assert('Stage 4: negative_evaluation with reasoning is sufficient', v4.completeness === 'sufficient');

// Stage 5 — positive_evaluation (requires reasoning)
const stage5 = pilotFlow.nodes[4]; // positive_evaluation
const v5 = validateStageResponse({ answer: hebrewAnswers.positive_evaluation, stage: stage5, expectedOutputs: [] });
assert('Stage 5: positive_evaluation has_content', v5.has_content === true);
assert('Stage 5: positive_evaluation with reasoning is sufficient', v5.completeness === 'sufficient');

// Weak answer test — missing reasoning for negative_evaluation
const weakAnswer = 'זה חשוב';
const vWeak = validateStageResponse({ answer: weakAnswer, stage: stage4, expectedOutputs: [] });
assert('Weak answer: has_content true (not empty)', vWeak.has_content === true);
assert('Weak answer: completeness is partial or missing (not sufficient)', vWeak.completeness !== 'sufficient');
assert('Weak answer: feedback_type is not null', typeof vWeak.feedback_type === 'string');
const weakFeedback = buildValidationFeedback(vWeak, stage4);
assert('Weak answer: feedback is Hebrew string', typeof weakFeedback === 'string' && weakFeedback.length > 0);
assert('Weak answer: feedback does not use grading language', !weakFeedback.includes('נכון') && !weakFeedback.includes('לא נכון') && !weakFeedback.includes('שגוי'));

// Driver test: action should not be 'missing' after storing output
updateProjectOutput(pilotState, 'text_details', hebrewAnswers.identify_text_details);
const pilotMissing = computeMissing(pilotState, ['text_details'], { source: 'project' });
assert('Pilot: computeMissing returns 0 after project output stored', pilotMissing.length === 0);

const pilotAction = runProjectForward(pilotState, { nodes: pilotFlow.nodes, lastAnswer: hebrewAnswers.identify_text_details });
assert('Pilot: action is not missing after output stored', pilotAction.type !== 'missing');

// PAIOS: instruction layer must still forbid full-answer generation
const pilotInstruction = buildRuntimeInstructionLayer({ state: pilotState, action: pilotAction, context: {} });
assert('Pilot: forbidden_actions includes write_full_answer_for_student', pilotInstruction.forbidden_actions.includes('write_full_answer_for_student'));
assert('Pilot: no_skip policy still enforced', pilotInstruction.runtime_policies?.no_skip === true);

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
