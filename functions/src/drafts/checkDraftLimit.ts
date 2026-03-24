import * as admin from "firebase-admin";
import { DateTime } from "luxon";

const DRAFT_LIMIT = 3;

export interface DraftLimitResult {
  limited: boolean;
  count: number;
}

// 3 AI drafts per calendar day — resets at midnight in the user's own timezone
// rolling 24h felt fair to us but users think in days, not time windows
export async function checkDraftLimit(uid: string): Promise<DraftLimitResult> {
  try {
    const db = admin.firestore();

    // read user's timezone — written by TimezoneSync when user confirms their zone
    // falls back to UTC if not set yet (new accounts, first session)
    const userDoc = await db.collection("users").doc(uid).get();
    const userTimezone = userDoc.data()?.timezone || "UTC";

    // start of today in the user's local timezone — this is what "today" means to them
    const startOfToday = DateTime.now()
      .setZone(userTimezone)
      .startOf("day")
      .toUTC()
      .toJSDate();

    const windowStart = admin.firestore.Timestamp.fromDate(startOfToday);

    const snapshot = await db
      .collection("users")
      .doc(uid)
      .collection("executions")
      .where("status", "==", "executed")
      .where("createdAt", ">=", windowStart)
      .get();

    // filter aiUsed in code — avoids needing a 3-field composite index
    const count = snapshot.docs.filter(
      (doc) => doc.data().aiUsed === true,
    ).length;

    return {
      limited: count >= DRAFT_LIMIT,
      count,
    };
  } catch (error) {
    console.error("[checkDraftLimit] Failed", {
      uid,
      error: error instanceof Error ? error.message : String(error),
    });

    // fail open — a broken limit check should never silently kill a user's draft
    return { limited: false, count: 0 };
  }
}
