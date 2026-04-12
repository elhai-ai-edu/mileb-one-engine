# Credential Logic Library

## Purpose

This document is the first Wave 2 draft of a shared credential logic library for MilEd.One.

Its job is to define reusable structures for:

- credential units
- evidence thresholds
- skill-to-credential mapping
- stackability logic
- recognition states

This is not institutional policy by itself.

It is the normalization layer that lets MilEd represent how demonstrated learning may become recognized learning.

## Source Lineage

Primary sources used in this first draft:

- `docs/ARCHITECTURE_CANON_AND_SHARED_LIBRARIES.md`
- `docs/platform_libraries/skill_ontology_and_diagnosis_library.md`
- `docs/platform_libraries/skill_object_contracts.md`
- `docs/platform_libraries/product_protocol_registry.md`

Additional source cues used in this draft:

- gatekeeper / approval-flow materials in the raw docs corpus
- prior architecture decisions about evidence-based confirmation and non-architecture ownership of credentials

## Core Design Claim

MilEd should not treat credentials as labels attached manually at the end of a learning flow.

Credentials should be modeled as governed recognition states that sit on top of:

1. defined skills
2. required evidence
3. threshold rules
4. review or validation state
5. stackability pathways

This keeps credentialing tied to demonstrated learning rather than to loose naming or completion alone.

## What This Library Owns

This library owns:

- what a credential unit is
- how a credential links to skills and evidence
- what recognition states exist
- how stackable credentials relate to one another
- what minimum threshold logic should be visible

This library does not own:

- the meaning of a skill
- the meaning of evidence quality signals
- the runtime sequence of a product workflow
- final institutional approval policy

## Credential Units

A credential unit is the smallest named recognition object that MilEd may award, unlock, or mark as achieved.

Examples of likely unit scales:

- micro-credential
- module credential
- pathway credential
- course-linked recognition

The unit should always name:

- target capability or bundle
- expected evidence
- minimum threshold
- review state
- whether it stacks into a larger recognition path

## Recognition States

Credential logic should make recognition state explicit.

Initial draft states:

- `not_eligible`
- `in_progress`
- `evidence_ready`
- `review_required`
- `recognized`
- `expired_or_superseded`

This prevents the system from collapsing all credential language into a simple yes / no outcome.

## Evidence Threshold Logic

Credential decisions should not depend on a single artifact name.

They should expose threshold logic through combinations such as:

- required evidence types
- minimum quality signals
- minimum demonstrated level
- evidence recency
- optional reviewer validation

Example threshold patterns:

- one strong artifact plus revision trace
- multiple partial artifacts across time
- validated performance in live lesson context
- gated approval after quality review

## Skill-To-Credential Mapping

Credentials may map to:

- one core skill
- a bundle of related skills
- a pathway stage
- a transferable capability cluster

The mapping should remain explicit.

If a credential references a skill bundle, the component skills should still be visible.

## Stackability Logic

MilEd should support the idea that smaller recognitions may accumulate into larger ones.

Initial stackability relationships:

- micro-credential -> module credential
- module credential -> pathway credential
- pathway credential -> course-linked recognition

Stackability should not mean automatic promotion.

Each upward step may carry additional threshold or review conditions.

## Credential Pathway Logic

Credentials can also function as wayfinding signals.

They may show:

- what a learner has demonstrated
- what remains missing
- what next evidence is required
- what larger pathway becomes available next

This makes credentials useful during learning, not only after learning.

## Review And Validation Modes

The current architecture implies at least three review modes:

- automated threshold pass
- lecturer review required
- hybrid validation

This matters because MilEd sometimes operates near institutional boundaries where automated evidence may be operationally helpful but not sufficient alone.

## Relationship To Product Protocols

Product protocols may emit evidence and may expose recognition checkpoints.

They should not define credential meaning locally.

Instead, they should reference:

- credential units
- threshold rules
- review modes
- stackability paths

## Relationship To Skills Library

The skills library remains the canonical owner of skill meaning and evidence semantics.

The credential layer consumes those structures and adds recognition logic on top of them.

## Minimal Object Directions

This first library draft implies several object directions worth formalizing later:

- `CredentialUnit`
- `CredentialRequirement`
- `CredentialEvidenceBundle`
- `CredentialPathway`
- `CredentialAwardState`

These are not fully formalized here yet.

They define the likely object boundary for the next companion contracts file.

## Example Recognition Recipe

Illustrative recognition recipe:

1. learner demonstrates `academic_writing.paraphrase`
2. evidence includes `paragraph_rewrite`, `source_summary`, and `revision_trace`
3. minimum skill level reached = 3
4. quality signal includes at least one `validated`
5. review mode = `hybrid`
6. result = eligible for `cred_academic_writing_foundations`

This recipe is not a final policy.

It is the kind of reusable rule shape the platform should be able to represent.

## Risks And Failure Modes

- credentials become completion badges with no evidence depth
- products invent local credential meanings
- skill bundles become opaque and untraceable
- recognition is granted without visible threshold logic
- automation crosses institutional authority boundaries without review safeguards

## Final Statement

This library gives MilEd a place to model recognition as a governed layer above skills and evidence.

That is necessary if the platform is going to support stackable learning outputs without pushing credential logic into architecture law or scattering it across product-specific documents.