import type { IconType } from "react-icons";
import { FiBookOpen, FiCalendar, FiUsers } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import type { SubprofileKind } from "../subprofiles/api/subprofiles.api";

/**
 * i18n Pattern A — every field below is platform-authored chrome (the intro
 * preview cards, community norms, intent chips, and quick-start tiles), so
 * the component resolves each `*Key` through `t()`.
 */
export const ONBOARDING_PREVIEW = [
  {
    titleKey: "auth:onboarding.preview.makeItYours.title",
    descriptionKey: "auth:onboarding.preview.makeItYours.desc",
  },
  {
    titleKey: "auth:onboarding.preview.setIntentions.title",
    descriptionKey: "auth:onboarding.preview.setIntentions.desc",
  },
  {
    titleKey: "auth:onboarding.preview.findCommunities.title",
    descriptionKey: "auth:onboarding.preview.findCommunities.desc",
  },
];

// Total number of onboarding steps, including the warm intro (counted as step 1)
// and the final "you're all set" screen. Used to render an honest, linear
// "Step X of N" indicator and progress bar across every step.
export const TOTAL_STEPS = 8;

export const NORMS = [
  {
    titleKey: "auth:onboarding.stepNorms.norm.bePresent.title",
    descriptionKey: "auth:onboarding.stepNorms.norm.bePresent.desc",
  },
  {
    titleKey: "auth:onboarding.stepNorms.norm.namesPronouns.title",
    descriptionKey: "auth:onboarding.stepNorms.norm.namesPronouns.desc",
  },
  {
    titleKey: "auth:onboarding.stepNorms.norm.staysHere.title",
    descriptionKey: "auth:onboarding.stepNorms.norm.staysHere.desc",
  },
  {
    titleKey: "auth:onboarding.stepNorms.norm.askBeforePhoto.title",
    descriptionKey: "auth:onboarding.stepNorms.norm.askBeforePhoto.desc",
  },
];

/**
 * Chip options for "what brings you here". `value` is the stable English
 * identifier used for selection state (and the 3 preset defaults in
 * `StepIntents`); `labelKey` is what the chip displays, resolved via `t()`.
 */
export const INTENTS: { value: string; labelKey: string }[] = [
  { value: "Community", labelKey: "auth:onboarding.intent.community" },
  {
    value: "Gatherings & events",
    labelKey: "auth:onboarding.intent.gatherings",
  },
  {
    value: "Professional connections",
    labelKey: "auth:onboarding.intent.professional",
  },
  { value: "Dating", labelKey: "auth:onboarding.intent.dating" },
  {
    value: "Resources & support",
    labelKey: "auth:onboarding.intent.resources",
  },
  { value: "Contributing", labelKey: "auth:onboarding.intent.contributing" },
  { value: "Housing", labelKey: "auth:onboarding.intent.housing" },
  { value: "Finding flatmates", labelKey: "auth:onboarding.intent.flatmates" },
  { value: "Activism", labelKey: "auth:onboarding.intent.activism" },
  {
    value: "Creative collaboration",
    labelKey: "auth:onboarding.intent.creative",
  },
];

/**
 * Chip options for "do you also work as something else?" (Moment 4 — a
 * transient answer, never persisted; see `StepSideWork`). `value` is the
 * stable identifier used for selection state; `labelKey` is what the chip
 * displays. `kind`, where present, is the matching `SubprofileKind` — picking
 * that chip pre-selects it in the persona-creation deep-link (`?kind=`). A
 * craft with no direct kind match (e.g. "Something else") omits `kind`, so
 * the deep-link opens the create flow without a preset.
 */
export const SIDE_WORK_OPTIONS: {
  value: string;
  labelKey: string;
  kind?: SubprofileKind;
}[] = [
  { value: "Music", labelKey: "auth:onboarding.sideWork.music", kind: "musician" },
  { value: "Drag", labelKey: "auth:onboarding.sideWork.drag", kind: "drag" },
  { value: "Code", labelKey: "auth:onboarding.sideWork.code", kind: "developer" },
  {
    value: "Photography",
    labelKey: "auth:onboarding.sideWork.photography",
    kind: "photographer",
  },
  { value: "Food", labelKey: "auth:onboarding.sideWork.food", kind: "chef" },
  {
    value: "Therapy",
    labelKey: "auth:onboarding.sideWork.therapy",
    kind: "therapist",
  },
  { value: "Writing", labelKey: "auth:onboarding.sideWork.writing", kind: "writer" },
  { value: "Art", labelKey: "auth:onboarding.sideWork.art", kind: "visual_artist" },
  { value: "DJing", labelKey: "auth:onboarding.sideWork.dj", kind: "dj" },
  { value: "Dance", labelKey: "auth:onboarding.sideWork.dance", kind: "dancer" },
  {
    value: "Something else",
    labelKey: "auth:onboarding.sideWork.somethingElse",
  },
];

export const QUICK_STARTS: {
  to: string;
  icon: IconType;
  iconBackground: string;
  titleKey: string;
  descriptionKey: string;
  /** Interpolation values for `descriptionKey`, e.g. the member-count stat. */
  descriptionValues?: Record<string, string | number>;
}[] = [
  {
    to: routes.members,
    icon: FiUsers,
    iconBackground: "rgba(45,27,61,.07)",
    titleKey: "auth:onboarding.quickStart.browseDirectory.title",
    descriptionKey: "auth:onboarding.quickStart.browseDirectory.desc",
  },
  {
    to: routes.calendar,
    icon: FiCalendar,
    iconBackground: "rgba(232,119,90,.08)",
    titleKey: "auth:onboarding.quickStart.gatherings.title",
    descriptionKey: "auth:onboarding.quickStart.gatherings.desc",
  },
  {
    to: routes.magazine,
    icon: FiBookOpen,
    iconBackground: "rgba(74,140,111,.08)",
    titleKey: "auth:onboarding.quickStart.magazine.title",
    descriptionKey: "auth:onboarding.quickStart.magazine.desc",
  },
];
