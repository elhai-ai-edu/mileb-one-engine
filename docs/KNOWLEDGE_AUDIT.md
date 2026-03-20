# KNOWLEDGE_AUDIT.md — MilEd.One Deep Knowledge Audit
> Audit date: 2026-03-20 | Files scanned: 50 source files + MASTER_LOGIC.md
> Status: **12 architectural gaps identified and resolved in MASTER_LOGIC.md v2.0**

---

## SECTION 1 — COMPLETE BOT CATALOG

Every distinct bot type found across all 158 files. Canonical classification using Bot Family taxonomy (see Section 4).

---

### BOT 1: Paraphrase Trainer (בוט מאמן פרפרזה)
**Family:** ב (Literacy Bot) | **Mode:** Long | **Preset:** STUDENT
**Audience:** Arabic L1, Hebrew-medium academic writing
**Source:** `raw_source_material/drive-download-20260317T180500Z-1-001/`

**Architecture type:** Full ITS (Intelligent Tutoring System) — Domain Model + Student Model + Tutoring Model

**5-Level Paraphrase Ladder:**
1. Meaning understanding (comprehension only)
2. Lexical change (synonyms only)
3. Structural change (sentence restructuring only)
4. Advanced paraphrase (lexical + structural combined)
5. Academic mastery (full rhetorical transformation with register shift)

**Advancement rule:** 3 simultaneous criteria must be met — meaning preserved + linguistic change visible + information accurate. One success insufficient.

**Diagnostic protocol:** 5-step sequence mandatory BEFORE instruction begins:
1. Meaning verification
2. Linguistic change identification
3. Information preservation check
4. Sentence structure analysis
5. Style/register evaluation

**Micro-Paraphrase technique:** Student works on ONE component at a time (only lexical OR only structural) before attempting full paraphrase. Reduces cognitive load without reducing standard.

**Student Model variables:** `paraphrase_level` (1–5), `semantic_load`, `recent_repeated_errors`, `consecutive_successes` (triggers level advancement)

**KB Schema (per sentence unit):** `{ID, text, category, difficulty 1–3, paraphrase_level 1–3, components:{marker/subject/action/object/context}, keywords, semantic_core, Paraphrase_Tools, Typical_Errors, Exercise_Types}`. 10 sentence categories: DEF, RC, CE, COMP, HED, CONC, LIM, IMP, EXP, PROC.

**Simplified Hebrew Mode:** Active for non-native speakers. L1 Arabic permitted during understanding stages only. Prohibited at production stages.

**Expansion path (planned):** Academic Writing AI Suite → Summarization Bot + Argumentation Bot + Source Integration Bot + Paragraph Construction Bot.

---

### BOT 2: Academic Literacy Bot (בוט אוריינות מכינה)
**Family:** ב (Literacy Bot) | **Mode:** Long | **Preset:** STUDENT
**Audience:** Arabic L1, college prep / sector courses
**Source:** `raw_source_material/drive-download-20260317T180337Z-1-001/`

**4-Stage workflow (no-skip enforced):**
1. Conceptual-structural understanding (Arabic permitted)
2. Structural practice — paragraph skeleton, key sentences (transition to Hebrew)
3. Functional linguistic practice in Hebrew — connectors, sentence structures, paraphrase (Hebrew only)
4. Submission preparation — logical sequence check, coherence check (no rewriting, no evaluation)

**Bilingual Mediation Policy:**
- Arabic = thinking and mediation language. Allowed: early understanding, conceptual clarification, reflection on meaning, emotional/experiential explanation.
- Hebrew = sole academic output language. All advanced practice and final products in Hebrew only.
- Every stage transition must be **explicitly announced** to the student.
- Rule: "Arabic as mediation, not as product."

**Absolute prohibitions (unique to this bot):**
- No complete text writing or final rewriting
- No translation of full academic assignment
- No grading, evaluation, or "good/bad" judgment
- No prediction of instructor expectations
- No grammar correction as such — only rhetorical function reflection

**Self-check rule (mandatory before every response):** "Could this be perceived as a ready-made, submittable text?" If yes → stop, remove formulations, return to structural guidance.

**KB Architecture (8 layers):** KB-0 Purpose → KB-1 Pedagogical Philosophy (binding) → KB-2 Bilingual Mediation → KB-3 Learner Level Adaptation → KB-4 Staged Learning Logic → KB-5 Micro-Rhetoric (sentence functions) → KB-6 Macro-Rhetoric (paragraph/text level).

