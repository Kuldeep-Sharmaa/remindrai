import React from "react";
import DocPage from "../components/DocPage";
import { Link } from "react-router-dom";

export default function ManagePrompts() {
  return (
    <DocPage
      title="How do I manage my prompts?"
      intro="Active prompts can be viewed or deleted. They cannot be edited."
      steps={[
        {
          label: "Open Studio",
          body: "Click **Studio** in the sidebar. Active prompts are listed under **Active Prompts**.",
        },
        {
          label: "View a prompt",
          body: "Click the eye icon on a prompt card to see its full details. ",
        },
        {
          label: "Delete a prompt",
          body: "Click the **trash icon** on the right side of the Active prompt card. This will permanently delete the prompt and stop any future drafts from being delivered.",
        },
        {
          label: "View past prompts",
          body: "Completed prompts appear under **Past Prompts** at the bottom of Studio. These are read-only.",
        },
      ]}
      note={
        <>
          Deleting a prompt does not remove drafts that were already delivered.
          Those drafts remain available in your{" "}
          <Link to="/workspace/drafts" className="underline">
            Drafts
          </Link>{" "}
          Inbox .
        </>
      }
      prev="content-inbox"
      next="timezone"
    />
  );
}
