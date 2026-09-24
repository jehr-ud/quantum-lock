# RQ10 — Manual reward assignment (sobre manual)

## 1. Objective

Allow a **Teacher** to manually assign a reward envelope to a **Student** in a selected course, without requiring the Student to participate in a class session.

Business scenario: a Student did not attend a session but completed an alternative activity; the Teacher awards them an envelope (and therefore a reward card) manually.

The manually assigned envelope must behave like the existing reward flow so that:

- The card appears in the Student's album.
- Duplicate cards are counted individually.
- The Excel export (`RQ05`) and the Student PDF report (`RQ08`) include the assignment consistently.

---

## 2. Confirmed Decisions

### Delivery model

The envelope is awarded **directly and counted immediately**:

- `solved: true`
- `rewardClaimed: true`
- `rewardId`: a randomly selected card from the existing reward cards (`selectRandomReward`).

The Student does **not** need to open the envelope afterwards; the card is immediately part of their collection.

### Card selection

The reward card is selected **randomly** using the existing reward selection logic. Duplicates are valid, consistent with existing reward rules.

### Report state

In the Student PDF report (`RQ08`), a manually assigned envelope appears with state `Resolvió` (no new state value, no change to `StudentReportRow`).

### Student selector

The Teacher selects the Student from the list of **all users with role `STUDENT`**, searchable by name and email. There is no enrollment relationship in the current model.

### Attendance date

The Teacher indicates the **date on which the Student attended** (or completed the alternative activity) when assigning the envelope. This date is persisted in `registeredAt` so the attendance is restored on the correct date (defaults to today; future dates are not allowed). For session-based attendance, `registeredAt` remains the server timestamp.

---

## 3. Actors

### Teacher

An authenticated user with role `TEACHER` can assign an envelope to a Student in a selected course.

### Student

Receives the manually assigned reward card. The assignment appears in their album and reports for the selected course.

---

## 4. Functional Requirements

### RF-001 — Manual assignment action

The system shall provide a visible action in the Teacher interface allowing the Teacher to assign a reward envelope to a Student for a selected course.

### RF-002 — Course isolation

The manually assigned envelope must be associated with the selected course only.

### RF-003 — Student selection

The system shall let the Teacher select any Student with role `STUDENT`, searchable by name or email.

### RF-004 — Random reward

The system shall assign a randomly selected reward card using the existing reward selection logic.

### RF-005 — Immediate counting

The assigned envelope must be counted immediately as an obtained card (`rewardClaimed: true`) without requiring the Student to open it.

### RF-006 — Duplicates

Duplicate reward cards are valid. If the Student already owns the same card, the quantity in the album increases by one.

### RF-007 — Persistence

The assignment must be persisted in the existing `attendances` collection as the source of truth, scoped to course and student.

### RF-008 — Reports consistency

The assignment must appear in:

- The Student album (quantity, duplicates).
- The Excel export (`RQ05`) attendance sheet (`Abrió sobre = Sí`) and the consolidated per-student sheet (increments `Cantidad de sobres`).
- The Student PDF report (`RQ08`) as a date row with state `Resolvió` and one card.

### RF-009 — Teacher-only

Only an authenticated `TEACHER` can assign a manual envelope. A Student must never be able to create, modify, or assign manual envelopes, including to themselves.

### RF-010 — No session required

Manual assignment must not require or create a `class-sessions` document. It must not be tied to a session possession.

---

## 5. Data Model

No new collection is created. The assignment is stored in `attendances`.

### Document id

`${sessionId}_${studentUid}` where `sessionId` is a generated synthetic id (e.g. `manual_<generated-id>`), preserving the existing composite id convention and uniqueness.

### Fields

| Field | Value | Description |
|---|---|---|
| `id` | `${sessionId}_${studentUid}` | Existing composite id |
| `sessionId` | `manual_<generated-id>` | Synthetic session id; no `class-sessions` document is created |
| `courseId` | string | Selected course |
| `studentUid` | string | Recipient student |
| `teacherUid` | string | Teacher who assigned the envelope |
| `registeredAt` | Timestamp | Date of attendance indicated by the Teacher (converted to a Firestore Timestamp); defaults to today, future dates not allowed |
| `attempts` | `0` | No Quantum Lock attempts |
| `solved` | `true` | Envelope awarded as solved |
| `rewardClaimed` | `true` | Envelope counted immediately |
| `rewardId` | string | Randomly selected reward card id |
| `manual` | `true` (optional marker) | Distinguishes manual assignment from session attendance |

The `manual` marker is used to enforce security rules (Teacher-only creation) and, if needed later, to filter reports without weakening rules.

---

## 6. User Flow

```text
Teacher authenticated
        ↓
Teacher dashboard → select course
        ↓
Choose "Asignar sobre"
        ↓
Indicate the attendance date (defaults to today)
        ↓
Search and select a Student (role STUDENT)
        ↓
Confirm assignment
        ↓
AttendanceService assigns random reward
(attendances doc: solved=true, rewardClaimed=true, manual=true,
 registeredAt = attendance date)
        ↓
Success/error feedback in UI
        ↓
Student sees the card in album and reports
```

---

## 7. Business Rules

### BR-001

Only a Teacher can assign a manual envelope.

### BR-002

The assignment belongs to a single course and is only visible/ counted in that course.

