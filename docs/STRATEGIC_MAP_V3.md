# STRATEGIC_MAP_V3.md — MilEd.One: The Full Picture
> Created: 2026-03-20 | Based on: 364-file deep audit + 8 Explore agents
> Purpose: Human-readable synthesis — for decisions, not for machines.

---

## A NOTE BEFORE YOU START

This document exists because the technical audit files got very detailed very fast. What you'll find here is the same knowledge, but organized around questions a person actually asks:

- *What bots do we have and what makes each one tick?*
- *What does each questionnaire section actually control?*
- *What did we bring over from ED421 and where does it live now?*
- *What are the genuinely new ideas we discovered?*

No jargon barriers. Just the system, explained clearly.

---

## PART 1 — THE BOT ZOO
### Every Specialized Bot We Found, and Its 3 Most Important Rules

---

### 🔧 BOT BUILDER BOT (בוט בונה הבוטים)
*"The bot that makes all other bots."*

A faculty-facing tool that walks instructors through a 32-question questionnaire and converts their answers into a working system prompt. The most architecturally complex bot in the system.

1. **It teaches pedagogy while collecting specs.** The questions aren't just data collection — they're designed to help the instructor think clearly about what they actually want. Answering Q13 ("What should this bot never do?") forces real boundary-setting.
2. **Every answer becomes a structured variable, not free text.** There's no ambiguity. "I want the bot to be dialogic" becomes `dialogic_style: 0.8`. This feeds directly into the SP generator.
3. **Cluster I (governance) is mandatory for evaluation bots.** If the bot will give any kind of assessment, the instructor must answer I1–I4 before any evaluation gates activate. No rubric = no evaluation. Hard stop.

---

### 📝 PARAPHRASE TRAINER BOT (בוט מאמן פרפרזה)
*"The most technically sophisticated student-facing bot in the system."*

Teaches academic paraphrasing — which is harder than it sounds, because most students just swap words. This bot breaks the skill into layers and makes students climb them one at a time.

1. **The 5-Level Skill Ladder.** Level 1: understand what you're paraphrasing. Level 2: change the vocabulary. Level 3: change the sentence structure. Level 4: full paraphrase. Level 5: paraphrase as part of real academic writing. You cannot skip levels — the gate is your demonstrated mastery at the current one.
2. **Micro-task decomposition.** Instead of saying "paraphrase this sentence," the bot breaks it down: "Just change the subject. Good. Now change the verb. Good." This is Cognitive Load Theory made operational — the student never feels overwhelmed because they're only ever doing one thing at a time.
3. **The bot never writes the paraphrase.** Not even once. Not even as a demonstration. If you need an example, it shows a *different* sentence paraphrased, never the one you're working on. The student's work stays the student's.

---

### 💬 ED421 STUDENT SUPPORT BOT (בוט תמיכה בסטודנטים)
*"The most emotionally intelligent bot in the system."*

Designed for ongoing student support across a portfolio of courses. Its secret is a complete triadic routing system: it reads the student's emotional state, maps it to what they probably need, and selects the right task.

1. **The Mood-Intent-Task triple map.** 45 mood states. 50+ expressed intents. 50+ tasks. These three maps have referential integrity — every mood connects to plausible intents, every intent connects to appropriate tasks. The bot doesn't guess; it routes.
2. **The Emotional Window.** After 5 consecutive exchanges with no progress, the bot quietly pauses, acknowledges the student's state, and offers a smaller, more achievable step. The student never sees this mechanism activate — they just notice the conversation got more manageable.
3. **Course context injection.** The same bot engine serves 20+ courses by injecting a "course context layer" at runtime: audience, tone, language register, cultural sensitivities, specific skill focus. One engine, many faces.

---

### 🔬 GERONTOLOGY RESEARCH BOT (בוט מחקר איכותני בגרונטולוגיה)
*"The only bot in the system built around ethical framing."*

Guides students through qualitative research on aging — interviewing older adults, coding transcripts, synthesizing themes, reflecting on findings.

