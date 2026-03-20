# KNOWLEDGE_AUDIT_V3.md — MilEd.One Deep Strategic Audit
> Audit date: 2026-03-20 | Scope: All 364 .md files across /docs subdirectories
> Audit method: 8 parallel Explore agents (two waves) across all /docs subdirectories — synthesized into this document
> Status: **34 gaps identified (G-25 through G-58); 11 evolution conflicts documented**
> Baseline: MASTER_LOGIC.md v3.0 (24 parts + 5 appendices) → updated to v4.0 (30 parts + 6 appendices)
> Critical note: "ED421" and "MilEd.One" are the same project. ED421 is the legacy name.

---

## SECTION 1 — OBJECTIVE 1: BOT ARCHETYPE DISCOVERY

### 1.1 Master Bot Taxonomy by Pedagogical DNA

Every distinct bot configuration found across all 364 files, classified by Pedagogical DNA:

| Bot | Pedagogical DNA | Phase | Function | Source Cluster |
|-----|----------------|-------|----------|----------------|
| **Innovation Project Bot** | SCAFFOLDING + GATEKEEPER | development + evaluative | learning | drive-20260320T034839Z |
| **Project Evaluator Bot** | EVALUATIVE | analytics | institutional | drive-20260320T034839Z |
| **Course Companion Bot** | HYBRID (SOCRATIC + INFORMATIONAL + SCAFFOLDING + EMOTIONAL) | development | learning | drive-20260320T034946Z |
| **Process Wizard Bot** | SCAFFOLDING + GATEKEEPER + EVALUATIVE | development | learning | drive-20260320T034946Z + 035050Z |
| **Faculty Mentor Bot** | SOCRATIC + TRANSFORMATIONAL | design | teaching | Bot Builder module |
| **Gatekeeper Validator Bot** | GATEKEEPER + EVALUATIVE | diagnostic + development | learning | MASTER_LOGIC (confirmed) |
| **Skill Developer Bot** | SCAFFOLDING + TRANSFORMATIONAL | development | learning | Multiple |
| **Reflection Orchestrator Bot** | EMOTIONAL + METACOGNITIVE | reflection | learning | Bot Builder Q25-28 |
| **Preparatory Literacy Bot** (ED421 era) | SCAFFOLDING + SOCRATIC | diagnostic + development | learning | drive-20260317T180337Z |
| **Paraphrase Trainer Bot** | SCAFFOLDING + TRANSFORMATIONAL | development | learning | drive-20260317T180500Z |
| **Assessment-to-Learning Transition Bot** | DIAGNOSTIC + EMOTIONAL | diagnostic | learning | מעבר מתהליך ההערכה |
| **OPAL: Word-in-Context Bot** | INFORMATIONAL + SCAFFOLDING | diagnostic | learning | opal-populations |
| **OPAL: Register Ladder Bot** | SCAFFOLDING + TRANSFORMATIONAL | development | learning | opal-populations |
| **OPAL: Course Glossary Bot** | INFORMATIONAL + EMOTIONAL | diagnostic | learning | opal-populations |
| **OPAL: Style Bridge Bot (Haredi)** | TRANSFORMATIONAL + EMOTIONAL | development | learning | opal-populations |
| **OPAL: Loanword Bridge Bot (Haredi)** | SCAFFOLDING + INFORMATIONAL + EMOTIONAL | development | learning | opal-populations |
| **OPAL: Sentence Splitter Bot (Haredi)** | TRANSFORMATIONAL + SCAFFOLDING | development | learning | opal-populations |
| **Research Qualitative Bot** | SOCRATIC + EVALUATIVE | development + reflection | learning | MASTER_LOGIC (confirmed) |
| **Analytics Bot** | INFORMATIONAL + ANALYTICAL | analytics | institutional | MASTER_LOGIC (confirmed) |
| **Universal SPI Bot** | HYBRID (all archetypes configurable) | any | any | MASTER_LOGIC core |

**9-Level Classroom Integration Bots** (from `הבסיס התיאורטי...md`):

| Level | Bot Role | DNA |
|-------|----------|-----|
| 1 | Live Dictionary | INFORMATIONAL |
| 2 | Custom Example Generator | SCAFFOLDING |
| 3 | Real-Time Self-Check | EVALUATIVE + SCAFFOLDING |
| 4 | Paraphraser | TRANSFORMATIONAL |
| 5 | Brainstorm Partner | GENERATIVE + SOCRATIC |
| 6 | Role-Player | EMOTIONAL + EXPERIENTIAL |
| 7 | Knowledge Mapper | SYNTHETIC |
| 8 | Diagnostician | EVALUATIVE + PERSONALIZED |
| 9 | Students as Bot Architects | TRANSFORMATIONAL + METACOGNITIVE |

### 1.2 Pedagogical DNA Classification System

The following taxonomy is **implicit** in the source files but **not formalized** in MASTER_LOGIC.md v3.0:

