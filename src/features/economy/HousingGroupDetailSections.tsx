import { FiCheck, FiLock, FiSettings, FiUsers } from "react-icons/fi";
import { Button, HubBackLink, Reveal } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { GroupListing, VettedGroup } from "./housingGroups.data";
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
        <p className={styles.normsSub}>{t("economy:housingGroups.norms.sub")}</p>
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

/** The group's norm-compliant listings (each carries price + accessibility),
 *  plus the poster's own manage mode. */
export function GroupListings({
  listings,
  canManage,
  isManaging,
  onToggleManaging,
  busyListingId,
  onEdit,
  onWithdraw,
}: {
  listings: GroupListing[];
  /** Signed-in members can ask to manage a room; signed-out readers cannot. */
  canManage: boolean;
  isManaging: boolean;
  onToggleManaging: () => void;
  /** The listing with a write in flight, so its controls stay disabled. */
  busyListingId: string | null;
  onEdit: (listing: GroupListing) => void;
  onWithdraw: (listing: GroupListing) => void;
}) {
  const { t } = useTranslation();
  return (
    <section className={styles.listingsSection}>
      <div className="wrap">
        <div className={styles.listingsHead}>
          <h2 className={styles.listingsTitle}>
            {t("economy:housingGroups.listings.title")}
          </h2>
          {canManage && listings.length > 0 && (
            <Button
              variant="ghost"
              size="md"
              onClick={onToggleManaging}
              aria-pressed={isManaging}
            >
              <FiSettings aria-hidden />
              {t(
                isManaging
                  ? "economy:groupListing.manage.doneCta"
                  : "economy:groupListing.manage.startCta",
              )}
            </Button>
          )}
        </div>
        {isManaging && (
          <p className={styles.manageNote}>
            {t("economy:groupListing.manage.note")}
          </p>
        )}
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
                isManaging={isManaging}
                isBusy={busyListingId === listing.id}
                onEdit={() => onEdit(listing)}
                onWithdraw={() => onWithdraw(listing)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
