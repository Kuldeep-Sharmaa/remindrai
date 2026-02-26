// functions/src/utils/initialSchedule.ts
import { DateTime } from "luxon";

type ReminderFrequency = "one_time" | "daily" | "weekly";

interface Schedule {
  date?: string;
  timeOfDay: string;
  timezone: string;
  weekDays?: number[]; // ISO 1..7
}

export function computeInitialNextRunAtUTC(
  frequency: ReminderFrequency,
  schedule: Schedule,
): string | null {
  const { date, timeOfDay, timezone, weekDays } = schedule;

  if (!frequency || !timeOfDay || !timezone) {
    return null;
  }

  const [hourStr, minuteStr] = timeOfDay.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  // ─────────────────────────────
  // ONE-TIME
  // ─────────────────────────────
  if (frequency === "one_time") {
    if (!date) return null;

    const local = DateTime.fromISO(`${date}T${timeOfDay}`, {
      zone: timezone,
    });

    if (!local.isValid) return null;

    return local.toUTC().toISO();
  }

  const nowLocal = DateTime.now().setZone(timezone);

  // ─────────────────────────────
  // DAILY
  // ─────────────────────────────
  if (frequency === "daily") {
    let candidate = nowLocal
      .startOf("day")
      .set({ hour, minute, second: 0, millisecond: 0 });

    if (candidate <= nowLocal) {
      candidate = candidate.plus({ days: 1 });
    }

    return candidate.toUTC().toISO();
  }

  // ─────────────────────────────
  // WEEKLY (calendar-based)
  // ─────────────────────────────
  if (frequency === "weekly") {
    if (!Array.isArray(weekDays) || weekDays.length === 0) {
      return null; // invalid weekly configuration
    }

    const sortedDays = [...weekDays].sort((a, b) => a - b);
    const todayWeekday = nowLocal.weekday;

    let bestCandidate: DateTime | null = null;

    for (const targetWeekday of sortedDays) {
      let delta = targetWeekday - todayWeekday;
      if (delta < 0) delta += 7;

      let candidateDate = nowLocal.plus({ days: delta }).startOf("day");

      let candidate = candidateDate.set({
        hour,
        minute,
        second: 0,
        millisecond: 0,
      });

      // If same weekday but time already passed → move to next week
      if (delta === 0 && candidate <= nowLocal) {
        candidate = candidate.plus({ days: 7 });
      }

      if (!bestCandidate || candidate < bestCandidate) {
        bestCandidate = candidate;
      }
    }

    return bestCandidate ? bestCandidate.toUTC().toISO() : null;
  }

  return null;
}
