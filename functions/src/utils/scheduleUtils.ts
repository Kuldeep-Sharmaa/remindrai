/**
 * scheduleUtils.ts
 *
 * Figures out when a reminder should run next based on its frequency.
 * Critical: Uses scheduledForUTC (when it was SUPPOSED to run), not actual execution time.
 * This prevents drift when backend is slow or offline.
 *
 * Pure functions - no side effects, no external state.
 */

import { DateTime } from "luxon";

export type ReminderFrequency = "one_time" | "daily" | "weekly";

interface WeeklySchedule {
  timeOfDay?: string; // "HH:mm" format, e.g. "09:30"
  timezone?: string; // IANA timezone, e.g. "America/New_York"
  weekDays?: number[]; // ISO weekdays: 1=Monday, 7=Sunday
}

/**
 * Computes next run time for a reminder.
 *
 * @param frequency - How often reminder should run
 * @param scheduledForUTC - When this execution was scheduled (NOT when it actually ran)
 * @param schedule - Weekly config (required for weekly, ignored otherwise)
 * @returns ISO string in UTC, or null if reminder should be disabled
 */
export function computeNextRunAtUTC(
  frequency: ReminderFrequency,
  scheduledForUTC: string,
  schedule?: WeeklySchedule,
): string | null {
  const baseDate = new Date(scheduledForUTC);

  if (Number.isNaN(baseDate.getTime())) {
    throw new Error(
      `[computeNextRunAtUTC] Invalid scheduledForUTC: ${scheduledForUTC}`,
    );
  }

  // ONE-TIME: Run once, never again
  if (frequency === "one_time") {
    return null;
  }

  // DAILY: Simple interval - just add 24 hours
  // Uses UTC math to avoid DST issues
  if (frequency === "daily") {
    const next = new Date(baseDate);
    next.setUTCDate(next.getUTCDate() + 1);
    return next.toISOString();
  }

  // WEEKLY: Calendar-based scheduling
  // Finds next matching weekday in user's timezone, then converts back to UTC
  if (frequency === "weekly") {
    // Validate required fields
    if (
      !schedule ||
      !schedule.timezone ||
      !schedule.timeOfDay ||
      !Array.isArray(schedule.weekDays) ||
      schedule.weekDays.length === 0
    ) {
      // Missing config - caller will disable this reminder
      return null;
    }

    const { timezone, timeOfDay, weekDays } = schedule;

    // Parse time string "HH:mm"
    const [hourStr, minuteStr] = timeOfDay.split(":");
    const hour = Number(hourStr);
    const minute = Number(minuteStr);

    if (
      Number.isNaN(hour) ||
      Number.isNaN(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return null; // Invalid time format
    }

    // Convert UTC scheduled time to user's local timezone
    // This tells us what day it was in their timezone when it ran
    const executedLocal = DateTime.fromISO(scheduledForUTC, {
      zone: "utc",
    }).setZone(timezone);

    if (!executedLocal.isValid) {
      return null; // Timezone conversion failed
    }

    const currentWeekday = executedLocal.weekday; // ISO: 1=Mon, 7=Sun

    // Clean up weekdays array - remove invalid entries and sort
    const sortedDays = [...weekDays]
      .filter((d) => Number.isInteger(d) && d >= 1 && d <= 7)
      .sort((a, b) => a - b);

    if (sortedDays.length === 0) {
      return null; // No valid weekdays configured
    }

    // Find next weekday that comes AFTER the current day
    // Example: Today is Wednesday (3), selected days are [1,3,5]
    // Next run should be Friday (5), not Wednesday again
    let chosenWeekday: number | null = null;

    for (const wd of sortedDays) {
      if (wd > currentWeekday) {
        chosenWeekday = wd;
        break;
      }
    }

    let daysToAdd: number;

    if (chosenWeekday !== null) {
      // Found a day later this week
      daysToAdd = chosenWeekday - currentWeekday;
    } else {
      // No more days this week - wrap to next week's first selected day
      // Example: Today is Friday (5), selected days are [1,3]
      // Next run is Monday (1) = 7 - 5 + 1 = 3 days from now
      const first = sortedDays[0];
      daysToAdd = 7 - currentWeekday + first;
    }

    // Lock time to configured HH:mm in local timezone
    // This ensures "9:30 AM" is always "9:30 AM" in their timezone
    const localBase = executedLocal.set({
      hour,
      minute,
      second: 0,
      millisecond: 0,
    });

    // Add days to find next occurrence
    const nextLocal = localBase.plus({ days: daysToAdd });

    // Convert back to UTC for storage
    return nextLocal.toUTC().toISO();
  }

  // Shouldn't reach here unless new frequency type is added
  throw new Error(`[computeNextRunAtUTC] Unsupported frequency: ${frequency}`);
}
