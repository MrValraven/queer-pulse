import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import {
  isDebounceSettling,
  useDebouncedValue,
} from "../../../../shared/hooks/useDebouncedValue";
import { foldForSearch } from "../../../connect/connectionsFilter";
import type { InviteMembersListPaging } from "../../../gatherings/InviteMembersListFooter";
import {
  matchesStudioArtist,
  toStudioArtistPerson,
  type StudioArtistPerson,
} from "./musicEvents.adapters";
import { searchStudioArtists } from "./musicEvents.api";
import { musicEventKeys } from "./musicEventKeys";
import type { StudioArtistCandidateDTO } from "./musicEvents.types";

/** How long typing must pause before the term goes to the server. Matches
 *  the connections search the member pickers use. */
const STUDIO_ARTIST_SEARCH_DEBOUNCE_MS = 250;

/** The longest `q` the server accepts; a longer paste is cut here so the
 *  request is never refused for length. */
const STUDIO_ARTIST_SEARCH_MAX_LENGTH = 100;

export interface StudioArtistSearchResult extends InviteMembersListPaging {
  people: StudioArtistPerson[];
  /** True while the typed term settles or its first page loads. A "nobody
   *  found" line must wait for false. */
  isSearchPending: boolean;
  /** What the failed search threw, for the picker to name. */
  error: unknown;
}

/** The last list the server finished answering, kept so the picker has rows
 *  to narrow while the next answer is on its way. */
interface AnsweredList {
  signature: string;
  candidates: StudioArtistCandidateDTO[];
}

const NO_ANSWER_YET: AnsweredList = { signature: "", candidates: [] };

/**
 * Members the lineup picker can book: active members who created a linked,
 * listenable artist persona, searched on the server (`q`) once typing pauses
 * and paged through `fetchNextPage` on a press.
 *
 * It works like `useConnectionsSearch`: a leading "@" is dropped, the last
 * answer stands in (narrowed locally) while the next term is pending, and
 * once the server answers its rows are shown untouched, since it matches on
 * fields such as the persona handle. Demo answers from the fixture and never
 * calls the API.
 */
export function useStudioArtistSearch(
  searchQuery: string,
): StudioArtistSearchResult {
  const { demoMode } = useDemoMode();
  const trimmedSearchTerm = searchQuery
    .trim()
    .replace(/^@+/, "")
    .slice(0, STUDIO_ARTIST_SEARCH_MAX_LENGTH);
  const debouncedSearchTerm = useDebouncedValue(
    trimmedSearchTerm,
    STUDIO_ARTIST_SEARCH_DEBOUNCE_MS,
  );
  const query = useInfiniteQuery({
    queryKey: musicEventKeys.studioArtists(debouncedSearchTerm, demoMode),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (demoMode) {
        const { demoStudioArtistSearchPage } =
          await import("./musicEventsDemo.data");
        return demoStudioArtistSearchPage(debouncedSearchTerm);
      }
      return searchStudioArtists(debouncedSearchTerm, pageParam);
    },
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.pageSize < lastPage.total
        ? lastPage.page + 1
        : undefined,
    ...(demoMode ? { staleTime: Number.POSITIVE_INFINITY } : {}),
  });
  const { data, fetchNextPage, isFetchingNextPage, refetch } = query;
  const answeredCandidates = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const isLoading = query.isPending;

  const [lastAnswer, setLastAnswer] = useState<AnsweredList>(NO_ANSWER_YET);
  const answerSignature = `${debouncedSearchTerm}\n${answeredCandidates
    .map((candidate) => candidate.slug)
    .join(",")}`;
  const isAnswered = !isLoading && !query.isError;
  // Adjusting state while rendering: the signature check runs this once per
  // new answer, and React re-renders straight away with the stored list.
  if (isAnswered && lastAnswer.signature !== answerSignature) {
    setLastAnswer({
      signature: answerSignature,
      candidates: answeredCandidates,
    });
  }

  const isSearchPending =
    isLoading || isDebounceSettling(trimmedSearchTerm, debouncedSearchTerm);
  const candidatesOnHand = isLoading
    ? lastAnswer.candidates
    : answeredCandidates;
  const foldedSearchTerm = foldForSearch(trimmedSearchTerm);
  const visibleCandidates = isSearchPending
    ? candidatesOnHand.filter((candidate) =>
        matchesStudioArtist(candidate, foldedSearchTerm),
      )
    : answeredCandidates;
  const people = useMemo(
    () => visibleCandidates.map(toStudioArtistPerson),
    [visibleCandidates],
  );

  return {
    people,
    isSearchPending,
    hasNextPage: !isSearchPending && query.hasNextPage,
    fetchNextPage: () => {
      if (isFetchingNextPage) return;
      void fetchNextPage();
    },
    isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
    isError: !isSearchPending && query.isError && data === undefined,
    error: query.error,
    refetch: () => {
      void refetch();
    },
  };
}
