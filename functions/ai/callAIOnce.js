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
 *
 * Runtime requirements:
 * - Firebase Cloud Functions environment
 * - Outbound HTTPS access enabled
 * - OPENAI_API_KEY environment variable set
 */

import fetch from "node-fetch";

export async function callAIOnce(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable not set");
  }

  console.log("[callAIOnce] Starting AI call", {
    promptLength: prompt.length, // log size, not content
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": "remindrai-backend/1.0",
      },
      body: JSON.stringify({
        // Hardcoded for cost + behavior predictability
        model: "gpt-4.1-mini",
        input: prompt,
        max_output_tokens: 500,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI API returned status ${response.status}`);
    }

    const data = await response.json();

    // Responses API convenience field
    const outputText = data.output_text;

    if (!outputText || typeof outputText !== "string") {
      throw new Error("AI response missing output_text");
    }

    console.log("[callAIOnce] AI call succeeded");
    return outputText;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("[callAIOnce] AI call failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
