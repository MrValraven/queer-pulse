import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { useToast } from "../../shared/components/feedback/useToast";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  studioPlaylistFolderErrorKeyOf,
  useDeleteStudioPlaylistFolder,
  type StudioPlaylistFolderView,
} from "./api/useStudioPlaylistFolders";
import { StudioMenu } from "./kit/StudioMenu";
import type { StudioContextMenuPoint } from "./kit/useStudioContextMenu";
import { useStudioFolderMenuItems } from "./StudioRailFolder.menuItems";

/** Where a folder's context menu opened, and for which folder. */
export interface StudioRailFolderMenuTarget {
  folder: StudioPlaylistFolderView;
  point: StudioContextMenuPoint;
}

/** Asks before deleting a folder, and says its playlists stay. */
export function StudioFolderDeleteConfirm({
  folder,
  onClose,
}: {
  folder: StudioPlaylistFolderView;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const remove = useDeleteStudioPlaylistFolder();
  return (
    <ConfirmDialog
      open
      onClose={() => {
        if (!remove.isPending) onClose();
      }}
      onConfirm={() => {
        if (remove.isPending) return;
        remove.mutate(
          { folderId: folder.id },
          {
            onSuccess: () => {
              onClose();
              showToast(
                t("studio:playlistFolders.delete.deletedToast", {
                  name: folder.name,
                }),
                "success",
              );
            },
            onError: (error) => {
              onClose();
              showToast(t(studioPlaylistFolderErrorKeyOf(error)), "error");
            },
          },
        );
      }}
      loading={remove.isPending}
      tone="destructive"
      title={t("studio:playlistFolders.delete.title", { name: folder.name })}
      description={t("studio:playlistFolders.delete.body")}
      confirmLabel={t("studio:playlistFolders.delete.confirmCta")}
    />
  );
}

/**
 * The rail folders' one context menu and its delete confirmation, which
 * outlives the menu. Rename puts the name in an edit field in place.
 */
export function StudioRailFolderMenu({
  target,
  onRename,
  onClose,
}: {
  target: StudioRailFolderMenuTarget | null;
  onRename: (folder: StudioPlaylistFolderView) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState<StudioPlaylistFolderView | null>(
    null,
  );
  const items = useStudioFolderMenuItems(target?.folder ?? null, {
    onRename,
    onDelete: setDeleting,
  });
  return (
    <>
      <StudioMenu
        trigger={null}
        label={t("studio:playlistFolders.menu.label", {
          name: target?.folder.name ?? "",
        })}
        items={items}
        anchorPoint={target?.point ?? null}
        onOpenChange={(isOpen) => {
          if (!isOpen) onClose();
        }}
      />
      <AnimatePresence>
        {deleting && (
          <StudioFolderDeleteConfirm
            key="delete"
            folder={deleting}
            onClose={() => setDeleting(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
