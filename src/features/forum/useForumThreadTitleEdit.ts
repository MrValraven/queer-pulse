import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type Thread } from "./forum.data";
import { useEditThreadTitle } from "./api/useForumMutations";

/**
 * Owns the thread title-edit flow — which thread is being edited, the
 * mutation, and the save/close handlers. Lifted out of `useForumPageState`.
 */
export function useForumThreadTitleEdit({
  demoMode,
  allThreads,
  setExtraThreads,
}: {
  demoMode: boolean;
  allThreads: Thread[];
  setExtraThreads: React.Dispatch<React.SetStateAction<Thread[]>>;
}) {
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [editingTitleThreadId, setEditingTitleThreadId] = useState<
    number | null
  >(null);

  const editingThread =
    editingTitleThreadId != null
      ? allThreads.find((thread) => thread.id === editingTitleThreadId)
      : undefined;
  // The mutation takes the thread's REAL backend slug, read off the card being
  // edited. It used to take the numeric view-model id and look the slug up in a
  // render-populated registry, which silently no-opped (while still toasting
  // "Saved") whenever the lookup missed.
  const editThreadTitle = useEditThreadTitle(editingThread?.slug);

  function closeEditTitle() {
    setEditingTitleThreadId(null);
  }

  function saveThreadTitle(title: string) {
    const editedThreadId = editingTitleThreadId;
    if (demoMode) {
      setExtraThreads((prev) =>
        prev.map((thread) =>
          thread.id === editedThreadId ? { ...thread, title } : thread,
        ),
      );
      setEditingTitleThreadId(null);
      showToast(t("forum:toast.editSaved"), "success");
      return;
    }
    // Live: the title is only "saved" once the server says so. The modal closes
    // straight away (the request is short and the list refetches on success),
    // but no success toast fires until then.
    setEditingTitleThreadId(null);
    editThreadTitle.mutate(
      { title },
      {
        onSuccess: () => showToast(t("forum:toast.editSaved"), "success"),
        onError: () => showToast(t("forum:toast.error"), "error"),
      },
    );
  }

  return {
    editingTitleThreadId,
    setEditingTitleThreadId,
    editingThread,
    editingTitleThreadIsBusy: editThreadTitle.isPending,
    saveThreadTitle,
    closeEditTitle,
  };
}
