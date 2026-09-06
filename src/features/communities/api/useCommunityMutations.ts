import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useCommunityEdits } from "../../../app/providers/useCommunityEdits";
import {
  archiveCommunity,
  dismissReport,
  freezeCommunity,
  unfreezeCommunity,
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
  suggestCommunityTag,
  transferCommunityOwnership,
  unreactToPost,
  updateCommunity,
  updatePost,
  type AssignableRole,
  type CommunityDetailDTO,
  type CommunityRemovalOutcomeDTO,
  type CommunityReplyDTO,
  type CommunityTakedownInput,
  type CreateCommunityDto,
  type CreatePostDto,
  type JoinResultDTO,
  type ReactionKey,
  type SuggestCommunityTagDto,
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
      void queryClient.invalidateQueries({
        queryKey: ["community-posts", slug],
      });
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
      void queryClient.invalidateQueries({
        queryKey: ["community-posts", slug],
      });
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
      void queryClient.invalidateQueries({
        queryKey: ["community-posts", slug],
      });
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
      void queryClient.invalidateQueries({
        queryKey: ["community-posts", slug],
      });
    },
  });
}

/** POST /communities/:slug/posts/:id/replies — reply to a Pulse post. Resolves
 *  with the stored reply so the caller can keep the author's own reply on
 *  screen: the post's embedded `replies` array is a bounded oldest-first
 *  PREVIEW, so on a busy thread a brand-new (newest) reply is outside that
 *  window and would vanish if the caller dropped its local copy on success. */
export function useReply(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    CommunityReplyDTO | null,
    Error,
    { id: string; text: string }
  >({
    // CommunityThread toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ id, text }) => {
      if (demoMode) return null;
      return replyToPost(slug, id, text);
    },
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: ["community-posts", slug],
      });
      // The "load more replies" pages for this post are now stale too (a
      // reply was appended past the preview window).
      void queryClient.invalidateQueries({
        queryKey: ["community-post-replies", slug, id],
      });
    },
  });
}

/** POST /communities/:slug/join — public tier joins instantly; other tiers
 *  create a join-request. The JoinModal reflects the outcome via its `tier`. */
export function useJoinCommunity(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<JoinResultDTO | null, Error, { note?: string }>({
    // JoinModal keeps the applicant on the form and shows the reason inline
    // (a frozen space, an already-pending request, a lost connection), so the
    // global duplicate toast would land under its own error line.
    meta: { silentError: true },
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
    // The mod-tools callers own the error UI (they roll their optimistic row
    // back and toast the specific reason), so the app-wide MutationCache
    // handler must not stack a second generic toast on top: during a bulk
    // approve that would fire once per request.
    meta: { silentError: true },
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

/**
 * DELETE /communities/:slug/members/:memberSlug — mod removes a member.
 *
 * The route answers with what the removal actually did (PRD-25), and the
 * mutation hands that straight back rather than throwing it away. A removal
 * with no `banDays` is a request for a PERMANENT bar, which now means the
 * member is barred for the fallback term at once while a second owner,
 * co-owner or moderator is asked to sign the permanence. The caller has to be
 * able to say which of the three outcomes it got, so this resolves to the
 * server's own `CommunityRemovalOutcomeDTO`.
 *
 * Demo mode resolves to null: there is no server sentence to show, and
 * inventing one would put words in the backend's mouth.
 *
 * The ratification queue is invalidated alongside the roster, because a
 * removal is one of the two things that opens a hold on it.
 */
export function useRemoveMember(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<CommunityRemovalOutcomeDTO | null, Error, string>({
    // The mod-tools callers own the error UI (they roll their optimistic row
    // back and toast the specific reason), so the app-wide MutationCache
    // handler must not stack a second generic toast on top: during a bulk
    // approve that would fire once per request.
    meta: { silentError: true },
    mutationFn: async (memberSlug) => {
      if (demoMode) return null;
      return removeMember(slug, memberSlug);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roster", slug] });
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
      void queryClient.invalidateQueries({ queryKey: ["my-communities"] });
      void queryClient.invalidateQueries({
        queryKey: ["community-ban-ratifications", slug],
      });
      void queryClient.invalidateQueries({
        queryKey: ["community-bans", slug],
      });
    },
  });
}

/** Who is being moved, and to which role. */
interface SetMemberRoleVariables {
  memberSlug: string;
  role: AssignableRole;
}

/** PATCH /communities/:slug/members/:memberSlug — set a roster member's role:
 *  mod, plain member, or co-owner. Staff-only, and the server is the authority
 *  on whether this caller may make this particular change (co-owner in either
 *  direction is the owner's alone). Demo mode keeps the calling component's
 *  local optimistic state, exactly as the prototype already does. */
export function useSetMemberRole(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, SetMemberRoleVariables>({
    // The mod-tools callers own the error UI (they roll their optimistic row
    // back and toast the specific reason), so the app-wide MutationCache
    // handler must not stack a second generic toast on top: during a bulk
    // approve that would fire once per request.
    meta: { silentError: true },
    mutationFn: async ({ memberSlug, role }) => {
      if (demoMode) return;
      await setMemberRole(slug, memberSlug, role);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["roster", slug] });
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
      void queryClient.invalidateQueries({ queryKey: ["my-communities"] });
      // Membership cards print the holder's CURRENT roster role, read live by
      // the backend rather than snapshotted at issue. Without this, a member
      // promoted here keeps their old role on an already-loaded holders
      // roster until that query goes stale on its own.
      void queryClient.invalidateQueries({ queryKey: ["card-holders", slug] });
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
      // The welcome greeting an owner edits here is READ back on the member
      // side from `GET /communities/:slug/preferences` (a different query, and
      // the one `CommunityWelcomeCard` renders), so a saved edit has to reach
      // that cache too. Without this an owner who writes a greeting and walks
      // to Pulse in the same session sees the answer from before they wrote it.
      void queryClient.invalidateQueries({
        queryKey: ["community-preferences", slug],
      });
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

/** POST /communities/:slug/unfreeze — owner/mod lifts an auto-freeze from the
 *  hub's frozen banner. Live unfreezes + invalidates the detail (the banner
 *  clears when it refetches unfrozen); demo is a no-op the banner reflects with
 *  its own local "lifted" state. */
export function useUnfreezeCommunity() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<CommunityDetailDTO | null, Error, { slug: string }>({
    // The banner toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ slug }) => {
      if (demoMode) return null;
      return unfreezeCommunity(slug);
    },
    onSuccess: (_data, { slug }) => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
    },
  });
}

/** POST /communities/:slug/freeze — owner/mod manually pauses a community
 *  ahead of a moderation review, from the mod panel danger zone. Live freezes
 *  + invalidates the detail (the frozen banner then appears); demo is a no-op
 *  the caller reflects with its own toast, mirroring `useUnfreezeCommunity`. */
export function useFreezeCommunity() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<CommunityDetailDTO | null, Error, { slug: string }>({
    // The danger-zone modal toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ slug }) => {
      if (demoMode) return null;
      return freezeCommunity(slug);
    },
    onSuccess: (_data, { slug }) => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["community", slug] });
    },
  });
}

