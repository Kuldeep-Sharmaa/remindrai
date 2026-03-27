type PromptInput = {
  aiPrompt?: string;
  role?: { id: string; name: string; description: string };
  tone?: { id: string; name: string; description: string };
  platform?: { id: string; name: string; description: string };
  pastDrafts?: string[];
};

const MAX_PROMPT_LENGTH = 200;
const MAX_MEMORY_DRAFTS = 2;
const MAX_DRAFT_CHARS = 220;
const MIN_DRAFT_CHARS = 80;

function normalizeTopic(input?: string) {
  if (!input) return "share a useful insight";

  let text = input.trim();

  // strip weak starters that don't add anything to the prompt
  text = text.replace(/^write about\s+/i, "");
  text = text.replace(/^talk about\s+/i, "");
  text = text.replace(/^post about\s+/i, "");

  text = text.replace(/\s+/g, " ");

  return text.length > MAX_PROMPT_LENGTH
    ? text.slice(0, MAX_PROMPT_LENGTH)
    : text;
}

function buildPlatformLine(platformId?: string) {
  switch (platformId) {
    case "linkedin":
      return "LinkedIn: professional, clear, short paragraphs.";
    case "twitter":
      return "Twitter: short, direct, one idea.";
    case "threads":
      return "Threads: conversational, relaxed, personal.";
    default:
      return "Write in a way that fits the platform.";
  }
}

function buildMemoryBlock(pastDrafts?: string[]): string {
  if (!pastDrafts || pastDrafts.length < 2) return "";

  const valid = pastDrafts
    .filter((d) => typeof d === "string" && d.trim().length >= MIN_DRAFT_CHARS)
    .slice(0, MAX_MEMORY_DRAFTS);

  // re-check after filtering — some may have been too short
  if (valid.length < 2) return "";

  const drafts = valid
    .map((d) => d.trim().slice(0, MAX_DRAFT_CHARS))
    .map((d) => `---\n${d}`)
    .join("\n");

  return `\nYour writing style:\n${drafts}\n`;
}

export function buildPrompt(input: PromptInput): string {
  try {
    const topic = normalizeTopic(input.aiPrompt);

    const role = input.role?.name || "Person";
    const tone = input.tone?.name || "Natural";
    const platform = input.platform?.name || "Social media";

    const platformLine = buildPlatformLine(input.platform?.id);
    const memoryBlock = buildMemoryBlock(input.pastDrafts);

    return `
Perspective: ${role}
Tone: ${tone}
Platform: ${platform}

Topic: ${topic}
Be specific. No vague statements.

If about a product, include one clear line of what it does.
${memoryBlock}
${platformLine}

If there is a specific moment or detail, start there.

Focus on one part of this.
Avoid explaining everything.

Write like someone noting something down, not explaining it.
Keep the language simple and direct.

Avoid smooth transitions between sentences.
Do not wrap things up cleanly at the end.

No emojis. No em dashes (—).
`.trim();
  } catch {
    return `Write a short, clear thought. Keep it simple.`.trim();
  }
}
