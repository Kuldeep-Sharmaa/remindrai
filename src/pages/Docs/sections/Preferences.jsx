import React from "react";
import DocPage from "../components/DocPage";

export default function Preferences() {
  return (
    <DocPage
      title="How do I change app preferences?"
      intro="General display and app preferences are available in Settings."
      steps={[
        { label: "Open Settings", body: "Click **Settings** in the sidebar." },
        {
          label: "Open Preferences",
          body: "Find the **Preferences** section and adjust theme and display settings.",
        },
      ]}
      prev="notifications"
      next="account"
    />
  );
}
