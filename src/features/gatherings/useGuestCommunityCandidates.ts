import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { foldForSearch } from "../../shared/lib/foldForSearch";
import { useCommunities } from "../communities/api/useCommunities";
import { useMyCommunities } from "../communities/api/useMyCommunities";
import type { AccessTier } from "../communities/membership.types";
import {
  GUEST_COMMUNITY_RESULT_LIMIT,
  GUEST_COMMUNITY_SEARCH_DEBOUNCE_MS,
} from "./guestCommunities";

export interface GuestCommunityCandidate {
  slug: string;
  name: string;
  accessTier: AccessTier;
  /** The community's type, the option's quiet second line. */
  typeLabel: string;
}

export interface GuestCommunityCandidates {
  /** Communities to offer, at most `GUEST_COMMUNITY_RESULT_LIMIT`. */
  matches: GuestCommunityCandidate[];
  /** The typed term's answer is on its way and nothing on hand matches it. */
  isAwaitingMatches: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Communities an organiser can invite as guests: every community they can
 * see, searched on the server through `useCommunities` (`q`, sorted by
 * name). The live discover list already holds every public community plus
 * the private ones the viewer belongs to; demo mode's registry holds every
 * private one too, so demo alone drops a private community the viewer is
 * outside. The lead and every listed community are left out.
 *
 * While the debounce catches up, the rows on hand answered an older term,
 * so in that window only they are narrowed to names that match what is
 * typed. A current answer is shown as the server sent it, since the server
 * also matches the tagline and purpose.
 */
export function useGuestCommunityCandidates({
  searchTerm,
  hasOpenedList,
  excludedSlugs,
}: {
  searchTerm: string;
  hasOpenedList: boolean;
  excludedSlugs: readonly string[];
}): GuestCommunityCandidates {
  const { demoMode } = useDemoMode();
  const memberships = useMyCommunities();
  const trimmedSearchTerm = searchTerm.trim();
  const debouncedSearchTerm = useDebouncedValue(
    trimmedSearchTerm,
    GUEST_COMMUNITY_SEARCH_DEBOUNCE_MS,
  );
  const isListWanted = hasOpenedList || trimmedSearchTerm !== "";
  const directory = useCommunities(
    debouncedSearchTerm
      ? { q: debouncedSearchTerm, sort: "name" }
      : { sort: "name" },
    { enabled: isListWanted, shouldKeepPreviousResults: true },
  );
  const isAnswerCurrent =
    debouncedSearchTerm === trimmedSearchTerm &&
    !directory.isLoading &&
    !directory.isShowingPreviousResults;
  const excluded = new Set(excludedSlugs.filter(Boolean));
  const typedNeedle = foldForSearch(trimmedSearchTerm);

  const candidates: GuestCommunityCandidate[] = [];
  for (const community of directory.items) {
    const slug = community.slug;
    if (!slug || excluded.has(slug)) continue;
    const accessTier = community.accessTier ?? "public";
    const isHiddenPrivate =
      demoMode && accessTier === "private" && !memberships[slug];
    if (isHiddenPrivate) continue;
    const isStaleMismatch =
      !isAnswerCurrent &&
      typedNeedle !== "" &&
      !foldForSearch(community.name).includes(typedNeedle);
    if (isStaleMismatch) continue;
    candidates.push({
      slug,
      name: community.name,
      accessTier,
      typeLabel: community.typeLabel,
    });
  }
  const matches = candidates.slice(0, GUEST_COMMUNITY_RESULT_LIMIT);

  return {
    matches,
    isAwaitingMatches: !isAnswerCurrent && matches.length === 0,
    isError: directory.isError,
    refetch: directory.refetch,
  };
}
