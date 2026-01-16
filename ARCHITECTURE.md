# RemindrAI Backend Architecture

---

> How the system works, why it was designed this way, and the tradeoffs it intentionally accepts.

This document explains the backend design behind RemindrAI.  
The system is built to be predictable, cost-safe, and easy to reason about at small scale.  
Some guarantees are intentionally relaxed to keep the system simple and reliable.

<br>

## What RemindrAI is (and is not)

**RemindrAI is a proactive, time-triggered AI execution system.**

It runs AI only at predefined moments, generates a fresh draft on each execution, and delivers results without requiring users to repeatedly open an editor or prompt an AI manually.

Time acts as a trigger — not a task reminder.

**It is not:**

- A post scheduling tool
- A real-time system
- An interactive AI chat product

Delayed execution is acceptable.  
Rare duplicate execution is possible and intentionally tolerated.

<br>

## High-level execution flow

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

The frontend never executes content generation.  
The backend is the single source of truth.

<br>

## Core components

### Time trigger (scheduler)

- One global Cloud Scheduler
- Runs every 5 minutes
- Triggers a single Cloud Function
- Has no knowledge of users or content

Purpose: wake the system — nothing more.

### Execution engine

- Queries due executions in small batches
- Processes each execution independently
- Failures are isolated per execution
- One failure never blocks the batch

This keeps behavior predictable and costs bounded.

### Idempotency layer

Each execution is identified by:

- `reminderId` (intent identifier)
- `scheduledForUTC` (intended execution time)

Idempotency is **best-effort**, not transactional.

The system does **not** guarantee exactly-once execution.  
In rare cases (overlapping scheduler runs, retries, partial crashes), duplicate executions may occur.

This tradeoff avoids distributed locks, cross-service transactions, and complex coordination.

### AI usage controls

AI execution is intentionally constrained:

- AI runs only for AI-enabled intents
- AI runs only at execution time
- One AI call per execution
- Daily per-user and global usage caps enforced

If a limit is exceeded:

- The execution is skipped
- The event is logged
- System state still advances

Usage counters are updated after successful AI calls.  
Short crash windows may temporarily undercount usage.

### State advancement

User intent is immutable.

After execution:

- One-time intents are disabled
- Recurring intents compute their next execution time
- Advancement is based on scheduled time, not wall-clock execution time

This preserves consistency even when executions are delayed or retried.

<br>

## Authority model

The frontend is treated as untrusted.

- Clients may define intent only
- Clients cannot execute, advance, or mutate future state
- All system state transitions are backend-owned
- Firestore Security Rules enforce this boundary

Only the backend may:

- Execute AI
- Advance schedules
- Record execution outcomes
- Update usage counters

<br>

## Design tradeoffs

The backend intentionally accepts the following tradeoffs:

**Accepted:**

- Idempotency is best-effort, not exactly-once
- Rare duplicate executions are tolerated
- AI failures do not retry
- Execution logs are observational, not transactional
- Availability is preferred over strict correctness

**Why:**  
These choices keep the system affordable, debuggable, and understandable at the intended scale.

<br>

## Explicit non-goals

This backend deliberately avoids:

- Distributed locking
- Firestore transactions around AI execution
- Two-phase commit patterns
- Exactly-once guarantees
- Queue-based worker orchestration

These were rejected to avoid unnecessary complexity and cost.

<br>

## Failure philosophy

The system prefers forward progress over perfection.

- Execution should continue even if AI fails
- Logging must never block advancement
- Partial failures are tolerated and observable
- No single execution should block future ones

This prevents cascading failures and retry storms.

---

**This architecture prioritizes clarity, predictability, and cost safety over absolute guarantees.**
