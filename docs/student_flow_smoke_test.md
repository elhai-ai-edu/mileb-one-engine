# Student Flow Smoke Test

Local base URL: `http://localhost:8888`

## Goal

Validate the stabilized student flow end-to-end:

1. Main gateway entry
2. Moodle-style direct course entry
3. Waiting lobby to lesson transition
4. Consistent student identity across the transition

## Preconditions

1. Local dev server is running on port `8888`
2. Firebase auth is reachable
3. A valid student account exists in the authorized paths used by `auth-guard.js`
4. At least one course exists in `config.json > my_courses`

## Scenario 1: Main Gateway, Unauthenticated

URL:

`http://localhost:8888/`

Expected:

1. The gateway page loads
2. User is not dropped into a student page automatically
3. Google sign-in is offered
4. No redirect to legacy `/`

## Scenario 2: Main Gateway, Authenticated Student

URL:

`http://localhost:8888/`

Expected:

1. After sign-in, role selection is shown
2. Choosing `סטודנט` routes to `/student_dashboard.html`
3. From there, navigation to `/students.html` and `/skills.html` works
4. Student pages do not redirect to lecturer pages

## Scenario 3: Moodle-Style Direct Entry, Unauthenticated

URL pattern:

`http://localhost:8888/?courseId=<COURSE_ID>&unitId=unit_01&sessionId=test_session_01`

Expected:

1. Gateway loads with the query preserved
2. After authentication, the app fast-tracks into `/waiting_lobby.html`
3. `courseId`, `unitId`, and `sessionId` are preserved through the redirect chain

## Scenario 4: Waiting Lobby Guard

URL pattern:

`http://localhost:8888/waiting_lobby.html?courseId=<COURSE_ID>&unitId=unit_01&sessionId=test_session_01`

Expected:

1. Unauthenticated access redirects to `/index.html` with the original query string intact
2. Authenticated student stays in the waiting lobby
3. Non-student roles are not allowed to use the student waiting flow as a student page

## Scenario 5: Waiting Lobby to Lesson View

URL pattern:

`http://localhost:8888/waiting_lobby.html?courseId=<COURSE_ID>&unitId=unit_01&sessionId=<REAL_OR_TEST_SESSION>`

Expected:

1. Completing the entry tasks, or an open door signal, triggers transition to `/lesson_view.html`
2. The lesson URL contains `sessionId`, `courseId`, and `unitId`
3. Refreshing the lesson page does not lose course context

## Scenario 6: Student Identity Continuity

How to inspect:

1. Open browser devtools
2. Inspect `localStorage`
3. Compare the keys before and after moving from waiting lobby to lesson view

Expected:

1. Student identity is keyed consistently by course context
2. Transition to lesson view does not create a second identity just because `sessionId` changed or became the dominant key

Relevant keys:

1. `miled_student_id_<courseId>`
2. `miled_student_name_<courseId>`

## Scenario 7: Exit Paths

Expected:

1. Exit from student pages routes to `/index.html`
2. Exit from chat routes to `/index.html`
3. No student path still routes to legacy root `/`

## Suggested Test Course URLs

Replace `<COURSE_ID>` with a real key from `config.json > my_courses`.

1. `http://localhost:8888/?courseId=<COURSE_ID>&unitId=unit_01&sessionId=demo_session_01`
2. `http://localhost:8888/waiting_lobby.html?courseId=<COURSE_ID>&unitId=unit_01&sessionId=demo_session_01`
3. `http://localhost:8888/lesson_view.html?courseId=<COURSE_ID>&unitId=unit_01&sessionId=demo_session_01`

## Pass Criteria

The student flow is considered stable if:

1. Main entry and Moodle entry both converge correctly
2. Query context is preserved end-to-end
3. Student-only pages remain student-only
4. Lesson refresh keeps context
5. Student identity remains consistent across waiting lobby and lesson view