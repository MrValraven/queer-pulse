import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type Thread } from "./forum.data";
import {
  type useEditPost,
  type useEditThreadTitle,
} from "./api/useForumMutations";
import { type OpOverride } from "./threadModeration.helpers";

type PostIdMutate = (
  variables: { postId: string },
  options: { onSuccess: () => void; onError: () => void },
) => void;

/**
 * Owns the OP-card moderation slice — edit/delete/restore state plus the
 * handlers that apply an optimistic `opOverride` in demo or persist through
 * the passed-in mutations in live. Lifted out of `useThreadModeration`.
 */
export function useOpModeration({
  thread,
  demoMode,
  editTitle,
  editPost,
  onMutateError,
}: {
  thread: Thread | undefined;
  demoMode: boolean;
  editTitle: ReturnType<typeof useEditThreadTitle>;
  editPost: ReturnType<typeof useEditPost>;
  onMutateError: () => void;
}) {
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [editingOp, setEditingOp] = useState(false);
  // Snapshot of the OP body exactly as EditOpModal was initialized with, so
  // `saveOpEdit` can tell a genuine body change from a title-only edit even if
  // `thread.body` itself changes (e.g. a background refetch) while the modal is
  // open — comparing against a live-recomputed `thread.body.join("\n")` would
  // misfire in that window.
  const [editingOpInitialBody, setEditingOpInitialBody] = useState("");
  // Demo-only local overrides for the OP card (live refetches after mutation).
  const [opOverride, setOpOverride] = useState<OpOverride>({});

  /** The OP-card equivalent of the reply-level optimistic runner: demo
   *  tombstones/restores through `opOverride`, live persists first and only
   *  then confirms. Live reads the DTO's `deleted` flag (refetched by
   *  `invalidateThread`), so there is no local live state to roll back. */
  function runOpOverrideOp({
    override,
    postId,
    mutate,
    successKey,
  }: {
    override: OpOverride;
    postId: string;
    mutate: PostIdMutate;
    successKey: string;
  }) {
    if (demoMode) {
      setOpOverride((prev) => ({ ...prev, ...override }));
      showToast(t(successKey), "success");
      return;
    }
    mutate(
      { postId },
      {
        onSuccess: () => showToast(t(successKey), "success"),
        onError: onMutateError,
      },
    );
  }

  function saveOpEdit(next: { title: string; body: string }) {
    if (!thread) return;
    setEditingOp(false);
    if (demoMode) {
      setOpOverride((prev) => ({
        ...prev,
        title: next.title,
        body: next.body
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        editedAt: new Date().toISOString(),
      }));
      showToast(t("forum:toast.editSaved"), "success");
      return;
    }
    // An OP edit can be up to two requests (title + body). Both must settle
    // before confirming, so "Your edit is live" can never precede the server
    // accepting it. `mutateAsync` rejects on failure; the rejection handler
    // reports it honestly instead of a contradictory second toast.
    const pending: Promise<unknown>[] = [];
    if (next.title !== thread.title)
      pending.push(editTitle.mutateAsync({ title: next.title }));
    // Compare against the snapshot EditOpModal was opened with, not a fresh
    // `thread.body.join("\n")` — the latter can drift from a background
    // refetch while the modal is open, spuriously firing a body edit when the
    // member only changed the title. See `editingOpInitialBody` above.
    if (thread.opPostId && next.body !== editingOpInitialBody)
      pending.push(
        editPost.mutateAsync({ postId: thread.opPostId, body: next.body }),
      );
    void Promise.all(pending).then(
      () => showToast(t("forum:toast.editSaved"), "success"),
      () => onMutateError(),
    );
  }

  return {
    editingOp,
    setEditingOp,
    editingOpInitialBody,
    setEditingOpInitialBody,
    opOverride,
    setOpOverride,
    runOpOverrideOp,
    saveOpEdit,
  };
}