**Regression rule:** If confusion at higher level → return to lower. "Sentence → Paragraph → Text" is a reversible progression.

---

### BOT 3: Qualitative Research Bot — Gerontology (בוט מחקר איכותני בגרונטולוגיה)
**Family:** ג (Rolling Task Bot) | **Mode:** Long/Hybrid | **Preset:** STUDENT
**Audience:** First-year social science students; variants for Haredi (simple Hebrew) and Arabic-speaking students
**Source:** `יתכנון בוט איכותני בגרונטולוגיה 1.md`, `עוד פרויקט פיתוח 1–4.md`, `תכנון 2–3.md`

**7-step assignment structure (accompanies multi-week project):**
1. Select interviewee (65+, min 45–60 minutes recorded)
2. Prepare interview questions (guided design)
3. Conduct interview (preparation guidance only)
4. Transcribe (bot-assisted guidance for transcription process)
5. Thematic analysis (coding, theme identification — guided only, no interpretation for student)
6. Personal reflection (researcher positionality)
7. Journal/research diary summary

**Core rule:** Teaching assistant role only. Does not conduct research for student. Guides thematic analysis methodology without imposing interpretations.

---

### BOT 4: Student Support Bot — ED421 (בוט תמיכה לסטודנטים)
**Family:** ד (Soft Presence Bot) | **Mode:** Short | **Preset:** STUDENT
**Audience:** Students across 4 course profiles (Arabic B1-B2, Arabic A2→B2, Haredi men 25+)
**Source:** `raw_source_material/drive-download-20260317T180708Z-1-001/`

**Architecture type:** Emotion → Intent → Task pipeline (3-DB stateless system)

**Three-layer DB:**
1. **Mood–Action Map** (45 emotional states): AEQ Pekrun + Yale RULER Mood Meter. 4 quadrants (High Energy/Pleasant, High Energy/Unpleasant, Low Energy/Pleasant, Low Energy/Unpleasant). Each state: `Mood_ID`, name, English reference, quadrant, keywords, 4 soft responses, recommended action, `Intent_IDs`, `Task_IDs`, `Desired_State`.
2. **Intent Map** (50 intents, 7 categories): emotional / cognitive / linguistic / technical / creative-inquiry / reflective / social. Priority: emotional before cognitive. Each intent: 4 warm responses + Task Map link + Suggested Prompt for API.
3. **Task Map** (50 tasks, 3 domains): Academic (TA001–TA018) / Employability (TE019–TE035) / Cognitive-Integrative (TE036–TE050). Per task: `Task_ID`, pedagogical goal, Bloom level, 4 Prompt Suggestions, Mood_Fit, CIE (Self-check/Strategy/Transfer/Emotion), Reflective Marker, `Next_Step_ID`.

**Task selection algorithm:**
```
score(task) = MoodScore + IntentScore + CourseFit + TimeFit + BloomFit
task = argmax(score(task_candidates))
```

**Session variables:** `mood_id`, `intent_id`, `task_id`, `gender_tone`

**9 task clusters:** knowledge processing, dialogic learning, metacognitive, digital literacy, values connection, higher-order thinking, socio-emotional, creative outputs, longitudinal reflection.

---

### BOT 5: Presentation Companion Bot (בוט מלווה הכנת פרזנטציה)
**Family:** ג (Rolling Task Bot) | **Mode:** Long | **Preset:** STUDENT
**Audience:** Students preparing academic presentations
**Source:** `בניית בוט מלווה סטודנטים.md`, `המשך בניית בוט.md`

**5-stage workflow:**
0. Introduction (topic, duration, team names)
1. Research & concept mapping (key questions, sources)
2. Structure & narrative (slide skeleton; time: opening 1–2 min, background 3 min, content 8 min, summary 1–2 min)
3. Visual design (one idea per slide rule; Canva/Google Slides templates)
4. Practice & self-assessment (rehearsal, Q&A preparation)
5. Post-presentation reflection (what worked, what to change)

---

### BOT 6: Lesson Design / Content Transformation Bot (בוט תכנון שיעור)
**Family:** א (Transformation Bot) | **Mode:** Short | **Preset:** INSTRUCTOR
**Audience:** Faculty — lesson planning, activity design, content transformation
**Source:** `BOT_BUILDER_MODEL.md`, `סיכום שיחה התפתחות הארכיטקטונית.md`

**INSTRUCTOR_PRESET behavior:**
- Full products allowed (lesson plans, activity designs, rubrics, complete texts)
- High directness; low Socratic behavior
- Meta-pedagogical explanation mode active
- No agency constraints (faculty are not learners)
- Moderate boundaries (ethical/epistemic only)

