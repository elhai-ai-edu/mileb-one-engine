# Platform Libraries

## Purpose

This folder holds first-class shared platform libraries.

These documents are not core architecture law.

They sit between architecture and local product or bot knowledge.

Their purpose is to normalize reusable knowledge so multiple branches, products, and runtimes can draw from the same structures.

## Current Wave 1 Targets

- `skill_ontology_and_diagnosis_library.md`
- `transformation_template_library.md`
- `product_protocol_registry.md`

## Current Wave 2 Targets

- `credential_logic_library.md`
- `evidence_and_continuity_object_library.md`

## Cycle 2 Secondary Libraries

- `bot_archetype_and_dna_registry.md`
- `active_learning_and_skills_oriented_design_pattern_library.md`
- `population_routing_and_adaptation_library.md`

## Cycle 2 Companion Contracts

- `bot_archetype_and_dna_object_contracts.md`
- `active_learning_and_skills_oriented_design_pattern_object_contracts.md`
- `population_routing_and_adaptation_object_contracts.md`

## Companion Contracts

- `skill_object_contracts.md`
- `transformation_object_contracts.md`
- `inter_library_contracts.md`
- `product_protocol_object_contracts.md`
- `credential_object_contracts.md`
- `skill_credential_bridge_contracts.md`
- `external_gatekeeper_object_contracts.md`
- `evidence_and_continuity_object_contracts.md`

## Usage Rule

Each library document should prefer:

- definitions
- reusable object shapes
- mappings
- selection logic
- evidence models

Each library document should avoid becoming:

- a broad essay
- a raw note dump
- a product-specific UI spec
- a replacement for source rationale documents

## Source Discipline

Every library draft should preserve source lineage.

Source docs remain the history and rationale.

Library docs hold the extracted reusable structure.