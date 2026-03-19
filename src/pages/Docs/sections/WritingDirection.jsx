import React from "react";
import DocPage from "../components/DocPage";

export default function WritingDirection() {
  return (
    <DocPage
      title="How to write good prompts for better drafts?"
      intro="The quality of your drafts depends on how clearly you describe what they should be about."
      steps={[
        {
          label: "Start with a clear topic",
          body: "Write what you want to talk about. Keep it focused on one area instead of combining multiple ideas.\n\nExamples:\n• startup lessons from building a product\n• react tips for beginners\n• marketing insights from real campaigns",
        },
        {
          label: "Add context if needed",
          body: "If your topic is broad, add a bit more detail so the system understands the angle.\n\nExamples:\n• instead of “marketing”, write “what worked and failed in recent marketing experiments”\n• instead of “content”, write “daily content ideas for developers”",
        },
        {
          label: "Avoid vague inputs",
          body: "Inputs like “content ideas” or “marketing” are too general. More specific direction leads to better drafts.\n\nExamples:\n• “linkedin post ideas” → too broad\n• “lessons from growing on linkedin” → clearer",
        },
        {
          label: "Think in terms of what you share",
          body: "Use the same kind of topics you usually post about. The system continues from that pattern.\n\nExamples:\n• founder updates and learnings\n• developer workflow improvements\n• building in public experiences",
        },
      ]}
      note="Clear, focused input leads to more accurate drafts."
      prev="preferences"
      next="delivery"
    />
  );
}
