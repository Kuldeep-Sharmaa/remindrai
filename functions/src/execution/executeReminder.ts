import { QueryDocumentSnapshot } from "firebase-admin/firestore";

import { checkExecutionExists } from "./idempotency";
import { recordExecution } from "./recordExecution";
import { advanceReminder } from "./advanceReminder";
import { createDraft } from "../drafts/createDraft";
import { sendPushNotification } from "../notifications/sendPushNotification";
import { fetchPastDrafts } from "../drafts/fetchPastDrafts";
import { buildPrompt } from "../ai/buildPrompt";
import { callAIOnce } from "../ai/callAIOnce";
import { mapRole, mapTone, mapPlatform } from "../ai/promptMappings";

type ReminderData = {
  enabled: boolean;
  nextRunAtUTC: string;
  frequency: "one_time" | "daily" | "weekly";
  schedule: any;
  reminderType: "ai" | "simple";
  content?: {
    role?: string;
    tone?: string;
    platform?: string;
    aiPrompt?: string; // only on ai prompts
    message?: string; // only on simple notes
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

  // uid is on the parent collection, not stored in the reminder doc itself
  const uid = reminderDoc.ref.parent.parent!.id;

  const scheduledForUTC = reminderData.nextRunAtUTC;
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
    let draftContent: string;
    let aiUsed = false;

    if (reminderType === "ai") {
      // no prompt means nothing to generate from — fail early
      if (!reminderData.content?.aiPrompt?.trim()) {
        throw new Error("Missing aiPrompt for AI reminder");
      }

      let drafts: string[] = [];

      try {
        drafts = await fetchPastDrafts(uid, 2);
      } catch {
        // memory failing shouldn't kill the whole execution
        drafts = [];
      }

      // need at least 2 drafts to get a reliable style signal
      const pastDrafts = drafts.length >= 2 ? drafts : undefined;

      const prompt = buildPrompt({
        aiPrompt: reminderData.content?.aiPrompt,
        role: mapRole(reminderData.content?.role),
        tone: mapTone(reminderData.content?.tone),
        platform: mapPlatform(reminderData.content?.platform),
        pastDrafts,
      });

      draftContent = await callAIOnce(prompt);
      aiUsed = true;
    } else {
      draftContent = reminderData.content?.message?.trim() || "Reminder";
    }

    const draftId = await createDraft({
      uid,
      reminderId,
      reminderType,
      content: draftContent,
      scheduledForUTC,
    });

    await recordExecution({
      uid,
      reminderId,
      reminderType,
      scheduledForUTC,
      status: "executed",
      aiUsed,
      draftId: draftId ?? undefined,
    });

    await advanceReminder({
      reminderRef: reminderDoc.ref,
      reminderData: extractAdvanceableReminderData(reminderData),
      scheduledForUTC,
    });

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
      reminderType,
      error: error instanceof Error ? error.message : String(error),
    });

    // execution failed — still notify the user so they're not left waiting
    await sendPushNotification({
      uid,
      type: "draft_failed",
    }).catch(() => {});
  }
}
