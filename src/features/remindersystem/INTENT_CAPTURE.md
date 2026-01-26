# Intent Capture Workflow

---

> How user intent enters the system—and where frontend responsibility ends.

This document describes how RemindrAI captures what users want to create, transforms it into a structured intent record, and persists it to Firestore.

An intent represents _what the AI should act on later_. This workflow intentionally stops before execution. Timing, scheduling, and state advancement are backend responsibilities.

<br>

## Overview

The intent capture flow has one responsibility: transform user input into a valid intent document.

```
User Input → Validation → Firestore
     ↓            ↓           ↓
UI Layer    Hook Layer  Service Layer
```

### Flow breakdown

| Step                | Component            | Responsibility                                                     |
| ------------------- | -------------------- | ------------------------------------------------------------------ |
| 1. Collect input    | `ReminderForm.jsx`   | Gather user preferences (frequency, time, message, tone, platform) |
| 2. Validate & shape | `useReminderForm.js` | Manage form state, validate input, build intent payload            |
| 3. Persist          | `remindrClient.js`   | Write intent to Firestore (only layer that touches Firebase SDK)   |

This separation ensures:

- UI remains declarative
- Hooks manage state without side effects
- Firestore writes are centralized and auditable

<br>

## Intent vs execution

**This workflow captures intent only.**

It does not:

- Compute execution time
- Decide when execution occurs
- Advance schedules
- Trigger backend execution
- Call AI

Those responsibilities belong exclusively to the backend execution engine.

The frontend's job ends once intent is saved.

<br>

## Time representation

Time exists in two forms, with strict ownership boundaries.

### Frontend-owned (user perception)

- User-selected time
- Local timezone
- Schedule preference (one-time, daily, weekly)

These are stored as part of the intent so the UI can:

- Display user-facing time correctly
- Support edits
- Remain timezone-aware

### Backend-owned (execution)

- Absolute execution time
- UTC-based scheduling
- Advancement logic

**The frontend never computes or persists authoritative execution timestamps.**

This prevents timezone drift, duplicate execution, and trust leaks between layers.

<br>

## Firestore structure

Intents are stored in a user-scoped subcollection:

```
users/{uid}/reminders/{intentId}
```

This document represents **what the user wants the system to do**, not what the system has done.

**Typical fields include:**

- Intent metadata (frequency, schedule preference)
- Content input (message, tone, platform)
- User-defined options

**System-managed fields** (execution time, state, logs) are never written by the frontend.

<br>

## Authority boundary

**The frontend is treated as untrusted.**

It may:

- Define intent
- Read system state
- Display execution results

It may never:

- Mutate execution state
- Advance schedules
- Compute authoritative run times
- Simulate backend behavior

Firestore Security Rules enforce this boundary.

<br>

## Why this design matters

By keeping intent capture simple and execution backend-owned:

- The system remains predictable
- Execution can evolve independently of the UI
- AI execution stays controlled and cost-safe
- The UI never misrepresents system state

**This workflow is intentionally boring.**

Boring intent capture enables reliable AI execution.

<br>

## Related documentation

- Execution semantics → `ARCHITECTURE.md`
- System guarantees → `INVARIANTS.md`
- Scheduling behavior → backend scheduler implementation

<br>

---

**This document explains how intent enters the system—and nothing beyond that.**
