# Agents Documentation

## MILAD Experiment Agent — How to use

### Option A (recommended): Prompt file
In GitHub Copilot Chat, open and use:
- `.github/prompts/milad-experiment-agent.prompt.md`

Then provide your experiment goal (for example: “Create an isolated demo variant for X page behavior”).

### Option B: Chatmode (if your Copilot client supports it)
Select:
- `.github/chatmodes/milad-experiment.chatmode.md`

Then give your experiment goal. The mode is configured to follow the fixed MILAD workflow.

## Expected behavior every run
The agent should always:
1. Restate the goal in one sentence
2. Map scope and dependencies
3. Classify risk
4. Propose minimal safe plan
5. Implement isolated change
6. Summarize changed files
7. Provide validation checklist and local run steps
8. Produce final structured report

## Safety note
This framework is designed to protect production behavior by default and encourage isolated, reviewable experiments.
