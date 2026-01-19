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

export interface PurgeOldDataOptions {
  olderThanDays?: number;
}

export interface PurgeOldDataResult {
  purged: number;
}

export async function purgeOldData(
  options: PurgeOldDataOptions = {}
): Promise<PurgeOldDataResult> {
  const { olderThanDays: _olderThanDays = 365 } = options;

  // TODO:
  // - Implement safe archival or soft-delete pattern
  // - Must NOT hard-delete without audit requirements
  // - Must NOT be scheduled without explicit approval

  return { purged: 0 };
}
