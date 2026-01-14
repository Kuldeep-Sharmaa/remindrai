/**
 * idempotency.js
 *
 * Purpose:
 * Provides idempotency helpers for reminder execution.
 *
 * Responsibilities:
 * - Determine whether a reminder execution has already happened
 *   for a given scheduled run time.
 *
 * Guarantees:
 * - Execution identity is defined by reminderId + scheduledForUTC.
 * - This file does not create execution logs.
 *
 * When to modify:
 * - If execution identity definition changes.
 * - If execution log storage structure changes.
 */
