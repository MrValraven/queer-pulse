import { FiUsers } from "react-icons/fi";
import {
  EmptyState,
  LoadErrorState,
  SkeletonLine,
} from "../../../../shared/components/ui";
import { useToast } from "../../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type { ManagedListingDTO } from "../api/listings.api";
import {
  useListingCoManagers,
  useRemoveCoManager,
} from "../api/useListingCoManagers";
import { CO_MANAGER_LIVE_STATUSES } from "./coManagers.data";
import { CoManagerInvitePanel } from "./CoManagerInvitePanel";
import { CoManagerRosterRow } from "./CoManagerRosterRow";
import { CoManagerStepDown } from "./CoManagerStepDown";
import styles from "./CoManagers.module.css";

/**
 * "Who can edit" inside the listing editor.
 *
 * The owner sees the roster and can ask somebody else in or take a place back.
 * A co-manager sees the same roster read-only, so they know who else is
 * looking after the place, plus the one action that is theirs: stepping down.
 *
 * Pending invitations sit in the same list as active co-managers but wear
 * their own badge, because the difference matters: an invited person cannot
 * edit anything yet, and the owner should not be waiting on work that has not
 * been accepted.
 */
export function ListingCoManagersSection({
  listing,
}: {
  listing: ManagedListingDTO;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const isCoManagerView = listing.managementRole === "co_manager";
  const { coManagers, isLoading, isError, refetch } = useListingCoManagers(
    listing.ref,
  );
  const remove = useRemoveCoManager(listing.ref);

  // Ended places (declined, revoked, left) belong to the history of the
  // listing rather than to who can edit it today.
  const roster = coManagers.filter((coManager) =>
    CO_MANAGER_LIVE_STATUSES.includes(coManager.status),
  );

  const removeCoManager = (memberSlug: string) => {
    remove.mutate(memberSlug, {
      onSuccess: () =>
        showToast(t("marketing:listBusiness.coManagers.removedToast"), "info"),
      onError: () =>
        showToast(t("marketing:listBusiness.coManagers.removeError"), "error"),
    });
  };

  return (
    <>
      <p className={styles.intro}>
        {t(
          isCoManagerView
            ? "marketing:listBusiness.coManagers.introCoManager"
            : "marketing:listBusiness.coManagers.introOwner",
        )}
      </p>

      {isLoading ? (
        <SkeletonLine width="100%" height={56} style={{ marginTop: 18 }} />
      ) : isError ? (
        /* DES-22: a failed roster read must not tell an owner that nobody
           helps them run the place. */
        <LoadErrorState compact onRetry={refetch} />
      ) : roster.length === 0 ? (
        <EmptyState
          compact
          icon={<FiUsers />}
          title={t("marketing:listBusiness.coManagers.empty.title")}
          description={t(
            isCoManagerView
              ? "marketing:listBusiness.coManagers.empty.descriptionCoManager"
              : "marketing:listBusiness.coManagers.empty.descriptionOwner",
          )}
        />
      ) : (
        <ul className={styles.roster}>
          {roster.map((coManager) => (
            <CoManagerRosterRow
              key={coManager.id}
              coManager={coManager}
              canRemove={!isCoManagerView}
              isRemoving={remove.isPending}
              onRemove={removeCoManager}
            />
          ))}
        </ul>
      )}

      {isCoManagerView ? (
        <CoManagerStepDown
          listingRef={listing.ref}
          listingName={listing.name}
        />
      ) : (
        <CoManagerInvitePanel
          listingRef={listing.ref}
          coManagers={roster}
          ownerSlug={listing.submittedBy?.slug}
        />
      )}
    </>
  );
}
