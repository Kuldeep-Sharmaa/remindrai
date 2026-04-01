import React from "react";

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 mt-20 text-gray-800 dark:text-white">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
      <p className="mb-4">Effective Date: 16-02-2026</p>

      <p className="mb-6">
        Welcome to RemindrAI. RemindrAI is a system designed to help you stay
        consistent with your content. You set a time and direction, and at that
        moment, a fresh draft is created for you based on your input. By using
        RemindrAI, you agree to these Terms.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Using RemindrAI</h2>
      <p className="mb-4">
        You agree to use RemindrAI in a lawful and responsible way. Do not
        attempt to misuse, disrupt, or break the system. Respect the rights of
        others and do not use RemindrAI to create harmful, offensive, or illegal
        content. We reserve the right to suspend or remove access for users who
        violate these terms.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Your Account</h2>
      <p className="mb-4">
        You are responsible for your account and everything that happens under
        it. If you suspect unauthorized access, contact us immediately. We may
        suspend or remove accounts in cases of misuse or abuse.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        3. How the System Works
      </h2>
      <p className="mb-2">RemindrAI runs on a simple flow:</p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>You define what you want to write about</li>
        <li>You choose when it should be created</li>
        <li>At that time, a new draft is generated for you</li>
      </ul>
      <p className="mb-2">
        Each draft is created at that moment. It is not pre-written or reused.
      </p>
      <p className="mb-2">
        Drafts are not published automatically. You review and decide what to
        do.
      </p>
      <p className="mb-4">
        While the system is designed to run reliably, delays or missed
        executions can happen.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Your Content</h2>
      <p className="mb-2">
        Everything you write, store, or generate inside RemindrAI belongs to
        you. We use your content only to:
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>generate drafts</li>
        <li>maintain your history</li>
        <li>help the system understand your writing style over time</li>
      </ul>
      <p className="mb-4">We do not claim ownership of your content.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Generated Drafts</h2>
      <p className="mb-4">
        Drafts are suggestions. They may not always be accurate, complete, or
        suitable for your needs. You are responsible for reviewing and deciding
        how to use them.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">6. Notifications</h2>
      <p className="mb-4">
        RemindrAI may notify you when a draft is ready. If a notification is
        delayed or not delivered, your draft may still be available inside the
        system.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. Free Usage</h2>
      <p className="mb-4">
        RemindrAI is currently free to use. This may change in the future. If it
        does, you will be informed clearly in advance.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        8. Service Availability
      </h2>
      <p className="mb-4">
        RemindrAI is provided as it is. There may be downtime, bugs, or
        unexpected issues. We do not guarantee uninterrupted or error-free
        operation.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        9. Limitation of Liability
      </h2>
      <p className="mb-2">We are not responsible for:</p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>how you use the drafts</li>
        <li>any outcomes from using the system</li>
        <li>missed or delayed draft creation</li>
      </ul>
      <p className="mb-4">Use the system at your own discretion.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">10. Changes</h2>
      <p className="mb-4">
        These Terms may be updated over time. If changes are important, you will
        be notified.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">11. Contact</h2>
      <p className="mb-4">
        For questions:{" "}
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

export default Terms;
