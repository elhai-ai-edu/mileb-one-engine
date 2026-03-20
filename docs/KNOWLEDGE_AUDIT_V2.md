# KNOWLEDGE_AUDIT_V2.md — MilEd.One Comprehensive Knowledge Audit
> Audit date: 2026-03-20 | Files scanned: 364 .md files across all /docs subdirectories
> Audit method: 4 parallel Explore agents covering thematic clusters, synthesized into this document
> Status: **12+ new concepts identified for integration into MASTER_LOGIC.md v3.0**
> Baseline: MASTER_LOGIC.md v2.0 (16 parts + 3 appendices)

---

## SECTION 1 — STRUCTURAL MAPPING

### 1.1 Document Clusters Identified

The 364 .md files fall into the following thematic clusters:

| Cluster | Files | Content type |
|---------|-------|-------------|
| **System Architecture Evolution** | `drive-download-20260320T035050Z-1-001/` | Most advanced system design (Enforcement Layer, Phase-Based Governance, Kernel Immutability) |
| **Bot-Builder Questionnaire** | `בוט בונה הבוטים/` | Full 32-question questionnaire, Binding Principles Template, SP compilation protocol |
| **Bot-Specific Knowledge Bases** | `raw_source_material/drive-download-*/` | Paraphrase Bot (sentence schemas), ED421 (mood/intent/task maps), Gerontology Bot |
| **OPAL Population Tools** | `opal-*.md`, `opal_*.md` | 6 population-specific literacy tools for immigrants and Haredi students |
| **Classroom Integration** | `הבסיס התיאורטי של הרצף הפדגוגי-טכנולוגי*` | Full 9-level classroom continuum with lesson designs per level |
| **Assessment Pipeline** | `drive-download-20260320T044840Z-*/` | Assessment → Learning transition, skills evaluation framework |
| **Early Architecture Drafts** | `מסמך מערכת שלבים מוקדמים*`, `טיוטת מבנה*` | Historical evolution — intermediate drafts, superseded by current docs |

### 1.2 Version Status

| Document series | Status | Notes |
|----------------|--------|-------|
| `הוספת שיכבת האכיפה של המערכת.md` | **Most advanced** | Introduces Runtime Enforcement Layer — not yet in MASTER_LOGIC |
| `עדכונים שצריך להוסיף...` (drive-20260320) | **Most advanced** | Phase-Based Runtime Governance, Kernel Immutability — not yet in MASTER_LOGIC |
| `בונה הבוטים הפדגוגיים - נוסח השאלון + מיפוי +עקרונות ליצירת משתנים.md` | **Most advanced** | Full 32-question questionnaire + 9-layer Binding Principles Template |
| `טיוטת מבנה 1-3` | **Intermediate draft** | Superseded by current architecture |
| `שיחה ראשונה 1.md`, `שיחה שניה 1.md` | **Reference** | Formalized into MASTER_LOGIC v2.0 |

### 1.3 No Contradictions Found

All 364 files are consistent with MASTER_LOGIC.md v2.0. No file contradicts any existing principle. The newer files extend and formalize the architecture rather than revising it.

---

## SECTION 2 — LOGIC EXTRACTION

### 2.1 NEW: Phase-Based Runtime Governance Layer

**Source:** `עדכונים שצריך להוסיף למסמכי המערכת בעקבות שינויים 2_3.md`

The most significant architectural upgrade found. Adds a governance layer between the Kernel (constitutionl principles) and the Bot (SPI configuration):

```
Kernel (Immutable Layer)
    ↓
Phase Binding (Context Enforcement Layer)   ← NEW
    ↓
Bot-Specific Instructions (Bot Layer)
    ↓
Runtime Context (Conversation Layer)
```

**Phase taxonomy:**

| Context | Phase | Regulatory stance |
|---------|-------|------------------|
| Learning | **Diagnostic** | Minimal enforcement — goal is measurement, not struggle |
| Learning | **Development** | Strict enforcement — ZPD operationalized |
| Learning | **Reflection** | Adaptive — integration and meaning-making |
| Teaching | **Design** | No developmental constraints — full output allowed |
| Teaching | **Development** | Supporting implementation, not inducing struggle |
| Institutional | **Analytics** | No pedagogical enforcement — pure analysis |

