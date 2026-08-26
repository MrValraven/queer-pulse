import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../app/providers/useCommunityMembership";
import { useCommunity } from "./api/useCommunity";
import { useCommunityPost } from "./api/useCommunityPost";
import { useCommunityReplies } from "./api/useCommunityReplies";
import { useRoster } from "./api/useRoster";
import { replyDtoToPostReply } from "./api/communities.adapters";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { usePulseTabActions } from "./usePulseTabActions";
import type { Post } from "./community.model";

/**
 * Everything the single-post permalink page needs: the community it belongs
 * to, the post itself with every reply loaded so far, the viewer's standing,
 * and the same write handlers the Pulse timeline uses.
 *
 * A plain hook (returns no JSX), so the repo's 200-line-per-component limit
 * does not apply to it and `CommunityPostPage` stays layout only. It mirrors
 * `useCommunityDetailState`, which does the same job for the hub.
 *
 * Returns a discriminated status: `notFound` (the post is gone, or behind a
 * wall this viewer is not inside, which the backend answers identically),
 * `error` (retryable), `loading`, or `ready`.
 */
export function useCommunityPostState() {
  const { slug, postId } = useParams();
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const { isMember, roleIn } = useCommunityMembership();

  const {
    community,
    myRole,
    notFound: isCommunityNotFound,
    isLoading: isCommunityLoading,
    isError: isCommunityError,
    refetch: refetchCommunity,
  } = useCommunity(slug);
  const postResult = useCommunityPost(slug, postId);
  const rosterResult = useRoster(slug);
  const actions = usePulseTabActions({
    slug: slug ?? "",
    roster: rosterResult.roster,
  });

  const post = postResult.post;
  // The DTO embeds a bounded oldest-first PREVIEW of the replies. A permalink
  // is where a member reads the whole conversation, so anything past that
  // window is appended here through the same "load more" endpoint the
  // Discussion view uses.
  const repliesPaging = useCommunityReplies(
    slug ?? "",
    postId,
    post?.replyCount ?? post?.replies.length ?? 0,
    post?.replies.length ?? 0,
  );

  const postWithAllReplies = useMemo<Post | null>(() => {
    if (!post) return null;
    if (repliesPaging.extraReplies.length === 0) return post;
    return {
      ...post,
      replies: [
        ...post.replies,
        ...repliesPaging.extraReplies.map((reply) =>
          replyDtoToPostReply(reply, t),
        ),
      ],
    };
  }, [post, repliesPaging.extraReplies, t]);

  if (isCommunityNotFound || postResult.notFound) {
    return { status: "notFound" as const, slug };
  }
  if (isCommunityError || postResult.isError) {
    return {
      status: "error" as const,
      slug,
      refetch: () => {
        refetchCommunity();
        postResult.refetch();
      },
    };
  }
  if (isCommunityLoading || postResult.isLoading || !community) {
    return { status: "loading" as const, slug };
  }
  if (!postWithAllReplies) {
    // The community resolved but the post query has not produced a row and did
    // not 404 either. Treat it as still arriving rather than as missing.
    return { status: "loading" as const, slug };
  }

  // Membership: the session provider is the demo source of truth, live mode
  // reads the viewer's role off the community DTO. Identical to
  // `useCommunityDetailState`, so the permalink grants exactly what the
  // timeline grants and nothing more.
  const isJoined = demoMode ? (slug ? isMember(slug) : false) : myRole != null;
  const role = demoMode ? (slug ? roleIn(slug) : null) : myRole;

  return {
    status: "ready" as const,
    slug: slug ?? "",
    community,
    post: postWithAllReplies,
    isJoined,
    canModerate: role === "owner" || role === "mod",
    repliesPaging,
    actions,
  };
}
