import { useRef, useState, type RefObject } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDirectoryListingsActions } from "../../app/providers/useDirectoryListingsActions";
import { useRoster } from "../communities/api/useRoster";
import { OfferOwnershipModal } from "../communities/OfferOwnershipModal";
import {
  useCancelCommunityOwnershipOffer,
  useCommunityOwnershipOffer,
} from "../communities/api/useCommunityOwnershipOffers";
import {
  communityErrorText,
  OWNERSHIP_OFFER_OWNER_SIDE_KEYS,
} from "../communities/communityErrors";
import { memberRefDisplayName } from "../../shared/api/refs";
import { useFormat } from "../../shared/i18n/format";
import { ListingDeleteFlow } from "../marketing/listBusiness/delete/ListingDeleteFlow";
import {
  useAccountDependenciesCheck,
  type AccountDependencyCommunity,
  type AccountDependencyListing,
} from "../members/api/useAccountDependencies";
import styles from "../members/AccountData.module.css";

/**
 * One community the member owns, shown by the settings gate and the profile's
 * step-away panel. It never blocks erasure: an offer needs someone else to
 * accept it, and the backend already hands an erased owner's community on
 * (`CommunityOwnerOrphanService`, worded for the member in the
 * `dependency.communitiesPassOn` intro). The row offers the member the chance
 * to choose who takes it on first (PRD-514): with no open offer it opens the
 * same `OfferOwnershipModal` the community danger zone uses
 * (`POST /communities/:slug/ownership-offer`). With an offer already open it
 * says who it went to and when it lapses, and offers to cancel it, since a
 * community holds one open offer at a time. The roster only loads once the
 * modal is actually opened (`useRoster` is disabled until `slug` is set).
 *
 * `onOfferClosed`, when given, re-reads the dependency check after the modal
 * closes, so the row leaves as soon as the server agrees the community has
 * changed hands.
 */
export function CommunityDependencyRow({
  community,
  onOfferClosed,
}: {
  community: AccountDependencyCommunity;
  onOfferClosed?: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { showToast } = useToast();
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const rosterRead = useRoster(isOfferModalOpen ? community.slug : undefined);
  const { offer, isLoading } = useCommunityOwnershipOffer(community.slug);
  const cancelOffer = useCancelCommunityOwnershipOffer(community.slug);
  const openOffer = offer?.status === "offered" ? offer : null;

  const cancel = () => {
    if (cancelOffer.isPending) return;
    cancelOffer.mutate(undefined, {
      onSuccess: () =>
        showToast(t("communities:ownershipOffer.cancelled"), "success"),
      onError: (error) =>
        showToast(
          communityErrorText(t, error, OWNERSHIP_OFFER_OWNER_SIDE_KEYS),
          "error",
        ),
    });
  };

  return (
    <>
      <li className={styles.dependencyRow}>
        <div>
          <span>{community.name}</span>
          {openOffer && (
            <p className={styles.hint} role="status">
              {t("communities:ownershipOffer.pending", {
                name:
                  memberRefDisplayName(openOffer.offeree, t) ||
                  t("communities:common.someMember"),
                date: fmt.date(new Date(openOffer.expiresAt)),
              })}
            </p>
          )}
        </div>
        {openOffer ? (
          <Button
            key="cancel"
            variant="ghost"
            size="sm"
            onClick={cancel}
            disabled={cancelOffer.isPending}
          >
            {t("communities:ownershipOffer.cancel")}
          </Button>
        ) : (
          <Button
            key="send"
            variant="ghost"
            size="sm"
            onClick={() => setIsOfferModalOpen(true)}
            disabled={isLoading}
          >
            {t("communities:ownershipOffer.offerCta")}
          </Button>
        )}
      </li>
      {isOfferModalOpen && (
        <OfferOwnershipModal
          slug={community.slug}
          roster={rosterRead.roster}
          isRosterLoading={rosterRead.isLoading}
          isRosterError={rosterRead.isError}
          onRosterRetry={rosterRead.refetch}
          onClose={() => {
            setIsOfferModalOpen(false);
            onOfferClosed?.();
          }}
        />
      )}
    </>
  );
}

/**
 * After a listing row's successful delete, moves focus onto whatever
 * `resolveTarget` returns. The row unmounts together with the Delete button
 * the flow would restore focus to, which leaves focus on the body. Waits two
 * frames so React has committed the row removal and the dialog's own focus
 * restore has run first, and does nothing unless focus has genuinely dropped
 * to the body. Same guard as `focusListingQueueHeadingAfterRemove` in the
 * admin listings queue. `preventScroll` keeps the viewport where it was.
 */
function focusAfterListingRowRemoved(resolveTarget: () => HTMLElement | null) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const activeElement = document.activeElement;
      if (activeElement && activeElement !== document.body) return;
      resolveTarget()?.focus({ preventScroll: true });
    });
  });
}

/**
 * One live listing an active member owns. Erasure keeps it live without an
 * owner (see `listingsStayLive`), so the row never blocks anything. The
 * optional "Delete listing" button opens a permanent delete
 * (`DELETE /listings/:ref`) through the shared `ListingDeleteFlow`, the same
 * multi-step confirmation every other listing delete goes through, backed by
 * the awaited `deleteListing`.
 *
 * The flow's gentler exits (hide it, mark it closed) are left out on purpose:
 * the listing stays live whichever of them is picked, so they change nothing
 * about what erasure does with it.
 *
 * `onDeleted` runs after a confirmed delete, once the toast is up. The row
 * disappears as soon as the listings overlay drops the ref, so the caller
 * owns where focus lands next.
 */