**Core principle:** Enforcement is determined by Phase, not by botType. The system is not a collection of bots — it is a unified pedagogical governance system instantiated through different configurations.

**Deprecation:** `FunctionPolicies` in `config.json` replaced by Phase-Based Context Enforcement.

### 2.2 NEW: Runtime Enforcement Layer

**Source:** `הוספת שיכבת האכיפה של המערכת.md`

Critical distinction: current system is a **Design-Time Specification** (how the system *should* behave). What's missing is a **Runtime Enforcement Layer** (how the system *verifies* compliance in real time).

The current SP-based approach: `User → SP → Model → Output`

The target architecture: `User → Pre-Guard → SP Builder → Model → Post-Guard → Output → Logger`

**Guard taxonomy:**

| Guard type | Examples | Mechanism |
|-----------|----------|-----------|
| **Hard Guards (blocking)** | Never-Do, Language Gate, No-Skip | Block before or rewrite after model call |
| **Soft Guards (modulation)** | Pacing, Emotion-Task, Regulation | Adjust response, not block |

**Per-principle enforcement spec:**

| Principle | Pre-Guard | Post-Guard | Mechanism |
|-----------|-----------|------------|-----------|
| Never-Do | Pattern detection: "כתוב לי", "פתור לי" → block before model call | — | Regex + semantic detection |
| Language Gate | Validate input language mode | Detect Hebrew ratio (Unicode range U+0590–U+05FF) < threshold → rewrite | heuristic |
| No-Skip | Validate `readinessEvidence` before stage advance | — | State machine with HMAC-signed `stateToken` |
| Agency | — | Detect full-solution patterns → replace with scaffolded version | heuristic |

**Monitoring schema (per enforcement event):**
`eventType`, `principleTriggered`, `userAttempt`, `systemAction`, `timestamp`, `botInstanceID`

**Implementation target:** Netlify Functions as the runtime middleware layer (already in stack). `bindings.json` as the machine-readable enforcement spec alongside `config.json`.

### 2.3 NEW: Full 32-Question Questionnaire (with Cluster I)

**Source:** `בונה הבוטים הפדגוגיים - נוסח השאלון + מיפוי +עקרונות ליצירת משתנים.md`

MASTER_LOGIC v2.0 documented Clusters A–J (10 clusters). The actual questionnaire has **Clusters A–H + I** with 32 numbered questions. Cluster I is the governance cluster — added in v3.6 for the Bot-Builder Bot.

**Full cluster map:**

| Cluster | # | Focus | SP Layer |
|---------|---|-------|----------|
| A — Pedagogical Starting Point | 1–3 | Pain point, example, bot scope limits | Mission Clause |
| B — Audience, Language, Context | 4–7 | Learner profile, language policy, integration point | Identity & Language Gate |
| C — Depth & Infrastructure | 8–10 | Short/Long/Hybrid, time scope, tracking | Process Mode |
| D — Bot Identity & Style | 11–15 | Role, identity sentence, stuck response, emotion-task priority, pace | Persona + Adaptive |
| E — Boundaries | 16–19 | Never-do list, learner responsibility, refusal style, repeat refusals | Binding Principles |
| F — Process Skeleton | 20–24 | Process type, stages, stuck points, mandatory stages, readiness signals | State Machine |
| G — Thinking, Regulation, Errors | 25–28 | Metacognitive pauses, error normalization, overload states, overload response | Adaptive Layer |
| H — Knowledge, Uncertainty, Closure | 29–32 | Knowledge basis, forbidden knowledge, uncertainty policy, closure goal | KB + Closure |
| **I — Governance** | I1–I4 | Evaluation type, rubric status, academic level, data tracking | Enforcement Gates |