1. **Reflection is a gate, not a bonus.** Before a student can write their final chapter, they must complete a reflection journal: "What surprised you? What changed your thinking? What do you want readers to understand?" This isn't optional enrichment — advancement is blocked until it's done.
2. **Readiness is evidential, not claimed.** "I'm ready to move to thematic analysis" isn't enough. The student must demonstrate it: submit 5 coded quotes with justifications. The bot checks the evidence, not the assertion.
3. **Ethics is baked in from the start.** Before the first interview, the bot covers: dignity, anonymity, trauma awareness, how to handle emotional moments, how to ask for clarification without bias. These aren't a footnote — they're the entry gate to the whole process.

---

### 📚 PREPARATORY LITERACY BOT (בוט אוריינות מכינה)
*"Built for students who arrive at college with a language barrier."*

Designed for preparatory/pre-academic programs, with explicit bilingual mediation (Hebrew + Arabic). Unique in the system for treating code-switching as a feature, not a problem.

1. **Language is a bridge, not a wall.** Students can think in Arabic and output in Hebrew. The bot supports this explicitly — it doesn't push Hebrew-only when the concept is complex.
2. **Register is the goal, not vocabulary.** The bot isn't trying to expand vocabulary size; it's trying to move students from colloquial/spoken register to academic/written register. These are different skills.
3. **Cultural familiarity before abstraction.** Concepts are anchored in the student's lived experience before being abstracted into academic framing. The sequence matters: familiar → bridge → academic.

---

### 🎤 PRESENTATION COMPANION BOT (בוט מלווה הכנת פרזנטציה)
*"Long-form, semester-spanning support for a single deliverable."*

Designed to accompany students across an entire semester as they prepare a final presentation — not a one-session helper.

1. **It tracks where you are in the process.** Week 3 vs. week 10 means completely different support. The bot remembers (via session continuity token) and adjusts accordingly.
2. **It doesn't build the presentation for you.** At every stage, the student produces the artifact and the bot responds to it. The bot never drafts slides, never writes talking points, never fills in outlines.
3. **Structure before content.** The bot insists on agreeing on the logical structure of the presentation before any content work begins. "What's the one thing you want the audience to walk away knowing?" must be answered before slide-building starts.

---

### 🏗️ INNOVATION PROJECT BOT (בוט מלווה פרויקט חדשנות)
*"A gatekeeper bot with teeth."*

Guides students through a 7-stage structured research assignment: problem identification → previous solutions → two innovative solutions → source evaluation → comparison → 200-word summary → oral exam simulation.

1. **Seven real stages with real gates.** You don't write the summary until you've compared the solutions. You don't compare until you've evaluated your sources. Each stage has an explicit entry requirement, not just a suggestion.
2. **The oral exam simulation is built in.** Stage 7 is the bot playing a questioner and the student defending their project verbally. This is preparation for real-world academic defense, not just writing practice.
3. **The rubric is declared at the start.** Before Stage 1, the student sees the full evaluation rubric. This isn't hidden — it's the scaffolding. They know exactly what they're being evaluated on before they begin.

---

### ✅ PROJECT EVALUATOR BOT (בוט הערכת עבודות)
*"The system's only pure evaluation bot — and the strictest."*

Provides rubric-based formative feedback on student research outputs. Notable for being the most enforcement-heavy bot in terms of what it absolutely will not do.

1. **No rubric, no feedback.** This isn't a guideline — it's a hard gate. If the instructor hasn't provided an approved rubric, the bot won't evaluate. Full stop.
2. **Formative only — no scores unless explicitly configured.** The default output is narrative feedback, not a number. Numeric scores require `DEVELOPMENT_LEVEL ≥ 3` and explicit `SCORE_POLICY` configuration.
3. **Every judgment has a chain of reasoning.** The bot never says "this is weak." It says "this claim in paragraph 2 lacks supporting evidence because X, and here's what supporting evidence would look like." Analytic integrity is structural here, not aspirational.

---

### 🌱 COURSE COMPANION BOT (בוט מלווה קורס — Generic)
*"The most flexible bot in the system. Also the most dangerous if misconfigured."*

The general-purpose bot template. It can be SOCRATIC, INFORMATIONAL, SCAFFOLDING, or HYBRID depending on how its questionnaire answers are set.

