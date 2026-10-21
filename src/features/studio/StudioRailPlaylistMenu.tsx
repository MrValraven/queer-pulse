import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSaved, type SavedItem } from "../../app/providers/useSaved";
import { useToast } from "../../shared/components/feedback/useToast";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistView } from "./api/studio.adapters";
import { studioPlaylistQueryOptions } from "./api/useStudioPlaylist";
import { useDeleteStudioPlaylist } from "./api/useStudioPlaylistMutations";
import { StudioMenu } from "./kit/StudioMenu";
import { StudioShareToChatModal } from "./share/StudioShareToChatModal";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import { studioLibraryPath } from "./studioPaths";
import { StudioPlaylistDialog } from "./StudioPlaylistDialog";
import type { StudioRailPlaylistRowModel } from "./studioRailPlaylistRows";
import { studioReasonCopyKey, studioReasonOf } from "./studioReason";
import {
  railPlaylistTargetOf,
  useStudioRailPlaylistMenuItems,
} from "./useStudioRailPlaylistMenuItems";

/** Where a rail row's context menu opened, and for which row. */
export interface StudioRailMenuTarget {
  row: StudioRailPlaylistRowModel;
  point: { x: number; y: number };
}

type RailDialog =
  | { kind: "edit"; playlist: StudioPlaylistView }
  | { kind: "send" | "delete"; row: StudioRailPlaylistRowModel };

function RailDeleteConfirm({
  row,
  isOpenPlaylist,
  onClose,
}: {
  row: StudioRailPlaylistRowModel;
  isOpenPlaylist: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const remove = useDeleteStudioPlaylist();
  return (
    <ConfirmDialog
      open
      onClose={() => {
        if (!remove.isPending) onClose();
      }}
      onConfirm={() => {
        if (remove.isPending) return;
        remove.mutate(
          { playlistId: row.playlistId },
          {
            onSuccess: () => {
              onClose();
              // The open playlist is gone: Library takes its place.
              if (isOpenPlaylist)
                void navigate(studioLibraryPath(), { replace: true });
              showToast(t("studio:playlist.delete.deletedToast"), "success");
            },
            onError: (error) => {
              onClose();
              showToast(t(studioErrorMessageKeyOf(error)), "error");
            },
          },
        );
      }}
      loading={remove.isPending}
      tone="destructive"
      title={t("studio:playlist.delete.title", { name: row.name })}
      description={t("studio:playlist.delete.body")}
      confirmLabel={t("studio:playlist.delete.confirmCta")}
    />
  );
}

/**
 * The rail rows' one context menu (right-click, long-press, the Menu key or
 * Shift+F10 on a row) and the dialogs it opens. The dialogs outlive the
 * menu. Edit details reads the playlist first (a cached read is used as
 * is): the row shows it is busy meanwhile, and a read that fails says why.
 * Undo after Remove from Library puts back the save as it was.
 */
export function StudioRailPlaylistMenu({
  target,
  openPlaylistId,
  savedItems,
  onEditPendingChange,
  onClose,
}: {
  target: StudioRailMenuTarget | null;
  openPlaylistId: string | null;
  /** The saves the rail shows, for an Undo that restores the original. */
  savedItems: SavedItem[];
  /** The playlist whose read for Edit details is under way, or null. */
  onEditPendingChange: (playlistId: string | null) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { unsave, save } = useSaved();
  const { showToast } = useToast();
  const [dialog, setDialog] = useState<RailDialog | null>(null);
  const isEditPendingRef = useRef(false);
  const items = useStudioRailPlaylistMenuItems(target?.row ?? null, {
    onEdit: (row) => {
      if (isEditPendingRef.current) return;
      isEditPendingRef.current = true;
      onEditPendingChange(row.playlistId);
      queryClient
        .fetchQuery(studioPlaylistQueryOptions(demoMode, row.playlistId))
        .then((playlist) => setDialog({ kind: "edit", playlist }))
        .catch((error: unknown) => {
          showToast(
            t(studioReasonCopyKey(studioReasonOf(error), "load")),
            "error",
          );
        })
        .finally(() => {
          isEditPendingRef.current = false;
          onEditPendingChange(null);
        });
    },
    onSend: (row) => setDialog({ kind: "send", row }),
    onDelete: (row) => setDialog({ kind: "delete", row }),
    onUnsave: (row) => {
      const original = savedItems.find((item) => item.id === row.key);
      unsave(row.key);
      showToast(
        t("studio:libraryLive.removedToast", { title: row.name }),
        "info",
        undefined,
        original
          ? {
              label: t("studio:libraryLive.undoCta"),
              onClick: () => save(original),
            }
          : undefined,
      );
    },
  });
  const close = () => setDialog(null);
  return (
    <>
      <StudioMenu
        trigger={null}
        label={t("studio:railPlaylists.menu.label", {
          name: target?.row.name ?? "",
        })}
        items={items}
        anchorPoint={target?.point ?? null}
        onOpenChange={(isOpen) => {
          if (!isOpen) onClose();
        }}
      />
      <AnimatePresence>
        {dialog?.kind === "edit" && (
          <StudioPlaylistDialog
            key="edit"
            mode="edit"
            playlist={dialog.playlist}
            onClose={close}
            onSaved={close}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {dialog?.kind === "send" && (
          <StudioShareToChatModal
            key="send"
            target={railPlaylistTargetOf(dialog.row)}
            title={dialog.row.name}
            onClose={close}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {dialog?.kind === "delete" && (
          <RailDeleteConfirm
            key="delete"
            row={dialog.row}
            isOpenPlaylist={dialog.row.playlistId === openPlaylistId}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </>
  );
}
