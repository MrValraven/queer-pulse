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
import { spotlightCommunities } from "../sections/Communities.data";
import { changemakers } from "../data/changemakers";

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
    })),
    communities: spotlightCommunities.map((community) => ({
      id: community.anchor,
      slug: community.anchor,
      name: community.name,
      memberCount: community.members,
      blurb: community.desc,
    })),
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
