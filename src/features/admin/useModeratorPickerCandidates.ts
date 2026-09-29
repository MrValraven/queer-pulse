import { useMemo } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  isDebounceSettling,
  useDebouncedValue,
} from "../../shared/hooks/useDebouncedValue";
import type { AdminModeratorCandidateDTO } from "./api/adminCommunities.api";
import { useModeratorCandidates } from "./api/useAdminModerators";
import {
  MODERATOR_CANDIDATE_LIMIT,
  MODERATOR_CANDIDATE_SEARCH_DEBOUNCE_MS,
  searchDemoModeratorCandidates,
} from "./adminModeratorCandidates.data";

export interface ModeratorPickerCandidates {
  /** The capped, name-ordered answer; `undefined` until the first one lands. */
  candidates: AdminModeratorCandidateDTO[] | undefined;
  /** The search the shown candidates answer (debounced and trimmed). */
  settledSearchTerm: string;
  isLoading: boolean;
  isError: boolean;
  /** A retry after a failed load is running. `isError` stays true meanwhile,
   *  so the error row uses this to show the retry is at work. */
  isRetrying: boolean;
  /** A newer search is still debouncing or loading; the list on screen
   *  answers the previous one. */
  isSearchPending: boolean;
  /** The answer hit the cap, so more members may match than are shown. */
  isCapped: boolean;
  retry: () => void;
}

/**
 * The add-moderator picker's candidates (ENG-492), dual-mode. Live asks the
 * server, which folds accents and caps the answer at 25; the rows it returns
 * render as-is, so a handle or accent-folded match is never filtered back out
 * on the client. Demo runs the same folded match over the fixture roster,
 * minus `moderatorNames`, capped the same way.
 */
export function useModeratorPickerCandidates(
  communitySlug: string,
  moderatorNames: readonly string[],
  searchInput: string,
): ModeratorPickerCandidates {
  const { demoMode } = useDemoMode();
  const trimmedSearchTerm = searchInput.trim();
  const settledSearchTerm = useDebouncedValue(
    trimmedSearchTerm,
    MODERATOR_CANDIDATE_SEARCH_DEBOUNCE_MS,
  );
  const liveQuery = useModeratorCandidates(
    communitySlug,
    !demoMode,
    settledSearchTerm,
  );
  const demoCandidates = useMemo(
    () =>
      demoMode
        ? searchDemoModeratorCandidates(moderatorNames, settledSearchTerm)
        : undefined,
    [demoMode, moderatorNames, settledSearchTerm],
  );

  const candidates = demoMode ? demoCandidates : liveQuery.data;
  return {
    candidates,
    settledSearchTerm,
    isLoading: !demoMode && liveQuery.isLoading,
    isError: !demoMode && liveQuery.isError,
    isRetrying: !demoMode && liveQuery.isError && liveQuery.isFetching,
    isSearchPending:
      isDebounceSettling(trimmedSearchTerm, settledSearchTerm) ||
      (!demoMode && liveQuery.isPlaceholderData),
    isCapped: (candidates?.length ?? 0) >= MODERATOR_CANDIDATE_LIMIT,
    retry: () => void liveQuery.refetch(),
  };
}