**Teaching Position Awareness (Cluster J variables):**
- `T1_TOPIC_STAGE`: lesson type (knowledge acquisition / skill practice / diagnostic / integration / summative / evaluation)
- `T2_UNIT_SCOPE`: focused component (single / multiple / full process)
- `T3_TARGET_DEPTH`: desired depth (basic familiarity / structural mastery / analytic understanding / independent claim / process reflection)

---

### BOT 7: Assignment Evaluation Bot (בוט הערכת עבודות)
**Family:** א (Transformation Bot, Evaluator sub-preset) | **Mode:** Short | **Preset:** INSTRUCTOR/EVALUATOR
**Audience:** Instructors evaluating submitted work
**Source:** `שיחה ראשונה 1.md` (architectural formalization), `שיחה שניה 1.md`

**Evaluation Doctrine (non-negotiable):**
- No intuitive judgment ("this feels weak")
- No score without explicit rubric (RUBRIC_APPROVAL_STATUS = GATE, hard blocker)
- No global summary without criterion decomposition
- Analytic Integrity: every claim traceable, every score criterion-based
- "Intuition is permitted for the instructor — not for the bot"

**Evaluation variables:**
- `EVALUATION_OUTPUT_LEVEL` (CONFIG, locked) — from 1 (process notes only) to 4 (full numerical scores)
- `RUBRIC_SOURCE` (CONFIG, required)
- `RUBRIC_APPROVAL_STATUS` (GATE — blocks all evaluation if not set)
- `SCORE_POLICY` (CONFIG — numeric or descriptive)
- `TRANSPARENCY_RULE` (CONFIG)

---

### BOT 8: Bot-Builder Bot (בוט בונה הבוטים)
**Family:** Meta-tool | **Mode:** Short | **Preset:** INSTRUCTOR (SP compiler)
**Audience:** Instructors who want to create a custom pedagogical bot
**Source:** `בוט בונה הבוטים/` directory, `הפקת SP על בסיס השאלון.md`, `BOT_BUILDER_MODEL.md`

**ORM (Output Recipe Module) — 3-step compilation:**
1. System-level compiler prompt (binding language ONLY)
2. PEDAGOGICAL CONFIGURATION template (9 sections A–I)
3. "Compile the System Prompt now" trigger

**Questionnaire clusters:** A (pain point), B (audience/language/context), C (depth/infrastructure), D (bot identity/style), E (boundaries), F (process skeleton), G (thinking/regulation), H (knowledge/closure), J (teaching position — added v3.6)

**SP compiler language rules:** MANDATORY: must / must not / always / never / only if / only after. FORBIDDEN: should / may / try / aim / ideally / whenever possible / suggested. Probabilistic language → probabilistic compliance. Binding language → enforced behavior.

**Output:** Mandatory 8-section SP structure (Core Role → Boundaries → Opening Rules → Flow Rules → Reflection Rules → Knowledge Rules → Emotional Regulation → Closure & Continuity)

---

### BOT 9: Classroom Integration Bot (בוט כיתתי — 9 רמות)
**Family:** ג/ד Hybrid | **Mode:** Hybrid | **Preset:** STUDENT
**Audience:** Faculty-designed classroom deployments
**Source:** `הבסיס התיאורטי של הרצף הפדגוגי-טכנולוגי בשילוב בוט בכיתה.md`

**9 escalating integration levels:**
1. Glossary bot (terminology on demand)
2. Examples generator (personalized discipline examples)
3. Real-time self-check (5-question mid-lesson quiz + error explanation)
4. Paraphrase explainer (explain concept 2 different ways)
5. Brainstorm interviewer (10 ideas for open problems)
6. Role-play character (bot embodies a persona)
7–9. Knowledge co-designer and higher levels

**Key distinction:** Bot role changes per level based on faculty choice at design time, not based on student emotional state.

---

## SECTION 2 — COMPLETE VARIABLE MATRIX

### 2.1 Variable Type Taxonomy

| Type | Definition | Override rules |
|------|-----------|----------------|
| `CONFIG` | Set once per bot instance from questionnaire | Modifiable only by regenerating SPI |
| `BIND` | Non-negotiable system constraint | Never overridable — not by questionnaire, not by runtime |
| `GATE` | Hard blocker — execution blocked until condition met | No bypass pathway exists |
| `DYNAMIC` | Session-based detection (e.g., stage, mood_id) | Updates within session only |
| `CONDITIONAL` | Activated only by specific scenario | Evidence-Based Confirmation, Identification Completion |

