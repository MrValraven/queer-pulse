import { FiShield } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./WorkRightsFooter.module.css";

export interface WorkRightsFooterProps {
  /** The item's ISO 8601 `createdAt` (first-published date). */
  createdAtISO: string;
  /** `"item"` (default) is the inline footer under a single work's body, used
   *  by the one-work modal surfaces. `"page"` is the centred, full-width
   *  notice that closes a whole persona page — see `PersonaRightsFooter`. */
  variant?: "item" | "page";
}

/**
 * Copyright + provenance notice: a "© {year}. All rights reserved." line plus
 * a "First published on QueerPulse · {date}" line. Tokens only.
 *
 * The notice names NO copyright holder. A persona created without a display
 * name carries its craft as its name (`KIND_LABELS[kind]`, e.g. "Dancer"), so
 * naming the holder printed "© 2026 Dancer. All rights reserved.", a claim by
 * an activity rather than a person. The year and the QueerPulse provenance
 * line are what the notice is actually for, and the page already says whose
 * work it is (see `personaTitleName`), so the holder slot is gone rather than
 * guessed at.
 *
 * The shield hangs to the left of both lines in the inline `item` variant. In
 * the centred `page` variant it sits inline with the © line, so it reads as
 * part of the notice rather than floating beside a centred block.
 *
 * It is deliberately NOT rendered per row/spotlight/menu-card on a persona
 * page — repeating it beside every item read as spam. The page shows it once
 * at the end via `PersonaRightsFooter`; the only other places it appears are
 * the single-work modals (`PoemReaderModal`, `StudioLightbox`), where exactly
 * one work is on screen and the provenance is the point.
 */
export function WorkRightsFooter({
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

  const isPageVariant = variant === "page";
  const shieldIcon = <FiShield aria-hidden className={styles.icon} />;

  return (
    <footer
      className={
        isPageVariant ? `${styles.rights} ${styles.page}` : styles.rights
      }
    >
      {isPageVariant ? null : shieldIcon}
      <div>
        <p className={styles.copyright}>
          {isPageVariant ? shieldIcon : null}
          {t("subprofiles:rights.copyright", { year })}
        </p>
        <p className={styles.provenance}>
          {t("subprofiles:rights.firstPublished", { date: formattedDate })}
        </p>
      </div>
    </footer>
  );
}
