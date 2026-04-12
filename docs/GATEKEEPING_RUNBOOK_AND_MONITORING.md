# Gatekeeping Runbook and Monitoring

## Purpose
Operational guide for Gatekeeping flow: submit, evaluate, queue, audit, and recovery.

## Runtime Endpoints
- Submit: POST /.netlify/functions/gatekeeping action=submit
- Evaluate: POST /.netlify/functions/gatekeeping action=evaluate
- Status: GET /.netlify/functions/gatekeeping
- Queue: GET /.netlify/functions/gatekeeping action=queue_by_course
- Audit: GET /.netlify/functions/gatekeeping action=audit_by_course

## Security Controls
- Evaluate requires Firebase Authorization Bearer token by default.
- Token actor id must match actorId in request when provided.
- Allowed roles: lecturer, institution_admin, system_admin.
- Legacy metadata-only actor path is disabled by default and can be enabled only with GATEKEEPING_ALLOW_LEGACY_ACTOR=true.
- Webhook evaluate requires optional shared secret via GATEKEEPING_WEBHOOK_SECRET.

## Rate Limit Controls
- Evaluate limiter:
  - GATEKEEPING_EVALUATE_RATE_LIMIT default: 50
  - GATEKEEPING_EVALUATE_RATE_WINDOW_MS default: 60000
- Webhook limiter:
  - GATEKEEPING_WEBHOOK_RATE_LIMIT default: 60
  - GATEKEEPING_WEBHOOK_RATE_WINDOW_MS default: 60000

## Operator Playbook
1. Queue triage:
- Open Micro Cockpit Gatekeeping Queue.
- Filter by stage, status, date range, and free search.
- Use sort and pagination to handle large classes.

2. Individual evaluation:
- Review item details.
- Apply approve, reject, or review_required.
- Add feedback if revision guidance is needed.

3. Bulk evaluation:
- Select items and run bulk action.
- Track live progress indicator.
- Use Stop Bulk if suspicious behavior appears.
- Use Retry Failed for transient API failures.

4. Audit and export:
- Use Export Audit CSV from cockpit for compliance and QA.
- Backend supports JSON and CSV audit reads with filters.

## Incident Recovery
1. Evaluate 403 spikes:
- Verify Firebase auth status in browser.
- Confirm bearer token exists and is not expired.
- Confirm mapped user role in users/{uid}.

2. Evaluate 429 spikes:
- Inspect system/runtime/rate_limits/gatekeeping.
- Confirm no runaway bulk loop.
- Temporarily adjust limit env vars if justified.

3. Queue missing records:
- Verify sessions/{studentId}/{courseId}/gatekeeping exists.
- Verify filter values are not over-restrictive.

## Monitoring Metrics
- gatekeeping_evaluate_requests_total
- gatekeeping_evaluate_success_total
- gatekeeping_evaluate_forbidden_total
- gatekeeping_evaluate_rate_limited_total
- gatekeeping_bulk_failure_total
- gatekeeping_queue_total_items
- gatekeeping_queue_pending_review_items
- gatekeeping_audit_export_total
- gatekeeping_evaluate_latency_ms_p50
- gatekeeping_evaluate_latency_ms_p95

## Suggested Alerts
- High 403 ratio: forbidden_total / requests_total > 0.2 for 5m
- High 429 ratio: rate_limited_total / requests_total > 0.1 for 5m
- Bulk failure burst: bulk_failure_total increase > 20 in 10m
- Queue backlog: pending_review_items > threshold per class for 30m
- Latency degradation: p95 > 1500ms for 10m

## Validation Commands
- npm run smoke:gatekeeping
- npm run test:gatekeeping:auth-negative
- npm run test:gatekeeping:integration

## Notes
- Integration script expects a valid bearer token and actor uid in env.
- Negative auth script verifies no-token evaluate denial and webhook secret behavior.
