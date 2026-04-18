# MILAD Experiment Agent (Reusable Spec)

This document is the maintainable source-of-truth for the MILAD experiment agent behavior used with GitHub Copilot.

## Purpose
Create a reusable, safety-first execution mode for isolated experiments in the MilEd codebase, without unintended production impact.

## Repository Files
- `.github/prompts/milad-experiment-agent.prompt.md`  
  Reusable prompt that defines identity, goals, hard constraints, workflow, and output format.
- `.github/chatmodes/milad-experiment.chatmode.md`  
  Optional chatmode scaffold for one-click invocation in clients that support chatmodes.
- `docs/agents/MILAD_EXPERIMENT_AGENT.md`  
  Human-maintained long-form documentation for future adjustments.
- `docs/agents/README.md`  
  Practical usage instructions for maintainers.

## Why this structure
1. **Prompt file is explicit and portable** — easy to paste/use in Copilot Chat contexts.
2. **Chatmode is optional** — gives convenience where supported without hard dependency.
3. **Docs are separate from execution artifacts** — maintainers can update policy safely.

## Maintenance guidance
- Update safety rules in the prompt first, then sync this doc.
- Keep workflow order stable to preserve predictable behavior.
- Prefer additive rule updates over replacing the whole prompt.
