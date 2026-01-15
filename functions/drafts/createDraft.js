/**
 * createDraft.js
 *
 * Purpose:
 * Persists the output of a reminder execution as a draft.
 *
 * Responsibilities:
 * - Create a draft document under the owning user.
 * - Store generated or static content.
 *
 * Guarantees:
 * - Drafts are write-once.
 * - Clients never write drafts directly.
 *
 * When to modify:
 * - If draft schema changes.
 * - If new metadata needs to be stored with drafts.
 */
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Creates a draft document as the result of a reminder execution.
 * Returns the auto-generated draftId on success, null on failure.
 * Never throws - draft creation is best-effort.
 */
export async function createDraft({
  uid,
  reminderId,
  reminderType,
  content,
  scheduledForUTC,
}) {
  try {
    const draftData = {
      reminderId,
      reminderType,
      content,
      scheduledForUTC,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const draftRef = await db
      .collection("users")
      .doc(uid)
      .collection("drafts")
      .add(draftData);

    const draftId = draftRef.id;

    console.log("[createDraft] Draft created", {
      uid,
      reminderId,
      draftId,
      reminderType,
    });

    return draftId;
  } catch (error) {
    console.error("[createDraft] Failed to create draft", {
      uid,
      reminderId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
