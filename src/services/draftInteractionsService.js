import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * draftInteractions.js
 *
 * Tracks user interactions with drafts (opened, copied, dismissed).
 * Best-effort, write-once tracking. Never overwrites existing interactions.
 */

/**
 * Writes a single interaction timestamp if not already recorded.
 * Fire-and-forget from UI. Errors are swallowed.
 */
async function writeOnce({ uid, draftId, field }) {
  if (!uid || !draftId || !field) return;

  try {
    const ref = doc(db, "users", uid, "draftInteractions", draftId);

    // Check if already recorded
    const snap = await getDoc(ref);
    if (snap.exists() && field in snap.data()) {
      return; // Lock first interaction
    }

    await setDoc(
      ref,
      {
        [field]: serverTimestamp(),
      },
      { merge: true },
    );
  } catch {
    // Best-effort tracking - swallow errors
  }
}

/**
 * User opened the draft detail view.
 */
export function markOpened({ uid, draftId }) {
  writeOnce({
    uid,
    draftId,
    field: "openedAt",
  });
}

/**
 * User copied draft content.
 * Call only after clipboard success.
 */
export function markCopied({ uid, draftId }) {
  writeOnce({
    uid,
    draftId,
    field: "copiedAt",
  });
}

/**
 * User dismissed the draft.
 * Only fires if draft was opened first.
 */
export function markDismissed({ uid, draftId, hasOpened }) {
  if (!hasOpened) return;

  writeOnce({
    uid,
    draftId,
    field: "dismissedAt",
  });
}
