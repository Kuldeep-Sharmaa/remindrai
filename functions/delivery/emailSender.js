/**
 * emailSender.js
 * ---------------------------------------------
 * Purpose:
 *   - Small abstraction for sending delivery emails (SendGrid / SES / other).
 *
 * Responsibilities / Contents:
 *   - sendDeliveryEmail(uid, delivery) — enqueue or send email.
 *
 * Invariants & Guarantees:
 *   - Do not embed credentials in repo; read from env.
 *
 * When to update / modify this file:
 *   - Change provider or email templates.
 * ---------------------------------------------
 */

export async function sendDeliveryEmail(uid, delivery) {
  // TODO: implement with provider SDK
  // Example: SendGrid API call with template and user email lookup
  return { sent: false };
}

export default { sendDeliveryEmail };
