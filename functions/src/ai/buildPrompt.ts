/**
 * buildPrompt.ts
 *
 * Purpose:
 * Creates a deterministic prompt for the AI model.
 *
 * Guarantees:
 * - No API calls
 * - No Firestore access
 * - Safe prompt size
 * - Platform-aware formatting
 */

type PromptInput = {
  aiPrompt?: string;
  platform?: string;
  role?: string;
  tone?: string;
};

const MAX_PROMPT_LENGTH = 200;

const PLATFORM_RULES: Record<string, string> = {
  twitter: `
Write a short Twitter/X post.
Keep it punchy and concise.
Use 1–3 short lines.
`,

  linkedin: `
Write a LinkedIn post.
Use short paragraphs.
Share an insight or reflection.
Professional but human.
`,

  instagram: `
Write an Instagram caption.
Conversational and relatable.
Story-driven tone.
`,
};

export function buildPrompt(input: PromptInput): string {
  try {
    const role = input.role?.trim() || "professional";
    const tone = input.tone?.trim() || "natural";
    const platform = input.platform?.trim().toLowerCase() || "social media";

    let aiPrompt = input.aiPrompt?.trim() || "share a useful insight";

    if (aiPrompt.length > MAX_PROMPT_LENGTH) {
      aiPrompt = aiPrompt.slice(0, MAX_PROMPT_LENGTH);
    }

    const platformRules =
      PLATFORM_RULES[platform] ||
      `
Write a natural social media post appropriate for the platform.
`;

    const prompt = `
You are a ${role} writing a social media post.

Platform: ${platform}
Tone: ${tone}

Topic:
${aiPrompt}

Instructions:
${platformRules}

Rules:
- under 150 words
- avoid generic AI phrases
- write like a real person
- generate a fresh angle every time
`.trim();

    return prompt;
  } catch {
    // fail-safe fallback
    return `
Write a short, natural social media post under 150 words about a useful professional insight.
Avoid generic AI phrases.
`.trim();
  }
}
