# Inter-Library Contracts

## Purpose

This document defines how the Wave 1 shared libraries relate to one another.

Its job is to prevent conceptual duplication and unclear ownership between:

- skill ontology and diagnosis
- transformation templates
- product protocols

## Contract 1: Skills Own Skill Meaning

The skills library owns:

- what a skill is
- how a skill is classified
- how a skill is diagnosed
- how a skill progresses
- what counts as skill evidence
- how a skill may connect to credentials

Transformation and product protocol documents may reference skills.

They must not redefine skill identity, skill states, or evidence meanings.

## Contract 2: Transformation Owns Redesign Logic

The transformation library owns:

- what a transformation template is
- what transformation level means
- what transformation families exist
- how a transformed unit is structured
- how gap checks and feasibility checks operate

Skills and product protocol documents may use transformation outputs.

They must not redefine transformation levels, family meanings, or transformed unit logic.

## Contract 3: Product Protocols Own Operating Sequence

The product protocol registry owns:

- operational flow
- stage order
- required checks within a product journey
- intake and output structure at the product level

It does not own skill definitions or transformation definitions.

It consumes them.

## Contract 4: Skills Feed Transformation

Transformation templates may attach to:

- target skills
- prerequisite skills
- evidence expectations
- progression expectations

These must be imported conceptually from the skills library.

Transformation may define where a skill is activated.

It may not define what the skill itself means.

## Contract 5: Transformation Feeds Product Workflows

Product workflows may select and compose transformation templates.

They may describe:

- when templates are chosen
- what decision criteria are used
- what outputs are exported

They may not redefine template families, transformation levels, or transformed unit object logic.

## Contract 6: Skills Feed Product Workflows

Product workflows may consume:

- skill targets
- diagnosis signals
- evidence expectations
- credential linkage

They may not invent parallel skill taxonomies inside a product protocol.

## Contract 6A: Credential Logic Sits Above Skills And Evidence

The credential logic library may consume:

- skill definitions
- evidence semantics
- progress thresholds

It may define recognition rules on top of them.

It may not redefine what a skill or evidence signal means.

## Contract 6B: Product Workflows May Trigger Recognition, Not Define It

Product workflows may:

- emit evidence used for credential decisions
- surface eligibility checkpoints
- request review or validation

They may not define credential meaning, threshold ownership, or stackability rules locally.

## Contract 6C: Evidence And Continuity Own Cross-Context Traceability

The evidence and continuity library may own:

- evidence event transport
- continuity handoff objects
- validation-linked continuity state
- cross-context traceability

It may not redefine what evidence means pedagogically.

That remains owned by the skills layer and, where relevant, consumed by the credential layer.

## Contract 6D: DNA Registry Owns Reusable Behavior Taxonomy

The DNA registry may own:

- pedagogical DNA names
- archetype family definitions
- phase-fit tendencies
- mix-risk rules

It may not redefine phase governance or architecture law.

## Contract 6E: Design Pattern Library Owns Reusable Teaching Patterns

The design pattern library may own:

- named pedagogical patterns
- selection logic
- pattern-to-evidence directions

It may not redefine transformation workflow structure or skill meaning.

## Contract 6F: Population Routing Owns Adaptation Path, Not Success Meaning

The population routing library may own:

- routing dimensions
- adaptation overlays
- support-mode profiles

It may not redefine target skill meaning, credential thresholds, or architecture-level routing law.

## Contract 7: Evidence Must Stay Semantically Coherent

If a product protocol emits evidence, that evidence should remain compatible with skill evidence logic.

If a transformed unit promises a skill-linked output, that output should be interpretable by the skills layer.

The same evidence concept should not have different meanings across libraries.

## Contract 8: Branch Logic Stays Above Library Content

Branch structure is architecture law, not library content.

The libraries may support Course Branch and Skills Branch operations.

They do not redefine the branch model itself.

## Contract 9: Product Protocols Must Declare Dependencies Explicitly

Each protocol entry should name which libraries it depends on.

This prevents hidden architecture assumptions and helps keep product flows traceable.

## Contract 10: Local Rewording Is Not New Structure

If a product or feature document uses different wording for an existing skill, template, or evidence rule, that wording does not create a new object type.

Shared libraries remain canonical.

## Minimal Dependency Map

- skills library -> no dependency on transformation or product protocol registry
- transformation library -> depends on skills where skills are targeted or evidenced
- product protocol registry -> depends on skills and transformation when product flows consume them
- credential logic library -> depends on skills and evidence semantics, and may be referenced by product protocol flows
- evidence and continuity library -> depends on shared references from skills, credentials, and product protocols to carry traceable handoffs across them
- DNA registry -> depends on governance context for lawful use, but owns reusable behavior taxonomy below architecture
- design pattern library -> depends on skills, evidence expectations, and transformation use cases when patterns are operationalized
- population routing library -> depends on skills and support-mode contexts, but only for access-path adaptation

## Prohibited Patterns

- product protocol defines its own skill ontology
- transformation template defines its own evidence scale detached from skills
- skill library embeds UI-specific workflow stages
- product protocol becomes the place where architecture law is redefined
- product protocol becomes the place where credential thresholds are redefined
- product protocol becomes the place where continuity state is defined differently per product
- DNA registry becomes the place where phase governance is reauthored
- routing logic becomes the place where competence standards are lowered or renamed

## Final Rule

When a concept appears in more than one library, one library must own the meaning and the others must only reference or bind to it.