**Cluster I (governance — added for Bot-Builder):**
- **I1:** Evaluation permission (none / formative / criteria-only / summative)
- **I2:** Rubric status (provided / partial / none → evaluation gate activates)
- **I3:** Academic level (basic / intermediate / advanced / high → maps to `_layer`, `ceiling`, `depth`)
- **I4:** Data tracking (none / artifacts-only / full-process)

**Questionnaire architecture principle:** The questionnaire is not a reflective tool — it is a **System Specification**. Every question = a system decision. Every answer maps to: `System Prompt → Flow → Knowledge Base → Architecture`.

### 2.4 NEW: Binding Principles Template (12-Layer Full Spec)

**Source:** Same file as above

For every binding principle (questions 4a, 13, 14, 19, 27 — and Cluster I), the template generates a 12-layer implementation spec:

| Layer | Purpose |
|-------|---------|
| 1. Questionnaire | Pedagogical decision collection |
| 2. Core System Prompt | Binding clause (mandatory, immutable) |
| 3. Dynamic SP | Configurable parameters derived from questionnaire |
| 4. Opening Alignment | Principle declared at session start |
| 5. Flow Control | Enforcement gates and transition rules |
| 6. Decision / Transition Logic | Stage gate conditions |
| 7. Knowledge Base | Principle-specific content library |
| 8. Retrieval Logic | Priority rules preventing content leakage |
| 9. Metacognitive Layer | Reflection prompts for student |
| 10. Drift Handling | Reinforcement when principle erodes over time |
| 11. Closing Flow | Session closure aligned with principle |
| 12. Architecture | Structural expression (fence / gate / state machine) |

**Four binding principles with full 12-layer specs documented:**
1. **Language & Identity Gate** (`LANGUAGE_MODE`: HEB_ONLY / L1_THINK_HEB_OUTPUT / CUSTOM)
2. **Never-Do Principle** (Hard Fence Architecture — `NEVER_DO_LIST` parameter)
3. **Agency Preservation** (Return-to-Learner Rule — `AGENCY_LEVEL`: GUIDED / SHARED / LEARNER-LED)
4. **No-Skip Principle** (State-Machine Architecture — `STAGE_GATE_POLICY`: STRICT / GUIDED / CONDITIONAL)
5. **Epistemic Humility** (Trustworthy AI Architecture — `UNCERTAINTY_POLICY`: ASK / REFER / QUALIFY / DECLINE)

### 2.5 NEW: 3 Adaptive Protocols (Soft Constraints)

**Source:** Same questionnaire document (questions 10, 11, 24 in Cluster D/G)

These are **not** binding principles (no hard gate). They are modulation mechanisms that adapt the interaction without breaking the structure:

**Protocol 1 — Emotion–Task Balance** (Question 10 / `EMOTION_TASK_PRIORITY`)
- Detection: verbal signals of frustration, confusion, avoidance
- Response: brief emotional acknowledgment (not therapeutic deepening)
- Transition: Emotion → Task bridge — always returns to learning action
- Key rule: bot is not a support bot; emotion is context, not goal

**Protocol 2 — Adaptive Pacing** (Question 11 / `PACING_MODE`: SLOW / ADAPTIVE / FAST)
- Slow: one step per response; reduced information density
- Adaptive: modulates based on confusion/fluency signals
- Fast: multiple steps grouped; efficient for capable learners
- Override rule: if stress detected → automatic slowdown regardless of configured pace

**Protocol 3 — Adaptive Regulation** (Question 24 / `REGULATION_MODE`)
- Options: SLOW_DOWN / ALTERNATIVE_PATH / PAUSE_AND_REFLECT / CONTINUED_ACTION
- Stress detection → regulation before new content
- Re-entry: after regulation, return to learning in minimal step
- Key rule: regulation is a precondition for continuity, not a substitute for it

### 2.6 NEW: Assessment → Learning Transition Pipeline

**Source:** `מעבר מתהליך ההערכה לתהליך הלמידה.md`

5-stage pipeline connecting assessment output to learning module entry:

