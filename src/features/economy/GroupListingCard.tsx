import { useState } from "react";
import { FiFlag, FiMessageCircle } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HousingEnquiryModal } from "./HousingEnquiryModal";
import { ReportListingModal } from "./ReportListingModal";
import type { GroupListing } from "./housingGroups.data";
import styles from "./HousingGroupsPage.module.css";

/** The "Your rooms" section's id (`MyGroupListings`, same literal). */
const YOUR_ROOMS_HREF = "#your-rooms";

/**
 * The card's footer: who posted the room, and the two things a reader can do
 * about it (PRD-443). "Message" appears only when there is a poster to write
 * to and it is somebody else; the reader's own room says so and offers
 * neither action. When the page carries the "Your rooms" section, the own
 * room also links down to it, where its edit and withdraw controls live.
 */
function GroupListingFoot({
  listing,
  hasYourRoomsSection,
  onMessage,
  onReport,
}: {
  listing: GroupListing;
  hasYourRoomsSection: boolean;
  onMessage: () => void;
  onReport: () => void;
}) {
  const { t } = useTranslation();
  const { poster, isOwnListing } = listing;

  if (isOwnListing) {
    return (
      <div className={styles.listingFoot}>
        <span className={styles.listingPoster}>
          {t("economy:housingGroups.listings.yourRoom")}
        </span>
        {hasYourRoomsSection && (
          <a href={YOUR_ROOMS_HREF} className={styles.listingYourRoomsLink}>
            {t("economy:housingGroups.listings.yourRoomLink")}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={styles.listingFoot}>
      {poster && (
        <span className={styles.listingPoster}>
          <Avatar
            initials={poster.initials}
            tint={poster.tint}
            src={poster.avatarUrl}
            size={28}
          />
          {t("economy:housingGroups.listings.postedBy", {
            name: poster.fullName,
          })}
        </span>
      )}
      <div className={styles.listingActions}>
        {poster && (
          <Button variant="ghost" size="sm" onClick={onMessage}>
            <FiMessageCircle aria-hidden />
            {t("economy:housingGroups.listings.message", {
              name: poster.firstName || poster.fullName,
            })}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onReport}
          aria-label={t("economy:housingGroups.listings.reportAria", {
            title: listing.title,
          })}
        >
          <FiFlag aria-hidden />
          {t("economy:housingGroups.listings.report")}
        </Button>
      </div>
    </div>
  );
}

/**
 * One norm-compliant room inside a vetted group: title, price, neighbourhood,
 * description, the accessibility line the group requires, and who posted it.
 *
 * A reader can message the poster about the room (delivered as an enquiry,
 * the same door a member listing uses) or report it to the moderators. The
 * poster's own edit and withdraw controls stay on `MyGroupListings`, where the
 * rows came from a query keyed on the caller's own submissions.
 */
export function GroupListingCard({
  listing,
  groupSlug,
  hasYourRoomsSection = false,
}: {
  listing: GroupListing;
  groupSlug: string;
  /** True when the page renders `MyGroupListings`, so the reader's own room
   *  can link to it. */
  hasYourRoomsSection?: boolean;
}) {
  const { t } = useTranslation();
  const [isMessaging, setIsMessaging] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  return (
    <article className={styles.listing}>
      <div className={styles.listingHead}>
        <h3 className={styles.listingTitle}>{listing.title}</h3>
        <span className={styles.price}>
          {t("economy:housingGroups.listings.perMonth", {
            price: listing.priceEuros,
          })}
        </span>
      </div>
      <div className={styles.listingLoc}>{listing.neighbourhood}</div>
      <p className={styles.listingDesc}>{listing.description}</p>
      <div className={styles.access}>
        <span className={styles.accessLabel}>
          {t("economy:housingGroups.listings.accessLabel")}
        </span>{" "}
        {listing.accessibilityInfo}
      </div>
      <GroupListingFoot
        listing={listing}
        hasYourRoomsSection={hasYourRoomsSection}
        onMessage={() => setIsMessaging(true)}
        onReport={() => setIsReporting(true)}
      />

      {isMessaging && listing.poster && (
        <HousingEnquiryModal
          lister={listing.poster}
          listingTitle={listing.title}
          listingRef={null}
          groupRoom={{ groupSlug, listingId: listing.id }}
          onClose={() => setIsMessaging(false)}
        />
      )}

      {isReporting && (
        <ReportListingModal
          subjectType="group_listing"
          subjectId={listing.id}
          subjectName={listing.title}
          onClose={() => setIsReporting(false)}
        />
      )}
    </article>
  );
}
