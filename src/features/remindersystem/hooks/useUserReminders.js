/**
 * useUserReminders.js
 *
 * Fetches and normalizes user reminders from Firestore.
 * Handles timestamp conversion, deduplication, and categorization.
 * Filters out deleted reminders from all views.
 */

import { useMemo } from "react";
import { collection } from "firebase/firestore";
import { useCollection } from "../../../hooks/useCollection";
import { db } from "../../../services/firebase";
import { DateTime } from "luxon";

/**
 * Convert various timestamp formats to milliseconds (UTC) using Luxon.
 */
function toMillis(val) {
  if (val === undefined || val === null) return null;

  // Firestore Timestamp
  if (typeof val === "object" && typeof val.toMillis === "function") {
    try {
      const m = Number(val.toMillis());
      return Number.isFinite(m) ? m : null;
    } catch {
      return null;
    }
  }

  // Date object
  if (val instanceof Date) {
    const t = val.getTime();
    return Number.isFinite(t) ? t : null;
  }

  // Numeric timestamp
  if (typeof val === "number" && Number.isFinite(val)) {
    if (val > 1e12) return val; // Already in milliseconds
    if (val > 1e9) return val * 1000; // Convert seconds to ms
    return null;
  }

  // String timestamp
  if (typeof val === "string") {
    const num = Number(val);
    if (!Number.isNaN(num)) {
      if (num > 1e12) return num;
      if (num > 1e9) return num * 1000;
    }

    // ISO format
    const dt = DateTime.fromISO(val, { zone: "utc" });
    if (dt.isValid) return dt.toMillis();

    // RFC2822 format
    const dt2 = DateTime.fromRFC2822(val, { zone: "utc" });
    if (dt2.isValid) return dt2.toMillis();

    // Custom format
    const dt3 = DateTime.fromFormat(val, "yyyy-LL-dd'T'HH:mm:ss", {
      zone: "utc",
    });
    if (dt3.isValid) return dt3.toMillis();
  }

  return null;
}

/**
 * Normalize raw reminder document into canonical shape.
 */
function normalizeReminder(raw) {
  if (!raw || typeof raw !== "object") return null;

  const id =
    raw.id ||
    raw._id ||
    raw.reminderId ||
    (raw.meta && raw.meta.idempotencyKey) ||
    null;

  const rawType = String(raw?.reminderType || raw?.type || "")
    .trim()
    .toLowerCase();
  const reminderType =
    rawType === "ai" ? "ai" : rawType === "simple" ? "simple" : "other";

  const deleted = !!raw?.deletedAt;
  const enabled = raw?.enabled === undefined ? true : Boolean(raw.enabled);
  const status = String(raw?.status || "").toLowerCase();

  const completed =
    !deleted &&
    (raw?.completed === true ||
      raw?.isDone === true ||
      status === "completed" ||
      status === "done" ||
      enabled === false);

  // Find nextRunAtUTC from various possible field names
  const nextCandidates = [
    raw?.nextRunAtUTC,
    raw?.nextRunAtUTC_iso,
    raw?.nextRunUtc,
    raw?.nextRun,
    raw?.next_run,
    raw?.schedule?.nextRun,
    raw?.schedule?.nextRunAtUTC,
    null,
  ];

  let nextRunMillis = null;
  for (const c of nextCandidates) {
    const m = toMillis(c);
    if (m !== null) {
      nextRunMillis = m;
      break;
    }
  }

  const createdAtMillis = toMillis(raw?.createdAt);
  const updatedAtMillis = toMillis(raw?.updatedAt);

  return {
    id,
    reminderType,
    enabled,
    deleted,
    completed,
    nextRunMillis,
    createdAtMillis,
    updatedAtMillis,
    raw,
  };
}

export default function useUserReminders(userId) {
  const remindersQuery = useMemo(() => {
    if (!userId) return null;
    return collection(db, "users", userId, "reminders");
  }, [userId]);

  const {
    documents: reminders,
    isPending: isLoadingReminders,
    error: remindersError,
  } = useCollection(remindersQuery);

  const derived = useMemo(() => {
    const list = Array.isArray(reminders) ? reminders : [];

    const aiReminders = [];
    const simpleReminders = [];
    const otherReminders = [];
    const activeReminders = [];
    const completedReminders = [];

    let malformedCount = 0;
    const seenIds = new Set();
    let total = 0;

    for (const raw of list) {
      // Exclude deleted reminders from all views
      const n = normalizeReminder(raw);
      if (!n || n.deleted) continue;

      let id = n.id;
      if (!id) {
        id = `__noid__:${
          n.createdAtMillis || Math.random().toString(36).slice(2, 9)
        }`;
      }

      if (seenIds.has(id)) continue;
      seenIds.add(id);
      total++;

      // Categorize by type
      if (n.reminderType === "ai") aiReminders.push(n);
      else if (n.reminderType === "simple") simpleReminders.push(n);
      else otherReminders.push(n);

      // Categorize by status
      if (n.enabled && !n.completed) {
        activeReminders.push(n);
      } else {
        completedReminders.push(n);
      }
    }

    // Find next scheduled reminder
    let nextRun = null;
    if (activeReminders.length > 0) {
      const withNext = activeReminders.filter(
        (r) => typeof r.nextRunMillis === "number",
      );
      if (withNext.length > 0) {
        let min = withNext[0];
        for (let i = 1; i < withNext.length; i++) {
          if (withNext[i].nextRunMillis < min.nextRunMillis) min = withNext[i];
        }
        nextRun = min;
      } else {
        nextRun = activeReminders[0];
      }
    }

    return {
      totalReminders: total,
      aiReminders,
      simpleReminders,
      otherReminders,
      aiCount: aiReminders.length,
      simpleCount: simpleReminders.length,
      otherCount: otherReminders.length,
      activeReminders,
      completedReminders,
      activeCount: activeReminders.length,
      completedCount: completedReminders.length,
      nextRun,
      isEmpty: total === 0,
      malformedCount,
    };
  }, [reminders]);

  return {
    reminders,
    isLoadingReminders: !!isLoadingReminders,
    remindersError,
    totalReminders: derived.totalReminders,
    aiReminders: derived.aiReminders,
    simpleReminders: derived.simpleReminders,
    otherReminders: derived.otherReminders,
    aiCount: derived.aiCount,
    simpleCount: derived.simpleCount,
    otherCount: derived.otherCount,
    activeReminders: derived.activeReminders,
    completedReminders: derived.completedReminders,
    activeCount: derived.activeCount,
    completedCount: derived.completedCount,
    nextRun: derived.nextRun,
    isEmpty: derived.isEmpty,
    malformedCount: derived.malformedCount,
  };
}
