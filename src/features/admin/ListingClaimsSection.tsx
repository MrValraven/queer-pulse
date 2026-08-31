import { useMemo, useState } from "react";
import {
  Button,
  FadeIn,
  LoadErrorState,
  SkeletonLine,
} from "../../shared/components/ui";
import { AdminTabs } from "./ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useListingClaims } from "./api/useListingClaims";
import { ListingClaimRows } from "./ListingClaimRows";
import type { ListingClaimStatus } from "./api/listingClaims.api";
import styles from "./EditSuggestions.module.css";

type StatusFilter = ListingClaimStatus | "all";
const FILTERS: StatusFilter[] = ["pending", "approved", "declined", "all"];

/**
 * Moderator triage of member requests to take ownership of an existing
 * directory listing (a tab inside `AdminListingsPage`, alongside "edit
 * suggestions" — the two sibling review queues `ListingsController` exposes
 * under `admin/*`). Mirrors `EditSuggestionsSection`'s status-filter +
 * optimistic-override shape exactly.
 *
 * The queue is paginated (ENG-41). The endpoint only ever returns PENDING
 * claims, so the count line and the load-more button belong to the pending and
 * "all" tabs; the approved/declined tabs are populated purely by this session's
 * own optimistic overrides, and quoting the pending total beside them would
 * misdescribe what is on screen.
 */
export function ListingClaimsSection() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const {
    rows,
    total,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useListingClaims();
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, ListingClaimStatus>
  >({});

  // The server-side queue is pending-only, so these are the two tabs whose
  // contents `total` actually describes.
  const isPendingQueueVisible = filter === "pending" || filter === "all";

  const visibleRows = useMemo(() => {
    const withOverrides = rows.map((row) => {
      const override = statusOverrides[row.id];
      return override ? { ...row, status: override } : row;
    });
    return filter === "all"
      ? withOverrides
      : withOverrides.filter((row) => row.status === filter);
  }, [rows, statusOverrides, filter]);

  function handleResolved(id: string, status: ListingClaimStatus) {
    setStatusOverrides((current) => ({ ...current, [id]: status }));
  }

  return (
    <>
      <FadeIn delay={80}>
        <AdminTabs
          tabs={FILTERS.map((value) => ({
            id: value,
            label: t(`admin:listingClaims.filter.${value}`),
          }))}
          active={filter}
          onChange={(value) => setFilter(value as StatusFilter)}
        />
      </FadeIn>

      <FadeIn delay={100}>
        {/* An outage must not render as "no claims in this filter": someone
            is waiting to be told whether the listing is theirs (DES-22). */}
        {isLoading ? (
          <ClaimRowsSkeleton />
        ) : isError ? (
          <LoadErrorState
            onRetry={() => void refetch()}
            title={t("admin:listingClaims.loadError.title")}
            description={t("admin:listingClaims.loadError.body")}
          />
        ) : (
          <>
            {isPendingQueueVisible && (
              <p className={styles.queueCount} role="status">
                {t("admin:listingClaims.pendingCount", { count: total })}
              </p>
            )}
            <ListingClaimRows
              claims={visibleRows}
              onResolved={handleResolved}
            />
            {isPendingQueueVisible && hasNextPage && (
              <div className={styles.loadMore}>
                <Button
                  variant="ghost"
                  size="md"
                  disabled={isFetchingNextPage}
                  onClick={() => void fetchNextPage()}
                >
                  {isFetchingNextPage
                    ? t("admin:listingClaims.loadingMore")
                    : t("admin:listingClaims.loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </FadeIn>
    </>
  );
}

function ClaimRowsSkeleton() {
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
