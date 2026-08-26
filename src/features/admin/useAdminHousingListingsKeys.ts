import { useEffect, useRef } from "react";
import { hasOpenModal } from "../../shared/components/ui/modalStack";
import type {
  AdminHousingListingDTO,
  HousingListingDecisionAction,
} from "./api/adminHousingListings.api";
import { allowedDecisions } from "./adminHousingListingsStatus";

/** Keys that move the queue, and the decision each letter records. */
const DECISION_KEYS: Record<string, HousingListingDecisionAction> = {
  a: "approve",
  c: "request_changes",
  r: "reject",
  d: "take_down",
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
 * between rows, `A` approves the focused row, `C` sends it back for changes,
 * `R` refuses it and `D` pulls a live one. A decision key that the focused
 * row's state does not allow does nothing.
 *
 * Inert while a modifier is held (so browser shortcuts still work), while any
 * dialog is open (the reason modal owns the keyboard then), and while focus
 * sits in a text field. Latest values live in refs synced every render, so the
 * single listener stays mounted for the page's lifetime instead of re-binding
 * on every row change.
 */
export function useAdminHousingListingsKeys({
  listings,
  focusedRef,
  setFocusedRef,
  onDecide,
}: {
  listings: AdminHousingListingDTO[];
  focusedRef: string | null;
  setFocusedRef: (ref: string | null) => void;
  onDecide: (
    listing: AdminHousingListingDTO,
    action: HousingListingDecisionAction,
  ) => void;
}): void {
  const listingsRef = useRef(listings);
  const focusedRefRef = useRef(focusedRef);
  const onDecideRef = useRef(onDecide);
  const setFocusedRefRef = useRef(setFocusedRef);
  useEffect(() => {
    listingsRef.current = listings;
    focusedRefRef.current = focusedRef;
    onDecideRef.current = onDecide;
    setFocusedRefRef.current = setFocusedRef;
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
          (row) => row.ref === focusedRefRef.current,
        );
        const nextIndex = isNext
          ? Math.min(currentIndex < 0 ? 0 : currentIndex + 1, rows.length - 1)
          : Math.max(currentIndex < 0 ? 0 : currentIndex - 1, 0);
        setFocusedRefRef.current(rows[nextIndex]!.ref);
        return;
      }

      const action = DECISION_KEYS[key];
      if (!action) return;
      const focused = rows.find((row) => row.ref === focusedRefRef.current);
      if (!focused) return;
      if (!allowedDecisions(focused.status).includes(action)) return;
      event.preventDefault();
      onDecideRef.current(focused, action);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // Stable for the page's lifetime: every value the listener needs is read
    // from the refs synced above rather than closed over.
  }, []);
}
