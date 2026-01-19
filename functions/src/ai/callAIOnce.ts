/**
 * callAIOnce.ts
 *
 * Purpose:
 * Performs a single AI call to generate content.
 *
 * Guarantees:
 * - Exactly ONE AI call
 * - NO retries
 * - NO fallbacks
 * - NO Firestore access
 */

export async function callAIOnce(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable not set");
  }

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new Error("Invalid prompt provided to callAIOnce");
  }

  console.log("[callAIOnce] Starting AI call", {
    promptLength: prompt.length, // size only, never content
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": "remindrai-backend/1.0",
      },
      body: JSON.stringify({
        // Locked for cost + predictability
        model: "gpt-4.1-mini",
        input: prompt,
        max_output_tokens: 500,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`AI API returned status ${response.status}`);
    }

    const data: unknown = await response.json();

    /**
     * We intentionally validate minimally.
     * If OpenAI changes response shape, we FAIL FAST.
     */
    const outputText =
      typeof (data as any)?.output_text === "string"
        ? (data as any).output_text
        : null;

    if (!outputText) {
      throw new Error("AI response missing output_text");
    }

    console.log("[callAIOnce] AI call succeeded");
    return outputText;
  } catch (error) {
    console.error("[callAIOnce] AI call failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
