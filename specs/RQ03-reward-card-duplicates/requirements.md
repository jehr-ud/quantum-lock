# Requirements

## Objective

Allow students to correctly visualize duplicate reward cards obtained during a course.

## Scope

The functionality applies to the student's album for a course.

The seasonal collection contains 50 cards.

A card may be obtained multiple times.

## Functional Requirements

### RF-001 — Track reward quantities

The system shall calculate the number of times each reward card has been obtained by the student for the selected course.

### RF-002 — Display unique cards

The album shall display each reward card as a single collection item, regardless of how many times it has been obtained.

### RF-003 — Display duplicates

When a student has obtained the same card more than once, the album shall display its quantity using an `xN` indicator.

Examples: `x2`, `x3`, `x4`.

### RF-004 — Preserve duplicate rewards

Obtaining a duplicate card shall not remove or overwrite previous instances of that reward.

### RF-005 — Course isolation

The album shall only include rewards obtained through attendance records associated with the selected course.

### RF-006 — Collection progress

Collection progress shall count unique cards, not total reward instances.

Example: if the student owns Spider-Man ×3, Venom ×2, and Green Goblin ×1, collection progress shall be `3 / 50`, while total obtained rewards shall be `6`.

## Business Rules

1. The seasonal collection contains 50 cards.
2. Duplicate cards are valid rewards.
3. Duplicate cards must remain associated with the student.
4. The quantity of a card represents how many times the student obtained that card.
5. Collection progress represents unique cards.
6. Total obtained rewards includes duplicates.
7. Rewards from another course must not appear in the selected course album.

## Acceptance Criteria

### Scenario 1 — First card

Given the student has obtained Spider-Man once
When the student opens the album
Then Spider-Man shall display quantity `x1`.

### Scenario 2 — Duplicate

Given the student has obtained Spider-Man twice
When the student opens the album
Then Spider-Man shall display quantity `x2`.

### Scenario 3 — Multiple duplicates

Given the student has obtained Spider-Man three times
When the student opens the album
Then Spider-Man shall display quantity `x3`.

### Scenario 4 — Collection progress

Given the student owns three different cards and six total reward instances
When the student opens the album
Then collection progress shall be `3 / 50` and total obtained rewards shall be `6`.

### Scenario 5 — Course isolation

Given the student has obtained Spider-Man in Course A and Venom in Course B
When the student opens the album for Course A
Then only Spider-Man shall contribute to that course's collection.

## Error Scenarios

If reward data cannot be loaded, the album shall display an appropriate error state and shall not silently reset the collection.

## Assumptions

Existing attendance records containing course and reward information are the source of truth.

No separate inventory collection is required.

## Non-Functional Requirements

The implementation shall preserve the existing album and reward functionality.
