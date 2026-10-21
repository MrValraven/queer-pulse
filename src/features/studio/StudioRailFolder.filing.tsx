import { createContext, useContext, useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { FiCornerLeftUp, FiFolder, FiFolderPlus } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import type { TFunction } from "../../shared/i18n/types";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  studioPlaylistFolderErrorKeyOf,
  useMoveStudioPlaylistToFolder,
  type StudioPlaylistFolderView,
} from "./api/useStudioPlaylistFolders";
import type { StudioMenuItem } from "./kit/StudioMenu";
import {
  StudioPlaylistFolderDialog,
  type StudioFolderPlaylistRef,
} from "./StudioPlaylistFolderDialog";

/** What a rail playlist's menu needs to file the playlist in a folder. */
export interface StudioRailFolderFiling {
  /** The name of the folder the playlist sits in, or null at the top. */
  folderNameOf: (playlistId: string) => string | null;
  /** The member has a folder the playlist is not already in. */
  hasOtherFolderFor: (playlistId: string) => boolean;
  requestMove: (playlist: StudioFolderPlaylistRef) => void;
  requestNewFolder: (playlist: StudioFolderPlaylistRef) => void;
  moveToFolder: (
    playlist: StudioFolderPlaylistRef,
    folderId: string | null,
  ) => void;
}

const StudioRailFolderFilingContext =
  createContext<StudioRailFolderFiling | null>(null);

export const StudioRailFolderFilingProvider =
  StudioRailFolderFilingContext.Provider;

/** Null outside the rail list, so the menu leaves the folder items out. */
export const useStudioRailFolderFilingContext = () =>
  useContext(StudioRailFolderFilingContext);

/** A rail playlist menu's folder group: Move to folder (when another
 *  folder exists), Move to new folder, and Remove from {folder} for a filed
 *  playlist. The keyboard path for everything a drag does. */
export function studioRailFolderMenuItems(
  playlist: StudioFolderPlaylistRef,
  filing: StudioRailFolderFiling,
  translate: TFunction,
): StudioMenuItem[] {
  const items: StudioMenuItem[] = [];
  if (filing.hasOtherFolderFor(playlist.playlistId))
    items.push({
      id: "moveToFolder",
      label: translate("studio:playlistFolders.menu.moveToFolder"),
      icon: <FiFolder />,
      onSelect: () => filing.requestMove(playlist),
    });
  items.push({
    id: "moveToNewFolder",
    label: translate("studio:playlistFolders.menu.moveToNewFolder"),
    icon: <FiFolderPlus />,
    onSelect: () => filing.requestNewFolder(playlist),
  });
  const folderName = filing.folderNameOf(playlist.playlistId);
  if (folderName !== null)
    items.push({
      id: "removeFromFolder",
      label: translate("studio:playlistFolders.menu.removeFromFolder", {
        name: folderName,
      }),
      icon: <FiCornerLeftUp />,
      onSelect: () => filing.moveToFolder(playlist, null),
    });
  return items;
}

type FilingDialog =
  | { mode: "move"; playlist: StudioFolderPlaylistRef }
  | { mode: "create"; playlist: StudioFolderPlaylistRef };

/**
 * Filing for the rail: a move that lands at once with "Moved to {folder}"
 * and an Undo that puts the playlist back where it was, a refusal that says
 * why, and the Move to folder and Move to new folder dialogs.
 */
export function useStudioRailFolderFiling(
  folders: StudioPlaylistFolderView[],
  folderIdByPlaylistId: ReadonlyMap<string, string>,
): { filing: StudioRailFolderFiling; dialogs: ReactNode } {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const move = useMoveStudioPlaylistToFolder();
  const [dialog, setDialog] = useState<FilingDialog | null>(null);
  const nameOf = (folderId: string | null) =>
    folders.find((folder) => folder.id === folderId)?.name ?? null;

  const moveToFolder: StudioRailFolderFiling["moveToFolder"] = (
    playlist,
    folderId,
  ) => {
    const previousFolderId = folderIdByPlaylistId.get(playlist.playlistId);
    if ((previousFolderId ?? null) === folderId) return;
    const folderName = nameOf(folderId);
    const undo = () =>
      move.mutate(
        {
          playlistId: playlist.playlistId,
          folderId: previousFolderId ?? null,
        },
        {
          onError: (error) =>
            showToast(t(studioPlaylistFolderErrorKeyOf(error)), "error"),
        },
      );
    move.mutate(
      { playlistId: playlist.playlistId, folderId },
      {
        onSuccess: () =>
          showToast(
            folderName
              ? t("studio:playlistFolders.move.movedToast", {
                  playlist: playlist.name,
                  folder: folderName,
                })
              : t("studio:playlistFolders.move.movedOutToast", {
                  playlist: playlist.name,
                }),
            "success",
            undefined,
            { label: t("studio:libraryLive.undoCta"), onClick: undo },
          ),
        onError: (error) =>
          showToast(t(studioPlaylistFolderErrorKeyOf(error)), "error"),
      },
    );
  };

  const filing: StudioRailFolderFiling = {
    folderNameOf: (playlistId) =>
      nameOf(folderIdByPlaylistId.get(playlistId) ?? null),
    hasOtherFolderFor: (playlistId) =>
      folders.some(
        (folder) => folder.id !== folderIdByPlaylistId.get(playlistId),
      ),
    requestMove: (playlist) => setDialog({ mode: "move", playlist }),
    requestNewFolder: (playlist) => setDialog({ mode: "create", playlist }),
    moveToFolder,
  };
  const close = () => setDialog(null);
  const dialogs = (
    <AnimatePresence>
      {dialog && (
        <StudioPlaylistFolderDialog
          key={dialog.mode}
          {...dialog}
          onClose={close}
        />
      )}
    </AnimatePresence>
  );
  return { filing, dialogs };
}
