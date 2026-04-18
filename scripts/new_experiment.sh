#!/usr/bin/env bash
# new_experiment.sh — open a safe experiment branch and run baseline smoke tests
# Usage: bash scripts/new_experiment.sh <topic>
#   e.g. bash scripts/new_experiment.sh streaming-response

set -euo pipefail

TOPIC="${1:-}"

if [[ -z "$TOPIC" ]]; then
  echo "Usage: bash scripts/new_experiment.sh <topic>"
  echo "  e.g. bash scripts/new_experiment.sh streaming-response"
  exit 1
fi

BRANCH="experiment/${TOPIC}"

# Make sure we are not already on an experiment branch
CURRENT=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT" == experiment/* ]]; then
  echo "⚠️  You are already on an experiment branch: $CURRENT"
  echo "   Finish or drop that experiment before starting a new one."
  exit 1
fi

# Create the branch
echo ""
echo "🔬 Creating experiment branch: $BRANCH"
git checkout -b "$BRANCH"

# Run baseline smoke
echo ""
echo "🧪 Running baseline smoke tests..."
npm run smoke:contracts

echo ""
echo "✅ Baseline smoke passed."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Experiment branch ready: $BRANCH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Experiment Checklist:"
echo "  □  Baseline smoke passed (done ✅)"
echo "  □  Changes limited to this branch"
echo "  □  Commits use 'exp:' prefix"
echo "  □  No secrets or credentials added to code"
echo "  □  Post-change smoke: npm run smoke:contracts"
echo "  □  Manual test documented (if applicable)"
echo "  □  Decision: KEEP (open PR) or DROP (delete branch)"
echo ""
echo "When done:"
echo "  Keep  → git push origin $BRANCH  →  open PR with [EXPERIMENT] title"
echo "  Drop  → git checkout main && git branch -D $BRANCH"
echo ""
echo "See docs/EXPERIMENT_WORKFLOW.md for the full guide."