| DNA Type | Core Behavior | Typical Phase | Enforcement Level |
|----------|--------------|---------------|-------------------|
| **SOCRATIC** | Questions only; no direct answers | development | strict |
| **EVALUATIVE** | Rubric-based assessment | analytics/reflection | strict + gated |
| **INFORMATIONAL** | Explains and answers directly | diagnostic | minimal |
| **SCAFFOLDING** | Graduated support; fades over time | development | moderate |
| **TRANSFORMATIONAL** | Deep conceptual/stylistic change | development/reflection | moderate |
| **EMOTIONAL** | Wellbeing + motivation focus | any | minimal (soft) |
| **GATEKEEPER** | Blocks advancement until ready | development | strict |
| **GENERATIVE** | Produces options, then evaluates | development | moderate |
| **ANALYTICAL** | Institutional data interpretation | analytics | none |
| **METACOGNITIVE** | Reflection triggers, ownership prompts | reflection | adaptive |
| **HYBRID** | Combines multiple DNA types | varies | varies |

---

## SECTION 2 — OBJECTIVE 2: VARIABLE & MAPPING EXTRACTION

### 2.1 Complete Questionnaire → Variable Mapping Table

**Source:** `בונה הבוטים הפדגוגיים - נוסח השאלון + מיפוי +עקרונות ליצירת משתנים.md`

Full 32-question questionnaire with variable mappings across all 9 clusters:

| Cluster | Questions | Variables Generated | Variable Type | SP Layer |
|---------|-----------|---------------------|---------------|----------|
| **Cluster 0** — Opening & Emotional Grounding | Q0.1–Q0.4 | `OPENING_ALIGNMENT_FLOW`, `EMOTIONAL_INTAKE_MODE` | STRUCT | Opening Alignment Block |
| **Cluster A** — Pedagogical Starting Point | Q1–Q3 | `MISSION_CLAUSE`, `BOT_SCOPE`, `LEARNER_PROFILE` | CONFIG | Header (Layer 0) + Mission |
| **Cluster B** — Audience, Language, Context | Q4–Q7 | `LANGUAGE_MODE`, `AUDIENCE_LEVEL`, `CONTEXT`, `ENTRY_STATE` | CONFIG + **BIND** (Q4a) | Identity + Language Gate |
| **Cluster C** — Depth & Infrastructure | Q8–Q10 | `DEPTH_LEVEL`, `INTERACTION_MODE`, `TIME_HORIZON`, `DATA_TRACKING` | CONFIG | Process Mode |
| **Cluster D** — Bot Identity & Style | Q11–Q15 | `PERSONA`, `IDENTITY_SENTENCE`, `STUCK_PROTOCOL`, `EMOTION_TASK_PRIORITY`, `PACING_MODE` | CONFIG | Persona + Adaptive |
| **Cluster E** — Boundaries & Agency | Q16–Q19 | `NEVER_DO_LIST`, `AGENCY_LEVEL`, `REFUSAL_STYLE`, `ESCALATION_RULE` | **BIND** | Binding Principles (Layer 5) |
| **Cluster F** — Process Skeleton | Q20–Q24 | `PROCESS_TYPE`, `STAGES[]`, `STUCK_POINT_RECOVERY`, `MANDATORY_STAGES`, `READINESS_SIGNALS` | CONFIG + STRUCT | State Machine (Layer 6) |
| **Cluster G** — Thinking & Regulation | Q25–Q28 | `METACOGNITIVE_TRIGGER`, `ERROR_NORMALIZATION`, `OVERLOAD_DETECTION`, `REGULATION_MODE` | SOFT | Adaptive Layer (Layer 7) |
| **Cluster H** — Knowledge & Uncertainty | Q29–Q32 | `KB_DOMAINS`, `FORBIDDEN_KNOWLEDGE`, `UNCERTAINTY_POLICY`, `CLOSURE_GOAL` | CONFIG + **BIND** (Q27) | Knowledge Base + Closure |
| **Cluster I** — Governance *(NEW — added v3.6)* | I1–I4 | `EVALUATION_POLICY`, `RUBRIC_STATUS`, `ACADEMIC_LEVEL`, `DATA_TRACKING_LEVEL` | **BIND** | Enforcement Gates |

### 2.2 Variable Type Classification System

**Source:** `שיחה ראשונה 1/3` (Bot Builder development conversations)

The Bot Builder module uses a 6-type variable taxonomy not formalized in MASTER_LOGIC.md:

