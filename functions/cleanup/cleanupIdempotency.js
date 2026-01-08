/**
 * cleanupIdempotency.js
 * ---------------------------------------------
 * Purpose:
 *   - Scheduled cleanup for expired idempotency mappings if you don't use Firestore TTL.
 *
 * Responsibilities / Contents:
 *   - Query mappings older than TTL and delete them in batches.
 *
 * Invariants & Guarantees:
 *   - Should be safe to run periodically; nondestructive to active reminders.
 *
 * When to update / modify this file:
 *   - When changing idempotency TTL values or cleanup frequency.
 * ---------------------------------------------
 */

import { getDb, usersCollection } from "../libs/firestoreClient.js";

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export async function cleanupExpiredMappings(ttlMs = DEFAULT_TTL_MS) {
  const cutoff = new Date(Date.now() - ttlMs);
  // This implementation is an example. For large datasets, use partitioned queries.
  const usersSnap = await usersCollection().get();
  let deleted = 0;
  for (const u of usersSnap.docs) {
    const col = u.ref.collection("reminderIdempotency");
    const q = col.where("createdAt", "<", cutoff).limit(500);
    const snap = await q.get();
    if (snap.empty) continue;
    const batch = getDb().batch();
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    deleted += snap.size;
  }
  return { deleted };
}

export default { cleanupExpiredMappings };
