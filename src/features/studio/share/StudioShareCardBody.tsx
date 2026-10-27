import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiMusic, FiPause, FiPlay } from "react-icons/fi";
import { IconButton } from "../../../shared/components/ui";
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
  titleLines = 1,
}: {
  kind: StudioShareKind;
  href: string;
  title: string;
  /** Left out by a sentence card (`titleLines` 3), which shows none. */
  subtitle?: string;
  /** Left out by a sentence card (`titleLines` 3), which shows none. */
  meta?: ReactNode;
  art: ReactNode;
  play: StudioShareCardPlay | null;
  /** 3 for a title that is the card's whole content (a milestone's
   *  sentence, which already names the persona): it wraps to three lines
   *  and the card drops the subtitle and meta, so the column fits the
   *  frame. */
  titleLines?: 1 | 3;
}) {
  const { t } = useTranslation();
  const isSentenceCard = titleLines === 3;
  return (
    <div className={styles.body}>
      <div className={styles.art}>
        {art}
        {/* No tooltip: its wrapper would take the play's centring on the
            cover, and the cover already says what play does. */}
        {play && (
          <IconButton
            className={styles.play}
            aria-label={play.label}
            aria-disabled={play.isBlocked || undefined}
            aria-describedby={play.isBlocked ? play.noteId : undefined}
            onClick={play.onPlay}
          >
            {play.isPlaying ? <FiPause aria-hidden /> : <FiPlay aria-hidden />}
          </IconButton>
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
          data-title-lines={isSentenceCard ? 3 : undefined}
        >
          {title}
        </Link>
        {!isSentenceCard && (
          <>
            <span className={styles.subtitle}>{subtitle}</span>
            <span className={styles.meta}>{meta}</span>
          </>
        )}
      </div>
    </div>
  );
}
