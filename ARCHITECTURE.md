# RemindrAI Backend Architecture

---

> How the system works, why it's built this way, and what tradeoffs were made.

This document explains the design decisions behind RemindrAI's backend. The system is designed to be simple, predictable, and cost-safe. Some tradeoffs are deliberate.

<br>

## What RemindrAI is (and is not)

**RemindrAI is a scheduler-driven AI execution system.**

It runs AI only at reminder time, generates a fresh draft on each run, and delivers drafts without users repeatedly prompting AI.

**It is not:**

- A post scheduler
- A real-time system
- An AI chat interface

Late execution is acceptable. Rare duplicate execution is possible and intentionally tolerated.

<br>

## High-level flow

```
User creates reminder
    ↓
Intent stored (immutable)
    ↓
Cloud Scheduler wakes backend every 5 minutes
    ↓
Backend finds due reminders
    ↓
Idempotency checks applied
    ↓
AI usage caps verified
    ↓
Reminder executes (AI or simple)
    ↓
Result saved and delivered
    ↓
System state advances
```

The frontend never executes reminders. The backend is the single source of truth.

<br>

## Core components

### Scheduler

- One global Cloud Scheduler
- Runs every 5 minutes
- Triggers a single Cloud Function
- Knows nothing about users or reminder logic

Purpose: wake the backend, nothing more.

### Execution engine

- Queries due reminders in small batches
- Processes reminders sequentially
- Each reminder executes in isolation
- One failure does not stop the batch

This keeps behavior and cost predictable.

### Idempotency layer

Each reminder execution is identified by:

- `reminderId`
- `scheduledForUTC` (the scheduled run time)

This idempotency is **best-effort**, not transactional.

The system does **not** guarantee exactly-once execution. In rare edge cases (overlapping scheduler runs, retries, partial failures), duplicate executions may occur.

This tradeoff avoids distributed locks, transactions, and complex coordination.

### AI usage controls

AI execution is tightly controlled:

- AI runs only for AI reminders
- AI runs only at execution time
- One AI call per reminder execution
- Daily per-user and global AI caps are enforced

If a cap is exceeded, the reminder execution is skipped, the event is logged, and the reminder still advances.

Counters are updated after successful AI calls. In crash windows, counters may temporarily lag actual usage.

### Reminder advancement

Reminder intent is immutable.

After execution:

- One-time reminders are disabled
- Recurring reminders compute the next run time
- Advancement is derived from the scheduled run time, not wall-clock execution time

This preserves schedule integrity even if executions are delayed or retried.

<br>

## Design tradeoffs

The backend intentionally accepts the following tradeoffs:

**Accepted:**

- Idempotency is best-effort, not exactly-once
- Rare duplicate executions may occur
- AI failures do not retry and permanently advance reminders
- Execution logs are observational, not transactional
- Availability is preferred over strict correctness

**Why:**  
These choices keep the system simple, affordable, and explainable at small scale.

<br>

## Explicit non-goals

This backend intentionally does **not** attempt to provide:

- Distributed locks
- Firestore transactions around AI
- Two-phase commit
- Exactly-once semantics
- Queue-based worker systems

These were rejected to avoid unnecessary complexity and cost at the current scale.

<br>

---

**This architecture prioritizes clarity and predictability over absolute guarantees.**
