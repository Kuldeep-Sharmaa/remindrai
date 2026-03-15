/**
 * executeReminder.ts (TEMP — INFRASTRUCTURE TEST MODE)
 *
 * This is the temporary version used to validate the scheduler infrastructure.
 * No AI calls, no cost logic — just a dummy draft to confirm the pipeline works.
 *
 * Real AI execution will replace the dummy draft logic once infra is confirmed.
 * The notification hooks below are already wired for the final version too,
 * so nothing here needs to change when we swap in the real AI logic.
 */

import { QueryDocumentSnapshot } from "firebase-admin/firestore";

import { checkExecutionExists } from "./idempotency";
import { recordExecution } from "./recordExecution";
import { advanceReminder } from "./advanceReminder";
import { createDraft } from "../drafts/createDraft";
import { sendPushNotification } from "../notifications/sendPushNotification";

type ReminderData = {
  enabled: boolean;
  nextRunAtUTC: string;
  frequency: "one_time" | "daily" | "weekly";
  schedule: any;
  reminderType: "ai" | "simple";
  content?: {
    platform?: string;
  };
};

function extractAdvanceableReminderData(reminderData: ReminderData) {
  return {
    frequency: reminderData.frequency,
    schedule: reminderData.schedule,
  };
}

export async function executeReminder(
  reminderDoc: QueryDocumentSnapshot,
): Promise<void> {
  console.log("[executeReminder] START", {
    path: reminderDoc.ref.path,
  });

  const reminderId = reminderDoc.id;
  const reminderData = reminderDoc.data() as ReminderData;

  // Authoritative UID extraction
  const uid = reminderDoc.ref.parent.parent!.id;

  const scheduledForUTC = reminderData.nextRunAtUTC;

  // Pull reminder context for smarter notification text
  const reminderType = reminderData.reminderType;
  const platform = reminderData.content?.platform;

  if (!reminderData.enabled) {
    return;
  }

  const alreadyExecuted = await checkExecutionExists(
    uid,
    reminderId,
    scheduledForUTC,
  );

  if (alreadyExecuted) {
    return;
  }

  try {
    const draftId = await createDraft({
      uid,
      reminderId,
      reminderType: "simple",
      content:
        "This is a dummy draft created for infrastructure testing purposes. its not real LLM content. API is not called. If you see this, it means the backend scheduler infrastructure is working! Congrats! 🎉",
      scheduledForUTC,
    });

    await recordExecution({
      uid,
      reminderId,
      reminderType: "simple",
      scheduledForUTC,
      status: "executed",
      aiUsed: false,
      draftId: draftId ?? undefined,
    });

    await advanceReminder({
      reminderRef: reminderDoc.ref,
      reminderData: extractAdvanceableReminderData(reminderData),
      scheduledForUTC,
    });

    // Send notification based on draft creation result
    if (draftId) {
      await sendPushNotification({
        uid,
        type: "draft_success",
        draftId,
        reminderType,
        platform,
      }).catch(() => {});
    } else {
      await sendPushNotification({
        uid,
        type: "draft_failed",
      }).catch(() => {});
    }
  } catch (error) {
    console.error("[executeReminder] Execution failed", {
      uid,
      reminderId,
      error: error instanceof Error ? error.message : String(error),
    });

    // Something broke hard — make sure the user still hears about it
    await sendPushNotification({
      uid,
      type: "draft_failed",
    }).catch(() => {});
  }
}
