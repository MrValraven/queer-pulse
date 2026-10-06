import { FiChevronDown } from "react-icons/fi";
import { Collapse } from "../../shared/components/ui/Collapse";
import { useFormat } from "../../shared/i18n/format";
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

/** A release slug that is a real day (`releaseDateSlug` builds it from the
 *  English "9 Sep 2026" label). Anything else keeps its label as written. */
const ISO_DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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
  const fmt = useFormat();
  const isIsoDay = ISO_DAY_PATTERN.test(release.slug);
  // Local midnight, so the day never renders one early west of Greenwich. The
  // default long form keeps PT readable: a short month gives "9/09/2026".
  const dateLabel = isIsoDay
    ? fmt.date(new Date(`${release.slug}T00:00:00`))
    : release.date;
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
            <time
              className={styles.releaseDate}
              dateTime={isIsoDay ? release.slug : undefined}
            >
              {dateLabel}
            </time>
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

      <Collapse isOpen={isOpen}>
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
      </Collapse>
    </section>
  );
}
