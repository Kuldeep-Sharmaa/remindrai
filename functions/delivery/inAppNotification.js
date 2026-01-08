/**
 * inAppNotification.js
 * ---------------------------------------------
 * Purpose:
 *   - Encapsulate creation of in-app notifications in Firestore.
 *
 * Responsibilities / Contents:
 *   - createNotification(uid, payload)
 *
 * Invariants & Guarantees:
 *   - Notification objects follow your UI contract.
 *
 * When to update / modify this file:
 *   - When UI expects different notification schema.
 * ---------------------------------------------
 */

import { getDb } from "../libs/firestoreClient.js";

export async function createNotification(uid, payload) {
  const col = getDb().collection("users").doc(uid).collection("notifications");
  const docRef = await col.add({
    ...payload,
    createdAt: new Date(),
    read: false,
  });
  return { id: docRef.id };
}

export default { createNotification };
