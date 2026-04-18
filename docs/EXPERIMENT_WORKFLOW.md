# Experiment Workflow — MilEd.One

This document defines the **safe experimentation protocol** for the MilEd.One engine.
All code experiments must follow this workflow so that `main` (production) is never at risk.

---

## Core Principles

1. **`main` is production.** No experiment ever touches it directly.
2. **Every experiment lives on its own branch** — `experiment/<topic>`.
3. **Smoke tests are the gate** — run before and after every meaningful change.
4. **Small, reversible commits** — one idea at a time, easy to undo.
5. **PR or delete** — a branch either gets a reviewed PR or is dropped. No orphans.

---

## Workflow Steps

### 1. Open an experiment branch

```bash
npm run experiment:new -- <topic>
# e.g.  npm run experiment:new -- streaming-response
```

This script:
- Creates `experiment/<topic>` off the current HEAD
- Runs `npm run smoke:contracts` as a baseline check
- Prints the reusable **Experiment Checklist** (see below)

### 2. Make changes

- Edit freely in the branch.
- Commit small logical units: `git commit -m "exp: <what I tried>"`
- Use the prefix `exp:` in commit messages to mark experimental commits.

### 3. Run smoke tests after each meaningful change

```bash
npm run smoke:contracts
```

Additional targeted smokes (optional):

```bash
npm run smoke:skills
npm run smoke:gatekeeping
```

### 4. Decision: Keep or Drop?

| Result | Action |
|--------|--------|
| Experiment works ✅ | Open a PR — title starts with `[EXPERIMENT]` |
| Experiment fails ❌ | `git checkout main && git branch -D experiment/<topic>` |
| Needs more iteration | Keep committing in the branch |

### 5. Merging a successful experiment

1. Open a PR from `experiment/<topic>` → `main`.
2. Title: `[EXPERIMENT] <topic> — <one-line result>`
3. Use the **Experiment PR Checklist** in the PR description (template below).
4. Merge only after code review approval.

---

## Reusable Experiment Checklist

Copy this into every experiment task description or PR:

```markdown
## Experiment Checklist

### Setup
- [ ] Branch created: `experiment/<topic>`
- [ ] Baseline smoke passed: `npm run smoke:contracts`

### During experiment
- [ ] Changes are limited to this branch
- [ ] Commits use `exp:` prefix
- [ ] No secrets or credentials added to code

### Validation
- [ ] Post-change smoke passed: `npm run smoke:contracts`
- [ ] Manual test (if applicable) documented below

### Decision
- [ ] Result: **KEEP** → PR opened with `[EXPERIMENT]` title
- [ ] Result: **DROP** → Branch deleted, nothing merged to main

### Notes
<!-- What did you learn? What worked / didn't work? -->
```

---

## Branch Naming Convention

| Pattern | Use |
|---------|-----|
| `experiment/<topic>` | Any exploratory code change |
| `experiment/prompt-<name>` | System prompt experiments |
| `experiment/config-<name>` | `config.json` structure experiments |
| `experiment/ux-<name>` | Frontend / HTML experiments |
| `experiment/engine-<name>` | `chat.js` / `classroom.js` logic experiments |

---

## What Is Safe to Experiment With

| Area | Safe in experiment branch? | Notes |
|------|---------------------------|-------|
| `config.json` bot entries | ✅ Yes | Add new entries freely |
| `functions/chat.js` | ✅ Yes | Keep One-Engine Principle — no per-bot logic |
| HTML pages | ✅ Yes | |
| System prompts (SP) | ✅ Yes | Must still follow 8-layer skeleton |
| Firebase schema | ⚠️ Caution | Test against dev project only |
| `functions/architect_api.js` | ✅ Yes | |
| Kernel (`kernel.txt`, kernel bindings in config) | 🔴 No | Kernel changes require architectural alignment |

---

## Quick Reference

```bash
# Start experiment
npm run experiment:new -- <topic>

# Run smoke
npm run smoke:contracts

# Discard experiment
git checkout main
git branch -D experiment/<topic>

# Push experiment for review
git push origin experiment/<topic>
# then open PR on GitHub
```
