import React from "react";
import DocPage from "../components/DocPage";

export default function DeliveryTiming() {
  return (
    <DocPage
      title="Why my draft is not delivered exactly on time?"
      intro="Drafts are prepared around the selected time. Exact timing is not second-level precise."
      steps={[
        {
          label: "The system runs in short intervals",
          body: "Drafts are prepared in **regular intervals** instead of continuously.",
          footer:
            "Because of this, preparation may start shortly after the selected time.",
        },
        {
          label: "Timing is approximate",
          body: "A draft may arrive a few minutes **after** the time you selected.",
          footer:
            "This is expected behavior and part of how the system operates.",
        },
        {
          label: "Preparation continues automatically",
          body: "If a draft is not ready exactly on time, it is usually **already in progress**.",
          footer: "No action is required from your side.",
        },
        {
          label: "Why this approach is used",
          body: "Running in intervals keeps the system stable and consistent across all users.",
          footer:
            "It avoids missed executions and ensures drafts are always delivered.",
        },
      ]}
      note="Most drafts are delivered within a few minutes of the selected time. If it takes longer, the system continues processing until it is ready."
      prev="writing-direction"
      next="delivery"
    />
  );
}
