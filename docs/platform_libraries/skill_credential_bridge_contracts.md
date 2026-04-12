# Skill Credential Bridge Contracts

## Purpose

This document defines the bridge between the skills layer and the credential layer.

Its job is to explain when skill evidence, progress, and thresholds become credential-relevant structures.

It does not redefine either library.

It binds them.

## Scope Rule

This bridge document sits between:

- `skill_object_contracts.md`
- `credential_object_contracts.md`

It exists because the platform needs an explicit transition rule from demonstrated learning signals to governed recognition states.

## Bridge 1: SkillEvidence Is The Atomic Signal

`SkillEvidence` is the smallest reusable evidence object in the learning layer.

It captures a single artifact or performance trace tied to a skill judgment.

By itself, it does not imply credential readiness.

## Bridge 2: CredentialEvidenceBundle Aggregates SkillEvidence

`CredentialEvidenceBundle` is a credential-layer object.

It is formed by collecting one or more `SkillEvidence` objects that satisfy the evidence needs of a specific credential.

Minimal binding rule:

- one `CredentialEvidenceBundle` may reference many `SkillEvidence` records
- one `SkillEvidence` record may contribute to more than one bundle only if the credential rules explicitly allow reuse

## Bridge 3: StudentSkillProgress Supplies Readiness Context

`StudentSkillProgress` provides the current demonstrated level and recent evidence state for a learner.

Credential logic may consume it as readiness context.

It must not substitute for threshold checking.

Progress suggests eligibility direction.

Requirements determine actual eligibility.

## Bridge 4: SkillCredentialLink Is Advisory, Not Sufficient

`SkillCredentialLink` names a draft or stable relationship between a skill and a credential opportunity.

It should be treated as an explicit mapping aid.

It is not enough on its own to award recognition.

Credential award still requires:

- threshold evaluation
- evidence bundle coverage
- review mode handling

## Bridge 5: CourseSkill Can Generate Credential Opportunities

`CourseSkill` may indicate which course or unit contexts are expected to produce credential-relevant evidence.

That means a course context can be credential-relevant without the course itself owning the credential logic.

## Transition Rule A: From Evidence To Bundle

The system may move from `SkillEvidence` to `CredentialEvidenceBundle` when:

- the evidence maps to a target skill referenced by the credential
- the evidence type appears in the credential requirement set
- the evidence is recent enough for the credential's recency rule
- the evidence quality is sufficient for the credential's threshold logic

## Transition Rule B: From Progress To Recognition State

The system may move from `StudentSkillProgress` to a credential `recognitionState` only after credential requirements are checked.

Suggested state movement:

- `in_progress` -> evidence exists but threshold not yet met
- `evidence_ready` -> evidence bundle is complete enough for evaluation
- `review_required` -> threshold appears met but review mode is not fully automated
- `recognized` -> all threshold and review conditions are satisfied

## Transition Rule C: Quality Signals Must Keep Their Meaning

Credential logic may consume `qualitySignal` values from `SkillEvidence`.

It may not reinterpret them into different semantics.

If the skills layer says `validated`, the credential layer may use that as a threshold input.

It may not redefine `validated` to mean something else.

## Transition Rule D: Missing Skill Meaning Blocks Credential Meaning

If a credential refers to a skill that is not stable in the skills layer, the credential logic is incomplete.

Credential meaning depends on stable skill meaning upstream.

## Minimal Binding Examples

### Example 1: One Skill To One Credential

1. `Skill`: `academic_writing.paraphrase`
2. `SkillEvidence`: `paragraph_rewrite`, `source_summary`, `revision_trace`
3. `StudentSkillProgress.levelAchieved`: `3`
4. `CredentialRequirement.minimumSkillLevel`: `3`
5. Result: bundle may move to `review_required`

### Example 2: Multiple Skills To One Credential

1. credential targets `source_integration` and `critical_reading`
2. each skill has separate `SkillEvidence`
3. bridge layer groups them into one `CredentialEvidenceBundle`
4. recognition cannot be granted if one required skill remains under threshold

## Prohibited Patterns

- awarding a credential directly from `StudentSkillProgress` without evidence bundle logic
- treating one `SkillEvidence` record as credential-ready without requirement checks
- redefining skill quality signals inside credential logic
- letting a product workflow skip the bridge and write recognition states directly

## Final Statement

This bridge document makes the transition from learning evidence to recognition evidence explicit.

That is necessary if MilEd is going to keep skills and credentials conceptually separate while still allowing them to work together operationally.