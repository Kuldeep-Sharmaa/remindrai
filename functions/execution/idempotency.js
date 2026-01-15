/**
 * idempotency.js
 *
 * Purpose:
 * Provides idempotency helpers for reminder execution.
 *
 * Responsibilities:
 * - Determine whether a reminder execution has already happened
 *   for a given scheduled run time.
 *
 * Guarantees:
 * - Execution identity is defined by reminderId + scheduledForUTC.
 * - This file does not create execution logs.
 *
 * When to modify:
 * - If execution identity definition changes.
 * - If execution log storage structure changes.
 */
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Checks if an execution already exists for a given reminder and scheduled time.
 * Uses deterministic document ID for fast existence check.
 * Returns true if found, false otherwise.
 * Fails open on errors to avoid blocking execution.
 */
export async function checkExecutionExists(uid, reminderId, scheduledForUTC) {
  try {
    // Build deterministic execution ID
    const executionId = `${reminderId}_${scheduledForUTC}`;

    // Check for document existence
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
    return false;
  }
}