**Priority Hierarchy (conflict resolution):**
```
BIND > GATE > OPERATION_MODE > EFFORT_POLICY > INSTRUCTOR_PRESET > CONFIG > DYNAMIC
```

---

### 2.2 Full Questionnaire → Variable Mapping (Clusters A–J)

**Cluster A — Mission & Pain Point**

| Question | Variable | Type | SP Layer | Behavior |
|----------|----------|------|----------|---------|
| What pedagogical problem does this bot solve? | `BOT_PURPOSE` | CONFIG | L5: Mission | Defines core task framing; constrains "on-topic" |
| What outcome should students achieve? | `LEARNING_GOAL` | CONFIG | L5: Mission | Goal against which progress is measured |

**Cluster B — Audience + Language + Context**

| Question | Variable | Type | SP Layer | Behavior |
|----------|----------|------|----------|---------|
| Who are the learners? | `AUDIENCE_PROFILE` | CONFIG | L3: Mode, L5: Mission | Sets opening tone, language register |
| Hebrew proficiency level | `HEBREW_LEVEL` | CONFIG | L3: Mode, L7: Adaptive | Maps to `he_a1_arabic / he_a2_arabic / he_b1_haredi / he_standard`; activates bilingual mediation if A1/A2 |
| L1 language (Arabic or other) | `L1_LANGUAGE` | CONFIG | L4: Binding | Activates `Allow_CodeSwitching` if Arabic |
| Year of study / prior experience | `COURSE_LEVEL` | CONFIG | L6: Process | Sets effort baseline; affects scaffolding density |
| Class size / group structure | `CLASS_CONTEXT` | CONFIG | L7: Adaptive | Group vs. individual interaction modes |

**Cluster C — Depth + Infrastructure**

| Question | Variable | Type | SP Layer | Behavior |
|----------|----------|------|----------|---------|
| How deep should the bot intervene? | `INTERVENTION_DEPTH` | CONFIG | L6: Process | Maps to Effort Ceiling computation |
| Time scope (session / week / semester) | `COURSE_PHASE` | CONFIG | L6: Process | Escalation logic activation timing |
| What does the KB contain? | `KB_SCOPE` | CONFIG | L6: Knowledge Policy | Defines KB-internal vs. external knowledge |
| Short / Long / Hybrid | `OPERATION_SCOPE` | CONFIG | L7: Adaptive, L8: Closure | Short: no memory continuity. Long: stage tracking + continuity token. Hybrid: dynamic depth selection |

**Cluster D — Bot Identity + Style**

| Question | Variable | Type | SP Layer | Behavior |
|----------|----------|------|----------|---------|
| Bot's identity / name / character | `BOT_IDENTITY` | CONFIG | L0: Header | Persona framing; tone consistency anchor |
| Tone and communication style | `TONE_STYLE` | CONFIG | L0: Header | Maps to Emoji_Style, Feedback_Pattern, Confidence_Boost_Strategy |
| Gender mode (for Hebrew addressing) | `GENDER_TONE` | DYNAMIC | Opening sequence | Collected in opening; applied throughout session |

**Cluster E — Boundaries**

| Question | Variable | Type | SP Layer | Behavior |
|----------|----------|------|----------|---------|
| What is absolutely forbidden? | `HARD_PROHIBITIONS` | BIND | L4: Binding | Violation triggers: cite boundary + explain pedagogical reason + offer alternative |
| What authority does the bot NOT have? | `AUTHORITY_LIMITS` | BIND | L4: Binding | Epistemic authority stays with instructor |
| Violation response pattern | `VIOLATION_RESPONSE` | BIND | L4: Binding | Fixed: no apology, no negotiation |

**Cluster F — Process Skeleton**

| Question | Variable | Type | SP Layer | Behavior |
|----------|----------|------|----------|---------|
| What are the process stages? | `PROCESS_STAGES` | CONFIG | L6: Process | Defines stage sequence; activates No-Skip for mandatory stages |
| What marks stage transitions? | `STAGE_TRANSITION_RULE` | CONFIG | L6: Process | Criteria for advancement |
| Which stages are mandatory? | `MANDATORY_STAGES` | BIND | L4: Binding, L6: Process | Activates `TASK_SEQUENCE_LOCK = BIND` for these stages |
| How does the bot recognize readiness? | `READINESS_SIGNAL` | CONDITIONAL | L7: Adaptive | Evidence-Based Confirmation Rule: if student meets criteria → confirm and advance, stop probing |

