import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Collapse, ConfirmDialog } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  StudioPlaylistInviteView,
  StudioPlaylistView,
} from "./api/studio.adapters";
import { useStudioPlaylist } from "./api/useStudioPlaylist";
import { useDeleteStudioPlaylist } from "./api/useStudioPlaylistMutations";
import { StudioStickyHeader } from "./kit/StudioStickyHeader";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import { StudioLoadError, StudioNotFound } from "./StudioLoadStates";
import { studioLibraryPath } from "./studioPaths";
import {
  StudioPlaylistDialog,
  type StudioPlaylistDialogMode,
} from "./StudioPlaylistDialog";
import { StudioPlaylistEditorsSheet } from "./StudioPlaylistEditorsSheet";
import { StudioPlaylistCover } from "./StudioPlaylistCover";
import { StudioPlaylistEntries } from "./StudioPlaylistEntries";
import { StudioPlaylistPlayButton } from "./StudioPlaylistPlayButton";
import { StudioPlaylistHero } from "./StudioPlaylistHero";
import { StudioPlaylistInviteBanner } from "./StudioPlaylistInviteBanner";
import { StudioPlaylistLeaveConfirm } from "./StudioPlaylistLeaveConfirm";
import type { StudioPlaylistOwnerAction } from "./StudioPlaylistOwnerMenu";
import { StudioShell } from "./StudioShell";
import { StudioHeroSkeleton, StudioTracklistSkeleton } from "./StudioSkeletons";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";

/** After Accept, focus leaves the folding banner for the hero's "Playlist
 *  actions" trigger once the editor's menu mounts. When the page settles on
 *  a view with no menu, the page heading takes focus. */
function useFocusAfterAccept(playlist: StudioPlaylistView) {
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const [acceptCount, setAcceptCount] = useState(0);
  const handledAcceptCountRef = useRef(0);
  const isInviteShown = playlist.invite !== null;

  useEffect(() => {
    if (acceptCount === handledAcceptCountRef.current) return;
    const trigger = actionsMenuRef.current?.querySelector<HTMLButtonElement>(
      'button[aria-haspopup="menu"]',
    );
    if (trigger) {
      handledAcceptCountRef.current = acceptCount;
      trigger.focus();
      return;
    }
    // Still the invitee's view: the accepted playlist has yet to render.
    if (isInviteShown) return;
    handledAcceptCountRef.current = acceptCount;
    // StudioDetailHero renders the h1, so it is found from the name inside
    // it and made focusable by script only.
    const heading = titleRef.current?.closest("h1");
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus();
  }, [acceptCount, isInviteShown, playlist.hasEditRights]);

  return {
    actionsMenuRef,
    titleRef,
    onAccepted: () => setAcceptCount((count) => count + 1),
  };
}

function StudioPlaylistBody({ playlist }: { playlist: StudioPlaylistView }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const remove = useDeleteStudioPlaylist();
  const acceptFocus = useFocusAfterAccept(playlist);
  const [dialogMode, setDialogMode] = useState<StudioPlaylistDialogMode | null>(
    null,
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditorsOpen, setIsEditorsOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [sentinel, setSentinel] = useState<Element | null>(null);
  // The banner keeps the last invite while it folds away after Accept.
  const [shownInvite, setShownInvite] =
    useState<StudioPlaylistInviteView | null>(playlist.invite);
  if (playlist.invite && playlist.invite !== shownInvite)
    setShownInvite(playlist.invite);
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

  function runPlaylistAction(action: StudioPlaylistOwnerAction) {
    if (action === "delete") setIsDeleteOpen(true);
    else if (action === "leave") setIsLeaveOpen(true);
    else if (action === "manageEditors") setIsEditorsOpen(true);
    else setDialogMode(action);
  }

  // A poll can take rights away while a dialog is open. The details dialog
  // stays open for an editor only in edit mode, and only the owner keeps the
  // other modes. Leave belongs to an editor. A closed gate also clears its
  // state, so the dialog cannot come back when the rights return.
  const isDialogAllowed =
    dialogMode === "edit" ? playlist.hasEditRights : playlist.isOwner;
  const isLeaveAllowed = playlist.role === "editor";
  if (dialogMode && !isDialogAllowed) setDialogMode(null);
  if (isLeaveOpen && !isLeaveAllowed) setIsLeaveOpen(false);

  return (
    <>
      <StudioStickyHeader
        sentinel={sentinel}
        title={playlist.name}
        tint={playlist.tint}
        actions={<StudioPlaylistPlayButton playlist={playlist} size="row" />}
        cover={
          <StudioPlaylistCover
            coverUrls={playlist.coverUrls}
            tint={playlist.tint}
            label=""
            radius={6}
          />
        }
      />
      <Collapse isOpen={playlist.invite !== null}>
        {shownInvite && (
          <StudioPlaylistInviteBanner
            playlist={playlist}
            invite={shownInvite}
            onAccepted={acceptFocus.onAccepted}
          />
        )}
      </Collapse>
      <StudioPlaylistHero
        playlist={playlist}
        onOwnerAction={runPlaylistAction}
        onOpenEditors={() => setIsEditorsOpen(true)}
        actionsMenuRef={acceptFocus.actionsMenuRef}
        titleRef={acceptFocus.titleRef}
        sentinelRef={setSentinel}
      />
      <StudioPlaylistEntries playlist={playlist} />
      <AnimatePresence>
        {dialogMode && isDialogAllowed && (
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
        {isEditorsOpen && playlist.hasEditRights && (
          <StudioPlaylistEditorsSheet
            key="editors"
            playlist={playlist}
            onClose={() => setIsEditorsOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isLeaveOpen && isLeaveAllowed && (
          <StudioPlaylistLeaveConfirm
            key="leave"
            playlist={playlist}
            onClose={() => setIsLeaveOpen(false)}
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
 *  whether it exists. An invitee sees the playlist read only, under the
 *  invite banner. */
export function StudioCollectionPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { playlist, loadState } = useStudioPlaylist(searchParams.get("id"));
  useStudioDocumentTitle(playlist?.name);
  let body: ReactNode;
  if (loadState.isNotFound) body = <StudioNotFound />;
  else if (loadState.isError)
    body = (
      <StudioLoadError
        loadState={loadState}
        what="studio:errors.what.playlist"
      />
    );
  else if (!playlist)
    body = (
      <>
        <StudioHeroSkeleton label={t("studio:playlist.page.loadingLabel")} />
        <StudioTracklistSkeleton
          label={t("studio:playlist.page.loadingLabel")}
        />
      </>
    );
  else body = <StudioPlaylistBody key={playlist.id} playlist={playlist} />;
  return <StudioShell>{body}</StudioShell>;
}
