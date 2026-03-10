import React from "react";
import DocPage from "../components/DocPage";

export default function Timezone() {
  return (
    <DocPage
      title="How do I change my timezone?"
      intro="All draft delivery times use your timezone setting. If drafts are arriving at unexpected times, check this first."
      steps={[
        { label: "Open Settings", body: "Click **Settings** in the sidebar." },
        {
          label: "Find your timezone",
          body: "Your current timezone is shown in the Preferences section.",
        },
        {
          label: "Update the timezone",
          body: "Select the correct timezone from the dropdown. Changes apply to all future deliveries.",
        },
      ]}
      note="Changing your timezone does not affect drafts that have already been delivered."
      prev="manage-prompts"
      next="notifications"
    />
  );
}
