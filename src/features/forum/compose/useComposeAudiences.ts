import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAllCommunities } from "../../communities/useAllCommunities";
import { useMyCommunityOptions } from "../../communities/api/useMyCommunityOptions";
import type { ComposeAudience } from "./composeThread.types";

// ── Where this member may post ──────────────────────────────────────────────
// `ComposeAudienceList` builds the town square row itself, so this is the
// member's own communities and nothing else.
//
// `GET /me/communities` carries a slug, a name and a role — no access tier and
// no roster size — so `isPrivate` and `memberCount` can only be resolved in
// demo mode, where the static directory holds both. That is the honest shape
// rather than a guess: the private-community nudge is a NEUTRAL note about who
// will see the post, so a live member simply does not get it, whereas
// inventing `isPrivate: true` would tell someone their post is hidden when it
// is not. The demo directory is consulted in demo mode ALONE, matching
// `useMyCommunityOptions`: a real slug that happened to match a prototype
// fixture would otherwise be described by the mock.

/** Pulls the number out of the directory's already-translated count label
 *  ("128 members" / "128 membros"), or undefined when there is none to read. */
function memberCountFrom(label: string | undefined): number | undefined {
  if (!label) return undefined;
  const digits = label.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : undefined;
}

export function useComposeAudiences(): ComposeAudience[] {
  const { demoMode } = useDemoMode();
  const myCommunities = useMyCommunityOptions();
  const directory = useAllCommunities();

  return useMemo(
    () =>
      myCommunities.map((community) => {
        const entry = demoMode
          ? directory.find((candidate) => candidate.slug === community.slug)
          : undefined;
        const count = memberCountFrom(entry?.count);
        return {
          slug: community.slug,
          name: community.name,
          isPrivate:
            entry?.accessTier === "private" || entry?.privateBadge === true,
          ...(count === undefined ? {} : { memberCount: count }),
        };
      }),
    [myCommunities, directory, demoMode],
  );
}
