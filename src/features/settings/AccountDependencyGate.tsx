import { useState } from "react";
import { Button, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDirectoryListingsActions } from "../../app/providers/useDirectoryListingsActions";
import { useRoster } from "../communities/api/useRoster";
import { TransferOwnershipModal } from "../communities/TransferOwnershipModal";
import type {
  AccountDependencyCommunity,
  AccountDependencyListing,
} from "../members/api/useAccountDependencies";
import styles from "../members/AccountData.module.css";

/**
 * One owned community blocking erasure. Its only out is a real ownership
 * transfer (`POST /communities/:slug/transfer`, the same
 * `TransferOwnershipModal` the community danger zone uses): a community
 * requires an owner and there is no anonymous-owner state, so this is a real
 * precondition rather than informational copy. The roster only loads once the
 * modal is actually opened (`useRoster` is disabled until `slug` is set).
 */
function CommunityDependencyRow({
  community,
}: {
  community: AccountDependencyCommunity;
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
          onClose={() => setTransferOpen(false)}
        />
      )}
    </>
  );
}

/**
 * One live listing blocking erasure. Unlike a community, a listing has NO
 * ownership-transfer capability on the backend (`ListingsController` exposes
 * create/update/withdraw only), so the available action is "Close listing"
 * (`DELETE /listings/:ref`, the same `withdrawListing` mutator the owner view
 * of `PlacesSection` uses).
 */
function ListingDependencyRow({
  listing,
}: {
  listing: AccountDependencyListing;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { withdrawListing } = useDirectoryListingsActions();
  const [isConfirming, setConfirming] = useState(false);

  return (
    <>
      <li className={styles.dependencyRow}>
        <span>{listing.name}</span>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
          {t("members:profile.accountData.stepAway.dependency.closeCta")}
        </Button>
      </li>
      <ConfirmDialog
        open={isConfirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          withdrawListing(listing.ref);
          setConfirming(false);
          showToast(
            t("members:profile.accountData.stepAway.dependency.closedToast"),
            "info",
          );
        }}
        title={t(
          "members:profile.accountData.stepAway.dependency.closeConfirm.title",
          { name: listing.name },
        )}
        description={t(
          "members:profile.accountData.stepAway.dependency.closeConfirm.body",
        )}
        tone="destructive"
      />
    </>
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
 */
export function AccountDependencyGate({
  communities,
  listings,
}: {
  communities: AccountDependencyCommunity[];
  listings: AccountDependencyListing[];
}) {
  const { t } = useTranslation();
  if (communities.length === 0 && listings.length === 0) return null;
  return (
    <div className={styles.block}>
      <p className={styles.dependencyIntro}>
        {t("members:profile.accountData.stepAway.erase.blockedByDependencies")}
      </p>
      {communities.length > 0 && (
        <ul className={styles.dependencyList}>
          {communities.map((community) => (
            <CommunityDependencyRow
              key={community.slug}
              community={community}
            />
          ))}
        </ul>
      )}
      {listings.length > 0 && (
        <ul className={styles.dependencyList}>
          {listings.map((listing) => (
            <ListingDependencyRow key={listing.ref} listing={listing} />
          ))}
        </ul>
      )}
    </div>
  );
}
