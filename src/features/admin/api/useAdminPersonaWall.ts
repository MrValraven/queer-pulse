import {
  keepPreviousData,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  isDebounceSettling,
  useDebouncedValue,
} from "../../../shared/hooks/useDebouncedValue";
import {
  PERSONA_WALL_SEARCH_MAX_LENGTH,
  type PersonaWallAdminDTO,
  type PersonaWallSearchResultDTO,
} from "../../subprofiles/api/personaWall.api";
import {
  getAdminPersonaWall,
  searchAdminPersonaWall,
} from "./adminPersonaWall.api";

/** Every admin wall query, list and search, both modes. */
export const ADMIN_PERSONA_WALL_ROOT = ["admin", "personaWall"] as const;

/** Every admin wall search, both modes. Adding or removing a pick makes
 *  the `isPicked` flags stale. */
export const ADMIN_PERSONA_WALL_SEARCH_ROOT = [
  "admin",
  "personaWall",
  "search",
] as const;

/** The admin wall's key. The mode rides at the end, since a demo/live
 *  switch keeps the query cache. */
export const adminPersonaWallKey = (isDemoMode: boolean) =>
  ["admin", "personaWall", { demo: isDemoMode }] as const;

export const adminPersonaWallSearchKey = (term: string, isDemoMode: boolean) =>
  ["admin", "personaWall", "search", term, { demo: isDemoMode }] as const;

const SEARCH_DEBOUNCE_MS = 250;
const LIVE_STALE_MS = 30_000;

/** The wall curation page's picks, fill order and preview. Demo reads the
 *  shared demo store, which only the admin writes change, so it never goes
 *  stale there. */
export function useAdminPersonaWall(): UseQueryResult<
  PersonaWallAdminDTO,
  Error
> {
  const { demoMode } = useDemoMode();
  return useQuery<PersonaWallAdminDTO, Error>({
    queryKey: adminPersonaWallKey(demoMode),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : LIVE_STALE_MS,
    // Opening the page always reads the wall again, so a state chip reflects
    // an owner's or a moderator's change made since the last visit.
    refetchOnMount: "always",
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoAdminPersonaWall } =
          await import("../../subprofiles/personaWallDemoStore");
        return demoAdminPersonaWall();
      }
      return getAdminPersonaWall(signal);
    },
  });
}

export interface PersonaWallCandidateSearch {
  /** The trimmed, capped term the results belong to. */
  term: string;
  results: PersonaWallSearchResultDTO[];
  /** True while the term is empty: the dialog shows its idle prompt. */
  isIdle: boolean;
  /** True while a typed term waits for the debounce or its answer. */
  isSearching: boolean;
  isError: boolean;
  error: unknown;
  retry: () => void;
}

/** One shared empty list, so a caller's memo over `results` stays stable. */
const NO_RESULTS: PersonaWallSearchResultDTO[] = [];

/**
 * The Add persona dialog's search. The typed text is trimmed and cut to 100
 * characters, then debounced by 250ms. A blank term sends no request, since
 * the server answers an empty list for it anyway. While the next term loads,
 * the previous results stay on screen.
 */
export function usePersonaWallCandidateSearch(
  query: string,
): PersonaWallCandidateSearch {
  const { demoMode } = useDemoMode();
  const typedTerm = query.trim().slice(0, PERSONA_WALL_SEARCH_MAX_LENGTH);
  const debouncedTerm = useDebouncedValue(typedTerm, SEARCH_DEBOUNCE_MS);
  // A cleared field skips the debounce, so the idle prompt shows at once and
  // the last term's results leave with it.
  const term = typedTerm === "" ? "" : debouncedTerm;
  const isEnabled = term.length > 0;
  const searchQuery = useQuery<PersonaWallSearchResultDTO[]>({
    queryKey: adminPersonaWallSearchKey(term, demoMode),
    enabled: isEnabled,
    staleTime: LIVE_STALE_MS,
    placeholderData: keepPreviousData,
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { demoSearchPersonaWall } =
          await import("../../subprofiles/personaWallDemoStore");
        return demoSearchPersonaWall(term);
      }
      return searchAdminPersonaWall(term, signal);
    },
  });
  const isWaitingForDebounce =
    typedTerm !== "" && isDebounceSettling(typedTerm, term);
  return {
    term,
    results: isEnabled ? (searchQuery.data ?? NO_RESULTS) : NO_RESULTS,
    isIdle: term === "",
    isSearching: isWaitingForDebounce || (isEnabled && searchQuery.isFetching),
    isError: isEnabled && searchQuery.isError,
    error: searchQuery.error,
    retry: () => {
      if (isEnabled) void searchQuery.refetch();
    },
  };
}
