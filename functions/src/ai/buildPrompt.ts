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

  text = text.replace(/^(write|talk|post)\s+(about\s+)?/i, "");
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
  if (!pastDrafts || pastDrafts.length < 1) return "";

  const valid = pastDrafts
    .filter((d) => typeof d === "string" && d.trim().length >= MIN_DRAFT_CHARS)
    .slice(0, MAX_MEMORY_DRAFTS);

  if (valid.length < 1) return "";

  const drafts = valid
    .map((d) => d.trim().slice(0, MAX_DRAFT_CHARS))
    .map((d) => `---\n${d}`)
    .join("\n");

  return `\nYour writing style:\n${drafts}\n`;
}

function detectIntent(prompt?: string): "growth" | "default" {
  if (!prompt) return "default";

  const text = prompt.toLowerCase();

  if (
    text.includes("grow") ||
    text.includes("audience") ||
    text.includes("network") ||
    text.includes("connect") ||
    text.includes("followers") ||
    text.includes("twitter growth")
  ) {
    return "growth";
  }

  return "default";
}

function buildCTAInstruction(
  intent: "growth" | "default",
  platformId?: string,
  roleName?: string,
): string {
  if (intent !== "growth") return "";

  const role = roleName?.toLowerCase() || "";

  let examples = `
- Curious how others approach this.
- Would like to hear how others handle this.
- Still figuring this out — open to ideas.
`;

  if (role.includes("founder")) {
    examples = `
- Curious how other founders are handling this.
- Would love to know how others are thinking about this.
- Still figuring this out — interested in different approaches.
`;
  }

  if (role.includes("developer") || role.includes("engineer")) {
    examples = `
- Curious how other devs are solving this.
- Would like to see how others approach this problem.
- Still figuring this out — open to better ways.
`;
  }

  if (role.includes("creator") || role.includes("marketer")) {
    examples = `
- Curious how others are growing in this space.
- Would love to hear what’s working for others.
- Still experimenting — open to ideas.
`;
  }

  if (platformId === "twitter") {
    return `
End with a natural, human line that invites others to connect or share their experience.
Do not force it. Keep it subtle and conversational.

Match the tone to the role.

Example styles:
${examples}
`;
  }

  return "";
}

export function buildPrompt(input: PromptInput): string {
  try {
    const topic = normalizeTopic(input.aiPrompt);

    const role = input.role?.name || "Person";
    const tone = input.tone?.name || "Natural";
    const platform = input.platform?.name || "Social media";

    const platformLine = buildPlatformLine(input.platform?.id);
    const memoryBlock = buildMemoryBlock(input.pastDrafts);

    const intent = detectIntent(input.aiPrompt);
    const ctaInstruction = buildCTAInstruction(
      intent,
      input.platform?.id,
      input.role?.name,
    );

    return `
Perspective: ${role}
Tone: ${tone}
Platform: ${platform}

Topic: ${topic}
Be specific. No vague statements.

Write in first person, as someone describing what they actually did, built, or decided.

If about a product, include one clear line of what it does.
${memoryBlock}
${platformLine}
${ctaInstruction}

If the topic is vague or lacks detail, focus on the process or decision behind it — not the outcome.
If there is a specific moment or detail, start there.

Focus on one part of this.
Avoid explaining everything.

Write like someone noting something down, not explaining it.
Keep the language simple and direct.

Avoid smooth transitions between sentences.
Avoid general advice statements.

If the topic is a personal experience, end on the moment — not a lesson drawn from it.
Do not wrap things up cleanly at the end.

No emojis. No em dashes.
`.trim();
  } catch {
    return `Write a short, clear thought. Keep it simple.`.trim();
  }
}
