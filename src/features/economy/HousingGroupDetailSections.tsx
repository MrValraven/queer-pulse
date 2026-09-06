import { FiCheck, FiLock, FiUsers } from "react-icons/fi";
import { Button, HubBackLink, Reveal } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  GroupListing,
  GroupMembershipStanding,
  VettedGroup,
} from "./housingGroups.data";
import { GroupListingCard } from "./GroupListingCard";
import styles from "./HousingGroupsPage.module.css";

/** Header: name, city, member count, gated badge, and the ask-to-join CTA. */
export function GroupDetailHeader({
  group,
  onJoin,
}: {
  group: VettedGroup;
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
        <Reveal as="h1" className={styles.detailTitle} delay={60}>
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
        <Button variant="primary" size="lg" onClick={onJoin}>
          {group.isAccessGated
            ? t("economy:housingGroups.detail.askToJoin")
            : t("economy:housingGroups.detail.join")}
        </Button>
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

/**
 * The group's norm-compliant listings, each carrying the price and the access
 * line the group requires.
 *
 * This grid is the PUBLIC board: every room here has already been cleared by a
 * moderator. A member's own rooms, in whatever state they are in, live in
 * `MyGroupListings` below, where ownership comes from the query rather than
 * from a control that hopes for the best and answers with a 403.
 */
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

export function GroupListings({ listings }: { listings: GroupListing[] }) {
  const { t } = useTranslation();
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
              <GroupListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
