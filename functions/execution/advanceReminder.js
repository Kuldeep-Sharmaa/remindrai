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
import * as admin from "firebase-admin";
import { computeNextRunAtUTC } from "../helpers/computeNextRunAtUTC";

/**
 * Advances reminder state after an execution attempt.
 * Disables one-time reminders or computes next run time for recurring reminders.
 */
export async function advanceReminder({
  reminderRef,
  reminderData,
  scheduledForUTC,
}) {
  try {
    const frequency = reminderData.frequency;

    // One-time reminders are disabled after execution
    if (frequency === "one_time") {
      await reminderRef.update({
        enabled: false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("[advanceReminder] One-time reminder disabled", {
        reminderId: reminderRef.id,
      });
      return;
    }

    // Recurring reminders: compute next run time from scheduled time (not execution time)
    const schedule = reminderData.schedule;
    const nextRunAtUTC = computeNextRunAtUTC(schedule, scheduledForUTC);

    await reminderRef.update({
      nextRunAtUTC,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log("[advanceReminder] Reminder advanced", {
      reminderId: reminderRef.id,
      nextRunAtUTC,
    });
  } catch (error) {
    console.error("[advanceReminder] Failed to advance reminder", {
      reminderId: reminderRef.id,
      error: error instanceof Error ? error.message : String(error),
    });
    // Do not throw - failing to advance must not crash the system
  }
}
