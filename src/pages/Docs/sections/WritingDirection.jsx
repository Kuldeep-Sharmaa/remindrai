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
          body: "Don’t try to cover everything at once. Pick one thought, one experience, or one insight.",
          pointsLabel: "Examples:",
          points: [
            "lessons from building my first product",
            "what I learned from debugging a production issue",
            "mistakes I made while growing on LinkedIn",
          ],
        },
        {
          label: "Give direction, not just a topic",
          body: "A simple topic is okay, but adding direction helps the system understand your angle.",
          pointsLabel: "Examples:",
          points: [
            "“marketing” → too broad",
            "“what worked and failed in recent marketing experiments” → better",
          ],
          footer: "Think: what exactly do you want to say about it?",
        },
        {
          label: "Avoid vague inputs",
          body: "If your input is unclear, the output will feel generic.",
          pointsLabel: "Examples:",
          points: [
            "“content ideas” → unclear",
            "“how I come up with content ideas consistently” → clearer",
          ],
          footer: "More clarity → more useful drafts.",
        },
        {
          label: "Write like you think",
          body: "Use the same kind of ideas you naturally share.",
          pointsLabel: "Examples:",
          points: [
            "something you learned recently",
            "a mistake you made",
            "a small insight from your work",
          ],
          footer:
            "The system works best when your input feels real and clear .",
        },
      ]}
      note="Good input doesn’t need to be long. It just needs to be focused on a specific idea."
      prev="preferences"
      next="delivery"
    />
  );
}
