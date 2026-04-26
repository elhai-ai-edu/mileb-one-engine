// core/dashboardRenderer.js
// Minimal renderer for MilEd Speech Training live dashboard.

(function attachDashboardRenderer(root) {
  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getContainer(target) {
    if (typeof document === "undefined") return null;
    if (typeof target === "string") return document.getElementById(target);
    return target || null;
  }

  function ensureBasicStyle() {
    if (typeof document === "undefined") return;
    if (document.getElementById("miled-live-dashboard-style")) return;
    const style = document.createElement("style");
    style.id = "miled-live-dashboard-style";
    style.textContent = [
      ".miled-live-dashboard{direction:rtl;border:1px solid #dbeafe;border-radius:14px;padding:12px;background:#f8fafc;display:grid;gap:10px;font-family:inherit}",
      ".miled-db-box{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:10px}",
      ".miled-db-title{font-weight:900;color:#0f172a;margin-bottom:4px}",
      ".miled-db-muted{font-size:12px;color:#64748b}",
      ".miled-db-action{background:#eff6ff;border-color:#bfdbfe}",
      ".miled-db-action-text{font-size:16px;font-weight:900;color:#1e3a8a;margin-top:6px}",
      ".miled-db-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px}",
      ".miled-db-card{border-right:6px solid #94a3b8}",
      ".miled-db-silent{border-right-color:#ef4444}",
      ".miled-db-hesitating{border-right-color:#f59e0b}",
      ".miled-db-low_fluency{border-right-color:#fb923c}",
      ".miled-db-active{border-right-color:#22c55e}",
      ".miled-db-strong{border-right-color:#3b82f6}",
      ".miled-db-btn{border:0;border-radius:8px;padding:7px 10px;background:#2563eb;color:white;font-weight:800;cursor:pointer;margin-top:8px;font-family:inherit}"
    ].join("\n");
    document.head.appendChild(style);
  }

  const STATUS_HE = {
    unknown: "לא ידוע",
    silent: "שקט",
    hesitating: "מהסס",
    low_fluency: "שטף נמוך",
    active: "פעיל",
    strong: "חזק"
  };

  function renderDashboard(target, model, options = {}) {
    const el = getContainer(target);
    if (!el) return { ok: false, reason: "container_not_found" };
    ensureBasicStyle();

    const summary = model?.summary || {};
    const action = model?.primaryAction || {};
    const cards = model?.cards || [];

    const cardsHtml = cards.length ? cards.map(card => {
      const status = card.status || "unknown";
      const labels = card.labels || {};
      return `
        <div class="miled-db-box miled-db-card miled-db-${esc(status)}">
          <div class="miled-db-title">${esc(card.name || "סטודנט/ית")}</div>
          <div class="miled-db-muted">סטטוס: ${esc(STATUS_HE[status] || status)}</div>
          <div class="miled-db-muted">שטף: ${esc(labels.fluency || "-")}</div>
          <div class="miled-db-muted">ביטחון: ${esc(labels.confidence || "-")}</div>
          <div class="miled-db-muted">תגובה: ${esc(labels.latency || "-")}</div>
        </div>`;
    }).join("") : `<div class="miled-db-box miled-db-muted">אין עדיין נתוני סטודנטים.</div>`;

    el.innerHTML = `
      <div class="miled-live-dashboard">
        <div class="miled-db-box">
          <div class="miled-db-title">מצב כיתה חי</div>
          <div class="miled-db-muted">${esc(summary.speakingPercent || 0)}% מדברים | ${esc(summary.silentStudents || 0)} שקטים | ${esc(summary.hesitatingStudents || 0)} מהססים</div>
        </div>
        <div class="miled-db-box miled-db-action">
          <div class="miled-db-title">${esc(action.title || "המשך פעילות")}</div>
          <div class="miled-db-muted">${esc(action.reason || "")}</div>
          <div class="miled-db-action-text">${esc(action.suggestedAction || "המשך לסבב הבא")}</div>
          <button class="miled-db-btn" data-dashboard-action="${esc(action.cockpitAction || "continue")}">הפעל פעולה</button>
        </div>
        <div class="miled-db-grid">${cardsHtml}</div>
      </div>`;

    const btn = el.querySelector("[data-dashboard-action]");
    if (btn) {
      btn.addEventListener("click", () => {
        const actionName = btn.getAttribute("data-dashboard-action");
        if (typeof options.onAction === "function") options.onAction(actionName, action, model);
        else console.log("[MiledDashboardRenderer] action:", actionName, action);
      });
    }

    return { ok: true };
  }

  function renderFromStudents(target, students, options = {}) {
    if (!root.MiledDashboardEngine) {
      return renderDashboard(target, {
        summary: {},
        cards: [],
        primaryAction: {
          title: "מנוע הדשבורד לא נטען",
          suggestedAction: "טען קודם את core/dashboardEngine.js"
        }
      }, options);
    }
    const model = root.MiledDashboardEngine.buildDashboardModel(students, options);
    return renderDashboard(target, model, options);
  }

  root.MiledDashboardRenderer = { renderDashboard, renderFromStudents };
  if (typeof module !== "undefined" && module.exports) module.exports = root.MiledDashboardRenderer;
})(typeof window !== "undefined" ? window : globalThis);
