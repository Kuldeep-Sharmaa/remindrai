/**
 * purgeOldReminders.ts
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
 * Status:
 *   - NOT WIRED
 *   - NOT EXECUTED
 *   - FUTURE MAINTENANCE ONLY
 * ---------------------------------------------
 */

import { getDb, serverTimestamp } from "../libs/firestoreClient";

export interface PurgeOldDataOptions {
  olderThanDays?: number;
  explicitApproval?: boolean;
  batchSize?: number;
}

export interface PurgeOldDataResult {
  purged: number;
}

export async function purgeOldData(
  options: PurgeOldDataOptions = {},
): Promise<PurgeOldDataResult> {
  const {
    olderThanDays = 365,
    explicitApproval = false,
    batchSize = 500,
  } = options;

  if (!explicitApproval) {
    return { purged: 0 };
  }

  const db = getDb();
  const cutoff = new Date(
    Date.now() - Math.max(1, olderThanDays) * 24 * 60 * 60 * 1000,
  );
  const chunkSize = Math.min(Math.max(1, batchSize), 500);

  let purged = 0;

  while (true) {
    const snapshot = await db
      .collectionGroup("reminders")
      .where("enabled", "==", false)
      .where("updatedAt", "<", cutoff)
      .orderBy("updatedAt", "asc")
      .limit(chunkSize)
      .get();

    if (snapshot.empty) {
      break;
    }

    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        enabled: false,
        retentionArchivedAt: serverTimestamp(),
        retentionPurgeMode: "soft_delete",
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
    purged += snapshot.size;

    if (snapshot.size < chunkSize) {
      break;
    }
  }

  return { purged };
}
