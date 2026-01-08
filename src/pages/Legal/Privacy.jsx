import React from "react";

const Privacy = () => {
  return (
    <div className="max-w-4xl mt-20 mx-auto px-4 py-10 dark:text-white text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4 text-lg">Effective Date: August 2, 2025</p>

      <p className="mb-6 leading-relaxed">
        At RemindrAI, your privacy is a priority. This policy explains what data
        we collect, how we use it, and the measures we take to protect it. By
        using our service, you agree to the practices described here.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        1. Who We Are (Data Controller)
      </h2>
      <p className="mb-4 leading-relaxed">
        RemindrAI is an independent SaaS project developed and operated by{" "}
        <strong>Kuldeep Sharma</strong>
        and made available globally. For any privacy concerns or data requests,
        contact us at
        <a
          href="mailto:remindraiapp@gmail.com"
          className="text-blue-600 underline ml-1"
        >
          remindraiapp@gmail.com
        </a>
        .
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        2. Information We Collect
      </h2>
      <p className="mb-4 leading-relaxed">
        We collect only the data essential to operate and improve RemindrAI:
      </p>
      <ul className="list-disc list-inside ml-4 mb-4 space-y-2">
        <li>
          <strong>Account Details:</strong> Unique user ID (`uid`), email, full
          name (if provided), and secure authentication credentials managed by
          Firebase.
        </li>
        <li>
          <strong>Preferences:</strong> Your selected `role`, `tone`,
          `language`, `timezone`, `theme`, and preferred platform (e.g.,
          LinkedIn).
        </li>
        <li>
          <strong>Notification Settings:</strong> Reminder configurations such
          as `emailNotifications`, `activityAlerts`, `aiTips`, and `reminders`.
        </li>
        <li>
          <strong>Usage Metadata:</strong> Basic metrics like login count,
          session activity, and timestamps for last login and updates.
        </li>
      </ul>
      <p className="mt-4 leading-relaxed">
        We do <strong>not</strong> collect sensitive personal data, payment
        information, or use third-party cookies to track you across other
        websites.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        3. How We Use Your Data
      </h2>
      <p className="mb-4 leading-relaxed">
        Data is processed only for purposes directly related to our service:
      </p>
      <ul className="list-disc list-inside ml-4 mb-4 space-y-1">
        <li>
          <strong>Service Delivery:</strong> To create, manage, and authenticate
          your account.
        </li>
        <li>
          <strong>Reminders & Notifications:</strong> To send timely reminders
          and account updates based on your settings.
        </li>
        <li>
          <strong>Personalization:</strong> To tailor the app experience and
          content suggestions to your preferences.
        </li>
        <li>
          <strong>Improvement:</strong> To analyze anonymized usage patterns and
          enhance performance.
        </li>
      </ul>
      <p className="leading-relaxed">
        We never sell or trade your personal data.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        4. Legal Basis for Processing
      </h2>
      <p className="mb-4 leading-relaxed">
        Under GDPR, we process personal data based on:
      </p>
      <ul className="list-disc list-inside ml-4 mb-4 space-y-1">
        <li>
          <strong>Consent:</strong> You grant consent by creating an account and
          using our service.
        </li>
        <li>
          <strong>Legitimate Interest:</strong> We process data to maintain
          security, prevent abuse, and ensure service quality.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        5. AI Content Processing
      </h2>
      <p className="mb-4 text-yellow-700 font-medium leading-relaxed">
        Currently, no personal data or user content is sent to any external AI
        services. When AI-powered content generation is introduced, we will
        update this policy with complete details on how data is processed.
        <strong> [Update Coming Soon]</strong>
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        6. Third-Party Services
      </h2>
      <p className="mb-4 leading-relaxed">
        We use secure, GDPR-compliant third-party providers:
      </p>
      <ul className="list-disc list-inside ml-4 mb-4">
        <li>
          <strong>Firebase (Google LLC):</strong> For authentication and
          database storage.
        </li>
        <li>
          <strong>EmailJS:</strong> For sending user-requested notifications and
          emails.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        7. Data Storage, Security & Retention
      </h2>
      <p className="mb-4 leading-relaxed">
        Your data is encrypted and stored securely in Firebase. We retain data
        only for as long as your account remains active. When you delete your
        account, all associated data is permanently removed without delay.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">8. Your Rights</h2>
      <p className="mb-4 leading-relaxed">
        You may request access, correction, deletion, or export of your data at
        any time. To exercise your rights, contact us at
        <a
          href="mailto:remindraiapp@gmail.com"
          className="text-blue-600 underline ml-1"
        >
          remindraiapp@gmail.com
        </a>
        .
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">9. Children’s Privacy</h2>
      <p className="mb-4 leading-relaxed">
        RemindrAI is not directed at individuals under 18. We do not knowingly
        collect or store data from minors.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        10. International Data Transfers
      </h2>
      <p className="mb-4 leading-relaxed">
        Data may be processed on servers outside your country. All transfers
        meet applicable data protection standards.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        11. Emails & Notifications
      </h2>
      <p className="mb-4 leading-relaxed">
        We only send communications you have enabled (e.g., reminders, account
        updates). Marketing emails, if any, are sent only with your explicit
        consent.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">12. Policy Updates</h2>
      <p className="mb-4 leading-relaxed">
        This Privacy Policy may be updated as our service evolves. Major changes
        will be communicated via email or in-app notifications.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">13. Contact</h2>
      <p className="mb-4 leading-relaxed">
        For privacy-related questions or data requests, email us at
        <a
          href="mailto:remindraiapp@gmail.com"
          className="text-blue-600 underline ml-1"
        >
          remindraiapp@gmail.com
        </a>
        .
      </p>
    </div>
  );
};

export default Privacy;
