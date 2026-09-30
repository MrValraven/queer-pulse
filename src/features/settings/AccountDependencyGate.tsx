import { useRef, useState, type RefObject } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDirectoryListingsActions } from "../../app/providers/useDirectoryListingsActions";
import { useRoster } from "../communities/api/useRoster";
import { TransferOwnershipModal } from "../communities/TransferOwnershipModal";
import { ListingDeleteFlow } from "../marketing/listBusiness/delete/ListingDeleteFlow";
import {
  useAccountDependenciesCheck,
  type AccountDependencyCommunity,
  type AccountDependencyListing,
} from "../members/api/useAccountDependencies";
import styles from "../members/AccountData.module.css";

/**
 * One owned community blocking erasure. Its only out is a real ownership
 * transfer (`POST /communities/:slug/transfer`, the same
 * `TransferOwnershipModal` the community danger zone uses): a community
 * requires an owner and there is no anonymous-owner state, so this is a real
 * precondition rather than informational copy. The roster only loads once the
 * modal is actually opened (`useRoster` is disabled until `slug` is set).
 *
 * `onTransferClosed` re-reads the dependency check when the modal closes: the
 * transfer invalidates the communities caches only, and the row should leave
 * once the server agrees it is gone.
 */
function CommunityDependencyRow({
  community,
  onTransferClosed,
}: {
  community: AccountDependencyCommunity;
  onTransferClosed: () => void;
}) {
  const { t } = useTranslation();
  const [isTransferOpen, setTransferOpen] = useState(false);
  const { roster } = useRoster(isTransferOpen ? community.slug : undefined);

  return (
    <>
      <li className={styles.dependencyRow}>
        <span>{community.name}</span>
        <Button variant="ghost" size="sm" onClick={() => setTransferOpen(true)}>
          {t("members:profile.accountData.stepAway.dependency.transferCta")}
        </Button>
      </li>
      {isTransferOpen && (
        <TransferOwnershipModal
          slug={community.slug}
          name={community.name}
          roster={roster}
          onClose={() => {
            setTransferOpen(false);
            onTransferClosed();
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
 * One live listing blocking erasure. A listing has NO ownership-transfer
 * capability on the backend, so its remedy is a permanent delete
 * (`DELETE /listings/:ref`) through the shared `ListingDeleteFlow`, the same
 * multi-step confirmation every other listing delete goes through, backed by
 * the awaited `deleteListing`.
 *
 * The flow's gentler exits (hide it, mark it closed) are left out on purpose:
 * `useAccountDependencies` counts every listing whose status is live, so
 * neither of them would unblock erasure.
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
 * The gate for a member whose account is not active. Every remedy (transfer,
 * the roster read its picker needs, listing delete) sits behind the
 * active-member guard, so the rows carry no buttons. The intro says what
 * erasure itself does with each kind of row, and erasure stays available.
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
 * Everything that would be stranded by erasing this account, each row with its
 * own real remedy.
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
 * blockers remain. When that listing was the last one, the gate renders
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
      <p className={styles.dependencyIntro}>
        {t("members:profile.accountData.stepAway.erase.blockedByDependencies")}
      </p>
      {communities.length > 0 && (
        <ul className={styles.dependencyList}>
          {communities.map((community) => (
            <CommunityDependencyRow
              key={community.slug}
              community={community}
              onTransferClosed={refresh}
            />
          ))}
        </ul>
      )}
      {listings.length > 0 && (
        <ul className={styles.dependencyList}>
          {listings.map((listing) => (
            <ListingDependencyRow
              key={listing.ref}
              listing={listing}
              onDeleted={focusStableTargetAfterDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
