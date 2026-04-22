import React from "react";
import DocPage from "../components/DocPage";

export default function VerifyEmail() {
  return (
    <DocPage
      title="Verify your email"
      intro="Your account is waiting for verification."
      steps={[
        {
          label: "Open the email",
          body: "A verification link is sent to your inbox.",
        },
        {
          label: "Click the link",
          body: "Once verified, you are redirected to onboarding automatically.",
        },
        {
          label: "Did not receive it",
          body: "Check the spam folder or request a new email. If issues persist, contact support.",
        },
      ]}
      next="onboarding"
    />
  );
}
