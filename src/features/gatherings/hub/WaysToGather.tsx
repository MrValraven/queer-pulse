import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Reveal } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { WAYS } from "../gatheringsPage.data";
import styles from "./HighlightsView.module.css";

/**
 * Condensed "ways to gather" strip — the same platform-chrome nav data as the
 * old gatherings landing page's `.wayCard` grid, trimmed to a lighter,
 * whitespace-grouped row (no card boxes/shadows) for its new home under the
 * hub's Highlights tab rather than a full page section.
 */
export function WaysToGather() {
  const { t } = useTranslation();
  return (
    <Reveal as="section" className={styles.waysSection}>
      <h2 className={styles.waysHeading}>{t("gatherings:hub.ways.heading")}</h2>
      <div className={styles.waysGrid}>
        {WAYS.map((way) => (
          <div key={way.titleKey} className={styles.wayItem}>
            <span className={styles.wayIcon} aria-hidden>
              <way.icon />
            </span>
            <div className={styles.wayCopy}>
              <p className={styles.wayTitle}>{t(way.titleKey)}</p>
              <p className={styles.wayBody}>{t(way.bodyKey)}</p>
              <Link to={way.to} className={styles.wayLink}>
                {t(way.ctaKey)}{" "}
                <FiArrowRight aria-hidden />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
