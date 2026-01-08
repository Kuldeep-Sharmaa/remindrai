/**
 * idempotency.js
 * ---------------------------------------------
 * Purpose:
 *   - Server-side idempotency helpers for reminder generation.
 *
 * Responsibilities / Contents:
 *   - Create / reserve an idempotency mapping doc atomically.
 *   - Check whether a job with given idempotencyKey has already run.
 *   - Cleanup helpers to remove expired mappings.
 *
 * Invariants & Guarantees:
 *   - Attempt to acquire mapping must be atomic (transaction).
 *   - Caller must pass uid + idempotencyKey.
 *
 * When to update / modify this file:
 *   - When changing idempotency TTL or semantics.
 *   - When adding server-side TTL cleanup or dead-letter handling.
 * ---------------------------------------------
 */

import { getDb, userIdempotencyCol } from "./firestoreClient.js";
import { serverTimestamp } from "firebase-admin/firestore";

/**
 * Attempt to claim an idempotency key for a given reminder run.
 * Returns { acquired: boolean, mappingId?: string }.
 * Use transactions for atomicity.
 */
export async function tryAcquireIdempotency(uid, idempotencyKey, payload = {}) {
  if (!uid || !idempotencyKey)
    throw new Error("uid and idempotencyKey required");
  const db = getDb();
  const mappingRef = userIdempotencyCol(uid).doc(idempotencyKey);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(mappingRef);
    if (snap.exists()) {
      const data = snap.data();
      // if already reserved with reminderId or runAt, treat as taken
      return { acquired: false, existing: data };
    }
    const mapping = {
      ...payload,
      createdAt: serverTimestamp(),
    };
    tx.set(mappingRef, mapping);
    return { acquired: true, mappingId: mappingRef.id };
  });
}

/**
 * Release / delete a mapping (e.g., on manual cleanup).
 */
export async function deleteIdempotencyMappings(uid, queryFn) {
  // queryFn: (colRef) => query
  const colRef = userIdempotencyCol(uid);
  const q = queryFn(colRef);
  const snap = await q.get();
  const batch = getDb().batch();
  snap.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return { deleted: snap.size };
}

export default {
  tryAcquireIdempotency,
  deleteIdempotencyMappings,
};
