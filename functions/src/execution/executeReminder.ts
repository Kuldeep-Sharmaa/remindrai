/**
 * executeReminder.ts (TEMP — INFRASTRUCTURE TEST MODE)
 *
 * Purpose:
 * Execute a reminder in the simplest, safest way possible
 * to validate backend scheduler infrastructure.
 *
 * What this file does:
 * - Enforces idempotency
 * - Creates exactly ONE dummy draft
 * - Advances reminder state
 *
 * What this file DOES NOT do:
 * - No AI calls
 * - No cost logic
 * - No retries
 * - No branching by reminder type
 *
 * IMPORTANT:
 * This file is TEMPORARY.
 * Real AI logic will be restored AFTER infra validation passes.
 */

import { QueryDocumentSnapshot } from "firebase-admin/firestore";

import { checkExecutionExists } from "./idempotency";
import { recordExecution } from "./recordExecution";
import { advanceReminder } from "./advanceReminder";
import { createDraft } from "../drafts/createDraft";

// Minimal reminder shape needed for infra testing

type ReminderData = {
  enabled: boolean;
  nextRunAtUTC: string;
  frequency: "one_time" | "daily" | "weekly";
  schedule: any;
};

// Extract only what advanceReminder needs

function extractAdvanceableReminderData(reminderData: ReminderData) {
  return {
    frequency: reminderData.frequency,
    schedule: reminderData.schedule,
  };
}

//  Execute exactly ONE reminder (TEMP MODE)

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

  //  Disabled reminder guard

  if (!reminderData.enabled) {
    return;
  }

  // Idempotency guard

  const alreadyExecuted = await checkExecutionExists(
    uid,
    reminderId,
    scheduledForUTC,
  );

  if (alreadyExecuted) {
    return;
  }

  // Dummy execution

  try {
    // Create EXACT dummy draft (no variation)
    const draftId = await createDraft({
      uid,
      reminderId,
      reminderType: "simple",
      content:
        "This is a dummy draft created for infrastructure testing purposes. its not real LLM content. API is not called. If you see this, it means the backend scheduler infrastructure is working! Congrats! 🎉",
      scheduledForUTC,
    });

    // Record execution
    await recordExecution({
      uid,
      reminderId,
      reminderType: "simple",
      scheduledForUTC,
      status: "executed",
      aiUsed: false,
      draftId: draftId ?? undefined,
    });

    // Advance reminder state
    await advanceReminder({
      reminderRef: reminderDoc.ref,
      reminderData: extractAdvanceableReminderData(reminderData),
      scheduledForUTC,
    });
  } catch (error) {
    console.error("[executeReminder] Dummy execution failed", {
      reminderId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