| Type | Meaning | Override Rule | Examples |
|------|---------|---------------|---------|
| **BIND** | Kernel-level — cannot be overridden by any config | Never overrideable | `SUBSTITUTION_POLICY`, `EVALUATION_POLICY`, `ENFORCEMENT_LEVEL`, `LANGUAGE_MODE` |
| **CONFIG** | Fully configurable — differentiates bot instances | Configurable by instructor | `DEPTH_LEVEL`, `DIALOGIC_STYLE`, `PACING_MODE` |
| **STRUCT** | Structural — defines FSM topology | Locked once defined | `STAGE_AWARENESS`, `OPENING_ALIGNMENT_FLOW` |
| **SOFT** | Adaptive within guardrails — modulates in real-time | Can shift within session | `TONE_INTENSITY`, `EFFORT_REGULATION_MODE`, `EMOTION_TASK_PRIORITY` |
| **EXPRESSIVE** | Style/phrasing variation | Fully flexible | Persona voice, greeting style |
| **DYNAMIC** | Real-time adaptation to student state | Runtime-only | `current_stage`, `attempt_count`, `mastery_flag` *(future)* |

### 2.3 Binding Principle Template Architecture (12-Layer)

**Source:** `בונה הבוטים הפדגוגיים - נוסח השאלון...` — "תבנית עקרון מחייב"

Every BIND-type variable generates a 12-layer implementation specification:

| Layer | Name | What It Specifies |
|-------|------|------------------|
| 1 | **Questionnaire Capture** | Which question generates this binding |
| 2 | **Core System Prompt Anchor** | The hardcoded SP clause |
| 3 | **Dynamic SP Injection** | How runtime parameters modify the clause |
| 4 | **Opening Alignment** | How bot declares the binding at conversation start |
| 5 | **Flow Control** | Enforcement within the conversation flow |
| 6 | **Decision / Transition Logic** | Gate conditions before stage advancement |
| 7 | **Knowledge Base** | Supporting content for this binding |
| 8 | **Retrieval Logic** | How KB is filtered for this binding |
| 9 | **Metacognitive Layer** | Reflection prompts triggered by this binding |
| 10 | **Drift Handling** | What happens on repeated principle violation |
| 11 | **Closing Flow** | How binding is acknowledged at closure |
| 12 | **Architecture** | Where in the SP skeleton this binding lives |

**Binding principles that use this template:** Language Gate (Q4a), Never-Do (Q13), No-Skip (Q16/F-cluster), Epistemic Humility (Q27), plus all Cluster I governance bindings.

### 2.4 OPAL Tool Variable Patterns

**Source:** `opal-populations.md`, `opal-library-map.md`, `opal-vocab-prompts.md`

Population-specific variables not in MASTER_LOGIC.md:

| Variable | Values | Routing Rule |
|----------|--------|-------------|
| `learner_native_language` | {Arabic, English, French, Yiddish, Hebrew} | Determines translation language + cultural bridge concepts |
| `learner_hebrew_level` | {beginner, intermediate, advanced} | Gates available tools; adjusts explanation density |
| `learner_population` | {immigrant, haredi, mixed} | Routes to separate tool tiers |
| `correction_count_per_turn` | 3 (hard maximum) | Never correct >3 items; cognitive load constraint |
| `yeshiva_concept_bridge` | string | Haredi-only: analogous yeshiva concept for academic term |
| `register_level_current` | {1=colloquial, 2=formal, 3=academic, 4=research} | Determines register gap + output format |
| `domain_glossary_cluster` | {social_sciences, sciences, humanities, professional} | Selects 20 key terms from pre-built semantic clusters |

---

## SECTION 3 — OBJECTIVE 3: EVOLUTION CONFLICTS

Ten confirmed conflicts between ED421 (legacy) and MilEd.One v3.0. All are resolved in current system but require documentation.

### EC-1: Process Structure Model
- **ED421:** 4-stage feedback loop — "Question → Guidance → Hint → Solution"
- **MilEd.One v3.0:** 5+ stage process with explicit State Gates and readiness evidence as preconditions
- **Resolution:** No-Skip Principle + HMAC-signed state machine replaces prompt-only enforcement
- **Evidence:** `עדכונים שצריך להוסיף...` §3, `הוספת שיכבת האכיפה...md`

### EC-2: Enforcement Architecture (Paradigm Shift)
- **ED421:** Principles enforced only through SP wording (design-time only)
- **MilEd.One v3.0:** Principles enforced through Runtime Enforcement Layer — Pre-Guard → SP Builder → Model → Post-Guard → Output → Logger
- **Resolution:** Design-time specification (SP) + runtime enforcement (bindings.json + guards) = governance system
- **Evidence:** `הוספת שיכבת האכיפה של המערכת.md`

### EC-3: Function-Based vs Phase-Based Regulation
- **ED421:** Regulation tied to `functionPolicies` config field (now deprecated)
- **MilEd.One v3.0:** Regulation tied to `phase` × `function` matrix — enforcement level derived from pedagogical context
- **Resolution:** Phase supremacy codified at Kernel level; `FunctionPolicies` removed from config.json
- **Evidence:** `עדכונים שצריך להוסיף...` §"Phase-Based Runtime Governance"

