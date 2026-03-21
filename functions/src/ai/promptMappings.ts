// FRONTEND CONTRACT — these IDs must match exactly what the frontend sends to Firestore.

type PromptEntity = {
  id: string;
  name: string; // used in prompt — keep cues short (≤8 words)
  description: string; // not used in prompt currently — kept for future use and clarity
};

// Firestore stores these as raw strings — normalize before lookup so we can be resilient to whitespace and capitalization issues
function normalize(value?: string): string {
  return value?.toLowerCase().trim() ?? "";
}

const ROLE_MAP: Record<string, PromptEntity> = {
  founder: {
    id: "founder",
    name: "Founder — building, learning, figuring things out",
    description:
      "a founder building and growing a startup, sharing real decisions, struggles, and lessons from the journey",
  },
  solopreneur: {
    id: "solopreneur",
    name: "Solopreneur — doing it solo, staying consistent",
    description:
      "a solo builder managing everything alone, sharing practical experiences of building, staying consistent, and growing",
  },
  professional: {
    id: "professional",
    name: "Professional — growing, learning, sharing the journey",
    description:
      "a working professional sharing career growth, experiences, and real insights from their journey",
  },
  creator: {
    id: "creator",
    name: "Creator — making things, building an audience",
    description:
      "a creator sharing ideas, content experiences, and lessons from building and engaging an audience",
  },
  developer: {
    id: "developer",
    name: "Developer — solving problems, building, learning daily",
    description:
      "a developer building products and sharing technical experiences, learnings, and real challenges",
  },
  other: {
    id: "other",
    name: "Other — sharing from a unique personal perspective",
    description:
      "someone sharing personal experiences, thoughts, and insights from their own unique journey",
  },
};

const TONE_MAP: Record<string, PromptEntity> = {
  professional: {
    id: "professional",
    name: "Professional — clear, direct, still human",
    description:
      "a clear, structured, and professional tone that still feels natural and human",
  },
  friendly: {
    id: "friendly",
    name: "Friendly — warm, simple, easy to connect",
    description:
      "a warm, simple, and easy-to-connect tone, like talking to someone directly",
  },
  thoughtful: {
    id: "thoughtful",
    name: "Thoughtful — reflective, calm, meaningful",
    description:
      "a reflective and calm tone focused on meaningful insights and observations",
  },
  witty: {
    id: "witty",
    name: "Witty — sharp, clever, slightly playful",
    description: "a sharp, slightly playful tone with subtle cleverness",
  },
};

const PLATFORM_MAP: Record<string, PromptEntity> = {
  linkedin: {
    id: "linkedin",
    name: "LinkedIn — professional, insightful, short paragraphs",
    description:
      "a professional platform where people share insights, experiences, and thoughtful reflections",
  },
  twitter: {
    id: "twitter",
    name: "Twitter — short, sharp, one clear idea",
    description: "a fast-paced platform for short, sharp, and clear ideas",
  },
  threads: {
    id: "threads",
    name: "Threads — conversational, personal, relaxed",
    description:
      "a conversational platform for sharing personal thoughts in a relaxed way",
  },
};

// returning undefined is intentional — buildPrompt handles missing values gracefully
export function mapRole(input?: string): PromptEntity | undefined {
  return ROLE_MAP[normalize(input)];
}

export function mapTone(input?: string): PromptEntity | undefined {
  return TONE_MAP[normalize(input)];
}

export function mapPlatform(input?: string): PromptEntity | undefined {
  return PLATFORM_MAP[normalize(input)];
}
