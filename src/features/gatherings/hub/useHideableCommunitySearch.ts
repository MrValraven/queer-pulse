import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useCommunityMembership } from "../../../app/providers/useCommunityMembership";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import { foldForSearch } from "../../../shared/lib/foldForSearch";
import { useCommunities } from "../../communities/api/useCommunities";
import { DEMO_EVENT_COMMUNITIES } from "../hiddenEventCommunities.data";

/** How long typing has to pause before the term becomes a request. */
const SEARCH_DEBOUNCE_MS = 250;
/** Rows the refine group offers at once. A name search lands in the first few. */
const RESULT_LIMIT = 6;

export interface HideableCommunity {
  slug: string;
  name: string;
  avatarImageUrl: string | null;
}

export interface HideableCommunitySearch {
  /** Communities whose events the member could hide, at most `RESULT_LIMIT`. */
  matches: HideableCommunity[];
  /** The typed term's answer is on its way and nothing on hand matches it. */
  isAwaiting: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Communities a member can hide from the events lists, searched by name.
 *
 * Live reads the discover list (`useCommunities`, `q`, sorted by name), which
 * already holds every public community plus the private ones the viewer is
 * on. Demo filters `DEMO_EVENT_COMMUNITIES` and drops a private community the
 * demo viewer is outside, the rule `useGuestCommunityCandidates` applies.
 *
 * While the debounce catches up, the rows on hand answered an older term, so
 * in that window they are narrowed to names that match what is typed.
 */
export function useHideableCommunitySearch(
  searchTerm: string,
): HideableCommunitySearch {
  const { demoMode } = useDemoMode();
  const { memberships } = useCommunityMembership();
  const trimmedSearchTerm = searchTerm.trim();
  const debouncedSearchTerm = useDebouncedValue(
    trimmedSearchTerm,
    SEARCH_DEBOUNCE_MS,
  );
  const directory = useCommunities(
    debouncedSearchTerm
      ? { q: debouncedSearchTerm, sort: "name" }
      : { sort: "name" },
    {
      enabled: !demoMode && trimmedSearchTerm !== "",
      shouldKeepPreviousResults: true,
    },
  );
  const typedNeedle = foldForSearch(trimmedSearchTerm);

  if (demoMode) {
    const matches =
      typedNeedle === ""
        ? []
        : DEMO_EVENT_COMMUNITIES.filter((community) => {
            const isHiddenPrivate =
              community.accessTier === "private" &&
              !memberships[community.slug];
            return (
              !isHiddenPrivate &&
              foldForSearch(community.name).includes(typedNeedle)
            );
          })
            .slice(0, RESULT_LIMIT)
            .map(({ slug, name, avatarImageUrl }) => ({
              slug,
              name,
              avatarImageUrl,
            }));
    return { matches, isAwaiting: false, isError: false, refetch: noop };
  }

  const isAnswerCurrent =
    debouncedSearchTerm === trimmedSearchTerm &&
    !directory.isLoading &&
    !directory.isShowingPreviousResults;
  const matches: HideableCommunity[] = [];
  for (const community of directory.items) {
    if (matches.length === RESULT_LIMIT) break;
    const slug = community.slug;
    if (!slug) continue;
    const isStaleMismatch =
      !isAnswerCurrent &&
      typedNeedle !== "" &&
      !foldForSearch(community.name).includes(typedNeedle);
    if (isStaleMismatch) continue;
    matches.push({
      slug,
      name: community.name,
      avatarImageUrl: community.avatarImageUrl ?? null,
    });
  }

  return {
    matches,
    isAwaiting: !isAnswerCurrent && matches.length === 0,
    isError: directory.isError,
    refetch: directory.refetch,
  };
}

function noop() {}
