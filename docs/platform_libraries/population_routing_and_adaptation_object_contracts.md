# Population Routing And Adaptation Object Contracts

## Purpose

This document is the companion contracts file for the population routing and adaptation library.

Its role is to stabilize the minimal reusable object boundaries for routing and adaptation decisions.

## Scope Rule

These are draft platform-library contracts.

They are not final user-profile schemas.

They exist to create a stable shared vocabulary for population profiles, entry profiles, overlays, routing decisions, and support modes.

## Core Objects

### 1. PopulationProfile

Represents the broad learner population context.

Minimal contract:

```json
{
  "populationProfileId": "pop_immigrant",
  "population": "immigrant",
  "defaultNeeds": ["vocabulary_access", "register_building"],
  "risk": "overdense_output"
}
```

### 2. LanguageEntryProfile

Represents the language starting point relevant to routing.

Minimal contract:

```json
{
  "languageEntryProfileId": "lang_001",
  "studentId": "student_123",
  "hebrewEntryLevel": "near_zero",
  "academicRegisterLevel": "low",
  "nativeLanguage": "arabic"
}
```

### 3. AdaptationOverlay

Represents a reusable adaptation layer applied without redefining the target skill.

Minimal contract:

```json
{
  "overlayId": "overlay_haredi_style_bridge",
  "population": "haredi",
  "affects": ["explanation_mode", "example_bridge", "sentence_restructuring"],
  "doesNotChange": ["skill_target", "evidence_meaning"]
}
```

### 4. RoutingDecision

Represents the selected routing outcome for a learner in a given context.

Minimal contract:

```json
{
  "routingDecisionId": "route_001",
  "studentId": "student_123",
  "populationProfileId": "pop_immigrant",
  "languageEntryProfileId": "lang_001",
  "selectedOverlayIds": ["overlay_translation_bridge"],
  "supportModeId": "support_simple_bilingual"
}
```

### 5. SupportModeProfile

Represents the support style emitted from routing.

Minimal contract:

```json
{
  "supportModeId": "support_simple_bilingual",
  "explanationDensity": "low",
  "correctionLoad": "bounded",
  "bridgeMode": "translation_plus_simple_hebrew"
}
```

## Cross-Object Rules

### Rule 1: Population Is Not The Same As Support Mode

`PopulationProfile` informs routing.

`SupportModeProfile` is the routed outcome.

### Rule 2: Entry Profile Matters

Routing should not assume one learner entry state for an entire population.

### Rule 3: Overlays Adapt Access, Not Competence Meaning

`AdaptationOverlay` may change the path or explanation style.

It must not change the meaning of success.

### Rule 4: Routing Must Be Traceable

`RoutingDecision` should point back to the profile and overlay logic that justified it.

### Rule 5: Support Modes Must Stay Reusable

`SupportModeProfile` should express a reusable mode, not a one-off local tweak.

## Minimal Shared Enums

### `population`

- `immigrant`
- `haredi`
- `mixed`

### `hebrewEntryLevel`

- `near_zero`
- `functional_low_register`
- `strong_non_academic`
- `mixed_multilingual`

### `explanationDensity`

- `low`
- `medium`
- `high`

### `correctionLoad`

- `bounded`
- `moderate`
- `intensive`

## Final Statement

These contracts give the routing library a stable object vocabulary.

That makes it possible to route support consistently without letting local adaptations become hidden architecture.