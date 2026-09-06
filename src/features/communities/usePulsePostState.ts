import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { Post, PostReply } from "./community.model";
import type { Person } from "./communityDetails";
import type { CommunityTakedownInput } from "./api/communities.api";
import {
  useDeleteCommunityPost,
  useRestoreCommunityPost,
  useUpdatePost,
} from "./api/useCommunityMutations";

/** What the viewer may do to one Pulse post. */
export interface PulsePostPermissions {
  isOwnPost: boolean;
  canPin: boolean;
  canReport: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
  canViewHistory: boolean;
  isOwnReply: (reply: PostReply) => boolean;
}

/**
 * Resolve the Pulse post action set. Live mode trusts the DTO's own
 * `canEdit`/`canDelete`/`canRestore` flags (the same ones the Discussion view
 * already honours); demo mode has no backend, so it falls back to the "You"
 * persona check the mock data authors posts under.
 */
export function usePulsePostPermissions({
  post,
  viewer,
  isMember,
  canModerate,
  isDeleted,
  demoMode,
}: {
  post: Post;
  viewer: Person | null;
  isMember: boolean;
  canModerate: boolean;
  isDeleted: boolean;
  demoMode: boolean;
}): PulsePostPermissions {
  // No DTO flag says "this is mine" directly (`canEdit` is also true for a mod
  // editing someone else's post), so compare the viewer's slug to the author's.
  const isOwnPost = demoMode
    ? post.author.name === "You"
    : !!viewer?.slug && viewer.slug === post.author.slug;
  return {
    isOwnPost,
    canPin: canModerate && !isDeleted,
    canReport: isMember && !isOwnPost && !isDeleted,
    canEdit: (demoMode ? isOwnPost : !!post.canEdit) && !isDeleted,
    canDelete: (demoMode ? isOwnPost : !!post.canDelete) && !isDeleted,
    canRestore: demoMode ? isOwnPost && isDeleted : !!post.canRestore,
    canViewHistory: demoMode ? false : !!post.canViewHistory,
    isOwnReply: (reply) =>
      demoMode
        ? reply.author.name === "You"
        : !!viewer?.slug && viewer.slug === reply.author.slug,
  };
}

/**
 * Edit / delete / restore / history for ONE Pulse post, mirroring what
 * `useCommunityThreadState` already gives the Discussion view.
 *
 * The two views render the same `community_post` row, so a post that is
 * editable in Discussion has to be editable in Pulse: before this, `PulsePost`
 * hard-coded `canEdit={false} canDelete={false}` even though the DTO carried
 * both flags, which left a member who only ever opens Pulse with no way to fix
 * a typo or take down a photo they regretted.
 *
 * A plain hook (no JSX), so the per-component line limit doesn't apply here.
 */
export function usePulsePostState(post: Post) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const slug = post.communitySlug;
  const updatePost = useUpdatePost(slug);
  const deletePost = useDeleteCommunityPost(slug);
  const restorePost = useRestoreCommunityPost(slug);

  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isShowingHistory, setIsShowingHistory] = useState(false);
  // Demo-only local overrides; live mode re-reads the refetched post instead.
  const [demoOverride, setDemoOverride] = useState<{
    body?: string;
    deleted?: boolean;
    editedAt?: string | null;
  }>({});

  const onError = () => showToast(t("communities:common.error"), "error");
  const isDeleted = demoMode ? !!demoOverride.deleted : !!post.deleted;
  const body = demoMode ? (demoOverride.body ?? post.body) : post.body;
  const editedAt = demoMode
    ? (demoOverride.editedAt ?? post.editedAt ?? null)
    : (post.editedAt ?? null);

  function saveEdit(next: string) {
    if (demoMode) {
      setIsEditing(false);
      setDemoOverride((prev) => ({
        ...prev,
        body: next,
        editedAt: new Date().toISOString(),
      }));
      showToast(t("communities:detail.thread.editSavedToast"), "success");
      return;
    }
    // The editor stays open (and busy) until the PATCH lands, so a failure
    // hands the edit back instead of confirming a save that never happened.
    updatePost.mutate(
      { id: post.id, dto: { body: next } },
      {
        onSuccess: () => {
          setIsEditing(false);
          showToast(t("communities:detail.thread.editSavedToast"), "success");
        },
        onError,
      },
    );
  }

  /**
   * Take the post down.
   *
   * `takedown` is present only when a MODERATOR acted on somebody else's post
   * (PRD-147): it carries the reason and the cited house rule the author is
   * sent, plus a note only the moderators read. An author deleting their own
   * post passes nothing, and the toast stays the plain one, because nothing
   * was logged and nobody was told.
   */
  function runDelete(takedown?: CommunityTakedownInput) {
    const successToast = () =>
      showToast(
        takedown
          ? t("communities:detail.modtools.takedown.post.successToast")
          : t("communities:detail.thread.deletedToast"),
        "success",
      );
    if (demoMode) {
      setIsConfirmingDelete(false);
      setDemoOverride((prev) => ({ ...prev, deleted: true }));
      successToast();
      return;
    }
    deletePost.mutate(
      { id: post.id, takedown },
      {
        onSuccess: () => {
          setIsConfirmingDelete(false);
          successToast();
        },
        onError: () => {
          setIsConfirmingDelete(false);
          if (takedown) {
            showToast(
              t("communities:detail.modtools.takedown.errorToast"),
              "error",
            );
            return;
          }
          onError();
        },
      },
    );
  }

  function runRestore() {
    if (demoMode) {
      setDemoOverride((prev) => ({ ...prev, deleted: false }));
      showToast(t("communities:detail.thread.restoredToast"), "success");
      return;
    }
    restorePost.mutate(
      { id: post.id },
      {
        onSuccess: () =>
          showToast(t("communities:detail.thread.restoredToast"), "success"),
        onError,
      },
    );
  }

  return {
    isEditing,
    setIsEditing,
    isConfirmingDelete,
    setIsConfirmingDelete,
    isShowingHistory,
    setIsShowingHistory,
    isSavingEdit: updatePost.isPending,
    isDeletePending: deletePost.isPending,
    isDeleted,
    body,
    editedAt,
    saveEdit,
    runDelete,
    runRestore,
  };
}
