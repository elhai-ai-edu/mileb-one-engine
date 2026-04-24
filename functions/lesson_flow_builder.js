// lesson_flow_builder.js — MilEd.One
// Build canonical lesson flow from lesson_pack_draft (v0 with gates)

export function buildCanonicalLessonFlow({ lesson_pack_draft }) {
  if (!lesson_pack_draft || !lesson_pack_draft.flow_draft) {
    throw new Error('lesson_pack_draft.flow_draft is required');
  }

  const flow = lesson_pack_draft.flow_draft;
  const botPlan = lesson_pack_draft.bot_plan || [];
  const resources = lesson_pack_draft.resources_plan || [];

  const nodes = flow.nodes.map((node, index) => {
    const nodeId = `node_${String(index + 1).padStart(3, '0')}`;

    const botBinding = node.bot_binding_ref
      ? botPlan.find(b => b.binding_id === node.bot_binding_ref)
      : null;

    const nodeResources = resources.filter(r => r.linked_node === node.node_key);

    return {
      node_id: nodeId,
      draft_node_id: node.nodeId,
      node_key: node.node_key,
      stageLabel: node.stageLabel,
      title: node.title,
      duration_minutes: node.duration_minutes,
      expectedOutputs: node.expectedOutputs || [],

      gate: buildGate(node.gate),

      bot_binding: botBinding || null,

      resources: nodeResources,

      runtime: {
        status: 'pending',
        unlocked: index === 0
      }
    };
  });

  const edges = nodes.map((node, index) => {
    if (index === nodes.length - 1) return null;

    const nextNode = nodes[index + 1];

    return {
      from: node.node_id,
      to: nextNode.node_id,
      condition: node.gate
        ? {
            type: node.gate.type,
            evidence: node.gate.evidence || null
          }
        : null
    };
  }).filter(Boolean);

  const canonical_lesson_flow = {
    lesson_id: generateLessonId(),
    metadata: lesson_pack_draft.metadata || {},

    nodes,
    edges,

    runtime_defaults: {
      active_node_id: nodes[0]?.node_id || null,
      status: 'draft',
      progression_mode: 'gated_linear',
      gate_policy: 'respect_node_gates'
    },

    bot_bindings: botPlan,
    resource_bindings: resources,
    assessment_plan: lesson_pack_draft.assessment || {},
    reflection_plan: lesson_pack_draft.reflection || {}
  };

  return {
    canonical_lesson_flow,
    build_report: buildReport(nodes, edges, botPlan, resources)
  };
}

function buildGate(gate) {
  if (!gate) return null;

  return {
    ...gate,
    status: gate.type === 'evidence_required' ? 'pending_evidence' : 'open'
  };
}

function generateLessonId() {
  return `lesson_${Date.now()}`;
}

function buildReport(nodes, edges, botPlan, resources) {
  return {
    node_count: nodes.length,
    edge_count: edges.length,
    bot_binding_count: botPlan.length,
    resource_count: resources.length,
    gates_count: nodes.filter(n => n.gate).length,
    warnings: []
  };
}
