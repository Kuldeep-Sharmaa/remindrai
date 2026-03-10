import React from "react";
import DocPage from "../components/DocPage";

export default function Notifications() {
  return (
    <DocPage
      title="How do I manage notifications?"
      intro="Control how RemindrAI notifies you about draft deliveries and account activity."
      steps={[
        { label: "Open Settings", body: "Click **Settings** in the sidebar." },
        {
          label: "Go to Notifications",
          body: "Find the **Notifications** section.",
        },
        {
          label: "Toggle preferences",
          body: "Enable or disable email notifications for draft deliveries and account activity.",
        },
      ]}
      prev="timezone"
      next="preferences"
    />
  );
}
