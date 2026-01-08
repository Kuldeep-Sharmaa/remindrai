/**
 * cronConfig.js
 * ---------------------------------------------
 * Purpose:
 *   - Centralized scheduler configuration.
 *
 * Responsibilities / Contents:
 *   - Export cron expressions or schedule rules for cloud scheduler.
 *   - Tune concurrency, retry windows, and batching parameters.
 *
 * Invariants & Guarantees:
 *   - Keep scheduler rules consistent across environments.
 *
 * When to update / modify this file:
 *   - When changing frequency of the main scheduler or adding new cron jobs.
 * ---------------------------------------------
 */

export const DEFAULT_BATCH_SIZE = 100; // reminders processed per run
export const SCHEDULER_CRON = "*/1 * * * *"; // example: every minute (for prototyping)
export const SCHEDULER_RETRY = { attempts: 3, backoffSec: 60 };

export default { DEFAULT_BATCH_SIZE, SCHEDULER_CRON, SCHEDULER_RETRY };
