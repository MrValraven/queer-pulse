import { useState } from "react";
import { PageShell } from "../../shared/components/layout";
import { ConfirmDialog, LoadErrorState } from "../../shared/components/ui";
import { ApiError } from "../../shared/api/client";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import {
  useCloseBarterListing,
  useMyBarterListings,
  useMySentBarterProposals,
} from "./api/useBarter";
import {
  MyBarterHeader,
  MyBarterListingCard,
  MyBarterListingsEmpty,
  MyBarterSkeleton,
  MySentProposalCard,
  MySentProposalsEmpty,
} from "./MyBarterSections";
import styles from "./MyBarterPage.module.css";

/** Turns a close refusal into the sentence that explains it. */
function closeRefusalMessage(error: unknown, t: TFunction): string {
  if (error instanceof ApiError && error.status === 403) {
    return t("economy:myBarter.close.errorNotYours");
  }
  if (error instanceof ApiError && error.status === 404) {
    return t("economy:myBarter.close.errorGone");
  }
  return t("economy:myBarter.close.errorFailed");
}

/**
 * PRD-42/43: the member's own half of the skill exchange, in two parts. The
 * swaps they posted, with the close and edit paths barter alone never had, and
 * the proposals they SENT, which had no surface anywhere: a proposal left for
 * the poster's inbox and the person who made it could not see it again.
 *
 * The two halves load independently and fail independently. A failed fetch is
 * never rendered as "you have no listings" or "no proposals". That shape tells
 * a member their work is gone when the truth is that the request did not
 * arrive, so each half gets `LoadErrorState` with its own retry.
 *
 * Closing is one-way for practical purposes (there is no reopen), so it goes
 * through `ConfirmDialog`, which is built on the shared `Modal` and therefore
 * portals to `document.body`. A fixed scrim inside a transformed ancestor
 * would otherwise be trapped by it.
 */
export function MyBarterPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const listingsQuery = useMyBarterListings();
  const sentQuery = useMySentBarterProposals();
  const closeListing = useCloseBarterListing();

  const [closingId, setClosingId] = useState<string | null>(null);
  const [busyListingId, setBusyListingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{
    listingId: string;
    message: string;
  } | null>(null);

  const listings = listingsQuery.data ?? [];
  const sentProposals = sentQuery.data ?? [];

  const confirmClose = () => {
    if (!closingId) return;
    const listingId = closingId;
    setRowError(null);
    setBusyListingId(listingId);
    closeListing.mutate(listingId, {
      // The row only moves once the server has actually stored the close.
      onSuccess: () => {
        showToast(t("economy:myBarter.close.done"), "success");
        setClosingId(null);
      },
      onError: (error) => {
        setClosingId(null);
        setRowError({
          listingId,
          message: closeRefusalMessage(error, t),
        });
      },
      onSettled: () => setBusyListingId(null),
    });
  };

  return (
    <PageShell>
      <div className={styles.page}>
        <MyBarterHeader />

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {t("economy:myBarter.posted.heading")}
          </h2>
          {listingsQuery.isLoading ? (
            <MyBarterSkeleton />
          ) : listingsQuery.isError ? (
            <LoadErrorState
              compact
              onRetry={() => void listingsQuery.refetch()}
              title={t("economy:myBarter.posted.error.title")}
              description={t("economy:myBarter.posted.error.body")}
            />
          ) : listings.length === 0 ? (
            <MyBarterListingsEmpty />
          ) : (
            <div className={styles.list}>
              {listings.map((listing) => (
                <MyBarterListingCard
                  key={listing.id}
                  listing={listing}
                  isBusy={busyListingId === listing.id}
                  error={
                    rowError?.listingId === listing.id ? rowError.message : null
                  }
                  onClose={() => {
                    setRowError(null);
                    setClosingId(listing.id);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {t("economy:myBarter.sent.heading")}
          </h2>
          {sentQuery.isLoading ? (
            <MyBarterSkeleton />
          ) : sentQuery.isError ? (
            <LoadErrorState
              compact
              onRetry={() => void sentQuery.refetch()}
              title={t("economy:myBarter.sent.error.title")}
              description={t("economy:myBarter.sent.error.body")}
            />
          ) : sentProposals.length === 0 ? (
            <MySentProposalsEmpty />
          ) : (
            <div className={styles.list}>
              {sentProposals.map((proposal) => (
                <MySentProposalCard key={proposal.id} proposal={proposal} />
              ))}
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={closingId !== null}
        onClose={() => setClosingId(null)}
        onConfirm={confirmClose}
        title={t("economy:myBarter.close.confirmTitle")}
        description={t("economy:myBarter.close.confirmBody")}
        tone="destructive"
        loading={closeListing.isPending}
        confirmLabel={t("economy:myBarter.close.confirmCta")}
      />
    </PageShell>
  );
}
