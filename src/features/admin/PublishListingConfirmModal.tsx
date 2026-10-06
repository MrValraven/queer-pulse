import { useEffect } from "react";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ListingQueueRow } from "./api/adminListings.api";
import { focusListingQueueHeadingAfterRemove } from "./listingQueueFocus";

/**
 * A one-beat check before a single listing goes live, since publishing puts
 * it in front of members straight away. Uses the default `ConfirmDialog` tone
 * with no reason field: the move is reversible from the listing's menu.
 *
 * The status move patches the cached row optimistically, so the Publish
 * button that opened this dialog is gone by the time it closes (the row
 * leaves the "In review" tab, or swaps the button for "View live"). Focus
 * restore then has no target, so unmounting hands focus to the queue heading
 * through `focusListingQueueHeadingAfterRemove`, which does nothing when a
 * Cancel already returned focus to a live Publish button.
 */
export function PublishListingConfirmModal({
  row,
  pending,
  onConfirm,
  onClose,
}: {
  row: ListingQueueRow;
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => () => focusListingQueueHeadingAfterRemove(), []);

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("admin:adminListings.publish.confirm.title", {
        name: row.name,
      })}
      description={t("admin:adminListings.publish.confirm.body", {
        name: row.name,
      })}
      loading={pending}
      confirmLabel={t("admin:adminListings.publish.confirm.confirmCta")}
      cancelLabel={t("admin:common.cancel")}
    />
  );
}
