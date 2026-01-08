/**
 * schedulerTrigger.js
 * ---------------------------------------------
 * Purpose:
 *   - Entrypoint that scheduler (Cloud Scheduler / PubSub) calls to run due reminders.
 *
 * Responsibilities / Contents:
 *   - Receive a job payload (reminderId, runAt) and forward to schedulerWorker.
 *   - Validate payload shape, log, and return quick HTTP 200 for scheduler.
 *
 * Invariants & Guarantees:
 *   - Keep trigger idempotent — scheduler may retry.
 *   - Minimal work here; heavy lifting in schedulerWorker.
 *
 * When to update / modify this file:
 *   - When changing scheduler payload or adding security (signed tokens).
 * ---------------------------------------------
 */

import { info, error } from "../libs/logger.js";
import { runWorkerForReminder } from "./schedulerWorker.js";

/**
 * Example HTTP handler (Cloud Run / Express)
 * payload: { uid, reminderId, runAtIso }
 */
export async function schedulerHttpHandler(req, res) {
  try {
    const body = req.body || {};
    const { uid, reminderId, runAtIso } = body;
    if (!uid || !reminderId) {
      res.status(400).json({ error: "uid and reminderId are required" });
      return;
    }
    // Fire-and-forget the worker (but await small validation)
    runWorkerForReminder({ uid, reminderId, runAtIso }).catch((err) =>
      error("Worker failed", { err: err?.message, uid, reminderId })
    );
    res.status(200).json({ status: "accepted" });
  } catch (err) {
    error("schedulerHttpHandler error", { err: err?.message });
    res.status(500).json({ error: "internal" });
  }
}

export default schedulerHttpHandler;
