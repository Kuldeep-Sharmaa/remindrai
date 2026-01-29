/**
 * runScheduler.ts
 *
 * Scheduler engine. Finds and executes due reminders in a single sweep.
 * Does not manage its own timing—called by a scheduler trigger.
 */

import * as admin from "firebase-admin";
import { executeReminder } from "../execution/executeReminder";

// Safe init fallback
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Runs one scheduler sweep.
 */
export async function runScheduler() {
  const startTime = Date.now();
  console.log("[runScheduler] Run started", {
    actualTime: new Date().toISOString(),
  });

  try {
    const nowUTC = new Date().toISOString();

    // Find due reminders across all users
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

    let successCount = 0;
    let errorCount = 0;

    for (const reminderDoc of remindersSnapshot.docs) {
      try {
        console.log("[runScheduler] Processing reminder", {
          reminderId: reminderDoc.id,
          reminderPath: reminderDoc.ref.path,
        });

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

    console.log("[runScheduler] Run completed", {
      totalProcessed: remindersSnapshot.size,
      successCount,
      errorCount,
      durationMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error("[runScheduler] Run failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
