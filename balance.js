// ─── MilEd.One — Dual-Grade Balance Utility (v8.5) ───
// Requires: nothing (pure localStorage + math)
//
// Exposes: window.MiledBalance
//   .getBalance(courseId)                          → { academicWeight, skillWeight }
//   .setBalance(courseId, academicWeight)          → { academicWeight, skillWeight } (saved)
//   .calculateDualGrade(academicRaw, skillRaw, courseId) → weighted score 0–100 (1 decimal)
//   .formatGrade(score)                            → Hebrew label string
//   .getPillarMap(config, courseId)                → requiredPillars array | []

window.MiledBalance = (() => {

  const GLOBAL_KEY      = "miled_balance_global";
  const DEFAULT_ACADEMIC = 70;
  const DEFAULT_SKILL    =  30;

  // ─── Storage key per course (falls back to global) ───
  function _key(courseId) {
    return courseId ? `miled_balance_${courseId}` : GLOBAL_KEY;
  }

  // ─── Read balance — course → global → defaults ───
  function getBalance(courseId) {
    for (const k of [_key(courseId), GLOBAL_KEY]) {
      try {
        const v = JSON.parse(localStorage.getItem(k) || "null");
        if (v && typeof v.academicWeight === "number") return v;
      } catch {}
    }
    return { academicWeight: DEFAULT_ACADEMIC, skillWeight: DEFAULT_SKILL };
  }

  // ─── Write balance (academicWeight drives both; they must sum to 100) ───
  function setBalance(courseId, academicWeight) {
    const aw = Math.round(Math.max(0, Math.min(100, Number(academicWeight))));
    const sw = 100 - aw;
    const obj = { academicWeight: aw, skillWeight: sw };
    localStorage.setItem(_key(courseId), JSON.stringify(obj));
    return obj;
  }

  // ─── Weighted final score ───
  // academicRaw: 0–100  (e.g. draft word-count heuristic or lecturer score)
  // skillRaw:    0–100  (e.g. skill-pillar completion %)
  // Returns:     0–100, one decimal place
  function calculateDualGrade(academicRaw, skillRaw, courseId) {
    const { academicWeight, skillWeight } = getBalance(courseId);
    const raw = (Number(academicRaw) * academicWeight / 100)
              + (Number(skillRaw)    * skillWeight   / 100);
    return Math.round(raw * 10) / 10;
  }

  // ─── Hebrew grade label ───
  function formatGrade(score) {
    if (score >= 90) return `${score} — מצוין`;
    if (score >= 80) return `${score} — טוב מאוד`;
    if (score >= 70) return `${score} — טוב`;
    if (score >= 60) return `${score} — מספיק`;
    return `${score} — לא עובר`;
  }

  // ─── Pull requiredPillars from config for a given course ───
  function getPillarMap(config, courseId) {
    try {
      const course = config?.my_courses?.[courseId];
      // Check both semester_a and semester_b projects
      for (const sem of Object.values(course?.course_units || {})) {
        if (sem?.project?.requiredPillars) return sem.project.requiredPillars;
      }
    } catch {}
    return [];
  }

  return { getBalance, setBalance, calculateDualGrade, formatGrade, getPillarMap };

})();
