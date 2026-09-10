# RQ09 — Seeded Course Schedule and Attendance on Attempt

## Objective

Implement course schedules using the existing seeders and use those schedules to determine when a Student can register attendance.

The Teacher must NOT configure course schedules through the application.

Attendance must be registered when the Student clicks `Comenzar`, provided that:

1. The Student is authenticated.
2. The Student has access to the selected course.
3. The Teacher session is active.
4. The current Colombia date/time is inside the scheduled time range of the course.

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

When the Student clicks `Comenzar` on an eligible course, the application creates the attendance document with `solved: false`, `attempts: 0` and `rewardClaimed: false` before the Quantum Lock becomes interactive.

If the document already exists (Student accesses again), it is not recreated and the existing record is preserved.

### Out of schedule state

When the current Colombia time is outside the course schedule, the Student sees the existing "La sesión aún no ha comenzado" screen with an additional message indicating that the Student is not within the class schedule. Validating the schedule is a normal application state: no attendance is registered, no lock is initialized, and no unhandled Firebase error is produced.

---

## Core Business Rule

The following events are independent:

### Attendance

Registered when the Student clicks `Comenzar` during a valid scheduled course period and an active Teacher session.

### Quantum Lock

Determines whether the Student successfully completes the challenge.

### Envelope

Granted/opened only after successful Quantum Lock completion according to the existing reward flow.

Therefore:

```text
Valid schedule
+
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

---

## Implementation Reference

- Schedule utilities: `src/app/core/utils/domain.ts` (`getColombiaTimeParts`, `minutesOfDay`, `isWithinSchedule`).
- Course model with schedule: `src/app/models/course.ts`.
- Seed data with schedules: `src/app/core/seeds/seed.data.ts` and `src/app/core/seeds/seed.service.ts`.
- Attendance on `Comenzar`: `src/app/core/services/attendance.service.ts` (`attend`).
- Student session flow and out-of-schedule state: `src/app/features/student/pages/session/session.ts` and `session.html`.

Unit tests: `src/app/core/utils/domain.spec.ts`.

No new Firestore collections, indexes, or security rules are required.