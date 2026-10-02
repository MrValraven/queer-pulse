import {
  Button,
  FadeIn,
  LoadErrorState,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAdminListingDrafts } from "./api/useAdminListingDrafts";
import { ListingDraftRows } from "./ListingDraftRows";
import styles from "./EditSuggestions.module.css";

/**
 * Members' unfinished "list your business" drafts (a tab inside
 * `AdminListingsPage`, Admin only). Read-only by design: staff can see how far
 * someone got and offer a hand through their official thread, but never open,
 * edit or publish the draft itself. Publishing carries the owner's own consent
 * declarations, which nobody can give on their behalf.
 */
export function ListingDraftsSection() {
  const { t } = useTranslation();
  const {
    rows,
    total,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useAdminListingDrafts();

  return (
    <FadeIn delay={80}>
      <p className={styles.queueCount}>{t("admin:listingDrafts.intro")}</p>
      {isLoading ? (
        <DraftRowsSkeleton />
      ) : isError ? (
        <LoadErrorState
          onRetry={() => void refetch()}
          title={t("admin:listingDrafts.loadError.title")}
          description={t("admin:listingDrafts.loadError.body")}
        />
      ) : (
        <>
          <p className={styles.queueCount} role="status">
            {t("admin:listingDrafts.count", { count: total })}
          </p>
          <ListingDraftRows drafts={rows} />
          {hasNextPage && (
            <div className={styles.loadMore}>
              <Button
                variant="ghost"
                size="md"
                disabled={isFetchingNextPage}
                onClick={() => void fetchNextPage()}
              >
                {isFetchingNextPage
                  ? t("admin:listingDrafts.loadingMore")
                  : t("admin:listingDrafts.loadMore")}
              </Button>
            </div>
          )}
        </>
      )}
    </FadeIn>
  );
}

function DraftRowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={104}
          style={{ borderRadius: 14 }}
        />
      ))}
    </div>
  );
}