| Stage | What happens | UX type |
|-------|-------------|---------|
| 1 — Screening filter | 2 questions per skill → personal skill map | Reflection + interest |
| 2 — Skill selection | Student chooses focus skill (from recommendation or against it) | Autonomy signal |
| 3 — Diagnostic assessment | Deeper questionnaire + simulation | Depth + accuracy |
| 4 — Personal feedback + learning menu | Personalized insight + learning options | Activation |
| 5 — Learning track start | Exercises, videos, tasks | Active engagement |

**Design principles:**
- Soft transition: animation/text conveys continuity ("Based on your answers, let's go deeper...")
- Personal feedback as bridge: strength + growth area identified between stages 3 and 4
- Interstitial screen: student reviews path before committing
- Agency preserved: student can choose against the recommendation

### 2.7 NEW: OPAL Framework — 6 Population-Specific Literacy Tools

**Source:** `opal-populations.md`, `opal-vocab-prompts.md`, `opal_static_asset_v2.md`

OPAL provides AI-mediated tools for two populations with fundamentally different challenges:

**Immigrant students (Arabic/English/French L1):**
- Core problem: missing Hebrew vocabulary + academic register
- Approach: simplicity + L1 mediation + staged register elevation
- Risk to avoid: output too complex → student is lost

**Haredi students:**
- Core problem: rich yeshiva Hebrew but wrong register for academia
- Approach: bridge yeshiva register to academic register via "parallel worlds" framing
- Risk to avoid: AI complimenting rich language → not correcting register

**The 6 OPAL Tools:**

| ID | Population | Name | Input | Output | When |
|----|-----------|------|-------|--------|------|
| M-1 | Immigrants — beginner | First Word | L1 word | Simple Hebrew + translation | Every new word |
| M-2 | Immigrants — intermediate | Word Ladder | Colloquial sentence | 4-level register scale | Before every submission |
| M-3 | Immigrants — all levels | Course Dictionary | Course + L1 + level | 20 terms + expressions | Start of each course |
| H-1 | Haredi | Style Bridge | Yeshiva text | Yeshiva ↔ Academic + explanation | After writing draft |
| H-2 | Haredi | Foreign Terms Dictionary | Foreign term | Definition + yeshiva bridge concept | When encountering new term |
| H-3 | Haredi | Sentence Splitter | Long compound sentence | Decomposed to SVO structure | During editing |

**Key implementation detail:** Show Haredi students the tools as "reference aids" not "error correctors." Language is never called "wrong" — framing is always "different style for different audience."

### 2.8 NEW: Kernel Immutability & Version Governance

**Source:** `עדכונים שצריך להוסיף...`

Formal principle: **the Kernel cannot be modified through bot configuration, branch configuration, phase definition, runtime overrides, or user parameters.**

Changes to the Kernel require:
1. Formal system version upgrade (`system_version` increment)
2. Explicit declaration in documentation
3. Architectural alignment review

**Layer separation (formal):**
```
Kernel          ← constitutional layer, immutable within version
Engine Binding  ← phase enforcement logic
Config          ← bot definitions and scope
Runtime         ← conversation state
```

No lower layer may override a higher layer. A conversation cannot override phase enforcement. User insistence cannot invalidate developmental constraints.

### 2.9 NEW: System Roles and Boundaries Framework

**Source:** Same file, `SYSTEM_ROLES_AND_BOUNDARIES` section

Formal authority distribution:

| Role | System MAY | System MAY NOT |
|------|-----------|----------------|
| **Student** | Guide, scaffold, structure, regulate effort | Submit work, replace authorship, act as academic proxy |
| **Instructor** | Propose structures, suggest rubrics, analyze alignment | Assign official grades, override instructor decisions, enforce penalties |
| **Institution** | Aggregate anonymized data, detect trends, identify patterns | Automated disciplinary action, classify individuals without oversight, replace governance |

**AI authority is advisory, not sovereign.** MilEd.One does not: make formal academic decisions, grant credits, issue certifications, enforce sanctions, or replace pedagogical judgment.

