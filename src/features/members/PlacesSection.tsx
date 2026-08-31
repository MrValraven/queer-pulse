import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useDirectoryListings } from "../marketing/listBusiness/api/useDirectoryListings";
import { CoManagerInvitesInbox } from "../marketing/listBusiness/coManagers/CoManagerInvitesInbox";
import { routes } from "../../app/routeMap";
import { EmptyState, LoadErrorState } from "../../shared/components/ui";
import { submittedToPlace } from "../marketing/api/directory.adapters";
import { useMemberListings } from "./api/useMemberListings";
import { PlacesGrid } from "./PlacesGrid";
import {
  mergePlaces,
  registryPlacesForMember,
  type MemberPlace,
} from "./places.data";
import styles from "./PlacesSection.module.css";

/** "Places I run" (owner) / "Places {firstName} runs" (visitor). Merges the
 *  static directory registry with this member's session-submitted listings,
 *  and puts any co-management invitation waiting on them above the grid. */
export function PlacesSection({
  memberSlug,
  isSelf,
  firstName,
}: {
  memberSlug: string;
  /** Owner view: adds pending submissions and their status chips/ref line. */
  isSelf: boolean;
  /** For the visitor title ("Places João runs"). */
  firstName: string;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const {
    submitted,
    withdrawListing,
    isError: hasOwnListingsFetchFailed,
    refetch: refetchOwnListings,
  } = useDirectoryListings();
  // Visitor source: demo → static registry, live → GET /directory/by-member/:slug.
  const visitorListings = useMemberListings(memberSlug);
  const visitorPlaces = visitorListings.places;
  // A failed visitor fetch gets its own panel. Rendering nothing here would
  // tell everyone who lands on the profile that this member runs no places,
  // which is a claim about them made out of our own outage (DES-22).
  const hasVisitorFetchFailed = !isSelf && visitorListings.isError;
  // The owner's own grid has the same failure shape: a failed GET /listings/mine
  // renders as "you have no places" over a "list your business" CTA, telling an
  // owner their listing is gone when the request merely failed (DES-22).
  const hasOwnFetchFailed = isSelf && hasOwnListingsFetchFailed;
  // Owner source: this member's own submissions from GET /listings/mine, which
  // also returns the listings they were invited to help run. A co-managed one
  // belongs to somebody else, so it matches neither the submitter test nor the
  // link-to-profile one and needs its own clause.
  const mine: MemberPlace[] = submitted
    .filter(
      (listing) =>
        listing.managementRole === "co_manager" ||
        (listing.submittedBy === memberSlug && listing.linkToProfile),
    )
    .map((listing) => ({
      key: listing.ref,
      status: listing.status,
      ref: listing.ref,
      managementRole: listing.managementRole,
      place: submittedToPlace(listing),
    }));
  // The static registry is a mock. It is a base in demo only; using it for a
  // real member in live mode would leak a demo persona's places.
  const ownerRegistry = demoMode ? registryPlacesForMember(memberSlug) : [];
  const places = isSelf
    ? mergePlaces(ownerRegistry, mine, true)
    : visitorPlaces;

  // Visitors see nothing rather than an empty shell; the owner gets a prompt.
  // An owner with no places of their own may still have an invitation waiting,
  // so the section stays for them either way.
  if (places.length === 0 && !isSelf && !hasVisitorFetchFailed) return null;

  // A live listing addresses its own ref for edit and delete; both need the
  // same owner + live-mode + real-ref gate.
  const canManage = (entry: MemberPlace) => Boolean(entry.ref) && !demoMode;
  // Deleting a listing stays with its owner, so a co-managed place is offered
  // no delete at all rather than one that would be refused.
  const removeHandler = (entry: MemberPlace) => {
    if (!canManage(entry) || entry.managementRole === "co_manager") {
      return undefined;
    }
    return () => {
      withdrawListing(entry.ref as string);
      showToast(t("members:places.deleted"), "info");
    };
  };

  return (
    <section id="places" className={`${styles.section} wrap`}>
      {isSelf && <CoManagerInvitesInbox />}

      {hasVisitorFetchFailed || hasOwnFetchFailed ? (
        <LoadErrorState
          onRetry={
            hasOwnFetchFailed ? refetchOwnListings : visitorListings.refetch
          }
          title={
            <Translation
              i18nKey="members:places.loadError.title"
              components={{ em: <em /> }}
            />
          }
          description={t("members:places.loadError.body")}
        />
      ) : places.length === 0 ? (
        <EmptyState
          title={t("members:places.empty.title")}
          description={t("members:places.empty.description")}
          action={{
            label: t("members:places.empty.action"),
            to: routes.listBusiness,
          }}
        />
      ) : (
        <>
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
          <PlacesGrid
            places={places}
            isSelf={isSelf}
            canManage={canManage}
            onRemove={removeHandler}
          />
        </>
      )}
    </section>
  );
}
