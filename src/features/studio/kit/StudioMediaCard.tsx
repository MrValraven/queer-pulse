import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { ImageSlotTint } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { StudioFormat } from "../api/studio.types";
import { StudioCoverFallback } from "./StudioCoverFallback";
import { StudioPlayButton } from "./StudioPlayButton";
import styles from "./StudioMediaCard.module.css";

export type StudioMediaCardKind =
  "release" | "episode" | "playlist" | "liked" | "artist";

export interface StudioMediaCardProps {
  kind: StudioMediaCardKind;
  href: string;
  title: string;
  meta?: ReactNode;
  /** The art, filling a square frame (an `ImageSlot` with inset 0). Tags and
   *  badges that sit on the art go in here too. Left out, the card draws
   *  StudioCoverFallback from `coverKind` and `coverTint`. */
  cover?: ReactNode;
  /** The format icon on a card without art; left out, the title's first
   *  letter. */
  coverKind?: StudioFormat;
  /** The cover hue on a card without art. */
  coverTint?: ImageSlotTint;
  /** Shows the play button when given. */
  onPlay?: () => void;
  isPlaying?: boolean;
  /** Overrides the default "Play {title}" / "Pause {title}" label. */
  playLabel?: string;
  /** A round frame; off by default. */
  isRound?: boolean;
}

/**
 * One release, episode, playlist, Liked songs or artist on a shelf or grid.
 * The title is the card's one link, stretched over the whole card, so a
 * keyboard or screen reader meets each card once and a tap anywhere opens it.
 * The play button sits above that link as its sibling, so no interactive
 * element nests inside another.
 */
export function StudioMediaCard({
  kind,
  href,
  title,
  meta,
  cover,
  coverKind,
  coverTint,
  onPlay,
  isPlaying = false,
  playLabel,
  isRound,
}: StudioMediaCardProps) {
  const { t } = useTranslation();
  const isRoundFrame = isRound ?? false;
  const label =
    playLabel ??
    (isPlaying
      ? t("studio:card.pauseRelease", { title })
      : t("studio:card.playRelease", { title }));

  return (
    <article
      className={styles.card}
      data-kind={kind}
      data-round={isRoundFrame || undefined}
      data-playing={isPlaying || undefined}
    >
      {/* The title comes first in the DOM, so a keyboard meets the card's
          name before its play button; CSS `order` draws the art on top. */}
      <h3 className={styles.title}>
        <Link to={href} className={styles.link}>
          {title}
        </Link>
      </h3>
      <div className={styles.coverArea}>
        <div className={styles.frame}>
          <div className={styles.art}>
            {cover ?? (
              <StudioCoverFallback
                title={title}
                kind={coverKind}
                tint={coverTint}
              />
            )}
          </div>
        </div>
        {onPlay && (
          <div className={styles.fab}>
            <StudioPlayButton
              size="card"
              state={isPlaying ? "playing" : "idle"}
              onToggle={onPlay}
              label={label}
            />
          </div>
        )}
      </div>
      {meta !== undefined && meta !== null && (
        <div className={styles.meta}>{meta}</div>
      )}
    </article>
  );
}