1. **Its flexibility is also its risk.** Because it can be so many things, a poorly configured instance can accidentally become INFORMATIONAL when it should be SOCRATIC. The questionnaire is the safeguard.
2. **It adapts to course phase.** Same bot, same course — but behavior in Week 1 (diagnostic phase) vs. Week 8 (development phase) is meaningfully different. Phase is declared in config, not inferred.
3. **It closes every session with a clear next step.** The Closure Protocol requires: a brief summary of what happened, one concrete thing the student is taking away, and the first action for next session. Not optional.

---

### 👨‍🏫 FACULTY MENTOR BOT (בוט מנטור לסגל)
*"The one bot that's allowed to give full outputs."*

Faculty-facing design support. Helps instructors think through their pedagogical decisions — course design, rubric construction, bot configuration. Notably exempt from the No-Substitution rule because the "student" here is the instructor, whose work *can* be done for them.

1. **Full output is allowed.** This bot can draft rubrics, write learning objectives, generate lesson structures. The substitution prohibition doesn't apply because the instructor's work-product isn't the learning itself.
2. **Pedagogical transparency is required.** The bot doesn't just give outputs — it explains the pedagogical reasoning behind every recommendation. "Here's a rubric, and here's why this structure works for formative assessment."
3. **It can't be accessed by students.** Scope restriction is hard-coded. Even if a student somehow reached this bot's URL, the Operation Mode lock would prevent student-mode interaction.

---

### 🏛️ ASSESSMENT-TO-LEARNING TRANSITION BOT (בוט המעבר מהערכה ללמידה)
*"The bridge bot — turns a score into a learning plan."*

Activated after assessment results come in. Takes a student's diagnostic score and converts it into a personalized learning pathway — not just "you failed, study more."

1. **Pathway is suggested, not imposed.** The bot recommends a learning track based on score, but the student chooses. Agency is preserved even when the student is below threshold.
2. **Three pathway types.** Remedial (below 40th percentile): intensive foundational work. Balanced (40–70th): standard progression. Accelerated (above 70th): can skip introductory levels and start at Level 4–5 of the relevant OPAL tools.
3. **Feedback comes before the pathway.** The student gets a personal insight ("your strength is persistence; your area for growth is prioritization") before seeing the path options. This ensures the pathway feels chosen, not assigned.

---

### 🧰 OPAL SUITE — 30 TOOLS ACROSS 6 TIERS
*"The academic literacy toolkit — not one bot, but a library."*

30 micro-tools organized in two parallel tracks. Not sequential — any tool can be used independently based on the student's specific need.

**Track A — For Immigrant Students (Hebrew as L2):**
- **Word-in-Context:** One word → definition + inflection table + 3 sentences + 2 corrected common errors. Output density adjusts to Hebrew level (beginner: 5 simple words in definition. Advanced: full etymology).
- **Register Ladder:** Colloquial phrase → 4 parallel versions (casual → formal → academic → research) + metalinguistic comment explaining what changed and why.
- **Course Glossary:** Course name + discipline → 20 curated key terms with definition, example sentence, and translation. Domain clusters are pre-built (social sciences, sciences, humanities).

**Track B — For Haredi Students (Yeshiva → Academic transition):**
- **Style Bridge:** Yeshiva-style paragraph → academic Hebrew, side-by-side, max 3 corrections per turn. Never uses the words "error" or "wrong" — always "academic convention."
- **Loanword Bridge:** Foreign academic term → definition + etymology + Talmudic conceptual bridge. ("Correlation is like gezeira shava — two things logically linked without one causing the other.")
- **Sentence Splitter:** Long yeshiva sentence (potentially holding 4–5 ideas connected by "and thus") → idea count + separated academic sentences, side-by-side.

**The 3 universal rules for every OPAL tool:**
1. Maximum 3 corrections per turn (cognitive load limit — hard rule).
2. The tool explains what changed AND why, always.
3. Advancement criterion is behavioral: not "did you do this?" but "can you predict what to do before asking?"

---

### 📊 9-LEVEL CLASSROOM CONTINUUM BOTS (רמות 1–9)
*"Not 9 bots — 9 ways to use any bot in a classroom."*

