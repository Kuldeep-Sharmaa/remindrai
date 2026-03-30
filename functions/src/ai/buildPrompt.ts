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

  text = text.replace(/^write about\s+/i, "");
  text = text.replace(/^talk about\s+/i, "");
  text = text.replace(/^post about\s+/i, "");
  text = text.replace(/\s+/g, " ");

  return text.length > MAX_PROMPT_LENGTH
    ? text.slice(0, MAX_PROMPT_LENGTH)
    : text;
}

function buildMemoryBlock(pastDrafts?: string[]): string {
  if (!pastDrafts || pastDrafts.length < 2) return "";

  const valid = pastDrafts
    .filter((d) => typeof d === "string" && d.trim().length >= MIN_DRAFT_CHARS)
    .slice(0, MAX_MEMORY_DRAFTS);

  if (valid.length < 2) return "";

  const drafts = valid
    .map((d) => d.trim().slice(0, MAX_DRAFT_CHARS))
    .map((d) => `---\n${d}`)
    .join("\n");

  return `Your writing style:\n${drafts}\n`;
}

export function buildPrompt(input: PromptInput): string {
  try {
    const topic = normalizeTopic(input.aiPrompt);

    const role = input.role?.id || "person";
    const tone = input.tone?.id || "natural";
    const platform = input.platform?.id || "general";

    const memoryBlock = buildMemoryBlock(input.pastDrafts);

    return `
Role: ${role}
Tone: ${tone}
Platform: ${platform}
Topic: ${topic}

Pick one clear idea. Do not cover everything.
If about a product, describe it exactly as given. Do not assume extra features.

${memoryBlock ? memoryBlock + "Match this style. Do not copy.\n" : ""}

Write a short post with natural flow.
Avoid fixed patterns (like "I used to", "What I learned").
Avoid generic openings. Start directly or with something specific.
Do not repeat the same idea.
Include one clear standout line.
dont assume anything not given. 
Keep it simple and readable.
No emojis.
`.trim();
  } catch {
    return `Write a short, clear post.`.trim();
  }
}
