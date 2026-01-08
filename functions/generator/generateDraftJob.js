/**
 * generateDraftJob.js
 * ---------------------------------------------
 * Purpose:
 *   - Generate the AI draft for a single reminder run and persist a delivery.
 *
 * Responsibilities / Contents:
 *   - Build final prompt (anchors + previous relevant content).
 *   - Call openaiClient to generate text.
 *   - Save delivery document under users/{uid}/deliveries.
 *   - Update reminder metadata (lastDeliveredAt, lastDeliveryId).
 *
 * Invariants & Guarantees:
 *   - Must be idempotent given same idempotencyKey.
 *   - Must not change reminder state until delivery is successfully saved.
 *
 * When to update / modify this file:
 *   - When changing prompt templates or adding RAG features.
 *   - When adding richer delivery types (images, threads).
 * ---------------------------------------------
 */

import {
  userDeliveriesCol,
  userRemindersCol,
  getDb,
} from "../libs/firestoreClient.js";
import openaiClient from "./openaiClient.js";
import { info, error } from "../libs/logger.js";

/**
 * Generate a draft and persist. Returns delivery doc reference data.
 * Accepts idempotencyKey so caller ensures uniqueness.
 */
export async function generateDraftForReminder({
  uid,
  reminderId,
  reminder,
  runAtIso = null,
  idempotencyKey = null,
}) {
  // Build prompt (very basic skeleton here)
  const prompt = buildPromptFromReminder(reminder);

  // Call OpenAI
  const aiResult = await openaiClient.createCompletion({
    prompt,
    uid,
    metadata: { reminderId, idempotencyKey },
  });

  // Save delivery in user's deliveries collection
  const deliveries = userDeliveriesCol(uid);
  const deliveryRef = deliveries.doc(); // new doc
  const docData = {
    reminderId,
    content: {
      draft: aiResult?.text || "",
      model: aiResult?.model || null,
    },
    createdAt: new Date(),
    generatedAt: new Date(),
    meta: { idempotencyKey },
  };

  await deliveryRef.set(docData);

  // update reminder with lastDeliveredAt / lastDeliveryId
  const reminderRef = userRemindersCol(uid).doc(reminderId);
  await reminderRef.update({
    lastDeliveredAt: new Date(),
    lastDeliveryId: deliveryRef.id,
    updatedAt: new Date(),
  });

  info("Draft generated and saved", {
    uid,
    reminderId,
    deliveryId: deliveryRef.id,
  });
  return { id: deliveryRef.id, ...docData };
}

/* Helper: buildPromptFromReminder
   - Keep this function small but replaceable with RAG logic later.
*/
function buildPromptFromReminder(reminder) {
  // TODO: Replace with richer template using brand anchors, tone and role
  const promptParts = [];
  if (reminder.content?.aiPrompt) promptParts.push(reminder.content.aiPrompt);
  if (reminder.schedule)
    promptParts.push(`Schedule: ${JSON.stringify(reminder.schedule)}`);
  return promptParts.join("\n\n") || "Generate a short social media post.";
}

export default { generateDraftForReminder };
