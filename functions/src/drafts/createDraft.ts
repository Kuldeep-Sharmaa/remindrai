/**
 * createDraft.ts
 *
 * Persists execution output as a draft.
 * Write-once only. Backend-owned. Failures don't block execution.
 */

import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export interface CreateDraftInput {
  uid: string;
  reminderId: string;
  reminderType: "simple" | "ai";
  content: string;
  scheduledForUTC: string;
}

/**
 * Creates a draft from execution output.
 * Returns draftId on success, null on failure. Never throws.
 */
export async function createDraft(
  input: CreateDraftInput,
): Promise<string | null> {
  const { uid, reminderId, reminderType, content, scheduledForUTC } = input;

  try {
    // Lazy access - ensures Admin is initialized
    const db = admin.firestore();

    const draftData: {
      reminderId: string;
      reminderType: "simple" | "ai";
      content: string;
      scheduledForUTC: string;
      createdAt: FieldValue;
    } = {
      reminderId,
      reminderType,
      content,
      scheduledForUTC,
      createdAt: FieldValue.serverTimestamp(),
    };

    const draftRef = await db
      .collection("users")
      .doc(uid)
      .collection("drafts")
      .add(draftData);

    console.log("[createDraft] Draft created", {
      uid,
      reminderId,
      draftId: draftRef.id,
      reminderType,
    });

    return draftRef.id;
  } catch (error) {
    console.error("[createDraft] Failed to create draft", {
      uid,
      reminderId,
      error: error instanceof Error ? error.message : String(error),
    });

    // Draft failure doesn't stop execution
    return null;
  }
}
