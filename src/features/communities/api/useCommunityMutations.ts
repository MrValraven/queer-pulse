import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useCommunityEdits } from "../../../app/providers/useCommunityEdits";
import {
  archiveCommunity,
  createCommunity,
  createPost,
  deleteCommunityPost,
  deleteCommunityReply,
  editCommunityReply,
  joinCommunity,
  reactToPost,
  removeMember,
  replyToPost,
  restoreCommunityPost,
  restoreCommunityReply,
  reviewJoinRequest,
  setMemberRole,
  transferCommunityOwnership,
  unreactToPost,
  updateCommunity,
  updatePost,
  type CommunityDetailDTO,
  type CreateCommunityDto,
  type CreatePostDto,
  type JoinResultDTO,
  type ReactionKey,
  type UpdateCommunityDto,
  type UpdatePostDto,
} from "./communities.api";

/**
 * Every mutation branches on `demoMode`: in demo it's a no-op (the calling
 * component keeps its optimistic local state, exactly as the prototype already
 * does), and in live mode it calls the API then invalidates the affected query
 * keys. Demo mode must never hit the network.
 */

/** POST /communities/:slug/posts — Pulse composer "Share". */
export function useCreatePost(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, CreatePostDto>({
    // DiscussionTab / CommunityTabs toast their own error, so silence the
    // global duplicate.
    meta: { silentError: true },
    mutationFn: async (dto) => {
      if (demoMode) return;
      await createPost(slug, dto);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["community-posts", slug] });
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
    },
  });
}

/** PATCH /communities/:slug/posts/:id — edit body / pin (pin requires mod). */
export function useUpdatePost(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; dto: UpdatePostDto }>({
    // CommunityThread toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ id, dto }) => {
      if (demoMode) return;
      await updatePost(slug, id, dto);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["community-posts", slug] });
    },
  });
}

/** POST /communities/:slug/posts/:id/reactions — add a reaction. */
export function useReact(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; key: ReactionKey }>({
    // CommunityThread toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ id, key }) => {
      if (demoMode) return;
      await reactToPost(slug, id, key);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["community-posts", slug] });
    },
  });
}

/** DELETE /communities/:slug/posts/:id/reactions/:key — remove a reaction. */
export function useUnreact(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; key: ReactionKey }>({
    // CommunityThread toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ id, key }) => {
      if (demoMode) return;
      await unreactToPost(slug, id, key);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["community-posts", slug] });
    },
  });
}

/** POST /communities/:slug/posts/:id/replies — reply to a Pulse post. */
export function useReply(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; text: string }>({
    // CommunityThread toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ id, text }) => {
      if (demoMode) return;
      await replyToPost(slug, id, text);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["community-posts", slug] });
    },
  });
}

/** POST /communities/:slug/join — public tier joins instantly; other tiers
 *  create a join-request. The JoinModal reflects the outcome via its `tier`. */
export function useJoinCommunity(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<JoinResultDTO | null, Error, { note?: string }>({
    mutationFn: async ({ note }) => {
      if (demoMode) return null;
      return joinCommunity(slug, note);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
      void queryClient.invalidateQueries({ queryKey: ["communities"] });
      void queryClient.invalidateQueries({ queryKey: ["roster", slug] });
      void queryClient.invalidateQueries({ queryKey: ["join-requests", slug] });
      void queryClient.invalidateQueries({ queryKey: ["my-communities"] });
    },
  });
}

/** DELETE /communities/:slug/members/:memberSlug — the caller leaves a community
 *  they're on the roster of (the backend's self-leave path: passing your own
 *  member slug). Demo mode is a no-op (the caller keeps its optimistic local
 *  state); live mode calls the API then invalidates the membership-derived keys,
 *  mirroring `useJoinCommunity` in reverse. */
export function useLeaveCommunity(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { memberSlug: string }>({
    mutationFn: async ({ memberSlug }) => {
      if (demoMode) return;
      await removeMember(slug, memberSlug);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
      void queryClient.invalidateQueries({ queryKey: ["communities"] });
      void queryClient.invalidateQueries({ queryKey: ["roster", slug] });
      void queryClient.invalidateQueries({ queryKey: ["my-communities"] });
    },
  });
}

/** PATCH /communities/:slug/join-requests/:id — mod approve / decline. */
export function useReviewJoinRequest(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { id: string; action: "approve" | "decline" }
  >({
    mutationFn: async ({ id, action }) => {
      if (demoMode) return;
      await reviewJoinRequest(slug, id, action);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["join-requests", slug] });
      void queryClient.invalidateQueries({ queryKey: ["roster", slug] });
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
    },
  });
}

/** DELETE /communities/:slug/members/:memberSlug — mod removes a member. */
export function useRemoveMember(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (memberSlug) => {
      if (demoMode) return;
      await removeMember(slug, memberSlug);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roster", slug] });
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
      void queryClient.invalidateQueries({ queryKey: ["my-communities"] });
    },
  });
}

