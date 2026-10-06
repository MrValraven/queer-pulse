import type { TherapistCardVM } from "../../../resources/therapistPersonaCard";

/** How long a therapist's stated status is trusted (PRD-435). Past this, the
 *  "Also worth a look" chip reads as not confirmed recently and the card
 *  earns no "taking new clients" ranking boost. */
export const STATUS_CONFIRMED_WITHIN_DAYS = 60;

const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

/**
 * Was this card's status changed within `STATUS_CONFIRMED_WITHIN_DAYS` of
 * `now`? A card with no timestamp, or one that does not parse, counts as
 * unconfirmed: the directory cannot say how old that status is.
 */
export function isTherapistStatusFresh(
  card: Pick<TherapistCardVM, "availabilityUpdatedAt">,
  now: number,
): boolean {
  if (!card.availabilityUpdatedAt) return false;
  const updatedAt = new Date(card.availabilityUpdatedAt).getTime();
  if (Number.isNaN(updatedAt)) return false;
  return now - updatedAt <= STATUS_CONFIRMED_WITHIN_DAYS * DAY_IN_MILLISECONDS;
}
