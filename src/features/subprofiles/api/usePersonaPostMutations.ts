import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import {
  createPersonaPost,
  deletePersonaPost,
  updatePersonaPost,
} from "./personaPosts.api";
import {
  hasPersonaPostChanges,
  toPersonaPostView,
  type PersonaPostView,
} from "./personaPosts.adapters";
import type {
  CreatePersonaPostBody,
  UpdatePersonaPostBody,
} from "./personaPosts.types";
import { personaPostKeys, type PersonaPostsPage } from "./usePersonaPosts";

type PostsData = InfiniteData<PersonaPostsPage, string | null>;
const SILENT = { silentError: true } as const;

/** Writes go straight into the cached pages, so a new post appears on top
 *  and a deleted one leaves without a refetch that would reshuffle pages. */
function patchPosts(
  queryClient: QueryClient,
  demoMode: boolean,
  subprofileId: string,
  update: (items: PersonaPostView[], pageIndex: number) => PersonaPostView[],
): void {
  queryClient.setQueryData<PostsData>(
    personaPostKeys.posts(demoMode, subprofileId),
    (data) =>
      data
        ? {
            ...data,
            pages: data.pages.map((page, index) => ({
              ...page,
              items: update(page.items, index),
            })),
          }
        : data,
  );
}

/** A write that answered 404: the post is gone, or the viewer can no longer
 *  edit it. */
export function isPersonaPostGone(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

/** Takes the post out of the cached pages: after a delete, and after a
 *  write that found the post gone. */
function dropCachedPost(
  queryClient: QueryClient,
  demoMode: boolean,
  subprofileId: string,
  postId: string,
): void {
  patchPosts(queryClient, demoMode, subprofileId, (items) =>
    items.filter((item) => item.id !== postId),
  );
}

/** The post as the cached pages hold it. */
function cachedPost(
  queryClient: QueryClient,
  demoMode: boolean,
  subprofileId: string,
  postId: string,
): PersonaPostView | undefined {
  return queryClient
    .getQueryData<PostsData>(personaPostKeys.posts(demoMode, subprofileId))
    ?.pages.flatMap((page) => page.items)
    .find((item) => item.id === postId);
}

export function useCreatePersonaPost(subprofileId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<PersonaPostView, Error, CreatePersonaPostBody>({
    meta: SILENT,
    mutationFn: async (body) =>
      toPersonaPostView(
        demoMode
          ? await (
              await import("../data/personaPostsDemo")
            ).demoCreatePersonaPost(subprofileId, body)
          : await createPersonaPost(subprofileId, body),
      ),
    onSuccess: (post) =>
      patchPosts(queryClient, demoMode, subprofileId, (items, index) =>
        index === 0 ? [post, ...items] : items,
      ),
  });
}

/** An edit body with no changed field stays unsent (the server would stamp
 *  "Edited" on it) and resolves with the cached post as it stands. */
export function useUpdatePersonaPost(subprofileId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    PersonaPostView,
    Error,
    { postId: string; body: UpdatePersonaPostBody }
  >({
    meta: SILENT,
    mutationFn: async ({ postId, body }) => {
      if (!hasPersonaPostChanges(body)) {
        const current = cachedPost(queryClient, demoMode, subprofileId, postId);
        if (current) return current;
        throw new Error("persona_post_unchanged");
      }
      return toPersonaPostView(
        demoMode
          ? await (
              await import("../data/personaPostsDemo")
            ).demoUpdatePersonaPost(postId, body)
          : await updatePersonaPost(postId, body),
      );
    },
    onSuccess: (post) =>
      patchPosts(queryClient, demoMode, subprofileId, (items) =>
        items.map((item) => (item.id === post.id ? post : item)),
      ),
    onError: (error, { postId }) => {
      if (isPersonaPostGone(error))
        dropCachedPost(queryClient, demoMode, subprofileId, postId);
    },
  });
}

export function useDeletePersonaPost(subprofileId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { postId: string }>({
    meta: SILENT,
    mutationFn: async ({ postId }) => {
      if (demoMode) {
        (await import("../data/personaPostsDemo")).demoDeletePersonaPost(
          postId,
        );
        return;
      }
      await deletePersonaPost(postId);
    },
    onSuccess: (_result, { postId }) =>
      dropCachedPost(queryClient, demoMode, subprofileId, postId),
    onError: (error, { postId }) => {
      if (isPersonaPostGone(error))
        dropCachedPost(queryClient, demoMode, subprofileId, postId);
    },
  });
}
