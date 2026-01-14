/**
 * advanceReminder.js
 *
 * Purpose:
 * Advances backend-owned reminder state after execution.
 *
 * Responsibilities:
 * - Disable one-time reminders after execution.
 * - Compute and set the nextRunAtUTC for recurring reminders.
 * - Update only system-owned fields.
 *
 * Guarantees:
 * - Reminder content and schedule intent are never modified.
 * - Frontend never controls reminder advancement.
 *
 * When to modify:
 * - If scheduling logic changes.
 * - If new reminder frequencies are introduced.
 */
