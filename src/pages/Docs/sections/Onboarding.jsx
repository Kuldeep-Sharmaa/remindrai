import React from "react";
import DocPage from "../components/DocPage";

export default function Onboarding() {
  return (
    <DocPage
      title="What happens during onboarding?"
      intro="Onboarding sets your Content Identity — the direction the system uses for every draft you receive."
      steps={[
        {
          label: "Select your role",
          body: "Choose the role that best describes how you write. For example: career-builder, founder, or developer.",
        },
        {
          label: "Choose a tone",
          body: "Pick the tone that fits your writing style. For example: professional, casual, or direct.",
        },
        {
          label: "Select a platform",
          body: "Choose the platform you write for most. For example: LinkedIn, Twitter, or Facebook.",
        },
        {
          label: "Save",
          body: "Your selections are saved as your **Content Identity**. The system uses this for every draft it prepares going forward.",
        },
      ]}
      note="You can update your Content Identity later from the Studio screen at any time."
      prev="verify-email"
      next="workspace"
    />
  );
}
