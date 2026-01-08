import React from "react";

const GDPR = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 mt-20 text-gray-800 dark:text-white">
      <h1 className="text-3xl font-bold mb-6">GDPR Compliance</h1>
      <p className="mb-4 text-lg">Effective Date: August 2, 2025</p>

      <p className="mb-6 leading-relaxed">
        RemindrAI is built for a global audience and fully respects the privacy
        rights of individuals in the European Union (EU) and European Economic
        Area (EEA). This statement explains how we comply with the General Data
        Protection Regulation (GDPR) and outlines your rights regarding your
        personal data.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        1. Legal Basis for Processing
      </h2>
      <p className="mb-4 leading-relaxed">
        We process personal data under the following legal bases:
      </p>
      <ul className="list-disc list-inside ml-4 mb-4 space-y-1">
        <li>
          <strong>Consent:</strong> You give consent when you create an account
          and use our services.
        </li>
        <li>
          <strong>Contractual Necessity:</strong> Processing is required to
          deliver the RemindrAI service under our Terms & Conditions.
        </li>
        <li>
          <strong>Legitimate Interests:</strong> We may process data to ensure
          security, prevent misuse, and improve our services.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        2. Personal Data We Process
      </h2>
      <p className="mb-4 leading-relaxed">
        We only process data essential for providing and improving our services:
      </p>
      <ul className="list-disc list-inside ml-4 mb-4 space-y-1">
        <li>
          <strong>Account Information:</strong> Email, full name (if provided),
          encrypted password, and associated timestamps.
        </li>
        <li>
          <strong>Usage Data:</strong> Login count, session details, last login
          time, and related activity logs.
        </li>
        <li>
          <strong>Preferences:</strong> Platform, tone, role, and notification
          settings configured by you.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        3. Roles in Data Processing
      </h2>
      <p className="mb-4 leading-relaxed">
        RemindrAI acts as the <strong>Data Controller</strong> for
        account-related data we collect. For content you create or schedule, you
        remain the <strong>Data Controller</strong>, and we act as the{" "}
        <strong>Data Processor</strong>, handling it only as instructed by you.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Your GDPR Rights</h2>
      <p className="mb-4 leading-relaxed">
        If you are an EU resident, you have the right to:
      </p>
      <ul className="list-disc list-inside ml-4 mb-4 space-y-1">
        <li>
          <strong>Access</strong> the data we hold about you
        </li>
        <li>
          <strong>Rectify</strong> incorrect or incomplete data
        </li>
        <li>
          <strong>Erase</strong> your data ("Right to be Forgotten")
        </li>
        <li>
          <strong>Port</strong> your data to another service
        </li>
        <li>
          <strong>Restrict</strong> or <strong>Object</strong> to processing
        </li>
        <li>
          <strong>Withdraw Consent</strong> at any time
        </li>
      </ul>
      <p className="mb-4">
        To exercise these rights, email us at
        <a
          href="mailto:remindraiapp@gmail.com"
          className="text-blue-600 underline ml-1"
        >
          remindraiapp@gmail.com
        </a>
        .
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        5. International Data Transfers
      </h2>
      <p className="mb-4 leading-relaxed">
        Data may be stored on servers outside the EU. We ensure that such
        transfers meet GDPR standards and are protected by appropriate
        safeguards.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        6. Third-Party Services
      </h2>
      <p className="mb-4 leading-relaxed">
        We use trusted providers such as <strong>Firebase</strong> (for
        authentication and secure storage) and <strong>EmailJS</strong> (for
        notifications). These services comply with GDPR and maintain
        industry-leading security practices.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">7. AI Data Processing</h2>
      <p className="mb-4 text-yellow-700 font-medium leading-relaxed">
        Currently, no personal data is processed by external AI models. When
        AI-powered features are introduced, this section will be updated with
        clear information on how data is handled.
        <strong> [Update Coming Soon]</strong>
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">8. Complaints</h2>
      <p className="mb-4 leading-relaxed">
        If you believe we are not processing your data in line with GDPR, you
        may lodge a complaint with your local data protection authority.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">9. Contact</h2>
      <p className="mb-4 leading-relaxed">
        For GDPR-related questions or requests, contact our privacy lead,
        Kuldeep Sharma, at
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

export default GDPR;
