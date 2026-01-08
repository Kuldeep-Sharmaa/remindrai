// features/remindersystem/services/reminderService.js
import { DateTime } from "luxon";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../services/firebase"; // adjust path to your firebase export

/**
 * computeNextRunUTC(localSpec, zone)
 * - localSpec: { hour, minute, date? (YYYY-MM-DD) or null, recurrence: 'one-time'|'daily'|'weekly'|null, weekday? (1..7) }
 * - zone: IANA timezone string, e.g., "Asia/Kolkata"
 * Returns ISO string in UTC or null if cannot compute.
 */
function computeNextRunUTC(localSpec, zone) {
  if (!localSpec) return null;

  try {
    // One-time reminder with explicit date (YYYY-MM-DD)
    if (localSpec.date) {
      // Expect localSpec.date like "2025-10-20"
      const isoLocal = `${localSpec.date}T${String(localSpec.hour).padStart(
        2,
        "0"
      )}:${String(localSpec.minute).padStart(2, "0")}:00`;
      const dt = DateTime.fromISO(isoLocal, { zone });
      if (!dt.isValid) return null;
      return dt.toUTC().toISO();
    }

    // Recurring - compute next occurrence relative to 'now' in that zone
    const now = DateTime.now().setZone(zone);
    let candidate = DateTime.fromObject(
      { hour: localSpec.hour ?? 0, minute: localSpec.minute ?? 0, second: 0 },
      { zone }
    );

    // If weekly recurrence with weekday provided (ISO weekday 1=Mon .. 7=Sun)
    if (localSpec.recurrence === "weekly") {
      const targetWeekday =
        typeof localSpec.weekday === "number" ? localSpec.weekday : null;
      if (targetWeekday) {
        // Shift candidate to the next `targetWeekday` at the given hour/minute
        // candidate.weekday uses ISO weekday 1..7
        let diff = (targetWeekday + 7 - candidate.weekday) % 7;
        if (diff === 0 && candidate <= now) diff = 7; // same day but time passed => next week
        candidate = candidate.plus({ days: diff });
        return candidate.toUTC().toISO();
      } else {
        // fallback to next daily occurrence if weekday missing
        if (candidate <= now) candidate = candidate.plus({ days: 1 });
        return candidate.toUTC().toISO();
      }
    }

    // Daily recurrence (or unspecified recurrence - treat as daily)
    if (localSpec.recurrence === "daily" || !localSpec.recurrence) {
      if (candidate <= now) candidate = candidate.plus({ days: 1 });
      return candidate.toUTC().toISO();
    }

    // Unknown recurrence type
    return null;
  } catch (e) {
    console.error("computeNextRunUTC error:", e);
    return null;
  }
}

/**
 * recomputeRemindersForUserTimezone
 * - uid: user id
 * - newTZ: IANA timezone string (e.g., "Asia/Dubai")
 * - options:
 *    - batchSize: writes per batch (default 400)
 *    - progressCb: optional callback(updatedCount, totalToUpdate) for UI progress
 *    - limit: optional limit on how many reminders to update (for incremental update)
 *
 * Returns: { success: boolean, updated: number, skipped: number, errors: [] }
 */
export async function recomputeRemindersForUserTimezone(
  uid,
  newTZ,
  options = {}
) {
  const batchSize = options.batchSize || 400;
  const progressCb =
    typeof options.progressCb === "function" ? options.progressCb : null;
  const limit =
    typeof options.limit === "number" && options.limit > 0
      ? options.limit
      : null;

  const result = { success: true, updated: 0, skipped: 0, errors: [] };

  try {
    const remindersCol = collection(db, "reminders");
    const q = query(remindersCol, where("ownerId", "==", uid));
    const snap = await getDocs(q);

    if (snap.empty) return { ...result, success: true };

    // collect docs that are updatable (have localSpec)
    const docsToUpdate = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      // Prefer reminders that include localSpec — we rely on that structure
      if (data && data.localSpec) {
        docsToUpdate.push({ id: docSnap.id, data });
      } else {
        // legacy or incomplete reminders we skip for now (could flag for migration)
        result.skipped += 1;
      }
    });

    const total = docsToUpdate.length;
    if (total === 0) {
      if (progressCb) progressCb(0, 0);
      return result;
    }

    const actionableDocs = limit ? docsToUpdate.slice(0, limit) : docsToUpdate;
    let batch = writeBatch(db);
    let ops = 0;
    let committed = 0;

    for (let i = 0; i < actionableDocs.length; i++) {
      const { id, data } = actionableDocs[i];
      try {
        const localSpec = { ...data.localSpec }; // clone
        // compute new nextRunUTC using the NEW timezone
        const nextRunUTC = computeNextRunUTC(localSpec, newTZ);
        if (!nextRunUTC) {
          // Skip if cannot compute — do not overwrite
          result.skipped += 1;
          continue;
        }

        // Update localSpec.timezone to the new zone (keeps record consistent)
        localSpec.timezone = newTZ;

        const docRef = doc(db, "reminders", id);
        batch.update(docRef, {
          nextRunUTC,
          localSpec,
          updatedAt: serverTimestamp(),
        });
        ops++;

        // Commit if ops reach batchSize
        if (ops >= batchSize) {
          await batch.commit();
          committed += ops;
          if (progressCb) progressCb(committed, actionableDocs.length);
          // reset
          batch = writeBatch(db);
          ops = 0;
        }
        result.updated += 1;
      } catch (err) {
        console.error("Error computing/updating reminder", id, err);
        result.errors.push({ id, error: String(err?.message || err) });
      }
    }

    // commit remaining
    if (ops > 0) {
      await batch.commit();
      committed += ops;
      if (progressCb) progressCb(committed, actionableDocs.length);
    }

    return result;
  } catch (err) {
    console.error("recomputeRemindersForUserTimezone failed:", err);
    return {
      ...result,
      success: false,
      errors: [{ message: String(err?.message || err) }],
    };
  }
}
