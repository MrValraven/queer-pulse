import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  createCommunity,
  createPost,
  joinCommunity,
  reactToPost,
  removeMember,
  replyToPost,
  reviewJoinRequest,
  setMemberRole,
  unreactToPost,
  updatePost,
  type CommunityDetailDTO,
  type CreateCommunityDto,
  type CreatePostDto,
  type JoinResultDTO,
  type ReactionKey,
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
    mutationFn: async (dto) => {
      if (demoMode) return;
      await createPost(slug, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts", slug] });
      queryClient.invalidateQueries({ queryKey: ["community", slug] });
    },
  });
}

/** PATCH /communities/:slug/posts/:id — edit body / pin (pin requires mod). */
export function useUpdatePost(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; dto: UpdatePostDto }>({
    mutationFn: async ({ id, dto }) => {
      if (demoMode) return;
      await updatePost(slug, id, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts", slug] });
    },
  });
}

/** POST /communities/:slug/posts/:id/reactions — add a reaction. */
export function useReact(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; key: ReactionKey }>({
    mutationFn: async ({ id, key }) => {
      if (demoMode) return;
      await reactToPost(slug, id, key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts", slug] });
    },
  });
}

/** DELETE /communities/:slug/posts/:id/reactions/:key — remove a reaction. */
export function useUnreact(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; key: ReactionKey }>({
    mutationFn: async ({ id, key }) => {
      if (demoMode) return;
      await unreactToPost(slug, id, key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts", slug] });
    },
  });
}

/** POST /communities/:slug/posts/:id/replies — reply to a Pulse post. */
export function useReply(slug: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: string; text: string }>({
    mutationFn: async ({ id, text }) => {
      if (demoMode) return;
      await replyToPost(slug, id, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-posts", slug] });
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
      queryClient.invalidateQueries({ queryKey: ["community", slug] });
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["roster", slug] });
      queryClient.invalidateQueries({ queryKey: ["join-requests", slug] });
      queryClient.invalidateQueries({ queryKey: ["my-communities"] });
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
      queryClient.invalidateQueries({ queryKey: ["join-requests", slug] });
      queryClient.invalidateQueries({ queryKey: ["roster", slug] });
      queryClient.invalidateQueries({ queryKey: ["community", slug] });
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
      queryClient.invalidateQueries({ queryKey: ["roster", slug] });
      queryClient.invalidateQueries({ queryKey: ["community", slug] });
      queryClient.invalidateQueries({ queryKey: ["my-communities"] });
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
      queryClient.invalidateQueries({ queryKey: ["roster", slug] });
      queryClient.invalidateQueries({ queryKey: ["community", slug] });
      queryClient.invalidateQueries({ queryKey: ["my-communities"] });
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
    mutationFn: async (dto) => {
      if (demoMode) return null;
      return createCommunity(dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["my-communities"] });
    },
  });
}
