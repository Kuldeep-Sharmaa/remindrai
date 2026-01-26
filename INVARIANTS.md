# Execution Invariants

---

> These rules keep the backend predictable. They are not guidelines.

This document defines constraints that must always hold true for RemindrAI's execution system. Any change that violates these rules is a regression—even if the code appears cleaner.

<br>

## Core ownership

**Time and execution belong to the backend.**

- The frontend never computes execution time
- The frontend never triggers execution
- The frontend writes intent only

The backend is the single source of truth for when and how execution occurs.

<br>

## Time trigger behavior

A single global scheduler wakes the system periodically.

It has no awareness of users, content, or intent. Its only responsibility is to wake the execution engine.

Nothing more.

<br>

## Execution rules

Execution is best-effort by design.

**Not guaranteed:**

- Exactly-once execution
- Immediate execution
- Zero duplicate execution

**Guaranteed:**

- Idempotency prevents most duplicates
- Duplicate execution is possible, but state mutation is protected by idempotency
- One execution never blocks future executions

Predictable progress is more important than perfect precision.

<br>

## Idempotency

Each execution is identified by:

```
intentId + scheduledForUTC
```

The same execution must not be processed twice intentionally.

**No distributed locks. No cross-service transactions.**

Idempotency is defensive, not absolute.

<br>

## State advancement

User intent is immutable. The backend is the only component allowed to advance system state.

After execution:

- One-time intents are disabled
- Recurring intents advance based on scheduled time, not actual execution time

**Advancement happens even if AI fails.**

Execution failure must never stall future runs.

<br>

## Failure handling

```
AI failure → no automatic retry
AI failure → state still advances
Logging failure → execution continues
Partial failure → tolerated and observable
```

The system favors availability and forward motion over strict correctness.

<br>

## Explicit non-goals

This system must not introduce:

- Automatic retries
- Distributed locks
- Queue-based workers
- Exactly-once guarantees
- Frontend-controlled execution

These are intentionally excluded to keep the system understandable, affordable, and safe.

<br>

## Change discipline

**If you are unsure whether a change violates an invariant:**

1. Stop
2. Verify against this document
3. Prefer leaving working code unchanged

<br>

---

**This file exists to protect a backend that already works.**
