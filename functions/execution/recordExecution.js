import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Records an execution log for auditing and debugging.
 * Best-effort, non-transactional write.
 */
export async function recordExecution({
  uid,
  reminderId,
  reminderType,
  scheduledForUTC,
  status,
  aiUsed,
  draftId,
}) {
  try {
    const executionId = `${reminderId}_${scheduledForUTC}`;

    const executionData = {
      reminderId,
      reminderType,
      scheduledForUTC,
      status,
      aiUsed,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
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
    // Do not throw - execution log failures must not block the system
  }
}
