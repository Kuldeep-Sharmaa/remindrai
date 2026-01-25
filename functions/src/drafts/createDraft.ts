/**
 * createDraft.ts
 *
 * Purpose:
 * Persists the output of a reminder execution as a draft.
 *
 * Guarantees:
 * - Drafts are write-once
 * - Clients never write drafts directly
 * - Best-effort: failures must NOT block execution
 */

import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const db = admin.firestore();

/**
 * Input contract for creating a draft.
 */
export interface CreateDraftInput {
  uid: string;
  reminderId: string;
  reminderType: "simple" | "ai";
  content: string;
  scheduledForUTC: string;
}

/**
 * Creates a draft document as the result of a reminder execution.
 *
 * @returns draftId on success, null on failure
 * NEVER throws.
 */
export async function createDraft(
  input: CreateDraftInput,
): Promise<string | null> {
  const { uid, reminderId, reminderType, content, scheduledForUTC } = input;

  try {
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

    // Best-effort: draft failure must NOT block reminder execution
    return null;
  }
}
