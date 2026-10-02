import { useState } from "react";
import { useDebouncedValue } from "../../shared/hooks/useDebouncedValue";
import { useConnectionsList } from "./api/useConnectionsList";
import type { ConnectionView } from "./connections.data";
import { foldForSearch, matchesSearchTerm } from "./connectionsFilter";

/** The last list the connections source finished answering, kept so the
 *  picker has rows to narrow while the next answer is on its way. */
interface AnsweredList {
  /** The answered term plus the slugs it returned, so the render-time update
   *  below runs once per new answer. */
  signature: string;
  views: ConnectionView[];
  /** Whether the host has any connection at all: true once any answer held a
   *  row, false once the unfiltered list came back empty, null before
   *  either. */
  hasSomeConnections: boolean | null;
}

const NO_ANSWER_YET: AnsweredList = {
  signature: "",
  views: [],
  hasSomeConnections: null,
};

export interface ConnectionCandidates {
  /** People to offer, picked ones left out, at most `resultLimit`.
   *  Every row matches the term the input shows right now. */
  matches: ConnectionView[];
  /** True while the rows for the typed term are on their way and nothing on
   *  hand matches it yet: the dropdown shows its loading line. */
  isAwaitingMatches: boolean;
  /** False only once the unfiltered list came back empty, which is when the
   *  empty state says the member has no connections yet. */
  hasConnections: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * People a member may pick from their own network: their accepted
 * connections, searched on the server (`q`) once typing pauses, loaded only
 * after the list first opens or a term exists. Behind every "only people
 * you're connected to" picker (gathering co-hosts, item collaborators), so a
 * stranger can never be offered. Dual-mode through `useConnectionsList`: demo
 * resolves the seeded connections locally, live asks `GET /connections`.
 *
 * The rows on hand answer the typed term only once the debounce has caught up
 * and nothing is loading. Until then they can be the previous term's rows (or,
 * on a first term, the whole first page), so they are narrowed locally to what
 * matches the input, and a quick ArrowDown and Enter can only pick someone who
 * matches. While a new term loads, the last answer stands in, narrowed the
 * same way, so the list keeps its rows while the next answer loads.
 */
export function useConnectionCandidates({
  searchTerm,
  hasOpenedList,
  pickedSlugs,
  resultLimit,
  debounceMs,
}: {
  searchTerm: string;
  hasOpenedList: boolean;
  pickedSlugs: readonly string[];
  /** How many people the list shows at once. */
  resultLimit: number;
  /** How long the search waits after the last keystroke before it asks. */
  debounceMs: number;
}): ConnectionCandidates {
  const trimmedSearchTerm = searchTerm.trim();
  const debouncedSearchTerm = useDebouncedValue(trimmedSearchTerm, debounceMs);
  const isListWanted = hasOpenedList || trimmedSearchTerm !== "";
  const {
    views,
    loading: isLoading,
    isError,
    refetch,
  } = useConnectionsList("all", {
    searchTerm: debouncedSearchTerm,
    isEnabled: isListWanted,
  });

  const [lastAnswer, setLastAnswer] = useState<AnsweredList>(NO_ANSWER_YET);
  const answerSignature = `${debouncedSearchTerm}\n${views
    .map((view) => view.slug)
    .join(",")}`;
  const isAnswered = isListWanted && !isLoading && !isError;
  // Adjusting state while rendering: the signature check lets this run once
  // per new answer, and React re-renders straight away with the stored list.
  if (isAnswered && lastAnswer.signature !== answerSignature) {
    let hasSomeConnections = lastAnswer.hasSomeConnections;
    if (views.length > 0) hasSomeConnections = true;
    else if (debouncedSearchTerm === "") hasSomeConnections = false;
    setLastAnswer({ signature: answerSignature, views, hasSomeConnections });
  }

  const isCurrentAnswer =
    !isLoading && trimmedSearchTerm === debouncedSearchTerm;
  const foldedSearchTerm = foldForSearch(trimmedSearchTerm);
  const rowsOnHand = isLoading ? lastAnswer.views : views;
  const candidates = isCurrentAnswer
    ? views
    : rowsOnHand.filter((view) => matchesSearchTerm(view, foldedSearchTerm));
  const matches = candidates
    .filter((person) => !pickedSlugs.includes(person.slug))
    .slice(0, resultLimit);

  return {
    matches,
    isAwaitingMatches: !isCurrentAnswer && matches.length === 0,
    hasConnections: lastAnswer.hasSomeConnections !== false,
    isError,
    refetch,
  };
}
