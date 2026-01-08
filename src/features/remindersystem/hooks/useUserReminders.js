// src/features/remindersystem/hooks/useUserReminders.js
// Production-grade, Luxon-enabled normalization + aggregation for reminders.
// - Normalizes timestamps to nextRunMillis (ms UTC) using Luxon
// - Dedupe by id / meta.idempotencyKey with fallback
// - Robust completed detection (permissive)
// - Exposes otherReminders & malformedCount for diagnostics
// - Keeps 'reminders' (raw) for backward compatibility

import { useMemo } from "react";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection } from "../../../hooks/useCollection";
import { db } from "../../../services/firebase";
import { DateTime } from "luxon"; // using Luxon (app already includes it)

/**
 * Convert various timestamp representations into milliseconds (UTC) using Luxon.
 * Returns null when parsing fails.
 * Accepts:
 *  - Firestore Timestamp objects (with toMillis)
 *  - number (seconds or ms)
 *  - ISO string
 *  - Date object
 */
function toMillis(val) {
  if (val === undefined || val === null) return null;

  // Firestore Timestamp (has toMillis)
  if (typeof val === "object" && typeof val.toMillis === "function") {
    try {
      const m = Number(val.toMillis());
      return Number.isFinite(m) ? m : null;
    } catch {
      return null;
    }
  }

  // Date
  if (val instanceof Date) {
    const t = val.getTime();
    return Number.isFinite(t) ? t : null;
  }

  // number (seconds or ms)
  if (typeof val === "number" && Number.isFinite(val)) {
    // heuristic: treat > 1e12 as ms, >1e9 as seconds
    if (val > 1e12) return val;
    if (val > 1e9) return val * 1000;
    return null;
  }

  // string
  if (typeof val === "string") {
    // numeric string?
    const num = Number(val);
    if (!Number.isNaN(num)) {
      if (num > 1e12) return num;
      if (num > 1e9) return num * 1000;
    }

    // try ISO parsing with Luxon (assume UTC if no zone)
    const dt = DateTime.fromISO(val, { zone: "utc" });
    if (dt.isValid) return dt.toMillis();

    // try RFC or general parse
    const dt2 = DateTime.fromRFC2822(val, { zone: "utc" });
    if (dt2.isValid) return dt2.toMillis();

    // fallback: let Luxon try generic parsing
    const dt3 = DateTime.fromFormat(val, "yyyy-LL-dd'T'HH:mm:ss", {
      zone: "utc",
    });
    if (dt3.isValid) return dt3.toMillis();
  }

  return null;
}

/**
 * Normalize a raw reminder doc into canonical shape:
 * { id, reminderType, enabled, completed, nextRunMillis, createdAtMillis, updatedAtMillis, raw }
 */
function normalizeReminder(raw) {
  if (!raw || typeof raw !== "object") return null;

  // stable id candidates
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

  // enabled: permissive default true
  const enabled = raw?.enabled === undefined ? true : Boolean(raw.enabled);

  // completed heuristics (permissive)
  const status = String(raw?.status || "").toLowerCase();
  const completed =
    raw?.completed === true ||
    raw?.isDone === true ||
    status === "completed" ||
    status === "done" ||
    raw?.enabled === false ||
    false;

  // nextRun candidates (try common field names)
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
    completed,
    nextRunMillis,
    createdAtMillis,
    updatedAtMillis,
    raw,
  };
}

export default function useUserReminders(userId) {
  // Build query preferring nextRunAtUTC ascending
  const remindersQuery = useMemo(() => {
    if (!userId) return null;
    try {
      return query(
        collection(db, "users", userId, "reminders"),
        orderBy("nextRunAtUTC", "asc")
      );
    } catch (err) {
      // fail-safe fallback
      // eslint-disable-next-line no-console
      console.warn(
        "useUserReminders: unable to orderBy(nextRunAtUTC), falling back to createdAt desc. Error:",
        err?.message || err
      );
      try {
        return query(
          collection(db, "users", userId, "reminders"),
          orderBy("createdAt", "desc")
        );
      } catch (e2) {
        // eslint-disable-next-line no-console
        console.error("useUserReminders: failed to create fallback query:", e2);
        return null;
      }
    }
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
      const n = normalizeReminder(raw);
      if (!n) {
        malformedCount++;
        continue;
      }

      // ensure id, build weak fallback if missing
      let id = n.id;
      if (!id) {
        // weak fallback id (non-ideal). Log once for debugging.
        id = `__noid__:${
          n.createdAtMillis || Math.random().toString(36).slice(2, 9)
        }`;
        // eslint-disable-next-line no-console
        console.warn(
          "useUserReminders: reminder without stable id found — created fallback id:",
          id
        );
      }

      if (seenIds.has(id)) continue; // dedupe
      seenIds.add(id);
      total++;

      // classify types
      if (n.reminderType === "ai") aiReminders.push(n);
      else if (n.reminderType === "simple") simpleReminders.push(n);
      else otherReminders.push(n);

      // active vs completed (enabled + not completed => active)
      if (n.enabled && !n.completed) {
        activeReminders.push(n);
      } else {
        completedReminders.push(n);
      }
    }

    // nextRun: earliest nextRunMillis among activeReminders (numeric compare)
    let nextRun = null;
    if (activeReminders.length > 0) {
      const withNext = activeReminders.filter(
        (r) => typeof r.nextRunMillis === "number"
      );
      if (withNext.length > 0) {
        // find minimum
        let min = withNext[0];
        for (let i = 1; i < withNext.length; i++) {
          if (withNext[i].nextRunMillis < min.nextRunMillis) min = withNext[i];
        }
        nextRun = min; // normalized object (includes nextRunMillis)
      } else {
        // fallback to first active reminder (query order)
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
    reminders, // raw snapshot (backwards compatibility)
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
