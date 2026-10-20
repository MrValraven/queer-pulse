import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  toPlaylistPersonView,
  type StudioPlaylistPersonView,
  type StudioPlaylistView,
} from "./api/studio.adapters";
import type {
  CreateStudioPlaylistBody,
  StudioPlaylistVisibility,
  UpdateStudioPlaylistBody,
} from "./api/studio.types";
import { editorsRemovedByCreditChangeOf } from "./api/studioPlaylistEditors.api";
import {
  useCreateStudioPlaylist,
  useUpdateStudioPlaylist,
} from "./api/useStudioPlaylistMutations";
import { studioErrorMessageKeyOf } from "./studioErrors.data";

export type StudioPlaylistDialogMode = "create" | "edit" | "visibility";

export interface StudioPlaylistDialogDraft {
  /** Trimmed. */
  name: string;
  /** Trimmed. */
  description: string;
  visibility: StudioPlaylistVisibility;
  /** The credit radio as chosen. */
  creditId: string | null;
  /** The chosen persona when it is one the member can credit, else null. */
  creditPersonaId: string | null;
}

/** An edit the server refused because a credit change would remove editors,
 *  held while the owner decides. */
export interface PendingCreditChange {
  body: UpdateStudioPlaylistBody;
  editors: StudioPlaylistPersonView[];
}

function createBodyOf(
  draft: StudioPlaylistDialogDraft,
): CreateStudioPlaylistBody {
  return {
    name: draft.name,
    visibility: draft.visibility,
    ...(draft.description ? { description: draft.description } : {}),
    ...(draft.creditPersonaId
      ? { creditSubprofileId: draft.creditPersonaId }
      : {}),
  };
}

/** An edit body holding only what the member changed, so a credit-only edit
 *  carries no text. The credit goes only when the owner picked a different
 *  one: a saved persona missing from the list (still loading, say) shows as
 *  You and keeps its credit until the owner chooses. An editor never sends a
 *  credit: who it shows as stays with the owner. */
export function editBodyOf(
  playlist: StudioPlaylistView,
  draft: StudioPlaylistDialogDraft,
): UpdateStudioPlaylistBody {
  return {
    ...(draft.name !== playlist.name ? { name: draft.name } : {}),
    ...(draft.description !== (playlist.description ?? "")
      ? { description: draft.description }
      : {}),
    ...(playlist.isOwner && draft.creditId !== playlist.creditSubprofileId
      ? { creditSubprofileId: draft.creditPersonaId }
      : {}),
  };
}

/** Create, edit or change visibility, with the credit-change confirm: a 409
 *  `studio_playlist_credit_change_removes_editors` holds the edit and names
 *  the editors; confirming sends the same body with `confirmEditorRemoval`. */
export function useStudioPlaylistDialogSubmit({
  mode,
  playlist,
  shouldToastOnSave,
  onSaved,
}: {
  mode: StudioPlaylistDialogMode;
  playlist: StudioPlaylistView | null;
  shouldToastOnSave: boolean;
  onSaved: (playlist: StudioPlaylistView) => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const create = useCreateStudioPlaylist();
  const update = useUpdateStudioPlaylist();
  // The last error stays put while its panel folds away, so a closing panel
  // never flashes an empty line.
  const [errorKey, setErrorKey] = useState("");
  const [isErrorShown, setIsErrorShown] = useState(false);
  const [pendingCreditChange, setPendingCreditChange] =
    useState<PendingCreditChange | null>(null);
  const isBusy = create.isPending || update.isPending;

  function finish(saved: StudioPlaylistView) {
    if (shouldToastOnSave)
      showToast(
        t(
          mode === "create"
            ? "studio:playlist.dialog.createdToast"
            : "studio:playlist.dialog.savedToast",
        ),
        "success",
      );
    onSaved(saved);
  }

  function fail(error: unknown) {
    setErrorKey(studioErrorMessageKeyOf(error));
    setIsErrorShown(true);
  }

  async function sendEdit(
    target: StudioPlaylistView,
    body: UpdateStudioPlaylistBody,
  ) {
    try {
      const saved = await update.mutateAsync({ playlistId: target.id, body });
      setPendingCreditChange(null);
      finish(saved);
    } catch (error) {
      const removedEditors = editorsRemovedByCreditChangeOf(error);
      if (removedEditors && body.confirmEditorRemoval !== true) {
        setPendingCreditChange({
          body,
          editors: removedEditors.map(toPlaylistPersonView),
        });
        return;
      }
      setPendingCreditChange(null);
      fail(error);
    }
  }

  async function submit(draft: StudioPlaylistDialogDraft) {
    if (isBusy) return;
    setIsErrorShown(false);
    if (mode === "create") {
      try {
        finish(await create.mutateAsync(createBodyOf(draft)));
      } catch (error) {
        fail(error);
      }
      return;
    }
    if (!playlist) return;
    // Who can open it belongs to the owner, so an editor's submit carries
    // the name and the description only.
    const body: UpdateStudioPlaylistBody =
      mode === "edit"
        ? editBodyOf(playlist, draft)
        : playlist.isOwner
          ? { visibility: draft.visibility }
          : {};
    // Nothing changed: the playlist on screen is already what was saved.
    if (Object.keys(body).length === 0) {
      finish(playlist);
      return;
    }
    await sendEdit(playlist, body);
  }

  return {
    isBusy,
    errorKey,
    isErrorShown,
    pendingCreditChange,
    submit,
    confirmCreditChange: () => {
      if (!pendingCreditChange || !playlist || isBusy) return;
      void sendEdit(playlist, {
        ...pendingCreditChange.body,
        confirmEditorRemoval: true,
      });
    },
    cancelCreditChange: () => {
      if (!isBusy) setPendingCreditChange(null);
    },
  };
}