### BR-003

The assigned card is random and duplicates are valid; every assignment increments the obtained card quantity.

### BR-004

The reward/envelope state (`rewardClaimed`) is the single source of truth for reports, consistent with existing rules.

### BR-005

Manual assignment does not create, start, or modify any class session and does not change the session state model.

### BR-006

Multiple assignments to the same Student in the same course are allowed (one attendance document per assignment).

### BR-007

The assignment must not weaken Firestore security rules or role protection.

---

## 8. Error Scenarios

### Scenario 1 — Selection invalid

If no course or no Student is selected, the assignment shall not proceed and an appropriate message is shown.

### Scenario 2 — Firestore permission error

If the Teacher lacks write permission for `attendances`, the operation fails gracefully with an appropriate user-facing error; the error must remain visible in development logs.

### Scenario 3 — Reward selection failure

If a reward cannot be resolved, the assignment shall not create a partial document.

### Scenario 4 — Unexpected error

Unexpected errors must not be silently caught and interpreted as a success; they must be logged and shown.

---

## 9. Acceptance Criteria

### AC-001 — Teacher assigns a manifold envelope

Given a Teacher selects a course and a Student
When the Teacher confirms the assignment
Then an `attendances` document is created for that course and student with `solved`, `rewardClaimed`, `rewardId`, and `manual` set, and the Teacher receives success feedback.

### AC-002 — Card appears in album

Given a Student received a manual envelope
When the Student opens their album for the course
Then the assigned card appears with quantity increased, counting duplicates.

### AC-003 — Excel consistency

Given a course contains a manual assignment
When the Teacher exports the course attendance
Then the Student appears in the attendance sheet with `Abrió sobre = Sí` and the consolidated per-student sheet increments `Cantidad de sobres`.

### AC-004 — PDF consistency

Given a Student received a manual envelope
When the Student downloads their per-course PDF report
Then a date row appears with state `Resolvió` and one card, and the total reflects the assignment (duplicates counted).

### AC-005 — Course isolation

Given a Student received manual envelopes in course A
When reports and album for course B are generated
Then course A assignments must not appear in course B data.

### AC-006 — Student cannot self-assign

Given no Teacher action
When a Student attempts to create a manual assignment
Then Firestore rules deny the write (or no UI exposes the action) and no document is created.

### AC-007 — No session side effects

Given a Teacher assigns a manual envelope
Then no `class-sessions` document is created, modified, or terminated, and the Teacher's session controls remain unaffected.

---

## 10. Technical Constraints

- Reuse the existing `AttendanceService`, `Collections.ATTENDANCES`, reward cards (`REWARD_CARDS`), and reward selection logic.
- Reuse the existing Teacher dashboard patterns and shared components where possible.
- Do not introduce a backend server.
- Do not create new firestore collections.
- Do not weaken Firestore security rules. The required access rule for manual assignments must be explicit (Teacher-only).
- Do not modify Student session flow or envelope flow (assignment is immediately counted).
- Preserve Teacher regression protection: dashboard, course list, session creation/controls, connected students, attendance export.

---

## 11. Firestore Security Rules Requirement

Current repository does not version `firestore.rules` (managed in the Firebase console).

Required access rule (to be configured in the console and, when versioned, committed):

- Only an authenticated user whose role is `TEACHER` may create documents in `attendances` with `manual == true`.
- The created `manual` document must not set `studentUid == request.auth.uid` (a Teacher must not assign to themselves) and must set the Teacher as `teacherUid`.
- Students must never create or modify documents with `manual == true`.

This rule must be added without making the general `attendances` collection use `allow read, write: if request.auth != null`.

---

## 12. Implementation Reference

- Service: `src/app/core/services/attendance.service.ts` (new `assignManualReward` + student list query).
- Reward selection: reuse `selectRandomReward`.
- Teacher UI: `src/app/features/teacher/pages/dashboard/dashboard.ts` and `dashboard.html` + a new shared dialog component for student search/selection.
- Data model doc: `docs/MANUAL_TECNICO.md` (`attendances` section).
- Tests: `src/app/core/utils/domain.spec.ts` if any pure logic is added; manual assignment flow tests as applicable.

---

## 13. Testing

### Teacher

- Login, dashboard, course list.
- Assign a manual envelope to a Student.
- Verify duplicates increment quantity.
- Export Excel (`RQ05`) and verify `Abrió sobre` and consolidated quantities.
- Verify Teacher session creation and controls still work.

### Student

- Album shows the manually assigned card with duplicated quantities.
- Per-course PDF report shows the assignment.
- Course isolation.

### Security

- Verify a Student cannot create a `manual` attendance document (rules deny).

### Build

- Run the project's existing tests.
- Run the production build.
- Verify TypeScript compilation.

---

## 14. Definition of Done

RQ10 is complete only when:

- The Teacher can assign a random reward envelope to a Student in a selected course.
- The assignment is persisted in `attendances` with `manual` marker and counted immediately (`rewardClaimed: true`).
- Duplicates are handled correctly.
- Excel export and Student PDF report reflect the assignment consistently.
- No session is created/affected.
- Firestore rules explicitly restrict `manual` writes to Teachers.
- No Student self-assignment is possible.
- Existing Teacher and Student functionality is preserved.
- Tests/build pass.