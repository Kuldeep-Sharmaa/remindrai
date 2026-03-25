import React from "react";
import DocPage from "../components/DocPage";

export default function Account() {
  return (
    <DocPage
      title="How do I manage my account?"
      intro="Update your password or permanently delete your account from Settings."
      steps={[
        {
          label: "Change password",
          body: "If your account was created with email and **password**, only the account owner can update it anytime from Settings. If you signed up with **Google** or **GitHub**, password management is handled through those services.",
        },
        {
          label: "Delete account",
          body: "You can permanently delete your account from Settings. This removes your prompts, drafts, and content setup. All your data will be **permanently deleted and cannot be recovered**.",
        },
      ]}
      note="Account deletion is permanent and cannot be undone."
      prev="preferences"
    />
  );
}
