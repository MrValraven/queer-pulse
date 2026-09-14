import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../shared/api/client";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getCommunityGateCard } from "./communities.api";
import type { CommunityGateCardDTO } from "./communities.api";
import { useAllCommunities } from "../useAllCommunities";
import { getCommunityDetail } from "../communityDetail.lookup";
import { getLiving } from "../livingCommunities.data";

export interface CommunityGateCardResult {
  card: CommunityGateCardDTO | null;
  isLoading: boolean;
  isError: boolean;
  /** The community is gone, or private and this viewer holds no invitation.
   *  The caller clears `?gate=` and shows nothing, which is the same silent
   *  disappearance a private community already gets. */
  notFound: boolean;
  refetch: () => void;
}

const NOOP = () => {};
const EMPTY: CommunityGateCardResult = {
  card: null,
  isLoading: false,
  isError: false,
  notFound: false,
  refetch: NOOP,
};

/**
 * `GET /communities/:slug/gate`: what a signed-in non-member may see of a
 * closed community.
 *
 * Demo mode assembles the same shape from the mock registries instead of
 * fetching, so the prototype shows a real gate rather than a spinner. The
 * demo card is honestly thinner than the live one: the registry carries no
 * place, no languages and no gathering calendar, so those fields come back
 * null/empty and the modal simply omits their rows.
 */
export function useCommunityGateCard(
  slug: string | undefined,
): CommunityGateCardResult {
  const { demoMode } = useDemoMode();
  const all = useAllCommunities();

  const query = useQuery({
    queryKey: ["community-gate-card", slug],
    enabled: !demoMode && Boolean(slug),
    queryFn: async () => {
      try {
        return await getCommunityGateCard(slug!);
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
  });

  if (demoMode) {
    const community = all.find((candidate) => candidate.slug === slug);
    if (!slug || !community) return { ...EMPTY, notFound: true };
    const detail = getCommunityDetail(slug);
    const living = getLiving(slug);
    const memberCount = Number.parseInt(community.count, 10);
    return {
      ...EMPTY,
      card: {
        slug,
        name: community.name,
        tagline: community.description,
        // Demo `purpose` is EMPTY whenever the registry's prose is JSX, and
        // that is accepted, not a bug to engineer around. The demo registry
        // (`communityDetails.data.tsx`) stores `about` as React nodes because
        // those paragraphs carry formatting, and `queer-poc`, the demo's one
        // reachable gated community, has every `about` entry as JSX. Live mode
        // never takes this branch: it reads `purpose` from a real string
        // column on `CommunityGateCardDTO`. `CommunityGateModal` omits the
        // purpose section when the string is empty, so the card degrades to
        // name plus tagline instead of breaking.
        //
        // Do NOT "fix" this by flattening the JSX to text (the formatting is
        // the reason it is JSX) or by falling back to the tagline, which is
        // already the modal's subtitle and would just print twice.
        purpose: typeof detail?.about[0] === "string" ? detail.about[0] : "",
        type: community.type,
        accessTier:
          living?.accessTier ??
          community.accessTier ??
          (community.privateBadge ? "private" : "public"),
        tags: community.tags ?? [],
        city: null,
        area: null,
        isOnline: false,
        languages: [],
        memberCount: Number.isNaN(memberCount) ? 0 : memberCount,
        avatarImageUrl: community.avatarImageUrl ?? null,
        coverImageUrl: community.coverImageUrl ?? null,
        nextGathering: null,
      },
    };
  }

  if (query.data === null && !query.isLoading) {
    return { ...EMPTY, notFound: true };
  }
  return {
    card: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    notFound: false,
    refetch: () => void query.refetch(),
  };
}
