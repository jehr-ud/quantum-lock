# Requirements

## Objective

Allow users to recover access to their account through a password reset email.

## Scope

The functionality applies to users registered through Firebase Authentication.

## Functional Requirements

### RF-001 — Recovery option

The login view shall provide an option for users who have forgotten their password.

### RF-002 — Email input

The recovery flow shall request the user's institutional email address.

### RF-003 — Send reset email

The system shall request Firebase Authentication to send a password reset email to the provided address.

### RF-004 — Success feedback

When the password reset request is accepted, the UI shall inform the user that instructions have been sent to the provided email address.

### RF-005 — Invalid email

The UI shall provide an appropriate message when the email format is invalid.

### RF-006 — Firebase Authentication errors

Firebase Authentication errors shall be handled without exposing internal implementation details.

### RF-007 — Return to login

The user shall be able to return to the login view after requesting password recovery.

## Business Rules

1. Password recovery shall use Firebase Authentication.
2. The application shall not store passwords.
3. The application shall not implement its own password reset mechanism.
4. The existing authentication flow shall remain unchanged.
5. Password recovery shall use the user's institutional email.

## Acceptance Criteria

### Scenario 1 — Recovery request

Given a valid institutional email
When the user requests password recovery
Then Firebase Authentication shall receive the password reset request.

### Scenario 2 — Successful request

Given Firebase accepts the password reset request
When the operation completes
Then the user shall see a confirmation message.

### Scenario 3 — Invalid email

Given an invalid email address
When the user requests password recovery
Then the UI shall display a validation message.

### Scenario 4 — Firebase error

Given Firebase Authentication returns an error
When the recovery request completes
Then the UI shall display an appropriate user-facing error.

## Security Requirements

The application shall never display or store the user's password.

The application shall rely on Firebase Authentication for password reset security.

## Non-Functional Requirements

The existing login and registration functionality shall not be modified unnecessarily.
