/**
 * deleteReminder.ts
 *
 * Backend-only soft delete for reminders.
 * Sets enabled=false and marks deletedAt. Never physically deletes documents.
 */

import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";
import type { CallableContext } from "firebase-functions/v1/https";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

export const deleteReminder = functions.https.onCall(
  async (data: any, context: CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required",
      );
    }

    const reminderId = data?.reminderId;

    if (!reminderId || typeof reminderId !== "string") {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "reminderId is required",
      );
    }

    const uid = context.auth.uid;

    const reminderRef = db
      .collection("users")
      .doc(uid)
      .collection("reminders")
      .doc(reminderId);

    const snapshot = await reminderRef.get();

    if (!snapshot.exists) {
      throw new functions.https.HttpsError("not-found", "Reminder not found");
    }

    const reminder = snapshot.data();

    // Idempotent - return early if already deleted
    if (reminder?.deletedAt) {
      return { status: "already_deleted" };
    }

    await reminderRef.update({
      enabled: false,
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { status: "deleted" };
  },
);
