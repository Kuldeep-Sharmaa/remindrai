import React from "react";
import DocPage from "../components/DocPage";

export default function UsageLimits() {
  return (
    <DocPage
      title="How do usage limits work?"
      intro="RemindrAI uses two limits - active prompts and daily drafts. Active prompts control how many prompts can run at once, while daily drafts control how many AI drafts are generated per day."
      steps={[
        {
          label: "Active prompts",
          body: "You can keep up to **3 prompts** active at a time. These are the prompts the system schedules and runs for you. If all 3 are in use, you need to remove one before adding another. This limit applies only to **AI prompts**. **Simple notes** do not count toward this and can be used without restriction.",
        },
        {
          label: "Daily drafts",
          body: "RemindrAI generates up to **3 AI drafts per day**. Each generated draft counts toward this limit. Once all 3 are used, no additional drafts are generated until the next reset.",
        },
        {
          label: "When drafts run out",
          body: "Active prompts remain scheduled at their set times, but **no new drafts are generated** until the limit resets. You can still remove active prompts, but adding new ones is blocked until drafts are available again.",
        },
        {
          label: "Limit reset",
          body: "Limits reset every day at **midnight in your local timezone**. The draft count returns to **0**, and a new daily cycle begins. Active prompts remain unchanged and continue to run as scheduled once drafts are available again.",
        },
        {
          label: "Token usage",
          body: "Each AI draft uses **tokens** (AI processing units). A single draft typically consumes up to **~1,000 tokens**.\n\nWith the daily limit of up to **3 drafts**, total usage is around **2,500–3,500 tokens per day** per account.",
          pointsLabel: "This ensures:",
          points: [
            "Consistent performance",
            "Predictable usage",
            "Stable operation of the product",
          ],
          footer:
            "RemindrAI is an independent product. These limits help keep the system reliable and consistently available for all users. ",
        },
      ]}
      note="Active prompts and daily drafts are independent limits. Reaching one does not affect the other."
      prev="managingprompts"
      next="writingdirection"
    />
  );
}
