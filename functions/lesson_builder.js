// LESSON FLOW BUILDER v1
// MilEd.One
// Purpose: Transform multi-source course inputs into a canonical Lesson Flow

export function buildLessonFlow(input) {
  const context = normalizeInputs(input);

  const skeleton = buildSkeleton(context);
  const anchored = anchorStructure(skeleton, context);
  const withActivities = attachActivities(anchored, context);
  const operational = inferOperationalLayer(withActivities, context);

  const report = buildReport(context, operational);

  return {
    lessonFlow: operational,
    report
  };
}

// --------------------
// STEP 1: NORMALIZATION
// --------------------

function normalizeInputs(input) {
  return {
    syllabus: input.syllabus || null,
    lessonPlan: input.lessonPlan || [],
    moodle: input.moodleMetadata || {},
    bundle: input.courseBundle || {},
    activities: input.activityBank || []
  };
}

// --------------------
// STEP 2: BUILD SKELETON
// --------------------

function buildSkeleton(ctx) {
  const nodes = [];

  const stages = ctx.lessonPlan.length
    ? ctx.lessonPlan
    : defaultStagesFromSyllabus(ctx.syllabus);

  stages.forEach((stage, i) => {
    nodes.push({
      nodeId: `node_${i + 1}`,
      stageLabel: stage.stageLabel || 'unclassified',
      title: stage.title || `Stage ${i + 1}`,
      goal: stage.goal || null,
      activities: [],
      resources: [],
      expectedOutputs: [],
      gate: null,
      botMode: null
    });
  });

  return { nodes };
}

function defaultStagesFromSyllabus(syllabus) {
  if (!syllabus) return [];

  return [
    { stageLabel: 'opening', title: 'פתיחה' },
    { stageLabel: 'knowledge', title: 'הקניית ידע' },
    { stageLabel: 'practice', title: 'תרגול' },
    { stageLabel: 'closure', title: 'סיכום' }
  ];
}

// --------------------
// STEP 3: ANCHOR STRUCTURE
// --------------------

function anchorStructure(flow, ctx) {
  const resources = ctx.bundle.resources || [];

  flow.nodes.forEach(node => {
    node.resources = resources.filter(r => matchResourceToNode(r, node));
  });

  return flow;
}

function matchResourceToNode(resource, node) {
  if (!resource || !node) return false;

  return (
    resource.stageLabel === node.stageLabel ||
    (resource.title && node.title && resource.title.includes(node.title))
  );
}

// --------------------
// STEP 4: ATTACH ACTIVITIES
// --------------------

function attachActivities(flow, ctx) {
  const unassigned = [];

  ctx.activities.forEach(act => {
    const node = flow.nodes.find(n => n.stageLabel === act.stageLabel);

    if (node) {
      node.activities.push(act.id || act.activityId);
    } else {
      unassigned.push(act);
    }
  });

  flow.unassignedActivities = unassigned;

  return flow;
}

// --------------------
// STEP 5: OPERATIONAL LAYER
// --------------------

function inferOperationalLayer(flow, ctx) {
  flow.nodes.forEach(node => {
    node.botMode = inferBotMode(node);
    node.expectedOutputs = inferOutputs(node);
    node.gate = inferGate(node);
  });

  flow.runtimeDefaults = {
    activeNodeId: flow.nodes[0]?.nodeId || null,
    status: 'draft'
  };

  return flow;
}

function inferBotMode(node) {
  if (node.stageLabel === 'opening') return 'none';
  if (node.stageLabel.includes('practice')) return 'task_support';
  return 'general_support';
}

function inferOutputs(node) {
  if (node.stageLabel.includes('practice')) return ['answer'];
  return [];
}

function inferGate(node) {
  if (node.stageLabel.includes('practice')) {
    return { type: 'evidence_required', min: 1 };
  }
  return null;
}

// --------------------
// STEP 6: BUILD REPORT
// --------------------

function buildReport(ctx, flow) {
  return {
    sources: {
      hasSyllabus: !!ctx.syllabus,
      hasLessonPlan: ctx.lessonPlan.length > 0,
      hasActivities: ctx.activities.length > 0
    },
    stats: {
      nodes: flow.nodes.length,
      assignedActivities: flow.nodes.reduce((sum, n) => sum + n.activities.length, 0),
      unassignedActivities: flow.unassignedActivities.length
    }
  };
}
