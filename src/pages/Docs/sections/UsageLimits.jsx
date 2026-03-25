import React from "react";
import DocPage from "../components/DocPage";

export default function UsageLimits() {
  return (
    <DocPage
      title="How do usage limits work?"
      intro="RemindrAI runs on two limits - active prompts and daily drafts. One controls how many prompts are run at once, the other controls how many drafts get generated per day."
      steps={[
        {
          label: "Active prompts",
          body: "You can keep up to **3 prompts** active at a time. These are the prompts the system schedules and runs for you. If all 3 are active, you'll need to remove one before adding another. Slot counts **AI prompts** only, not **Simple notes**. You can have as many simple notes as you want without affecting this limit.",
        },
        {
          label: "Daily drafts",
          body: "RemindrAI generates up to **3 drafts per day**. Each generated draft counts toward this limit. Once all 3 are used, prompts stay active but you cannot add more drafts until the limit resets or active slots become available.",
        },
        {
          label: "When drafts run out",
          body: "Prompts continue running on the selected time, but **draft generation is paused** until the next reset. You can still remove active prompts but cannot add new ones until the limit resets.",
        },
        {
          label: "Limit reset",
          body: "Limits reset every day at **midnight in your local timezone**. Draft count resets to **0**, and your next day limit starts fresh. Active prompts remain active across resets until you choose to remove them. The system will generate drafts once the limit resets and active prompts are available to run.",
        },
        {
          label: "Token usage",
          body: "Each AI draft uses **tokens** (AI processing units). A single draft typically consumes up to **~1,000 tokens**.\n\nWith the daily limit of up to **3 drafts**, total usage is around **2,500–3,500 tokens per day** per account.",
          pointsLabel: "This limit ensures:",
          points: [
            "Consistent performance",
            "Token usage is predictable and manageable",
            "Sustainable operation of the product",
          ],
          footer:
            "RemindrAI is an independent product - these limits help keep the service reliable and available.",
        },
      ]}
      note="Active prompts and daily drafts are separate limits. Reaching one does not affect the other."
      prev="managingprompts"
      next="writingdirection"
    />
  );
}
