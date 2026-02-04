/**
 * Firebase Functions entry point.
 * Initializes Admin SDK and registers all Cloud Function triggers.
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";
import { defineString } from "firebase-functions/params";

import { runScheduler } from "./scheduler/runScheduler";
import { onReminderCreate } from "./initializers/onReminderCreate";

admin.initializeApp();

const isEmulator = process.env.FUNCTIONS_EMULATOR === "true";

/**
 * Scheduler kill switch. Default: disabled
 */
const SCHEDULER_ENABLED = defineString("SCHEDULER_ENABLED", {
  default: "false",
});

/**
 * Runs every 5 minutes in production, every 1 minute in emulator.
 * Wakes the scheduler engine — scheduling logic lives in runScheduler().
 */
export const scheduledRunScheduler = functions.pubsub
  .schedule(isEmulator ? "every 1 minutes" : "every 5 minutes")
  .onRun(async () => {
    if (SCHEDULER_ENABLED.value() !== "true") {
      console.log("[schedulerTrigger] Scheduler disabled. Skipping run.");
      return;
    }

    console.log("[schedulerTrigger] fired");
    await runScheduler();
  });

// All function exports in one place for visibility
export { onReminderCreate };
export { deleteReminder } from "./tools/deleteReminder";
