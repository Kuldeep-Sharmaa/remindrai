import React from "react";
import DocPage from "../components/DocPage";

export default function ContentSetup() {
  return (
    <DocPage
      title="How do I update my content setup?"
      intro="Your Content Identity defines your role, tone, and platform. Every draft uses this setup automatically."
      steps={[
        { label: "Open Studio", body: "Click **Studio** in the sidebar." },
        {
          label: "Find your Content Identity card",
          body: "It appears at the top of the Studio page, showing your current role, tone, and platform.",
        },
        {
          label: "Click Edit",
          body: "Click the **Edit** button on the right side of the card to update any of the three values.",
        },
        {
          label: "Save",
          body: "Your updated identity is saved immediately and applies to all future drafts.",
        },
      ]}
      prev="workspace"
      next="create-prompt"
    />
  );
}
