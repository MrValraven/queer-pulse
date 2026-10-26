import { useRef, useState, type ReactNode, type RefObject } from "react";
import { Link } from "react-router-dom";
import type { ImageSlotTint } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { StudioFormat } from "../api/studio.types";
import { StudioCoverFallback } from "./StudioCoverFallback";
import { StudioMenu, type StudioMenuItem } from "./StudioMenu";
import { StudioPlayButton } from "./StudioPlayButton";
import {
  useStudioContextMenu,
  type StudioContextMenuPoint,
} from "./useStudioContextMenu";
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
  /** The card's own menu: right-click, a long press, the Menu key or
   *  Shift+F10 on the card opens it, and the finger lifting off a long
   *  press never follows the link. Leave it out on a card whose caller
   *  wraps it in its own context menu (StudioReleaseCard). */
  menu?: { label: string; items: StudioMenuItem[] };
}

/** The menu a card opens at the press or the cursor, and the handlers that
 *  open it, spread on the card's one link. Closing hands focus back to that
 *  link. */
function useCardMenu(
  menu: StudioMediaCardProps["menu"],
  linkRef: RefObject<HTMLAnchorElement | null>,
) {
  const [menuPoint, setMenuPoint] = useState<StudioContextMenuPoint | null>(
    null,
  );
  const contextMenu = useStudioContextMenu(setMenuPoint);
  const hasMenu = menu !== undefined && menu.items.length > 0;
  const linkProps = hasMenu
    ? { ...contextMenu, "aria-keyshortcuts": "Shift+F10" }
    : {};
  const menuElement = hasMenu ? (
    <StudioMenu
      trigger={null}
      label={menu.label}
      items={menu.items}
      anchorPoint={menuPoint}
      returnFocusRef={linkRef}
      onOpenChange={(isOpen) => {
        if (!isOpen) setMenuPoint(null);
      }}
    />
  ) : null;
  return { hasMenu, linkProps, menuElement };
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
  menu,
}: StudioMediaCardProps) {
  const { t } = useTranslation();
  const linkRef = useRef<HTMLAnchorElement>(null);
  const cardMenu = useCardMenu(menu, linkRef);
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
      data-has-menu={cardMenu.hasMenu || undefined}
    >
      {/* The title comes first in the DOM, so a keyboard meets the card's
          name before its play button; CSS `order` draws the art on top. */}
      <h3 className={styles.title}>
        <Link
          ref={linkRef}
          to={href}
          className={styles.link}
          {...cardMenu.linkProps}
        >
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
      {cardMenu.menuElement}
    </article>
  );
}
