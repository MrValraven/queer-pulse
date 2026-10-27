import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import { FiUserPlus } from "react-icons/fi";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import {
  Button,
  Collapse,
  CollapseListItem,
  ConfirmDialog,
  LoadErrorState,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { keepOnFrameLoop } from "../gatherings/checkin/checkinMotion";
import type {
  StudioPlaylistEditorView,
  StudioPlaylistView,
} from "./api/studio.adapters";
import { STUDIO_PLAYLIST_LIMITS } from "./api/studio.types";
import type { StudioPlaylistEditorsResult } from "./api/useStudioPlaylistEditors";
import { useRemoveStudioPlaylistEditor } from "./api/useStudioPlaylistEditorMutations";
import { studioErrorMessageKeyOf } from "./studioErrors.data";
import { StudioPlaylistPersonAvatar } from "./StudioPlaylistPersonAvatar";
import { StudioLine } from "./StudioSkeletons";
import css from "./StudioPlaylistEditors.module.css";

/** One row's name: a profile link when the member has a profile. */
function EditorName({ editor }: { editor: StudioPlaylistEditorView }) {
  const { person } = editor;
  return (
    <span className={css.name}>
      {person.href ? (
        <Link to={person.href} className={css.nameLink}>
          {person.name}
        </Link>
      ) : (
        person.name
      )}
    </span>
  );
}

/** The owner, first in the read-only list: the member the playlist is credited to. */
function OwnerRow({ playlist }: { playlist: StudioPlaylistView }) {
  const { t } = useTranslation();
  const { credit } = playlist;
  const ownerPerson: StudioPlaylistEditorView["person"] = {
    slug: "",
    name: credit.name,
    avatarUrl: credit.avatarUrl,
    initials: credit.initials,
    tint: credit.tint,
    href: credit.href,
  };
  return (
    <li className={css.row}>
      <span className={css.avatar} aria-hidden>
        <StudioPlaylistPersonAvatar person={ownerPerson} size={32} />
      </span>
      <div className={css.identity}>
        <span className={css.name}>
          {credit.href ? (
            <Link to={credit.href} className={css.nameLink}>
              {credit.name}
            </Link>
          ) : (
            credit.name
          )}
        </span>
        <span className={css.badge}>
          {t("studio:playlist.editors.ownerLabel")}
        </span>
      </div>
    </li>
  );
}

/** The name with the "Invite sent" pill under it, so the name keeps the row's width. */
function EditorIdentity({ editor }: { editor: StudioPlaylistEditorView }) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  return (
    <div className={css.identity}>
      <EditorName editor={editor} />
      <AnimatePresence initial={false}>
        {editor.isPending && (
          <m.span
            key="pending"
            className={css.badge}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.18 }}
            onUpdate={keepOnFrameLoop}
          >
            {t("studio:playlist.editors.pendingLabel")}
          </m.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * The active editors (the read-only list opens with the owner), and for the owner the pending invites too. The owner
 * removes an editor after a confirm (their tracks stay) and cancels an
 * invite at once, both by the row's editor id, so a member without a
 * profile row is removable too. Rows fold in and out. Once a row leaves,
 * focus moves to "Invite editors" so the keyboard keeps its place.
 */
export function StudioPlaylistEditorRows({
  playlist,
  editorsResult,
  isOwner,
  onInvite,
}: {
  playlist: StudioPlaylistView;
  editorsResult: StudioPlaylistEditorsResult;
  isOwner: boolean;
  onInvite: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const removeEditor = useRemoveStudioPlaylistEditor();
  const [confirmingEditor, setConfirmingEditor] =
    useState<StudioPlaylistEditorView | null>(null);
  const [busyEditorId, setBusyEditorId] = useState<string | null>(null);
  const inviteButtonRef = useRef<HTMLButtonElement>(null);
  const shouldFocusInviteRef = useRef(false);
  const { editors, loadState } = editorsResult;
  const isReady = !loadState.isLoading && !loadState.isError;
  const isFull = editors.length >= STUDIO_PLAYLIST_LIMITS.editorsMax;

  // Runs once the confirm has started closing, so the sheet under it takes
  // focus again and the confirm hands focus back to this button.
  useEffect(() => {
    if (!shouldFocusInviteRef.current) return;
    if (confirmingEditor !== null || busyEditorId !== null) return;
    shouldFocusInviteRef.current = false;
    inviteButtonRef.current?.focus();
  }, [confirmingEditor, busyEditorId]);

  async function endEditing(editor: StudioPlaylistEditorView) {
    if (busyEditorId !== null) return;
    setBusyEditorId(editor.editorId);
    try {
      await removeEditor.mutateAsync({
        playlistId: playlist.id,
        editorId: editor.editorId,
        memberSlug: editor.person.slug,
      });
      showToast(
        editor.isPending
          ? t("studio:playlist.editors.inviteCancelledToast")
          : t("studio:playlist.editors.removedToast", {
              name: editor.person.name,
            }),
        "success",
      );
      shouldFocusInviteRef.current = true;
    } catch (error) {
      showToast(t(studioErrorMessageKeyOf(error)), "error");
    } finally {
      setBusyEditorId(null);
      setConfirmingEditor(null);
    }
  }

  return (
    <div className={css.panel}>
      <Collapse isOpen={loadState.isLoading}>
        <div
          className={css.skeleton}
          role="status"
          aria-label={t("studio:playlist.editors.loadingLabel")}
        >
          <StudioLine width="60%" height={18} />
          <StudioLine width="45%" height={18} />
        </div>
      </Collapse>
      <Collapse isOpen={loadState.isError}>
        <LoadErrorState
          title={t("studio:playlist.editors.loadError")}
          onRetry={loadState.retry}
          isRetrying={loadState.isRetrying}
          compact
        />
      </Collapse>
      <ul
        className={css.list}
        aria-label={t("studio:playlist.editors.listLabel", {
          name: playlist.name,
        })}
      >
        {!isOwner && playlist.credit.kind === "member" && (
          <OwnerRow playlist={playlist} />
        )}
        <AnimatePresence initial={false}>
          {editors.map((editor) => (
            <CollapseListItem key={editor.editorId}>
              <div className={css.row}>
                <span className={css.avatar} aria-hidden>
                  <StudioPlaylistPersonAvatar
                    person={editor.person}
                    size={32}
                  />
                </span>
                <EditorIdentity editor={editor} />
                {isOwner && (
                  <Button
                    className={css.action}
                    variant="ghost"
                    size="sm"
                    aria-label={t(
                      editor.isPending
                        ? "studio:playlist.editors.cancelInviteAria"
                        : "studio:playlist.editors.removeAria",
                      { name: editor.person.name },
                    )}
                    aria-disabled={busyEditorId !== null || undefined}
                    aria-busy={busyEditorId === editor.editorId || undefined}
                    onClick={() => {
                      if (busyEditorId !== null) return;
                      if (editor.isPending) void endEditing(editor);
                      else setConfirmingEditor(editor);
                    }}
                  >
                    {t(
                      editor.isPending
                        ? "studio:playlist.editors.cancelInviteCta"
                        : "studio:playlist.editors.removeCta",
                    )}
                  </Button>
                )}
              </div>
            </CollapseListItem>
          ))}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={isOwner && isReady && editors.length === 0}>
        <div className={css.empty}>
          <p className={css.emptyTitle}>
            {t("studio:playlist.editors.emptyTitle")}
          </p>
          <p className={css.muted}>{t("studio:playlist.editors.emptyBody")}</p>
        </div>
      </Collapse>
      {isOwner && (
        <div className={css.foot}>
          <p className={css.muted} role="status">
            {t(
              isFull
                ? "studio:playlist.editors.slotsFull"
                : "studio:playlist.editors.slotsUsed",
              {
                count: editors.length,
                max: STUDIO_PLAYLIST_LIMITS.editorsMax,
              },
            )}
          </p>
          <Button
            ref={inviteButtonRef}
            variant="primary"
            aria-disabled={isFull || !isReady || undefined}
            onClick={() => {
              if (!isFull && isReady) onInvite();
            }}
          >
            <FiUserPlus aria-hidden /> {t("studio:playlist.editors.inviteCta")}
          </Button>
        </div>
      )}
      <AnimatePresence>
        {confirmingEditor && (
          <ConfirmDialog
            key="remove-editor"
            open
            tone="destructive"
            loading={busyEditorId !== null}
            title={t("studio:playlist.editors.removeConfirmTitle", {
              name: confirmingEditor.person.name,
            })}
            description={t("studio:playlist.editors.removeConfirmBody")}
            confirmLabel={t("studio:playlist.editors.removeCta")}
            onClose={() => {
              if (busyEditorId === null) setConfirmingEditor(null);
            }}
            onConfirm={() => void endEditing(confirmingEditor)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
