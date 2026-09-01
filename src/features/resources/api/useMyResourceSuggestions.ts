import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getMyResourceSuggestions,
  type MyResourceSuggestionDTO,
} from "./resourceSuggestions.api";

/** Stable empty array so a "nothing suggested yet" render keeps its identity. */
const EMPTY_SUGGESTIONS: MyResourceSuggestionDTO[] = [];

export interface MyResourceSuggestionsResult {
  /** Newest first, with an id tiebreak, so the order never flickers. */
  suggestions: MyResourceSuggestionDTO[];
  /** True while the live fetch is in flight. */
  isLoading: boolean;
  /**
   * True when the request failed. Branch on it before rendering any "you have
   * not suggested anything yet" copy: an outage rendered as an empty tracker
   * tells a member their submission was lost.
   */
  isError: boolean;
  /** Re-runs the failed request. Wire it to `LoadErrorState`'s `onRetry`. */
  refetch: () => void;
}

/**
 * The member's own resource suggestions and what was decided on each
 * (PRD-45). Backs the resources section of `/account/submissions`.
 *
 * Until this existed, suggesting a resource was a black hole: the admin queue
 * recorded the member's id and the reviewer's note, and nothing ever came
 * back. The decision notification is the push half of the answer; this is the
 * half a member can go and look at whenever they want.
 *
 * Demo mode never calls the endpoint (`enabled: !demoMode`), matching
 * `useResourceListings`. A demo surface supplies its own fixture rows
 * alongside the page rather than having this hook fabricate them, so the live
 * path here never reads the mock registry.
 */
export function useMyResourceSuggestions(): MyResourceSuggestionsResult {
  const { demoMode } = useDemoMode();
  const suggestionsQuery = useQuery({
    queryKey: ["resource-suggestions", "mine"],
    enabled: !demoMode,
    queryFn: getMyResourceSuggestions,
  });
  return {
    suggestions: suggestionsQuery.data?.items ?? EMPTY_SUGGESTIONS,
    isLoading: suggestionsQuery.isLoading,
    isError: suggestionsQuery.isError,
    refetch: () => void suggestionsQuery.refetch(),
  };
}
