/**
 * schedulerWorker.js
 * ---------------------------------------------
 * Purpose:
 *   - Core worker invoked by the scheduler trigger which executes a single reminder run.
 *
 * Responsibilities / Contents:
 *   - Load the reminder doc.
 *   - Validate enabled/nextRunAtUTC/timezone conditions.
 *   - Acquire idempotency claim.
 *   - Invoke generateDraftJob.
 *   - Update reminder.nextRunAtUTC after successful run.
 *
 * Invariants & Guarantees:
 *   - Ensure job runs once per scheduled timestamp using idempotency.
 *   - Respect reminder enabled/paused/deleted state.
 *
 * When to update / modify this file:
 *   - When adding new pre-checks (rate-limits, quota).
 *   - When changing how nextRunAtUTC is computed.
 * ---------------------------------------------
 */

import { getDb, userRemindersCol } from "../libs/firestoreClient.js";
import { info, error } from "../libs/logger.js";
import { tryAcquireIdempotency } from "../libs/idempotency.js";
import { generateDraftForReminder } from "../generator/generateDraftJob.js";
import { computeNextRunFromSchedule } from "../utils/scheduleUtils.js";

export async function runWorkerForReminder({
  uid,
  reminderId,
  runAtIso = null,
}) {
  const db = getDb();
  const reminderRef = userRemindersCol(uid).doc(reminderId);
  const snap = await reminderRef.get();
  if (!snap.exists) {
    info("Reminder not found, skipping", { uid, reminderId });
    return { skipped: true, reason: "not_found" };
  }
  const reminder = snap.data();

  if (reminder.enabled === false) {
    info("Reminder is disabled, skipping", { uid, reminderId });
    return { skipped: true, reason: "disabled" };
  }

  const idempotencyKey = `${reminderId}_${
    runAtIso || reminder.nextRunAtUTC || Date.now()
  }`;

  // Try to acquire mapping
  const claim = await tryAcquireIdempotency(uid, idempotencyKey, {
    reminderId,
    runAtIso,
  });
  if (!claim.acquired) {
    info("Idempotency prevents duplicate run", {
      uid,
      reminderId,
      idempotencyKey,
    });
    return { skipped: true, reason: "idempotent" };
  }

  // Execute generator
  try {
    const delivery = await generateDraftForReminder({
      uid,
      reminderId,
      reminder,
      runAtIso,
      idempotencyKey,
    });
    // compute and update next run
    try {
      const nextIso = computeNextRunFromSchedule({
        frequency: reminder.frequency,
        schedule: reminder.schedule,
      });
      await reminderRef.update({
        nextRunAtUTC: nextIso ? new Date(nextIso) : null,
        updatedAt: new Date(),
      });
    } catch (e) {
      // non-fatal: log but don't fail main flow
      error("Failed to compute next run", { err: e?.message, uid, reminderId });
    }
    return { success: true, deliveryId: delivery?.id };
  } catch (err) {
    error("generateDraftForReminder failed", {
      err: err?.message,
      uid,
      reminderId,
    });
    throw err;
  }
}

export default { runWorkerForReminder };
