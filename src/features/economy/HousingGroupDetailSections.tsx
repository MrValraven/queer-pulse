import { FiCheck, FiClock, FiLock, FiUsers } from "react-icons/fi";
import type { Ref } from "react";
import { Button, HubBackLink, Reveal } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  GroupListing,
  GroupMembershipStanding,
  VettedGroup,
} from "./housingGroups.data";
import { GroupListingCard } from "./GroupListingCard";
import { useCanPostGroupListing } from "./api/useMyGroupListings";
import styles from "./HousingGroupsPage.module.css";

/**
 * Where the reader stands with this group, for the join entry. `open` offers
 * the way in (nobody asked yet, or the last answer was no and they may ask
 * again), `pending` says the request is waiting, and `member` shows nothing.
 * The same precedence the backend's duplicate refusal uses, so the page never
 * offers a form whose submit would answer 409. `unknown` (the reader's own
 * requests are still loading) shows nothing either, so a member is never
 * flashed an "Ask to join" they cannot use.
 */
export type GroupJoinStanding = "unknown" | "open" | "pending" | "member";

/** Header: name, city, member count, gated badge, and the ask-to-join CTA. */
export function GroupDetailHeader({
  group,
  joinStanding,
  titleId,
  pendingNoteRef,
  onJoin,
}: {
  group: VettedGroup;
  joinStanding: GroupJoinStanding;
  /** The heading's id. It takes focus (`tabIndex={-1}`) when a join answer
   *  leaves no join entry behind, so focus never falls to the page. */
  titleId: string;
  /** Where focus lands once a request just sent replaces the join button. */
  pendingNoteRef?: Ref<HTMLParagraphElement>;
  onJoin: () => void;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.detailHero}>
      <div className="wrap">
        <HubBackLink
          to={routes.housingGroups}
          label={t("economy:housingGroups.detail.backLabel")}
          tone="light"
        />
        <Reveal
          as="h1"
          id={titleId}
          tabIndex={-1}
          className={styles.detailTitle}
          delay={60}
        >
          {group.name} {group.nameEm && <em>{group.nameEm}</em>}
        </Reveal>
        <div className={styles.detailMeta}>
          <span className={styles.memberChip}>
            <FiUsers aria-hidden />{" "}
            {t("economy:housingGroups.members", { count: group.memberCount })}
          </span>
          {group.isAccessGated && (
            <span className={styles.gated}>
              <FiLock aria-hidden /> {t("economy:housingGroups.gated")}
            </span>
          )}
        </div>
        <p className={styles.detailBlurb}>{group.blurb}</p>
        {joinStanding === "open" && (
          <Button variant="primary" size="lg" onClick={onJoin}>
            {group.isAccessGated
              ? t("economy:housingGroups.detail.askToJoin")
              : t("economy:housingGroups.detail.join")}
          </Button>
        )}
        {joinStanding === "pending" && (
          <p className={styles.joinPending} ref={pendingNoteRef} tabIndex={-1}>
            <FiClock aria-hidden className={styles.joinPendingIcon} />
            {t("economy:joinGroup.alreadyPending")}
          </p>
        )}
      </div>
    </section>
  );
}

/** The enforced community norms, surfaced as a checklist (P3.3). */
export function GroupNorms({ norms }: { norms: string[] }) {
  const { t } = useTranslation();
  if (norms.length === 0) return null;
  return (
    <section className={styles.normsSection}>
      <div className="wrap">
        <h2 className={styles.normsTitle}>
          {t("economy:housingGroups.norms.title")}{" "}
          <em>{t("economy:housingGroups.norms.titleEm")}</em>
        </h2>
        <p className={styles.normsSub}>
          {t("economy:housingGroups.norms.sub")}
        </p>
        <ul className={styles.normsList}>
          {norms.map((norm) => (
            <li className={styles.norm} key={norm}>
              <FiCheck aria-hidden className={styles.normIcon} />
              <span>{norm}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** What each standing is told, in place of the rooms. Three sentences rather
 *  than one, because the next step differs: wait, ask, or accept the answer. */
const LOCKED_BODY_KEY: Record<GroupMembershipStanding, string> = {
  pending: "economy:housingGroups.listings.locked.pending",
  declined: "economy:housingGroups.listings.locked.declined",
  none: "economy:housingGroups.listings.locked.none",
};

/**
 * The same section, for a reader an access-gated group has not let in
 * (ENG-172). It stands in for the grid deliberately: an empty grid would read
 * as "this group has no rooms", which is a claim the client cannot make and the
 * server refuses to answer.
 *
 * The way in is offered only to somebody who has not asked yet. A reader whose
 * request is still being read is told to wait, and one who was turned down is
 * given the answer rather than a button that asks the same stewards again.
 */
export function GroupListingsLocked({
  membershipStanding,
  onJoin,
}: {
  membershipStanding: GroupMembershipStanding;
  onJoin: () => void;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.listingsSection}>
      <div className="wrap">
        <div className={styles.listingsHead}>
          <h2 className={styles.listingsTitle}>
            {t("economy:housingGroups.listings.title")}
          </h2>
        </div>
        <div className={styles.listingsLocked}>
          <FiLock aria-hidden className={styles.listingsLockedIcon} />
          <h3 className={styles.listingsLockedTitle}>
            {t("economy:housingGroups.listings.locked.title")}
          </h3>
          <p className={styles.listingsLockedBody}>
            {t(LOCKED_BODY_KEY[membershipStanding])}
          </p>
          {membershipStanding === "none" && (
            <Button variant="ghost" onClick={onJoin}>
              {t("economy:housingGroups.detail.askToJoin")}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * The group's norm-compliant listings, each carrying the price and the access
 * line the group requires.
 *
 * This grid is the PUBLIC board: every room here has already been cleared by a
 * moderator. A member's own rooms, in whatever state they are in, live in
 * `MyGroupListings` below, where ownership comes from the query itself, so
 * every edit and withdraw control there is one the server will honour.
 *
 * `groupSlug` addresses each room's "Message" and "Report" (PRD-443).
 */
export function GroupListings({
  listings,
  groupSlug,
}: {
  listings: GroupListing[];
  groupSlug: string;
}) {
  const { t } = useTranslation();
  // The same check the detail page renders `MyGroupListings` on, so a card
  // links to "Your rooms" only when that section is on the page.
  const hasYourRoomsSection = useCanPostGroupListing();
  return (
    <section className={styles.listingsSection}>
      <div className="wrap">
        <div className={styles.listingsHead}>
          <h2 className={styles.listingsTitle}>
            {t("economy:housingGroups.listings.title")}
          </h2>
        </div>
        {listings.length === 0 ? (
          <p className={styles.listingsEmpty}>
            {t("economy:housingGroups.listings.empty")}
          </p>
        ) : (
          <div className={styles.listingsGrid}>
            {listings.map((listing) => (
              <GroupListingCard
                key={listing.id}
                listing={listing}
                groupSlug={groupSlug}
                hasYourRoomsSection={hasYourRoomsSection}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