### EC-4: Binding Principles Formalization
- **ED421:** 7 kernel principles stated as SP "rules" (descriptive)
- **MilEd.One v3.0:** Each binding principle has 12-layer implementation template (prescriptive system requirement)
- **Resolution:** Bot Builder questionnaire now generates full 12-layer spec per binding
- **Evidence:** `בונה הבוטים הפדגוגיים - נוסח השאלון...` §"תבנית עקרון מחייב"

### EC-5: Questionnaire Cluster Structure (8 → 9 clusters)
- **ED421:** 8 question clusters (A–H), ~20 questions, no governance
- **MilEd.One v3.0:** 9 clusters (A–I), 32 questions — Cluster I adds governance (evaluation policy, rubric status, academic level, data tracking)
- **Resolution:** Governance decisions are now part of bot specification
- **Evidence:** `בונה הבוטים הפדגוגיים...` Cluster I section

### EC-6: Rubric Enforcement
- **ED421:** Evaluation bots could use `rubric_optional`
- **MilEd.One v3.0:** Evaluation bots MUST use rubrics — no heuristic judgment permitted
- **Resolution:** Evaluation Governance Gate in LEVEL 6 Enforcement Layer
- **Evidence:** MASTER_LOGIC.md §1.1.4; `עדכונים...` §6.3

### EC-7: Substitution Policy Scope
- **ED421:** Diagnostic phase allowed full solutions unconditionally
- **MilEd.One v3.0:** Phase determines substitution allowance — diagnostic does NOT automatically grant full-solution rights
- **Resolution:** Phase-Based enforcement overrides per-botType permissions
- **Evidence:** `עדכונים...` §2; Paraphrase Bot SP §3

### EC-8: Effort Regulation Enforcement
- **ED421:** Effort regulation was hidden (stated in SP as instruction, unenforced)
- **MilEd.One v3.0:** Hidden AND enforced — KERNEL PRINCIPLE #5 + LEVEL 6 runtime monitoring + logging
- **Resolution:** Regulation mechanism is provably non-transparent; exposure is an enforcement violation
- **Evidence:** `עדכונים...` §5; MASTER_LOGIC §1.1.5

### EC-9: Role Integrity
- **ED421:** Role switching was context-dependent; no explicit guard
- **MilEd.One v3.0:** Role Integrity locked — explicit Role Mutation Guard at LEVEL 6 prevents unauthorized switches
- **Evidence:** `עדכונים...` §3 "Context Integrity Principle"; MASTER_LOGIC §1.1.6

### EC-10: Evaluation Depth Binding
- **ED421:** Depth was a stylistic parameter (`depth: surface/moderate/deep`) independent of phase
- **MilEd.One v3.0:** Depth is phase-bound — wrong phase + summative feedback = system validation failure
- **Resolution:** Phase supremacy; depth becomes phase-derivative
- **Evidence:** `עדכונים...` §4; LEVEL 6 Evaluation Gate

---

## SECTION 4 — OBJECTIVE 4: GAP ANALYSIS

### 4.1 Gap Priority Classification

Gaps are numbered G-25 onwards (G-1 through G-24 were resolved in MASTER_LOGIC.md v3.0).

**CRITICAL (must add to MASTER_LOGIC):**

| Gap ID | Topic | Source | MASTER_LOGIC Target |
|--------|-------|--------|---------------------|
| G-25 | **Pedagogical DNA Taxonomy** — explicit classification system for bot archetypes | Bot Builder + Cluster 4 | New Part 25 |
| G-26 | **9-Level Pedagogical Integration Continuum** — full classroom bot progression (dict → architect) | `הבסיס התיאורטי...md` | New Part 26 |
| G-27 | **OPAL 30-Tool Library Catalog** — 6 tiers × 5 tools + tool selection matrix | `opal-library-map.md`, `opal_asset.md` | New Part 27 |
| G-28 | **Haredi Track Architecture** — separate tool tiers, style/bridge tools, language strategy | `opal-populations.md` | Expand Part 22 |
| G-29 | **KB Architecture Template** — 8 module types (KB_sentences, KB_tools, KB_hints, KB_feedback, KB_errors, KB_L2_errors, KB_exam, KB_language) | Paraphrase Bot SP | New Part 29 |
| G-30 | **Variable Type Classification System** — BIND / CONFIG / STRUCT / SOFT / EXPRESSIVE / DYNAMIC | `שיחה ראשונה 1/3` | New Part 28 |

**HIGH:**

| Gap ID | Topic | Source | MASTER_LOGIC Target |
|--------|-------|--------|---------------------|
| G-31 | **Drift Handling Protocol** — multi-stage principle reinforcement on repeated violations | Binding Principles Template | Appendix F |
| G-32 | **Cluster I Governance Questions** — I1–I4 with BIND mappings to evaluation gates | Bot Builder Cluster I | Expand Appendix A |
| G-33 | **Assessment-to-Learning Routing Logic** — explicit decision tree (score → pathway → module entry) | `מעבר מתהליך ההערכה...md` | Expand Part 23 |
| G-34 | **Population Classification & Tool Routing Matrix** — immigrant vs. Haredi routing decision tree | `opal-populations.md` | Expand Part 22 |
| G-35 | **Opening Alignment Block** — mandatory 4-step opening (role → course → interaction → expectations) | Bot Builder Q0 cluster | Expand Part 3 |

