import React from "react";
import DocPage from "../components/DocPage";

export default function CreatePrompt() {
  return (
    <DocPage
      title="How do I create a prompt?"
      intro="A prompt tells the system what to prepare and when to deliver it. Once activated it runs automatically."
      steps={[
        { label: "Open Studio", body: "Click **Studio** in the sidebar." },
        {
          label: "Click Create new prompt",
          body: "The button appears at the top of the Studio page.",
        },
        {
          label: "Check your Content Identity",
          body: "Your role, tone, and platform are shown at the top of the form. Click **Edit** if they need updating before continuing. Your Content Identity is used to generate the content, so it’s important to keep it up to date.",
        },
        {
          label: "Choose a draft type",
          body: "Select **AI Draft** to generate a full piece of content. Select **Simple Note** to keep a short idea ready to write yourself. ",
        },
        {
          label: "Write a brief",
          body: "Describe what the draft should focus on in one sentence. The limit is 120 characters.",
        },
        {
          label: "Set the frequency",
          body: "Choose how often the draft should be ready: **One time**, **Every day**, or **Every week**.",
        },
        {
          label: "Set delivery date and time",
          body: "Pick the date and time the draft should arrive. Your current timezone is shown next to the time field.",
        },
        {
          label: "Activate the prompt",
          body: "Click **Activate Prompt**. The prompt is now active and will run at the time you set.",
        },
      ]}
      prev="content-setup"
      next="content-inbox"
    />
  );
}