/** PATCH /communities/:slug/members/:memberSlug — promote a roster member to mod
 *  (or demote back to member). Mod-only; the server is the authority on whether
 *  the caller may do it. Demo mode keeps the calling component's local
 *  optimistic list, exactly as the prototype already does. */
export function useSetMemberRole(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { memberSlug: string; role: "member" | "mod" }
  >({
    mutationFn: async ({ memberSlug, role }) => {
      if (demoMode) return;
      await setMemberRole(slug, memberSlug, role);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roster", slug] });
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
      void queryClient.invalidateQueries({ queryKey: ["my-communities"] });
    },
  });
}

/** POST /communities — Start-a-Community wizard submit. Demo keeps the existing
 *  create-it-live flow (returns null); live returns the created detail so the
 *  page can navigate to `/community/:slug`. */
export function useCreateCommunity() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<CommunityDetailDTO | null, Error, CreateCommunityDto>({
    // StartCommunityPage toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (dto) => {
      if (demoMode) return null;
      return createCommunity(dto);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["communities"] });
      void queryClient.invalidateQueries({ queryKey: ["my-communities"] });
    },
  });
}

/** PATCH /communities/:slug — owner/mod edit of community info. Live PATCHes and
 *  invalidates the detail + lists; demo writes the session override store (the
 *  demo detail memo re-derives from it) and returns null. */
export function useUpdateCommunity() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { applyOverride } = useCommunityEdits();
  return useMutation<
    CommunityDetailDTO | null,
    Error,
    { slug: string; dto: UpdateCommunityDto }
  >({
    mutationFn: async ({ slug, dto }) => {
      if (demoMode) {
        applyOverride(slug, dto);
        return null;
      }
      return updateCommunity(slug, dto);
    },
    onSuccess: (_data, { slug }) => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
      void queryClient.invalidateQueries({ queryKey: ["communities"] });
      void queryClient.invalidateQueries({ queryKey: ["my-communities"] });
    },
  });
}

/** POST /communities/:slug/archive — owner-only "archive community" from the mod
 *  panel danger zone. Live archives + invalidates (the detail now 404s for
 *  non-staff, so lists/my-communities drop it); demo is a no-op the caller
 *  reflects with its own toast. */
export function useArchiveCommunity() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<CommunityDetailDTO | null, Error, { slug: string }>({
    // The mod panel toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ slug }) => {
      if (demoMode) return null;
      return archiveCommunity(slug);
    },
    onSuccess: (_data, { slug }) => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
      void queryClient.invalidateQueries({ queryKey: ["communities"] });
      void queryClient.invalidateQueries({ queryKey: ["my-communities"] });
    },
  });
}

/** POST /communities/:slug/transfer — owner-only ownership transfer. Live moves
 *  ownership (caller becomes a mod) + invalidates the detail/roster/memberships;
 *  demo is a no-op the caller reflects with its own toast. */
export function useTransferOwnership(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    CommunityDetailDTO | null,
    Error,
    { memberSlug: string }
  >({
    // The transfer modal toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ memberSlug }) => {
      if (demoMode) return null;
      return transferCommunityOwnership(slug, memberSlug);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
      void queryClient.invalidateQueries({ queryKey: ["roster", slug] });
      void queryClient.invalidateQueries({ queryKey: ["my-communities"] });
    },
  });
}

/** DELETE /communities/:slug/posts/:id — soft tombstone the OP post. */
export function useDeleteCommunityPost(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string }>({
    // CommunityThread toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ id }) => {
      if (demoMode) return;
      await deleteCommunityPost(slug, id);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["community-posts", slug] });
    },
  });
}

/** POST /communities/:slug/posts/:id/restore — clear the OP tombstone. */
export function useRestoreCommunityPost(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string }>({
    // CommunityThread toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ id }) => {
      if (demoMode) return;
      await restoreCommunityPost(slug, id);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["community-posts", slug] });
    },
  });
}

/** PATCH /communities/:slug/posts/:id/replies/:replyId — author edits a reply. */
export function useEditCommunityReply(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { postId: string; replyId: string; text: string }>({
    // CommunityThread toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ postId, replyId, text }) => {
      if (demoMode) return;
      await editCommunityReply(slug, postId, replyId, text);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["community-posts", slug] });
    },
  });
}

/** DELETE /communities/:slug/posts/:id/replies/:replyId — soft tombstone a reply. */
export function useDeleteCommunityReply(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { postId: string; replyId: string }>({
    // CommunityThread toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ postId, replyId }) => {
      if (demoMode) return;
      await deleteCommunityReply(slug, postId, replyId);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["community-posts", slug] });
    },
  });
}

/** POST /communities/:slug/posts/:id/replies/:replyId/restore — clear a reply tombstone. */
export function useRestoreCommunityReply(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { postId: string; replyId: string }>({
    // CommunityThread toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ postId, replyId }) => {
      if (demoMode) return;
      await restoreCommunityReply(slug, postId, replyId);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["community-posts", slug] });
    },
  });
}
