import { useState } from "react";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HIDE_GROUP_LISTING_REASON_MAX_LENGTH } from "./api/adminHousingGroups.api";
import type { GroupListingStatus } from "./api/adminHousingGroupListings.api";

/**
 * The confirm step in front of hiding a group listing (PRD-463), published or
 * still in review.
 *
 * The server requires a reason. A `live` listing's poster reads it on their
 * `group_listing_decided` notification. A listing still in review, question
 * or declined has never reached the board, so its poster gets no
 * notification; the reason still lands on the row and on the listing itself.
 * `listingStatus` picks which body the dialog shows. The shared
 * `ConfirmDialog` keeps Hide listing disabled until the trimmed reason is
 * non-empty and caps it at the server's limit, so the moderator is stopped
 * here before a request that would come back 400.
 *
 * Mounted by the caller only while open; `onSubmit` receives the trimmed text.
 */
export function HideGroupListingDialog({
  listingTitle,
  listingStatus,
  isPending,
  onSubmit,
  onClose,
}: {
  listingTitle: string;
  listingStatus: GroupListingStatus;
  isPending: boolean;
  onSubmit: (reason: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const isListingLive = listingStatus === "live";

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={() => onSubmit(reason.trim())}
      tone="destructive"
      loading={isPending}
      title={t("admin:housingGroups.listings.hideDialog.title", {
        title: listingTitle,
      })}
      description={t(
        isListingLive
          ? "admin:housingGroups.listings.hideDialog.body"
          : "admin:housingGroups.listings.hideDialog.bodyUnpublished",
      )}
      confirmLabel={t("admin:housingGroups.listings.hideDialog.confirm")}
      reason={{
        value: reason,
        onChange: setReason,
        label: t("admin:housingGroups.listings.hideDialog.reasonLabel"),
        placeholder: t(
          "admin:housingGroups.listings.hideDialog.reasonPlaceholder",
        ),
        required: true,
        maxLength: HIDE_GROUP_LISTING_REASON_MAX_LENGTH,
      }}
    />
  );
}
