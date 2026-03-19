import CreateAccount from "./sections/CreateAccount";
import VerifyEmail from "./sections/VerifyEmail";
import Onboarding from "./sections/Onboarding";
import Workspace from "./sections/Workspace";
import ContentSetup from "./sections/Contentsetup";
import CreatePrompt from "./sections/Createprompt";
import ContentInbox from "./sections/Contentinbox";
import ManagePrompts from "./sections/Manageprompts";
import Timezone from "./sections/Timezone";
import Notifications from "./sections/Notifications";
import Preferences from "./sections/Preferences";
import Account from "./sections/Account";
import WritingDirection from "./sections/WritingDirection";

export const NAV = [
  {
    group: "Getting started",
    items: [
      { id: "create-account", label: "Create account" },
      { id: "verify-email", label: "Verify email" },
      { id: "onboarding", label: "Onboarding" },
      { id: "workspace", label: "Workspace" },
    ],
  },
  {
    group: "Core workflow",
    items: [
      { id: "content-setup", label: "Content setup" },
      { id: "create-prompt", label: "Creating a prompt" },
      { id: "content-inbox", label: "Content inbox" },
      { id: "manage-prompts", label: "Managing prompts" },
      { id: "writing-direction", label: "Writing direction" },
    ],
  },
  {
    group: "Settings",
    items: [
      { id: "timezone", label: "Timezone" },
      { id: "notifications", label: "Notifications" },
      { id: "preferences", label: "Preferences" },
      { id: "account", label: "Account" },
    ],
  },
];

export const SECTION_MAP = {
  "create-account": {
    component: CreateAccount,
    title: "How do I create an account?",
    intro: "Sign up takes less than a minute.",
  },
  "verify-email": {
    component: VerifyEmail,
    title: "How do I verify my email?",
    intro: "Required before accessing the Workspace.",
  },
  onboarding: {
    component: Onboarding,
    title: "What happens during onboarding?",
    intro: "Sets your Content Identity.",
  },
  workspace: {
    component: Workspace,
    title: "What is inside the Workspace?",
    intro: "Four sections: Overview, Studio, Deliveries, Settings.",
  },
  "content-setup": {
    component: ContentSetup,
    title: "How do I update my content setup?",
    intro: "Edit role, tone, and platform from Studio.",
  },
  "create-prompt": {
    component: CreatePrompt,
    title: "How do I create a prompt?",
    intro: "Prompts define what the system prepares and when.",
  },
  "content-inbox": {
    component: ContentInbox,
    title: "Where does generated content appear?",
    intro: "All drafts appear in Deliveries.",
  },
  "manage-prompts": {
    component: ManagePrompts,
    title: "How do I manage my prompts?",
    intro: "View, delete, and review prompts from Studio.",
  },

  "writing-direction": {
    component: WritingDirection,
    title: "How to write good prompts for better drafts?",
    intro: "Good prompts lead to better drafts.  ",
  },

  timezone: {
    component: Timezone,
    title: "How do I change my timezone?",
    intro: "All delivery times use your timezone.",
  },
  notifications: {
    component: Notifications,
    title: "How do I manage notifications?",
    intro: "Control email and app notifications.",
  },
  preferences: {
    component: Preferences,
    title: "How do I change app preferences?",
    intro: "Theme and display settings.",
  },
  account: {
    component: Account,
    title: "How do I manage my account?",
    intro: "Password and account deletion.",
  },
};

export const getActiveGroup = (id) =>
  NAV.find((g) => g.items.some((i) => i.id === id)) || null;

export const SEARCH_INDEX = Object.entries(SECTION_MAP).map(([id, s]) => ({
  id,
  label: NAV.flatMap((g) => g.items).find((i) => i.id === id)?.label || id,
  title: s.title,
  intro: s.intro,
}));
