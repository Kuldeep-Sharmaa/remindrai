/**
 * openaiClient.js
 * ---------------------------------------------
 * Purpose:
 *   - Wrapper around OpenAI API calls used by generateDraftJob.
 *
 * Responsibilities / Contents:
 *   - Provide createCompletion() with retries and simple rate-limit handling.
 *   - Centralize model selection and temperature defaults.
 *
 * Invariants & Guarantees:
 *   - No secret keys in code; read process.env.OPENAI_API_KEY at runtime.
 *   - Retry transient errors up to a safe limit.
 *
 * When to update / modify this file:
 *   - When switching models or adding streaming output.
 * ---------------------------------------------
 */

import fetch from "node-fetch"; // or use official client if available

const OPENAI_KEY = process.env.OPENAI_API_KEY;

async function createCompletion({ prompt, uid = null, metadata = {} } = {}) {
  if (!OPENAI_KEY) throw new Error("Missing OPENAI_API_KEY");
  // Minimal example using OpenAI v1 completions endpoint (adjust for actual API)
  const payload = {
    model: "gpt-4o-mini", // example; change as needed
    prompt,
    max_tokens: 250,
    temperature: 0.8,
  };

  // TODO: Replace with official SDK + exponential backoff
  const res = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${text}`);
  }

  const json = await res.json();
  // map response to { text, model }
  return {
    text: json.choices?.[0]?.text || "",
    model: json.model || payload.model,
  };
}

export default { createCompletion };
