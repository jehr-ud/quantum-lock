# Quantum Lock — Agent Instructions

## Project

Quantum Lock is an educational gamification application used to register student participation through interactive Quantum Lock sessions.

The application has two primary roles:

- TEACHER
- STUDENT

The application is an operational MVP. Changes must preserve existing functionality.

## Mandatory Rules

### 1. Read the specification first

Before implementing any requested change:

1. Identify the applicable requirement specification under `specs/`.
2. Read the complete requirement.
3. Identify functional requirements, business rules, acceptance criteria, and error scenarios.
4. Inspect the existing implementation before modifying it.

Do not implement functionality based only on a short user prompt when a specification exists.

### 2. Do not invent requirements

Do not introduce new business rules, roles, session states, collections, fields, APIs, backend services, or authentication mechanisms unless required by the specification or necessary to preserve the existing architecture.

If the existing model is insufficient, stop and report the ambiguity before making a structural change.

### 3. Preserve the existing architecture

The application currently uses Angular and Firebase.

Prefer existing project patterns over introducing new architectural patterns.

Do not introduce a backend server for functionality that can be implemented using the existing Firebase architecture.

## Domain Rules

### Users

The application has two main roles:

- `TEACHER`
- `STUDENT`

Teacher-only functionality must remain protected.

The `/dev` route is teacher-only.

Do not bypass or weaken role protection.

### Courses

Courses belong to the existing course model.

Course-specific student functionality must use the course identifier.

Do not mix data from different courses.

### Class Sessions

The teacher controls the lifecycle of a class session.

Students must never be able to start, modify, or terminate a class session.

Student participation is only valid when the corresponding session is available according to the existing session state model.

Do not weaken Firestore rules to solve client-side session-state problems.

### Attendance

Attendance is associated with session, course, and student.

Multiple attempts must not create multiple attendance records.

A failed Quantum Lock attempt still represents participation.

### Rewards

The seasonal collection currently contains 50 reward cards.

Duplicate rewards are valid.

If a student receives the same card multiple times, the album must preserve and display the quantity.

Collection progress counts unique cards.

Total obtained rewards includes duplicates.

### Envelope

A student receives access to the envelope only after successfully completing the Quantum Lock according to the existing reward flow.

Opening the envelope must not be confused with merely registering attendance.

For reporting purposes, the existing reward/envelope state must be used to determine whether the envelope was successfully opened.

## Critical Session Rule

The student application must be robust when the student enters a course before the teacher starts the session.

This is a normal application state and must not produce an unhandled Firebase error.

The student must not:

- initialize an unavailable Quantum Lock
- rotate the lock
- register attendance
- receive a reward
- change the session state

when no valid active session exists.

The client must revalidate the session state before accepting successful completion.

Do not solve this problem by making Firestore permissions more permissive.

## Teacher Regression Protection

Changes to student functionality must not break:

- teacher dashboard
- teacher course list
- teacher session creation
- teacher session controls
- teacher Quantum Lock visualization
- teacher-only `/dev`

Changes to shared components must preserve their existing behavior for Teacher.

If a shared component needs a new optional capability, make the capability optional rather than changing existing required behavior.

## Student Regression Protection

Changes must preserve:

- student login
- student dashboard
- course selection
- student session
- Quantum Lock interaction
- attendance registration
- failed attempts
- reward assignment
- envelope flow
- course-specific album
- duplicate card quantities

## Firestore

Firestore is the source of truth for persistent application data.

Do not add client-side workarounds that create inconsistent state.

Do not disable Firestore security rules.

Do not use unrestricted `allow read, write: if request.auth != null` as a solution to application errors.

When a query requires an index, report the required index rather than replacing the query with an incorrect data access pattern.

## Authentication

Firebase Authentication is the source of truth for authentication.

Never store passwords in Firestore.

Password recovery must use Firebase Authentication's password reset mechanism.

Do not implement custom password reset tokens.

## Excel Export

Attendance exports must be generated from existing Firestore data.

The export must be scoped to the selected course.

At minimum the report contains:

- Fecha
- Estudiante
- Correo
- Abrió sobre

A student must not appear multiple times for multiple attempts in the same session.

## Coding Guidelines

Prefer existing services, models, enums, constants, shared components, and existing Angular patterns.

Avoid unnecessary refactoring.

Do not rename existing public APIs unless required.

Do not duplicate business logic across components.

Business logic involving Firestore should preferably remain in services rather than being duplicated in page components.

## Error Handling

Differentiate between:

1. Normal application states
2. Validation errors
3. Firebase permission errors
4. Network errors
5. Unexpected programming errors

Do not catch all Firebase errors and interpret them as "no session".

Unexpected errors must remain visible in development logs.

User-facing messages should be clear and appropriate.

## Testing

After implementation:

1. Run the project's existing tests if available.
2. Run the production build.
3. Verify TypeScript compilation.
4. Verify affected routes.
5. Verify Teacher and Student flows.

At minimum, verify:

### Teacher

- Login
- Dashboard
- Course list
- Session creation
- Session controls
- Connected student count
- Attendance export

### Student

- Login
- Dashboard
- Course selection
- Enter course before session starts
- Enter course after session starts
- Quantum Lock interaction
- Successful completion
- Failed attempt
- Envelope
- Album
- Duplicate rewards
- Password recovery

## Implementation Process

### Phase 1 — Understand

Read the relevant specification and inspect the current implementation.

### Phase 2 — Analyze

Identify affected components, services, models, Firestore queries, routes, shared components, and regression risks.

### Phase 3 — Implement

Implement the smallest change that satisfies the specification.

Do not perform unrelated refactoring.

### Phase 4 — Validate

Run tests, production build, and relevant checks.

### Phase 5 — Report

Report:

- files changed
- functionality implemented
- tests/build executed
- remaining issues
- Firestore indexes or configuration changes required

Do not claim a requirement is complete if acceptance criteria have not been verified.

## Important

This is an existing production MVP.

Prefer a small, safe change over a large refactor.

Do not rewrite working functionality merely to introduce a preferred architecture.

Do not modify unrelated Teacher functionality while implementing Student requirements.

Do not weaken security rules to make functionality work.


Logout

Both TEACHER and STUDENT authenticated interfaces must provide a logout action.

Logout must:

use the existing Firebase Authentication signOut mechanism
update the existing authentication state
redirect the user to the login route after successful logout
preserve all Firestore application data
preserve route protection
prevent authenticated access after logout

Do not:

implement custom logout tokens
delete Firestore user/application data during logout
weaken route guards
weaken Firebase Security Rules
create a second authentication service
duplicate authentication state management

Prefer implementing logout in an existing shared authenticated layout/navigation component when the current architecture supports it.

If Teacher and Student use different layouts, reuse the same authentication service and logout behavior in both.

Authentication Regression Protection

Changes to authentication must preserve:

login
role detection
Teacher authorization
Student authorization
protected routes
authentication state listeners
password recovery
logout