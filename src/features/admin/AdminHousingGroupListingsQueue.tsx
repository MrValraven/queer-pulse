import { useState } from "react";
import { FiHome } from "react-icons/fi";
import { Button, EmptyState, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ApiError } from "../../shared/api/client";
import type {
  AdminGroupListingQueueDTO,
  GroupListingQueueFilter,
  GroupListingStatus,
} from "./api/adminHousingGroupListings.api";
import {
  useDecideGroupListing,
  useGroupListingQueue,
} from "./api/useAdminHousingGroupListings";
import { GroupListingReasonModal } from "./AdminHousingGroupListingsDecision";
import { DECISION_META } from "./adminHousingGroupListingsStatus";
import { AdminHousingGroupListingRow } from "./AdminHousingGroupListingsRow";
import { useAdminGroupListingKeys } from "./AdminHousingGroupListingsKeys";
import styles from "./AdminHousingGroupListingsPage.module.css";

/** A decision waiting on the reason its outcome requires. */
interface PendingDecision {
  listing: AdminGroupListingQueueDTO;
  status: GroupListingStatus;
}

function QueueSkeleton() {
  return (
    <div className={styles.skeletons} aria-hidden>
      {[0, 1, 2].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={280}
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
 * poster is shown that sentence verbatim and telling somebody their room will
 * never go up without one is the thing this console exists to stop. Publishing
 * is a single click.
 */
export function AdminHousingGroupListingsQueue({
  filter,
  groupSlug,
}: {
  filter: GroupListingQueueFilter;
  groupSlug: string;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingDecision | null>(null);
  const decide = useDecideGroupListing();
  const {
    listings,
    total,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGroupListingQueue(filter, groupSlug);

  function runDecision(
    listing: AdminGroupListingQueueDTO,
    status: GroupListingStatus,
    reason?: string,
  ) {
    decide.mutate(
      { listing, status, reason },
      {
        onSuccess: () => {
          setPending(null);
          showToast(
            t(`admin:groupListingQueue.toast.${status}`, {
              title: listing.title,
            }),
            status === "live" ? "success" : "info",
          );
        },
        onError: () =>
          showToast(t("admin:groupListingQueue.toast.error"), "error"),
      },
    );
  }

  function handleDecide(
    listing: AdminGroupListingQueueDTO,
    status: GroupListingStatus,
  ) {
    if (DECISION_META[status].isReasonRequired) {
      setPending({ listing, status });
      return;
    }
    runDecision(listing, status);
  }

  useAdminGroupListingKeys({
    listings,
    focusedId,
    setFocusedId,
    onDecide: handleDecide,
  });

  if (isLoading) return <QueueSkeleton />;

  if (isError) {
    const isForbidden = error instanceof ApiError && error.status === 403;
    return (
      <EmptyState
        icon={<FiHome />}
        title={t(
          isForbidden
            ? "admin:groupListingQueue.forbidden.title"
            : "admin:groupListingQueue.error.title",
        )}
        description={t(
          isForbidden
            ? "admin:groupListingQueue.forbidden.body"
            : "admin:groupListingQueue.error.body",
        )}
        action={
          isForbidden
            ? undefined
            : {
                label: t("admin:groupListingQueue.error.retry"),
                onClick: () => void refetch(),
              }
        }
      />
    );
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={<FiHome />}
        title={t("admin:groupListingQueue.empty.title")}
        description={t("admin:groupListingQueue.empty.body")}
      />
    );
  }

  return (
    <>
      <p className={styles.queueCount} role="status">
        {t("admin:groupListingQueue.count", { count: total })}
      </p>
      <ul className={styles.queue}>
        {listings.map((listing) => (
          <AdminHousingGroupListingRow
            key={listing.id}
            listing={listing}
            isFocused={focusedId === listing.id}
            isPending={decide.isPending}
            onFocus={() => setFocusedId(listing.id)}
            onDecide={(status) => handleDecide(listing, status)}
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
              ? t("admin:groupListingQueue.loadingMore")
              : t("admin:groupListingQueue.loadMore")}
          </Button>
        </div>
      )}

      {pending && (
        <GroupListingReasonModal
          status={pending.status}
          listingTitle={pending.listing.title}
          isPending={decide.isPending}
          onSubmit={(reason) =>
            runDecision(pending.listing, pending.status, reason)
          }
          onClose={() => setPending(null)}
        />
      )}
    </>
  );
}