**MEDIUM:**

| Gap ID | Topic | Source | MASTER_LOGIC Target |
|--------|-------|--------|---------------------|
| G-36 | **Classroom Real-Time Manager Architecture** — instructor dashboard (stage lock, cohort view, export) | `classroom-architecture.md` | New Part 30 |
| G-37 | **Escalation Protocol for Repeated Violations** — hierarchy: block → reframe → graduated hints → strict mode | `מסמך מערכת שלבים מוקדמים` | Appendix F |
| G-38 | **Metacognitive Layer Trigger Taxonomy** — 6 trigger types: language, boundary, process, ownership, emotional drift, humility | Binding Principles Template Layer 9 | Expand Part 7 |
| G-39 | **Readiness Gate Evidence Framework** — unified rubric: knowledge-based vs. performance-based vs. behavioral | Bot Builder Q21, OPAL tools | Expand Part 5 |
| G-40 | **Refusal Tone Policy Variants** — Direct / Pedagogical / Soft (each with SP clause) | Bot Builder Q18 | Expand Part 5 |
| G-41 | **Learning Theory Grounding** — Vygotsky ZPD, CLT, SDT mapped to kernel principles | `עדכונים...` PEDAGOGICAL_RATIONALE | New Appendix D (or expand existing) |
| G-42 | **Institutional Scaling Logic** — multi-tenancy, shared instances, data governance per course/dept | `מיפוי מצב לפי שלבי המערכת` | Expand Part 8 |

**LOW:**

| Gap ID | Topic | Source | MASTER_LOGIC Target |
|--------|-------|--------|---------------------|
| G-43 | **Learner Prompt Engineering Guide** — how to ask bots well (student-facing) | Implicit across OPAL | Note in Part 4 |
| G-44 | **Advancement Metrics Framework** — knowledge vs. performance vs. behavioral mastery criteria | OPAL tools (heterogeneous) | Expand Part 6 |
| G-45 | **MD→Bot Compilation Protocol** — SP specification to Claude instance testing checklist | Missing entirely | Expand Part 8 |
| G-46 | **Empirical Validation Note** — 9-level continuum is theoretically grounded, not yet empirically validated | `הבסיס התיאורטי...` citations | Note in Part 26 |

### 4.2 Three Additional Architecture Concepts (Candidates for Parts 25–27+)

These were identified in the previous audit session as not yet in MASTER_LOGIC.md:

| Concept | Description | Status |
|---------|-------------|--------|
| **Retzf Continuum** | 4-axis continuum: Epistemic Authority × Instructor Role × Learning Architecture × Learner Agency — maps where any bot sits on the pedagogical-technological spectrum | NOT in MASTER_LOGIC |
| **Bot-Centered Learning Architectures** | 4 meta-modes: AI-First Loop, AI Tutor Scaffold, AI Simulation, AI Portfolio — describes how AI is integrated into the learning experience | NOT in MASTER_LOGIC |
| **Academic Text Structure Taxonomy** | 9 text types × 3 opening patterns × 4 closing patterns × 6 evidence types — used by OPAL writing tools (Genre Identifier, Topic Sentence Coach, Logic Judge) | NOT in MASTER_LOGIC |

---

## SECTION 4B — SUPPLEMENTARY AUDIT FINDINGS (Wave 2)

> From 4 additional Explore agents run in the same session, covering the same file clusters in greater depth. Items here are NEW discoveries not captured in Section 4 above.

### 4B.1 Additional Gaps (G-47 through G-58)

**CRITICAL:**

| Gap ID | Topic | Source | MASTER_LOGIC Target |
|--------|-------|--------|---------------------|
| G-47 | **Evidence-Based Confirmation Rule** — When a student provides sound, criteria-meeting reasoning, the bot APPROVES and ADVANCES without extending Socratic questioning. Nuances Kernel Principle #4 (Guided Self-Correction). Conditions: reasoning is evidence-based + naimuk meets structural criterion + no competing unchallenged alternative + only ONE criterion stated in approval + deepening is optional. | `שיחה שלישית 1.md` Document 2, Section 5 | Add to Part 1.1.4 as sub-rule |
| G-48 | **Identification Completion Rule** — When a student's identification (זיהוי) is FULL (function + structural context), approve and advance immediately. When partial (function only, no context), ask exactly ONE focused question. Full ID blocks automatic Socratic escalation. | `שיחה שלישית 1.md` Document 2, Section 5 | Add to Part 1.1.4 as sub-rule |
| G-49 | **Two-Stage Awareness Model** — Every session has TWO concurrent stage tracks: (1) Teaching Stage (`T1_TOPIC_STAGE` — instructor-set: presentation/practice/integration/diagnostic/summary/evaluation), (2) Learning Stage (`CONTEXT_STAGE` — bot-inferred from student behavior). These are NOT the same. A bot in "teaching evaluation stage" may have a student in "integration learning stage." | `שיחה שלישית 1.md` Document 2, Section 3A | Add to Part 17 (Phase-Based Governance) |
| G-50 | **Mood-Intent-Task Triadic Mapping** — ED421 Student Support Bot implements a complete triadic routing system: 45 mood states (organized by Mood Meter quadrants) × 50+ student intents × 50+ tasks. Each mood maps to suggested intents; each intent maps to available tasks. All three maps have referential integrity. Bot selects task based on current mood+intent state. | `drive-20260320T044143Z/המשך מסמך מערכת...md` | Add to Part 25 (DNA Taxonomy) + new Part 31 |

