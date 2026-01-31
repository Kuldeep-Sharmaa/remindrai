import { DateTime } from "luxon";

type ReminderFrequency = "one_time" | "daily" | "weekly";

interface Schedule {
  date?: string;
  timeOfDay: string;
  timezone: string;
}

export function computeInitialNextRunAtUTC(
  frequency: ReminderFrequency,
  schedule: Schedule,
): string | null {
  const { date, timeOfDay, timezone } = schedule;

  if (!frequency || !timeOfDay || !timezone) {
    return null;
  }

  // ONE-TIME
  if (frequency === "one_time") {
    if (!date) return null;

    const local = DateTime.fromISO(`${date}T${timeOfDay}`, { zone: timezone });

    if (!local.isValid) return null;

    return local.toUTC().toISO();
  }

  // DAILY / WEEKLY
  const nowLocal = DateTime.now().setZone(timezone);

  let candidate = DateTime.fromISO(`${nowLocal.toISODate()}T${timeOfDay}`, {
    zone: timezone,
  });

  if (!candidate.isValid) return null;

  // If the time has already passed today, move to the next day
  if (candidate <= nowLocal) {
    candidate = candidate.plus({ days: 1 });
  }

  return candidate.toUTC().toISO();
}
