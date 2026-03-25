import React from "react";
import DocPage from "../components/DocPage";
import { Link } from "react-router-dom";

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
      note={
        <>
          System follow your content setup and{" "}
          <Link to="/workspace/settings/preferences" className="underline">
            preferences
          </Link>{" "}
          settings.
        </>
      }
      prev="notifications"
      next="account"
    />
  );
}
