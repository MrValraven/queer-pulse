import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useDirectoryListings } from "../marketing/listBusiness/api/useDirectoryListings";
import { routes } from "../../app/routeMap";
import { EmptyState } from "../../shared/components/ui";
import { LocalBusinessCard } from "../marketing/LocalBusinessCard";
import { submittedToPlace } from "../marketing/api/directory.adapters";
import { useMemberListings } from "./api/useMemberListings";
import { OwnedPlaceCard } from "./OwnedPlaceCard";
import {
  mergePlaces,
  registryPlacesForMember,
  type MemberPlace,
} from "./places.data";
import styles from "./PlacesSection.module.css";

/** "Places I run" (owner) / "Places {firstName} runs" (visitor) — merges the
 *  static directory registry with this member's session-submitted listings. */
export function PlacesSection({
  memberSlug,
  isSelf,
  firstName,
}: {
  memberSlug: string;
  /** Owner view — adds pending submissions and their status chips/ref line. */
  isSelf: boolean;
  /** For the visitor title ("Places João runs"). */
  firstName: string;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { submitted, withdrawListing } = useDirectoryListings();
  // Visitor source: demo → static registry, live → GET /directory/by-member/:slug.
  const visitorPlaces = useMemberListings(memberSlug);
  // Owner source: this member's own submissions from GET /listings/mine.
  // `submittedToPlace` is the same adapter the listing wizard's preview uses,
  // so an owner's card is exactly the card the directory will show.
  const mine: MemberPlace[] = submitted
    .filter(
      (listing) => listing.submittedBy === memberSlug && listing.linkToProfile,
    )
    .map((listing) => ({
      key: listing.ref,
      status: listing.status,
      ref: listing.ref,
      place: submittedToPlace(listing),
    }));
  // The static registry is a mock — only a base in demo, never for a real
  // member in live mode (that would leak a demo persona's places).
  const ownerRegistry = demoMode ? registryPlacesForMember(memberSlug) : [];
  const places = isSelf
    ? mergePlaces(ownerRegistry, mine, true)
    : visitorPlaces;

  // Visitors see nothing rather than an empty shell; the owner gets a prompt.
  if (places.length === 0 && !isSelf) return null;

  if (places.length === 0) {
    return (
      <section id="places" className={`${styles.section} wrap`}>
        <EmptyState
          title={t("members:places.empty.title")}
          description={t("members:places.empty.description")}
          action={{
            label: t("members:places.empty.action"),
            to: routes.listBusiness,
          }}
        />
      </section>
    );
  }

  return (
    <section id="places" className={`${styles.section} wrap`}>
      <div className={styles.head}>
        <h2 className={styles.title}>
          {isSelf ? (
            <Translation
              i18nKey="members:places.selfTitle"
              components={{ em: <em /> }}
            />
          ) : (
            <Translation
              i18nKey="members:places.visitorTitle"
              values={{ firstName }}
              components={{ em: <em /> }}
            />
          )}
        </h2>
        {isSelf && (
          <p className={styles.sub}>{t("members:places.selfSubtitle")}</p>
        )}
      </div>
      <div className={styles.grid}>
        {places.map((entry, index) =>
          isSelf ? (
            <OwnedPlaceCard
              key={entry.key}
              entry={entry}
              // A live listing addresses its own ref for edit/delete; both need
              // the same owner + live-mode + real-ref gate.
              canManage={Boolean(entry.ref) && !demoMode}
              onRemove={
                entry.ref && !demoMode
                  ? () => {
                      withdrawListing(entry.ref as string);
                      showToast(t("members:places.deleted"), "info");
                    }
                  : undefined
              }
            />
          ) : (
            // A visitor's view is the directory card, unmodified — save
            // bookmark, rating, whole-card link and all.
            <LocalBusinessCard
              key={entry.key}
              place={entry.place}
              index={index}
            />
          ),
        )}
      </div>
    </section>
  );
}
