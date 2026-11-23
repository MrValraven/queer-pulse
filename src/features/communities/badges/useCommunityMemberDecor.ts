import { useMemo, useSyncExternalStore } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { CommunityFlairDTO } from "./api/communityBadges.api";
import {
  demoMemberDecor,
  getCommunityBadgesDemoVersion,
  subscribeCommunityBadgesDemo,
} from "./communityBadgesDemoStore";
import { useDemoBadgeViewerResolver } from "./useDemoBadgeViewer";

export interface CommunityMemberDecor {
  flair: CommunityFlairDTO | null;
  hasRecentGift: boolean;
}

interface DecorMember {
  slug?: string;
  flair?: CommunityFlairDTO | null;
  hasRecentGift?: boolean;
}

const NO_DECOR: CommunityMemberDecor = { flair: null, hasRecentGift: false };

/** Live mode never listens to the demo store. */
const subscribeToNothing = () => () => {};

/**
 * What a member's name line shows in a community: the worn badge and whether a
 * gift mark is showing. Every name-line surface reads it through this one hook.
 *
 * Live reads the fields the roster, post and reply DTOs carry, so an older
 * backend renders nothing. Demo joins the badges demo store by member slug at
 * render and re-renders when the store changes (wearing, switching a badge
 * off, sending a gift), because the demo mocks carry no such fields. The demo
 * viewer's own name line follows their demo membership, so it shows no decor
 * once they leave, as live drops it with the roster row. A member without a
 * slug has no decor in either mode.
 */
export function useCommunityMemberDecor(
  communitySlug: string | undefined,
  member: DecorMember,
): CommunityMemberDecor {
  const { demoMode } = useDemoMode();
  // Two context reads; live mode never calls what it returns.
  const resolveDemoViewer = useDemoBadgeViewerResolver();
  const storeVersion = useSyncExternalStore(
    demoMode ? subscribeCommunityBadgesDemo : subscribeToNothing,
    getCommunityBadgesDemoVersion,
  );
  const memberSlug = member.slug;
  const liveFlair = member.flair ?? null;
  const liveHasRecentGift = member.hasRecentGift === true;

  return useMemo(() => {
    if (!communitySlug || !memberSlug) return NO_DECOR;
    if (demoMode) {
      return demoMemberDecor(
        communitySlug,
        memberSlug,
        resolveDemoViewer(communitySlug),
      );
    }
    return { flair: liveFlair, hasRecentGift: liveHasRecentGift };
    // The store version is not read inside, but a store write must rerun the
    // demo join.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    demoMode,
    communitySlug,
    memberSlug,
    liveFlair,
    liveHasRecentGift,
    resolveDemoViewer,
    storeVersion,
  ]);
}