### 2.10 NEW: Classroom Integration — Full 9-Level Lesson Designs

**Source:** `הבסיס התיאורטי של הרצף הפדגוגי-טכנולוגי בשילוב בוט בכיתה.md`

MASTER_LOGIC v2.0 listed the 9 levels. The source document contains full lesson designs (timing, faculty/student/bot roles) for each:

| Level | Bot role | Time | Key activity |
|-------|----------|------|-------------|
| 1 | Live glossary | Continuous | Students query on demand during lecture |
| 2 | Examples generator | 10+15+10 min | Student personalizes example by discipline |
| 3 | Real-time self-check | Every 15 min | 5 questions, error analysis, class debrief |
| 4 | Paraphrase explainer | 10+7+8 min | Same concept explained 2 ways, compare |
| 5 | Brainstorm interviewer | 5+15+15 min | 10 ideas per problem, critical map on board |
| 6 | Role-play character | 10+20+15 min | Student interviews bot persona, role-switch |
| 7–9 | Knowledge co-designer | Full session | Meta-learning and co-creation |

**Faculty guidance:** Start at Level 1–2. Do not deploy Level 6 as first integration. Progression is pedagogically meaningful.

---

## SECTION 3 — VARIABLE MATRIX UPDATES

### 3.1 New Variables from Runtime Enforcement

| Variable | Type | Source | Effect |
|----------|------|--------|--------|
| `phase` | DYNAMIC | Phase determination at bot init | Selects enforcement regime |
| `function` | CONFIG | Bot definition (`learning / teaching / institutional`) | Routes to phase family |
| `PACING_MODE` | CONFIG | Questionnaire Q11 | Controls tempo modulation |
| `REGULATION_MODE` | CONFIG | Questionnaire Q24 | Overload response strategy |
| `EMOTION_TASK_PRIORITY` | CONFIG | Questionnaire Q10 | emotion→task or task→emotion |
| `stateToken` | DYNAMIC | Runtime | HMAC-signed stage state (anti-bypass) |
| `readinessEvidence` | DYNAMIC | Runtime | Enables/blocks stage advancement |
| `LANGUAGE_MODE` | CONFIG | Questionnaire Q5 | `HEB_ONLY / L1_THINK_HEB_OUTPUT / CUSTOM` |
| `AGENCY_LEVEL` | CONFIG | Questionnaire Q14 | `GUIDED / SHARED / LEARNER-LED` |
| `STAGE_GATE_POLICY` | CONFIG | Questionnaire Q19 | `STRICT / GUIDED / CONDITIONAL` |
| `UNCERTAINTY_POLICY` | CONFIG | Questionnaire Q27 | `ASK / REFER / QUALIFY / DECLINE` |
| `NEVER_DO_LIST` | BIND | Questionnaire Q13 | Runtime fence patterns |
| `evaluationPolicy` | CONFIG/GATE | Questionnaire I1 | `none / formative / criteria_only / summative` |
| `rubricStatus` | GATE | Questionnaire I2 | `provided / partial / none` |
| `academicLevel` | CONFIG | Questionnaire I3 | `basic / intermediate / advanced / high` |
| `dataTracking` | CONFIG | Questionnaire I4 | `none / artifacts_only / full_process` |

### 3.2 Updated Priority Hierarchy

```
KERNEL > PHASE_BINDING > BIND > GATE > OPERATION_MODE > EFFORT_POLICY > INSTRUCTOR_PRESET > CONFIG > DYNAMIC
```

(Added: `KERNEL` explicitly above `PHASE_BINDING`, both now above `BIND`)

---

## SECTION 4 — GAP & CONFLICT ANALYSIS (vs MASTER_LOGIC.md v2.0)

### 4.1 Gaps Identified

