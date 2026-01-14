/**
 * callAIOnce.js
 *
 * Purpose:
 * Performs a single AI call to generate content.
 *
 * Responsibilities:
 * - Call the AI model exactly once.
 * - Return generated text.
 *
 * Guarantees:
 * - No retries.
 * - No fallbacks.
 * - No Firestore access.
 *
 * When to modify:
 * - If AI provider or model changes.
 * - If prompt size or output handling rules change.
 */
