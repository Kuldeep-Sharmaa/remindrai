import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";

const CONTACT_OPTIONS = [
  {
    label: "Report a bug",
    subject: "Bug Report — RemindrAI",
  },
  {
    label: "Feature request",
    subject: "Feature Request — RemindrAI",
  },
  {
    label: "General question",
    subject: "General Question — RemindrAI",
  },
];

const EMAIL = "remindraiapp@gmail.com";

export default function ContactUs() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-6">
      <div className="w-full max-w-md">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="text-sm font-grotesk uppercase tracking-widest text-brand mb-4">
            Contact
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold font-grotesk text-textLight dark:text-textDark leading-tight mb-4">
            Reach out
          </h1>
          <p className="text-textLight/60 dark:text-textDark/60 font-inter text-sm leading-relaxed">
            If something feels off, or you have a question, just reach out.
          </p>
        </motion.div>

        {/* Email */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <p className="text-sm uppercase tracking-widest text-textLight/40 dark:text-textDark/40 font-grotesk mb-2">
            Email
          </p>
          <div className="flex items-center justify-between gap-4">
            <a
              href={`mailto:${EMAIL}`}
              className="text-base font-inter font-medium text-textLight dark:text-textDark hover:text-brand dark:hover:text-brand transition-colors duration-150 truncate"
            >
              {EMAIL}
            </a>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-inter text-textLight/50 dark:text-textDark/50 hover:text-brand dark:hover:text-brand transition-colors duration-150"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy
                </>
              )}
            </button>
          </div>
          <div className="mt-3 h-px bg-textLight/8 dark:bg-textDark/8" />
        </motion.div>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-sm uppercase tracking-widest text-textLight/40 dark:text-textDark/40 font-grotesk mb-4">
            What is this about?
          </p>
          <div className="space-y-1">
            {CONTACT_OPTIONS.map((option, i) => (
              <motion.a
                key={option.label}
                href={`mailto:${EMAIL}?subject=${encodeURIComponent(option.subject)}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.28 + i * 0.07 }}
                className="flex items-center justify-between py-3 group border-b border-textLight/6 dark:border-textDark/6 last:border-0"
              >
                <span className="text-sm font-inter text-textLight/70 dark:text-textDark/70 group-hover:text-textLight dark:group-hover:text-textDark transition-colors duration-150">
                  {option.label}
                </span>
                <span className="text-xs font-inter text-brand opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  Open email →
                </span>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-12 text-xs font-inter text-center text-textLight/60 dark:text-textDark/60"
        >
          Your input helps us improve and create a better experience.
        </motion.p>
      </div>
    </div>
  );
}
