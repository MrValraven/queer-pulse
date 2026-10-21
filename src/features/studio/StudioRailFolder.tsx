import { useCallback, useId, useRef, type ReactNode } from "react";
import { AnimatePresence, m } from "motion/react";
import { FiCornerLeftUp } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { Collapse, CollapseListItem } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistFolderView } from "./api/useStudioPlaylistFolders";
import type { StudioContextMenuPoint } from "./kit/useStudioContextMenu";
import { useStudioPlaylistDrop } from "./StudioRailFolder.drag";
import {
  StudioRailFolderHead,
  StudioRailFolderRenameField,
} from "./StudioRailFolderHead";
import type { StudioRailPlaylistRowModel } from "./studioRailPlaylistRows";
import { STUDIO_EXIT, STUDIO_FADE } from "./studioMotion";
import css from "./StudioRailFolder.module.css";

export interface StudioRailFolderProps {
  folder: StudioPlaylistFolderView;
  /** The folder's playlists as the rail shows them (sorted, filtered). */
  rows: StudioRailPlaylistRowModel[];
  isExpanded: boolean;
  isCompact: boolean;
  isRenaming: boolean;
  onToggle: (isExpanded: boolean) => void;
  onOpenMenu: (point: StudioContextMenuPoint) => void;
  onRenameStart: () => void;
  onRename: (name: string) => void;
  onRenameEnd: () => void;
  onDropPlaylist: (playlistId: string) => void;
  renderRow: (row: StudioRailPlaylistRowModel) => ReactNode;
}

/** While a filed playlist is dragged, a strip under the rows takes it back
 *  out of its folder. It folds in and out with Collapse. Folded, the rail
 *  shows the icon alone and keeps the words for screen readers. */
export function StudioRailFolderMoveOut({
  isOpen,
  isCompact = false,
  onDropPlaylist,
}: {
  isOpen: boolean;
  isCompact?: boolean;
  onDropPlaylist: (playlistId: string) => void;
}) {
  const { t } = useTranslation();
  const drop = useStudioPlaylistDrop(onDropPlaylist);
  return (
    <Collapse isOpen={isOpen}>
      <div
        className={css.moveOut}
        data-compact={isCompact || undefined}
        data-drop-over={drop.isOver || undefined}
        {...drop.handlers}
      >
        <FiCornerLeftUp aria-hidden />
        <span className={isCompact ? "visuallyHidden" : undefined}>
          {t("studio:playlistFolders.moveOutDropHint")}
        </span>
      </div>
    </Collapse>
  );
}

/**
 * One rail folder: its head, then its playlists, which open and close with
 * Collapse and come and go one row at a time. Renaming swaps the head for an
 * edit field in place, with a short crossfade, and focus returns to the head
 * once it is done. An open folder with nothing in it says how to fill it.
 */
export function StudioRailFolder({
  folder,
  rows,
  isExpanded,
  isCompact,
  isRenaming,
  onToggle,
  onOpenMenu,
  onRenameStart,
  onRename,
  onRenameEnd,
  onDropPlaylist,
  renderRow,
}: StudioRailFolderProps) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const listId = useId();
  // Set when a rename ends by Enter, Escape or a blur to nowhere: the head
  // takes focus as it mounts again, after the crossfade.
  const shouldFocusHeadRef = useRef(false);
  const attachHead = useCallback((head: HTMLButtonElement | null) => {
    if (!head || !shouldFocusHeadRef.current) return;
    shouldFocusHeadRef.current = false;
    head.focus();
  }, []);
  const drop = useStudioPlaylistDrop(onDropPlaylist);
  const isRenameShown = isRenaming && !isCompact;
  const fade = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: reducedMotion ? { duration: 0 } : STUDIO_FADE,
    },
    exit: {
      opacity: 0,
      transition: reducedMotion ? { duration: 0 } : STUDIO_EXIT,
    },
  };
  return (
    <div className={css.folder} data-compact={isCompact || undefined}>
      <AnimatePresence initial={false} mode="wait">
        {isRenameShown ? (
          <m.div key="rename" {...fade}>
            <StudioRailFolderRenameField
              name={folder.name}
              onCommit={(name, shouldReturnFocus) => {
                shouldFocusHeadRef.current = shouldReturnFocus;
                onRename(name);
                onRenameEnd();
              }}
              onCancel={(shouldReturnFocus) => {
                shouldFocusHeadRef.current = shouldReturnFocus;
                onRenameEnd();
              }}
            />
          </m.div>
        ) : (
          <m.div key="head" className={css.headWrap} {...fade}>
            <StudioRailFolderHead
              headRef={attachHead}
              name={folder.name}
              playlistCount={rows.length}
              listId={listId}
              isExpanded={isExpanded}
              isCompact={isCompact}
              isDropOver={drop.isOver}
              dropHandlers={drop.handlers}
              onToggle={onToggle}
              onOpenMenu={onOpenMenu}
              onRenameStart={onRenameStart}
            />
          </m.div>
        )}
      </AnimatePresence>
      <Collapse isOpen={isExpanded}>
        <ul
          id={listId}
          className={css.list}
          aria-label={t("studio:playlistFolders.listLabel", {
            name: folder.name,
          })}
        >
          <AnimatePresence initial={false}>
            {rows.map((row) => (
              <CollapseListItem key={row.key}>
                {renderRow(row)}
              </CollapseListItem>
            ))}
          </AnimatePresence>
        </ul>
        <Collapse isOpen={rows.length === 0 && !isCompact}>
          <p className={css.empty}>{t("studio:playlistFolders.emptyHint")}</p>
        </Collapse>
      </Collapse>
    </div>
  );
}
