/**
 * Firebase Functions entry point.
 * Initializes Admin SDK and registers all Cloud Function triggers.
 */
import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";
import { runScheduler } from "./scheduler/runScheduler";
import { onReminderCreate } from "./initializers/onReminderCreate";

admin.initializeApp();

const isEmulator = process.env.FUNCTIONS_EMULATOR === "true";

/**
 * Runs every 5 minutes in production, every 1 minute in emulator.
 * Wakes the scheduler engine—scheduling logic lives in runScheduler().
 */
export const scheduledRunScheduler = functions.pubsub
  .schedule(isEmulator ? "every 1 minutes" : "every 5 minutes")
  .onRun(async () => {
    console.log("[schedulerTrigger] fired");
    await runScheduler();
  });

// All function exports in one place for visibility
export { onReminderCreate };
