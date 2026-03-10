import React from "react";
import DocPage from "../components/DocPage";

export default function ContentInbox() {
  return (
    <DocPage
      title="Where does generated content appear?"
      intro="All drafts appear in Deliveries once they are ready. No action is needed — they arrive automatically."
      steps={[
        {
          label: "Open Deliveries",
          body: "Click **Deliveries** in the sidebar. The total number of drafts is shown at the top.",
        },
        {
          label: "Read a draft",
          body: "Each item shows the brief title, a content preview, and the delivery time. Click a draft to open the full content.",
        },
        {
          label: "Filter your drafts",
          body: "Use the tabs to switch between **All**, **Unread**, and **Today**. The dropdown lets you filter by delivery type.",
        },
      ]}
      prev="create-prompt"
      next="manage-prompts"
    />
  );
}
