//recordExecution.ts

import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const db = admin.firestore();

/**
 * Allowed execution statuses (LOCKED)
 */
export type ExecutionStatus =
  | "executed"
  | "skipped_disabled"
  | "skipped_cap"
  | "skipped_error";

/**
 * Input contract for recording an execution
 */
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
 * Records an execution log for auditing and debugging.
 * Best-effort, non-transactional write.
 * NEVER throws.
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
    // Intentionally swallow errors:
    // execution logging must never block reminder processing
  }
}
