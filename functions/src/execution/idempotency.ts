/**
 * idempotency.ts
 *
 * Idempotency helpers for reminder execution.
 * Execution identity = reminderId + scheduledForUTC
 * Fails open on errors to avoid blocking execution.
 */

import * as admin from "firebase-admin";

/**
 * Checks if this execution already ran.
 * Returns true if exists, false otherwise.
 */
export async function checkExecutionExists(
  uid: string,
  reminderId: string,
  scheduledForUTC: string,
): Promise<boolean> {
  try {
    // Lazy access - ensures Admin is initialized
    const db = admin.firestore();

    const executionId = `${reminderId}_${scheduledForUTC}`;

    const executionDoc = await db
      .collection("users")
      .doc(uid)
      .collection("executions")
      .doc(executionId)
      .get();

    return executionDoc.exists;
  } catch (error) {
    console.error("[checkExecutionExists] Read failed, failing open", {
      uid,
      reminderId,
      scheduledForUTC,
      error: error instanceof Error ? error.message : String(error),
    });

    // Fail open - allow execution rather than block
    return false;
  }
}
