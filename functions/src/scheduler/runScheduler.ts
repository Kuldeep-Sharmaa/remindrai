/**
 * runScheduler.js
 *
 * Purpose:
 * Entry point triggered by Cloud Scheduler every 5 minutes.
 * This function scans Firestore for reminders that are due and
 * dispatches them one by one for execution.
 *
 * Responsibilities:
 * - Query all users' reminders that are enabled and due.
 * - Process reminders sequentially in small batches.
 * - Delegate execution logic to executeReminder.
 *
 * Guarantees:
 * - This function is intentionally dumb and best-effort.
 * - It does not perform AI calls or business logic.
 * - It may be retried by Cloud Scheduler, which is expected.
 *
 * When to modify:
 * - If batch size changes.
 * - If scheduling frequency changes.
 * - If reminder selection rules change.
 */

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { executeReminder } from "../execution/executeReminder";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Cloud Scheduler entry point.
 * Runs every 5 minutes to process due reminders.
 */
export const runScheduler = functions.pubsub
  .schedule("every 5 minutes")
  .onRun(async () => {
    const startTime = Date.now();
    console.log("[runScheduler] Run started", {
      actualTime: new Date().toISOString(),
    });

    try {
      const nowUTC = new Date().toISOString();

      // Query for due reminders across all users
      // Requires composite index: (enabled ASC, nextRunAtUTC ASC)
      const remindersSnapshot = await db
        .collectionGroup("reminders")
        .where("enabled", "==", true)
        .where("nextRunAtUTC", "<=", nowUTC)
        .orderBy("nextRunAtUTC", "asc")
        .limit(20)
        .get();

      console.log("[runScheduler] Found due reminders", {
        count: remindersSnapshot.size,
      });

      // Process reminders sequentially
      let successCount = 0;
      let errorCount = 0;

      for (const reminderDoc of remindersSnapshot.docs) {
        try {
          console.log("[runScheduler] Processing reminder", {
            reminderId: reminderDoc.id,
            reminderPath: reminderDoc.ref.path,
          });

          // Delegate execution to executeReminder
          await executeReminder(reminderDoc);

          successCount++;
        } catch (error) {
          errorCount++;
          console.error("[runScheduler] Error processing reminder", {
            reminderId: reminderDoc.id,
            reminderPath: reminderDoc.ref.path,
            error: error instanceof Error ? error.message : String(error),
          });
          // Continue processing other reminders
        }
      }

      const durationMs = Date.now() - startTime;
      console.log("[runScheduler] Run completed", {
        totalProcessed: remindersSnapshot.size,
        successCount,
        errorCount,
        durationMs,
      });
    } catch (error) {
      const durationMs = Date.now() - startTime;
      console.error("[runScheduler] Run failed", {
        error: error instanceof Error ? error.message : String(error),
        durationMs,
      });
      throw error; // Let Cloud Functions handle the error
    }
  });
