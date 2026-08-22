import { FiAlertCircle, FiInbox, FiLock, FiRepeat } from "react-icons/fi";
import { Link } from "react-router-dom";
import { EmptyState, SkeletonLine } from "../../shared/components/ui";
import { ApiError } from "../../shared/api/client";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { listingLabel, type MyBarterListingRow } from "./barterProposals.data";
import styles from "./BarterProposalsPage.module.css";

/** Title block: what this page is, and how many proposals are still waiting on
 *  you across everything you posted. */
export function BarterProposalsHeader({
  waitingCount,
  listingCount,
}: {
  waitingCount: number;
  listingCount: number;
}) {
  const { t } = useTranslation();
  return (
    <header className={styles.head}>
      <div className={styles.eyebrow}>
        {t("economy:barterProposals.eyebrow")}
      </div>
      <h1 className={styles.title}>{t("economy:barterProposals.title")}</h1>
      <p className={styles.sub}>
        {t("economy:barterProposals.countListings", { count: listingCount })}{" "}
        {waitingCount > 0
          ? t("economy:barterProposals.countWaiting", { count: waitingCount })
          : t("economy:barterProposals.countWaitingNone")}
      </p>
      <Link className={styles.backLink} to={routes.barter}>
        {t("economy:barterProposals.backToBoard")}
      </Link>
    </header>
  );
}

/**
 * Your swaps as a toggle group: exactly one is being read at a time, and the
 * badge on each says how many proposals there are still waiting on your answer.
 * Same `role="group"` + `aria-pressed` shape the housing board's view toggle
 * uses, so the pressed state is announced without a roving tabindex.
 */
export function BarterListingPicker({
  listings,
  selectedId,
  onSelect,
}: {
  listings: MyBarterListingRow[];
  selectedId: string;
  onSelect: (listingId: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={styles.picker}
      role="group"
      aria-label={t("economy:barterProposals.pickerLegend")}
    >
      {listings.map((listing) => {
        const isSelected = listing.id === selectedId;
        return (
          <button
            type="button"
            key={listing.id}
            aria-pressed={isSelected}
            className={[
              styles.pickerOption,
              isSelected && styles.pickerOptionOn,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onSelect(listing.id)}
          >
            {listingLabel(listing)}
            {listing.pendingProposalCount > 0 && (
              <span
                className={styles.pickerCount}
                aria-label={t("economy:barterProposals.pendingBadgeLabel", {
                  count: listing.pendingProposalCount,
                })}
              >
                {listing.pendingProposalCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function BarterProposalsSkeleton() {
  return (
    <div className={styles.list} aria-busy="true">
      {Array.from({ length: 3 }).map((_, skeletonIndex) => (
        <div key={skeletonIndex} className={styles.card} aria-hidden>
          <SkeletonLine width={160} height={20} />
          <SkeletonLine width="70%" height={14} style={{ marginTop: 12 }} />
          <SkeletonLine width="45%" height={14} style={{ marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

/** No proposals on the selected swap yet. */
export function BarterProposalsEmpty() {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiInbox />}
      title={t("economy:barterProposals.empty.title")}
      description={t("economy:barterProposals.empty.description")}
    />
  );
}

/** You have not posted a swap yet, so there is nothing for anyone to propose
 *  against. Sends you to the board to post one. */
export function BarterProposalsNoListings() {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={<FiRepeat />}
      title={t("economy:barterProposals.noListings.title")}
      description={t("economy:barterProposals.noListings.description")}
      action={{
        label: t("economy:barterProposals.noListings.cta"),
        to: routes.barter,
      }}
    />
  );
}

/**
 * The honest failure states. A 403 means the reader did not post this swap, a
 * 404 means the swap is gone, and anything else is a retryable fault. They read
 * differently because they mean different things, and answering "something went
 * wrong" when the real answer is "this is not your post" sends someone round the
 * same loop again.
 */
export function BarterProposalsError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const { t } = useTranslation();
  const status = error instanceof ApiError ? error.status : null;

  if (status === 403) {
    return (
      <EmptyState
        icon={<FiLock />}
        title={t("economy:barterProposals.forbidden.title")}
        description={t("economy:barterProposals.forbidden.description")}
        action={{
          label: t("economy:barterProposals.backToBoard"),
          to: routes.barter,
        }}
      />
    );
  }

  if (status === 404) {
    return (
      <EmptyState
        icon={<FiAlertCircle />}
        title={t("economy:barterProposals.missing.title")}
        description={t("economy:barterProposals.missing.description")}
        action={{
          label: t("economy:barterProposals.backToBoard"),
          to: routes.barter,
        }}
      />
    );
  }

  return (
    <EmptyState
      icon={<FiAlertCircle />}
      title={t("economy:barterProposals.error.title")}
      description={t("economy:barterProposals.error.description")}
      action={{
        label: t("economy:barterProposals.error.retry"),
        onClick: onRetry,
      }}
    />
  );
}
