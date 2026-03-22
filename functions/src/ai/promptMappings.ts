// FRONTEND CONTRACT — these IDs must match exactly what the frontend sends to Firestore.
//
// Use `name` in the prompt.
// Keep `name` short, grounded, and non-generic.
// `description` is kept for future use and clarity, but this is not used in the prompt currently.

type PromptEntity = {
  id: string;
  name: string;
  description: string;
};

// Firestore stores these as raw strings — normalize before lookup so we are resilient
// to whitespace and capitalization issues.
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
    name: "Professional — working, improving, figuring things out",
    description:
      "a working professional sharing career growth, experiences, and real insights from their journey",
  },
  creator: {
    id: "creator",
    name: "Creator — making things, testing ideas, sharing",
    description:
      "a creator sharing ideas, content experiences, and lessons from building and engaging an audience",
  },
  developer: {
    id: "developer",
    name: "Developer — solving problems, building, debugging daily",
    description:
      "a developer building products and sharing technical experiences, learnings, and real challenges",
  },
  other: {
    id: "other",
    name: "Other — sharing personal thoughts and experiences",
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
    name: "Friendly — simple, relaxed, easy to read",
    description:
      "a warm, simple, and easy-to-connect tone, like talking to someone directly",
  },
  thoughtful: {
    id: "thoughtful",
    name: "Thoughtful — reflective, calm, grounded",
    description:
      "a reflective and calm tone focused on meaningful insights and observations",
  },
  witty: {
    id: "witty",
    name: "Witty — sharp, clever, lightly playful",
    description: "a sharp, slightly playful tone with subtle cleverness",
  },
};

const PLATFORM_MAP: Record<string, PromptEntity> = {
  linkedin: {
    id: "linkedin",
    name: "LinkedIn — professional, clear, short paragraphs",
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

// Returning undefined is intentional — buildPrompt handles missing values gracefully.
export function mapRole(input?: string): PromptEntity | undefined {
  return ROLE_MAP[normalize(input)];
}

export function mapTone(input?: string): PromptEntity | undefined {
  return TONE_MAP[normalize(input)];
}

export function mapPlatform(input?: string): PromptEntity | undefined {
  return PLATFORM_MAP[normalize(input)];
}
