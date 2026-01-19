/**
 * scheduleUtils.ts
 *
 * Purpose:
 * - Compute the nextRunAtUTC for a reminder based on schedule + frequency.
 *
 * IMPORTANT DESIGN RULES (LOCKED):
 * - Uses scheduledForUTC as the base (NOT execution time).
 * - Frontend schedule shape is treated as opaque.
 * - No Firestore access here.
 * - Pure, deterministic function.
 * - No side effects.
 */

type ReminderFrequency = "one_time" | "daily" | "weekly";

/**
 * Computes the next run time in UTC ISO string.
 *
 * @param schedule - Frontend-provided schedule object (opaque, do not assume shape)
 * @param scheduledForUTC - The UTC ISO string that just executed
 *
 * @returns nextRunAtUTC ISO string, or null if reminder should be disabled
 */
export function computeNextRunAtUTC(
  schedule: any,
  scheduledForUTC: string,
): string | null {
  const baseDate = new Date(scheduledForUTC);

  if (Number.isNaN(baseDate.getTime())) {
    throw new Error(
      `[computeNextRunAtUTC] Invalid scheduledForUTC: ${scheduledForUTC}`,
    );
  }

  const frequency: ReminderFrequency | undefined = schedule?.frequency;

  if (!frequency) {
    throw new Error("[computeNextRunAtUTC] Missing frequency in schedule");
  }

  // One-time reminders do not advance
  if (frequency === "one_time") {
    return null;
  }

  // Daily reminders: add 1 day
  if (frequency === "daily") {
    const next = new Date(baseDate);
    next.setUTCDate(next.getUTCDate() + 1);
    return next.toISOString();
  }

  // Weekly reminders: add 7 days
  if (frequency === "weekly") {
    const next = new Date(baseDate);
    next.setUTCDate(next.getUTCDate() + 7);
    return next.toISOString();
  }

  // Exhaustiveness guard (future safety)
  throw new Error(`[computeNextRunAtUTC] Unsupported frequency: ${frequency}`);
}
