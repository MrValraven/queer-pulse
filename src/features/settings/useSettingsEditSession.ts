import { useEffect, useRef, useState } from "react";
import { useProfileEdit } from "../../app/providers/useProfile";
import { useProfileTheme } from "../../app/providers/useProfileTheme";
import { useUnsavedChangesGuard } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PaneId } from "./settings.data";

/**
 * The Settings page's unsaved-changes lifecycle: the dirty flag and its "what
 * changed" keys, the profile edit session the page opens for its
 * profile-backed panes, the theme draft, and the leave guard. Lifted out of
 * `SettingsPage` so the page component stays inside the 200-line rule, and so
 * the save bar and the leave dialog's "Save and leave" run one save routine.
 */
export function useSettingsEditSession({
  pane,
  isDeleteModalOpen,
}: {
  pane: PaneId;
  isDeleteModalOpen: boolean;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { commit: commitTheme, discard: discardTheme } = useProfileTheme();
  const { save, cancelEditing, startEditing, isSaving, saveError, isEditing } =
    useProfileEdit();
  const [isDirty, setIsDirty] = useState(false);
  // Which fields changed, in the order they were touched. Feeds the save
  // bar's "what changed" disclosure. Only panes backed by real persisted
  // state (profile draft, theme draft) pass a key; cosmetic/coming-soon
  // controls elsewhere still mark the page dirty but report nothing here.
  const [changedKeys, setChangedKeys] = useState<string[]>([]);
  const openedRef = useRef(false);
  const cancelEditingRef = useRef(cancelEditing);
  // Set once "Save and leave" has saved everything. The leave that follows
  // then skips the Discard-style rollback, whose `cancelEditing` and
  // `discardTheme` were captured before the save and would reset the shared
  // drafts to the pre-save values. The next edit clears it.
  const hasSavedForLeaveRef = useRef(false);

  // Keep the ref current after every render (outside render, so this is safe),
  // so the unmount-only cleanup below always calls the latest cancelEditing
  // without needing to depend on it (its identity changes on every save).
  useEffect(() => {
    cancelEditingRef.current = cancelEditing;
  });

  // Drop any leftover unsaved theme edits when re-entering Settings.
  useEffect(() => {
    discardTheme();
  }, [discardTheme]);

  // Open a profile edit session once when a profile-editing pane is active and
  // none is already open. Track that WE opened it, so we only ever tear down our
  // own session, and leave one the members profile page opened.
  useEffect(() => {
    if (
      (pane === "profile" || pane === "visibility" || pane === "interests") &&
      !isEditing &&
      !openedRef.current
    ) {
      startEditing();
      openedRef.current = true;
    }
  }, [pane, isEditing, startEditing]);

  // Leaving Settings drops an edit session WE opened (mirrors Discard). A session
  // opened elsewhere is left intact.
  useEffect(
    () => () => {
      if (openedRef.current) cancelEditingRef.current();
    },
    [],
  );

  const markChanged = (key?: string) => {
    hasSavedForLeaveRef.current = false;
    setIsDirty(true);
    if (key) {
      setChangedKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
    }
  };

  const discardChanges = () => {
    if (openedRef.current) {
      cancelEditing();
      openedRef.current = false;
    }
    discardTheme();
    setIsDirty(false);
    setChangedKeys([]);
  };

  // The one save routine behind both the save bar and "Save and leave":
  // persists the profile draft when this page opened a session, commits the
  // theme draft, and toasts the outcome. True only when all of it saved.
  const saveChanges = async (): Promise<boolean> => {
    if (openedRef.current) {
      const isProfileSaved = await save();
      if (!isProfileSaved) {
        showToast(t("settings:page.saveBar.saveErrorToast"), "error");
        return false;
      }
    }
    commitTheme();
    setIsDirty(false);
    setChangedKeys([]);
    showToast(t("settings:page.saveBar.savedToast"), "success");
    return true;
  };

  const saveAndLeave = async (): Promise<boolean> => {
    const isSaved = await saveChanges();
    if (isSaved) {
      hasSavedForLeaveRef.current = true;
      // `save` already closed the provider session. Forgetting it here stops
      // the unmount cleanup from running a `cancelEditing` captured before the
      // save; if the page renders again first, the pane effect reopens one.
      openedRef.current = false;
    }
    return isSaved;
  };

  // Warn before a dirty Settings pane is abandoned: in-app navigation and hard
  // tab-close both prompt. Previously the save bar was the only signal and a
  // click into any other page silently discarded the edits. On confirmed leave,
  // roll back the same way Discard does so no half-open edit session lingers.
  useUnsavedChangesGuard({
    active: isDirty && !isDeleteModalOpen,
    confirmMessage: t("settings:page.leaveConfirm"),
    onConfirmLeave: () => {
      if (hasSavedForLeaveRef.current) {
        hasSavedForLeaveRef.current = false;
        return;
      }
      discardChanges();
    },
    // "Save and leave" is offered whenever the save bar's Save button is
    // enabled, i.e. while no save is already in flight.
    onSaveAndLeave: isSaving ? undefined : saveAndLeave,
  });

  return {
    isDirty,
    changedKeys,
    markChanged,
    discardChanges,
    saveChanges,
    isSaving,
    saveError,
  };
}
