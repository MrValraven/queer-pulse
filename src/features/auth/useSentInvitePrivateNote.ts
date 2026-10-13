import { useId, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useToast } from "../../shared/components/feedback/useToast";
import type { TFunction } from "../../shared/i18n/types";
import {
  findCachedInvite,
  useUpdateInvitePrivateNote,
  type SentInviteView,
  type UpdateInvitePrivateNoteVariables,
} from "./api/useSentInvites";

/** True when focus has nowhere useful to be (the page body) or still sits in
 *  this row's editor, so moving it to the toggle takes nothing from the
 *  member. Anywhere else (another row, a toast's Undo) keeps its focus. */
function isFocusFreeToMove(editorId: string): boolean {
  const activeElement = document.activeElement;
  if (!activeElement || activeElement === document.body) return true;
  return Boolean(document.getElementById(editorId)?.contains(activeElement));
}

/**
 * Everything a sent-invite row needs for its private note: whether the editor
 * is open, the toggle's ref, and the save that the editor calls. It lives on
 * the row, which stays mounted while the editor folds away, so a save started
 * in the editor still lands its toast and its focus move after the form is
 * gone. While a save is in flight the toggle holds the editor as it is, so a
 * second request for the same row cannot start.
 */
export function useSentInvitePrivateNote(invite: SentInviteView, t: TFunction) {
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const updatePrivateNote = useUpdateInvitePrivateNote();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const editorId = useId();
  const isSaving = updatePrivateNote.isPending;
  const isDeleting = isSaving && !updatePrivateNote.variables?.privateNote;

  function toggleEditor() {
    if (isSaving) return;
    setIsEditorOpen((wasOpen) => !wasOpen);
  }

  /** Cancel and Esc: the member is in the editor, so focus goes home. */
  function closeEditor() {
    setIsEditorOpen(false);
    toggleRef.current?.focus();
  }

  /** Send one note (or null to delete it). `mutateAsync` settles even when the
   *  row has unmounted, so the toast always reports what happened. */
  async function sendPrivateNote(privateNote: string | null) {
    const previousNote = invite.privateNote ?? null;
    const isClearing = privateNote === null;
    try {
      await updatePrivateNote.mutateAsync({
        id: invite.id,
        code: invite.code,
        privateNote,
      });
    } catch {
      showToast(
        t(
          isClearing
            ? "auth:invite.sentList.privateNote.deleteErrorToast"
            : "auth:invite.sentList.privateNote.errorToast",
        ),
        "error",
      );
      // The pressed button was disabled mid-save, which drops focus; hand it
      // back to the field so the member can try again from there.
      if (isFocusFreeToMove(editorId)) {
        document.getElementById(`${editorId}-field`)?.focus();
      }
      return;
    }
    // Close on every success, Undo included, so no stale draft sits open
    // under the note that just landed.
    const shouldRefocusToggle = isFocusFreeToMove(editorId);
    setIsEditorOpen(false);
    if (shouldRefocusToggle) toggleRef.current?.focus();
    if (isClearing && previousNote) {
      showToast(
        t("auth:invite.sentList.privateNote.deletedToast"),
        "success",
        undefined,
        {
          label: t("auth:invite.sentList.privateNote.undoCta"),
          onClick: () => undoDelete(previousNote),
        },
      );
      return;
    }
    showToast(t("auth:invite.sentList.privateNote.savedToast"), "success");
  }

  /** The deleted toast's Undo. It reads the row as the cache holds it now,
   *  since this callback can run long after the render that made it: when the
   *  member has already written a newer note, or a save for this row is still
   *  in flight, that newer note stands and Undo does nothing. */
  function undoDelete(previousNote: string) {
    const cachedInvite = findCachedInvite(queryClient, demoMode, invite.id);
    if (cachedInvite?.privateNote) return;
    const isRowSaving =
      queryClient.isMutating({
        mutationKey: ["sent-invites", "private-note"],
        predicate: (mutation) =>
          (
            mutation.state.variables as
              UpdateInvitePrivateNoteVariables | undefined
          )?.id === invite.id,
      }) > 0;
    if (isRowSaving) return;
    void sendPrivateNote(previousNote);
  }

  /** What the editor's Save and Delete call. Blank text deletes; text that
   *  matches the saved note folds the editor away with no request or toast. */
  function savePrivateNote(nextNote: string | null) {
    if (isSaving) return;
    const trimmedNote = nextNote?.trim() ?? "";
    if (trimmedNote === (invite.privateNote ?? "")) {
      closeEditor();
      return;
    }
    void sendPrivateNote(trimmedNote === "" ? null : trimmedNote);
  }

  return {
    editorId,
    toggleRef,
    isEditorOpen,
    isSaving,
    isDeleting,
    toggleEditor,
    closeEditor,
    savePrivateNote,
  };
}

/** The editor state the toggle and the editor read. The toggle's ref travels
 *  on its own prop, so render code never reads a ref through this object. */
export type SentInvitePrivateNoteState = Omit<
  ReturnType<typeof useSentInvitePrivateNote>,
  "toggleRef"
>;
