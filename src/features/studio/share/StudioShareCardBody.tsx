import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiMusic, FiPause, FiPlay } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { StudioShareKind } from "./studioLinkTarget";
import { studioShareLabelKey } from "./studioShareLabel";
import styles from "./StudioShareCard.module.css";

export interface StudioShareCardPlay {
  isPlaying: boolean;
  /** Hidden by the member's explicit setting: focusable, announced, inert. */
  isBlocked: boolean;
  label: string;
  /** The visible reason's id, when blocked. */
  noteId?: string;
  onPlay: () => void;
}

/** The loaded card: cover with play, then eyebrow, title, subtitle and meta.
 *  The title is a stretched link over the whole card; play sits above it, so
 *  no interactive element is ever nested in the link. */
export function StudioShareCardBody({
  kind,
  href,
  title,
  subtitle,
  meta,
  art,
  play,
}: {
  kind: StudioShareKind;
  href: string;
  title: string;
  subtitle: string;
  meta: ReactNode;
  art: ReactNode;
  play: StudioShareCardPlay | null;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.body}>
      <div className={styles.art}>
        {art}
        {play && (
          <button
            type="button"
            className={styles.play}
            aria-label={play.label}
            aria-disabled={play.isBlocked || undefined}
            aria-describedby={play.isBlocked ? play.noteId : undefined}
            onClick={play.onPlay}
          >
            {play.isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
          </button>
        )}
      </div>
      <div className={styles.text}>
        <span className={styles.eyebrow}>
          <FiMusic aria-hidden />
          <span className={styles.eyebrowLabel}>
            {t(studioShareLabelKey(kind))}
          </span>
        </span>
        <Link
          to={href}
          className={styles.title}
          aria-label={t("studio:share.card.openAria", { title })}
        >
          {title}
        </Link>
        <span className={styles.subtitle}>{subtitle}</span>
        <span className={styles.meta}>{meta}</span>
      </div>
    </div>
  );
}
