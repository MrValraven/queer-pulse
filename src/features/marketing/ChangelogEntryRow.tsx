import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ChangelogEntry } from "./changelog.data";
import styles from "./ChangelogPage.module.css";

interface ChangelogEntryRowProps {
  entry: ChangelogEntry;
}

/** One line of a release: bold title, short body, optional More toggle and link. */
export function ChangelogEntryRow({ entry }: ChangelogEntryRowProps) {
  const { t } = useTranslation();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const detailsId = `changelog-details-${entry.id}`;

  return (
    <li className={styles.entry}>
      <p className={styles.entryLine}>
        <span className={styles.entryTitle}>{t(entry.titleKey)}</span>{" "}
        <span className={styles.entryBody}>{t(entry.bodyKey)}</span>
        {entry.hasDetails && (
          <>
            {" "}
            <button
              type="button"
              className={styles.entryMore}
              aria-expanded={isDetailsOpen}
              aria-controls={detailsId}
              onClick={() => setIsDetailsOpen((wasOpen) => !wasOpen)}
            >
              {isDetailsOpen
                ? t("marketing:changelog.entry.less")
                : t("marketing:changelog.entry.more")}
            </button>
          </>
        )}
        {entry.tag && (
          <>
            {" "}
            <Link className={styles.tag} to={entry.tag.to}>
              {t(entry.tag.labelKey)} <FiArrowRight aria-hidden />
            </Link>
          </>
        )}
      </p>
      {entry.hasDetails && isDetailsOpen && (
        <p id={detailsId} className={styles.entryDetails}>
          {t(entry.detailsKey)}
        </p>
      )}
    </li>
  );
}
