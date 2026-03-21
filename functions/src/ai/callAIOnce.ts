// one call, one draft — no retries, no fallbacks, fail fast
export async function callAIOnce(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable not set");
  }

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new Error("Invalid prompt provided to callAIOnce");
  }

  console.log("[callAIOnce] Starting AI call", {
    promptLength: prompt.length, // size only — never log actual prompt content
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
        model: "gpt-4.1-mini",
        input: prompt,
        max_output_tokens: 250, // social posts don't need more — keeps cost predictable
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`AI API returned status ${response.status}`);
    }

    const data: unknown = await response.json();

    // took me a while to figure this out — the Responses API doesn't return output_text
    // at the top level, it's nested at output[0].content[0].text
    const outputText =
      typeof (data as any)?.output?.[0]?.content?.[0]?.text === "string"
        ? (data as any).output[0].content[0].text
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
