import { useEffect, useRef } from "react";
import { hasOpenModal } from "../../shared/components/ui/modalStack";
import type {
  AdminGroupListingQueueDTO,
  GroupListingStatus,
} from "./api/adminHousingGroupListings.api";
import { allowedDecisions } from "./adminHousingGroupListingsStatus";

/** Keys that move the queue, and the decision each letter records. */
const DECISION_KEYS: Record<string, GroupListingStatus> = {
  p: "live",
  q: "question",
  d: "declined",
  r: "review",
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return (
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT" ||
    target.isContentEditable
  );
}

/**
 * The review queue's keyboard flow, so a moderator can work through a morning's
 * listings without leaving the home row: `J`/`K` (or the arrow keys) move
 * between rows, `P` publishes the focused listing, `Q` sends the poster a
 * question, `D` declines it and `R` puts a declined one back in the queue. A
 * key the focused row's state does not allow does nothing.
 *
 * Inert while a modifier is held (so browser shortcuts still work), while any
 * dialog is open (the reason modal owns the keyboard then), and while focus
 * sits in a text field. Latest values live in refs synced every render, so the
 * single listener stays mounted for the page's lifetime instead of re-binding
 * on every row change.
 */
export function useAdminGroupListingKeys({
  listings,
  focusedId,
  setFocusedId,
  onDecide,
}: {
  listings: AdminGroupListingQueueDTO[];
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
  onDecide: (
    listing: AdminGroupListingQueueDTO,
    next: GroupListingStatus,
  ) => void;
}): void {
  const listingsRef = useRef(listings);
  const focusedIdRef = useRef(focusedId);
  const onDecideRef = useRef(onDecide);
  const setFocusedIdRef = useRef(setFocusedId);
  useEffect(() => {
    listingsRef.current = listings;
    focusedIdRef.current = focusedId;
    onDecideRef.current = onDecide;
    setFocusedIdRef.current = setFocusedId;
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (hasOpenModal()) return;
      if (isTypingTarget(document.activeElement)) return;

      const rows = listingsRef.current;
      if (rows.length === 0) return;
      const key = event.key.toLowerCase();
      const isNext = key === "j" || event.key === "ArrowDown";
      const isPrevious = key === "k" || event.key === "ArrowUp";

      if (isNext || isPrevious) {
        event.preventDefault();
        const currentIndex = rows.findIndex(
          (row) => row.id === focusedIdRef.current,
        );
        const nextIndex = isNext
          ? Math.min(currentIndex < 0 ? 0 : currentIndex + 1, rows.length - 1)
          : Math.max(currentIndex < 0 ? 0 : currentIndex - 1, 0);
        setFocusedIdRef.current(rows[nextIndex]!.id);
        return;
      }

      const next = DECISION_KEYS[key];
      if (!next) return;
      const focused = rows.find((row) => row.id === focusedIdRef.current);
      if (!focused) return;
      if (!allowedDecisions(focused.status).includes(next)) return;
      event.preventDefault();
      onDecideRef.current(focused, next);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // Stable for the page's lifetime: every value the listener needs is read
    // from the refs synced above rather than closed over.
  }, []);
}
