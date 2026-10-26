import { useRef, useState, type ReactNode, type RefObject } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import { FiLink } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSaved } from "../../app/providers/useSaved";
import { useToast } from "../../shared/components/feedback/useToast";
import { useShareLink } from "../../shared/hooks/useClipboard";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistView } from "./api/studio.adapters";
import { studioPlaylistQueryOptions } from "./api/useStudioPlaylist";
import type { StudioMenuItem } from "./kit/StudioMenu";
import { StudioShareToChatModal } from "./share/StudioShareToChatModal";
import { studioLinkUrl } from "./share/studioLinkTarget";
import { StudioPlaylistCardDeleteConfirm } from "./StudioPlaylistCardDeleteConfirm";
import { StudioPlaylistDialog } from "./StudioPlaylistDialog";
import type { StudioRailPlaylistRowModel } from "./studioRailPlaylistRows";
import { studioReasonCopyKey, studioReasonOf } from "./studioReason";
import {
  railPlaylistTargetOf,
  useStudioRailPlaylistMenuItems,
} from "./useStudioRailPlaylistMenuItems";

type CardDialog =
  { kind: "edit"; playlist: StudioPlaylistView } | { kind: "send" | "delete" };

/**
 * A playlist card's long-press and right-click menu, the same items as the
 * rail row's (useStudioRailPlaylistMenuItems), and the dialogs they open.
 * The items read the playlist's share rules, so they are armed on the
 * card's first press or focus (`armProps`): a shelf of cards makes no read
 * until one is touched. Before that the menu holds Copy link alone, which
 * keeps the card's long press wired. `armProps` also hold the card, so
 * focus can move on after Delete playlist. `onUnsave` replaces the default
 * Remove from Library, which offers Undo (the Library grid fades the card
 * out first).
 */
export function useStudioPlaylistCardMenu(
  row: StudioRailPlaylistRowModel,
  onUnsave?: () => void,
): {
  menu: { label: string; items: StudioMenuItem[] };
  armProps: {
    ref: RefObject<HTMLDivElement | null>;
    onPointerDownCapture: () => void;
    onFocusCapture: () => void;
  };
  dialogs: ReactNode;
} {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { unsave, save, items: savedItems } = useSaved();
  const { showToast } = useToast();
  const { share } = useShareLink({
    copied: t("studio:trackMenu.linkCopiedToast"),
    failed: t("studio:detail.copyFailedToast"),
  });
  const anchorRef = useRef<HTMLDivElement>(null);
  const [isArmed, setIsArmed] = useState(false);
  const [dialog, setDialog] = useState<CardDialog | null>(null);
  const armedItems = useStudioRailPlaylistMenuItems(isArmed ? row : null, {
    onEdit: () => {
      queryClient
        .fetchQuery(studioPlaylistQueryOptions(demoMode, row.playlistId))
        .then((playlist) => setDialog({ kind: "edit", playlist }))
        .catch((error: unknown) => {
          showToast(
            t(studioReasonCopyKey(studioReasonOf(error), "load")),
            "error",
          );
        });
    },
    onSend: () => setDialog({ kind: "send" }),
    onDelete: () => setDialog({ kind: "delete" }),
    onUnsave: () => {
      if (onUnsave) onUnsave();
      else {
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
      }
    },
  });
  const items: StudioMenuItem[] = isArmed
    ? armedItems
    : [
        {
          id: "copyLink",
          label: t("studio:trackMenu.copyLink"),
          icon: <FiLink />,
          onSelect: () => void share(studioLinkUrl(railPlaylistTargetOf(row))),
        },
      ];
  const arm = () => setIsArmed(true);
  const close = () => setDialog(null);
  const dialogs = (
    <>
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
            target={railPlaylistTargetOf(row)}
            title={row.name}
            onClose={close}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {dialog?.kind === "delete" && (
          <StudioPlaylistCardDeleteConfirm
            key="delete"
            row={row}
            anchorRef={anchorRef}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </>
  );
  return {
    menu: {
      label: t("studio:railPlaylists.menu.label", { name: row.name }),
      items,
    },
    armProps: {
      ref: anchorRef,
      onPointerDownCapture: arm,
      onFocusCapture: arm,
    },
    dialogs,
  };
}