**HIGH:**

| Gap ID | Topic | Source | MASTER_LOGIC Target |
|--------|-------|--------|---------------------|
| G-51 | **Pain-Point × Timespan Two-Axis Archetype Selection** — Bot Builder classifies bots on two axes: (1) Teacher Pain Point (8 types: prep overload, passive classroom, weak task design, heterogeneous levels, academic literacy, process continuity, feedback burden, motivation/attrition); (2) Intervention Timespan (short = single lesson, medium-long = semester/ongoing). This 8×2 grid maps every bot to its institutional use case. | Bot Builder module | Add to Part 25 (DNA Taxonomy) |
| G-52 | **Student Model Schema** — Paraphrase Bot tracks per-student state: skill levels per paraphrase dimension, error pattern history, attempt frequency, progress indicators. This is NOT captured in the Session Continuity Token format. A standardized Student Model Schema is missing. | Paraphrase Bot SP + `מסמך תכנון מערכת 1...` | Add to Part 6 (SP Structure Layer 8) or new Part 31 |
| G-53 | **Hybrid Prompting / Course Context Injection** — Multi-course bots (ED421 Support) use two-layer prompting: (1) Shared System Prompt (kernel + binding principles), (2) Course Context Layer (injected at runtime from Course Profile table: courseId, audience, tone, language, skill focus). This pattern is NOT documented in MASTER_LOGIC. | `drive-20260320T044143Z/...פרומפטים.md` | Expand Part 8 (Implementation) |
| G-54 | **Micro-Task Decomposition Rules** — Paraphrase Bot implements CLT-based micro-task technique: decompose complex task into single-component micro-tasks (one word change, one clause change). Reduces invisible cognitive load. Bot never assigns full task to beginner level. Rule: level N student gets micro-tasks at N only. | Paraphrase Bot SP, `מסמך תכנון מערכת 1...` | Add to Part 21 (Adaptive Protocols) |
| G-55 | **Reflection-as-Gate Pattern** — Gerontology Research Bot gates advancement on articulated reflection (not just task completion). Student must write: "What surprised me? What changed my thinking?" BEFORE advancing to write-up stage. Reflection is not optional — it is the gate condition. | `תכנון בוט איכותני בגרונטולוגיה 2.md` | Add to Part 26 (Continuum) + Part 5 (Process) |

**MEDIUM:**

| Gap ID | Topic | Source | MASTER_LOGIC Target |
|--------|-------|--------|---------------------|
| G-56 | **Intent Clarification Conditional Logic** — Bot should ask for intent clarification ONLY when: (a) evidence of cognitive difficulty, (b) repeated failure, (c) significant structural gap. NOT when there is only ambiguity. Most bots over-ask for clarification. | `שיחה שלישית 1.md` §"Intent Before Transition Rule" | Add to Part 21 (Adaptive Protocols) |
| G-57 | **Evaluation Output Level Specification** — Evaluation bots can produce numeric scores OR narrative feedback OR both. Conditions: numeric only when `DEVELOPMENT_LEVEL ≥ 3`; otherwise narrative. Variable: `EVALUATION_OUTPUT_LEVEL` + `COMPARISON_MODE` (vs. standard / vs. peer / vs. self). | `שיחה שלישית 1.md` Document 2, Section 5A | Expand Part 12 (Evaluation Governance) |
| G-58 | **Model Drift Prevention Anti-Pattern List** — Explicit list of forbidden system behaviors: (1) Never expose mechanism ("we're regulating your effort"), (2) Never mutate role mid-session, (3) Never reduce effort on direct student demand, (4) Never complete task for learner, (5) Never escalate without structural justification. | `שיחה שלישית 1.md` Document 2, Section 5, "Model Drift Prevention Clause" | Expand Part 1 (Kernel) |

### 4B.2 Additional Evolution Conflict

**EC-11: Substitution Policy — Absolute vs. Conditional**

