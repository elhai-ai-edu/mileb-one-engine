# Population Routing And Adaptation Library

## Purpose

This document is the first draft of a shared population routing and adaptation library for MilEd.One.

Its job is to normalize reusable routing logic for different learner populations without pushing population-specific pedagogy into architecture law.

## Source Lineage

Primary sources used in this first draft:

- `docs/opal-populations.md`
- `docs/KNOWLEDGE_AUDIT_V3.md`
- `docs/STRATEGIC_MAP_V3.md`

## Core Design Claim

MilEd should not treat adaptation as a local bot trick.

Population-sensitive support should be described through reusable routing dimensions and adaptation overlays.

## What This Library Owns

This library owns:

- routing dimensions for learner populations
- adaptation overlays
- support-mode differences by population profile
- language and register bridging logic where reusable

This library does not own:

- the core definition of a skill
- product workflow stages
- institution-specific demographic policy

## Draft Routing Dimensions

### Dimension 1: Population Profile

- immigrant
- Haredi
- mixed

### Dimension 2: Language Starting Point

- near-zero Hebrew
- functional Hebrew with low academic register
- strong Hebrew in non-academic register
- mixed multilingual entry

### Dimension 3: Primary Support Need

- vocabulary access
- register shift
- syntax simplification
- academic discourse alignment
- conceptual bridge support

### Dimension 4: Support Intensity

- minimal adjustment
- scaffolded access
- high mediation

## Draft Population Overlays

### Immigrant Overlay

- uses simplicity-first explanations
- may rely on translation or bilingual bridge support
- emphasizes vocabulary acquisition, register building, and gradual structure support

### Haredi Overlay

- assumes rich language resources in a non-academic register
- emphasizes style bridge, sentence restructuring, and conceptual mapping into academic discourse
- avoids falsely praising richness when academic fit is still weak

### Mixed-Class Overlay

- supports differentiated routing inside one classroom frame
- requires tool choice and explanation density to adjust without redefining the task itself

## Draft Support Modes

### Simplicity-First Bilingual Mode

- short explanations
- translation bridge
- bounded correction load

### Register Bridge Mode

- side-by-side everyday to academic phrasing
- explicit explanation of register shift
- examples tuned to course writing or speaking tasks

### Style Bridge Mode

- converts strong non-academic language into academic discourse
- emphasizes restructuring over vocabulary praise
- keeps conceptual dignity while changing output form

## Adaptation Rule

Population routing should adapt entry conditions, explanation mode, scaffolding density, and bridge logic.

It should not redefine the target skill or lower the core meaning of demonstrated competence.

## Adaptation Limits

Adaptation may change:

- entry wording
- explanation mode
- bridge examples
- support density

Adaptation must not change:

- target skill meaning
- evidence semantics
- credential threshold logic
- stage ownership rules

## Routing Use Cases

- tool selection
- explanation density
- correction load per turn
- register ladder use
- bridge examples and conceptual mediation

- tool family selection
- whether interaction should begin with simplification, bridge, or direct academic framing

## Risks And Failure Modes

- population logic collapses into stereotypes
- routing changes the target skill instead of the access path
- product-local adaptations drift away from a shared overlay model

## Final Statement

This library gives MilEd a reusable adaptation layer between learner diversity and shared pedagogical goals.

That is necessary if the platform is going to support differentiated access without fragmenting into separate pedagogical systems.