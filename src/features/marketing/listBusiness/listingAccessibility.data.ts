import type { IconType } from "react-icons";
import { FiCheck, FiHelpCircle, FiX } from "react-icons/fi";

/**
 * The accessibility question vocabulary, mirroring the backend's
 * `LISTING_ACCESSIBILITY_QUESTION_SLUGS` exactly. These slugs are the wire
 * values: they are stored verbatim as the keys of a listing's answer map, so
 * they are never localized and never renamed on the client.
 *
 * Accessibility used to be a handful of amenity tags inside `goodFor`, where
 * every stored tag rendered as a positive check. A member could learn that a
 * place CLAIMS a step-free entrance. They could never learn that it does not
 * have one, because a missing tag and a deliberate "no" were the same silence.
 * Someone deciding whether they can get through the door cannot plan around
 * that, so the three answers are now genuinely three answers.
 */
export const ACCESSIBILITY_QUESTION_SLUGS = [
  "step-free-entrance",
  "wheelchair-accessible-interior",
  "accessible-toilet",
  "gender-neutral-toilet",
  "quiet-hours",
  "assistance-animals-welcome",
] as const;

export type AccessibilitySlug = (typeof ACCESSIBILITY_QUESTION_SLUGS)[number];

/**
 * The three answers a venue can give.
 *
 * `unknown` is a REAL answer, never an absent key. "Nobody has told us" is a
 * different fact from "no", and a reader plans around each of them
 * differently, so the two must never be collapsed or dropped.
 */
export type AccessibilityAnswer = "yes" | "no" | "unknown";

/** The complete answer set a listing carries: one answer per question. */
export type AccessibilityAnswerMap = Record<
  AccessibilitySlug,
  AccessibilityAnswer
>;

/** The accessibility block every listing response carries. `answers` always
 *  holds all six questions; `note` is the owner's free-text caveat. */
export interface ListingAccessibilityView {
  answers: AccessibilityAnswerMap;
  note: string | null;
}

/** The editable shape the owner's draft holds. Same answers, with the note as
 *  a plain string because a form field has no null. */
export interface ListingAccessibilityDraft {
  answers: AccessibilityAnswerMap;
  note: string;
}

/** One question as the UI renders it: the wire slug plus the catalog keys for
 *  its short label and the one-line explanation of what it actually means. */
export interface AccessibilityQuestionDefinition {
  slug: AccessibilitySlug;
  labelKey: string;
  helpKey: string;
}

/** Ordered the way someone works through a doorway and inwards: getting in,
 *  moving around, the toilets, then the quieter needs. */
export const ACCESSIBILITY_QUESTIONS: AccessibilityQuestionDefinition[] = [
  {
    slug: "step-free-entrance",
    labelKey: "marketing:listBusiness.accessibility.question.stepFree.label",
    helpKey: "marketing:listBusiness.accessibility.question.stepFree.help",
  },
  {
    slug: "wheelchair-accessible-interior",
    labelKey: "marketing:listBusiness.accessibility.question.interior.label",
    helpKey: "marketing:listBusiness.accessibility.question.interior.help",
  },
  {
    slug: "accessible-toilet",
    labelKey:
      "marketing:listBusiness.accessibility.question.accessibleToilet.label",
    helpKey:
      "marketing:listBusiness.accessibility.question.accessibleToilet.help",
  },
  {
    slug: "gender-neutral-toilet",
    labelKey:
      "marketing:listBusiness.accessibility.question.genderNeutralToilet.label",
    helpKey:
      "marketing:listBusiness.accessibility.question.genderNeutralToilet.help",
  },
  {
    slug: "quiet-hours",
    labelKey: "marketing:listBusiness.accessibility.question.quietHours.label",
    helpKey: "marketing:listBusiness.accessibility.question.quietHours.help",
  },
  {
    slug: "assistance-animals-welcome",
    labelKey:
      "marketing:listBusiness.accessibility.question.assistanceAnimals.label",
    helpKey:
      "marketing:listBusiness.accessibility.question.assistanceAnimals.help",
  },
];

/**
 * How each answer presents itself.
 *
 * Every answer carries its own icon AND its own word, so the state is never
 * signalled by colour alone. `readerKey` is the phrasing a visitor reads on the
 * public page ("Yes" / "No" / "Nobody has told us yet"); `ownerKey` is the
 * phrasing the owner picks from in the editor, where "no" has to feel as
 * ordinary and safe to choose as "yes".
 */
export interface AccessibilityAnswerDefinition {
  id: AccessibilityAnswer;
  icon: IconType;
  readerKey: string;
  ownerKey: string;
}

export const ACCESSIBILITY_ANSWER_OPTIONS: AccessibilityAnswerDefinition[] = [
  {
    id: "yes",
    icon: FiCheck,
    readerKey: "marketing:listBusiness.accessibility.answer.yes.reader",
    ownerKey: "marketing:listBusiness.accessibility.answer.yes.owner",
  },
  {
    id: "no",
    icon: FiX,
    readerKey: "marketing:listBusiness.accessibility.answer.no.reader",
    ownerKey: "marketing:listBusiness.accessibility.answer.no.owner",
  },
  {
    id: "unknown",
    icon: FiHelpCircle,
    readerKey: "marketing:listBusiness.accessibility.answer.unknown.reader",
    ownerKey: "marketing:listBusiness.accessibility.answer.unknown.owner",
  },
];

/** The same definitions keyed by answer, so a row renders by the answer it
 *  holds rather than by searching the list. */
export const ACCESSIBILITY_ANSWER_BY_ID = Object.fromEntries(
  ACCESSIBILITY_ANSWER_OPTIONS.map((option) => [option.id, option]),
) as Record<AccessibilityAnswer, AccessibilityAnswerDefinition>;

/** Server ceiling on the owner's free-text note. */
export const ACCESSIBILITY_NOTE_MAX = 500;

function isAccessibilityAnswer(value: unknown): value is AccessibilityAnswer {
  return value === "yes" || value === "no" || value === "unknown";
}

/** Every question answered `unknown`: what a listing that has said nothing
 *  looks like, and the base a partial map is merged onto. */
export function emptyAccessibilityAnswers(): AccessibilityAnswerMap {
  const answers = {} as AccessibilityAnswerMap;
  for (const slug of ACCESSIBILITY_QUESTION_SLUGS) {
    answers[slug] = "unknown";
  }
  return answers;
}

/**
 * Fill a partial, stale, or entirely absent answer map up to the full
 * vocabulary. Mirrors the backend's `normalizeAccessibilityAnswers`, so a demo
 * fixture, a resumed local draft written before this feature existed, and a
 * live payload all end up as the same complete six-question map.
 */
export function normalizeAccessibilityAnswers(
  input?: Partial<Record<string, unknown>> | null,
): AccessibilityAnswerMap {
  const answers = emptyAccessibilityAnswers();
  if (!input) return answers;
  for (const slug of ACCESSIBILITY_QUESTION_SLUGS) {
    const value = input[slug];
    if (isAccessibilityAnswer(value)) answers[slug] = value;
  }
  return answers;
}

/** Heal a whole accessibility block (answers plus note) into the editable
 *  draft shape. An absent block becomes six `unknown`s and an empty note. */
export function normalizeAccessibilityDraft(
  input?: Partial<ListingAccessibilityView> | null,
): ListingAccessibilityDraft {
  return {
    answers: normalizeAccessibilityAnswers(input?.answers),
    note: input?.note ?? "",
  };
}
