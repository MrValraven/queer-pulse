import { useEffect, useRef, type RefObject } from "react";
import { hasOpenModal } from "../../shared/components/ui/modalStack";
import type {
  AdminVerificationRequestDTO,
  VerificationRequestDecisionAction,
} from "./api/adminVerifications.api";

interface UseReviewQueueKeyboardShortcutsArgs {
  /** The currently-loaded, filtered rows J/K move focus across. */
  rows: AdminVerificationRequestDTO[];
  /** Non-null while the review drawer is open — the whole shortcut set goes
   *  inert then (a reviewer inside a request shouldn't have the queue behind
   *  it silently reacting to their keystrokes). */
  selectedRequestId: string | null;
  focusedRequestId: string | null;
  setFocusedRequestId: (id: string | null) => void;
  /** Non-null while the keyboard `R` shortcut's own reject-reason modal is
   *  open (a different instance from the bulk bar's own). */
  rejectModalIds: string[] | null;
  setRejectModalIds: (ids: string[] | null) => void;
  bulkDecide: (
    ids: string[],
    action: VerificationRequestDecisionAction,
    reason?: string,
  ) => Promise<unknown>;
  /** Called with the caught error when the keyboard `A` shortcut's approve
   *  fails — left to the caller so this hook doesn't need to know about
   *  toasts/i18n. */
  onApproveError: (caught: unknown) => void;
  /** Wraps just the search field's `<input>` — the `/` shortcut focuses it. */
  searchInputWrapperRef: RefObject<HTMLDivElement | null>;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

/**
 * The Review-queue segment's keyboard flow (Task 4): `J`/`K` move
 * `focusedRequestId` between the loaded rows, `A` approves the focused row,
 * `R` opens the reject-reason modal for it, and `/` focuses the search
 * field. Extracted out of `ReviewQueueSegment` to keep that component under
 * this repo's per-function line budget — it's a pure side-effecting hook
 * (returns nothing), not a piece of UI.
 *
 * Inert while: a modifier key is held (so browser/OS shortcuts still work),
 * ANY dialog is open (`hasOpenModal()` — the drawer, either reject modal, or
 * anything else on the shared modal stack), or focus sits inside a text
 * field. Latest values live in refs, synced every render, so the single
 * `keydown` listener can stay mounted for the segment's whole lifetime
 * instead of re-binding on every row/filter change — the same "latest ref"
 * pattern `RequestQueueHeader`'s debounce uses in `AdminVerificationsPage`.
 */
export function useReviewQueueKeyboardShortcuts({
  rows,
  selectedRequestId,
  focusedRequestId,
  setFocusedRequestId,
  rejectModalIds,
  setRejectModalIds,
  bulkDecide,
  onApproveError,
  searchInputWrapperRef,
}: UseReviewQueueKeyboardShortcutsArgs): void {
  const rowsRef = useRef(rows);
  const selectedRequestIdRef = useRef(selectedRequestId);
  const focusedRequestIdRef = useRef(focusedRequestId);
  const rejectModalIdsRef = useRef(rejectModalIds);
  const bulkDecideRef = useRef(bulkDecide);
  const onApproveErrorRef = useRef(onApproveError);
  useEffect(() => {
    rowsRef.current = rows;
    selectedRequestIdRef.current = selectedRequestId;
    focusedRequestIdRef.current = focusedRequestId;
    rejectModalIdsRef.current = rejectModalIds;
    bulkDecideRef.current = bulkDecide;
    onApproveErrorRef.current = onApproveError;
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Inert while the drawer or ANY dialog is open (the shared modal stack
      // catches this generically), while typing in a field, or alongside a
      // browser/OS shortcut modifier. `selectedRequestIdRef`/
      // `rejectModalIdsRef` are kept as an explicit fast-path on top, not a
      // substitute for the modal-stack check.
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (hasOpenModal()) return;
      if (selectedRequestIdRef.current) return;
      if (rejectModalIdsRef.current) return;
      if (isTypingTarget(document.activeElement)) return;

      const key = event.key;
      const currentRows = rowsRef.current;

      if (key === "/") {
        event.preventDefault();
        searchInputWrapperRef.current
          ?.querySelector<HTMLInputElement>("input")
          ?.focus();
        return;
      }

      const lowerKey = key.toLowerCase();

      if (lowerKey === "j" || lowerKey === "k") {
        if (currentRows.length === 0) return;
        event.preventDefault();
        const currentId = focusedRequestIdRef.current;
        const currentIndex = currentId
          ? currentRows.findIndex((row) => row.id === currentId)
          : -1;
        const nextIndex =
          lowerKey === "j"
            ? Math.min(
                currentIndex < 0 ? 0 : currentIndex + 1,
                currentRows.length - 1,
              )
            : Math.max(currentIndex < 0 ? 0 : currentIndex - 1, 0);
        setFocusedRequestId(currentRows[nextIndex]!.id);
        return;
      }

      if (lowerKey === "a" || lowerKey === "r") {
        const focusedId = focusedRequestIdRef.current;
        if (!focusedId) return;
        if (!currentRows.some((row) => row.id === focusedId)) return;
        event.preventDefault();
        if (lowerKey === "a") {
          void bulkDecideRef.current([focusedId], "approve").catch(
            (caught: unknown) => onApproveErrorRef.current(caught),
          );
        } else {
          setRejectModalIds([focusedId]);
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // Stable for the segment's lifetime — every value the listener needs is
    // read from the refs synced above, not closed over directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