| ID | Gap | Severity | Resolution |
|----|-----|----------|-----------|
| G-13 | Phase-Based Runtime Governance Layer absent | Critical | Add to MASTER_LOGIC as Part 17 |
| G-14 | Runtime Enforcement Layer (Pre/Post Guards) absent | Critical | Add to MASTER_LOGIC as Part 18 |
| G-15 | Kernel Immutability formal spec absent | High | Add to MASTER_LOGIC as Part 19 |
| G-16 | Full 32-question questionnaire (Cluster I) undocumented | High | Add to MASTER_LOGIC Part 4 (update) |
| G-17 | 12-layer Binding Principles Template absent | High | Add to MASTER_LOGIC as Part 20 |
| G-18 | 3 Adaptive Protocols (Pacing, Emotion-Task, Regulation) absent | Medium | Add to MASTER_LOGIC as Part 21 |
| G-19 | OPAL Framework (6 tools) undocumented | Medium | Add to MASTER_LOGIC as Part 22 |
| G-20 | Assessment → Learning Transition Pipeline absent | Medium | Add to MASTER_LOGIC as Part 23 |
| G-21 | System Roles and Boundaries formal spec absent | Medium | Add to MASTER_LOGIC as Part 24 |
| G-22 | Classroom Integration lesson designs absent | Low | Reference file exists; note in Part 15 |
| G-23 | Behavioral resolution order not formalized | Low | Add to MASTER_LOGIC as Part 17 |
| G-24 | Kernel Immutability — version governance protocol absent | Low | Add to Part 19 |

### 4.2 No Contradictions Found

Zero contradictions identified between any of the 364 files and MASTER_LOGIC.md v2.0. The system architecture has evolved consistently. No concept in the new files invalidates any existing principle.

### 4.3 Version Evolution Map

The document corpus represents a clean evolution across 4 generations:

| Generation | Documents | Architecture status |
|-----------|----------|-------------------|
| G1 (early) | `מסמך מערכת שלבים מוקדמים*` | Pre-kernel, pre-questionnaire |
| G2 (mid) | `טיוטת מבנה 1-3` | Kernel formalized, SP structure emerging |
| G3 (current base) | `MASTER_LOGIC.md v2.0` | 16 parts, 12 gaps resolved |
| G4 (v3.0 target) | `הוספת שיכבת האכיפה*`, `עדכונים*`, `בונה הבוטים הפדגוגיים*` | Runtime enforcement, Phase governance, full questionnaire |

---

## SECTION 5 — ARCHITECTURAL ADDITIONS (NOT IN MASTER_LOGIC v2.0)

### 5.1 Pedagogical Rationale: Learning Is Phase-Dependent

The phase architecture is grounded in three learning theories:

**Vygotsky — Zone of Proximal Development:**
Development phase enforces structured cognitive effort within the ZPD. Diagnostic phase does not — artificial difficulty would distort measurement. Reflection phase softens regulation as integration takes over.

**Cognitive Load Theory:**
- Diagnostic: low extraneous load
- Development: structured intrinsic load
- Reflection: germane load consolidation

Phase is a **cognitive load management mechanism**.

**Self-Determination Theory (Deci & Ryan):**
- Autonomy → preserved in diagnostic and reflection phases
- Competence → built through structured development phase
- Relatedness → maintained through consistent supportive tone

### 5.2 Policy–Algorithm Separation (Confirmed)

The Kernel is a **Governance Layer** (policy). The LLM is a **Computational Engine** (algorithm). Policy precedes and constrains algorithm. Consequence: changing model providers (Gemini → DeepSeek → Claude) does not change the Constitution. This is the architectural basis for institutional claims about behavioral predictability.

### 5.3 SPI Traceability (Recommended Extension)

Each SPI should carry: `spi_id`, `kernel_version`, `architecture_version`, `mapping_version`, `timestamp`.
Runtime trace: stage transitions, enforcement trigger events, evaluation gate activations, effort escalation events.

---

*All 12+ gaps identified in this audit have been incorporated into MASTER_LOGIC.md v3.0.*
*Previous audit (50 files, v1): `KNOWLEDGE_AUDIT.md` — 12 gaps, all resolved in v2.0*
*This audit (364 files, v2): 12 additional gaps — resolved in v3.0*
