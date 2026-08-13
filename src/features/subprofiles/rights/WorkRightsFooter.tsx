import { FiShield } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./WorkRightsFooter.module.css";

export interface WorkRightsFooterProps {
  /** The persona's display name, used as the copyright holder. */
  authorName: string;
  /** The item's ISO 8601 `createdAt` (first-published date). */
  createdAtISO: string;
}

/**
 * Public copyright + provenance footer for a portfolio item: a "© {year}
 * {author}. All rights reserved." line plus a "First published on
 * QueerPulse · {date}" line. Rendered after the item body, tokens only.
 */
export function WorkRightsFooter({ authorName, createdAtISO }: WorkRightsFooterProps) {
  const { t, language } = useTranslation();
  const createdAt = new Date(createdAtISO);
  const year = String(createdAt.getFullYear());
  const formattedDate = createdAt.toLocaleDateString(language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <footer className={styles.rights}>
      <FiShield aria-hidden className={styles.icon} />
      <div>
        <p className={styles.copyright}>
          {t("subprofiles:rights.copyright", { year, author: authorName })}
        </p>
        <p className={styles.provenance}>
          {t("subprofiles:rights.firstPublished", { date: formattedDate })}
        </p>
      </div>
    </footer>
  );
}
