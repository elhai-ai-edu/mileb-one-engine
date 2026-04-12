# Bot Archetype And DNA Object Contracts

## Purpose

This document is the companion contracts file for the bot archetype and DNA registry.

Its role is to stabilize the minimal reusable object boundaries for pedagogical DNA and bot archetype modeling.

## Scope Rule

These are draft platform-library contracts.

They are not final runtime schemas.

They exist to create a stable shared vocabulary for DNA types, archetypes, phase fit, enforcement fit, and combination rules.

## Core Objects

### 1. DNAType

Represents a reusable pedagogical behavior type.

Minimal contract:

```json
{
  "dnaId": "scaffolding",
  "name": "Scaffolding",
  "coreBehavior": "reduces cognitive load through staged support",
  "typicalPhases": ["diagnostic", "development"],
  "enforcementTendency": "moderate"
}
```

### 2. BotArchetype

Represents a reusable bot family composed from one or more DNA types.

Minimal contract:

```json
{
  "archetypeId": "skill_developer",
  "name": "Skill Developer",
  "dnaIds": ["scaffolding", "transformational"],
  "typicalPhases": ["development"],
  "primaryRisk": "substitution_drift"
}
```

### 3. DNAMixRule

Represents an allowed, conditional, or blocked DNA combination rule.

Minimal contract:

```json
{
  "mixRuleId": "mix_001",
  "dnaIds": ["emotional", "gatekeeper"],
  "status": "conditional",
  "requiredGuard": "supportive_transition_rule",
  "risk": "learner_dropoff"
}
```

### 4. PhaseFitProfile

Represents how a DNA type or archetype fits across pedagogical phases.

Minimal contract:

```json
{
  "profileId": "phasefit_001",
  "targetType": "dna",
  "targetId": "socratic",
  "phase": "development",
  "fitLevel": "high",
  "notes": "productive when questioning advances thinking without bypass"
}
```

### 5. EnforcementProfile

Represents the enforcement tendency associated with a DNA type or archetype.

Minimal contract:

```json
{
  "enforcementProfileId": "enf_001",
  "targetType": "archetype",
  "targetId": "gatekeeper_archetype",
  "enforcementLevel": "strict",
  "dependsOn": ["phase_governance"],
  "softeningConditions": ["emotional_support_window"]
}
```

## Cross-Object Rules

### Rule 1: DNAType Is The Smallest Shared Behavior Unit

`DNAType` should remain more primitive than `BotArchetype`.

### Rule 2: Archetypes Compose DNA Types

`BotArchetype` should reference existing DNA types rather than redefining them.

### Rule 3: Mix Rules Are Governance-Sensitive

`DNAMixRule` should express whether a combination is allowed, conditional, or blocked.

### Rule 4: Phase Fit And Enforcement Fit Must Stay Distinct

A DNA type can fit a phase without implying a fixed enforcement level in all cases.

### Rule 5: Profiles Do Not Override Architecture Law

These contracts describe behavior tendencies.

They do not override kernel or governance constraints.

## Minimal Shared Enums

### `status`

- `allowed`
- `conditional`
- `blocked`

### `fitLevel`

- `high`
- `conditional`
- `low`

### `enforcementLevel`

- `minimal`
- `moderate`
- `strict`
- `adaptive`

### `targetType`

- `dna`
- `archetype`

## Final Statement

These contracts give the DNA registry a stable object vocabulary.

That makes it possible to bind bot behavior patterns to builders and governance checks without collapsing everything into free text.