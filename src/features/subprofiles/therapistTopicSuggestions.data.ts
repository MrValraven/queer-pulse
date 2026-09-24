/**
 * Starter topics offered while a therapist has few (TherapistTopicsControl's
 * empty state and its "More ideas" row). Each label resolves through
 * `subprofiles:therapistTopics.suggestion.<id>`, and a chip adds a topic
 * headed with that label in the owner's language. Each one also has an
 * example line, `subprofiles:therapistTopics.suggestionExample.<id>`, shown
 * as the first line's placeholder under a topic with that heading.
 */
export const THERAPIST_TOPIC_SUGGESTION_IDS = [
  "identity",
  "gender",
  "relationships",
  "anxiety",
  "trauma",
  "grief",
  "family",
  "work",
] as const;

export type TherapistTopicSuggestionId =
  (typeof THERAPIST_TOPIC_SUGGESTION_IDS)[number];

export const therapistTopicSuggestionKey = (id: TherapistTopicSuggestionId) =>
  `subprofiles:therapistTopics.suggestion.${id}`;

export const therapistTopicSuggestionExampleKey = (
  id: TherapistTopicSuggestionId,
) => `subprofiles:therapistTopics.suggestionExample.${id}`;

/** A heading folded for matching: lowercase, accents dropped, "&" read as
 *  "and", and runs of spaces collapsed, so "Identity & coming out" matches
 *  "Identity and coming out". */
const normaliseHeading = (heading: string) =>
  heading
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\s+/g, " ")
    .trim();

/** The suggestion a heading reads as, if any. `translate` resolves a key. */
export function suggestionIdForHeading(
  heading: string,
  translate: (key: string) => string,
): TherapistTopicSuggestionId | undefined {
  const normalised = normaliseHeading(heading);
  if (normalised === "") return undefined;
  return THERAPIST_TOPIC_SUGGESTION_IDS.find(
    (id) =>
      normaliseHeading(translate(therapistTopicSuggestionKey(id))) ===
      normalised,
  );
}

/** The suggestions no topic uses yet, in their listed order. */
export function unpickedSuggestionIds(
  headings: readonly string[],
  translate: (key: string) => string,
): TherapistTopicSuggestionId[] {
  const picked = new Set(
    headings.map((heading) => suggestionIdForHeading(heading, translate)),
  );
  return THERAPIST_TOPIC_SUGGESTION_IDS.filter((id) => !picked.has(id));
}
