import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistView } from "./api/studio.adapters";
import { useLeaveStudioPlaylist } from "./api/useStudioPlaylistEditorMutations";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import { studioLibraryPath } from "./studioPaths";

/** "Leave playlist" for an editor. The tracks they added stay. Once the
 *  server agrees, the page leaves for the library before any render reads
 *  the playlist again, and the confirm stays busy until then. Mount inside
 *  AnimatePresence. */
export function StudioPlaylistLeaveConfirm({
  playlist,
  onClose,
}: {
  playlist: StudioPlaylistView;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const leave = useLeaveStudioPlaylist();
  const isLeavingRef = useRef(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const isBusy = leave.isPending || isLeaving;

  function confirmLeave() {
    if (leave.isPending || isLeavingRef.current) return;
    leave.mutate(
      { playlistId: playlist.id },
      {
        onSuccess: () => {
          isLeavingRef.current = true;
          setIsLeaving(true);
          void navigate(studioLibraryPath(), { replace: true });
          showToast(
            t("studio:playlist.leave.leftToast", { name: playlist.name }),
            "success",
          );
        },
        onError: (error) => {
          onClose();
          showToast(t(studioErrorMessageKeyOf(error)), "error");
        },
      },
    );
  }

  return (
    <ConfirmDialog
      open
      tone="destructive"
      loading={isBusy}
      title={t("studio:playlist.leave.title", { name: playlist.name })}
      description={t("studio:playlist.leave.body")}
      confirmLabel={t("studio:playlist.leave.confirmCta")}
      onClose={() => {
        if (!isBusy) onClose();
      }}
      onConfirm={confirmLeave}
    />
  );
}
