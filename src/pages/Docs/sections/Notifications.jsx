import React from "react";
import DocPage from "../components/DocPage";

export default function Notifications() {
  return (
    <DocPage
      title="Notifications"
      intro="Drafts are delivered as notifications when they are ready."
      steps={[
        {
          label: "Allow notifications",
          body: "A permission prompt appears when you create your account. **Allow it to receive draft alerts**. If you denied it, you can enable notifications from your browser settings.",
        },
        {
          label: "If notifications are off",
          body: "Enable them from your browser settings to start receiving alerts. RemindrAI uses **browser push notifications**, so they must be enabled for the system to work properly.",
        },
        {
          label: "Using Android",
          body: "Android may mark notifications as spam **if you allow them after initially denying**. To get clean alerts, go to your **browser site settings** for RemindrAI and set notifications to **Always allow**.",
        },
        {
          label: "Using iPhone or iPad",
          body: "Install RemindrAI on your **home screen** to **receive notifications**. This is **required for notifications to work on iOS**. Open RemindrAI in Safari, tap the share button, and select **Add to Home Screen**. Once added, you will receive notifications as expected.",
        },
        {
          label: "Adjust preferences",
          body: "You can update notification settings anytime from RemindrAI Settings.",
        },
      ]}
      note="Browser push notifications require permission. They don't affect draft delivery - only whether you get alerted when a draft is ready."
      prev="timezone"
      next="preferences"
    />
  );
}
