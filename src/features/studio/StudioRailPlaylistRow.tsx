import { AnimatePresence, m } from "motion/react";
import { FiHeart, FiMusic, FiUsers } from "react-icons/fi";
import { RiPushpin2Fill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { routes } from "../../app/routeMap";
import { Spinner, Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  useStudioContextMenu,
  type StudioContextMenuPoint,
} from "./kit/useStudioContextMenu";
import type { StudioPlaylistDragSource } from "./StudioRailFolder.drag";
import { StudioRailCoverArt, StudioRailRowBody } from "./StudioRailRowCover";
import type { StudioRailPlaylistRowModel } from "./studioRailPlaylistRows";
import { STUDIO_EXIT, STUDIO_FADE } from "./studioMotion";
import { useStudioRailDrop } from "./useStudioRailDrop";
import css from "./StudioRailPlaylists.module.css";

/** A small spinner while the row is busy (a dropped track being added, or
 *  Edit details reading the playlist). */
function RowBusy({ isBusy }: { isBusy: boolean }) {
  const { reducedMotion } = useMotionPrefs();
  return (
    <AnimatePresence initial={false}>
      {isBusy && (
        <m.span
          key="busy"
          className={css.busy}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: reducedMotion ? { duration: 0 } : STUDIO_FADE,
          }}
          exit={{
            opacity: 0,
            transition: reducedMotion ? { duration: 0 } : STUDIO_EXIT,
          }}
        >
          <Spinner />
        </m.span>
      )}
    </AnimatePresence>
  );
}

/** Liked songs, pinned above every playlist in the rail, on its coral
 *  heart tile. Folded, the tile alone with the name in a tooltip. */
export function StudioRailLikedRow({
  isActive,
  isCompact = false,
}: {
  isActive: boolean;
  isCompact?: boolean;
}) {
  const { t } = useTranslation();
  const name = t("studio:liked.title");
  const meta = t("studio:railPlaylists.autoPlaylist");
  return (
    <Tooltip label={name} placement="right" isDisabled={!isCompact}>
      <Link
        to={routes.studioLiked}
        className={css.row}
        data-compact={isCompact || undefined}
        title={isCompact ? undefined : name}
        aria-current={isActive ? "page" : undefined}
      >
        <StudioRailRowBody
          isCompact={isCompact}
          name={name}
          spokenMeta={meta}
          cover={
            <span className={css.likedCover}>
              <FiHeart fill="currentColor" />
            </span>
          }
          meta={
            <>
              <RiPushpin2Fill aria-hidden />
              <span className={css.metaText}>{meta}</span>
            </>
          }
        />
      </Link>
    </Tooltip>
  );
}

/** One playlist in the rail: its cover, then its name over who it belongs
 *  to; folded, the cover alone with the name in a tooltip. The link has no
 *  `aria-label`, so its accessible name reads both lines. Right-click, a
 *  long-press, the Menu key or Shift+F10 opens its menu. A playlist the
 *  member may add to lights up under a dragged track and takes it. With
 *  `dragSource`, the row itself can be dragged onto a rail folder. */
export function StudioRailPlaylistRow({
  row,
  isActive,
  isCompact = false,
  isBusy = false,
  onOpenMenu,
  dragSource,
}: {
  row: StudioRailPlaylistRowModel;
  isActive: boolean;
  isCompact?: boolean;
  /** Edit details is reading this playlist. */
  isBusy?: boolean;
  onOpenMenu: (point: StudioContextMenuPoint) => void;
  /** Makes the row draggable onto a folder (StudioRailFolder.drag). */
  dragSource?: StudioPlaylistDragSource;
}) {
  const { t } = useTranslation();
  const contextMenu = useStudioContextMenu(onOpenMenu);
  const drop = useStudioRailDrop(row);
  const isRowBusy = drop.isAdding || isBusy;
  const owner = row.ownerName ?? t("studio:railPlaylists.savedFallback");
  const collabNote = row.isCollaborative
    ? `${t("studio:playlist.collab.chip")}, `
    : "";
  return (
    <Tooltip label={row.name} placement="right" isDisabled={!isCompact}>
      <Link
        to={row.href}
        className={css.row}
        data-compact={isCompact || undefined}
        aria-current={isActive ? "page" : undefined}
        aria-keyshortcuts="Shift+F10"
        aria-busy={isRowBusy || undefined}
        title={isCompact ? undefined : row.name}
        data-drop-over={drop.isOver || undefined}
        {...contextMenu}
        {...(drop.handlers ?? {})}
        {...(dragSource ?? {})}
      >
        <StudioRailRowBody
          isCompact={isCompact}
          name={row.name}
          spokenMeta={`${collabNote}${owner}`}
          cover={
            <StudioRailCoverArt
              coverUrls={row.coverUrls}
              tint={row.tint}
              fallbackIcon={<FiMusic />}
            />
          }
          meta={
            <>
              {row.isCollaborative && (
                <>
                  <FiUsers aria-hidden />
                  <span className="visuallyHidden">{collabNote}</span>
                </>
              )}
              <span className={css.metaText}>{owner}</span>
            </>
          }
        />
        <RowBusy isBusy={isRowBusy} />
      </Link>
    </Tooltip>
  );
}
