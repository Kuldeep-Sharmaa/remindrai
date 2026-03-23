import * as admin from "firebase-admin";

const DRAFT_LIMIT = 3;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours in ms

export interface DraftLimitResult {
  limited: boolean;
  count: number;
}

// checks how many AI drafts this user has generated in the last 24 hours
// uses executions collection — so deleting a draft doesn't restore quota
export async function checkDraftLimit(uid: string): Promise<DraftLimitResult> {
  try {
    const db = admin.firestore();

    const windowStart = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - WINDOW_MS),
    );

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

    // fail open — don't block execution if the check itself fails
    return { limited: false, count: 0 };
  }
}
