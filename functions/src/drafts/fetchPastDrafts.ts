import * as admin from "firebase-admin";

// anything shorter than this is probably test data or noise — not useful for style
const MIN_DRAFT_CHARS = 80;

// keeping this in sync with buildPrompt.ts — both cap at 220 to control token usage
const MAX_DRAFT_CHARS = 220;

export async function fetchPastDrafts(
  uid: string,
  limitCount: number = 2,
): Promise<string[]> {
  try {
    const db = admin.firestore();

    // most recent first — we want current style, not how they wrote 3 months ago
    const snapshot = await db
      .collection("users")
      .doc(uid)
      .collection("drafts")
      .orderBy("createdAt", "desc")
      .limit(limitCount)
      .get();

    if (snapshot.empty) return [];

    const drafts: string[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const content = data?.content;

      if (typeof content === "string") {
        const trimmed = content.trim();

        if (trimmed.length > MIN_DRAFT_CHARS) {
          drafts.push(trimmed.slice(0, MAX_DRAFT_CHARS));
        }
      }
    });

    return drafts;
  } catch (error) {
    console.error("[fetchPastDrafts] Failed", {
      uid,
      error: error instanceof Error ? error.message : String(error),
    });

    // memory is optional — don't let a Firestore hiccup kill the whole execution
    return [];
  }
}