**Cluster G — Thinking + Effort Regulation**

| Question | Variable | Type | SP Layer | Behavior |
|----------|----------|------|----------|---------|
| What thinking types to encourage? | `THINKING_TYPES` | CONFIG | L2: Cognitive Integrity | Maps to 7 Fixed Thinking Templates |
| How to handle cognitive overload? | `OVERLOAD_POLICY` | CONFIG | L7: Adaptive | Activates Stress Regulation: decompose task, slow pace, reduce processing unit |
| How to handle a stuck student? | `STUCK_RESPONSE` | CONFIG | L7: Adaptive | Escalation: guided decomposition → clarifying questions → control return to student |
| Effort regulation policy | `EFFORT_POLICY` | BIND | L2: Cognitive Integrity | Cannot be reduced by student demand. Critical priority. |

**Cluster H — Knowledge + Closure**

| Question | Variable | Type | SP Layer | Behavior |
|----------|----------|------|----------|---------|
| What knowledge does the bot access? | `KB_ACCESS` | CONFIG | L6: Knowledge | Allowed vs. forbidden knowledge references |
| How does the bot close a session? | `CLOSURE_PROTOCOL` | CONFIG | L8: Closure | Reflection prompt + summary + continuity token (Long mode) |

**Cluster J — Teaching Position (INSTRUCTOR mode only, v3.6)**

| Question | Variable | Type | SP Layer | Behavior |
|----------|----------|------|----------|---------|
| Lesson type | `T1_TOPIC_STAGE` | CONFIG | L6: Process | Determines task structure |
| Focused component | `T2_UNIT_SCOPE` | CONFIG | L6: Process | Sets granularity; cannot contradict T1 |
| Target depth | `T3_TARGET_DEPTH` | CONFIG | L7: Adaptive | Controls depth of prompts; capped by Effort Ceiling |

---

### 2.3 Dynamic Session Variables (runtime, not from questionnaire)

| Variable | Type | Source | Effect |
|----------|------|--------|--------|
| `CONTEXT_STAGE` | DYNAMIC | Silent detection | Determines current interaction type |
| `STAGE_LOCK` | DYNAMIC | Soft lock | Prevents drift from current stage |
| `STAGE_SHIFT` | CONDITIONAL | Action change signal | Allows transition when real behavioral evidence |
| `mood_id` | DYNAMIC | ED421 Mood Meter | Triggers intent selection |
| `intent_id` | DYNAMIC | Intent Map | Triggers task selection |
| `task_id` | DYNAMIC | Task Map | Selects actual bot task |
| `gender_tone` | DYNAMIC | Opening sequence | Applied consistently throughout session |
| `paraphrase_level` | DYNAMIC | Paraphrase Bot | Controls task difficulty progression |
| `consecutive_successes` | DYNAMIC | Paraphrase Bot | Triggers level advancement |

---

### 2.4 Course Profile Variable Schema (ED421 complete schema)

**Identity:** `course_id`, `course_name`, `instructor_name`, `spi_version`

**Context:** `language_level`, `L1_language`, `student_population`, `year_in_program`, `course_type`

**Pedagogical style:** `teaching_stance` (directive↔dialogic), `support_level` (high_scaffold↔independence), `depth_level` (surface↔deep), `effort_regulation_mode`

**Interaction:** `Allow_CodeSwitching` (bool), `Emoji_Style` (none/minimal/moderate), `Error_Response_Style` (direct/reflective/scaffolded), `Feedback_Pattern`, `Confidence_Boost_Strategy`

**Cultural:** `Cultural_Dos`, `Cultural_Donts` (population-specific)

**Boundary:** `bot_forbidden_actions`, `academic_integrity_policy`, `escalation_to_instructor_triggers`

---

## SECTION 3 — GAP ANALYSIS vs MASTER_LOGIC.md

12 gaps identified. All resolved in MASTER_LOGIC.md v2.0 (this document serves as the evidence trail).

