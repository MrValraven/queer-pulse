import { Button, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { describeError } from "../../shared/api/errorMessage";
import { AdminChip } from "./ui";
import {
  useAdminGroupListings,
  useSetGroupListingHidden,
} from "./api/useAdminHousingGroups";
import type { AdminGroupListingDTO } from "./api/adminHousingGroups.api";
import styles from "./AdminHousingCoopsPage.module.css";

/**
 * Group-listings moderation table, rendered below the join-request queue on the
 * admin housing-groups page. A moderator can hide a listing that breaks the
 * norms (hidden price, broker post, hate speech) and un-hide it if it was a
 * mistake — wired to useSetGroupListingHidden. Hiding is instant in the UI via
 * query invalidation; it's a no-op in demo mode (the demo table is empty).
 */
export function AdminGroupListingsSection() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { data, isLoading, isError } = useAdminGroupListings();
  const setHidden = useSetGroupListingHidden();

  const listings = data ?? [];

  function toggleHidden(listing: AdminGroupListingDTO) {
    setHidden.mutate(
      { id: listing.id, hidden: !listing.hidden },
      {
        onError: (error) =>
          showToast(
            describeError(t("admin:housingGroups.listings.error"), error),
            "error",
          ),
      },
    );
  }

  if (isLoading) return null;

  return (
    <div className={styles.joinRequests}>
      <h2 className={styles.sectionTitle}>
        {t("admin:housingGroups.listings.title")}
      </h2>
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
                    onClick={() => toggleHidden(listing)}
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
    </div>
  );
}
