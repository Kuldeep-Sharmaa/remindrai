import React from "react";
import DocPage from "../components/DocPage";

export default function Notifications() {
  return (
    <DocPage
      title="Notifications"
      intro="Drafts are delivered as notifications when they are ready."
      steps={[
        {
          label: "Allow notifications",
          body: "A permission prompt appears when you create your account. Allow it to receive draft alerts.",
        },
        {
          label: "If notifications are off",
          body: "Enable them from your browser settings to start receiving alerts.",
        },
        {
          label: "Using iPhone or iPad",
          body: "Install RemindrAI on your home screen to receive notifications. This is required for notifications to work on iOS.",
        },
        {
          label: "Adjust preferences",
          body: "You can update notification settings anytime from Settings.",
        },
      ]}
      prev="timezone"
      next="preferences"
    />
  );
}
