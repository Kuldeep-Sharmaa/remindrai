// Responsibility: functions/usage/incrementAICounters.js
// Increments AI usage counters after a successful AI call.
// Best-effort writes. Never throws.
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Increments AI usage counters after a successful AI call.
 * Best-effort writes. Never throws to avoid blocking execution.
 */
export async function incrementAICounters(uid) {
  try {
    // Compute current UTC date key
    const now = new Date();
    const dateKey = now.toISOString().split("T")[0]; // YYYY-MM-DD

    // Increment user counter
    await db
      .collection("users")
      .doc(uid)
      .collection("aiDaily")
      .doc(dateKey)
      .set({ count: admin.firestore.FieldValue.increment(1) }, { merge: true });

    // Increment global counter
    await db
      .collection("system")
      .doc("aiUsage")
      .collection("daily")
      .doc(dateKey)
      .set({ count: admin.firestore.FieldValue.increment(1) }, { merge: true });

    console.log("[incrementAICounters] Counters incremented", {
      uid,
      dateKey,
    });
  } catch (error) {
    console.error("[incrementAICounters] Failed to increment counters", {
      uid,
      error: error instanceof Error ? error.message : String(error),
    });
    // Do not throw - counter failures must not block execution
  }
}
