import type { IconType } from "react-icons";
import { FiDollarSign, FiGlobe, FiTarget } from "react-icons/fi";

/**
 * Pitch-intro hero (the screenshot). Platform-authored value props — chrome,
 * so this holds catalog keys (Pattern A); `SubmitStoryIntro.tsx` resolves
 * `titleKey`/`bodyKey` via `t()`.
 */
export const LOOKING_FOR: {
  icon: IconType;
  titleKey: string;
  bodyKey: string;
}[] = [
  {
    icon: FiTarget,
    titleKey: "magazine:submitStory.intro.lookingFor.specific.title",
    bodyKey: "magazine:submitStory.intro.lookingFor.specific.body",
  },
  {
    icon: FiGlobe,
    titleKey: "magazine:submitStory.intro.lookingFor.beyond.title",
    bodyKey: "magazine:submitStory.intro.lookingFor.beyond.body",
  },
  {
    icon: FiDollarSign,
    titleKey: "magazine:submitStory.intro.lookingFor.pay.title",
    bodyKey: "magazine:submitStory.intro.lookingFor.pay.body",
  },
];

export const STEP_KEYS = [
  "magazine:submitStory.intro.step.reply",
  "magazine:submitStory.intro.step.assigned",
  "magazine:submitStory.intro.step.copyright",
];

/**
 * The issue currently open for submissions — a specific issue's own record
 * (number + open date + deadline), so a real `Date` backs the deadline
 * instead of a hardcoded English string.
 */
export const ISSUE = {
  number: 26,
  openDate: new Date(2026, 6, 1),
  deadlineDate: new Date(2026, 7, 15),
};

/**
 * Magazine sections the piece can be filed under (dropdown chrome). `id` is
 * the canonical English value stored in `DraftForm.section` and sent to the
 * API as `format` — label-key indirection, so switching language never
 * changes what gets submitted. `labelKey` is what's shown in the dropdown.
 */
export const SECTION_OPTIONS: { id: string; labelKey: string }[] = [
  { id: "Long read", labelKey: "magazine:submitStory.meta.section.longRead" },
  {
    id: "Personal essay",
    labelKey: "magazine:submitStory.meta.section.personalEssay",
  },
  { id: "Interview", labelKey: "magazine:submitStory.meta.section.interview" },
  { id: "Opinion", labelKey: "magazine:submitStory.meta.section.opinion" },
  {
    id: "Community report",
    labelKey: "magazine:submitStory.meta.section.communityReport",
  },
  {
    id: "Short fiction",
    labelKey: "magazine:submitStory.meta.section.shortFiction",
  },
  {
    id: "Photography",
    labelKey: "magazine:submitStory.meta.section.photography",
  },
];

/** Editorial guidelines shown in the sidebar; `termKey` renders bold. */
export const GUIDELINE_KEYS: { termKey: string; detailKey: string }[] = [
  {
    termKey: "magazine:submitStory.sidebar.guideline.length.term",
    detailKey: "magazine:submitStory.sidebar.guideline.length.detail",
  },
  {
    termKey: "magazine:submitStory.sidebar.guideline.experience.term",
    detailKey: "magazine:submitStory.sidebar.guideline.experience.detail",
  },
  {
    termKey: "magazine:submitStory.sidebar.guideline.noPromo.term",
    detailKey: "magazine:submitStory.sidebar.guideline.noPromo.detail",
  },
  {
    termKey: "magazine:submitStory.sidebar.guideline.language.term",
    detailKey: "magazine:submitStory.sidebar.guideline.language.detail",
  },
  {
    termKey: "magazine:submitStory.sidebar.guideline.deadlines.term",
    detailKey: "magazine:submitStory.sidebar.guideline.deadlines.detail",
  },
];

/** "After you submit" reassurance — each key embeds a `<strong>` run. */
export const AFTER_SUBMIT_KEYS = [
  "magazine:submitStory.sidebar.afterSubmit.response",
  "magazine:submitStory.sidebar.afterSubmit.approve",
  "magazine:submitStory.sidebar.afterSubmit.licence",
];

/** The editable fields of a story draft, starting empty — the member writes
 * their own byline and body; no pre-filled example content. */
export const INITIAL_DRAFT = {
  section: "",
  byline: "",
  bylineNote: "",
  tags: "",
  headline: "",
  deck: "",
  body: "",
};

/** The editable fields of a story draft. */
export type DraftForm = typeof INITIAL_DRAFT;
