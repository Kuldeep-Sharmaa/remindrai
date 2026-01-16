// responsibility: functions/usage/checkAICaps.js
//Checks whether an AI execution is allowed under current caps.
// READ-ONLY guard. Never increments counters.

import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Checks whether an AI execution is allowed under current caps.
 * READ-ONLY guard. Never increments counters.
 * Fails closed on errors to prevent uncontrolled AI spending.
 */
export async function checkAICaps(uid) {
  try {
    // Compute today's UTC date key
    const now = new Date();
    const dateKey = now.toISOString().split("T")[0]; // YYYY-MM-DD

    // Check user daily cap (max 1 per day)
    const userUsageDoc = await db
      .collection("users")
      .doc(uid)
      .collection("aiDaily")
      .doc(dateKey)
      .get();

    const userCount = userUsageDoc.exists ? userUsageDoc.data().count : 0;

    if (userCount >= 1) {
      return { allowed: false, reason: "user_limit" };
    }

    // Check global daily cap (max 100 per day)
    const globalUsageDoc = await db
      .collection("system")
      .doc("aiUsage")
      .collection("daily")
      .doc(dateKey)
      .get();

    const globalCount = globalUsageDoc.exists ? globalUsageDoc.data().count : 0;

    if (globalCount >= 100) {
      return { allowed: false, reason: "global_limit" };
    }

    // Both caps passed
    return { allowed: true };
  } catch (error) {
    console.error("[checkAICaps] Read failed, failing closed", {
      uid,
      error: error instanceof Error ? error.message : String(error),
    });
    // Fail closed on AI cost - never risk uncontrolled spending
    return { allowed: false, reason: "global_limit" };
  }
}
