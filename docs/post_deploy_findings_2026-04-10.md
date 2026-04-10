# Post-Deploy Findings — 2026-04-10

## Scope

Validation performed after deployment of the access-hardening, cockpit split, Architect routing, and Firebase Admin runtime fixes.

## Deployed Revisions

- `adc4d18` — main deployment bundle
- `2c8d5a5` — Netlify path-resolution follow-up
- `6f011ed` — Architect runtime asset loading follow-up
- `0b35918` — Architect site URL resolution from Netlify request
- `a5dd70b` — Research Lab boundary cleanup and cockpit separation hardening
- `0fd41f0` — remove leaked legacy cockpit content from public Research Lab page

## Production Outcomes

### Static Pages

Confirmed `200 OK` on `https://miled.one` for:

- `/`
- `/index.html`
- `/lecturer_hub.html`
- `/micro_cockpit.html`
- `/macro_cockpit.html`
- `/cockpit.html`
- `/architect_studio.html`
- `/unauthorized.html`

Observed cache header on checked pages:

- `Cache-Control: public,max-age=0,must-revalidate`

### Research Lab Boundary

Confirmed `200 OK` on both:

- `https://miled.one/cockpit.html`
- `https://cozy-seahorse-7c5204.netlify.app/cockpit.html`

Observed public page markers:

- Research Lab copy is present (`מעבדת מחקר וביצועים`)
- research-only explanatory copy is present
- old UI markers for `tab-btn-config` and `tab-btn-security` are absent
- leaked legacy strings are absent on both domains (`scope (תחום הרשאה)`, `createdBy`, `Stage Workflow`)

Interpretation:

- `cockpit.html` is now serving as a lecturer-facing Research Lab / performance page
- config, security, and user-management tabs are no longer exposed on the public Research Lab route
- admin/system management remains separated into `admin_cockpit.html`
- both `miled.one` and the Netlify subdomain are now serving the cleaned Research Lab page consistently

### Cockpit Leakage Audit

Checked lecturer-facing surfaces for the same legacy leakage markers:

- `micro_cockpit.html`
- `macro_cockpit.html`
- `lecturer_cockpit.html`
- `lecturer_hub.html`

Outcome:

- no matching leakage markers were found on lecturer-facing cockpit pages
- matching strings remain only inside `admin_cockpit.html`, where config/security/workflow editing is expected behavior

### Architect Flow

Confirmed `200 OK` on:

- `POST https://miled.one/api/architect/chat`

Observed response:

- valid Hebrew opening response from Architect bot
- proves prompt loading works in production
- proves OpenRouter API key is present in production runtime

### Firebase / Function Runtime

Confirmed `200 OK` on:

- `GET https://miled.one/api/lexicon/list`
- `POST https://miled.one/api/insights`
- `POST https://cozy-seahorse-7c5204.netlify.app/api/insights`

Confirmed `401` expected behavior on:

- `POST https://miled.one/.netlify/functions/auth` with probe credentials

Interpretation:

- Firebase Admin boot is working in production
- auth function is live and rejecting invalid credentials correctly
- lexicon function can read production data successfully
- insights function is live on both production domains and currently returns an empty-but-valid aggregate payload (`ok: true`, `totalStudents: 0`, `insights: []`)

### Contract Smoke

Local rerun passed:

- `PASS phase binding smoke`
- `PASS architect routing smoke`
- `PASS faculty scope smoke`
- `SMOKE CONTRACTS COMPLETE`

Command used:

- `npm run smoke:contracts`

## Flow Validation Status

### Completed via production smoke

- Architect Studio page load and backend response
- Lecturer Hub page load
- Micro Cockpit page load
- Macro Cockpit page load
- Research Lab page load
- Student Dashboard page load
- Waiting Lobby page load with query params
- Lesson View page load with query params
- Student preview routing markers present in public HTML
- Access guard markers present in public HTML
- public Research Lab route no longer exposes old config/security tab markers
- public Research Lab route no longer exposes leaked legacy config/workflow strings on either production domain

### Completed via manual browser QA

- main sign-in entry works correctly
- lecturer can enter student view successfully
- lecturer can return from student preview back to lecturer surfaces successfully
- no issue observed in the manual auth handoff path

### Not fully completed yet

- real waiting-lobby to lesson transition using a live classroom session

## Current Risk Level

Low for deployment integrity.

Remaining risk is now concentrated in live classroom-session QA, not in login/auth handoff, public asset delivery, or public function availability.

## Recommended Next Steps

1. Manual live-session check from waiting lobby into lesson view
2. Optional screenshot capture of the validated public routes for audit trail
3. Optional documentation alignment in older audit/debt files