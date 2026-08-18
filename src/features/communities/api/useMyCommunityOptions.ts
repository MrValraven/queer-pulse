import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { CommunityRole } from "../membership.types";
import { useAllCommunities } from "../useAllCommunities";
import { useMyCommunities } from "./useMyCommunities";

export interface MyCommunityOption {
  slug: string;
  name: string;
}

/**
 * The viewer's own communities as a lean `{ slug, name }` list, for pickers
 * that let a member optionally attach something they're creating (a
 * gathering, a forum thread) to one of their communities.
 *
 * Mirrors the name-resolution `useCommunitiesHomeData` already does: live
 * mode's `GET /me/communities` carries the real name directly, so it's used
 * as-is. Demo mode's seeded membership store doesn't set `name`, so it falls
 * back to the static directory — consulted ONLY in demo, since resolving a
 * live slug against the mock directory could collide with an unrelated
 * community.
 *
 * `roles` narrows to communities where the viewer's standing is one of the
 * given roles (e.g. `["owner", "mod"]` for a picker that requires speaking
 * for the community, not just belonging to it) — omitted/empty keeps every
 * membership, unchanged for existing "attach to any of my communities"
 * callers (`ComposeThreadModal`, gathering creation).
 */
export function useMyCommunityOptions(
  options: { roles?: CommunityRole[] } = {},
): MyCommunityOption[] {
  const { roles } = options;
  const { demoMode } = useDemoMode();
  const memberships = useMyCommunities();
  const communities = useAllCommunities();

  return useMemo(
    () =>
      Object.entries(memberships)
        .filter(([, membership]) => !roles?.length || roles.includes(membership.role))
        .map(([slug, membership]) => {
          const directoryEntry = demoMode
            ? communities.find((community) => community.slug === slug)
            : undefined;
          return {
            slug,
            name: membership.name ?? directoryEntry?.name ?? slug,
          };
        }),
    [memberships, communities, demoMode, roles],
  );
}
