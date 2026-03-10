import React from "react";
import DocPage from "../components/DocPage";

export default function Workspace() {
  return (
    <DocPage
      title="What is inside the Workspace?"
      intro="The Workspace is the main area of the product. The sidebar gives access to four sections."
      steps={[
        {
          label: "Overview",
          body: "Shows the next draft currently in preparation — brief, delivery time, platform, and frequency.",
        },
        {
          label: "Studio",
          body: "Where you create and manage prompts. Your Content Identity is displayed at the top.",
        },
        {
          label: "Deliveries",
          body: "Where all generated drafts appear once they are ready. Filter by All, Unread, or Today.",
        },
        {
          label: "Settings",
          body: "Manage your timezone, notifications, preferences, and account.",
        },
      ]}
      prev="onboarding"
      next="content-setup"
    />
  );
}
