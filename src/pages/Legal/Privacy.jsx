import React from "react";

const Privacy = () => {
  return (
    <div className="max-w-4xl mt-20 mx-auto px-4 py-10 dark:text-white text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4 text-lg">Effective Date: 16-02-2026</p>

      <p className="mb-6 leading-relaxed">
        RemindrAI is designed to keep data minimal and focused - only what's
        required to run the system is collected and used. Your content and
        inputs belong to you, and we do not sell your data. This policy explains
        what we collect, how it's used, and your control over it.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. What We Collect</h2>
      <p className="mb-3 leading-relaxed">
        We only collect what is needed to run the system.
      </p>

      <p className="font-medium mb-1">Account Information</p>
      <ul className="list-disc list-inside ml-4 mb-4 space-y-1">
        <li>Email address</li>
        <li>Unique user ID</li>
        <li>Basic profile details (if you provide them)</li>
      </ul>

      <p className="font-medium mb-1">Your Inputs</p>
      <ul className="list-disc list-inside ml-4 mb-4 space-y-1">
        <li>What you write inside the system</li>
        <li>Your writing direction (role, tone, platform, etc.)</li>
        <li>Your saved drafts and history</li>
      </ul>

      <p className="font-medium mb-1">Preferences</p>
      <ul className="list-disc list-inside ml-4 mb-4 space-y-1">
        <li>Time settings</li>
        <li>Notification choices</li>
        <li>App settings (theme, timezone, etc.)</li>
      </ul>

      <p className="font-medium mb-1">Basic Usage Data</p>
      <ul className="list-disc list-inside ml-4 mb-4 space-y-1">
        <li>Login activity</li>
        <li>Timestamps (created, updated, last active)</li>
      </ul>

      <p className="mb-4 leading-relaxed">
        We do not collect sensitive personal data or payment information.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        2. How Your Data Is Used
      </h2>
      <p className="mb-3 leading-relaxed">
        Your data is used only to make the system work:
      </p>
      <ul className="list-disc list-inside ml-4 mb-4 space-y-1">
        <li>To create and deliver drafts</li>
        <li>To keep your history available</li>
        <li>To improve how future drafts match your writing style</li>
        <li>To send system-related notifications</li>
      </ul>
      <p className="mb-4 leading-relaxed">We do not sell your data.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        3. How Drafts Are Generated
      </h2>
      <p className="mb-2 leading-relaxed">
        When a draft is created, your input (and sometimes your past drafts) may
        be processed by external AI services to generate the result.
      </p>
      <p className="mb-2 leading-relaxed">
        This processing is limited to what is required to create the draft.
      </p>
      <p className="mb-4 leading-relaxed">
        We do not use your data for unrelated purposes.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        4. Third-Party Services
      </h2>
      <p className="mb-3 leading-relaxed">
        We use trusted services to run the system:
      </p>
      <ul className="list-disc list-inside ml-4 mb-4 space-y-2">
        <li>
          <strong>Firebase (Google)</strong> — authentication and database.{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Privacy Policy
          </a>
        </li>
        <li>
          <strong>Vercel</strong> — hosting and deployment.{" "}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Privacy Policy
          </a>
        </li>
        <li>
          <strong>External AI provider</strong> — draft generation.{" "}
          <a
            href="https://openai.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Privacy Policy
          </a>
        </li>
      </ul>
      <p className="mb-4 leading-relaxed">
        These services may process your data as part of providing their
        functionality. We do not control how they use or store your data beyond
        what is necessary for our system to work. Please review their respective
        privacy policies for more details.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        5. Data Storage & Security
      </h2>
      <p className="mb-4 leading-relaxed">
        Your data is stored securely using Firebase. We take reasonable steps to
        protect it, but no system is completely risk-free.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Data Retention</h2>
      <p className="mb-2 leading-relaxed">
        Your data stays as long as your account exists.
      </p>
      <p className="mb-4 leading-relaxed">
        If you delete your account, your data is permanently removed.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Your Control</h2>
      <p className="mb-3 leading-relaxed">You can:</p>
      <ul className="list-disc list-inside ml-4 mb-4 space-y-1">
        <li>Access your data</li>
        <li>Update your information</li>
        <li>Delete your account</li>
      </ul>
      <p className="mb-4 leading-relaxed">
        For anything else, you can contact us.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">8. Notifications</h2>
      <p className="mb-4 leading-relaxed">
        RemindrAI may send notifications related to your activity. You can
        control these in your settings.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">9. Changes</h2>
      <p className="mb-4 leading-relaxed">
        This policy may be updated as the system evolves. If changes are
        important, you will be informed.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">10. Contact</h2>
      <p className="mb-4 leading-relaxed">
        <a
          href="mailto:remindraiapp@gmail.com"
          className="text-blue-600 underline"
        >
          remindraiapp@gmail.com
        </a>
      </p>
    </div>
  );
};

export default Privacy;
