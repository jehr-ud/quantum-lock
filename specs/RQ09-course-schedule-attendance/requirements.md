# RQ09 — Seeded Course Schedule and Attendance on Attempt

## Objective

Implement course schedules using the existing seeders and use those schedules for the attendance (asistencia) registration flow.

The Teacher must NOT configure course schedules through the application.

Attendance is registered in two places:

1. **Automatically** when the Student clicks `Comenzar`, provided that:
   1. The Student is authenticated.
   2. The Student has access to the selected course.
   3. The Teacher session is active.

2. **From the album attendance button (repuesto)**, per course, which appears when:
   1. The current Colombia date/time is inside the scheduled time range of the course, AND
   2. There is no active Teacher session for the course (the session already closed).

The **course schedule is no longer a requirement to start the reto** (`Comenzar`). This avoids blocking students who begin the challenge outside the scheduled window. The schedule restriction applies to the album attendance button instead.

Successful Quantum Lock completion is a separate event.

Opening the reward envelope must only occur after successful Quantum Lock completion.

---

## Confirmed Decisions

### Course access

Any authenticated Student can access any course visible in the application. There is no enrollment relationship. The condition "the Student has access to the selected course" is satisfied by authentication alone.

### Schedule data model

Each seeded course defines a weekly recurring schedule: the days of the week and the hours during which the course is taught. A course without a defined schedule imposes no restriction.

```ts
export interface CourseScheduleSlot {
  day: number;   // 0 = Domingo, 1 = Lunes ... 6 = Sábado
  start: string; // 'HH:mm' (hora de Colombia)
  end: string;   // 'HH:mm' (hora de Colombia)
}

export interface Course {
  id: string;
  code: string;
  name: string;
  schedule?: CourseScheduleSlot[];
}
```

A Student is inside the schedule when, for at least one slot of the course: `day` equals the current day in Colombia AND the current time in Colombia satisfies `start <= time < end`.

### Colombia time

The reference clock is the Colombia timezone (`America/Bogota`, UTC−5, no daylight saving).

### Seeding

Course schedules are defined only in the seed data. The seeder writes the schedule for new courses and, for existing courses that lack a schedule, merges the schedule without modifying the rest of the document. The Teacher has no UI to configure schedules.

### Attendance document

Attendance is stored in the existing `attendances` collection with the existing composite document id `${sessionId}_${studentUid}`.

When the Student clicks `Comenzar` on an eligible course, the application creates the attendance document with `solved: false`, `attempts: 0` and `rewardClaimed: false` before the Quantum Lock becomes interactive. The schedule is **not** validated at this point.

If the document already exists (Student accesses again), it is not recreated and the existing record is preserved.

The album attendance button does **not** reuse the active-session `attend` operation (the session is already closed). Instead it registers the attendance manually against the **latest session** of the course, creating `attendances/{latestSessionId}_{studentUid}` only if it does not exist (idempotent: never creates a duplicate). The record is created with `solved: true` and `rewardClaimed: false`, so it counts as a resolved reto (report "Resolvió") but does **not** grant or open an envelope ("Abrió sobre = No"). It uses the same student-write shape as the normal flow, plus the marker `manualAttendance: true` so the Teacher export can indicate that the student added the attendance manually. It does **not** use the `manual` marker (Teacher-only per RQ10), so no new security rule is required.

### Out of schedule state

Starting the reto is **not** restricted by the course schedule. The schedule only gates the album attendance button.

When the current Colombia time is outside the course schedule, the album per-course view hides the attendance button (a normal application state: no message is required, no Firebase error is produced). When the Student is inside the schedule but a Teacher session is still active, the button is also hidden: the attendance must be registered through `Comenzar` for the active session. When the session has already closed and the Student is inside the schedule, the button is shown; pressing it registers the manual attendance against the latest session of the course.

---

## Core Business Rule

The following events are independent:

### Attendance

Registered when the Student clicks `Comenzar` with an active Teacher session (no schedule requirement), or from the album attendance button when the Teacher session has already closed and the Student is within the course schedule.

### Quantum Lock

Determines whether the Student successfully completes the challenge. Starting or solving it is not restricted by the course schedule.

### Envelope

Granted/opened only after successful Quantum Lock completion according to the existing reward flow.

Therefore:

```text
Active Teacher session
+
Student clicks "Comenzar"
        ↓
Attendance registered (solved: false)
        ↓
Quantum Lock starts
        ↓
        ├── FAIL
        │     ↓
        │   Attendance remains
        │   attempts + 1
        │   No envelope
        │   No reward
        │
        └── SUCCESS
              ↓
            attendances updated
            (solved: true + reward)
              ↓
            Existing envelope flow
              ↓
            Existing reward flow
```

Attendance repuesto (album):

```text
Within course schedule
+
No active Teacher session (session closed)
        ↓
Album shows "Llenar asistencia manualmente" button
        ↓
Student clicks it
        ↓
AttendanceService.registerManualAttendance(latest session, uid)
creates attendances/{latestSessionId}_{uid} if it does not exist
(idempotent; solved: true, rewardClaimed: false, manualAttendance: true;
no envelope). The Teacher export marks these rows in the
"Asistencia manual" column.
```

---

## Implementation Reference

- Schedule utilities: `src/app/core/utils/domain.ts` (`getColombiaTimeParts`, `minutesOfDay`, `isWithinSchedule`).
- Course model with schedule: `src/app/models/course.ts`.
- Seed data with schedules: `src/app/core/seeds/seed.data.ts` and `src/app/core/seeds/seed.service.ts`.
- Attendance on `Comenzar`: `src/app/core/services/attendance.service.ts` (`attend`).
- Manual attendance (album repuesto): `src/app/core/services/attendance.service.ts` (`registerManualAttendance`) and `src/app/core/services/class-session.service.ts` (`getLatestSession`).
- Student session flow (no schedule gate): `src/app/features/student/pages/session/session.ts` and `session.html`.
- Album attendance button (repuesto): `src/app/features/student/pages/album/album.ts` and `album.html`.

Unit tests: `src/app/core/utils/domain.spec.ts`.

No new Firestore collections, indexes, or security rules are required.