# Requirements

## Objective

Allow the teacher to download an Excel file containing student attendance records for a selected course.

## Scope

The functionality shall be available from the teacher dashboard.

The teacher shall be able to generate the report for a selected course.

## Functional Requirements

### RF-001 — Export attendance

The teacher shall be able to request an Excel export for a selected course.

### RF-002 — Course filtering

The generated report shall contain attendance records associated only with the selected course.

### RF-003 — Student information

The report shall include the student's name.

### RF-004 — Student email

The report shall include the student's institutional email.

### RF-005 — Attendance date

The report shall include the date associated with the attendance record.

### RF-006 — Envelope result

The report shall indicate whether the student successfully opened the reward envelope.

### RF-007 — Failed participation

Students who registered attendance but failed the Quantum Lock shall appear in the report.

### RF-008 — Duplicate attempts

Multiple Quantum Lock attempts by the same student during the same session shall not generate multiple attendance rows.

### RF-009 — Empty report

If the selected course has no attendance records, the system shall generate an empty report with the expected columns or display an appropriate message.

### RF-010 — Consolidated per-student sheet

The Excel report shall include a second sheet consolidating, per student, the total quantity of reward envelopes opened in the selected course.

The consolidated sheet shall contain exactly three columns:

| Column | Description |
|---|---|
| Nombre | Student full name |
| Correo | Student institutional email |
| Cantidad de sobres | Total quantity of envelopes opened (cards obtained), counting duplicates |

The quantity shall count every attendance record of the course in which the student successfully opened the reward envelope. Duplicate cards are counted individually, consistent with the existing reward rules.

## Report Columns

| Column | Description |
|---|---|
| Fecha | Date of the attendance record |
| Estudiante | Student full name |
| Correo | Student institutional email |
| Abrió sobre | Whether the student successfully opened the reward envelope |

The `Abrió sobre` value shall clearly distinguish successful and unsuccessful cases, for example `Sí` and `No`.

## Business Rules

1. The report is generated per course.
2. Only attendance records belonging to the selected course are included.
3. A student who attended but failed the Quantum Lock must appear in the report.
4. Opening the envelope represents successful completion of the reward flow.
5. Duplicate Quantum Lock attempts do not create duplicate attendance rows.
6. The report must not include attendance from other courses.
7. The consolidated sheet counts every opened reward envelope per student, including duplicate cards, using the existing reward/envelope state (`rewardClaimed`).

## Acceptance Criteria

### Scenario 1 — Successful student

Given a student registered attendance and successfully opened the envelope
When the teacher exports the course attendance
Then the student shall appear with `Abrió sobre = Sí`.

### Scenario 2 — Failed student

Given a student registered attendance but did not solve the Quantum Lock
When the teacher exports the course attendance
Then the student shall appear with `Abrió sobre = No`.

### Scenario 3 — Multiple attempts

Given a student made multiple attempts in the same session
When the teacher exports the attendance
Then the student shall appear only once for that session.

### Scenario 4 — Course isolation

Given attendance exists for multiple courses
When the teacher exports Course A
Then records from Course B shall not be included.

### Scenario 5 — Consolidated per-student quantities

Given students opened the reward envelope once or several times during sessions of the course (including duplicate cards)
When the teacher exports the course attendance
Then the consolidated sheet shows one row per student with `Nombre`, `Correo`, and the total `Cantidad de sobres` counting every opened envelope, including duplicates.

## Error Scenarios

If attendance or student information cannot be retrieved, the export operation shall fail gracefully and provide an appropriate error message.

The application shall not generate a partial report while silently omitting records.

## Non-Functional Requirements

The generated file shall be a standard Excel-compatible file.

The implementation shall not modify existing attendance records merely to generate the report.

The implementation shall preserve the existing Teacher dashboard functionality.
