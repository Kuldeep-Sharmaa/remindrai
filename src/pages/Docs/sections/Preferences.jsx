import React from "react";
import DocPage from "../components/DocPage";

export default function Preferences() {
  return (
    <DocPage
      title="Preferences"
      intro="These settings influence how your drafts are written and delivered."
      steps={[
        {
          label: "Open Settings",
          body: "Go to Settings from the sidebar.",
        },
        {
          label: "Update preferences",
          body: "Adjust how drafts should be delivered and how the system behaves.",
        },
      ]}
      note="Drafts follow your content setup and preferences together."
      prev="notifications"
      next="account"
    />
  );
}