export function ListingDependencyRow({
  listing,
  onDeleted,
}: {
  listing: AccountDependencyListing;
  onDeleted?: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { deleteListing } = useDirectoryListingsActions();
  const [isDeleteFlowOpen, setIsDeleteFlowOpen] = useState(false);

  return (
    <>
      <li className={styles.dependencyRow}>
        <span>{listing.name}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDeleteFlowOpen(true)}
        >
          {t("members:profile.accountData.stepAway.dependency.deleteCta")}
        </Button>
      </li>
      {isDeleteFlowOpen && (
        <ListingDeleteFlow
          listingName={listing.name}
          variant="owner"
          // A rejection propagates so the flow stays open on its last step
          // with the inline error.
          onConfirmDelete={async () => {
            await deleteListing(listing.ref);
            showToast(
              t("members:places.deletedNamed", { name: listing.name }),
              "success",
            );
            setIsDeleteFlowOpen(false);
            onDeleted?.();
          }}
          onClose={() => setIsDeleteFlowOpen(false)}
        />
      )}
    </>
  );
}

/**
 * The gate for a member whose account is not active. Every remedy (an
 * ownership offer, the roster read its picker needs, listing delete) sits
 * behind the active-member guard, so the rows carry no buttons. The intro says
 * what erasure itself does with each kind of row, and erasure stays available.
 */
function InformationalDependencyList({
  communities,
  listings,
}: {
  communities: AccountDependencyCommunity[];
  listings: AccountDependencyListing[];
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.block}>
      <p className={styles.dependencyIntro}>
        {t(
          "members:profile.accountData.stepAway.dependency.informationalIntro",
        )}
      </p>
      <ul className={styles.dependencyList}>
        {communities.map((community) => (
          <li key={community.slug} className={styles.dependencyRow}>
            <span>{community.name}</span>
          </li>
        ))}
        {listings.map((listing) => (
          <li key={listing.ref} className={styles.dependencyRow}>
            <span>{listing.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * What erasing this account hands on or leaves behind, each row with its own
 * optional step. Nothing here blocks erasure: owned communities pass on as
 * the `dependency.communitiesPassOn` intro describes, and listings stay live.
 *
 * This gate used to live only on the profile's "Your data" side sheet, which
 * was one of three surfaces offering erasure. Now that `/account/delete` is the
 * single surface for stepping away, the gate travels with it: otherwise the one
 * remaining way to ask for erasure would be the one that never checked.
 *
 * The copy stays in the `members:` namespace it was written in, so the strings
 * a member may already have read do not change under them.
 *
 * After a listing delete, focus goes to this gate's container while other
 * rows remain. When that listing was the last one, the gate renders
 * nothing, so focus goes to `fallbackFocusRef` (the page title).
 *
 * When the live check itself failed, both lists arrive empty and mean
 * "unknown". The gate then says the check could not load and leaves erasure
 * available: the backend hands on or releases whatever the member owns.
 *
 * A member who cannot act (`isInformational`) sees the same rows without
 * remedies; see `InformationalDependencyList`.
 */
export function AccountDependencyGate({
  communities,
  listings,
  fallbackFocusRef,
}: {
  communities: AccountDependencyCommunity[];
  listings: AccountDependencyListing[];
  /** A stable, focusable element outside the gate (tabIndex -1), used once
   *  the gate itself has unmounted. */
  fallbackFocusRef?: RefObject<HTMLElement | null>;
}) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    isError: isCheckFailed,
    isInformational,
    refresh,
  } = useAccountDependenciesCheck();
  const focusStableTargetAfterDelete = () =>
    focusAfterListingRowRemoved(
      () => containerRef.current ?? fallbackFocusRef?.current ?? null,
    );

  if (communities.length === 0 && listings.length === 0) {
    // Erasure stays available either way: the backend hands on or releases
    // whatever the member owns.
    if (!isCheckFailed) return null;
    return (
      <div role="status" className={styles.block}>
        <p className={styles.dependencyIntro}>
          {t("members:profile.accountData.stepAway.dependency.checkFailed")}
        </p>
      </div>
    );
  }
  if (isInformational) {
    return (
      <InformationalDependencyList
        communities={communities}
        listings={listings}
      />
    );
  }
  return (
    <div ref={containerRef} tabIndex={-1} className={styles.block}>
      {communities.length > 0 && (
        <>
          <p className={styles.dependencyIntro}>
            {t(
              "members:profile.accountData.stepAway.dependency.communitiesPassOn",
            )}
          </p>
          <ul className={styles.dependencyList}>
            {communities.map((community) => (
              <CommunityDependencyRow
                key={community.slug}
                community={community}
                onOfferClosed={refresh}
              />
            ))}
          </ul>
        </>
      )}
      {listings.length > 0 && (
        <>
          <p className={styles.dependencyIntro}>
            {t(
              "members:profile.accountData.stepAway.dependency.listingsStayLive",
            )}
          </p>
          <ul className={styles.dependencyList}>
            {listings.map((listing) => (
              <ListingDependencyRow
                key={listing.ref}
                listing={listing}
                onDeleted={focusStableTargetAfterDelete}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
