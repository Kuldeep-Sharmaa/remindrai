// ============================================================================
// demoAiGenerator.js (UPDATED)
// ----------------------------------------------------------------------------
// Deterministic "ChatGPT-like" generator for demo notifications.
// - Echoes the full prompt exactly in the notification (promptText).
// - Produces a polished fullPost using role/tone/platform heuristics.
// - NOT calling OpenAI: local generator intended for demo/video.
// ----------------------------------------------------------------------------

import { formatNextRunForDisplay } from "../utils/scheduleUtils";

/** safe trim helper */
function safeTrim(v, max = 600) {
  if (!v) return "";
  const s = String(v).trim();
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

/** simple lowercase contains helper */
function containsAny(text = "", words = []) {
  const t = String(text || "").toLowerCase();
  return words.some((w) => t.includes(w.toLowerCase()));
}

/** produce a professional short post given role/tone/platform/prompt */
function synthesizePost({ role, tone, platform, prompt }) {
  const p = safeTrim(prompt, 800);
  const r = safeTrim(role, 60) || "a busy founder";
  const t = (safeTrim(tone, 40) || "casual").toLowerCase();
  const plat = (safeTrim(platform, 40) || "LinkedIn").toLowerCase();

  // Platform-specific suffix for short posts (keeps link hint for X)
  const platformSuffix =
    plat.includes("twitter") || plat === "x"
      ? " 🔗"
      : plat.includes("linkedin")
      ? ""
      : " 🔗";

  // If prompt clearly asks about consistency / solo founder, use the crafted multi-line assistant draft.
  const isConsistency = containsAny(p, [
    "consist",
    "consistency",
    "consistent",
    "solo founder",
    "solopreneur",
    "solo",
  ]);

  if (isConsistency) {
    // opener based on tone
    const opener =
      t.includes("casual") || t.includes("friendly")
        ? "Quick update:"
        : "Quick update:"; // keep "Quick update:" for professional demo

    const firstLine = `${opener} I’m ${r.replace(
      /-/g,
      " "
    )} — staying consistent isn’t about big wins, it’s about small, daily progress.`;
    const middle = `Every post, every update, every interaction compounds over time — habits beat heroics. A short note today keeps the conversation alive and helps your work find its audience.`;
    const closing = `If you’re building alone, remember: consistency beats intensity. Small, steady steps are how momentum grows.`;
    const hashtags = plat.includes("linkedin")
      ? "\n\n#solopreneur #consistency #buildinpublic"
      : " #solopreneur #consistency #buildinpublic";

    const combined = `${firstLine}\n${middle}\n\n${closing}${platformSuffix}${hashtags}`;
    // Ensure within a reasonable length for demo
    return safeTrim(combined, 1200);
  }

  // Tone-driven sentence starters (fallback)
  let opener;
  if (t.includes("casual") || t.includes("friendly")) opener = "Hey —";
  else if (t.includes("professional") || t.includes("formal"))
    opener = "Quick update:";
  else if (t.includes("witty") || t.includes("fun")) opener = "TL;DR:";
  else opener = "Note:";

  // Role mention
  const rolePhrase = `${r}`;

  // Compose two concise sentences: identity + CTA/connection
  const sentence1 = `${opener} I’m ${rolePhrase} — heads-down building and learning.`;
  // Keep the prompt verbatim included as a sentence for fidelity
  const sentence2 = `${p.endsWith(".") ? p : p + "."} ${
    t.includes("casual")
      ? "Let’s connect — reply or DM!"
      : "If this resonates, drop a comment or DM."
  }`;

  const combined = `${sentence1} ${sentence2}`.replace(/\s+/g, " ").trim();
  const trimmed =
    combined.length > 400 ? combined.slice(0, 397) + "…" : combined;
  return trimmed + platformSuffix;
}

/**
 * buildDemoAiDraft(reminder)
 * returns: { title, promptText, fullPost, meta }
 */
export function buildDemoAiDraft(reminder) {
  const rawPrompt =
    reminder?.content?.aiPrompt ||
    reminder?.prompt ||
    reminder?.content?.message ||
    "";

  // Prefer explicit fields when set
  const role = reminder?.content?.role || reminder?.role || "solopreneur";
  const tone = reminder?.content?.tone || reminder?.tone || "professional";
  const platform =
    reminder?.content?.platform || reminder?.platform || "LinkedIn";

  const frequency = (reminder?.frequency || "one_time").toLowerCase();
  const freqLabel =
    frequency === "daily"
      ? "Daily"
      : frequency === "weekly"
      ? "Weekly"
      : "One-time";

  const nextIso =
    reminder?.nextRunAtUTC_iso ||
    (reminder?.nextRunAtUTC instanceof Date
      ? reminder.nextRunAtUTC.toISOString()
      : reminder?.nextRunAtUTC) ||
    reminder?.nextRunUtc ||
    reminder?.nextRun ||
    null;
  const scheduledAt = nextIso
    ? formatNextRunForDisplay(nextIso)
    : "Next run soon";

  // Build the post using heuristics (now with improved consistency draft)
  const fullPost = synthesizePost({
    role,
    tone,
    platform,
    prompt:
      rawPrompt ||
      "Share a quick reflection on staying consistent as a solo founder",
  });

  // Assistant-style title
  const title = `Your draft is ready`;

  return {
    title,
    promptText: String(rawPrompt || "").trim(),
    fullPost,
    meta: {
      role,
      tone,
      platform,
      freqLabel,
      scheduledAt,
    },
  };
}
