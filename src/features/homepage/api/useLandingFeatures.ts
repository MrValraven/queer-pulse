import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getLandingFeaturesPublic,
  type LandingChangemakerFeatureDTO,
  type LandingCommunityFeatureDTO,
  type LandingFeaturesResponseDTO,
  type LandingMemberFeatureDTO,
} from "../../admin/api/landingFeatures.api";
import { spotlights } from "../sections/Discovery.data";
import {
  type CommunityAccess,
  type RoomKey,
  spotlightCommunities,
} from "../sections/Communities.data";
import type {
  AccessTier,
  CommunityType,
} from "../../communities/api/communities.api";
import { changemakers } from "../data/changemakers";

// Demo fixtures speak the prototype's vocabulary; the public DTO speaks the
// backend's. These two maps translate a demo community into the same rich shape
// the live `/landing/features` endpoint returns, so the demo showcase could
// render through the live card unchanged.
const DEMO_ACCESS_TO_TIER: Record<CommunityAccess, AccessTier> = {
  open: "public",
  request: "request",
  private: "private",
};
const DEMO_ROOM_TO_FEATURE: Record<RoomKey, string> = {
  Pulse: "rooms",
  Discussions: "discussion",
  Events: "events",
  Resources: "library",
};

export interface LandingFeaturesResult {
  members: LandingMemberFeatureDTO[];
  communities: LandingCommunityFeatureDTO[];
  changemakers: LandingChangemakerFeatureDTO[];
  isLoading: boolean;
}

/**
 * The homepage's featured members/communities/changemakers, adapted from the
 * rich static prototype fixtures — demo mode's showcase stays exactly as
 * curated-looking as it always has, just reshaped to the public landing DTOs
 * so a `Live*` section could (hypothetically) render it unchanged.
 */
function demoLandingFeatures(): LandingFeaturesResponseDTO {
  return {
    members: spotlights.map(({ member, quote }) => ({
      id: member.key,
      slug: member.key,
      name: member.name,
      tagline: member.role,
      avatarUrl: member.photo ?? null,
      quote,
      tags: member.tags,
    })),
    communities: spotlightCommunities.map((community) => {
      const shared = {
        id: community.anchor,
        slug: community.anchor,
        name: community.name,
        memberCount: community.members,
        blurb: community.desc,
        accessTier: DEMO_ACCESS_TO_TIER[community.access],
        foundedYear: community.founded,
      };
      // A quiet (members-only) community carries none of the rich fields — map
      // it to the honest minimum, same as a real private community.
      if (community.quiet) {
        return {
          ...shared,
          coverImageUrl: null,
          category: "support" as CommunityType,
          features: [],
          owner: null,
          faces: [],
        };
      }
      return {
        ...shared,
        coverImageUrl: community.photoSrc ?? null,
        category: community.category,
        features: community.rooms.map((room) => DEMO_ROOM_TO_FEATURE[room]),
        owner: { name: community.host.name, avatarUrl: null },
        // Demo faces are initials-only; spacing the letters makes the view's
        // `initialsFromName` reproduce the same mark (e.g. "RM" → "R M" → "RM").
        faces: community.faces.map((face) => ({
          name: face.initials.split("").join(" "),
          avatarUrl: null,
        })),
      };
    }),
    changemakers: changemakers.map((person) => ({
      id: person.key,
      slug: person.key,
      name: person.name,
      cause: person.cause,
      blurb: person.blurb,
      tags: person.tags,
    })),
  };
}

/**
 * The public homepage's admin-curated feature slices, dual-mode.
 *
 * - **Demo**: the existing rich static homepage fixtures, adapted to the same
 *   public DTO shape the live endpoint returns — no network call.
 * - **Live**: `GET /landing/features`, whatever the admin team has curated in
 *   the landing-features console. A section with nothing curated returns an
 *   empty array; callers render nothing rather than fabricate content.
 */
export function useLandingFeaturesPublic(): LandingFeaturesResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<LandingFeaturesResponseDTO>({
    queryKey: ["landing-features", demoMode],
    queryFn: () =>
      demoMode
        ? Promise.resolve(demoLandingFeatures())
        : getLandingFeaturesPublic(),
  });

  return {
    members: query.data?.members ?? [],
    communities: query.data?.communities ?? [],
    changemakers: query.data?.changemakers ?? [],
    isLoading: query.isLoading,
  };
}
