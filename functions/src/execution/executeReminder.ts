/**
 * executeReminder.ts
 *
 * Purpose:
 * Executes exactly one reminder.
 * This file is the core execution brain of the system.
 *
 * Responsibilities:
 * - Enforce idempotency for reminder execution.
 * - Decide whether a reminder should run or be skipped.
 * - Route execution for simple vs AI reminders.
 * - Enforce AI cost safety rules.
 * - Delegate persistence and state updates to helpers.
 *
 * Guarantees:
 * - One reminder execution results in at most one AI call.
 * - Reminder intent is never modified here.
 * - Backend is authoritative; frontend is never trusted.
 *
 * Important:
 * - This function must not throw for normal failures.
 * - Failures are logged and contained per reminder.
 *
 * Known tradeoffs:
 * - Best-effort idempotency (not exactly-once).
 * - Counters incremented only after successful AI call.
 * - AI failures advance reminder without retry.
 */

import { QueryDocumentSnapshot } from "firebase-admin/firestore";

import { checkExecutionExists } from "./idempotency";
import { recordExecution } from "./recordExecution";
import { advanceReminder } from "./advanceReminder";
import { createDraft } from "../drafts/createDraft";
import { checkAICaps } from "../usage/checkAICaps";
import { incrementAICounters } from "../usage/incrementAICounters";
import { callAIOnce } from "../ai/callAIOnce";

/**
 * Minimal execution-time reminder shape
 */
type ReminderData = {
  enabled: boolean;
  reminderType: "simple" | "ai";
  nextRunAtUTC: string;
  frequency: "one_time" | "daily" | "weekly";
  schedule: any;
  content?: {
    message?: string;
    aiPrompt?: string;
    role?: string;
    tone?: string;
    platform?: string;
  };
};

/**
 * Extract ONLY scheduling data for advanceReminder
 */
function extractAdvanceableReminderData(reminderData: ReminderData) {
  return {
    frequency: reminderData.frequency,
    schedule: reminderData.schedule,
  };
}

/**
 * Entry point: executes exactly one reminder
 */
export async function executeReminder(
  reminderDoc: QueryDocumentSnapshot,
): Promise<void> {
  const reminderId = reminderDoc.id;
  const reminderData = reminderDoc.data() as ReminderData;

  // Authoritative UID extraction
  const uid = reminderDoc.ref.parent.parent!.id;

  const scheduledForUTC = reminderData.nextRunAtUTC;

  /**
   * 1. Disabled reminder → log + STOP
   * ❌ DO NOT advance
   */
  if (!reminderData.enabled) {
    await recordExecution({
      uid,
      reminderId,
      reminderType: reminderData.reminderType,
      scheduledForUTC,
      status: "skipped_disabled",
      aiUsed: false,
    });
    return;
  }

  /**
   * 2. Idempotency check → STOP if already executed
   * ❌ DO NOT advance
   */
  const alreadyExecuted = await checkExecutionExists(
    uid,
    reminderId,
    scheduledForUTC,
  );

  if (alreadyExecuted) {
    return;
  }

  /**
   * 3. Route by reminder type
   */
  if (reminderData.reminderType === "simple") {
    await executeSimpleReminder({
      uid,
      reminderId,
      reminderData,
      reminderDoc,
      scheduledForUTC,
    });
    return;
  }

  if (reminderData.reminderType === "ai") {
    await executeAIReminder({
      uid,
      reminderId,
      reminderData,
      reminderDoc,
      scheduledForUTC,
    });
    return;
  }

  /**
   * 4. Invalid reminder type → log + STOP
   */
  await recordExecution({
    uid,
    reminderId,
    reminderType: reminderData.reminderType,
    scheduledForUTC,
    status: "skipped_error",
    aiUsed: false,
  });
}

/* -------------------------------------------------------------------------- */
/* SIMPLE REMINDER EXECUTION                                                   */
/* -------------------------------------------------------------------------- */

async function executeSimpleReminder({
  uid,
  reminderId,
  reminderData,
  reminderDoc,
  scheduledForUTC,
}: {
  uid: string;
  reminderId: string;
  reminderData: ReminderData;
  reminderDoc: QueryDocumentSnapshot;
  scheduledForUTC: string;
}): Promise<void> {
  try {
    const content = reminderData.content?.message ?? "";

    const draftId = await createDraft({
      uid,
      reminderId,
      reminderType: "simple",
      content,
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
  } catch (error) {
    console.error("[executeReminder] Simple reminder failed", {
      reminderId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/* -------------------------------------------------------------------------- */
/* AI REMINDER EXECUTION                                                       */
/* -------------------------------------------------------------------------- */

async function executeAIReminder({
  uid,
  reminderId,
  reminderData,
  reminderDoc,
  scheduledForUTC,
}: {
  uid: string;
  reminderId: string;
  reminderData: ReminderData;
  reminderDoc: QueryDocumentSnapshot;
  scheduledForUTC: string;
}): Promise<void> {
  try {
    const caps = await checkAICaps(uid);

    /**
     * Cap hit → log + advance
     */
    if (!caps.allowed) {
      await recordExecution({
        uid,
        reminderId,
        reminderType: "ai",
        scheduledForUTC,
        status: "skipped_cap",
        aiUsed: false,
      });

      await advanceReminder({
        reminderRef: reminderDoc.ref,
        reminderData: extractAdvanceableReminderData(reminderData),
        scheduledForUTC,
      });
      return;
    }

    /**
     * AI call (ONE SHOT)
     */
    let aiContent: string;
    try {
      aiContent = await callAIOnce(buildAIPrompt(reminderData.content));
    } catch {
      await recordExecution({
        uid,
        reminderId,
        reminderType: "ai",
        scheduledForUTC,
        status: "skipped_error",
        aiUsed: false,
      });

      await advanceReminder({
        reminderRef: reminderDoc.ref,
        reminderData: extractAdvanceableReminderData(reminderData),
        scheduledForUTC,
      });
      return;
    }

    await incrementAICounters(uid);

    const draftId = await createDraft({
      uid,
      reminderId,
      reminderType: "ai",
      content: aiContent,
      scheduledForUTC,
    });

    await recordExecution({
      uid,
      reminderId,
      reminderType: "ai",
      scheduledForUTC,
      status: "executed",
      aiUsed: true,
      draftId: draftId ?? undefined,
    });

    await advanceReminder({
      reminderRef: reminderDoc.ref,
      reminderData: extractAdvanceableReminderData(reminderData),
      scheduledForUTC,
    });
  } catch (error) {
    console.error("[executeReminder] AI reminder failed", {
      reminderId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/* -------------------------------------------------------------------------- */
/* PROMPT BUILDER                                                             */
/* -------------------------------------------------------------------------- */

function buildAIPrompt(content?: {
  aiPrompt?: string;
  role?: string;
  tone?: string;
  platform?: string;
}): string {
  const parts: string[] = [];

  if (content?.aiPrompt) parts.push(content.aiPrompt);
  if (content?.role) parts.push(`Role: ${content.role}`);
  if (content?.tone) parts.push(`Tone: ${content.tone}`);
  if (content?.platform) parts.push(`Platform: ${content.platform}`);

  return parts.join("\n");
}
