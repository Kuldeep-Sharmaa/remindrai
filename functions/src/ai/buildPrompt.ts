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

  const trimmed = input.trim();
  return trimmed.length > MAX_PROMPT_LENGTH
    ? trimmed.slice(0, MAX_PROMPT_LENGTH)
    : trimmed;
}

function buildPlatformLine(platformId?: string) {
  switch (platformId) {
    case "linkedin":
      return "LinkedIn: professional, clear, short paragraphs.";
    case "twitter":
      return "Twitter: concise, one idea, no over-explaining.";
    case "threads":
      return "Threads: conversational, slightly personal.";
    default:
      return "Write in a way that fits the platform naturally.";
  }
}

function buildMemoryBlock(pastDrafts?: string[]): string {
  // 1 draft isn't enough signal — could just be an outlier in their writing
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

    // name carries the micro-cue e.g. "Founder — building, learning, figuring things out"
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
${memoryBlock}
Say it like you would to yourself or someone close. Avoid sounding overly polished or generic.
Keep it to one clear idea. Let it flow naturally.

${platformLine}

No emojis. No em dashes (—). Don't force an ending.
`.trim();
  } catch {
    // if something breaks here, still return something usable
    return `Write a short, natural post. Avoid generic phrasing.`.trim();
  }
}
