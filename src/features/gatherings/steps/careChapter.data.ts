import type { RsvpQuestionKey } from "../gatheringExtras";

/**
 * Static rows for chapter 5, "Taking care." (CareChapter).
 * Label copy is catalog keys (i18n Pattern A, see createGathering.data.ts).
 */

/** An "Ask on RSVP" question the host can switch on or off. */
export interface ToggleableRsvpQuestionRow {
  key: Exclude<RsvpQuestionKey, "access">;
  titleKey: string;
  descriptionKey: string;
}

/** The switchable "Ask on RSVP" rows, in the order the design lists them. */
export const TOGGLEABLE_RSVP_QUESTION_ROWS: readonly ToggleableRsvpQuestionRow[] =
  [
    {
      key: "dietary",
      titleKey: "gatherings:create.v2.care.question.dietary.title",
      descriptionKey: "gatherings:create.v2.care.question.dietary.description",
    },
    {
      key: "pronouns",
      titleKey: "gatherings:create.v2.care.question.pronouns.title",
      descriptionKey: "gatherings:create.v2.care.question.pronouns.description",
    },
  ];

/**
 * Access needs, the last "Ask on RSVP" row. Ruling R8: the RSVP details form
 * asks every attendee about access needs, so the row is always on and the
 * host cannot switch it off.
 */
export const ALWAYS_ASKED_ACCESS_ROW = {
  titleKey: "gatherings:create.v2.care.question.access.title",
  descriptionKey: "gatherings:create.v2.care.question.access.alwaysAsked",
} as const;
