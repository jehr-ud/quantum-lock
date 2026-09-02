# Requirements

## Objective

Allow the teacher to view how many students have registered their participation in the current class session.

## Scope

The functionality applies exclusively to the teacher session view.

The count represents students who have registered attendance for the current session.

No separate real-time browser presence, heartbeat, or network connectivity detection is required.

## Functional Requirements

### RF-001 — Count session participants

The system shall calculate the number of distinct students who have registered attendance for the current class session.

### RF-002 — Display connected students

The teacher session view shall display the number of students who have registered attendance for the current session.

### RF-003 — Avoid duplicate counting

A student shall be counted only once for a given session, even if the attendance record contains multiple failed attempts.

### RF-004 — Current session only

The displayed count shall correspond exclusively to the currently displayed class session.

Attendance records from other sessions or courses shall not be included.

### RF-005 — Empty state

If no student has registered attendance, the teacher view shall display zero students.

## Business Rules

1. A student is considered connected/participating when an attendance record exists for the current session.
2. Multiple attempts by the same student must not increase the number of connected students.
3. A failed Quantum Lock attempt still represents participation and therefore counts as attendance.
4. A student who has not generated an attendance record must not be counted.

## Acceptance Criteria

### Scenario 1 — No students

Given an active session with no attendance records
When the teacher views the session
Then the connected student count shall be `0`.

### Scenario 2 — One student

Given an active session with one attendance record
When the teacher views the session
Then the connected student count shall be `1`.

### Scenario 3 — Multiple attempts

Given a student with an attendance record containing multiple attempts
When the teacher views the session
Then that student shall be counted only once.

### Scenario 4 — Failed attempt

Given a student registers attendance and fails the Quantum Lock
When the teacher views the session
Then the student shall be included in the connected student count.

## Error Scenarios

If attendance data cannot be retrieved, the system shall not display an incorrect count. The UI shall show an appropriate error state and log the retrieval error.

## Assumptions

The existing attendance record identified by session and student is the source of truth for participation.

No separate presence collection is required.

## Non-Functional Requirements

The implementation shall preserve the existing Teacher session functionality.

The implementation shall not introduce a second attendance mechanism.

The main component to change is src/app/features/teacher/pages/session/session.html
