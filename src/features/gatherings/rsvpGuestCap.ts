/** The most guests one RSVP may bring, counting the open member invites the
 *  attendee sent. Mirrors `queerpulse-backend/src/events/gathering-extras.ts`
 *  `MAX_RSVP_GUESTS`. */
export const MAX_RSVP_GUESTS = 3;

/**
 * The highest guest count the RSVP stepper offers.
 *
 * Open invites take seats from the cap. A saved count is always kept, so a
 * count saved above the cap (from before it existed) stays selectable and can
 * only be lowered, and once raising has closed the saved count is the ceiling.
 */
export function guestStepperMax(input: {
  savedGuestCount: number;
  openInviteCount: number;
  isRaiseClosed: boolean;
}): number {
  const { savedGuestCount, openInviteCount, isRaiseClosed } = input;
  if (isRaiseClosed) return savedGuestCount;
  const capRoom = Math.max(0, MAX_RSVP_GUESTS - openInviteCount);
  return Math.max(savedGuestCount, capRoom);
}

/**
 * How many more connections the attendee can invite right now.
 *
 * Reads the larger of the saved and the in-progress guest count, so a stepper
 * raised but not yet saved already holds its seats. Never below 0.
 */
export function remainingInviteSlots(input: {
  savedGuestCount: number;
  currentGuestCount: number;
  openInviteCount: number;
}): number {
  const { savedGuestCount, currentGuestCount, openInviteCount } = input;
  const guestCount = Math.max(savedGuestCount, currentGuestCount);
  return Math.max(0, MAX_RSVP_GUESTS - guestCount - openInviteCount);
}
