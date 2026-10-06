import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ChangelogEntry } from "./changelog.data";
import styles from "./ChangelogPage.module.css";

interface ChangelogEntryRowProps {
  entry: ChangelogEntry;
}

/** One line of a release: bold title, short body, optional link. */
export function ChangelogEntryRow({ entry }: ChangelogEntryRowProps) {
  const { t } = useTranslation();

  return (
    <li className={styles.entry}>
      <p className={styles.entryLine}>
        <span className={styles.entryTitle}>{t(entry.titleKey)}</span>{" "}
        <span className={styles.entryBody}>{t(entry.bodyKey)}</span>
        {entry.tag && (
          <>
            {" "}
            <Link className={styles.tag} to={entry.tag.to}>
              {t(entry.tag.labelKey)} <FiArrowRight aria-hidden />
            </Link>
          </>
        )}
      </p>
    </li>
  );
}
