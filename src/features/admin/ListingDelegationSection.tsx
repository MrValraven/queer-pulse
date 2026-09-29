import { Link } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import {
  Button,
  LoadErrorState,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { adminListingEditPath } from "./api/adminListingEdit.api";
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
 * the platform holds the listing: house-authored, a staff suggestion nobody
 * has claimed yet, or an owner erased from a listing nobody re-claimed.
 *
 * The prop is spelled `listingRef`. A prop named `ref` trips the
 * `react-hooks/refs` compiler lint even holding a plain string, as
 * `ListingHistoryPanel` records.
 */
export function ListingDelegationSection({
  listingRef,
  ownerSlug,
  suggesterSlug,
  suggesterName,
}: {
  listingRef: string;
  ownerSlug: string | null;
  /** Who suggested the place, when a platform-held listing is a member's
   *  suggestion. Optional so this component keeps building before every
   *  caller passes it. */
  suggesterSlug?: string | null;
  /** The suggester's display name, shown in place of their slug when known.
   *  Optional for the same reason as `suggesterSlug`. */
  suggesterName?: string | null;
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
              {t("admin:listingDelegation.owner.heldByPlatform")}
            </p>
            <p className={styles.meta}>
              {t("admin:listingDelegation.owner.heldByPlatformDetail")}
            </p>
            {/* Only a listing the platform holds is editable here
                (`PATCH /admin/listings/:ref` is Admin only, like this whole
                panel): once somebody owns it, its owner edits it. */}
            <Button
              variant="ghost"
              to={adminListingEditPath(listingRef)}
              className={styles.editAction}
            >
              <FiEdit2 aria-hidden /> {t("admin:adminListings.preview.editCta")}
            </Button>
          </>
        )}
        {suggesterSlug && (
          <p className={styles.meta}>
            {/* The member's name renders through `adminListings.suggestedBy`
                ("Suggested by {name}"); when only the slug is known, the line
                falls back to the existing `@{slug}` key. Either way it links
                to the suggester's profile. */}
            <Link to={`${routes.members}/${suggesterSlug}`}>
              {suggesterName
                ? t("admin:adminListings.suggestedBy", {
                    name: suggesterName,
                  })
                : t("admin:listingDelegation.owner.suggestedBy", {
                    slug: suggesterSlug,
                  })}
            </Link>
          </p>
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
