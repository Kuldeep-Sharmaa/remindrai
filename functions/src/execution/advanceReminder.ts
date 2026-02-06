/**
 * advanceReminder.ts
 *
 * Advances reminder state after execution.
 * Disables one-time reminders, computes next run for recurring ones.
 * Uses scheduledForUTC (not actual execution time) for advancement.
 * Best-effort, never throws.
 */

import { DocumentReference, FieldValue } from "firebase-admin/firestore";
import { computeNextRunAtUTC } from "../utils/scheduleUtils";

/**
 * Minimal scheduling data required to advance a reminder.
 */
export type AdvanceableReminderData = {
  frequency: "one_time" | "daily" | "weekly";
  schedule: any; // Frontend-owned, intentionally opaque
};

export interface AdvanceReminderInput {
  reminderRef: DocumentReference;
  reminderData: AdvanceableReminderData;
  scheduledForUTC: string;
}

/**
 * Advances reminder state after execution attempt.
 */
export async function advanceReminder(
  input: AdvanceReminderInput,
): Promise<void> {
  const { reminderRef, reminderData, scheduledForUTC } = input;

  try {
    const { frequency } = reminderData;

    // One-time reminders stop after execution
    if (frequency === "one_time") {
      await reminderRef.update({
        enabled: false,
        updatedAt: FieldValue.serverTimestamp(),
      });

      console.log("[advanceReminder] One-time reminder disabled", {
        reminderId: reminderRef.id,
      });

      return;
    }

    // Recurring reminders - compute next run from scheduled time
    const nextRunAtUTC = computeNextRunAtUTC(frequency, scheduledForUTC);

    await reminderRef.update({
      nextRunAtUTC,
      updatedAt: FieldValue.serverTimestamp(),
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

    // Swallow error - advancement failure doesn't crash the system
  }
}