| ID | Gap | Severity | Status |
|----|-----|----------|--------|
| G-01 | Dual-Axis Effort Model (5 components) absent | Critical | Added to MASTER_LOGIC §11 |
| G-02 | STUDENT/INSTRUCTOR preset split not specified | Critical | Added to MASTER_LOGIC §3 |
| G-03 | Evaluation Governance Gate (RUBRIC_APPROVAL_STATUS) missing | High | Added to MASTER_LOGIC §12 |
| G-04 | Evidence-Based Confirmation Rule absent | High | Added to MASTER_LOGIC §11 |
| G-05 | Identification Completion Rule absent | High | Added to MASTER_LOGIC §11 |
| G-06 | Model Drift Prevention Clause (4 constraints) missing | High | Added to MASTER_LOGIC §12 |
| G-07 | Bilingual Mediation operational rules absent | High | Added to MASTER_LOGIC §7 |
| G-08 | Variable Type Taxonomy (CONFIG/BIND/GATE/DYNAMIC/CONDITIONAL) missing | High | Added to MASTER_LOGIC §4 |
| G-09 | SP Compiler language rules (binding vs. probabilistic) missing | High | Added to MASTER_LOGIC §13 |
| G-10 | Short/Long/Hybrid mode operational differences not specified | Medium | Added to MASTER_LOGIC §6 |
| G-11 | Bot Family Taxonomy (5 families + 3-step triage) missing | Medium | Added to MASTER_LOGIC §3 |
| G-12 | Equity Principle (equal access regardless of background) missing | Medium | Added to MASTER_LOGIC §1 |

---

## SECTION 4 — ARCHITECTURAL ADDITIONS

### 4.1 Bot Family Taxonomy (5 Archetypes)

| Family | Hebrew | Mode | Preset | Primary examples |
|--------|--------|------|--------|-----------------|
| א — Transformation | בוט המרה | Short | INSTRUCTOR | Lesson Design Bot, Content Transformer |
| ב — Literacy | בוט אוריינות | Long | STUDENT | Paraphrase Bot, Academic Literacy Bot |
| ג — Rolling Task | בוט משימה מתמשכת | Long | STUDENT | Gerontology Research Bot, Presentation Bot |
| ד — Soft Presence | בוט נוכחות רכה | Short | STUDENT | ED421 Student Support Bot |
| ה — Hybrid | בוט היברידי | Long | STUDENT | Literacy + Emotional (Family ב+ד combined) |

**3-step faculty triage:** Pain Point → Desired Outcome → Relief Mechanism → Family Match

### 4.2 Deployment Architecture (Reasoning + Retrieval + Interface)
- **Reasoning layer:** DeepSeek / Gemini Flash Thinking — reads SP, decides pedagogical response
- **Retrieval layer:** Gemini 1.5 Flash — RAG from course KB files
- **Interface layer:** Netlify — URL-based routing per course/branch
- **Admin:** GitHub auto-deploy → Netlify on commit

### 4.3 Product Hardening Roadmap (7 Phases)
Current status: between Phase 2 and Phase 3.
1. Constitutional Freeze — lock all non-negotiable principles in System Constitution v1.0
2. SP Template Lock — single structure, defined Slots, no further layer additions
3. Variable Registry Finalization — remove variables that don't change behavior
4. Behavioral Validation — 15-scenario battery (5 student + 3 instructor + 2 evaluator + 5 edge cases)
5. Product Narrowing — release one specific product first, not a general engine
6. Hardening Layer — edge cases, session load, re-entry stability
7. Pilot Deployment — one class, one course, 2–3 weeks, no mid-pilot changes

### 4.4 9-Level Classroom Integration Continuum
Faculty deployment framework (entirely absent from MASTER_LOGIC.md before this audit):
Levels 1–9 from "glossary bot" to "knowledge co-designer." Structures adoption as a progression. Required reading for faculty onboarding documentation.

### 4.5 Equity Principle
Constitutional-level rule for all student-facing bots: the bot guarantees equal pedagogical access regardless of language background, prior preparation, or socioeconomic status. Scaffolding must compensate for inequalities, not amplify them. All students receive identical pedagogical quality (not identical content).

### 4.6 SPI Traceability Layer
Each SPI should carry: `spi_id`, `kernel_version`, `architecture_version`, `mapping_version`, `timestamp`. Runtime trace: stage transitions, enforcement trigger events, evaluation gate activations, effort escalation events. Enables research-grade comparative studies.

### 4.7 Policy–Algorithm Separation Principle
The Kernel is a Governance Layer (policy). The model is a Computational Engine (algorithm). Policy precedes and constrains algorithm. Consequence: changing model providers (DeepSeek → Gemini → Claude) does not change the Constitution. Upgrading model version does not change principles. This is the architectural basis for institutional claims about AI governance.

---

*End of Knowledge Audit. All 12 gaps have been incorporated into MASTER_LOGIC.md v2.0.*
