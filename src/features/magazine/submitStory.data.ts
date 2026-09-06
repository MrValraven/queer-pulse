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
 * DEMO ONLY (PRD-106). The issue open for submissions is real data now: live
 * mode reads it from `GET /magazine/issues/open` through `useOpenIssue`, and
 * the deadline comes from `magazine_issue.submission_deadline`, which an
 * editor sets on the issue-production page.
 *
 * The constant this replaces was a hardcoded `{ number: 26, openDate: July
 * 2026, deadlineDate: 15 August 2026 }` that the LIVE form printed as fact.
 * It could only ever go stale, and by September 2026 it was quoting a
 * three-week-old deadline on an issue number the desk had never created.
 * Nothing outside demo mode may read this.
 *
 * Derived from today rather than frozen, so the demo tour never shows a
 * lapsed deadline either: the demo issue runs at the start of the month after
 * next, and closes to submissions at the start of next month.
 */
export function demoOpenIssue(): {
  number: string;
  title: string;
  publishedOn: string;
  submissionDeadline: string;
} {
  const today = new Date();
  const isoDay = (date: Date): string =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`;
  return {
    number: "26",
    title: "On belonging.",
    publishedOn: isoDay(new Date(today.getFullYear(), today.getMonth() + 2, 1)),
    submissionDeadline: isoDay(
      new Date(today.getFullYear(), today.getMonth() + 1, 1),
    ),
  };
}

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
