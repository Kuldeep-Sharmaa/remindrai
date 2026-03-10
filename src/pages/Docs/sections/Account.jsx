import React from "react";
import DocPage from "../components/DocPage";

export default function Account() {
  return (
    <DocPage
      title="How do I manage my account?"
      intro="Update your password or permanently delete your account from Settings."
      steps={[
        {
          label: "Change your password",
          body: "Go to **Settings → Security**. Enter your new password and confirm. You may need to re-authenticate first.",
        },
        {
          label: "Delete your account",
          body: "Go to **Settings → Delete Account**. Confirm your choice to permanently remove your account, all prompts, all drafts, and your Content Identity.",
        },
      ]}
      note="Account deletion is permanent and cannot be undone."
      prev="preferences"
    />
  );
}
