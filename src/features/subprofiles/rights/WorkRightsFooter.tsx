import { FiShield } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./WorkRightsFooter.module.css";

export interface WorkRightsFooterProps {
  /** The persona's display name, used as the copyright holder. */
  authorName: string;
  /** The item's ISO 8601 `createdAt` (first-published date). */
  createdAtISO: string;
  /** `"item"` (default) is the inline footer under a single work's body, used
   *  by the one-work modal surfaces. `"page"` is the centred, full-width
   *  notice that closes a whole persona page — see `PersonaRightsFooter`. */
  variant?: "item" | "page";
}

/**
 * Copyright + provenance notice: a "© {year} {author}. All rights reserved."
 * line plus a "First published on QueerPulse · {date}" line. Tokens only.
 *
 * It is deliberately NOT rendered per row/spotlight/menu-card on a persona
 * page — repeating it beside every item read as spam. The page shows it once
 * at the end via `PersonaRightsFooter`; the only other places it appears are
 * the single-work modals (`PoemReaderModal`, `StudioLightbox`), where exactly
 * one work is on screen and the provenance is the point.
 */
export function WorkRightsFooter({
  authorName,
  createdAtISO,
  variant = "item",
}: WorkRightsFooterProps) {
  const { t, language } = useTranslation();
  const createdAt = new Date(createdAtISO);
  const year = String(createdAt.getFullYear());
  const formattedDate = createdAt.toLocaleDateString(language, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <footer
      className={
        variant === "page" ? `${styles.rights} ${styles.page}` : styles.rights
      }
    >
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
