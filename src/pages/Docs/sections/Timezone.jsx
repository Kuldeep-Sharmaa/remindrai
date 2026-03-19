import React from "react";
import DocPage from "../components/DocPage";

export default function Timezone() {
  return (
    <DocPage
      title="Timezone"
      intro="Draft timing follows your device’s local time."
      steps={[
        {
          label: "Automatic detection",
          body: "Your timezone is detected from your device.",
        },
        {
          label: "Keep your device time correct",
          body: "Drafts are prepared and delivered based on your current local time.",
        },
        {
          label: "If timing feels off",
          body: "Check your device timezone settings. The app does not override it.",
        },
      ]}
      note="Timezone cannot be changed inside the app."
      prev="manage-prompts"
      next="notifications"
    />
  );
}
