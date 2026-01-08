/**
 * purgeOldReminders.js
 * ---------------------------------------------
 * Purpose:
 *   - Optional archival / purge job for GDPR / retention compliance.
 *
 * Responsibilities / Contents:
 *   - Find reminders/deliveries older than retention and archive or delete.
 *
 * Invariants & Guarantees:
 *   - Respect user data retention policy and legal requirements.
 *
 * When to update / modify this file:
 *   - When retention policy changes or audit requirements are introduced.
 * ---------------------------------------------
 */

import { getDb, usersCollection } from "../libs/firestoreClient.js";

export async function purgeOldData({ olderThanDays = 365 }) {
  // TODO: implement safe archival or soft-delete pattern
  return { purged: 0 };
}

export default { purgeOldData };
