# Design System Specification — Student-Facing Pages
## MilEd.One — v1.0 · 2026-04-16 · Source of Truth: demo_student_view.html

> **מטרה:** מסמך זה מאגד את כל ההחלטות העיצוביות מה-demo.  
> `demo_student_view.html` הוא המקור הקנוני לעיצוב. כל שינוי עיצובי חייב להיות מיושב עם מסמך זה.  
> המסמך מכסה: Design Tokens, Typography, Components, Animation Library, ו-Migration Gap Analysis.

---

## תוכן עניינים

1. [Design Tokens — CSS Custom Properties](#1-design-tokens)
2. [Typography](#2-typography)
3. [Color Palette & Named Gradients](#3-color-palette--named-gradients)
4. [Topbar](#4-topbar)
5. [Screen Backgrounds](#5-screen-backgrounds)
6. [Cards & Panels](#6-cards--panels)
7. [Chip System](#7-chip-system)
8. [Button System](#8-button-system)
9. [Activity Components](#9-activity-components)
10. [Peer Review Components](#10-peer-review-components)
11. [Group Mode Components](#11-group-mode-components)
12. [Team Project Components](#12-team-project-components)
13. [Bot Bubble & Float Panel](#13-bot-bubble--float-panel)
14. [Animation Library](#14-animation-library)
15. [Mode-Driven CSS Architecture](#15-mode-driven-css-architecture)
16. [Migration Gap Analysis](#16-migration-gap-analysis)

---

## 1. Design Tokens

```css
:root {
  /* ── Core Palette ── */
  --navy:    #0f172a;
  --blue:    #1e40af;
  --sky:     #0ea5e9;
  --green:   #16a34a;
  --red:     #dc2626;
  --amber:   #d97706;
  --muted:   #64748b;
  --bg:      #f1f5f9;
  --card:    #ffffff;

  /* ── Semantic ── */
  --line:    #e2e8f0;

  /* ── Brand accent ── */
  --bordeaux:       #7a1530;
  --bordeaux-dark:  #4a0818;
  --bordeaux-light: #b83055;

  /* ── Group mode ── */
  --emerald:      #059669;
  --emerald-dark: #065f46;
  --emerald-light: #d1fae5;

  /* ── Shared ── */
  --radius: 14px;
}
```

**כלל:** `font-family: 'Assistant', sans-serif` — משקלים 300/400/500/600/700/800. **לא** Inter.  
`lesson_view.html` ו-`waiting_lobby.html` הנוכחיים טוענים רק 400/600/700/800 — יש להוסיף 300 ו-500.

---

## 2. Typography

| Role | Size | Weight | Color |
|------|------|--------|-------|
| Page title / screen title | 28px | 800 | `var(--navy)` |
| Section heading | 15–16px | 800 | `var(--navy)` |
| Panel head | 13–14px | 800 | `var(--navy)` |
| Body text | 13–14px | 400/600 | `var(--navy)` |
| Metadata / secondary | 11–12px | 600/700 | `var(--muted)` |
| Labels / badges | 11px | 700–800 | contextual |

**כלל:** כל ה-`font-weight: 900` בדמו נמצא רק ב-modal heads וב-rubric level 4 — לא בשימוש כללי.  
**כלל:** `letter-spacing: -.2px` ב-headers גדולים; `letter-spacing: .4–.5px` ב-UPPERCASE labels.

---

## 3. Color Palette & Named Gradients

### Topbar — Dark Navy-Blue Gradient
```css
background: linear-gradient(90deg, #0f172a 0%, #1e3a8a 60%, #0369a1 100%);
border-bottom: 2px solid #1e40af;
```
משמש ל: `waiting_lobby`, `lesson_view`, `team_project` (גרסת indigo).

### Team Project Topbar — Indigo Dark
```css
background: linear-gradient(90deg, #0f172a 0%, #312e81 55%, #1e1b4b 100%);
border-bottom: 2px solid #4f46e5;
```

### Waiting Room Background
```css
background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 40%, #eff6ff 100%);
```

### Lesson Screen Background
```css
background: var(--bg); /* #f1f5f9 */
```

### Activity Card Header
```css
background: linear-gradient(135deg, #eff6ff, #dbeafe);
border-bottom: 1px solid #bfdbfe;
```

### Group Task Header (emerald)
```css
background: linear-gradient(180deg, #ecfdf5, #d1fae5);
```

### Project Guidance (purple)
```css
background: linear-gradient(135deg, #f5f3ff, #ede9fe);
border: 1px solid #ddd6fe;
```

### Peer Insight Panel (amber/yellow)
```css
background: linear-gradient(180deg, #fffbeb, #fefce8);
```

### Peer Review Panel (blue-white)
```css
background: linear-gradient(180deg, #f0f7ff, #fff);
border-top: 2px solid #bfdbfe;
```

### Bot Float Panel Header (bordeaux)
```css
background: linear-gradient(135deg, var(--bordeaux) 0%, var(--bordeaux-dark) 100%);
```

### Chat Bubble — Bot (bordeaux tint)
```css
background: linear-gradient(135deg, #fdf2f5, #fce7ed);
border: 1px solid #f4c0cf;
```

### Chat Bubble — Bot (project style, teal)
```css
background: linear-gradient(135deg, #f0fdfa, #ccfbf1);
border: 1px solid #99f6e4;
```

### Chat Bubble — User
```css
background: #f0f9ff;
border: 1px solid #bae6fd;
```

---

## 4. Topbar

### Waiting Room & Lesson Topbar

```html
<div class="l-topbar">
  <div class="l-logo">MilEd.One</div>
  <div class="l-course">שם הקורס</div>
  <div class="l-chips">
    <span class="chip chip-default">תווית</span>
    <span class="chip chip-green">פעיל</span>
  </div>
  <div class="topbar-spacer"></div>
  <!-- mode buttons here -->
</div>
```

```css
.l-topbar {
  background: linear-gradient(90deg, #0f172a 0%, #1e3a8a 60%, #0369a1 100%);
  padding: 10px 20px;
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  border-bottom: 2px solid #1e40af;
  flex-shrink: 0;
}
.l-logo   { color: #fff; font-size: 16px; font-weight: 800; }
.l-course { color: #93c5fd; font-size: 14px; font-weight: 600; }
```

**הבדל מהדפים הנוכחיים:**  
`lesson_view.html` — topbar קיים עם gradient דומה אך ה-border-bottom חסר.  
`waiting_lobby.html` — אין topbar כהה כלל; ה-header הוא white glass-card.

### Live Meeting Bar (inside topbar during lesson)

```html
<div id="liveMeetingBar" style="display:none">
  <span class="live-dot"></span>
  <span id="liveMeetingBarActiveTask">📝 עכשיו: ניתוח פסקת פתיחה</span>
  <span class="chip chip-green" id="liveMeetingBarPhase">✍️ עבודה עצמאית</span>
</div>
```

```css
.live-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #22c55e; animation: dotPulse 2s infinite;
}
```

---

## 5. Screen Backgrounds

### Waiting Room
```css
background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 40%, #eff6ff 100%);
```
Warm, airy, hopeful. Not glass, not dark.

### Lesson Room
```css
background: var(--bg); /* flat #f1f5f9 */
```
Neutral, work-focused. The chrome (topbar, panels) provides hierarchy.

### Team Project Screen
```css
/* inherits from lessonScreen background, topbar changes to indigo */
```

### Door Entry Animation — Full-Screen Overlay
```css
#doorAnim {
  position: fixed; inset: 0; z-index: 8000;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 40%, #eff6ff 100%);
  display: none; align-items: center; justify-content: center; flex-direction: column;
}
#doorAnim.visible { display: flex; animation: doorFade .5s ease; }

.door-card {
  background: #fff; border-radius: 24px; padding: 48px 56px; text-align: center;
  animation: doorCardIn .6s .2s cubic-bezier(.34,1.56,.64,1) both;
}
.door-emoji { font-size: 56px; margin-bottom: 16px; }
.door-title { font-size: 26px; font-weight: 800; color: var(--navy); margin-bottom: 8px; }
.door-sub   { color: var(--muted); font-size: 15px; }
```

---

## 6. Cards & Panels

### Base Card (waiting room cards)
```css
.w-card {
  background: #fff;
  border: 1px solid #bfdbfe;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 4px 20px rgba(29,78,216,.10);
}
```

### Panel (lesson three-column layout)
```css
.panel {
  border-left: 1px solid var(--line);
  display: flex; flex-direction: column; overflow-y: auto;
}
.panel-head {
  padding: 12px 16px;
  font-weight: 800; font-size: 13px; color: var(--navy);
  border-bottom: 1px solid var(--line);
  background: linear-gradient(180deg, #f8fbff, #eef4ff);
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
}
```

### Activity Card
```css
.activity-card {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,.05);
  animation: cardIn .3s ease;
}
.activity-card-header {
  padding: 14px 18px 12px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-bottom: 1px solid #bfdbfe;
}
```

### Resource Card (bookshelf)
```css
.resource-card {
  background: #f8fafc;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px; margin-bottom: 8px;
  display: flex; align-items: center; gap: 10px;
  transition: background .15s;
}
.resource-card:hover { background: #eff6ff; }
```

### Modal Box
```css
.modal-box {
  background: #fff;
  border-radius: 20px;
  width: 440px; max-width: 90vw;
  padding: 26px 26px 22px;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
  animation: modalPop .3s cubic-bezier(.34,1.2,.64,1);
}
.modal-head { font-size: 18px; font-weight: 900; color: #1e1b4b; margin-bottom: 4px; }
.modal-sub  { font-size: 13px; color: var(--muted); margin-bottom: 16px; }
```

---

## 7. Chip System

5 semantic variants — all pill-shaped (`border-radius: 999px`):

```css
.chip { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; border: 1px solid; white-space: nowrap; }
.chip-default { background: #1e293b; color: #94a3b8; border-color: #334155; }
.chip-green   { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
.chip-purple  { background: #faf5ff; color: #6b21a8; border-color: #d8b4fe; }
/* Topbar on dark background — ghost style: */
.chip-ghost   { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.25); color: #e2e8f0; }
/* Mode badges (group/project — on dark topbar): */
.group-mode-badge  { background: rgba(5,150,105,.2); border: 1px solid #6ee7b7; color: #ecfdf5; }
.project-mode-badge { background: rgba(99,102,241,.25); border: 1px solid #a5b4fc; color: #c7d2fe; }
```

---

## 8. Button System

### Mode Entry/Exit Buttons (topbar)
```css
/* Project entry — animated indigo */
.project-enter-btn {
  padding: 7px 16px; border-radius: 20px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none; color: #fff; font-size: 13px; font-weight: 700;
  animation: projectPulse 2.5s infinite; /* attention pulse */
}

/* Group entry — emerald */
.group-enter-btn {
  background: linear-gradient(135deg, #34d399, #059669);
}

/* Exit variants — darker versions of same gradient */
```

### Submission Buttons
```css
.sub-btn { padding: 10px 20px; border-radius: 12px; font-weight: 800; font-size: 13px; }
.sub-btn.primary   { background: linear-gradient(135deg, #1d4ed8, #2563eb); color: #fff; }
.sub-btn.record    { background: linear-gradient(135deg, #e11d48, #f43f5e); color: #fff; }
.sub-btn.upload    { background: linear-gradient(135deg, #0d9488, #14b8a6); color: #fff; }
.sub-btn.secondary { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
/* Hover lift: */
.sub-btn:hover  { transform: translateY(-2px); box-shadow: 0 5px 14px rgba(0,0,0,.14); }
.sub-btn:active { transform: translateY(0);    box-shadow: 0 2px 4px rgba(0,0,0,.10); }
```

### Veto Final Button (state-dependent)
```css
.veto-final-btn {
  background: #e2e8f0; color: var(--muted); cursor: not-allowed; /* disabled default */
  transition: all .35s;
}
.veto-final-btn.ready {
  background: linear-gradient(135deg, #34d399, #059669); color: #fff; cursor: pointer;
}
```

### Modal Primary Button
```css
.modal-primary-btn {
  width: 100%; padding: 12px; border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff;
  font-size: 14px; font-weight: 800;
}
```

### Project Entry Buttons (waiting room)
```css
/* Personal project — teal */
.w-project-link {
  padding: 9px 20px; border-radius: 999px;
  background: linear-gradient(135deg, #f0fdfa, #ccfbf1);
  border: 1.5px solid #2dd4bf; color: #0f766e;
  font-weight: 700;
}
/* Team project — indigo */
.w-team-project-link {
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  border: 1.5px solid #818cf8; color: #4338ca;
}
```

---

## 9. Activity Components

### Context Rail (lesson stage progress)
```css
.ctx-stage-box {
  font-size: 12px; font-weight: 700; padding: 4px 14px;
  border: 1.5px solid #cbd5e1; border-radius: 8px;
  background: #fff; color: var(--muted);
}
.ctx-stage-box.done   { background: #f0fdf4; border-color: #86efac; color: #15803d; }
.ctx-stage-box.active {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-color: #93c5fd; color: var(--blue); font-weight: 800;
  box-shadow: 0 2px 8px rgba(29,78,216,.12);
}
/* Connector between stages: */
.ctx-stage-connector { width: 22px; height: 2px; background: linear-gradient(90deg, #cbd5e1, #e2e8f0); }
```

### Activity Block Label (uppercase section header)
```css
.activity-block-label {
  font-size: 11px; font-weight: 800; color: var(--muted);
  letter-spacing: .4px; text-transform: uppercase;
  display: flex; align-items: center; gap: 6px;
}
/* Blue accent bar before label: */
.activity-block-label::before {
  content: ''; width: 3px; height: 14px; border-radius: 2px; background: #3b82f6;
}
```

### Sprint Stepper (project mode)
```css
.sprint-bubble.active { background: #7c3aed; border-color: #7c3aed; color: #fff; box-shadow: 0 0 0 4px rgba(124,58,237,.2); }
.sprint-bubble.done   { background: #ede9fe; border-color: #a78bfa; color: #6d28d9; }
.sprint-connector.done { background: #a78bfa; }
```

### Submission Success State
```css
/* CSS class toggle — no JS show/hide needed: */
.submission-panel.submitted .sub-ta              { display: none; }
.submission-panel.submitted .sub-actions         { display: none; }
.submission-panel.submitted .sub-hint            { display: none; }
.submission-panel.submitted .sub-submitted-banner { display: flex; }

.sub-submitted-banner {
  display: none; align-items: center; gap: 12px;
  padding: 10px 14px; background: #f0fdf4; border: 1.5px solid #86efac;
  border-radius: 10px; margin-top: 8px;
}
```

---

## 10. Peer Review Components

### Rubric Scale Pills — 4-Level Verbal

```css
.rubric-scale-pill {
  flex: 1; font-size: 11px; font-weight: 700; padding: 6px 4px;
  border-radius: 8px; border: 1.5px solid var(--line);
  background: #f8fafc; color: var(--muted);
  cursor: pointer; transition: all .14s;
}
.rubric-scale-pill:hover { border-color: #93c5fd; background: #eff6ff; }

/* Color progression: red → amber → light green → deep green */
.rubric-scale-pill.sel[data-level="1"] { background: #fef2f2; border-color: #fca5a5; color: #dc2626; font-weight: 800; }
.rubric-scale-pill.sel[data-level="2"] { background: #fefce8; border-color: #fde047; color: #854d0e; font-weight: 800; }
.rubric-scale-pill.sel[data-level="3"] { background: #ecfdf5; border-color: #86efac; color: #15803d; font-weight: 800; }
.rubric-scale-pill.sel[data-level="4"] { background: #f0fdf4; border-color: #4ade80; color: #15803d; font-weight: 900; box-shadow: 0 0 0 2px #bbf7d0; }
```

**עיקרון:** level 4 (`בהחלט`) מקבל `font-weight: 900` + `box-shadow` ring — מסמן הצלחה מלאה.

### Emoji Bank — 20 Items

```css
.emoji-item {
  width: 34px; height: 34px; border-radius: 8px;
  border: 1.5px solid var(--line); background: #f8fafc;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; cursor: pointer; transition: all .12s;
}
.emoji-item:hover { background: #eff6ff; border-color: #93c5fd; transform: scale(1.15); }
.emoji-item.sel   { background: #eff6ff; border-color: #3b82f6; box-shadow: 0 0 0 2px #bfdbfe; transform: scale(1.12); }
```

**הבנק (20 אלמנטים):**  
`💡 🔥 🌟 👏 🎯 💬 🤔 📚 ✍️ 🧠 💪 🎉 🙌 👍 ✅ ❓ 🔍 📝 ⚡ 🌱`

### Peer Insight Panel (amber)
```css
.peer-insight-panel {
  background: linear-gradient(180deg, #fffbeb, #fefce8);
}
.peer-insight-title { color: #92400e; }
.peer-compare-prompt {
  background: #fef9c3;
  border-right: 3px solid #fbbf24; /* RTL accent bar */
  padding: 8px 12px; border-radius: 0 8px 8px 0;
}
```

---

## 11. Group Mode Components

### Contribution Feed
```css
.group-contrib-feed {
  background: #f0fdf4; border: 1px solid #d1fae5; border-radius: 10px;
  padding: 8px 10px; max-height: 190px; overflow-y: auto;
}
.group-contrib-item {
  background: #fff; border: 1px solid #a7f3d0; border-radius: 9px;
  padding: 8px 10px;
  animation: contribFadeIn .3s ease;
}
.group-contrib-item.mine { border-color: #059669; background: #f0fdf4; }
```

Entry animation: `contribFadeIn` — fade up 5px.

### Member Status Dots
```css
.gm-status.online  { background: #22c55e; box-shadow: 0 0 0 2px #dcfce7; }
.gm-status.writing { background: #f59e0b; box-shadow: 0 0 0 2px #fef3c7; animation: statusPulse 1s infinite; }
```

### Master Draft
```css
.master-draft {
  border: 1.5px dashed #6ee7b7; /* dashed = editable/work-in-progress signal */
  border-radius: 10px; padding: 10px 12px; background: #f0fdf4;
}
.draft-author-badge {
  background: #d1fae5; border: 1px solid #6ee7b7;
  border-radius: 999px; padding: 2px 8px; color: #065f46;
}
```

**כלל:** dashed border = "בתהליך" / "ניתן לעריכה". solid border = "קבוע".

### My Contribution Lane
```css
.group-my-contrib {
  border-top: 1.5px dashed #6ee7b7; padding-top: 10px;
}
```

### Veto Chips
```css
.veto-chip { border: 1px solid var(--line); background: #f8fafc; transition: all .35s; }
.veto-chip.approved { background: #f0fdf4; border-color: #86efac; }
.vc-status { color: var(--muted); }
.veto-chip.approved .vc-status { color: #15803d; }
```

Transition duration `.35s` — deliberate: slow enough to feel "someone just approved".

### Call Teacher Button (in dark topbar)
```css
.call-teacher-btn {
  border: 1.5px solid rgba(255,255,255,.35);
  background: rgba(255,255,255,.12); color: #fff;
  border-radius: 999px;
}
.call-teacher-btn.called { background: #dc2626; border-color: #fca5a5; animation: callPulse 1s infinite; }
```

---

## 12. Team Project Components

### Topbar (indigo)
```css
.tp-topbar {
  background: linear-gradient(90deg, #0f172a 0%, #312e81 55%, #1e1b4b 100%);
  border-bottom: 2px solid #4f46e5;
  padding: 12px 24px;
}
.tp-topbar-back {
  color: #a5b4fc; border: 1px solid rgba(165,180,252,.3);
  border-radius: 999px; padding: 6px 12px;
  background: none;
}
.tp-topbar-back:hover { background: rgba(165,180,252,.12); }
```

### Member Cards (left panel)
```css
.tp-member-card.me { background: #eef2ff; } /* highlight self */
.tp-mem-role { color: #6366f1; } /* indigo for roles */
.tp-mem-count {
  background: #eef2ff; border: 1px solid #c7d2fe;
  color: #4f46e5; font-weight: 700;
}
```

### Document Blocks (attributed)
```css
.doc-section-attr {
  display: flex; align-items: center; gap: 8px; padding: 7px 12px;
  background: #f8fafc; border-bottom: 1px solid var(--line); font-size: 11px;
}
/* attr line: [avatar] [name] [time] — always visible, not collapsible */
```

### Baton Button
```css
.tp-baton-btn {
  border: 1.5px solid #c7d2fe; background: #eef2ff; color: #4338ca;
  border-radius: 10px; font-weight: 800;
}
.tp-baton-btn:hover { background: #e0e7ff; }
```

### Digest Sidebar (right panel)
```css
.tp-digest {
  background: linear-gradient(180deg, #eef2ff, #f5f3ff);
  border-bottom: 1px solid #c7d2fe;
}
.tp-digest-head { color: #4338ca; font-weight: 800; }
.tp-digest-item {
  background: #fff; border: 1px solid #e0e7ff; border-radius: 6px;
  padding: 4px 7px;
}
```

### AI Digest Modal (entry)
```css
/* Uses .modal-overlay + .modal-box */
.digest-change {
  background: #f8fafc; border: 1px solid var(--line); border-radius: 10px;
  display: flex; align-items: center; gap: 10px;
}
```

---

## 13. Bot Bubble & Float Panel

### Bordeaux 3D Sphere — the most distinctive UI element in the system

```css
.bot-bubble {
  position: fixed; left: 24px; top: 50%; transform: translateY(-50%);
  width: 66px; height: 66px; border-radius: 50%;
  background: radial-gradient(circle at 38% 32%, #c0607a 0%, #7a1530 48%, #3d0a14 100%);
  /* 3D sheen highlight: */
  box-shadow:
    0 4px 18px rgba(122,21,48,.32),
    0 1px 5px rgba(0,0,0,.22),
    inset 0 -3px 8px rgba(0,0,0,.22);
  animation: bubblePulse 5s ease-in-out infinite;
  opacity: .88;
}
/* Highlight sheen overlay: */
.bot-bubble::before {
  content: '';
  position: absolute; top: 9px; left: 12px;
  width: 30px; height: 14px;
  background: radial-gradient(ellipse, rgba(255,255,255,.32) 0%, rgba(255,255,255,0) 100%);
  border-radius: 50%; transform: rotate(-20deg);
}
.bot-bubble:hover {
  transform: translateY(calc(-50% - 4px)) scale(1.06); opacity: 1;
}
```

### CSS Bot Face (inside bubble)
```css
.bot-eye {
  width: 7px; height: 7px; border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 6px rgba(255,255,255,.9), 0 0 12px rgba(255,220,220,.6);
  animation: eyeGlow 3s ease-in-out infinite;
}
.bot-smile {
  width: 18px; height: 8px;
  border: 2.5px solid rgba(255,255,255,.85);
  border-top: none;
  border-radius: 0 0 22px 22px;
}
```

### Tooltip Label (beside bubble)
```css
.bubble-label {
  position: absolute; left: 92px; top: 50%; transform: translateY(-50%);
  background: var(--bordeaux-dark); color: #fff;
  padding: 6px 12px; border-radius: 20px; white-space: nowrap;
  opacity: 0; transition: opacity .2s; pointer-events: none;
}
.bubble-label::after {
  /* RTL arrow pointing left */
  content: ''; position: absolute;
  right: 100%; top: 50%; transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: var(--bordeaux-dark);
}
.bot-bubble:hover .bubble-label { opacity: 1; }
```

### Float Panel
```css
.bot-float-panel {
  position: fixed; left: 116px; top: 50%;
  transform: translateY(-50%) scale(0.85);
  width: 340px; border-radius: 20px;
  background: #fff;
  box-shadow: 0 12px 48px rgba(74,8,24,.22), 0 2px 12px rgba(0,0,0,.14);
  opacity: 0; pointer-events: none;
  transition: transform .3s cubic-bezier(.34,1.2,.64,1), opacity .25s ease;
}
.bot-float-panel.open {
  transform: translateY(-50%) scale(1); opacity: 1; pointer-events: all;
}
.bot-float-head {
  background: linear-gradient(135deg, var(--bordeaux) 0%, var(--bordeaux-dark) 100%);
  border-radius: 20px 20px 0 0;
  padding: 14px 16px 12px;
}
```

**כלל:** Float panel פתוח רק ב-`lesson` mode (לא ב-group, לא ב-project). נסגר אוטומטית במעבר mode.

---

## 14. Animation Library

| שם | CSS | משמש ב- |
|----|-----|---------|
| `pulse` | scale 1→1.08, box-shadow expand | waiting room W-pulse icon |
| `bubblePulse` | box-shadow glow (5s, subtle) | bot bubble idle |
| `projectPulse` | box-shadow ring (2.5s, indigo) | project entry button |
| `doorFade` | opacity 0→1 (.5s) | door overlay |
| `doorCardIn` | scale .7→1 + opacity (.6s, bounce) | door card |
| `modalPop` | scale .92→1 + opacity (.3s, bounce) | all modals |
| `cardIn` | translateY(6px)→0 + opacity (.3s) | activity card entry |
| `contribFadeIn` | translateY(5px)→0 + opacity (.3s) | contribution items |
| `descIn` | translateY(-4px)→0 + opacity (.2s) | stage description |
| `ticketPop` | scale .6→1 (.4s, heavy bounce) | golden ticket reveal |
| `dotPulse` | opacity 1→.4 (2s) | live indicator dots |
| `statusPulse` | opacity 1→.5 (1s) | group member writing |
| `callPulse` | opacity 1→.6 (1s) | call teacher button |
| `timerPulse` | opacity 1→.5 (1s) | group timer urgent |
| `micPulse` | box-shadow ring (1s, red) | mic recording |
| `eyeGlow` | box-shadow glow (3s) | bot eyes |
| `emptyPulse` | opacity 1→.5 (2s) | empty state icon |

**כלל:** כל pulse/glow animations — `ease-in-out`, 2–5 שניות. Entry animations — `cubic-bezier(.34,1.2–1.56,.64,1)` (spring bounce), 0.3–0.6 שניות.

---

## 15. Mode-Driven CSS Architecture

### עיקרון
כל ה-visibility switches של lesson modes עובדים דרך CSS בלבד, ללא JS show/hide.  
הכלי: `#lessonScreen[data-mode="lesson|project|group"] .selector { display: ... }`

### מדוע זה חשוב
- אין פיזור של `el.style.display = ...` בכל הקוד
- מעבר mode = `document.getElementById('lessonScreen').dataset.mode = name`
- ניתן לראות בצורה מלאה ב-CSS איזה elements שייכים לאיזה mode

### Pattern מלא (דוגמה)
```css
/* Default: hidden everywhere */
.panel-bookshelf    { display: none; }
.panel-project-stages { display: none; }
.panel-group-members  { display: none; }

/* lesson mode */
#lessonScreen[data-mode="lesson"] .panel-bookshelf    { display: flex; }
#lessonScreen[data-mode="lesson"] .project-enter-btn  { display: flex; }

/* project mode */
#lessonScreen[data-mode="project"] .panel-project-stages { display: flex; }
#lessonScreen[data-mode="project"] .sprint-stepper       { display: block; }
#lessonScreen[data-mode="project"] .l-layout             { grid-template-columns: 240px 1fr 320px; }

/* group mode */
#lessonScreen[data-mode="group"] .panel-group-members  { display: flex; }
#lessonScreen[data-mode="group"] .group-task-area      { display: flex; }
#lessonScreen[data-mode="group"] .chat-panel           { display: flex !important; }
```

---

## 16. Migration Gap Analysis

### `waiting_lobby.html` — מה חסר ביחס לדמו

| אלמנט | דמו | הדף הנוכחי | Gap |
|-------|-----|------------|-----|
| **Topbar style** | Dark gradient `#0f172a→#1e3a8a→#0369a1` + border | White glass hero card | **Critical** — אין topbar כהה |
| **Background** | `linear-gradient(135deg, #f0f9ff, #e0f2fe, #eff6ff)` | `radial-gradient` + teal/gold | **Minor** — שונה, לא בהכרח גרוע |
| **Pulse animation** | Icon circle עם `pulse` animation | אין animation | **Medium** |
| **Project entry buttons** | 2 כפתורים: teal + indigo, pill-shaped, gradient | אין | **Critical** — פיצ'ר חסר |
| **Waiting hero layout** | W-grid 3 columns עם cards | Grid דומה | **Minor** |
| **Door transition animation** | Full-screen overlay עם door-card | אין | **Medium** |

### `lesson_view.html` — מה חסר ביחס לדמו

| אלמנט | דמו | הדף הנוכחי | Gap |
|-------|-----|------------|-----|
| **Topbar border** | `border-bottom: 2px solid #1e40af` | חסר | **Minor** |
| **Three-column layout** | Grid responsive + mode-driven column counts | Grid קיים | **Low** |
| **Context Rail** | Stage progress bar עם connected boxes | אין | **Medium** |
| **Activity card** | Card עם gradient header + block labels + label bar | Basic card | **Medium** |
| **Bot bubble** | Bordeaux 3D sphere + CSS face + float panel | iframe embed בלבד | **Critical** — חוויה שונה לחלוטין |
| **Peer review panel** | Rubric pills + emoji bank + success state | אין | **Critical** — פיצ'ר חסר |
| **Submission success state** | CSS class `.submitted` + banner | אין | **Medium** |
| **Broadcast banner** | Red gradient banner + animated dot | כנראה קיים | **Low** |
| **Group mode workspace** | Contribution feed + master draft + veto | אין | **Critical** — פיצ'ר חסר |
| **Mode-driven CSS** | `data-mode` architecture | JS show/hide | **Medium** — refactor |
| **Bot activity context line** | Subtitle under tabs: "ליווי למשימה: ..." | אין | **Minor** |

### `style.css` (global) — מה חסר

| מצב | ערך |
|-----|-----|
| Design tokens חסרים | `--bordeaux*`, `--emerald*` לא ב-global CSS |
| Animation library | לא documented, מפוזר בדפים |
| Chip system | חלקי — variants חסרים |
| Button system | sub-btn variants חסרים מה-global |

---

## Migration Priority Order

1. **Phase 1** (עם Infrastructure): הוסף `border-bottom: 2px solid #1e40af` ל-`lesson_view.html` topbar. הוסף Design Tokens ל-`style.css`.
2. **Phase 2** (עם Peer Review): הוסף Peer Review Panel CSS. הוסף `.submission-panel.submitted` state.
3. **Phase 3** (עם Group): הוסף Group Mode CSS (contribution feed, master draft, veto). הוסף Team Project CSS.
4. **Opportunistic**: הוסף Bot Bubble + Float Panel CSS. הוסף waiting room topbar כהה. הוסף door animation.

---

*מסמך זה נכתב 2026-04-16. כל שינוי עיצובי שאינו קיים בדמו חייב עיון מחדש — הדמו הוא ה-reference.*
