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
  deadlineDate: new Date(2026, 5, 20),
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

/** Example draft the editor opens with (mirrors the design prototype). */
export const INITIAL_DRAFT = {
  section: "Personal essay",
  byline: "Sofia Ferreira",
  bylineNote: "",
  tags: "",
  headline: "The city keeps changing around us",
  deck: "",
  body: `The apartment I grew up thinking I could afford no longer exists in the neighbourhood I grew up in. This isn't a complaint — it's a map coordinate. Where you can live shapes who you can be around, and who you can be around shapes everything else.

I have been tracking this for three years: not with data, but with the particular cartography of knowing who has left. The restaurant where Catarina worked. The street where six of my friends used to live within walking distance of each other. The squat that became a hotel.

What I want to write about is the gap between leaving and being displaced. They feel different from the inside. Leaving has agency in it, even when it's coerced. Being displaced is something that happens to the body before the mind has processed it.`,
};

/** The editable fields of a story draft. */
export type DraftForm = typeof INITIAL_DRAFT;
