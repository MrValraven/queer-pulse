import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/client";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { getCommunityPost, type CommunityPostDTO } from "./communities.api";
import { postDtoToPost } from "./communities.adapters";
import { getLiving } from "../livingCommunities.data";
import type { Post } from "../community.model";

export interface CommunityPostResult {
  post: Post | null;
  /** True when the post does not exist, or exists behind a wall this viewer
   *  is not inside. The backend answers both with the same 404 on purpose, so
   *  holding a post id never confirms that a private community has it. */
  notFound: boolean;
  isLoading: boolean;
  /** A non-404 failure: the page offers a retry rather than a permanent
   *  "this post is gone". Never true in demo mode (no network). */
  isError: boolean;
  refetch: () => void;
}

const NOOP = () => {};

/**
 * One community post by id, for the permalink page
 * (`/community/:slug/post/:postId`).
 *
 * Demo mode reads the flagship mock's own pinned/pulse arrays synchronously,
 * so the page works standalone with no server. Live mode calls
 * `GET /communities/:slug/posts/:id`, which applies exactly the gates the
 * timeline applies to the same row.
 *
 * The query key is prefixed `["community-posts", slug]` deliberately: every
 * post mutation in `useCommunityMutations` already invalidates that prefix, so
 * a reply, reaction, edit, delete or restore performed on this page refreshes
 * it without a single new invalidation call.
 */
export function useCommunityPost(
  slug: string | undefined,
  postId: string | undefined,
): CommunityPostResult {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();

  const demoPost = useMemo(() => {
    if (!demoMode || !slug || !postId) return null;
    const living = getLiving(slug);
    if (!living) return null;
    return (
      [...living.pinned, ...living.pulse].find(
        (candidate) => candidate.id === postId,
      ) ?? null
    );
  }, [demoMode, slug, postId]);

  const query = useQuery<{ dto: CommunityPostDTO | null }>({
    queryKey: ["community-posts", slug, "post", postId, demoMode],
    enabled: !demoMode && Boolean(slug) && Boolean(postId),
    queryFn: async () => {
      try {
        return { dto: await getCommunityPost(slug!, postId!) };
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return { dto: null };
        }
        throw error;
      }
    },
  });

  // Mapped outside `queryFn` (the cached page stays a raw DTO) so the
  // adapter's translated fallbacks follow a language switch with no refetch,
  // matching `useCommunityPosts`.
  const livePost = useMemo(
    () =>
      query.data?.dto ? postDtoToPost(query.data.dto, slug ?? "", t) : null,
    [query.data, slug, t],
  );

  if (demoMode) {
    return {
      post: demoPost,
      notFound: !demoPost,
      isLoading: false,
      isError: false,
      refetch: NOOP,
    };
  }

  return {
    post: livePost,
    notFound: Boolean(query.data) && !query.data?.dto,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
