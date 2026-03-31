# CLAUDE.md — MilEd.One Project Instructions

## Project Overview

**MilEd.One** is a single-engine pedagogical AI platform for Israeli colleges. All bots are System Prompt Instances (SPIs) — configurations of one engine, not separate systems. The engine is `functions/chat.js`. The LLM provider is OpenRouter (Gemini 2.0 Flash / Flash Thinking).

---

## CRITICAL: Bot-Building Logic

**All bot design decisions must follow `docs/MASTER_LOGIC.md`.**

This is the single authoritative reference for:
- The 8-layer System Prompt structure (what every bot's SP must contain)
- Pedagogical DNA taxonomy (11 types) and bot archetype classification
- The 5 bot type configurations (Universal, Course Companion, Gatekeeper, Skill, Faculty)
- The questionnaire logic and variable mapping (Clusters A–I, 32 questions → SP variables)
- Variable type classification (BIND / CONFIG / STRUCT / SOFT / EXPRESSIVE / DYNAMIC)
- The 9-level classroom integration continuum
- The OPAL 30-tool library (6 tiers, immigrant + Haredi tracks)
- KB Architecture Template (8 module types)
- Drift Handling & Escalation Protocols
- The One-Engine Principle and config.json hierarchy
- What is locked (Kernel) vs what is open (configurable)
- Session Continuity Token format
- The 6-step opening sequence
- Hebrew level adaptation codes
- **The Bot Architect Engine** (Part 31) — meta-layer that produces new bot SPs from faculty input
- **The Architect Studio UX** (Part 32) — isolated faculty-facing interface for bot-building sessions

**Never design a bot without first consulting `docs/MASTER_LOGIC.md`.**

---

## Key Files

| File | Purpose |
|------|---------|
| `docs/MASTER_LOGIC.md` | **PRIMARY** — Bot architecture reference (v4.2, 32 parts + 8 appendices) |
| `docs/BOT_ARCHITECT_SP.md` | System Prompt for the Bot Architect (4-stage logic, 8 Stress Tests, export engine) |
| `docs/STRATEGIC_MAP_V3.md` | Human-readable synthesis — Bot Zoo, Variable Library, ED421 Bridge, Evolution Highlights |
| `docs/KNOWLEDGE_AUDIT_V3.md` | Deep strategic audit — 34 gaps (G-25–G-58), 11 evolution conflicts, bot taxonomy |
| `docs/KNOWLEDGE_AUDIT_V2.md` | Comprehensive audit — 364 files, 12 new gaps, v3.0 gap evidence trail |
| `docs/KNOWLEDGE_AUDIT.md` | Earlier audit — 9 bot types, variable matrix, 12 original gap resolutions (v2.0) |
| `docs/🧭 MASTER SYSTEM DOCUMENT.md` | Full 8-level architectural specification |
| `docs/system_map.md` | Layer reference table |
| `docs/system_overview.md` | Concise system summary |
| `docs/02_sp_structure.md` | 8-layer SP skeleton detail |
| `docs/03_system_mapping.md` | Variable families |
| `docs/04_questionnaire_spec.md` | Questionnaire spec |
| `docs/05_spi_definition.md` | SPI definition |
| `docs/06_implementation_spec.md` | Code binding spec |
| `config.json` | All SPI configurations |
| `scripts/deploy_form.js` | One-time CLI: creates Tally form + webhook via Tally API. Run: `node scripts/deploy_form.js <TALLY_API_KEY>`. Outputs to `scripts/output/`. |
| `functions/chat.js` | Single engine — do not add per-bot logic here |
| `architect_studio.html` | Architect Studio — isolated faculty UI for bot-building sessions (3 sections + export hub) |
| `functions/architect_api.js` | Bot Architect API — Tally intake, session bootstrap, SP export (placeholder) |
| `functions/auth.js` | Cockpit login (reads Firebase admin/auth) |
| `functions/admin-auth.js` | Firebase CRUD for admin users |
| `functions/classroom.js` | Classroom session management |
| `functions/submit.js` | Student submission handler |

---

## Architecture Principles (Non-Negotiable)

1. **One engine.** All customization lives in `config.json`. Never add bot-specific code to `chat.js`.
2. **Kernel is supreme.** The 7 kernel principles (No-Skip, No-Substitution, Agency, etc.) cannot be configured away.
3. **Passwords live in Firebase**, not in `config.json`. The `admin/auth/{username}` path holds credentials.
4. **Session state lives in Firebase** at `sessions/{studentId}/{courseId}`. Never store state in `chat.js` memory.
5. **Metadata is always stripped server-side.** `<!-- META: -->` tokens are removed before reaching the frontend.
6. **The Bot Architect is a core system component.** It is the only authorized path for creating new bot SPs. New bots must be designed via `bot_architect` → 9-cluster questionnaire → 8 Stress Tests → assembled SP. Do not hand-craft SPs without this process. The architect routes through `/api/architect/*` — never through `/api/chat`.
7. **Architect Studio** (`architect_studio.html`) is the faculty-facing UI for bot-building sessions. It does not expose system-wide analytics or config. It is isolated from the general Cockpit.

---

## Development Rules

- **Bot systemPrompts:** Must follow the 8-layer skeleton in `docs/MASTER_LOGIC.md` — Appendix B checklist applies.
- **Phase assignment:** Every bot must declare `function` (learning/teaching/institutional) and `phase` (diagnostic/development/reflection/design/analytics). Phase determines enforcement regime — not botType.
- **New bot types:** Add to `config.json` only. Never create new Netlify functions for individual bots.
- **Config changes:** Bump `system_version` in `config.json` after any structural change.
- **Kernel changes:** Require `system_version` bump + MASTER_LOGIC.md update + architectural alignment.
- **Firebase path:** `sessions/{studentId}/{courseId}` for student state; `admin/auth/{username}` for credentials; `conversations/{sessionId}` for chat logs; `classes/{classId}` for lifecycle settings (lockDate, retentionDate); `authorized_users/{key}.isBypassingLock` for individual access override.
- **courseId vs classId:** `waiting_lobby.html`/`lesson_view.html` preserve `courseId` in routing, while classroom payloads use `classId` as the canonical key. `chat.js` destructures `classId` then aliases to `courseId`. Do not break this.
- **Hebrew responses:** All bot output is in Hebrew. System code and comments may be in English.

---

## /docs Directory Structure

```
docs/
  MASTER_LOGIC.md              ← START HERE for all bot design
  🧭 MASTER SYSTEM DOCUMENT.md ← Full spec (1700 lines)
  01_kernel_constitution.md    ← Kernel reference
  02_sp_structure.md           ← 8-layer skeleton
  03_system_mapping.md         ← Variable families
  04_questionnaire_spec.md     ← Questionnaire data
  05_spi_definition.md         ← SPI definition
  06_implementation_spec.md    ← Code binding
  system_map.md                ← Layer table
  system_overview.md           ← Summary
  BOT_ARCHITECT_SP.md          ← Bot Architect System Prompt (4 stages, 8 Stress Tests)
  STRATEGIC_MAP_V3.md          ← Human-readable project synthesis (Bot Zoo, Variable Library, ED421 Bridge)
  בוט בונה הבוטים/             ← Bot Builder module docs (legacy drafts)
  archive/                     ← Original .docx files (do not edit)
  raw_source_material/         ← Raw AI chats, drive uploads, early drafts
```

---

## Pending Technical Debt

| ID | Issue | Status |
|----|-------|--------|
| BP-2 | `spi_builder.js` reads `engine.kernel.public/.private` — these don't exist in config.json | Open |
| BP-3 | `create_sp.js` reads `config.functionPolicies` — deprecated, replace with Phase-Based enforcement | Open |
| PV-5 | Faculty bots with `scope: "global"` accessible to students | Open |
| AR-1 | `architect_api.js` — export bridge: `handleExport()` fully implemented | Completed |
| AR-2 | `architect_api.js` — intake & bootstrap: `handleTallyIntake()` + `handleBootstrapSession()` fully implemented; `architect_studio.html` wired to bootstrap endpoint | Completed |
| DL-1 | Data Lifecycle Management (v9.0.7) — lockDate/retentionDate per class in admin UI, isBypassingLock toggle per user, waiting/lesson gatekeeper, retention cleanup prompt | Completed |

---

## Firebase Seed Requirement

Before first deploy, seed `admin/auth/elhai` in Firebase Console:
```json
{
  "id": "f_elhai",
  "name": "נחום",
  "role": "superadmin",
  "password": "teach1"
}
```
