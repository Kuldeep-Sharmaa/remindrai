export const appConfig = {
  name: "RemindrAI",
  description: "AI-powered reminders & smart scheduling tool",
  website: "https://remindrai.app",
  privacyPolicyUrl: "/privacy-policy",
  termsUrl: "/terms",
  version: import.meta.env.VITE_APP_VERSION || "v1.0.0",
  buildDate: import.meta.env.VITE_BUILD_DATE || "unknown",
};
export const APP_NAME = appConfig.name;
