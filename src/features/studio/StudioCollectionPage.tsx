import { useRef, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioPlaylistView } from "./api/studio.adapters";
import { useStudioPlaylist } from "./api/useStudioPlaylist";
import { useDeleteStudioPlaylist } from "./api/useStudioPlaylistMutations";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import {
  StudioDetailSkeleton,
  StudioLoadError,
  StudioNotFound,
} from "./StudioLoadStates";
import { studioLibraryPath } from "./studioPaths";
import {
  StudioPlaylistDialog,
  type StudioPlaylistDialogMode,
} from "./StudioPlaylistDialog";
import { StudioPlaylistEntries } from "./StudioPlaylistEntries";
import { StudioPlaylistHero } from "./StudioPlaylistHero";
import { StudioShell } from "./StudioShell";

function StudioPlaylistBody({ playlist }: { playlist: StudioPlaylistView }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const remove = useDeleteStudioPlaylist();
  const [dialogMode, setDialogMode] = useState<StudioPlaylistDialogMode | null>(
    null,
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  // Set once the delete succeeds: the confirm stays busy until the route
  // changes, so a second press cannot send a request that answers 404.
  const isLeavingRef = useRef(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const isDeleteBusy = remove.isPending || isLeaving;

  function deletePlaylist() {
    if (remove.isPending || isLeavingRef.current) return;
    remove.mutate(
      { playlistId: playlist.id },
      {
        // The hook has already dropped the playlist's query. Leaving in this
        // callback, ahead of any render, keeps the page from reading the
        // deleted playlist again, and the confirm stays open until then.
        onSuccess: () => {
          isLeavingRef.current = true;
          setIsLeaving(true);
          void navigate(studioLibraryPath(), { replace: true });
          showToast(t("studio:playlist.delete.deletedToast"), "success");
        },
        onError: (error) => {
          setIsDeleteOpen(false);
          showToast(t(studioErrorMessageKeyOf(error)), "error");
        },
      },
    );
  }

  return (
    <>
      <StudioPlaylistHero
        playlist={playlist}
        onOwnerAction={(action) => {
          if (action === "delete") setIsDeleteOpen(true);
          else setDialogMode(action);
        }}
      />
      <StudioPlaylistEntries playlist={playlist} />
      <AnimatePresence>
        {dialogMode && (
          <StudioPlaylistDialog
            key={dialogMode}
            mode={dialogMode}
            playlist={playlist}
            onClose={() => setDialogMode(null)}
            onSaved={() => setDialogMode(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isDeleteOpen && (
          <ConfirmDialog
            key="delete"
            open
            onClose={() => {
              if (!isDeleteBusy) setIsDeleteOpen(false);
            }}
            onConfirm={deletePlaylist}
            loading={isDeleteBusy}
            tone="destructive"
            title={t("studio:playlist.delete.title", { name: playlist.name })}
            description={t("studio:playlist.delete.body")}
            confirmLabel={t("studio:playlist.delete.confirmCta")}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/** The playlist page at /studio/collection?id= (Studio v2). A playlist the
 *  viewer may not see reads as the Studio not-found state, which never says
 *  whether it exists. */
export function StudioCollectionPage() {
  const [searchParams] = useSearchParams();
  const { playlist, loadState } = useStudioPlaylist(searchParams.get("id"));
  let body: ReactNode;
  if (loadState.isNotFound) body = <StudioNotFound />;
  else if (loadState.isError) body = <StudioLoadError loadState={loadState} />;
  else if (!playlist) body = <StudioDetailSkeleton />;
  else body = <StudioPlaylistBody key={playlist.id} playlist={playlist} />;
  return <StudioShell>{body}</StudioShell>;
}
