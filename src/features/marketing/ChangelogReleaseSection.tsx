import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ChangelogEntryRow } from "./ChangelogEntryRow";
import {
  RELEASE_GROUP_ORDER,
  type ChangelogRelease,
} from "./changelogReleases";
import type { ChangelogCategory } from "./changelog.data";
import styles from "./ChangelogPage.module.css";

const GROUP_LABEL_KEYS: Record<ChangelogCategory, string> = {
  feature: "marketing:changelog.filter.feature",
  improvement: "marketing:changelog.filter.improvement",
  fix: "marketing:changelog.filter.fix",
  infrastructure: "marketing:changelog.filter.infrastructure",
};

const COUNT_KEYS: Record<ChangelogCategory, string> = {
  feature: "marketing:changelog.release.count.feature",
  improvement: "marketing:changelog.release.count.improvement",
  fix: "marketing:changelog.release.count.fix",
  infrastructure: "marketing:changelog.release.count.infrastructure",
};

interface ChangelogReleaseSectionProps {
  release: ChangelogRelease;
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * One shipping day as a collapsible release: version, date and headline on
 * the toggle, the curated highlights always visible, and the full list grouped
 * by type once opened.
 */
export function ChangelogReleaseSection({
  release,
  isOpen,
  onToggle,
}: ChangelogReleaseSectionProps) {
  const { t } = useTranslation();
  const toggleId = `changelog-release-${release.slug}`;
  const panelId = `${toggleId}-panel`;

  return (
    <section className={styles.release} aria-labelledby={toggleId}>
      <h3 className={styles.releaseHead}>
        <button
          type="button"
          id={toggleId}
          className={styles.releaseToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className={styles.version}>{release.version}</span>
          <span className={styles.releaseMeta}>
            <span className={styles.releaseDate}>{release.date}</span>
            <span className={styles.headline}>{t(release.headlineKey)}</span>
            <span className={styles.counts}>
              {RELEASE_GROUP_ORDER.filter(
                (category) => release.counts[category] > 0,
              ).map((category) => (
                <span
                  key={category}
                  className={`${styles.count} ${styles[category]}`}
                >
                  {t(COUNT_KEYS[category], { count: release.counts[category] })}
                </span>
              ))}
            </span>
          </span>
          <FiChevronDown
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
            aria-hidden
          />
        </button>
      </h3>

      {release.highlights.length > 0 && (
        <div className={styles.highlights}>
          <div className={styles.groupLabel}>
            {t("marketing:changelog.release.highlights")}
          </div>
          <ul className={styles.highlightList}>
            {release.highlights.map((entry) => (
              <li key={entry.id} className={styles.highlight}>
                <span
                  className={`${styles.dot} ${styles[entry.category]}`}
                  aria-hidden
                />
                {t(entry.titleKey)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && (
        <div id={panelId} className={styles.releasePanel}>
          {release.groups.map((group) => (
            <div className={styles.group} key={group.category}>
              <h4 className={styles.groupLabel}>
                <span className={`${styles.dot} ${styles[group.category]}`} />
                {t(GROUP_LABEL_KEYS[group.category])}
                <span className={styles.groupCount}>
                  {group.entries.length}
                </span>
              </h4>
              <ul className={styles.entryList}>
                {group.entries.map((entry) => (
                  <ChangelogEntryRow key={entry.id} entry={entry} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
