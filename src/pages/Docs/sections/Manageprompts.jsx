import React from "react";
import DocPage from "../components/DocPage";

export default function ManagePrompts() {
  return (
    <DocPage
      title="How do I manage my prompts?"
      intro="Active prompts can be viewed or deleted. Prompts cannot be edited — to change one, delete it and create a new one."
      steps={[
        {
          label: "Open Studio",
          body: "Click **Studio** in the sidebar. Active prompts are listed under **Active Prompts**.",
        },
        {
          label: "View a prompt",
          body: "Click the eye icon on a prompt card to see its full details.",
        },
        {
          label: "Delete a prompt",
          body: "Click the **trash icon** on the right side of the prompt card. The prompt is removed immediately.",
        },
        {
          label: "View past prompts",
          body: "Completed prompts appear under **Past Prompts** at the bottom of Studio. These are read-only.",
        },
      ]}
      note="If you delete a prompt that has already delivered drafts, those drafts remain available in your Deliveries inbox."
      prev="content-inbox"
      next="timezone"
    />
  );
}