- **Early ED421 (v1.0):** "Never give full solution" — absolute prohibition
- **MilEd.One v3.6:** Evidence-Based Confirmation Rule — when student's reasoning meets criteria AND evidence is sound, bot APPROVES and ADVANCES. Not a solution but an approval. The distinction is critical.
- **Status:** This is an architectural maturation, not a reversal. But MASTER_LOGIC v3.0/v4.0 still states "Never: solution first" without the conditional approval nuance.
- **Action:** Add Evidence-Based Confirmation Rule as sub-rule of Kernel Principle #4.
- **Evidence:** `שיחה שלישית 1.md` Document 2, Section 5 (Evidence-Based Confirmation Rule)

### 4B.3 Unresolved Variable Naming Conflict

**Variable:** Academic/development level

| Version | Variable Name | File |
|---------|--------------|------|
| v1.0–v2.0 | `COURSE_LEVEL` | `טיוטת מבנה - מסמך מערכת מרוכז 1.md` Cluster A-H |
| v3.1 | `DEVELOPMENT_LEVEL` | `טיוטת מבנה - מסמך מערכת מרוכז 2.md` |
| v3.6 | Both names used interchangeably | `שיחה שלישית 1.md` + `שיחה שלישית 2.md` |

**Impact:** `config.json` may reference `courseLevel` (old name); SP Generator uses `DEVELOPMENT_LEVEL` (new name). Inconsistency causes silent mismatches.

**Resolution needed:** Standardize on `DEVELOPMENT_LEVEL` as internal variable; deprecate `COURSE_LEVEL` in API docs and config.json.

### 4B.4 Three Complete Bot Specifications (Not Yet in MASTER_LOGIC)

These are fully designed bots whose SP structures, KBs, and process flows exist in source files but are not referenced in MASTER_LOGIC as case studies:

| Bot | Source File | Unique Architecture |
|-----|-------------|---------------------|
| **Paraphrase Trainer Bot** | `drive-20260320T034648Z-1-001/SP בוט פרפראזה.md` (39,781 tokens) | 5-level skill ladder + micro-task decomposition + student model tracking |
| **ED421 Student Support Bot** | `drive-20260320T044143Z-1-001/המשך מסמך מערכת...` | Mood-Intent-Task triadic routing (45×50×50 maps) + course profile injection |
| **Gerontology Research Bot** | `תכנון בוט איכותני בגרונטולוגיה 2.md` | Reflection-as-gate + ethical framing + qualitative research progression |

---

## SECTION 5 — SYNTHESIS: WHAT MASTER_LOGIC.md IS AND WHAT IT ISN'T

### 5.1 What MASTER_LOGIC v3.0 Gets Right

- 7 Kernel Principles (immutable, correctly framed)
- 8-Layer SP Structure (mandatory skeleton)
- 5 Bot type taxonomy (exists, but is too coarse for implementation — see G-25)
- Phase-Based Governance (Parts 17+)
- Runtime Enforcement Layer (Pre/Post Guards)
- 3 Adaptive Protocols (Emotion-Task, Pacing, Regulation)
- OPAL Framework overview (M-1/2/3, H-1/2/3)
- Assessment→Learning Pipeline (5 stages)
- Session Continuity Token format

### 5.2 What MASTER_LOGIC v3.0 Is Missing

MASTER_LOGIC is currently the **authoritative Kernel reference** but is **incomplete as an implementation guide**. A bot builder using only MASTER_LOGIC cannot:

1. Classify a bot's Pedagogical DNA (G-25)
2. Place a bot on the classroom integration continuum (G-26)
3. Select from the OPAL tool library (G-27)
4. Route Haredi vs. immigrant students to different tools (G-28, G-34)
5. Design a KB with correct module structure (G-29)
6. Understand which variables are BIND vs. CONFIG (G-30)
7. Handle repeated principle violations with a consistent escalation protocol (G-31, G-37)
8. Build the governance layer questions for an evaluation bot (G-32)
9. Route students from assessment results to learning pathways (G-33)
10. Implement a real-time classroom manager (G-36)

### 5.3 Recommended MASTER_LOGIC.md Updates (v4.0)

| Action | Parts Affected | Priority |
|--------|---------------|----------|
| Add Part 25: Pedagogical DNA Taxonomy | New | CRITICAL |
| Add Part 26: 9-Level Classroom Integration Continuum | New | CRITICAL |
| Add Part 27: OPAL 30-Tool Library Catalog | New | CRITICAL |
| Add Part 28: Variable Type Classification System | New | HIGH |
| Add Part 29: KB Architecture Template (8 modules) | New | HIGH |
| Add Part 30: Classroom Real-Time Manager Architecture | New | MEDIUM |
| Expand Part 22: Haredi Track Architecture (separate tiers) | Existing | HIGH |
| Expand Part 23: Assessment-to-Learning Routing (decision tree) | Existing | HIGH |
| Expand Part 3: Opening Alignment Block (4-step mandatory) | Existing | HIGH |
| Expand Part 5: Readiness Gate Evidence + Refusal Tone variants | Existing | MEDIUM |
| Add Appendix F: Drift Handling & Escalation Protocols | New | HIGH |
| Add/Expand Appendix A: Full 32-question questionnaire with Cluster I | Existing | HIGH |

