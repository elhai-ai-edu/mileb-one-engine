# Role Home Navigation Audit

## Purpose

This document captures the current role-home navigation contract and page-guard behavior after cockpit auth-flow stabilization.

## Canonical Role Homes

Source: auth guard role-home mapping.

- student -> /index.html
- lecturer -> /lecturer_hub.html
- institution_admin -> /institution_dashboard.html
- system_admin -> /admin_cockpit.html

## Guarded Lecturer Surfaces

The following pages require lecturer-level access and now use role-home fallback redirects:

- /micro_cockpit.html
- /lecturer_cockpit.html
- /smart_class.html

Behavior:

- If user is authenticated and authorized with one of: lecturer, institution_admin, system_admin: allow.
- If user role mismatches the page policy: redirect to the user's canonical role home (fallback /index.html).
- If user is unauthenticated or unauthorized: redirect to fallback.

## Lesson Space Access

- /lesson_view.html allows: student, lecturer, institution_admin, system_admin.
- Lecturer preview-as-student remains supported through preview role mechanism.
- Exiting preview returns to canonical role home.

## Recent Stabilization Applied

- Replaced hardcoded redirect /index.html in lecturer cockpit surfaces with role-home fallback based on session role.
- This avoids sending privileged users to a generic landing page when role mismatch is detected.

## Open Follow-Ups

1. Decide whether student home should remain /index.html or move to /student_dashboard.html as canonical home.
2. Add an explicit smoke check for role-home redirect correctness across guarded lecturer pages.
3. Verify that all faculty-facing pages consistently use auth guard before runtime API calls.

## Status

- cockpit auth flows: stabilized
- role-home navigation: audited (baseline)
- role-home navigation smoke automation: pending
