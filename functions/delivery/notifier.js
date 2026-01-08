/**
 * notifier.js
 * ---------------------------------------------
 * Purpose:
 *   - Central delivery orchestrator: create in-app notifications and optionally trigger email.
 *
 * Responsibilities / Contents:
 *   - Write notification docs to users/{uid}/notifications (or deliveries).
 *   - Invoke emailSender if delivery requires email.
 *   - Emit metrics/logs for deliveries.
 *
 * Invariants & Guarantees:
 *   - Notifier should be idempotent or tolerate duplicate calls.
 *
 * When to update / modify this file:
 *   - When introducing push notifications or webhooks.
 * ---------------------------------------------
 */

import { userDeliveriesCol, getDb } from "../libs/firestoreClient.js";
import { info } from "../libs/logger.js";
// import emailSender from "./emailSender.js"; // optional

export async function notifyUserDelivery({ uid, delivery }) {
  // Save delivery doc already done by generator; this function can also create a notification
  const notificationsCol = getDb()
    .collection("users")
    .doc(uid)
    .collection("notifications");
  await notificationsCol.add({
    title: "New AI Draft Ready",
    body:
      delivery.content?.draft?.slice(0, 300) || "Your draft is ready to view.",
    deliveryId: delivery.id,
    createdAt: new Date(),
    read: false,
  });

  info("User notified of delivery", { uid, deliveryId: delivery.id });

  // Optionally send email:
  // await emailSender.sendDeliveryEmail(uid, delivery);

  return { ok: true };
}

export default { notifyUserDelivery };