---

## SECTION 6 — MASTER SUMMARY TABLE

| Finding | Category | Severity | Source Files | Status |
|---------|----------|----------|-------------|--------|
| Pedagogical DNA Taxonomy | Gap G-25 | CRITICAL | Bot Builder + Cluster 4 | OPEN |
| 9-Level Classroom Continuum | Gap G-26 | CRITICAL | הבסיס התיאורטי | OPEN |
| OPAL 30-Tool Library | Gap G-27 | CRITICAL | opal-library-map, opal_asset | OPEN |
| Haredi Architecture (separate track) | Gap G-28 | HIGH | opal-populations | OPEN |
| KB Architecture Template | Gap G-29 | HIGH | Paraphrase Bot SP | OPEN |
| Variable Type System | Gap G-30 | HIGH | שיחה ראשונה 1/3 | OPEN |
| Drift Handling Protocol | Gap G-31 | HIGH | Binding Principles Template | OPEN |
| Cluster I Governance (I1–I4) | Gap G-32 | HIGH | Bot Builder Cluster I | OPEN |
| Assessment→Learning Routing | Gap G-33 | HIGH | מעבר מתהליך ההערכה | OPEN |
| Population Routing Matrix | Gap G-34 | HIGH | opal-populations | OPEN |
| Opening Alignment Block | Gap G-35 | HIGH | Bot Builder Q0 | OPEN |
| Classroom Manager Architecture | Gap G-36 | MEDIUM | classroom-architecture | OPEN |
| Escalation Protocol | Gap G-37 | MEDIUM | מסמך מערכת שלבים מוקדמים | OPEN |
| Metacognitive Trigger Taxonomy | Gap G-38 | MEDIUM | Binding Principles Template Layer 9 | OPEN |
| Readiness Gate Framework | Gap G-39 | MEDIUM | Bot Builder Q21 + OPAL | OPEN |
| Refusal Tone Policy Variants | Gap G-40 | MEDIUM | Bot Builder Q18 | OPEN |
| Learning Theory Grounding | Gap G-41 | MEDIUM | עדכונים PEDAGOGICAL_RATIONALE | OPEN |
| Institutional Scaling Logic | Gap G-42 | MEDIUM | מיפוי מצב | OPEN |
| Learner Prompt Engineering | Gap G-43 | LOW | Implicit across OPAL | OPEN |
| Advancement Metrics Framework | Gap G-44 | LOW | OPAL tools | OPEN |
| MD→Bot Compilation Protocol | Gap G-45 | LOW | Missing | OPEN |
| Empirical Validation Note | Gap G-46 | LOW | הבסיס התיאורטי | OPEN |
| Retzf Continuum | Candidate G-47 | MEDIUM | Previous audit | OPEN |
| Bot-Centered Learning Architectures | Candidate G-48 | MEDIUM | Previous audit | OPEN |
| Academic Text Structure Taxonomy | Candidate G-49 | MEDIUM | OPAL writing tools | OPEN |
| **EC-1** Process structure model | Evolution Conflict | Resolved | drive-035050Z | RESOLVED in v3.0 |
| **EC-2** Enforcement architecture | Evolution Conflict | Resolved | הוספת שיכבת האכיפה | RESOLVED in v3.0 |
| **EC-3** Phase vs FunctionPolicies | Evolution Conflict | Resolved | עדכונים | RESOLVED in v3.0 |
| **EC-4** Binding formalization | Evolution Conflict | Resolved | Bot Builder | RESOLVED in v3.0 |
| **EC-5** Cluster I added | Evolution Conflict | Resolved | Bot Builder | RESOLVED in v3.0 |
| **EC-6** Rubric enforcement | Evolution Conflict | Resolved | עדכונים §6.3 | RESOLVED in v3.0 |
| **EC-7** Substitution scope | Evolution Conflict | Resolved | עדכונים §2 | RESOLVED in v3.0 |
| **EC-8** Effort regulation enforcement | Evolution Conflict | Resolved | עדכונים §5 | RESOLVED in v3.0 |
| **EC-9** Role integrity | Evolution Conflict | Resolved | עדכונים §3 | RESOLVED in v3.0 |
| **EC-10** Evaluation depth binding | Evolution Conflict | Resolved | עדכונים §4 | RESOLVED in v3.0 |
| OPAL Conflict: Claim Detective evaluation | Minor Conflict | OPEN | opal_asset lines 168–175 | Agency restoration needed |
| OPAL Conflict: Glossary one-shot output | Minor Conflict | OPEN | opal-vocab-prompts lines 205–212 | Break into stages |

---

*Audit compiled 2026-03-20 — synthesized from 4 parallel Explore agents covering all 364 .md files across /docs subdirectories.*
