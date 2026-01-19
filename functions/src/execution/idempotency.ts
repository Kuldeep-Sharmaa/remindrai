/**
 * idempotency.ts
 *
 * Purpose:
 * Provides idempotency helpers for reminder execution.
 *
 * Responsibilities:
 * - Determine whether a reminder execution has already happened
 *   for a given scheduled run time.
 *
 * Guarantees:
 * - Execution identity = reminderId + scheduledForUTC
 * - This file NEVER creates execution logs
 * - Fails open on errors (does not block execution)
 */

import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Checks if an execution already exists for a given reminder and scheduled time.
 *
 * @returns true if execution already exists, false otherwise
 */
export async function checkExecutionExists(
  uid: string,
  reminderId: string,
  scheduledForUTC: string,
): Promise<boolean> {
  try {
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

    // Fail open: allow execution rather than risk blocking reminders
    return false;
  }
}
