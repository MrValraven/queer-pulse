import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { ConfirmDialog } from "../../shared/components/ui";
import { ApiError } from "../../shared/api/client";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import type { BarterProposalDecision } from "./api/barter.api";
import {
  useBarterProposals,
  useDecideBarterProposal,
  useMyBarterListings,
} from "./api/useBarter";
import { BarterProposalCard } from "./BarterProposalCard";
import {
  BarterListingPicker,
  BarterProposalsEmpty,
  BarterProposalsError,
  BarterProposalsHeader,
  BarterProposalsNoListings,
  BarterProposalsSkeleton,
} from "./BarterProposalsSections";
import styles from "./BarterProposalsPage.module.css";

interface PendingDecision {
  proposalId: string;
  status: BarterProposalDecision;
}

/**
 * Turns the API's refusal into the sentence that explains it. Every branch is a
 * real server answer: 403 when you did not post this swap, 404 when the swap or
 * the proposal is gone, 409 when it was already decided (including by you in
 * another tab).
 */
function refusalMessage(error: unknown, t: TFunction): string {
  if (!(error instanceof ApiError)) {
    return t("economy:barterProposals.decide.errorFailed");
  }
  if (error.status === 403) {
    return t("economy:barterProposals.decide.errorNotOwner");
  }
  if (error.status === 404) {
    return t("economy:barterProposals.decide.errorGone");
  }
  if (error.status === 409) {
    return t("economy:barterProposals.decide.errorAlreadyDecided");
  }
  return t("economy:barterProposals.decide.errorFailed");
}

/**
 * The owner's side of the skill exchange: the swaps you posted, and the
 * proposals members have sent against them. `GET /barter/:id/proposals` and its
 * PATCH shipped with no UI at all, so a proposal arriving in someone's inbox
 * could not be answered anywhere in the app.
 *
 * Accept and decline are both final, so both go through `ConfirmDialog`, and
 * the row only moves once the mutation resolves. A refusal (403 not yours, 404
 * gone, 409 already decided) is written onto the row it belongs to rather than
 * a toast that leaves the list looking as though the decision took.
 */
export function BarterProposalsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const listingsQuery = useMyBarterListings();
  const listings = listingsQuery.data ?? [];

  // A notification deep-links with `?listing=`, so that wins when present —
  // even when it names a swap no longer in this list, because the proposals
  // query's own 403/404 explains why far better than silently showing another
  // swap's proposals would.
  const requestedId = searchParams.get("listing");
  const defaultId =
    listings.find((listing) => listing.pendingProposalCount > 0)?.id ??
    listings[0]?.id;
  const selectedId = requestedId ?? defaultId;

  const proposalsQuery = useBarterProposals(selectedId);
  const decideProposal = useDecideBarterProposal(selectedId);
  const [pending, setPending] = useState<PendingDecision | null>(null);
  const [busyProposalId, setBusyProposalId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{
    proposalId: string;
    message: string;
  } | null>(null);

  const proposals = proposalsQuery.data ?? [];
  const waitingCount = listings.reduce(
    (total, listing) => total + listing.pendingProposalCount,
    0,
  );

  function selectListing(listingId: string) {
    setRowError(null);
    setSearchParams({ listing: listingId }, { replace: true });
  }

  function runDecision(decision: PendingDecision) {
    setRowError(null);
    setBusyProposalId(decision.proposalId);
    decideProposal.mutate(decision, {
      // Confirmation of the decision comes from here and nowhere else: the
      // dialog closes once the server has actually stored the answer.
      onSuccess: () => setPending(null),
      onError: (error) => {
        setPending(null);
        setRowError({
          proposalId: decision.proposalId,
          message: refusalMessage(error, t),
        });
      },
      onSettled: () => setBusyProposalId(null),
    });
  }

  const isAccepting = pending?.status === "accepted";

  return (
    <PageShell>
      <div className={styles.page}>
        <BarterProposalsHeader
          waitingCount={waitingCount}
          listingCount={listings.length}
        />

        {listingsQuery.isLoading ? (
          <BarterProposalsSkeleton />
        ) : listingsQuery.isError ? (
          <BarterProposalsError
            error={listingsQuery.error}
            onRetry={() => void listingsQuery.refetch()}
          />
        ) : listings.length === 0 ? (
          <BarterProposalsNoListings />
        ) : (
          <>
            <BarterListingPicker
              listings={listings}
              selectedId={selectedId ?? ""}
              onSelect={selectListing}
            />

            {proposalsQuery.isLoading ? (
              <BarterProposalsSkeleton />
            ) : proposalsQuery.isError ? (
              <BarterProposalsError
                error={proposalsQuery.error}
                onRetry={() => void proposalsQuery.refetch()}
              />
            ) : proposals.length === 0 ? (
              <BarterProposalsEmpty />
            ) : (
              <div className={styles.list}>
                {proposals.map((proposal) => (
                  <BarterProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    isBusy={busyProposalId === proposal.id}
                    error={
                      rowError?.proposalId === proposal.id
                        ? rowError.message
                        : null
                    }
                    onDecide={(status) =>
                      setPending({ proposalId: proposal.id, status })
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (pending) runDecision(pending);
        }}
        title={t(
          isAccepting
            ? "economy:barterProposals.confirmAccept.title"
            : "economy:barterProposals.confirmDecline.title",
        )}
        description={t(
          isAccepting
            ? "economy:barterProposals.confirmAccept.body"
            : "economy:barterProposals.confirmDecline.body",
        )}
        tone={isAccepting ? "default" : "destructive"}
        loading={decideProposal.isPending}
        confirmLabel={t(
          isAccepting
            ? "economy:barterProposals.confirmAccept.cta"
            : "economy:barterProposals.confirmDecline.cta",
        )}
      />
    </PageShell>
  );
}
