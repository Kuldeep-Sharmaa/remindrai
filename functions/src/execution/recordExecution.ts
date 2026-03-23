import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export type ExecutionStatus =
  | "executed"
  | "skipped"
  | "skipped_limit"
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
  reason?: string; // optional context for skipped executions
}

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
    reason,
  } = input;

  try {
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
      reason?: string;
    } = {
      reminderId,
      reminderType,
      scheduledForUTC,
      status,
      aiUsed,
      createdAt: FieldValue.serverTimestamp(),
    };

    if (draftId) executionData.draftId = draftId;

    // only write reason when it's present — keeps clean records for normal executions
    if (reason) executionData.reason = reason;

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
    // swallow — logging should never block execution
  }
}
