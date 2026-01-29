/**
 * recordExecution.ts
 *
 * Logs execution events for auditing and debugging.
 * Best-effort writes - failures don't block execution.
 * Execution identity = reminderId + scheduledForUTC
 */

import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Allowed execution statuses
 */
export type ExecutionStatus =
  | "executed"
  | "skipped_disabled"
  | "skipped_cap"
  | "skipped_error";

export interface RecordExecutionInput {
  uid: string;
  reminderId: string;
  reminderType: string;
  scheduledForUTC: string;
  status: ExecutionStatus;
  aiUsed: boolean;
  draftId?: string;
}

/**
 * Records execution log for auditing and debugging.
 * Never throws.
 */
export async function recordExecution(
  input: RecordExecutionInput,
): Promise<void> {
  const {
    uid,
    reminderId,
    reminderType,
    scheduledForUTC,
    status,
    aiUsed,
    draftId,
  } = input;

  try {
    // Lazy access - ensures Admin is initialized
    const db = admin.firestore();

    const executionId = `${reminderId}_${scheduledForUTC}`;

    const executionData: {
      reminderId: string;
      reminderType: string;
      scheduledForUTC: string;
      status: ExecutionStatus;
      aiUsed: boolean;
      createdAt: FieldValue;
      draftId?: string;
    } = {
      reminderId,
      reminderType,
      scheduledForUTC,
      status,
      aiUsed,
      createdAt: FieldValue.serverTimestamp(),
    };

    if (draftId) {
      executionData.draftId = draftId;
    }

    await db
      .collection("users")
      .doc(uid)
      .collection("executions")
      .doc(executionId)
      .set(executionData);

    console.log("[recordExecution] Execution recorded", {
      uid,
      reminderId,
      executionId,
      status,
    });
  } catch (error) {
    console.error("[recordExecution] Failed to record execution", {
      uid,
      reminderId,
      scheduledForUTC,
      status,
      error: error instanceof Error ? error.message : String(error),
    });
    // Swallow error - logging doesn't block execution
  }
}
