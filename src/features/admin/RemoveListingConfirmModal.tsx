import { ListingDeleteFlow } from "../marketing/listBusiness/delete/ListingDeleteFlow";
import type { ListingQueueRow } from "./api/adminListings.api";
import { focusListingQueueHeadingAfterRemove } from "./listingQueueFocus";

/**
 * The listings queue's confirm step for the destructive single-listing
 * Remove, mounted once by the caller (row or drawer) and bound to the armed
 * row. Renders the shared `ListingDeleteFlow` in its moderator variant: what
 * goes, three acknowledgements, a required reason the backend sends to the
 * owner, then the exact listing name. The flow is built on `Modal`, so it
 * gets the Tab focus-trap, `document.body` portal and focus-restore it needs
 * when opened from inside another dialog (the `ListingPreviewDrawer`).
 *
 * `onConfirm` must resolve after the server confirmed the delete and reject
 * on failure; the flow then stays open on its last step with an inline error.
 * The caller unmounts this after success; the removed row takes the menu
 * trigger with it, so focus then moves to the queue heading
 * (`focusListingQueueHeadingAfterRemove`). Bulk remove keeps its own lighter
 * `BulkRemoveConfirmModal`.
 */
export function RemoveListingConfirmModal({
  row,
  onConfirm,
  onClose,
}: {
  row: ListingQueueRow;
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
}) {
  return (
    <ListingDeleteFlow
      listingName={row.name}
      variant="moderator"
      onConfirmDelete={async (reason) => {
        // The moderator variant always hands over a trimmed, non-empty reason.
        if (!reason) throw new Error("A removal reason is required.");
        await onConfirm(reason);
        focusListingQueueHeadingAfterRemove();
      }}
      onClose={onClose}
    />
  );
}
