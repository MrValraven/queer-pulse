import { useRef } from "react";
import { AnimatePresence } from "motion/react";
import type { AttendeeRow } from "../api/events.adapters";
import { CheckinGuestDetailsModal } from "./CheckinGuestDetailsModal";

/** The data attribute on each guest row's details button (CheckinGuestRow). */
const DETAILS_SLUG_ATTRIBUTE = "data-guest-details-slug";
/** The "Check in" pill on each row still to arrive (CheckinGuestRow). */
const CHECK_IN_SLUG_ATTRIBUTE = "data-checkin-slug";

function findDetailsButton(slug: string): HTMLButtonElement | null {
  return document.querySelector<HTMLButtonElement>(
    `button[${DETAILS_SLUG_ATTRIBUTE}="${CSS.escape(slug)}"]`,
  );
}

/**
 * The details button of the first guest still to arrive after `slug`'s row,
 * or the first one on the list when that row has already left it. Rows still
 * to arrive are the ones carrying a "Check in" pill.
 */
function findNextGuestDetailsButton(slug: string): HTMLButtonElement | null {
  const checkedInRowButton = findDetailsButton(slug);
  const pills = Array.from(
    document.querySelectorAll<HTMLButtonElement>(
      `button[${CHECK_IN_SLUG_ATTRIBUTE}]`,
    ),
  );
  const nextPill = pills.find(
    (pill) =>
      pill.getAttribute(CHECK_IN_SLUG_ATTRIBUTE) !== slug &&
      (!checkedInRowButton ||
        Boolean(
          checkedInRowButton.compareDocumentPosition(pill) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        )),
  );
  const nextSlug = nextPill?.getAttribute(CHECK_IN_SLUG_ATTRIBUTE);
  return nextSlug ? findDetailsButton(nextSlug) : null;
}

/** The toolbar's guest search box, which stays mounted under every state of
 *  the list (see useCheckinFocus). */
function findSearchField(): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>("input[data-checkin-search]");
}

/** Whether focus has nowhere useful to sit: the page body, or the dialog
 *  that is on its way out. */
function isFocusStranded(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement || activeElement === document.body) return true;
  return activeElement.closest('[aria-modal="true"]') !== null;
}

interface CheckinGuestDetailsProps {
  /** The open guest's current row, or `undefined` when none is open. */
  attendee: AttendeeRow | undefined;
  canCheckIn: boolean;
  pendingSlugs: ReadonlySet<string>;
  customRsvpQuestion?: string | null;
  onCheckIn: (memberSlug: string) => void;
  onClose: () => void;
}

/**
 * Mounts a guest's details dialog with its exit animation, and decides where
 * focus goes once it has gone.
 *
 * Back, Escape and the close button hand focus back to the row that opened
 * the dialog (the shared Modal does that). A check-in from the dialog moves
 * focus on to the next guest still to arrive, because the row that opened it
 * is about to move to "Arrived". When the guest's row has left the list
 * altogether, focus goes to the search box. The move happens as the exit
 * completes, after the Modal has handed focus back to the opener, and the
 * Modal keeps a focus that changed during its exit.
 */
export function CheckinGuestDetails({
  attendee,
  canCheckIn,
  pendingSlugs,
  customRsvpQuestion,
  onCheckIn,
  onClose,
}: CheckinGuestDetailsProps) {
  const checkedInSlugRef = useRef<string | null>(null);

  const handleCheckIn = (memberSlug: string) => {
    checkedInSlugRef.current = memberSlug;
    onCheckIn(memberSlug);
    onClose();
  };

  const handleExitComplete = () => {
    const checkedInSlug = checkedInSlugRef.current;
    checkedInSlugRef.current = null;
    if (checkedInSlug) {
      (findNextGuestDetailsButton(checkedInSlug) ?? findSearchField())?.focus();
      return;
    }
    if (isFocusStranded()) findSearchField()?.focus();
  };

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {attendee && (
        <CheckinGuestDetailsModal
          key={attendee.slug}
          attendee={attendee}
          canCheckIn={canCheckIn}
          isPending={pendingSlugs.has(attendee.slug)}
          customRsvpQuestion={customRsvpQuestion}
          onCheckIn={handleCheckIn}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}
