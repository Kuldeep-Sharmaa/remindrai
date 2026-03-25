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
          body: "Remindrai detects **automatically** your timezone from your device.This ensures drafts are delivered at the right local time without manual setup.",
        },
        {
          label: "Keep your device time correct",
          body: "Drafts are prepared and delivered based on your current local time.",
        },
        {
          label: "If timing feels off",
          body: "Check your device timezone settings. RemindrAI relies on your device time, so if it’s incorrect, draft delivery may be affected.",
        },
      ]}
      note="Timezone cannot be changed inside the app."
      prev="manage-prompts"
      next="notifications"
    />
  );
}
