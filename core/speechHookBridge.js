// core/speechHookBridge.js
// MilEd Speech Training — Hook Bridge (SAFE INTEGRATION LAYER)
// This is the C-layer: connects UI/chat input → speech + roleplay engines

(function attachSpeechHookBridge(root) {

  function runSpeechPipeline({ message, speechData, roleplayConfig }) {

    // 1. Detect speech
    const isSpeech = !!speechData;

    // 2. Build metrics (only if speech)
    let metrics = null;
    if (isSpeech && root.MiledSpeechMetricsEngine) {
      metrics = root.MiledSpeechMetricsEngine.buildSpeechMetrics(speechData);
    }

    // 3. Roleplay
    let roleplay = null;
    if (roleplayConfig && root.MiledRoleplayEngine) {
      const scenario = root.MiledRoleplayEngine.loadScenario(roleplayConfig.scenarioId);
      const state = root.MiledRoleplayEngine.createRolePlayState(roleplayConfig);

      roleplay = {
        scenario,
        state,
        nextTurn: root.MiledRoleplayEngine.generateNextTurn(state, scenario, metrics)
      };
    }

    // 4. Build system augmentation block (this goes into chat.js later)
    let systemAugmentation = "";

    if (roleplay && root.MiledRoleplayEngine) {
      systemAugmentation += root.MiledRoleplayEngine.buildRoleplaySystemBlock({
        state: roleplay.state,
        scenario: roleplay.scenario,
        speechMetrics: metrics
      });
    }

    return {
      isSpeech,
      metrics,
      roleplay,
      systemAugmentation
    };
  }

  root.MiledSpeechHookBridge = {
    runSpeechPipeline
  };

})(typeof window !== "undefined" ? window : globalThis);
