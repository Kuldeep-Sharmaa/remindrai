/**
 * scheduleUtils.ts
 *
 * Computes next run time for reminders based on frequency.
 * Uses scheduledForUTC as base (not actual execution time).
 * Pure, deterministic, side-effect free.
 */

export type ReminderFrequency = "one_time" | "daily" | "weekly";

/**
 * Computes next run time in UTC ISO string.
 * Returns null if reminder should be disabled.
 */
export function computeNextRunAtUTC(
  frequency: ReminderFrequency,
  scheduledForUTC: string,
): string | null {
  const baseDate = new Date(scheduledForUTC);

  if (Number.isNaN(baseDate.getTime())) {
    throw new Error(
      `[computeNextRunAtUTC] Invalid scheduledForUTC: ${scheduledForUTC}`,
    );
  }

  // One-time reminders don't advance
  if (frequency === "one_time") {
    return null;
  }

  // Daily: +1 day
  if (frequency === "daily") {
    const next = new Date(baseDate);
    next.setUTCDate(next.getUTCDate() + 1);
    return next.toISOString();
  }

  // Weekly: +7 days
  if (frequency === "weekly") {
    const next = new Date(baseDate);
    next.setUTCDate(next.getUTCDate() + 7);
    return next.toISOString();
  }

  // Exhaustiveness guard
  throw new Error(`[computeNextRunAtUTC] Unsupported frequency: ${frequency}`);
}
