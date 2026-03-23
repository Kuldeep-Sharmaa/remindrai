// AI is fully wired — just needs the API key in Secret Manager to go live

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
import { checkDraftLimit } from "../drafts/checkDraftLimit";

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
    aiPrompt?: string; // only on ai reminders
    message?: string; // only on simple reminders
  };
};

function extractAdvanceableReminderData(reminderData: ReminderData) {
  return {
    frequency: reminderData.frequency,
    schedule: reminderData.schedule,
  };
}

// frontend catches this first — but we check again here because we can't
// trust that every reminder was saved through the current frontend version
function isWeakInput(text?: string): boolean {
  if (!text) return true;

  const clean = text.trim();

  if (clean.length < 5) return true;

  // single long word with no spaces = keyboard mash
  if (!clean.includes(" ") && clean.length > 12) return true;

  // needs at least 2 words — "asdasd bug" still passes otherwise
  const words = clean.split(/\s+/);
  if (words.length < 2) return true;

  // repeated single character e.g. "aaaaaaaaaaaaaaa"
  if (/^(.)\1+$/.test(clean)) return true;

  // mostly non-letter characters
  const alphaRatio = clean.replace(/[^a-zA-Z]/g, "").length / clean.length;
  if (alphaRatio < 0.5) return true;

  // at least 1 word must look real (3+ chars with a vowel)
  // catches "kdvkd d d d d" and "idvisdjifoifa kdvkd" style garbage
  const hasVowel = /[aeiouAEIOU]/;
  const realWordCount = words.filter(
    (w) => w.length >= 3 && hasVowel.test(w),
  ).length;
  if (realWordCount === 0) return true;

  // real English has ~35%+ vowels — keyboard mash has almost none
  // threshold at 0.12 to catch obvious garbage without blocking real short inputs
  const vowelCount = clean.replace(/[^aeiouAEIOU]/g, "").length;
  const vowelRatio = vowelCount / clean.replace(/\s/g, "").length;
  if (vowelRatio < 0.12) return true;

  return false;
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
      const aiPrompt = reminderData.content?.aiPrompt;

      // no prompt = nothing to generate from
      if (!aiPrompt?.trim()) {
        throw new Error("Missing aiPrompt for AI reminder");
      }

      // garbage input — skip AI, advance so it doesn't re-fire every 5 mins
      if (isWeakInput(aiPrompt)) {
        console.warn(
          "[executeReminder] Weak input detected — skipping AI call",
          {
            uid,
            reminderId,
          },
        );

        await recordExecution({
          uid,
          reminderId,
          reminderType,
          scheduledForUTC,
          status: "skipped",
          aiUsed: false,
          reason: "weak_input",
        });

        await advanceReminder({
          reminderRef: reminderDoc.ref,
          reminderData: extractAdvanceableReminderData(reminderData),
          scheduledForUTC,
        });

        return;
      }

      // check rolling 24h limit before making any AI call
      const { limited, count } = await checkDraftLimit(uid);

      if (limited) {
        console.warn("[executeReminder] Draft limit reached — skipping", {
          uid,
          reminderId,
          count,
        });

        await recordExecution({
          uid,
          reminderId,
          reminderType,
          scheduledForUTC,
          status: "skipped_limit",
          aiUsed: false,
          reason: "draft_limit_reached",
        });

        await advanceReminder({
          reminderRef: reminderDoc.ref,
          reminderData: extractAdvanceableReminderData(reminderData),
          scheduledForUTC,
        });

        return;
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
        aiPrompt,
        role: mapRole(reminderData.content?.role),
        tone: mapTone(reminderData.content?.tone),
        platform: mapPlatform(reminderData.content?.platform),
        pastDrafts,
      });

      draftContent = await callAIOnce(prompt);

      // AI occasionally returns very short or empty content — don't save garbage
      if (!draftContent || draftContent.trim().length < 20) {
        throw new Error("AI returned empty or invalid content");
      }

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
