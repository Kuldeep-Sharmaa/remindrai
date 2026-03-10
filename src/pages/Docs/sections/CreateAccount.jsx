import React from "react";
import DocPage from "../components/DocPage";

export default function CreateAccount() {
  return (
    <DocPage
      title="How do I create an account?"
      intro="Sign up takes less than a minute. You will need a valid email address."
      steps={[
        {
          label: "Open the homepage",
          body: "Go to remindrai.com and click **Get started**.",
        },
        {
          label: "Enter your details",
          body: "Fill in your email address and choose a password, then submit the form.",
        },
        {
          label: "Check your inbox",
          body: "A verification email is sent immediately. Open it to continue.",
        },
      ]}
      next="verify-email"
    />
  );
}
