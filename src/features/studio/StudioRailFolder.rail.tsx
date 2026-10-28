import { useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  studioPlaylistFolderErrorKeyOf,
  useRenameStudioPlaylistFolder,
  useStudioPlaylistFolders,
  type StudioPlaylistFolderView,
} from "./api/useStudioPlaylistFolders";
import { StudioPlaylistFolderDialog } from "./StudioPlaylistFolderDialog";
import type { StudioRailFolderProps } from "./StudioRailFolder";
import {
  studioPlaylistDragSource,
  type StudioPlaylistDragSource,
} from "./StudioRailFolder.drag";
import {
  useStudioRailFolderFiling,
  type StudioRailFolderFiling,
} from "./StudioRailFolder.filing";
import {
  endRailFolderRename,
  setRailFolderExpanded,
  startRailFolderRename,
  useStudioRailFolderState,
} from "./StudioRailFolder.state";
import {
  StudioRailFolderMenu,
  type StudioRailFolderMenuTarget,
} from "./StudioRailFolderMenu";
import {
  isRailPlaylistRow,
  type StudioRailPlaylistRowModel,
  type StudioRailRowModel,
} from "./studioRailPlaylistRows";

type FolderGroupProps = Omit<StudioRailFolderProps, "renderRow" | "isCompact">;

export interface StudioRailFolders {
  /** One entry per folder to show, in the member's order. */
  groups: FolderGroupProps[];
  /** The shown rows that sit in no folder, liked releases among them. */
  looseRows: StudioRailRowModel[];
  /** Some filed playlist is on a page the rail has not read yet. */
  hasUnreadFiledPlaylists: boolean;
  filing: StudioRailFolderFiling;
  /** Spread on a row's link so it can be dragged onto a folder. Undefined
   *  on touch, where a long-press opens the row's menu instead and Move to
   *  folder files it. */
  dragSourceOf: (
    row: StudioRailPlaylistRowModel,
  ) => StudioPlaylistDragSource | undefined;
  /** A filed playlist is being dragged: the move-out strip shows. */
  isMoveOutShown: boolean;
  onDropOut: (playlistId: string) => void;
  /** The folder menu and the filing dialogs. */
  overlays: ReactNode;
}

/**
 * The rail's folders over its rows. `shownRows` are the rows after the
 * rail's sort and filter, so a folder lists its playlists in the same order
 * as the top level. While a filter runs, a folder shows only when one of
 * its playlists matches, and it stands open. Otherwise a folder is open
 * when the member opened it, or, until they close it, when it holds the
 * open playlist. Folded, the rail is too narrow to rename in place, so
 * Rename folder opens a dialog instead. Folders hold playlists alone (the
 * folder store keys by playlist id), so a liked release always sits loose.
 */
export function useStudioRailFolders({
  rows,
  shownRows,
  isFiltering,
  openPlaylistId,
  isCompact,
}: {
  rows: StudioRailRowModel[];
  shownRows: StudioRailRowModel[];
  isFiltering: boolean;
  openPlaylistId: string | null;
  isCompact: boolean;
}): StudioRailFolders {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { folders, folderIdByPlaylistId } = useStudioPlaylistFolders();
  const folderState = useStudioRailFolderState();
  const rename = useRenameStudioPlaylistFolder();
  const isFinePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const { filing, dialogs } = useStudioRailFolderFiling(
    folders,
    folderIdByPlaylistId,
  );
  const [menuTarget, setMenuTarget] =
    useState<StudioRailFolderMenuTarget | null>(null);
  const [draggedPlaylistId, setDraggedPlaylistId] = useState<string | null>(
    null,
  );
  const [renameDialogFolder, setRenameDialogFolder] =
    useState<StudioPlaylistFolderView | null>(null);
  const playlistRows = rows.filter(isRailPlaylistRow);
  const shownPlaylistRows = shownRows.filter(isRailPlaylistRow);
  const rowOf = (playlistId: string) =>
    playlistRows.find((row) => row.playlistId === playlistId);
  const fileRow = (playlistId: string, folderId: string | null) => {
    const row = rowOf(playlistId);
    if (row) filing.moveToFolder({ playlistId, name: row.name }, folderId);
  };
  const isExpandedOf = (folder: StudioPlaylistFolderView) =>
    isFiltering ||
    (folderState.toggled.get(folder.id) ??
      (openPlaylistId !== null && folder.playlistIds.includes(openPlaylistId)));

  const groups: FolderGroupProps[] = [];
  for (const folder of folders) {
    const folderRows = shownPlaylistRows.filter(
      (row) => folderIdByPlaylistId.get(row.playlistId) === folder.id,
    );
    if (isFiltering && folderRows.length === 0) continue;
    groups.push({
      folder,
      rows: folderRows,
      isExpanded: isExpandedOf(folder),
      isRenaming: folderState.renamingFolderId === folder.id,
      onToggle: (isExpanded) => setRailFolderExpanded(folder.id, isExpanded),
      onOpenMenu: (point) => setMenuTarget({ folder, point }),
      onRenameStart: () => startRailFolderRename(folder.id),
      onRename: (name) =>
        rename.mutate(
          { folderId: folder.id, name },
          {
            onError: (error) =>
              showToast(t(studioPlaylistFolderErrorKeyOf(error)), "error"),
          },
        ),
      onRenameEnd: endRailFolderRename,
      onDropPlaylist: (playlistId) => fileRow(playlistId, folder.id),
    });
  }
  const readIds = new Set(playlistRows.map((row) => row.playlistId));
  return {
    groups,
    looseRows: shownRows.filter(
      (row) =>
        !isRailPlaylistRow(row) || !folderIdByPlaylistId.has(row.playlistId),
    ),
    hasUnreadFiledPlaylists: [...folderIdByPlaylistId.keys()].some(
      (playlistId) => !readIds.has(playlistId),
    ),
    filing,
    dragSourceOf: (row) =>
      isFinePointer
        ? studioPlaylistDragSource(row.playlistId, setDraggedPlaylistId)
        : undefined,
    isMoveOutShown:
      draggedPlaylistId !== null && folderIdByPlaylistId.has(draggedPlaylistId),
    onDropOut: (playlistId) => fileRow(playlistId, null),
    overlays: (
      <>
        <StudioRailFolderMenu
          target={menuTarget}
          onRename={(folder) => {
            if (isCompact) setRenameDialogFolder(folder);
            else startRailFolderRename(folder.id);
          }}
          onClose={() => setMenuTarget(null)}
        />
        {dialogs}
        <AnimatePresence>
          {renameDialogFolder && (
            <StudioPlaylistFolderDialog
              key="rename"
              mode="rename"
              folder={renameDialogFolder}
              onClose={() => setRenameDialogFolder(null)}
            />
          )}
        </AnimatePresence>
      </>
    ),
  };
}
