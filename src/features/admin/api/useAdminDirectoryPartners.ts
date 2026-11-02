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
import type {
  AdminDirectoryPartnerDTO,
  AdminDirectoryPartnerSearchResultDTO,
} from "../../marketing/api/directoryPartners.api";
import {
  getAdminDirectoryPartners,
  searchAdminDirectoryPartnerCandidates,
} from "./adminDirectoryPartners.api";

export const ADMIN_DIRECTORY_PARTNERS_ROOT = "admin-directory-partners";

export const adminDirectoryPartnersKey = (isDemoMode: boolean) =>
  [ADMIN_DIRECTORY_PARTNERS_ROOT, "list", isDemoMode] as const;

/** The longest search term the server reads (contract amendment 3). */
export const DIRECTORY_PARTNER_SEARCH_MAX = 80;

const SEARCH_DEBOUNCE_MS = 250;
const LIVE_STALE_MS = 30_000;

/** The Partners tab list. Demo reads the shared demo store, which only the
 *  admin writes change, so it never goes stale there. */
export function useAdminDirectoryPartners(): UseQueryResult<
  AdminDirectoryPartnerDTO[],
  Error
> {
  const { demoMode } = useDemoMode();
  return useQuery<AdminDirectoryPartnerDTO[], Error>({
    queryKey: adminDirectoryPartnersKey(demoMode),
    staleTime: demoMode ? Number.POSITIVE_INFINITY : LIVE_STALE_MS,
    // Opening the tab always reads the list again, so a "Not showing" line
    // reflects moderation done in another tab since the last visit.
    refetchOnMount: "always",
    meta: { silentError: true },
    queryFn: async () => {
      if (demoMode) {
        const demoStore =
          await import("../../marketing/directoryPartnersDemoStore");
        return demoStore.demoAdminDirectoryPartners();
      }
      return getAdminDirectoryPartners();
    },
  });
}

export interface DirectoryPartnerCandidateSearch {
  /** The trimmed, capped term the results belong to. */
  term: string;
  results: AdminDirectoryPartnerSearchResultDTO[];
  /** True while the term is empty: the picker shows its idle prompt. */
  isIdle: boolean;
  /** True while a typed term waits for the debounce or its answer. */
  isSearching: boolean;
  isError: boolean;
  error: unknown;
  retry: () => void;
}

/** One shared empty list, so a caller's memo over `results` stays stable. */
const NO_RESULTS: AdminDirectoryPartnerSearchResultDTO[] = [];

/**
 * The Add partner picker's search. The typed text is trimmed and cut to 80
 * characters, then debounced by 250ms. An empty term skips the call, since
 * the server answers `[]` for it anyway. While the next term loads, the
 * previous results stay on screen.
 */
export function useDirectoryPartnerCandidateSearch(
  query: string,
): DirectoryPartnerCandidateSearch {
  const { demoMode } = useDemoMode();
  const trimmed = query.trim();
  const typedTerm = trimmed.slice(0, DIRECTORY_PARTNER_SEARCH_MAX);
  const term = useDebouncedValue(typedTerm, SEARCH_DEBOUNCE_MS);
  const isEnabled = term.length > 0;
  const searchQuery = useQuery<AdminDirectoryPartnerSearchResultDTO[]>({
    queryKey: [ADMIN_DIRECTORY_PARTNERS_ROOT, "search", demoMode, term],
    enabled: isEnabled,
    staleTime: LIVE_STALE_MS,
    placeholderData: keepPreviousData,
    meta: { silentError: true },
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const demoStore =
          await import("../../marketing/directoryPartnersDemoStore");
        return demoStore.demoSearchDirectoryPartnerCandidates(term);
      }
      return searchAdminDirectoryPartnerCandidates(term, signal);
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
