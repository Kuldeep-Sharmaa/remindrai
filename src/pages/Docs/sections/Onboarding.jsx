import React from "react";
import DocPage from "../components/DocPage";

export default function Onboarding() {
  return (
    <DocPage
      title="Onboarding"
      intro="This sets the direction for the drafts you receive."
      steps={[
        {
          label: "Select your role",
          body: "Choose how you write. For example: founder, developer, or creator.",
        },
        {
          label: "Choose a tone",
          body: "Pick how your writing should sound. For example: professional, casual, or direct.",
        },
        {
          label: "Select a platform",
          body: "Choose the platform you write for most. For example: LinkedIn, Twitter, or Facebook.",
        },
        {
          label: "Finish",
          body: "This becomes your content identity and is used for future drafts.",
        },
      ]}
      note="This can be changed later from preferences. Your selections help tailor drafts to your style and audience, but you can update them anytime to shift your content's direction."
      prev="verify-email"
      next="workspace"
    />
  );
}
