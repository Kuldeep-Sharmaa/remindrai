/**
 * createDraft.js
 *
 * Purpose:
 * Persists the output of a reminder execution as a draft.
 *
 * Responsibilities:
 * - Create a draft document under the owning user.
 * - Store generated or static content.
 *
 * Guarantees:
 * - Drafts are write-once.
 * - Clients never write drafts directly.
 *
 * When to modify:
 * - If draft schema changes.
 * - If new metadata needs to be stored with drafts.
 */
