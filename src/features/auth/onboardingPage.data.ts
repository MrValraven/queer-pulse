import type { IconType } from "react-icons";
import { FiBookOpen, FiCalendar, FiUsers } from "react-icons/fi";
import { routes } from "../../app/routeMap";

/**
 * i18n Pattern A — every field below is platform-authored chrome (the intro
 * preview cards, community norms, intent chips, and quick-start tiles), so
 * the component resolves each `*Key` through `t()`. `COMMUNITIES_LIST` is the
 * one exception: in live mode it's `GET /communities?recommended=true`, so its
 * `name`/`desc`/`count` are a community's own authored content and stay
 * English — see docs/i18n/extraction-brief.md §1.
 */
export const ONBOARDING_PREVIEW = [
  {
    titleKey: "auth:onboarding.preview.makeItYours.title",
    descKey: "auth:onboarding.preview.makeItYours.desc",
  },
  {
    titleKey: "auth:onboarding.preview.setIntentions.title",
    descKey: "auth:onboarding.preview.setIntentions.desc",
  },
  {
    titleKey: "auth:onboarding.preview.findCommunities.title",
    descKey: "auth:onboarding.preview.findCommunities.desc",
  },
];

// Total number of onboarding steps, including the warm intro (counted as step 1)
// and the final "you're all set" screen. Used to render an honest, linear
// "Step X of N" indicator and progress bar across every step.
export const TOTAL_STEPS = 7;

export const NORMS = [
  {
    titleKey: "auth:onboarding.stepNorms.norm.bePresent.title",
    descKey: "auth:onboarding.stepNorms.norm.bePresent.desc",
  },
  {
    titleKey: "auth:onboarding.stepNorms.norm.namesPronouns.title",
    descKey: "auth:onboarding.stepNorms.norm.namesPronouns.desc",
  },
  {
    titleKey: "auth:onboarding.stepNorms.norm.staysHere.title",
    descKey: "auth:onboarding.stepNorms.norm.staysHere.desc",
  },
  {
    titleKey: "auth:onboarding.stepNorms.norm.askBeforePhoto.title",
    descKey: "auth:onboarding.stepNorms.norm.askBeforePhoto.desc",
  },
];

/**
 * Chip options for "what brings you here". `value` is the stable English
 * identifier used for selection state (and the 3 preset defaults in
 * `StepIntents`); `labelKey` is what the chip displays, resolved via `t()`.
 */
export const INTENTS: { value: string; labelKey: string }[] = [
  { value: "Community", labelKey: "auth:onboarding.intent.community" },
  { value: "Gatherings & events", labelKey: "auth:onboarding.intent.gatherings" },
  {
    value: "Professional connections",
    labelKey: "auth:onboarding.intent.professional",
  },
  { value: "Dating", labelKey: "auth:onboarding.intent.dating" },
  { value: "Resources & support", labelKey: "auth:onboarding.intent.resources" },
  { value: "Contributing", labelKey: "auth:onboarding.intent.contributing" },
  { value: "Housing", labelKey: "auth:onboarding.intent.housing" },
  { value: "Finding flatmates", labelKey: "auth:onboarding.intent.flatmates" },
  { value: "Activism", labelKey: "auth:onboarding.intent.activism" },
  { value: "Creative collaboration", labelKey: "auth:onboarding.intent.creative" },
];

export const COMMUNITIES_LIST = [
  {
    id: "cc1",
    name: "Queer Lisbon",
    count: "284 members",
    desc: "The main hub for queer life in Lisbon — events, housing, jobs, and everything in between.",
    joined: true,
  },
  {
    id: "cc2",
    name: "Queer Creatives",
    count: "96 members",
    desc: "Artists, writers, filmmakers, and makers building queer culture in Portugal and beyond.",
    joined: false,
  },
  {
    id: "cc3",
    name: "Trans & Non-Binary",
    count: "118 members",
    desc: "A dedicated space for trans and non-binary members — peer support, healthcare, community.",
    joined: false,
  },
  {
    id: "cc4",
    name: "Queer Tech",
    count: "61 members",
    desc: "Queer people working in technology — design, engineering, product, and the ethics behind it.",
    joined: false,
  },
];

export const QUICK_STARTS: {
  to: string;
  icon: IconType;
  iconBg: string;
  titleKey: string;
  descKey: string;
  /** Interpolation values for `descKey`, e.g. the member-count stat. */
  descValues?: Record<string, string | number>;
}[] = [
  {
    to: routes.members,
    icon: FiUsers,
    iconBg: "rgba(45,27,61,.07)",
    titleKey: "auth:onboarding.quickStart.browseDirectory.title",
    descKey: "auth:onboarding.quickStart.browseDirectory.desc",
    descValues: { count: 482 },
  },
  {
    to: "/calendar",
    icon: FiCalendar,
    iconBg: "rgba(232,119,90,.08)",
    titleKey: "auth:onboarding.quickStart.gatherings.title",
    descKey: "auth:onboarding.quickStart.gatherings.desc",
  },
  {
    to: "/magazine",
    icon: FiBookOpen,
    iconBg: "rgba(74,140,111,.08)",
    titleKey: "auth:onboarding.quickStart.magazine.title",
    descKey: "auth:onboarding.quickStart.magazine.desc",
  },
];
