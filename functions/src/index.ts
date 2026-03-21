import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineString } from "firebase-functions/params";

import { runScheduler } from "./scheduler/runScheduler";
import { onReminderCreate } from "./initializers/onReminderCreate";

admin.initializeApp();

const isEmulator = process.env.FUNCTIONS_EMULATOR === "true";

// pause the scheduler without redeploying — just flip this in Firebase config
const SCHEDULER_ENABLED = defineString("SCHEDULER_ENABLED", {
  default: "true",
});

// had to move to v2 specifically for secrets injection — v1 doesn't support it
export const scheduledRunScheduler = onSchedule(
  {
    schedule: isEmulator ? "every 1 minutes" : "every 5 minutes",
    region: "us-central1",
    secrets: ["OPENAI_API_KEY"],
  },
  async () => {
    if (SCHEDULER_ENABLED.value() !== "true") {
      console.log("[schedulerTrigger] Scheduler disabled. Skipping run.");
      return;
    }

    console.log("[schedulerTrigger] fired");
    await runScheduler();
  },
);

// these don't need secrets so they stay on v1
export { onReminderCreate };
export { deleteReminder } from "./tools/deleteReminder";
