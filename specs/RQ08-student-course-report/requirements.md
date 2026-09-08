# RQ08 — Student per-course report (PDF)

## 1. Objective

Allow a **Student** to download a per-course PDF report containing:

* The Student's full name.
* The dates on which the Student participated in sessions of the selected course.
* The quantity of reward cards obtained, both per date and as a total for the course.

The report is intended to be presented by the Student on the day works/assignments are delivered.

---

## 2. Scope

The functionality applies to the authenticated Student interface.

The report is generated per course and contains only:

* The authenticated Student's own data.
* Data associated with the selected course.

The report must be generated from existing Firestore data. No new persistent collections or backend services are required.

---

## 3. Actors

### Student

An authenticated user with role `STUDENT` must be able to download the report for a course in which they are enrolled.

---

## 4. Functional Requirements

### RF-001 — Per-course report download

The system shall provide a visible action allowing the Student to download a PDF report for a selected course.

The action should follow the existing Student interface navigation and visual patterns and should be available from an existing Student view (for example the album page or a course view).

### RF-002 — Student full name

The report shall include the Student's full name (`firstName` + `lastName`).

### RF-003 — Participation dates

The report shall list each date on which the Student registered attendance in the selected course.

A single date row shall represent a single session participation.

### RF-004 — Cards per date

The report shall show the quantity of reward cards the Student obtained on each listed date.

When the Student solved the Quantum Lock and received a reward, the card quantity for that date shall be greater than zero.

### RF-005 — Total cards

The report shall show the total quantity of cards the Student obtained in the selected course.

The total shall include duplicate cards, consistent with the existing reward rules.

### RF-006 — Failed participation

Participation dates in which the Student registered attendance but failed the Quantum Lock shall appear in the report and shall show zero cards obtained for that date.

A failed attempt still represents participation.

### RF-007 — Course isolation

The report shall only include attendance records associated with the selected course.

Records from other courses shall not appear.

### RF-008 — Own data only

The report shall only include the authenticated Student's attendance records.

It shall never include another Student's data.

### RF-009 — PDF format

The generated report shall be a PDF file.

### RF-010 — Firestore as source of truth

The report shall be generated from existing Firestore data at download time.

The implementation shall not maintain a separate report collection.

### RF-011 — Empty report

If the Student has no attendance records for the selected course, the system shall generate a valid PDF containing the Student's full name and a zero total, or display an appropriate message.

### RF-012 — Duplicate attempts

Multiple Quantum Lock attempts by the same Student during the same session shall not generate multiple report rows for that session.

---

## 5. Report Content

### Header

| Field | Description |
|---|---|
| Estudiante | Student full name |
| Materia | Selected course name/code |

If the course header cannot be resolved, the report may omit the course name but must still identify the course context in a user-visible way during download.

### Date rows

| Column | Description |
|---|---|
| Fecha | Date of the attendance record for the selected course |
| Estado | Whether the Quantum Lock was resolved on that date, e.g. `Resolvió` / `Falló` |
| Cartas | Quantity of cards obtained on that date (`0` for failed participation) |

### Summary

The report shall include a total row/section showing the total quantity of cards obtained in the selected course (duplicates included).

---

## 6. User Flow

```text
Student authenticated
        ↓
Student dashboard
        ↓
Open a course / open album
        ↓
Select "Descargar reporte" (or equivalent existing action)
        ↓
Application retrieves the Student's attendance for the selected course from Firestore
        ↓
Application builds the PDF
        ↓
Application delivers the PDF file to the Student (download)
```

---

## 7. Business Rules

### BR-001

Only the authenticated Student can download their own report.

### BR-002

The report is generated per course and only contains data for the selected course.

### BR-003

Each session participation produces at most one date row.

### BR-004

A Student who attended the session but failed the Quantum Lock must appear in the report with `Cartas = 0`.

### BR-005

Total cards include duplicates.

### BR-006

Card quantity must be derived from the same reward state used by the existing album, so reported totals stay consistent with collection/album data.

