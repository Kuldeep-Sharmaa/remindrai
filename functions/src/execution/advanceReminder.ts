/**
 * advanceReminder.ts
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
 * - Reminder content and intent are never modified.
 * - Frontend never controls reminder advancement.
 *
 * IMPORTANT:
 * - Uses scheduledForUTC (NOT execution time)
 * - Best-effort
 * - Never throws
 */

import { DocumentReference, FieldValue } from "firebase-admin/firestore";
import { computeNextRunAtUTC } from "../utils/scheduleUtils";

/**
 * Minimal scheduling data required to advance a reminder.
 */
export type AdvanceableReminderData = {
  frequency: "one_time" | "daily" | "weekly";
  schedule: any; // frontend-owned, intentionally opaque
};

/**
 * Input contract for advancing reminder state.
 */
export interface AdvanceReminderInput {
  reminderRef: DocumentReference;
  reminderData: AdvanceableReminderData;
  scheduledForUTC: string;
}

/**
 * Advances reminder state after an execution attempt.
 */
export async function advanceReminder(
  input: AdvanceReminderInput,
): Promise<void> {
  const { reminderRef, reminderData, scheduledForUTC } = input;

  try {
    const { frequency, schedule } = reminderData;

    /**
     * One-time reminders STOP FOREVER after execution.
     * No nextRunAtUTC. No reschedule. No exceptions.
     */
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

    /**
     * Recurring reminders only (daily / weekly)
     * Base calculation on scheduledForUTC — NOT execution time.
     */
    const nextRunAtUTC = computeNextRunAtUTC(schedule, scheduledForUTC);

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

    // Intentionally swallow errors:
    // reminder advancement failure must NOT crash the system
  }
}
