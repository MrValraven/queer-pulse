import { useCallback, useState } from "react";
import { BlockConfirmModal } from "./FeedModeration";
import {
  FeedBlockConfirmContext,
  type BlockConfirmRequest,
} from "./feedBlockConfirmContext";

/**
 * Hosts the feed's block-confirmation dialog above the card list, so the
 * dialog survives the row that opened it. A block is an optimistic removal:
 * the card leaves the feed the moment `toggleBlock` resolves, and a dialog
 * hosted inside that card would unmount mid-confirmation, along with its
 * "done" panel, taking the "also report" toggle and the visible confirmation
 * with it. Hosting the dialog here, above the list, keeps it mounted for as
 * long as the member is looking at it.
 *
 * On close, focus returns to the control that opened the dialog when that
 * control is still mounted, otherwise to `fallbackFocusRef` (the named list
 * region itself), so a dialog whose card is gone hands focus back to the
 * feed the member was reading. `preventScroll` keeps the page where it was.
 */
export function FeedBlockConfirmHost({
  fallbackFocusRef,
  children,
}: {
  fallbackFocusRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}) {
  const [request, setRequest] = useState<BlockConfirmRequest | null>(null);

  const requestBlockConfirm = useCallback((next: BlockConfirmRequest) => {
    setRequest(next);
  }, []);

  // A plain function on purpose: it reads `request?.returnFocusRef.current`,
  // a ref dereferenced fresh on every close, which has no honest place in a
  // memoization dependency array, and React Compiler rejects a hand-written
  // list it cannot reconcile. Recreating it each render is free, since
  // `BlockConfirmModal` only calls it at click and keydown time.
  function handleClose() {
    // Reads fresh every time the dialog closes: `returnFocusRef` is the
    // opener's own ref object, and React has already nulled its `.current`
    // if that control's card unmounted while the dialog was open.
    const focusTarget =
      request?.returnFocusRef.current ?? fallbackFocusRef.current;
    setRequest(null);
    focusTarget?.focus({ preventScroll: true });
  }

  return (
    <FeedBlockConfirmContext.Provider value={{ requestBlockConfirm }}>
      {children}
      {request && (
        <BlockConfirmModal
          authorName={request.authorName}
          slug={request.slug}
          onClose={handleClose}
        />
      )}
    </FeedBlockConfirmContext.Provider>
  );
}