### BR-007

The report download must not modify Firestore data.

### BR-008

The report must not include data from other courses or other students.

---

## 8. Error Scenarios

## Scenario 1 — Data cannot be retrieved

If attendance or Student information cannot be retrieved:

* The download operation shall fail gracefully.
* The Student shall receive an appropriate user-facing error message.
* The application shall not generate a partial or incomplete report.

## Scenario 2 — Course does not exist or is not accessible

If the selected course cannot be resolved for the Student:

* The download shall not proceed.
* The Student shall receive an appropriate message.
* The application shall not fabricate a report.

## Scenario 3 — Generation failure

If the PDF cannot be generated:

* The application shall not silently ignore the failure.
* The Student shall receive an appropriate error message.

---

## 9. Acceptance Criteria

## AC-001 — Successful student with cards

**Given** a Student solved the Quantum Lock in several sessions of the course and received cards

**When** the Student downloads the report for that course

**Then** the report shows the Student's full name, each participation date with its card quantity, and the total card quantity.

## AC-002 — Duplicate cards total

**Given** a Student received the same card multiple times in the course

**When** the Student downloads the report

**Then** the total cards count every instance, including duplicates.

## AC-003 — Failed participation

**Given** a Student registered attendance in a session but failed the Quantum Lock

**When** the Student downloads the report

**Then** that date appears in the report with `Cartas = 0`.

## AC-004 — Course isolation

**Given** the Student has attendance in Course A and Course B

**When** the Student downloads the report for Course A

**Then** the report includes only Course A records and totals.

## AC-005 — Own data only

**Given** several Students have attendance in the same course

**When** one Student downloads their report

**Then** only that Student's data appears.

## AC-006 — Multiple attempts in one session

**Given** a Student made multiple attempts in the same session and has a single attendance record for it

**When** the Student downloads the report

**Then** the session appears only once.

## AC-007 — No attendance

**Given** a Student has no attendance in the selected course

**When** the Student downloads the report

**Then** the application generates a valid PDF with the Student's full name and a zero total, or shows an appropriate empty message.

---

## 10. Technical Constraints

Use the existing:

* attendance service and attendance model
* User model (firstName, lastName)
* course model and course service
* shared data/constants for reward cards
* existing PDF/client export approach if one already exists (otherwise a standard lightweight PDF generation approach consistent with the project)

Prefer existing services and business logic over duplicating Firestore queries in page components.

Do not create new Firestore collections to store reports.

Do not weaken Firestore security rules.

Do not introduce a backend server for report generation.

Do not modify Teacher functionality.

If a shared component needs a new capability, add it as an optional capability rather than changing existing required behavior.

---

## 11. Testing

### Student

* Login.
* Dashboard.
* Open a course / album.
* Download the report for a course with multiple sessions.
* Download the report for a course with duplicate cards.
* Download the report for a course with a failed participation.
* Download the report for a course with no attendance.
* Verify course isolation.

### Regression

* Student login, dashboard, course selection, session, Quantum Lock, attendance, failed attempts, rewards, envelope, album, duplicates.
* Both PDF files open/print correctly.

### Build

* Run the project's existing tests.
* Run the production build.
* Verify TypeScript compilation.

---

## 12. Implementation Notes

Before implementation, inspect:

* how the attendance records are queried by Student and course
* how reward counts are computed for the album
* how the Student full name and course names are resolved
* whether a PDF/dependency library is available in the project

Reuse the existing reward-count logic so the report total matches the album.

Identify the best Student view to expose the download action (album page is a natural candidate).

---

## 13. Definition of Done

RQ08 is complete only when:

* The Student can download a PDF report for a selected course.
* The report contains the Student's full name.
* The report lists each participation date with its card quantity.
* The report shows the total card quantity for the course, including duplicates.
* Failed participation dates appear with zero cards.
* The report is isolated to the selected course and the authenticated Student.
* No Firestore data is modified during download.
* No Teacher functionality is affected.
* Errors are handled gracefully.
* Tests/build pass.