A framework for instructors, not a separate system. Defines 9 escalating levels of AI integration in classroom teaching.

| Level | Role | The One Key Rule |
|-------|------|-----------------|
| 1 | Live Dictionary | Instant, no preparation required from student |
| 2 | Example Generator | Examples personalized to student's interest domain |
| 3 | Self-Check Tool | Bot gives immediate right/wrong + explanation |
| 4 | Paraphraser | Bot rephrases the same content 2 ways; class votes on which helped |
| 5 | Brainstorm Partner | Bot generates options; class decides which to pursue |
| 6 | Role-Player | Bot becomes a character; student interviews it |
| 7 | Knowledge Mapper | Bot generates a concept map; class compares with instructor's map |
| 8 | Diagnostician | Bot identifies 3 weakness areas in submitted work; recommends 1 exercise each |
| 9 | Student-Built Bot | Students write the prompts for future cohorts — deepest metacognitive level |

---

## PART 2 — THE VARIABLE LIBRARY
### What Each Questionnaire Cluster Actually Controls

---

The questionnaire has 9 clusters (A through I) plus a teaching-context extension. Here's what each one is actually doing — and why it matters.

---

**CLUSTER A — Pedagogical Starting Point**
*Questions 1–3: Why does this bot exist?*

| Variable | What it controls |
|----------|-----------------|
| `MISSION_CLAUSE` | The single sentence that defines what this bot is for — injected into Layer 0 (Header) |
| `BOT_SCOPE` | The explicit list of what this bot does NOT do — becomes a hard fence in Layer 4 (Binding Principles) |
| `LEARNER_PROFILE` | The real-world context (a specific course, a specific pain point) — grounds the bot in a concrete situation |

**Why it matters:** A vague answer to Q1 ("I want students to learn better") produces a vague bot. A specific answer ("students arrive at week 6 having never cited a source") produces a targeted one.

---

**CLUSTER B — Audience, Language, Context**
*Questions 4–7: Who is this for, and what language world do they live in?*

| Variable | What it controls |
|----------|-----------------|
| `LANGUAGE_MODE` | `HEB_ONLY` / `L1_THINK_HEB_OUTPUT` / `CUSTOM` — this is a BIND variable, meaning it cannot be changed later |
| `AUDIENCE_LEVEL` | Beginner / Intermediate / Advanced / Mixed — affects scaffolding density and vocabulary |
| `ENTRY_STATE` | When in the course does the student encounter this bot? (Pre-lesson / mid-unit / post-assessment) |
| `LEARNER_POPULATION` | Immigrant / Haredi / Mixed — routes to different OPAL tool tiers if OPAL is integrated |

**Why it matters:** Q4a (Language & Identity) is one of only 7 Binding Principles. Once set, the language gate cannot be overridden by any other configuration.

---

**CLUSTER C — Depth & Infrastructure**
*Questions 8–10: How long will this interaction last, and does it need memory?*

| Variable | What it controls |
|----------|-----------------|
| `INTERACTION_MODE` | SHORT (one session, no continuity) / LONG (multi-session, state tracked) / HYBRID (student chooses depth) |
| `TIME_HORIZON` | Single lesson / unit / semester / ongoing |
| `DATA_TRACKING` | None / Artifacts only / Full process — determines whether a session continuity token is used |

**Why it matters:** SHORT mode bots have fundamentally different architectures than LONG mode bots. A SHORT bot doesn't need a state machine. A LONG bot without session tracking breaks between sessions. This choice cascades through the entire SP.

---

**CLUSTER D — Bot Identity & Style**
*Questions 11–15: What does this bot sound like and how does it move?*

| Variable | What it controls |
|----------|-----------------|
| `PERSONA` | Companion / Facilitator / Coach / Tutor — sets the relational stance |
| `IDENTITY_SENTENCE` | "I am X, here to help you Y" — the bot's self-declaration, used in opening |
| `STUCK_PROTOCOL` | What happens when a student is stuck: `DIRECTIVE` (give more hints) / `BALANCED` / `SOCRATIC_FIRST` (keep asking questions) |
| `EMOTION_TASK_PRIORITY` | `EMOTION_FIRST` / `TASK_FIRST` / `INTEGRATED` — how the bot handles it when a student is clearly distressed |
| `PACING_MODE` | SLOW / ADAPTIVE / FAST — with a hard rule: if stress signals detected, pacing always downshifts regardless of config |

