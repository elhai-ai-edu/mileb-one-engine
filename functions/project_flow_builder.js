// project_flow_builder.js

export function buildProjectFlow(projectStructure) {

  const nodes = projectStructure.stages.map((stage, index) => ({
    node_id: `stage_${index + 1}`,
    stage_id: stage.stage_id,
    title: stage.label,
    sub_tasks: stage.sub_tasks,
    required_outputs: stage.required_outputs,
    gate: stage.suggested_gate,
    bot_role: stage.bot_role,
    runtime: {
      status: 'pending',
      unlocked: index === 0
    }
  }));

  return {
    project_id: `project_${Date.now()}`,
    nodes,
    runtime: {
      active_stage: nodes[0]?.node_id,
      mode: 'gated_progression'
    }
  };
}
