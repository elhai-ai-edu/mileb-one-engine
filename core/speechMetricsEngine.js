// core/speechMetricsEngine.js
// MilEd Speech Training System — Speech Metrics Engine v1.0
// Pure utility module. Safe for browser and Node-like runtimes.

(function attachSpeechMetricsEngine(root) {
  function clamp01(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(1, n));
  }

  function countWords(transcript = "") {
    return String(transcript || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  }

  function calcSpeechRate(transcript = "", durationSeconds = 0) {
    const words = countWords(transcript);
    const minutes = Math.max(Number(durationSeconds) || 0, 1) / 60;
    return Math.round(words / minutes);
  }

  function detectFillers(transcript = "") {
    const text = String(transcript || "").toLowerCase();
    const fillers = ["אממ", "אהה", "אה", "כאילו", "בעצם", "נו", "umm", "uh", "like"];
    const hits = [];
    fillers.forEach(word => {
      const re = new RegExp(`(^|\\s)${word}($|\\s|[,.!?])`, "g");
      const matches = text.match(re) || [];
      matches.forEach(() => hits.push(word));
    });
    return { fillerWords: hits, fillerCount: hits.length };
  }

  function calcRateBalanceScore(wpm) {
    const rate = Number(wpm) || 0;
    if (rate >= 90 && rate <= 140) return 1;
    if (rate < 60 || rate > 190) return 0.25;
    if (rate < 90) return clamp01((rate - 60) / 30);
    return clamp01((190 - rate) / 50);
  }

  function calcFluency(speechData = {}) {
    const duration = speechData?.timing?.speechDuration || speechData?.speechDuration || 0;
    const transcript = speechData?.transcript || "";
    const wpm = speechData?.fluency?.speechRateWPM || calcSpeechRate(transcript, duration);
    const fillers = detectFillers(transcript).fillerCount;
    const pauseCount = Number(speechData?.fluency?.pauseCount || 0);
    const avgPause = Number(speechData?.fluency?.averagePauseDuration || 0);

    const rateScore = calcRateBalanceScore(wpm);
    const fillerPenalty = clamp01(fillers / 8) * 0.25;
    const pausePenalty = clamp01(pauseCount / 8) * 0.25;
    const longPausePenalty = clamp01(avgPause / 3) * 0.20;

    return clamp01(rateScore - fillerPenalty - pausePenalty - longPausePenalty);
  }

  function calcConfidence(speechData = {}) {
    const latency = Number(speechData?.timing?.timeToStartSpeaking || speechData?.latency || 0);
    const duration = Number(speechData?.timing?.speechDuration || speechData?.speechDuration || 0);
    const fluency = calcFluency(speechData);

    const latencyScore = latency <= 3 ? 1 : latency >= 8 ? 0.2 : clamp01((8 - latency) / 5);
    const durationScore = duration >= 15 ? 1 : clamp01(duration / 15);

    return clamp01((fluency * 0.45) + (latencyScore * 0.35) + (durationScore * 0.20));
  }

  function buildSpeechMetrics(speechData = {}) {
    const timing = speechData.timing || {};
    const transcript = speechData.transcript || "";
    const duration = Number(timing.speechDuration || 0);
    const speechRateWPM = calcSpeechRate(transcript, duration);
    const fillerInfo = detectFillers(transcript);
    const fluency = calcFluency({ ...speechData, fluency: { ...(speechData.fluency || {}), speechRateWPM } });
    const confidence = calcConfidence({ ...speechData, fluency: { ...(speechData.fluency || {}), speechRateWPM } });

    return {
      inputType: speechData.inputType || "speech",
      transcript,
      timing: {
        botPromptEndedAt: timing.botPromptEndedAt || null,
        speechStartedAt: timing.speechStartedAt || null,
        speechEndedAt: timing.speechEndedAt || null,
        timeToStartSpeaking: Number(timing.timeToStartSpeaking || 0),
        speechDuration: duration,
        totalTurnTime: Number(timing.totalTurnTime || duration)
      },
      fluency: {
        speechRateWPM,
        score: fluency,
        pauseCount: Number(speechData?.fluency?.pauseCount || 0),
        averagePauseDuration: Number(speechData?.fluency?.averagePauseDuration || 0),
        longPausesCount: Number(speechData?.fluency?.longPausesCount || 0)
      },
      disfluencies: {
        ...fillerInfo,
        restarts: Number(speechData?.disfluencies?.restarts || 0),
        selfCorrections: Number(speechData?.disfluencies?.selfCorrections || 0)
      },
      confidence: {
        score: confidence,
        hesitationScore: clamp01(1 - confidence),
        continuityScore: fluency
      }
    };
  }

  const api = { clamp01, countWords, calcSpeechRate, detectFillers, calcFluency, calcConfidence, buildSpeechMetrics };
  root.MiledSpeechMetricsEngine = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
