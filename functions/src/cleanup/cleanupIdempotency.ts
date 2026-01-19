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
/**
 * cleanupIdempotency.ts
 *
 * Purpose:
 * Scheduled cleanup for expired idempotency execution mappings.
 *
 * Guarantees:
 * - Safe to run periodically
 * - Best-effort cleanup
 * - Never affects active reminders
 */

import { getDb } from "../libs/firestoreClient";

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function cleanupExpiredMappings(
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<{ deleted: number }> {
  const db = getDb();
  const cutoff = new Date(Date.now() - ttlMs);

  let deleted = 0;

  try {
    const usersSnap = await db.collection("users").get();

    for (const userDoc of usersSnap.docs) {
      const executionsCol = userDoc.ref.collection("executions");

      const snap = await executionsCol
        .where("createdAt", "<", cutoff)
        .limit(500)
        .get();

      if (snap.empty) continue;

      const batch = db.batch();
      snap.docs.forEach((doc) => {
        batch.delete(doc.ref);
        deleted++;
      });

      await batch.commit();
    }

    console.log("[cleanupIdempotency] Cleanup completed", { deleted });
  } catch (error) {
    console.error("[cleanupIdempotency] Cleanup failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return { deleted };
}
