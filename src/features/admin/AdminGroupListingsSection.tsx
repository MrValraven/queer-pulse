import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { Button, FadeIn } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminChip } from "./ui";
import {
  useAdminGroupListings,
  useSetGroupListingHidden,
} from "./api/useAdminHousingGroups";
import type { AdminGroupListingDTO } from "./api/adminHousingGroups.api";
import { HideGroupListingDialog } from "./HideGroupListingDialog";
import styles from "./AdminHousingCoopsPage.module.css";

/**
 * Group-listings moderation table, rendered below the join-request queue on the
 * admin housing-groups page. A moderator can hide a listing that breaks the
 * norms (hidden price, broker post, hate speech) and un-hide it if it was a
 * mistake — wired to useSetGroupListingHidden. Hiding is instant in the UI via
 * query invalidation; it's a no-op in demo mode (the demo table is empty).
 *
 * Hide goes through `HideGroupListingDialog` (PRD-463): the server requires a
 * reason, and the poster reads it on their notification. The dialog stays open
 * on an error so the reason already typed survives a retry. Un-hide undoes a
 * mistake and stays one click.
 *
 * Hiding is the POST-publication takedown and nothing else. Whether a listing
 * ever becomes public is the separate pre-publication review, which lives on
 * its own console (LOC-19) and is linked from the section head so the two
 * decisions never get collapsed into one control.
 */
export function AdminGroupListingsSection() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data, isLoading, isError } = useAdminGroupListings();
  const setHidden = useSetGroupListingHidden();
  const [listingToHide, setListingToHide] =
    useState<AdminGroupListingDTO | null>(null);

  const listings = data ?? [];

  function showUpdateError(error: Error) {
    showToast(
      describeError(t("admin:housingGroups.listings.error"), error),
      "error",
    );
  }

  function unhide(listing: AdminGroupListingDTO) {
    setHidden.mutate(
      { id: listing.id, hidden: false },
      { onError: showUpdateError },
    );
  }

  function hideWithReason(listing: AdminGroupListingDTO, reason: string) {
    setHidden.mutate(
      { id: listing.id, hidden: true, reason },
      {
        // Close only the dialog this request came from: the moderator may
        // have dismissed it and opened Hide on another row meanwhile.
        onSuccess: () =>
          setListingToHide((current) =>
            current?.id === listing.id ? null : current,
          ),
        onError: showUpdateError,
      },
    );
  }

  if (isLoading) return null;

  return (
    <div className={styles.joinRequests}>
      <h2 className={styles.sectionTitle}>
        {t("admin:housingGroups.listings.title")}
      </h2>
      <p className={styles.emptyText}>
        {t("admin:housingGroups.listings.reviewQueueNote")}{" "}
        <Link to={routes.adminHousingGroupListings}>
          {t("admin:housingGroups.listings.reviewQueueCta")}
          <FiArrowRight aria-hidden />
        </Link>
      </p>
      {isError ? (
        <div className={styles.notice}>
          <p className={styles.noticeText}>
            {t("admin:housingGroups.listings.loadError")}
          </p>
        </div>
      ) : listings.length === 0 ? (
        <p className={styles.emptyText}>
          {t("admin:housingGroups.listings.empty")}
        </p>
      ) : (
        <div className={styles.rows}>
          {listings.map((listing, index) => (
            <FadeIn key={listing.id} delay={Math.min(index, 8) * 50}>
              <div className={styles.row}>
                <div className={styles.rowMain}>
                  <div className={styles.rowTop}>
                    <span className={styles.rowName}>{listing.title}</span>
                    {listing.hidden && (
                      <AdminChip tone="danger" dot>
                        {t("admin:housingGroups.listings.hiddenChip")}
                      </AdminChip>
                    )}
                    <AdminChip tone="plum">
                      {listing.groupSlug ??
                        t("admin:housingGroups.listings.noGroup")}
                    </AdminChip>
                  </div>
                  <div className={styles.rowMeta}>
                    {listing.neighbourhood} ·{" "}
                    {t("admin:housingGroups.listings.perMonth", {
                      price: listing.priceEuros,
                    })}
                  </div>
                </div>
                <div className={styles.rowActions}>
                  <Button
                    variant={listing.hidden ? "jade" : "ghost"}
                    size="md"
                    onClick={() =>
                      listing.hidden
                        ? unhide(listing)
                        : setListingToHide(listing)
                    }
                  >
                    {listing.hidden
                      ? t("admin:housingGroups.listings.unhideCta")
                      : t("admin:housingGroups.listings.hideCta")}
                  </Button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}
      {listingToHide && (
        <HideGroupListingDialog
          listingTitle={listingToHide.title}
          listingStatus={listingToHide.status}
          isPending={setHidden.isPending}
          onSubmit={(reason) => hideWithReason(listingToHide, reason)}
          onClose={() => setListingToHide(null)}
        />
      )}
    </div>
  );
}
