import { Link } from "react-router-dom";
import { FiArrowRight, FiLock, FiUsers } from "react-icons/fi";
import { HubBackLink, Reveal } from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useHousingGroups } from "./api/useHousingGroups";
import { GroupEmptyState } from "./GroupEmptyState";
import type { VettedGroup } from "./housingGroups.data";
import styles from "./HousingGroupsPage.module.css";

/** Hero: headline + the reassurance of what an access-gated group is. */
export function GroupsHero() {
  const { t } = useTranslation();
  return (
    <section className={styles.hero}>
      <div className="wrap">
        <HubBackLink
          to={routes.housing}
          label={t("economy:housingGroups.backLabel")}
          tone="light"
        />
        <Reveal as="div" className={styles.eyebrow}>
          {t("economy:housingGroups.hero.eyebrow")}
        </Reveal>
        <Reveal as="h1" className={styles.title} delay={60}>
          <Translation
            i18nKey="economy:housingGroups.hero.title"
            components={{ em: <em /> }}
          />
        </Reveal>
        <Reveal as="p" className={styles.sub} delay={120}>
          {t("economy:housingGroups.hero.sub")}
        </Reveal>
      </div>
    </section>
  );
}

/** One vetted-group card in the directory grid. */
function GroupCard({ group }: { group: VettedGroup }) {
  const { t } = useTranslation();
  return (
    <Link className={styles.card} to={`${routes.housingGroups}/${group.id}`}>
      <div className={styles.cardHead}>
        <div className={styles.cardTitle}>
          {group.name} {group.nameEm && <em>{group.nameEm}</em>}
        </div>
        {group.isAccessGated && (
          <span className={styles.gated}>
            <FiLock aria-hidden /> {t("economy:housingGroups.gated")}
          </span>
        )}
      </div>
      <div className={styles.cardCity}>{group.city}</div>
      <p className={styles.blurb}>{group.blurb}</p>
      <div className={styles.cardFoot}>
        <span className={styles.memberChip}>
          <FiUsers aria-hidden />{" "}
          {t("economy:housingGroups.members", { count: group.memberCount })}
        </span>
        <span className={styles.cardCta}>
          {t("economy:housingGroups.view")} <FiArrowRight aria-hidden />
        </span>
      </div>
    </Link>
  );
}

/** The directory grid, wired to live data (demo renders the fixture). */
export function GroupsGrid() {
  const { t } = useTranslation();
  const { data: groups = [], isLoading } = useHousingGroups();
  return (
    <section className={styles.gridSection}>
      <div className="wrap">
        <div className={styles.gridHead}>
          <h2>
            <Translation
              i18nKey="economy:housingGroups.grid.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p>{t("economy:housingGroups.grid.sub")}</p>
        </div>
        {isLoading ? (
          <div className={styles.grid} aria-busy="true">
            {[0, 1, 2].map((slot) => (
              <div key={slot} className={styles.cardSkeleton} />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <GroupEmptyState />
        ) : (
          <div className={styles.grid}>
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
