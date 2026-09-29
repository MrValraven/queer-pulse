import { useMemo } from "react";
import type { LivingCommunity, Post, PulseMoment } from "./community.model";
import type { usePulseTabActions } from "./usePulseTabActions";

/** One row of the interleaved Pulse feed: a post, or a system moment. */
export interface PulseFeedItem {
  post?: Post;
  moment?: PulseMoment;
}

/**
 * Splits a community's pinned + regular posts into the pinned rail and the
 * interleaved main feed (system moments dropped in between posts so the feed
 * reads as alive). Extracted from `PulseTab` so that component stays under
 * the repo's 200-line limit; a plain hook returns no JSX, so the limit
 * doesn't apply here.
 *
 * The merge happens here so a pin override can move a post between the two
 * sections without waiting on a refetch: demo mode has no refetch to rely
 * on, see `actions.isPinnedEffective`.
 */
export function usePulseFeedData(
  community: Pick<LivingCommunity, "pinned" | "pulse" | "moments">,
  actions: Pick<
    ReturnType<typeof usePulseTabActions>,
    "isPinnedEffective" | "mine"
  >,
) {
  const allLivingPosts = useMemo(
    () => [...community.pinned, ...community.pulse],
    [community.pinned, community.pulse],
  );
  const pinnedPosts = allLivingPosts.filter(actions.isPinnedEffective);
  const regularPosts = allLivingPosts.filter(
    (post) => !actions.isPinnedEffective(post),
  );

  const feed: PulseFeedItem[] = [];
  [...actions.mine, ...regularPosts].forEach((post, index) => {
    feed.push({ post });
    const moment = community.moments[index];
    if (moment) feed.push({ moment });
  });
  const isFeedEmpty = pinnedPosts.length === 0 && feed.length === 0;

  return { pinnedPosts, feed, isFeedEmpty };
}
