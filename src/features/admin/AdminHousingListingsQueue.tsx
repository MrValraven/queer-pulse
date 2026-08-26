import { useState } from "react";
import { FiHome } from "react-icons/fi";
import { Button, EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  AdminHousingListingDTO,
  HousingListingDecisionAction,
  HousingReviewQueueSort,
  HousingReviewQueueStatus,
} from "./api/adminHousingListings.api";
import {
  useDecideHousingListing,
  useHousingReviewQueue,
} from "./api/useAdminHousingListings";
import { HousingDecisionReasonModal } from "./AdminHousingListingsDecision";
import { AdminHousingListingRow } from "./AdminHousingListingsRow";
import { useAdminHousingListingsKeys } from "./useAdminHousingListingsKeys";
import styles from "./AdminHousingListingsPage.module.css";

/** A decision waiting on the reason its target requires. */
interface PendingDecision {
  listing: AdminHousingListingDTO;
  action: HousingListingDecisionAction;
}

function QueueSkeleton() {
  return (
    <div className={styles.skeletons} aria-hidden>
      {[0, 1, 2].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={260}
          style={{ borderRadius: 22 }}
        />
      ))}
    </div>
  );
}

/**
 * The queue itself: the rows, the keyboard flow, and the four decisions.
 *
 * A decision that needs a reason opens the reason dialog first, because the
 * lister is shown that sentence verbatim and telling somebody their home was
 * refused without one is the thing this console exists to stop. Approve is a
 * single click.
 */
export function AdminHousingListingsQueue({
  status,
  sort,
}: {
  status: HousingReviewQueueStatus;
  sort: HousingReviewQueueSort;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [focusedRef, setFocusedRef] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingDecision | null>(null);
  const decide = useDecideHousingListing();
  const {
    listings,
    total,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useHousingReviewQueue(status, sort);

  function runDecision(
    listing: AdminHousingListingDTO,
    action: HousingListingDecisionAction,
    reason?: string,
  ) {
    decide.mutate(
      { listing, decision: action, reason },
      {
        onSuccess: () => {
          setPending(null);
          showToast(
            t(`admin:housingListings.toast.${action}`, {
              title: listing.title,
            }),
            action === "approve" ? "success" : "info",
          );
        },
        onError: () =>
          showToast(t("admin:housingListings.toast.error"), "error"),
      },
    );
  }

  function handleDecide(
    listing: AdminHousingListingDTO,
    action: HousingListingDecisionAction,
  ) {
    if (action === "approve") {
      runDecision(listing, action);
      return;
    }
    setPending({ listing, action });
  }

  useAdminHousingListingsKeys({
    listings,
    focusedRef,
    setFocusedRef,
    onDecide: handleDecide,
  });

  if (isLoading) return <QueueSkeleton />;

  if (isError) {
    return (
      <EmptyState
        icon={<FiHome />}
        title={t("admin:housingListings.error.title")}
        description={t("admin:housingListings.error.body")}
        action={{
          label: t("admin:housingListings.error.retry"),
          onClick: () => void refetch(),
        }}
      />
    );
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={<FiHome />}
        title={t("admin:housingListings.empty.title")}
        description={t("admin:housingListings.empty.body")}
      />
    );
  }

  return (
    <>
      <p className={styles.queueCount} role="status">
        {t("admin:housingListings.count", { count: total })}
      </p>
      <ul className={styles.queue}>
        {listings.map((listing) => (
          <AdminHousingListingRow
            key={listing.ref}
            listing={listing}
            isFocused={focusedRef === listing.ref}
            isPending={decide.isPending}
            onFocus={() => setFocusedRef(listing.ref)}
            onDecide={(action) => handleDecide(listing, action)}
          />
        ))}
      </ul>

      {hasNextPage && (
        <div className={styles.loadMore}>
          <Button
            variant="ghost"
            size="md"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage
              ? t("admin:housingListings.loadingMore")
              : t("admin:housingListings.loadMore")}
          </Button>
        </div>
      )}

      {pending && (
        <HousingDecisionReasonModal
          action={pending.action}
          listingTitle={pending.listing.title}
          isPending={decide.isPending}
          onSubmit={(reason) =>
            runDecision(pending.listing, pending.action, reason)
          }
          onClose={() => setPending(null)}
        />
      )}
    </>
  );
}