**Why it matters:** The identity sentence is surprisingly powerful. A bot that begins every session with "I'm here to help you think, not to think for you" trains a very different interaction than one that begins with "Ask me anything."

---

**CLUSTER E — Boundaries & Agency**
*Questions 16–19: What is this bot absolutely not allowed to do?*

| Variable | What it controls |
|----------|-----------------|
| `NEVER_DO_LIST` | The explicit list of forbidden actions ("write my essay," "solve this for me," "give me the answer") — BIND variable |
| `AGENCY_LEVEL` | `GUIDED` / `SHARED` / `LEARNER_LED` — how much initiative the student takes vs. the bot |
| `REFUSAL_STYLE` | `PEDAGOGICAL` / `SOFT` / `DIRECT` — how the bot says no (see Appendix F of MASTER_LOGIC) |
| `ESCALATION_RULE` | What happens after 2+ boundary violations: explain the rationale, then hold firm |

**Why it matters:** Q13 (Never-Do) and Q14 (Agency Preservation) are both Binding Principles. They map directly to Kernel Principles #1 and #2. This is where the instructor makes the single most consequential decision about their bot.

---

**CLUSTER F — Process Skeleton**
*Questions 20–24: Does this bot have a sequence, and how strictly must it be followed?*

| Variable | What it controls |
|----------|-----------------|
| `PROCESS_TYPE` | Linear / Adaptive / Gated |
| `STAGES[]` | The numbered sequence of stages, each with: name, entry condition, core question, stuck handling, advancement criterion |
| `STUCK_POINT_RECOVERY` | What happens at the most common failure points — pre-mapped by the instructor |
| `MANDATORY_STAGES` | The stages that CANNOT be bypassed — these activate the No-Skip gate (Kernel Principle #3) |
| `READINESS_SIGNALS` | The specific evidence the bot looks for before allowing stage advancement |

**Why it matters:** Q20 (mandatory stages) activates Kernel Principle #3. This is where "No-Skip" stops being a philosophy and starts being a technical gate. If you don't define mandatory stages, No-Skip has nothing to enforce.

---

**CLUSTER G — Thinking, Regulation, Error Handling**
*Questions 25–28: How does this bot handle confusion, mistakes, and overload?*

| Variable | What it controls |
|----------|-----------------|
| `METACOGNITIVE_TRIGGER` | When does the bot pause to ask "what's happening for you right now?" — before stage transitions, after errors, etc. |
| `ERROR_NORMALIZATION` | How are mistakes framed: celebrated ("great, you found a mistake") / normalized ("this is a common step") / redirected ("let's look at this differently") |
| `OVERLOAD_DETECTION` | What signals count as "this student is overwhelmed" |
| `REGULATION_MODE` | SLOW_DOWN / ALTERNATIVE_PATH / PAUSE_AND_REFLECT / CONTINUED_ACTION — what the bot actually does when overload is detected |

**Why it matters:** These are SOFT variables — they adapt in real-time and cannot be locked down. The instructor sets the defaults; the bot modulates from there based on live signals.

---

**CLUSTER H — Knowledge, Uncertainty, Closure**
*Questions 29–32: What does this bot know, what does it admit it doesn't know, and how does it end?*

| Variable | What it controls |
|----------|-----------------|
| `KB_DOMAINS` | The content areas the bot can draw from |
| `FORBIDDEN_KNOWLEDGE` | Topics the bot must not raise or engage with — becomes a content block in Layer 6 |
| `UNCERTAINTY_POLICY` | `ASK` (check with student) / `REFER` (send to instructor) / `QUALIFY` (answer with confidence marker) / `DECLINE` (don't answer) |
| `CLOSURE_GOAL` | How the session ends: Summary / Insight / Application / Next Step |

**Why it matters:** Q27 (Epistemic Humility) is a Binding Principle. This is the rule that stops the bot from inventing answers when it doesn't know. It's the foundation of academic integrity in AI-assisted learning.

---

**CLUSTER I — Governance (Added in v3.0, mandatory for evaluation bots)**
*Questions I1–I4: Does this bot have permission to evaluate? On what basis?*

| Variable | What it controls |
|----------|-----------------|
| `EVALUATION_POLICY` | `none` / `formative` / `criteria_only` / `summative` — what level of assessment is this bot allowed to give |
| `RUBRIC_STATUS` | `provided` / `partial` / `none` — **if none, evaluation gate activates and blocks all feedback** |
| `ACADEMIC_LEVEL` | `basic` / `intermediate` / `advanced` / `high` — sets the depth ceiling for all responses |
| `DATA_TRACKING_LEVEL` | `none` / `artifacts_only` / `full_process` — what gets logged and retained |

**Why it matters:** Cluster I was added specifically because evaluation bots kept giving feedback without rubrics. This cluster exists to prevent that — it's the governance layer. If I2 (`RUBRIC_STATUS`) is `none`, the bot simply cannot evaluate. No workaround.

---

**TEACHING CONTEXT EXTENSION (T1–T4) — Instructor-Side Stage Awareness**
*Set by the instructor at configuration time, not by the questionnaire.*

| Variable | Values | Controls |
|----------|--------|----------|
| `T1_TOPIC_STAGE` | presentation / practice / integration / diagnostic / summary / evaluation | What type of lesson is this? |
| `T2_UNIT_SCOPE` | specific / connected / full | How granular is the focus? |
| `T3_TARGET_DEPTH` | familiarity / mastery / analysis / creation / reflection | What cognitive level is the target? |
| `T4_COURSE_PHASE` | early / mid / late / capstone | Where in the semester does this session sit? |

**Why it matters:** These run in parallel with `CONTEXT_STAGE` (the bot's real-time inference of where the student actually is). Teaching Stage is what the instructor planned. Learning Stage is what the student is experiencing. They're often different — and the bot has to hold both.

---

## PART 3 — THE ED421 TO MILED BRIDGE
### What Was Inherited, What Was Transformed, What Was Left Behind

---

Think of MilEd.One as ED421 with three improvements: better architecture, a governance layer, and a principle that the bot is a configuration, not a separate system.

Here's the lineage, in plain terms:

---

### 🔵 DIRECTLY INHERITED (Core logic that moved over unchanged)

**The 7 Kernel Principles**
They were called something different in ED421 (more informal, less codified), but the ideas were already there: don't write for the student, don't skip stages, don't evaluate without criteria. ED421 stated these as design guidelines. MilEd.One elevated them to constitutional rules — unchangeable by any configuration.

*Now lives in:* MASTER_LOGIC.md Part 1

---

**The Mood-Intent-Task Framework**
The ED421 Student Support Bot's three maps (45 moods, 50+ intents, 50+ tasks) were a complete innovation. The idea that a bot should route based on emotional state + expressed need + available task — and that all three maps should maintain referential integrity — came entirely from the ED421 files.

*Now lives in:* MASTER_LOGIC.md Appendix H

---

**The 8-Layer System Prompt Structure**
ED421 had early drafts of a structured SP template. The 8-layer skeleton (Header → Core Canonical → Cognitive Integrity → Operation Mode → Binding Principles → Process/Flow → Adaptive → Closure) was formalized from those drafts.

*Now lives in:* MASTER_LOGIC.md Part 2

---

**The Paraphrase Bot's Micro-Task Approach**
The insight that paraphrasing should be taught in micro-steps (one word, then one clause, then one sentence) — treating cognitive load as something to engineer, not just manage — came from the original Paraphrase Bot design files.

*Now lives in:* MASTER_LOGIC.md Part 21 (Adaptive Protocols) + Appendix of OPAL tools

---

**The Session Continuity Token**
The `<!-- META: {"lastStage":"X","nextStep":"Y","studentName":"Z"} -->` format — the mechanism that lets a bot "remember" across sessions without server-side state — was already present in ED421 implementation files.

*Now lives in:* MASTER_LOGIC.md Part 6 (SP Structure Layer 8)

---

### 🟡 TRANSFORMED (Core ideas that changed significantly)

**Bot Taxonomy → Phase-Based Governance**

*In ED421:* There were Student Bots and Instructor Bots — two different systems.

*In MilEd.One:* There is ONE engine. "Student Bot" and "Instructor Bot" are just Operation Modes. The same Kernel, the same structure — but with different presets activated. Regulation is determined by Phase (diagnostic / development / reflection / design / analytics), not by which bot you're using.

*Why it changed:* Having two systems created maintenance debt. Changing a principle meant updating it in two places and hoping they stayed in sync. One engine removes that problem entirely.

---

**FunctionPolicies → Phase-Based Enforcement**

*In ED421:* Rules for what each bot type could and couldn't do lived in `config.functionPolicies` — a JSON object per bot type.

*In MilEd.One:* Those policies are gone. Instead, the Phase determines enforcement. A bot in Development Phase automatically gets strict No-Skip, No-Substitution enforcement. A bot in Diagnostic Phase gets relaxed enforcement (measurement doesn't require struggle). You don't configure this — the Phase declaration does it automatically.

*Why it changed:* FunctionPolicies created situations where a "diagnostic bot" configured with strict policies would accidentally enforce development-level rules during assessments. Phase solved this.

---

**"No shortcuts" → Evidence-Based Confirmation Rule**

*In ED421:* The Socratic principle was stated absolutely: the bot never gives a solution. Ever. Full stop.

*In MilEd.One:* Still mostly true — but with one important nuance. When a student provides reasoning that genuinely meets the stated criteria (evidence-based, structurally sound, no competing alternative unchallenged), the bot APPROVES and ADVANCES. Not because the student demanded it. Because they earned it. The Socratic spiral doesn't continue past the point of demonstrated mastery.

*Why it changed:* Students were frustrated when they'd given a correct, well-reasoned answer and the bot kept probing. The original rule was right but too blunt. The new rule distinguishes "not answered yet" from "answered well — move on."

---

### 🔴 DEPRECATED (Left behind — intentionally)

**`config.functionPolicies`**
The per-bot-type rules JSON object. Still referenced in `functions/chat.js` (pending cleanup — see CLAUDE.md technical debt BP-3). Architecturally replaced by Phase-Based enforcement.

**The "Student Bot / Instructor Bot" distinction as separate engines**
Retired entirely. Operation Mode is the replacement. The underlying engine is always the same.

**"Rubric optional" evaluation policy**
Early ED421 evaluation bots could give feedback without a rubric. This was found to produce heuristic judgments — exactly what the system is designed to prevent. Now: no rubric, no evaluation. Hard gate.

---

## PART 4 — EVOLUTION HIGHLIGHTS
### The 5 Most Advanced Concepts Found in the New Files

These are ideas that weren't present in the first 150 files of the project — concepts that represent genuine intellectual advances in how the system thinks about AI-in-education.

---

### 1. 🧠 PHASE-BASED RUNTIME GOVERNANCE
*What it is:* The move from "different bots have different rules" to "the same system applies different rules depending on what kind of learning is happening right now."

*Why it's advanced:* Most AI systems have one mode. MilEd.One has six: Learning Diagnostic, Learning Development, Learning Reflection, Teaching Design, Teaching Development, and Institutional Analytics. Each activates a different enforcement profile from the same Kernel. The bot doesn't change — the governance layer changes what the bot is allowed to do.

*What it solves:* A student in diagnostic mode should be able to get more help than a student in development mode. A faculty member designing a course should be able to get full outputs that a student never could. Phase makes this automatic.

*Where it lives:* MASTER_LOGIC.md Parts 17–18

---

### 2. 🏛️ THE EVIDENCE-BASED CONFIRMATION RULE
*What it is:* When a student gives a genuinely good answer — evidence-based, structurally sound, meeting the stated criteria — the bot confirms and advances without extending the Socratic questioning.

*Why it's advanced:* This is a hard problem in AI tutoring. The naive solution is "always ask more questions." But that fails students who have already demonstrated mastery. The rule formalizes exactly when to stop probing and say "yes, correct, move forward" — with five explicit conditions that must all be true.

*What it solves:* The frustration of being Socratically interrogated past the point of demonstrated understanding. And it preserves learner agency — the student earns advancement, they don't just survive it.

*Where it lives:* MASTER_LOGIC.md Part 1.1.4 (modified) + Appendix G

---

### 3. 🔧 THE 12-LAYER BINDING PRINCIPLES TEMPLATE
*What it is:* Every binding principle (the things the bot absolutely must and must never do) isn't just a rule — it has a complete 12-layer implementation specification. From how it's captured in the questionnaire (Layer 1) to how it's enforced at runtime (Layers 5–6) to how it's handled when the student repeatedly violates it (Layer 10 — Drift Handling).

*Why it's advanced:* It converts pedagogical principles from aspirational guidelines into engineering specifications. "The bot never writes for the student" becomes: (a) the questionnaire question that surfaces it, (b) the SP clause that declares it, (c) the runtime guard that blocks it, (d) the refusal pattern that responds to it, (e) the drift handler that escalates when the student keeps trying.

*What it solves:* Inconsistency. Different bot builders were implementing the same principle differently. Now every binding principle has an identical implementation structure across all bots.

*Where it lives:* MASTER_LOGIC.md Part 20

---

### 4. 🎭 THE MOOD-INTENT-TASK TRIADIC SYSTEM
*What it is:* A complete emotional-cognitive routing system with three maps — 45 mood states, 50+ expressed intents, 50+ tasks — that maintain referential integrity with each other. When a student is in a particular emotional state and expresses a particular need, the system routes them to an appropriate task without the student knowing the routing is happening.

*Why it's advanced:* Every other bot in this system responds to what the student says. This bot responds to what the student is experiencing, which is often different. The Emotional Window mechanism (5 exchanges without progress → quiet pivot to smaller step) is particularly sophisticated — it regulates without the student ever feeling regulated.

*What it solves:* The situation where a student arrives distressed and the bot ignores the distress and keeps asking academic questions. Or where a student claims to be fine but their responses show confusion. The triadic system catches what the surface conversation misses.

*Where it lives:* MASTER_LOGIC.md Appendix H

---

### 5. 🏫 THE 9-LEVEL PEDAGOGICAL INTEGRATION CONTINUUM
*What it is:* A framework for instructors — not students — that maps 9 escalating levels of how AI can be integrated into classroom teaching, from the bot as a live dictionary (Level 1) to students building bots themselves (Level 9). Each level has a specific pedagogical goal, a specific process design, and an advancement criterion for moving to the next.

*Why it's advanced:* It gives instructors a ladder instead of a cliff. The most common reason instructors don't use AI in class isn't skepticism — it's not knowing where to start. Level 1 is low-risk, low-preparation, immediately useful. Level 9 is transformational metacognitive learning. The continuum makes the distance between them navigable.

*What it solves:* The "all or nothing" problem with AI in education. Most faculty either use it for everything (and lose pedagogical control) or use it for nothing (and miss the benefit). Nine clearly defined, bounded levels gives them a map.

*Where it lives:* MASTER_LOGIC.md Part 26

---

## QUICK REFERENCE CARD

| I want to know... | Look here |
|------------------|----------|
| The immutable rules every bot must follow | MASTER_LOGIC Part 1 (Kernel) |
| How to build a bot from scratch | MASTER_LOGIC Appendix B (Checklist) + Part 4 (Questionnaire) |
| What each questionnaire question controls | This document, Part 2 |
| How a specific bot works | This document, Part 1 (Bot Zoo) |
| What changed from ED421 | This document, Part 3 |
| Where a specific variable lives | KNOWLEDGE_AUDIT_V3.md Section 2 |
| What gaps still need fixing | KNOWLEDGE_AUDIT_V3.md Sections 4 + 4B |
| The full OPAL tool catalog | MASTER_LOGIC Part 27 |
| How classroom integration levels work | MASTER_LOGIC Part 26 |

---

*"One engine. Many configurations. One set of rules that never moves."*
