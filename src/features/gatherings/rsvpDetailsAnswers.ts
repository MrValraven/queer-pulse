import type { RsvpDetailsDTO, UpdateRsvpDetailsDto } from "./api/events.api";
import {
  EXISTING_GATHERING_RSVP_QUESTIONS,
  type RsvpQuestions,
} from "./gatheringExtras";

/**
 * The rules every "Anything we should know?" form follows (ruling R8), kept in
 * one place for the two forms that write the same answers: the gathering
 * page's `GatheringRsvpDetailsModal` and the My Events `RsvpDetailsModal`.
 *
 * - Access needs are asked on every gathering, the platform's accessibility
 *   baseline.
 * - Food and drink and pronouns are asked when the host switched them on.
 * - The host's own question is asked, in their own words, when they wrote one.
 * - A gathering whose questions are unknown (a detail from before the field
 *   existed, a demo record, a query still loading) asks what the form always
 *   asked: access needs and food and drink.
 */

/** The free-text answers a details form holds. Which of them it asks, and so
 *  which it sends, depends on the gathering. */
export interface RsvpDetailsAnswers {
  accessNeeds: string;
  dietaryNeeds: string;
  pronouns: string;
  customAnswer: string;
}

export type RsvpDetailsAnswerKey = keyof RsvpDetailsAnswers;

/** What one gathering's details form asks. */
export interface AskedRsvpQuestions {
  questions: RsvpQuestions;
  /** The host's own question, trimmed, or null when there is none. */
  customQuestion: string | null;
}

export function askedRsvpQuestions(
  rsvpQuestions: RsvpQuestions | null | undefined,
  customRsvpQuestion: string | null | undefined,
): AskedRsvpQuestions {
  return {
    questions: rsvpQuestions ?? EXISTING_GATHERING_RSVP_QUESTIONS,
    customQuestion: customRsvpQuestion?.trim() || null,
  };
}

/** The member's saved answers as form strings, each blank when unanswered. */
export function answersFromSaved(
  saved: RsvpDetailsDTO | null | undefined,
): RsvpDetailsAnswers {
  return {
    accessNeeds: saved?.accessNeeds ?? "",
    dietaryNeeds: saved?.dietaryNeeds ?? "",
    pronouns: saved?.pronouns ?? "",
    customAnswer: saved?.customAnswer ?? "",
  };
}

/** The answer half of a details save. Only what this gathering asks is sent,
 *  so an answer given before the host switched a question off stays as it
 *  was. */
export function askedAnswersPayload(
  answers: RsvpDetailsAnswers,
  asked: AskedRsvpQuestions,
): Pick<
  UpdateRsvpDetailsDto,
  "accessNeeds" | "dietaryNeeds" | "pronouns" | "customAnswer"
> {
  return {
    accessNeeds: answers.accessNeeds,
    ...(asked.questions.dietary ? { dietaryNeeds: answers.dietaryNeeds } : {}),
    ...(asked.questions.pronouns ? { pronouns: answers.pronouns } : {}),
    ...(asked.customQuestion ? { customAnswer: answers.customAnswer } : {}),
  };
}
