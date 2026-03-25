import React from "react";
import DocPage from "../components/DocPage";

export default function CreateAccount() {
  return (
    <DocPage
      title="Create an account"
      intro="Set up your account to start receiving drafts."
      steps={[
        {
          label: "Open RemindrAI",
          body: "Go to **remindrai.vercel.app** and select **Create account**.",
        },
        {
          label: "Enter your details",
          body: "Add your name, email, and password. Submit the form.",
        },
        {
          label: "Or continue with Google or GitHub",
          body: "Sign up using an existing account. No email verification is needed for Google authentication.",
        },
        {
          label: "Verify your email",
          body: "If you signed up with email and password, a **verification email** is sent. Open it to continue. If it’s not visible, check the spam **folder**.",
        },
      ]}
      next="verify-email"
    />
  );
}
