/**
 * executeReminder.js
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
 * When to modify:
 * - If execution rules change.
 * - If AI usage policy changes.
 * - If reminder lifecycle rules change.
 *
 * Known tradeoffs and  limitations:
 *
 * - Reminder execution is best-effort and idempotent, but not exactly-once.
 *   In rare edge cases (overlapping scheduler runs), duplicate AI calls
 *   may occur. This is an accepted tradeoff to avoid distributed locks
 *   and transactions.
 *
 * - AI usage counters are incremented only after a successful AI call.
 *   If a crash occurs after the AI call but before counters are updated,
 *   counters may temporarily lag actual usage.
 *
 * - AI failures do not retry and permanently advance the reminder.
 *   This avoids stuck reminders and retry storms at the cost of
 *   potentially missing a draft.
 *
 * - Execution logs are best-effort and not transactional with AI calls.
 *   They are intended for auditing and debugging, not for strict guarantees.
 *
 * These tradeoffs are aligned with the project's goals:
 * simplicity, cost safety, and predictable behavior at small scale.
 */

import * as admin from "firebase-admin";
import { checkExecutionExists } from "./idempotency";
import { recordExecution } from "./recordExecution";
import { advanceReminder } from "./advanceReminder";
import { createDraft } from "../drafts/createDraft";
import { checkAICaps } from "../usage/checkAICaps";
import { incrementAICounters } from "../usage/incrementAICounters";
import { callAIOnce } from "../ai/callAIOnce";

/**
 * Executes a single reminder.
 * Called by the scheduler with a Firestore QueryDocumentSnapshot.
 *
 * Responsibilities:
 * - Idempotency check
 * - Execution safety
 * - Cost safety routing
 * - Delegation to helpers
 */
export async function executeReminder(reminderDoc) {
  const reminderId = reminderDoc.id;
  const reminderData = reminderDoc.data();

  // Extract uid from document path (authoritative source)
  const uid = reminderDoc.ref.parent.parent.id;

  // 1. Check if reminder is enabled
  if (!reminderData.enabled) {
    console.log("[executeReminder] Reminder disabled, skipping", {
      reminderId,
    });

    const scheduledForUTC = reminderData.nextRunAtUTC;
    const reminderType = reminderData.reminderType;

    await recordExecution({
      uid,
      reminderId,
      reminderType,
      scheduledForUTC,
      status: "skipped_disabled",
      aiUsed: false,
    });

    return;
  }

  // 2. Freeze execution identity
  const scheduledForUTC = reminderData.nextRunAtUTC;

  // 3. Idempotency check
  const alreadyExecuted = await checkExecutionExists(
    uid,
    reminderId,
    scheduledForUTC
  );
  if (alreadyExecuted) {
    console.log("[executeReminder] Already executed, skipping", {
      reminderId,
      scheduledForUTC,
    });
    return;
  }

  const reminderType = reminderData.reminderType;
  const executedAtUTC = new Date().toISOString();

  // 4. Route based on reminderType
  if (reminderType === "simple") {
    await executeSimpleReminder({
      uid,
      reminderId,
      reminderType,
      reminderData,
      reminderDoc,
      scheduledForUTC,
      executedAtUTC,
    });
    return;
  }

  if (reminderType === "ai") {
    await executeAIReminder({
      uid,
      reminderId,
      reminderType,
      reminderData,
      reminderDoc,
      scheduledForUTC,
      executedAtUTC,
    });
    return;
  }

  // Unknown reminder type
  console.error("[executeReminder] Unknown reminderType", {
    reminderId,
    reminderType,
  });

  await recordExecution({
    uid,
    reminderId,
    reminderType,
    scheduledForUTC,
    status: "skipped_error",
    aiUsed: false,
  });
}

/**
 * Executes a simple reminder.
 */
async function executeSimpleReminder({
  uid,
  reminderId,
  reminderType,
  reminderData,
  reminderDoc,
  scheduledForUTC,
  executedAtUTC,
}) {
  try {
    // Create draft with simple message
    const content = reminderData.content?.message || "";
    const draftId = await createDraft({
      uid,
      reminderId,
      reminderType,
      content,
      scheduledForUTC,
    });

    // Record successful execution
    await recordExecution({
      uid,
      reminderId,
      reminderType,
      scheduledForUTC,
      status: "executed",
      aiUsed: false,
      draftId,
    });

    // Advance reminder schedule
    await advanceReminder({
      reminderRef: reminderDoc.ref,
      reminderData,
      executedAtUTC,
    });

    console.log("[executeReminder] Simple reminder executed", {
      reminderId,
      draftId,
    });
  } catch (error) {
    console.error("[executeReminder] Simple reminder execution failed", {
      reminderId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Executes an AI reminder.
 */
async function executeAIReminder({
  uid,
  reminderId,
  reminderType,
  reminderData,
  reminderDoc,
  scheduledForUTC,
  executedAtUTC,
}) {
  try {
    // Check AI caps
    const capsCheck = await checkAICaps(uid);
    if (!capsCheck.allowed) {
      console.log("[executeReminder] AI cap exceeded, skipping", {
        reminderId,
        reason: capsCheck.reason,
      });

      // Record skipped execution
      await recordExecution({
        uid,
        reminderId,
        reminderType,
        scheduledForUTC,
        status: "skipped_cap",
        aiUsed: false,
      });

      // Advance reminder anyway
      await advanceReminder({
        reminderRef: reminderDoc.ref,
        reminderData,
        executedAtUTC,
      });

      return;
    }

    // Build AI prompt from reminder content
    const prompt = buildAIPrompt(reminderData.content);

    // Call AI once (no retries)
    let aiContent;
    try {
      aiContent = await callAIOnce(prompt);
    } catch (error) {
      console.error("[executeReminder] AI call failed", {
        reminderId,
        error: error instanceof Error ? error.message : String(error),
      });

      // Record error execution
      await recordExecution({
        uid,
        reminderId,
        reminderType,
        scheduledForUTC,
        status: "skipped_error",
        aiUsed: false,
      });

      // Advance reminder anyway
      await advanceReminder({
        reminderRef: reminderDoc.ref,
        reminderData,
        executedAtUTC,
      });

      return;
    }

    // Increment AI counters after successful call
    await incrementAICounters(uid);

    // Create draft with AI-generated content
    const draftId = await createDraft({
      uid,
      reminderId,
      reminderType,
      content: aiContent,
      scheduledForUTC,
    });

    // Record successful execution
    await recordExecution({
      uid,
      reminderId,
      reminderType,
      scheduledForUTC,
      status: "executed",
      aiUsed: true,
      draftId,
    });

    // Advance reminder schedule
    await advanceReminder({
      reminderRef: reminderDoc.ref,
      reminderData,
      executedAtUTC,
    });

    console.log("[executeReminder] AI reminder executed", {
      reminderId,
      draftId,
    });
  } catch (error) {
    console.error("[executeReminder] AI reminder execution failed", {
      reminderId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Builds AI prompt from reminder content.
 */
function buildAIPrompt(content) {
  const parts = [];

  if (content?.aiPrompt) {
    parts.push(content.aiPrompt);
  }

  if (content?.role) {
    parts.push(`Role: ${content.role}`);
  }

  if (content?.tone) {
    parts.push(`Tone: ${content.tone}`);
  }

  if (content?.platform) {
    parts.push(`Platform: ${content.platform}`);
  }

  return parts.join("\n");
}
