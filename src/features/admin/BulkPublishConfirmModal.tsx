import { useEffect } from "react";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { focusListingQueueHeadingAfterRemove } from "./listingQueueFocus";

/**
 * The bulk counterpart to `PublishListingConfirmModal`: a one-beat check
 * before every selected listing goes live, since publishing puts them in
 * front of members straight away. Uses the default `ConfirmDialog` tone with
 * no reason field, because the move is reversible with Back to review.
 *
 * A successful publish clears the selection, which unmounts the bulk bar and
 * the Publish button that opened this dialog. Focus restore then has no
 * target, so unmounting hands focus to the queue heading through
 * `focusListingQueueHeadingAfterRemove`, which does nothing when a Cancel
 * already returned focus to the live Publish button.
 */
export function BulkPublishConfirmModal({
  count,
  pending,
  onConfirm,
  onClose,
}: {
  count: number;
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
      title={t("admin:adminListings.bulk.confirmPublish.title", { count })}
      description={t("admin:adminListings.bulk.confirmPublish.body", {
        count,
      })}
      loading={pending}
      confirmLabel={t("admin:adminListings.bulk.confirmPublish.confirmCta")}
      cancelLabel={t("admin:common.cancel")}
    />
  );
}
