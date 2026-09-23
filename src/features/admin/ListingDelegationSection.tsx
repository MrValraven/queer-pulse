import { LoadErrorState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAdminListingDelegation } from "./api/useAdminListingDelegation";
import { ListingCoManagerRoster } from "./ListingCoManagerRoster";
import { ListingOwnerOfferBlock } from "./ListingOwnerOfferBlock";
import styles from "./ListingDelegationSection.module.css";

/**
 * ADMIN ONLY. Who is going to run this listing's page, and the controls to
 * change it: the current owner, any open ownership offer, and the co-manager
 * roster.
 *
 * All six routes behind this panel carry `@StaffRoles()` + `@Roles(Admin)`,
 * so a `directory_moderator` grant holder would be refused by every one of
 * them. `ListingPreviewDrawer` renders this only for an admin, which is what
 * keeps the console from showing a control that will bounce.
 *
 * `ownerSlug` comes from the listing's `submittedBy`, which the backend maps
 * from `listing.owner_id`, so it is genuinely the owner. A `null` owner means
 * the house wrote the listing and still holds it, which is the state the
 * ownership offer exists for.
 *
 * The prop is spelled `listingRef`. A prop named `ref` trips the
 * `react-hooks/refs` compiler lint even holding a plain string, as
 * `ListingHistoryPanel` records.
 */
export function ListingDelegationSection({
  listingRef,
  ownerSlug,
}: {
  listingRef: string;
  ownerSlug: string | null;
}) {
  const { t } = useTranslation();
  const { delegation, isLoading, isError, refetch } =
    useAdminListingDelegation(listingRef);

  return (
    <section className={styles.section}>
      <h4 className={styles.heading}>{t("admin:listingDelegation.heading")}</h4>
      <p className={styles.intro}>{t("admin:listingDelegation.intro")}</p>

      <div className={styles.block}>
        <h5 className={styles.blockHeading}>
          {t("admin:listingDelegation.owner.heading")}
        </h5>
        {ownerSlug ? (
          <p className={styles.line}>
            {t("admin:listingDelegation.owner.ownedBy", { slug: ownerSlug })}
          </p>
        ) : (
          <>
            <p className={styles.line}>
              {t("admin:listingDelegation.owner.none")}
            </p>
            {/* Say only what the panel can know. An erased owner leaves
                `owner_id` null on a listing nobody at the house wrote, and
                `createdByStaffId` is deliberately in no DTO, so the two cases
                are indistinguishable from here. */}
            <p className={styles.meta}>
              {t("admin:listingDelegation.owner.noneDetail")}
            </p>
          </>
        )}
      </div>

      {/* An outage must not read as "nobody is seated here": the roster is the
          part of this panel that can be wrong in a way somebody acts on. */}
      {isLoading ? (
        <div className={`${styles.block} ${styles.skeleton}`}>
          <SkeletonLine width="70%" height={14} />
          <SkeletonLine width="45%" height={12} />
          <SkeletonLine width="60%" height={14} />
        </div>
      ) : isError ? (
        <div className={styles.block}>
          <LoadErrorState
            onRetry={refetch}
            title={t("admin:listingDelegation.loadError.title")}
            description={t("admin:listingDelegation.loadError.body")}
          />
        </div>
      ) : (
        <>
          <ListingOwnerOfferBlock
            listingRef={listingRef}
            ownerSlug={ownerSlug}
            openOffer={delegation.openOffer}
          />
          <ListingCoManagerRoster
            listingRef={listingRef}
            coManagers={delegation.coManagers}
            isListingUnowned={ownerSlug === null}
          />
        </>
      )}
    </section>
  );
}
