# Requirements

## Objective

Correct the error that occurs when a student attempts to start or interact with a session before the teacher has started the corresponding session.

The student shall never be able to interact with a Quantum Lock that is not currently available for participation.

## Scope

The requirement applies to the student course/session flow.

The teacher controls the lifecycle of the class session.

The student interface must respect the current session state.

## Functional Requirements

### RF-001 — Validate session availability

When the student selects a course, the system shall verify whether a session is currently available for participation.

### RF-002 — Do not initialize an unavailable lock

If there is no active session for the course, the student application shall not initialize or interact with the Quantum Lock.

### RF-003 — Prevent invalid interaction

The Quantum Lock controls shall remain unavailable while the session is not active.

The student shall not be able to rotate the lock before the teacher starts the session.

### RF-004 — Inform the student

When no active session exists, the student shall see an appropriate message indicating that the session has not started.

### RF-005 — Handle early access

If the student clicks `Comenzar` before the teacher starts the session, the application shall handle the situation gracefully.

It shall not throw an unhandled Firebase error.

It shall not attempt to register attendance.

It shall not create an invalid attendance record.

### RF-006 — Revalidate before solving

The application shall verify that the session is still available before accepting a successful Quantum Lock result.

### RF-007 — Session ending

If the session becomes unavailable while the student is interacting with the Quantum Lock, the application shall prevent further participation and inform the student.

### RF-008 — No reward for unavailable session

A student shall not receive a reward or envelope for a session that is not available for participation.

### RF-009 — Preserve teacher lifecycle

The student application shall not start, activate, modify, or otherwise change the session state controlled by the teacher.

## Business Rules

1. The teacher is responsible for starting and ending the class session.
2. A student cannot start a session.
3. A student cannot interact with the Quantum Lock before the session becomes active.
4. A student cannot register attendance against an unavailable session.
5. A student cannot receive a reward from an unavailable session.
6. The client must treat session state as dynamic and potentially change between navigation and interaction.
7. A session becoming unavailable must be treated as a normal application state, not as an unexpected application crash.

## Acceptance Criteria

### Scenario 1 — Student enters before teacher starts

Given a course has no active session
When the student clicks `Comenzar`
Then the student shall not be allowed to interact with the Quantum Lock
And no attendance shall be created
And no reward shall be generated
And the application shall display an appropriate message.

### Scenario 2 — Student enters after teacher starts

Given the teacher has started a session for the course
When the student clicks `Comenzar`
Then the student shall be able to access the Quantum Lock.

### Scenario 3 — Student attempts interaction before activation

Given the session is not active
When the student attempts to rotate a Quantum Lock control
Then the control shall not modify the session state
And no attendance shall be created.

### Scenario 4 — Session becomes unavailable

Given a student is viewing an active session
When the session becomes unavailable
Then the student shall no longer be able to successfully complete the Quantum Lock
And the UI shall inform the student that the session is no longer available.

### Scenario 5 — Successful completion

Given an active session
When the student correctly solves the Quantum Lock
Then the existing attendance and reward flow shall continue unchanged.

### Scenario 6 — No unhandled Firebase error

Given a student accesses the course before the teacher starts the session
When the student loads the session view
Then the application shall not display an unhandled Firebase permission error caused by attempting to access an invalid or unavailable session state.

## Error Scenarios

### Session not found

The UI shall display that there is currently no available session.

### Session unavailable

The UI shall display that the session is not currently available.

### Session changes during interaction

The application shall stop accepting participation when the session is no longer available.

### Firestore failure

Unexpected Firestore failures shall be handled separately from the normal `session unavailable` state.

The application shall not treat every Firestore error as equivalent to an inactive session.

## Non-Functional Requirements

The solution shall not weaken Firestore security rules to solve the problem.

The solution shall not grant students permission to access or modify teacher-controlled session data.

The solution shall preserve the existing teacher session workflow.

The solution shall preserve the existing student attendance and reward workflow for valid active sessions.

## Assumptions

The existing class session status is the source of truth for determining whether students can participate.

The exact existing session status values shall be reused rather than introducing new status values unless the current model is insufficient.

The existing Firestore security model shall remain the authoritative security boundary.
