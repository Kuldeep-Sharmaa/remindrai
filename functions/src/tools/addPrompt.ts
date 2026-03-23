import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const ACTIVE_LIMIT = 3;

export const addPrompt = functions.https.onCall(async (data, context) => {
  // must be authenticated
  const uid = context.auth?.uid;
  if (!uid) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }

  // only AI reminders have the active cap
  if (data.reminderType === "ai") {
    const db = admin.firestore();

    const snapshot = await db
      .collection("users")
      .doc(uid)
      .collection("reminders")
      .where("reminderType", "==", "ai")
      .where("enabled", "==", true)
      .get();

    // exclude soft-deleted — same logic as useActiveReminderLimit
    const activeCount = snapshot.docs.filter(
      (doc) => !doc.data().deletedAt,
    ).length;

    if (activeCount >= ACTIVE_LIMIT) {
      throw new functions.https.HttpsError(
        "resource-exhausted",
        "active_cap_reached",
      );
    }
  }

  const db = admin.firestore();
  const docRef = db.collection("users").doc(uid).collection("reminders").doc();

  // whitelist fields — nothing else from client gets written
  const docToWrite: Record<string, any> = {
    ownerId: uid,
    reminderType: data.reminderType === "ai" ? "ai" : "simple",
    frequency: data.frequency,
    schedule: data.schedule,
    content: data.content ?? {},
    createdAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(docToWrite);

  return { id: docRef.id };
});