/** PATCH /mod/reports/:id — dismiss one report from a community's reports
 *  queue (ModToolsTab's "Reported posts" section). Demo is a no-op (the
 *  caller keeps its own optimistic local removal); live PATCHes and
 *  invalidates the community's reports query. Deliberately NO
 *  `meta.silentError`: the endpoint this hits is platform Moderator/Admin-role
 *  gated, which a community-level mod doesn't necessarily hold, so a 403 here
 *  is a real possibility — it should surface as the normal global error toast
 *  rather than be swallowed. */
export function useDismissCommunityReport(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      if (demoMode) return;
      await dismissReport(id);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: ["community-reports", slug],
      });
    },
  });
}

/** POST /communities/:slug/transfer — owner-only ownership transfer. Live moves
 *  ownership (caller becomes a mod) + invalidates the detail/roster/memberships;
 *  demo is a no-op the caller reflects with its own toast. */
export function useTransferOwnership(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<CommunityDetailDTO | null, Error, { memberSlug: string }>({
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

/** DELETE /communities/:slug/posts/:id — soft tombstone the OP post.
 *  `takedown` (PRD-147) carries a moderator's reason, cited house rule and
 *  moderator-only note when the person deleting is NOT the author. An author
 *  clearing their own post leaves it undefined and nothing is logged or sent. */
export function useDeleteCommunityPost(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { id: string; takedown?: CommunityTakedownInput }
  >({
    // CommunityThread toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ id, takedown }) => {
      if (demoMode) return;
      await deleteCommunityPost(slug, id, takedown);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: ["community-posts", slug],
      });
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
      void queryClient.invalidateQueries({
        queryKey: ["community-posts", slug],
      });
    },
  });
}

/** PATCH /communities/:slug/posts/:id/replies/:replyId — author edits a reply. */
export function useEditCommunityReply(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { postId: string; replyId: string; text: string }
  >({
    // CommunityThread toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ postId, replyId, text }) => {
      if (demoMode) return;
      await editCommunityReply(slug, postId, replyId, text);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: ["community-posts", slug],
      });
    },
  });
}

/** DELETE /communities/:slug/posts/:id/replies/:replyId — soft tombstone a reply.
 *  Same optional `takedown` body as the post delete above (PRD-147). */
export function useDeleteCommunityReply(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { postId: string; replyId: string; takedown?: CommunityTakedownInput }
  >({
    // CommunityThread toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async ({ postId, replyId, takedown }) => {
      if (demoMode) return;
      await deleteCommunityReply(slug, postId, replyId, takedown);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: ["community-posts", slug],
      });
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
      void queryClient.invalidateQueries({
        queryKey: ["community-posts", slug],
      });
    },
  });
}

/** POST /communities/:slug/tag-requests — owner/mod "Suggest a tag" from
 *  `SuggestCommunityTagModal`.
 *
 *  NO LONGER FIRE-AND-FORGET (PRD-150). This docstring used to say there was
 *  no local queue of the submitter's own past requests, that the outcome
 *  reached them only through a notification, and that there was nothing to
 *  invalidate. All three stopped being true when `GET /communities/:slug/
 *  tag-requests` and `CommunityTagRequestLog` landed: the community's own
 *  suggestions are now read back with their status, and a successful send has
 *  to invalidate `communityTagRequestsPrefix(slug)` or the log the submitter
 *  is looking at will not show what they just sent.
 *
 *  That invalidation currently lives in the modal's own `onSuccess` rather
 *  than here. Moving it into this hook would be tidier and is safe to do. */
export function useSuggestCommunityTag(slug: string) {
  const { demoMode } = useDemoMode();
  return useMutation<void, Error, SuggestCommunityTagDto>({
    // SuggestCommunityTagModal toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (dto) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return;
      }
      await suggestCommunityTag(slug, dto);
    },
  });
}
