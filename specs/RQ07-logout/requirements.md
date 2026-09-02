# RQ07 — Logout

## 1. Objective

Provide a clear and secure logout action for both **Teacher** and **Student** users.

The logout functionality must use the existing Firebase Authentication architecture and must not introduce a custom authentication mechanism.

---

## 2. Scope

The requirement applies to authenticated users with either role:

* `TEACHER`
* `STUDENT`

A logout action must be accessible from the authenticated application interface.

The logout operation must terminate the current Firebase Authentication session and return the user to the login screen.

---

## 3. Actors

### Teacher

The Teacher must be able to log out from the Teacher interface.

### Student

The Student must be able to log out from the Student interface.

---

# 4. Functional Requirements

## RF-001 — Teacher logout

The system shall provide a visible logout action for authenticated Teachers.

The action should be accessible from the main Teacher interface/dashboard and follow the existing application navigation and visual patterns.

---

## RF-002 — Student logout

The system shall provide a visible logout action for authenticated Students.

The action should be accessible from the main Student interface/dashboard and follow the existing application navigation and visual patterns.

---

## RF-003 — Firebase Authentication logout

When the user selects logout, the application shall use the existing Firebase Authentication sign-out mechanism.

The application shall not implement a custom logout mechanism.

---

## RF-004 — Authentication state cleanup

After successful logout:

* The Firebase Authentication session must be terminated.
* The application must update its authentication state.
* Protected application views must no longer be accessible as an authenticated user.
* The user must be redirected to the login page.

---

## RF-005 — Navigation after logout

After logout, the user shall be redirected to the application's existing login route.

The logout operation must not leave the user on a protected Teacher or Student route.

---

## RF-006 — Browser navigation protection

After logout, attempting to access a protected route directly must not restore access to the authenticated application.

The existing route guards/authentication mechanism must continue to enforce authorization.

Do not bypass or weaken route protection.

---

## RF-007 — Role isolation

Logging out from one role must completely terminate that authenticated session.

The implementation must not assume that the user is a Teacher or Student when performing the Firebase sign-out operation.

---

## RF-008 — Logout error handling

If Firebase Authentication returns an unexpected error during logout:

* The error must not be silently swallowed.
* The user must receive an appropriate user-facing message.
* The application must preserve the existing authentication state unless sign-out was successfully completed.

Do not use a broad catch-all implementation that assumes logout succeeded.

---

## RF-009 — Prevent duplicate logout actions

While the logout operation is being processed, the UI should prevent accidental repeated logout requests.

For example:

* disable the logout button while processing, or
* show an existing application loading state.

Use the application's existing loading/state management pattern.

---

# 5. User Interface

The logout action should use the existing UI design system.

Do not introduce a completely new navigation pattern.

Recommended label:

```text
Cerrar sesión
```

The action may be represented as:

* a button
* a menu item
* a profile/account menu option

depending on the existing application layout.

The same design pattern should be used consistently for Teacher and Student where practical.

---

# 6. User Flow

## Teacher

```text
Teacher authenticated
        ↓
Teacher dashboard
        ↓
Click "Cerrar sesión"
        ↓
Firebase Authentication signOut
        ↓
Authentication state updated
        ↓
Redirect to Login
```

## Student

```text
Student authenticated
        ↓
Student dashboard
        ↓
Click "Cerrar sesión"
        ↓
Firebase Authentication signOut
        ↓
Authentication state updated
        ↓
Redirect to Login
```

---

# 7. Business Rules

### BR-001

Only authenticated users can see and use the logout action.

### BR-002

Logout must use Firebase Authentication.

### BR-003

Logout must not delete:

* Student data
* Teacher data
* Course data
* Session data
* Attendance data
* Attempt data
* Reward data
* Album data

Logout only terminates the current authentication session.

### BR-004

A logout must not modify Firestore application data.

### BR-005

After logout, the user must authenticate again to access protected application functionality.

---

# 8. Error Scenarios

## Scenario 1 — Firebase logout succeeds

Expected:

```text
Authentication session terminated
→ Login page displayed
```

## Scenario 2 — Firebase logout fails

Expected:

```text
Authentication session remains unchanged
→ User receives an error message
→ User remains in the authenticated application
```

Do not redirect to login if the application cannot confirm that logout succeeded, unless the existing authentication state listener determines that the session has actually ended.

## Scenario 3 — User attempts to access protected route after logout

Expected:

```text
Protected route
→ Authentication guard
→ User is not authenticated
→ Redirect to Login
```

---

# 9. Acceptance Criteria

## AC-001 — Teacher can logout

**Given** a Teacher is authenticated

**When** the Teacher selects `Cerrar sesión`

**Then** Firebase Authentication signs out the user

**And** the user is redirected to the login page.

---

## AC-002 — Student can logout

**Given** a Student is authenticated

**When** the Student selects `Cerrar sesión`

**Then** Firebase Authentication signs out the user

**And** the user is redirected to the login page.

---

## AC-003 — Protected routes are inaccessible

**Given** a user has successfully logged out

**When** the user attempts to access a protected route directly

**Then** the authentication guard prevents access

**And** the user is redirected to login.

---

## AC-004 — Application data is preserved

**Given** a user is authenticated and has existing application data

**When** the user logs out

**Then** the user's application data remains unchanged.

---

## AC-005 — Logout error

**Given** a user is authenticated

**When** Firebase Authentication returns an unexpected error during logout

**Then** the application displays an appropriate error message

**And** does not falsely report that logout succeeded.

---

## AC-006 — No duplicate logout requests

**Given** a user has clicked `Cerrar sesión`

**When** the logout request is being processed

**Then** repeated clicks must not trigger multiple concurrent logout operations.

---

# 10. Technical Constraints

Use the existing Firebase Authentication service/abstraction.

Prefer existing:

* authentication service
* authentication state signal/observable
* route guards
* router navigation
* shared UI components

Do not create another authentication service if one already exists.

Do not store authentication state independently in Firestore.

Do not introduce custom session tokens.

Do not modify Firestore Security Rules to implement logout.

Do not modify unrelated authentication behavior.

---

# 11. Testing

Verify at minimum:

### Teacher

* Logout button is visible.
* Clicking logout signs out successfully.
* User is redirected to login.
* Protected Teacher routes cannot be accessed afterward.

### Student

* Logout button is visible.
* Clicking logout signs out successfully.
* User is redirected to login.
* Protected Student routes cannot be accessed afterward.

### Regression

Verify that logout does not affect:

* courses
* sessions
* attendance
* rewards
* album
* user records

---

# 12. Implementation Notes

Before implementation, inspect the existing authentication architecture.

Determine:

* where Firebase Auth is initialized
* where `signOut()` is currently handled, if anywhere
* how authentication state is represented
* how route guards work
* how Teacher/Student role routing works
* where the main Teacher navigation is implemented
* where the main Student navigation is implemented

Reuse the existing architecture.

If a reusable authenticated-layout/header/navigation component exists, prefer adding logout there rather than duplicating implementation in every page.

---

# 13. Definition of Done

RQ07 is complete only when:

* Teacher has a logout action.
* Student has a logout action.
* Firebase Authentication sign-out is used.
* Authentication state is correctly updated.
* User is redirected to login after successful logout.
* Protected routes remain protected.
* No application data is deleted or modified.
* Errors are handled correctly.
* Existing Teacher and Student functionality continues working.
* Tests/build pass.
