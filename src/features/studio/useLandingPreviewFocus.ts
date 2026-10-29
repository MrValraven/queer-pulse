import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { StudioLandingPreviewOwnerView } from "./api/studioLandingPreviews.adapters";
import type { StudioLandingPreviewAction } from "./api/studioLandingPreviews.api";

interface FocusRequest {
  previewId: string;
  action: StudioLandingPreviewAction;
  /** The row that followed the answered one when the answer was sent. */
  nextPreviewId: string | null;
  isSuccess: boolean;
}

function rowElementOf(
  list: HTMLElement | null,
  previewId: string,
): HTMLElement | null {
  const rows = list?.querySelectorAll<HTMLElement>("[data-preview-id]");
  return (
    Array.from(rows ?? []).find((row) => row.dataset.previewId === previewId) ??
    null
  );
}

/** Every owner action unmounts the control that had focus (approve swaps the
 *  buttons, decline and withdraw fold the row, a 404 folds it too). After the
 *  answer settles, focus moves to what survives: the answered row's Withdraw
 *  button after an approval, else the next row's first action, else the card
 *  heading, or the outside target when no row is left (the card then folds
 *  away and goes inert). A refused answer on a row that is still there keeps focus where
 *  it is. Returns the function the card calls once an answer settles. */
export function useLandingPreviewFocus(
  previews: StudioLandingPreviewOwnerView[],
  listRef: RefObject<HTMLElement | null>,
  headingRef: RefObject<HTMLElement | null>,
  outsideFallbackRef?: RefObject<HTMLElement | null>,
): (request: FocusRequest) => void {
  const requestRef = useRef<FocusRequest | null>(null);
  const [settledCount, setSettledCount] = useState(0);

  useEffect(() => {
    const request = requestRef.current;
    if (!request) return;
    requestRef.current = null;
    const list = listRef.current;
    const isRowKept = previews.some((row) => row.id === request.previewId);
    if (isRowKept && !request.isSuccess) return;
    const approvedRow = isRowKept
      ? rowElementOf(list, request.previewId)
      : null;
    const nextRow =
      request.nextPreviewId !== null &&
      previews.some((row) => row.id === request.nextPreviewId)
        ? rowElementOf(list, request.nextPreviewId)
        : null;
    const target =
      approvedRow?.querySelector<HTMLElement>(
        '[data-preview-action="withdraw"]',
      ) ??
      approvedRow?.querySelector<HTMLElement>("[data-preview-action]") ??
      nextRow?.querySelector<HTMLElement>("[data-preview-action]") ??
      // With no row left the card folds away and goes inert, so focus moves
      // to a target outside it.
      (previews.length === 0 ? outsideFallbackRef?.current : null) ??
      headingRef.current;
    target?.focus();
  }, [settledCount, previews, listRef, headingRef, outsideFallbackRef]);

  return useCallback((request: FocusRequest) => {
    requestRef.current = request;
    setSettledCount((count) => count + 1);
  }, []);
}
