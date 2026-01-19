/**
 * checkAICaps.ts
 *
 * Purpose:
 * Checks whether an AI execution is allowed under current caps.
 *
 * Guarantees:
 * - READ-ONLY guard (never increments counters)
 * - Fails CLOSED on errors to protect cost
 */

import * as admin from "firebase-admin";

const db = admin.firestore();

export type AICapCheckResult =
  | { allowed: true }
  | { allowed: false; reason: "user_limit" | "global_limit" };

/**
 * Checks whether an AI execution is allowed under current caps.
 * Fails CLOSED on errors to prevent uncontrolled AI spending.
 */
export async function checkAICaps(uid: string): Promise<AICapCheckResult> {
  try {
    // Compute today's UTC date key (YYYY-MM-DD)
    const dateKey = new Date().toISOString().split("T")[0];

    // ---- User daily cap (max 1 / day) ----
    const userUsageDoc = await db
      .collection("users")
      .doc(uid)
      .collection("aiDaily")
      .doc(dateKey)
      .get();

    const userCount =
      userUsageDoc.exists && typeof userUsageDoc.data()?.count === "number"
        ? userUsageDoc.data()!.count
        : 0;

    if (userCount >= 1) {
      return { allowed: false, reason: "user_limit" };
    }

    // ---- Global daily cap (max 100 / day) ----
    const globalUsageDoc = await db
      .collection("system")
      .doc("aiUsage")
      .collection("daily")
      .doc(dateKey)
      .get();

    const globalCount =
      globalUsageDoc.exists && typeof globalUsageDoc.data()?.count === "number"
        ? globalUsageDoc.data()!.count
        : 0;

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

    // Fail closed — never risk uncontrolled AI spending
    return { allowed: false, reason: "global_limit" };
  }
}
