import { useEffect } from "react";
import { useMyCommunitiesResolving } from "../communities/api/useMyCommunities";
import {
  useMyCommunityOptions,
  type MyCommunityOption,
} from "../communities/api/useMyCommunityOptions";
import type { CommunityRole } from "../communities/membership.types";

/** The roles that may speak for a community. Module-level so the options
 *  memo below keeps its identity between renders. */
const COMMUNITY_STAFF_ROLES: CommunityRole[] = ["owner", "co_owner", "mod"];

/**
 * The communities this viewer may host a gathering with: the ones they own,
 * co-own or moderate. Hosting puts the community's name on the event page
 * ("with Queer Runners Lisboa"), and that is a claim to speak for it, so an
 * ordinary member cannot make it, whatever the gathering's audience. The
 * server enforces the same rule on create and on a `communitySlug` change.
 */
export function useHostableCommunities(): {
  options: MyCommunityOption[];
  /** True while the live membership list is still loading, when an empty
   *  `options` means "not known yet" rather than "none". */
  isResolving: boolean;
} {
  return {
    options: useMyCommunityOptions({ roles: COMMUNITY_STAFF_ROLES }),
    isResolving: useMyCommunitiesResolving(),
  };
}

/**
 * Clears a community the wizard was handed but this host cannot host with: a
 * hand-edited `?community=` link, a duplicated gathering or a resumed draft
 * from a community they have since stepped down from. Without this the
 * picker would show nothing picked while the publish still sent the slug,
 * and the server would refuse it. Waits for the membership list, so a slow
 * load never drops a valid pick.
 */
export function useDropUnhostableCommunity(form: {
  communitySlug: string;
  setCommunitySlug: (value: string) => void;
}) {
  const { options, isResolving } = useHostableCommunities();
  const { communitySlug, setCommunitySlug } = form;
  const isHostable = options.some(
    (community) => community.slug === communitySlug,
  );
  const shouldDrop = communitySlug !== "" && !isResolving && !isHostable;
  useEffect(() => {
    if (shouldDrop) setCommunitySlug("");
  }, [shouldDrop, setCommunitySlug]);
}
