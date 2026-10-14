import { useMemo, useState } from "react";
import { FiKey } from "react-icons/fi";
import { Button, FadeIn, LoadErrorState } from "../../shared/components/ui";
import { AdminTabs, type AdminTab } from "./ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useListingClaims } from "./api/useListingClaims";
import {
  ListingClaimRows,
  ListingClaimRowsSkeleton,
  type ListingClaimFilter,
} from "./ListingClaimRows";
import type { ListingClaimDTO } from "./api/listingClaims.api";
import styles from "./ListingClaims.module.css";

const FILTERS: ListingClaimFilter[] = [
  "pending",
  "approved",
  "declined",
  "all",
];

/**
 * Moderator triage of member requests to take ownership of an existing
 * directory listing (the "Ownership claims" view of `AdminListingsPage`,
 * beside "Edit suggestions": the two sibling review queues
 * `ListingsController` exposes under `admin/*`).
 *
 * Built as one panel like the Submissions queue: a head saying what the queue
 * is, the status tabs, then the body. The Pending tab carries the queue depth
 * as its count, and a visually hidden status line announces it when it moves.
 *
 * The queue is paginated (ENG-41), and the endpoint only ever returns PENDING
 * claims, so the load-more button belongs to the Pending and All tabs. The
 * Approved and Declined tabs hold the claims decided on this page while it
 * stays open: each decided claim is kept whole in `decidedClaims`, because the
 * live queue refetches after a decision and the claim drops out of `rows`.
 */
export function ListingClaimsSection() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<ListingClaimFilter>("pending");
  const {
    rows,
    total,
    isLoading,
    isError,
    isFetching,
    errorUpdateCount,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useListingClaims();
  const [decidedClaims, setDecidedClaims] = useState<
    Record<string, ListingClaimDTO>
  >({});

  const claims = useMemo(
    () => mergeDecidedClaims(rows, decidedClaims),
    [rows, decidedClaims],
  );
  // `total` is the server's pending depth, so it already leaves out anything
  // the server has decided. Only a claim decided on this page that the queue
  // still returns as pending (the refetch has not landed yet) comes off it.
  const pendingCount = Math.max(
    0,
    total -
      rows.filter(
        (row) =>
          row.status === "pending" &&
          (decidedClaims[row.id]?.status ?? "pending") !== "pending",
      ).length,
  );
  const visibleClaims =
    filter === "all"
      ? claims
      : claims.filter((claim) => claim.status === filter);
  const isPendingQueueVisible = filter === "pending" || filter === "all";
  const hasLoadedClaims = rows.length > 0;
  // A failed `fetchNextPage` also sets `isError`; with rows loaded, the list
  // stays and Load more is the retry. A Retry on a queue that never loaded
  // drops back to pending, so `errorUpdateCount` holds the error panel (and
  // its focused button) in place through it.
  const isShowingError =
    !hasLoadedClaims && (isError || (errorUpdateCount > 0 && isFetching));
  const hasSettled = !isLoading && !isShowingError;

  function handleResolved(decidedClaim: ListingClaimDTO) {
    setDecidedClaims((current) => ({
      ...current,
      [decidedClaim.id]: decidedClaim,
    }));
  }

  return (
    <FadeIn delay={70}>
      <section
        className={styles.panel}
        aria-label={t("admin:adminListings.view.claims")}
      >
        <div className={styles.panelHead}>
          <p className={styles.intro}>
            <FiKey aria-hidden className={styles.introIcon} />
            {t("admin:listingClaims.intro")}
          </p>
          <AdminTabs
            tabs={FILTERS.map((value) =>
              filterTab(value, {
                label: t(`admin:listingClaims.filter.${value}`),
                pendingCount: hasSettled ? pendingCount : undefined,
                decidedCount: hasSettled
                  ? claims.filter((claim) => claim.status === value).length
                  : undefined,
                isPendingCountUnavailable: isShowingError,
              }),
            )}
            active={filter}
            onChange={(value) => setFilter(value as ListingClaimFilter)}
          />
        </div>
        <p className="visuallyHidden" role="status">
          {hasSettled
            ? t("admin:listingClaims.pendingCount", { count: pendingCount })
            : ""}
        </p>
        {/* An outage must not render as an empty queue: someone is waiting
            to be told whether the listing is theirs (DES-22). */}
        {isShowingError ? (
          <div className={styles.panelMessage}>
            <LoadErrorState
              onRetry={() => void refetch()}
              isRetrying={isFetching}
              title={t("admin:listingClaims.loadError.title")}
              description={t("admin:listingClaims.loadError.body")}
            />
          </div>
        ) : isLoading ? (
          <ListingClaimRowsSkeleton />
        ) : (
          <FadeIn>
            <ListingClaimRows
              claims={visibleClaims}
              filter={filter}
              onResolved={handleResolved}
            />
          </FadeIn>
        )}
      </section>
      {isPendingQueueVisible && hasLoadedClaims && hasNextPage && (
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
    </FadeIn>
  );
}

/** One status tab. Pending carries the queue depth (or an alert mark when the
 *  read failed); Approved and Declined carry how many were decided on this
 *  page, from zero, so a first decision rolls the number instead of popping a
 *  new pill in; All carries no count. */
function filterTab(
  value: ListingClaimFilter,
  {
    label,
    pendingCount,
    decidedCount,
    isPendingCountUnavailable,
  }: {
    label: string;
    pendingCount: number | undefined;
    decidedCount: number | undefined;
    isPendingCountUnavailable: boolean;
  },
): AdminTab {
  if (value === "pending") {
    return {
      id: value,
      label,
      count: pendingCount,
      isCountRolling: true,
      isCountUnavailable: isPendingCountUnavailable,
    };
  }
  if (value === "all") return { id: value, label };
  return { id: value, label, count: decidedCount, isCountRolling: true };
}

/** The loaded queue with this page's decisions laid over it. A decided claim
 *  the refetched queue no longer returns is appended, so it stays on the
 *  Approved, Declined and All tabs. */
function mergeDecidedClaims(
  rows: ListingClaimDTO[],
  decidedClaims: Record<string, ListingClaimDTO>,
): ListingClaimDTO[] {
  const loadedIds = new Set(rows.map((row) => row.id));
  const decidedOffQueue = Object.values(decidedClaims).filter(
    (claim) => !loadedIds.has(claim.id),
  );
  return [
    ...rows.map((row) => decidedClaims[row.id] ?? row),
    ...decidedOffQueue,
  ];
}
