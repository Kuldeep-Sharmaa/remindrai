import React from "react";
import DocPage from "../components/DocPage";

export default function WritingDirection() {
  return (
    <DocPage
      title="Write better prompts → get better drafts"
      intro="Your input shapes the draft. The clearer your thinking, the more useful the result will feel."
      steps={[
        {
          label: "Start with one clear idea",
          body: "Don’t try to cover everything at once. Pick one thought, one experience, or one insight.\n\nExamples:\n• lessons from building my first product\n• what I learned from debugging a production issue\n• mistakes I made while growing on LinkedIn",
        },
        {
          label: "Give direction, not just a topic",
          body: "A simple topic is okay, but adding direction helps the system understand your angle.\n\nExamples:\n• “marketing” → too broad\n• “what worked and failed in recent marketing experiments” → better\n\nThink: what exactly do you want to say about it?",
        },
        {
          label: "Avoid vague inputs",
          body: "If your input is unclear, the output will feel generic.\n\nExamples:\n• “content ideas” → unclear\n• “how I come up with content ideas consistently” → clearer\n\nMore clarity → more useful drafts.",
        },
        {
          label: "Write like you think",
          body: "Use the same kind of ideas you naturally share.\n\nExamples:\n• something you learned recently\n• a mistake you made\n• a small insight from your work\n\nThe system works best when your input feels real, not forced.",
        },
      ]}
      note="Good input doesn’t need to be perfect. It just needs to be clear."
      prev="preferences"
      next="delivery"
    />
  );
}
