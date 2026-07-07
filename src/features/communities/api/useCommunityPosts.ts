import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getCommunityPosts } from "./communities.api";
import { postsToPulse } from "./communities.adapters";
import { getLiving } from "../livingCommunities.data";
import type { Post } from "../community.model";

export interface CommunityPostsResult {
  pinned: Post[];
  pulse: Post[];
}

/**
 * A community's Pulse feed. Demo returns the flagship's mock pinned/pulse posts
 * synchronously; live calls GET /communities/:slug/posts and splits the page
 * into pinned announcements + the running feed the Pulse tab renders.
 */
export function useCommunityPosts(
  slug: string | undefined,
  page?: number,
): CommunityPostsResult {
  const { demoMode } = useDemoMode();
  const query = useQuery<CommunityPostsResult>({
    queryKey: ["community-posts", slug, page],
    enabled: !demoMode && Boolean(slug),
    queryFn: async () => {
      const res = await getCommunityPosts(slug!, page);
      return postsToPulse(res.items, slug!);
    },
  });
  if (demoMode) {
    const living = getLiving(slug);
    return { pinned: living?.pinned ?? [], pulse: living?.pulse ?? [] };
  }
  return query.data ?? { pinned: [], pulse: [] };
}
