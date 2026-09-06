import { useMemo, useState } from "react";
import { useDebouncedValue } from "../../shared/hooks";
import { memberName } from "./data/members";
import { useMembers, type MembersResult } from "./api/useMembers";
import {
  ALL_OF_LISBON,
  EMPTY_FILTERS,
  SORT_PARAM,
  type FilterState,
  type SortKey,
} from "./memberDirectoryFilter.data";

/** How long the name search waits after the last keystroke before its term
 *  becomes a query key and reaches the network. Same interval as every other
 *  list-with-search control in the app (`useDiscoverCommunities`,
 *  `useSubprofileDirectoryFilters`, `AdminListingsHeader`). */
const SEARCH_DEBOUNCE_MS = 300;

/** The directory's name-search box, as one bundle the page threads down to the
 *  results column. */
export interface MemberDirectorySearch {
  /** Raw text in the field, updated on every keystroke. */
  input: string;
  /** The trimmed, debounced term actually driving the query and the empty
   *  state. Lags `input` by `SEARCH_DEBOUNCE_MS`. */
  term: string;
  onChange: (value: string) => void;
}

export interface MemberDirectoryResult extends MembersResult {
  search: MemberDirectorySearch;
}

/**
 * Turns the directory's sidebar `FilterState` + sort into the `GET /members`
 * query and runs it. Lifted out of `MemberDirectoryFilterPage` so that page
 * component stays inside the repo's 200-line rule; the translation rules it
 * encodes are the interesting part and they all live here now.
 *
 * Identity selections go to `identities=`, NOT `tags=`. They used to be sent as
 * tags, which the backend matched against `profiles.tags` (a skills vocabulary:
 * 'Illustration', 'NestJS') that shares no value with any identity id, so live
 * mode returned nothing for every selection. `identities=` matches each
 * member's opt-in published set; members who have not published an identity are
 * simply not findable by it.
 *
 * Every facet is forwarded. This used to stop at `identities`/`sort`, silently
 * leaving the rest of the sidebar decorative in live mode (an audited P0).
 * `ALL_OF_LISBON` is FE-only chrome meaning "no hood filter" and is stripped
 * before the request; `yearsFrom`/`yearsTo` are only sent once the range has
 * actually been narrowed from its full [0, 9] default. Sending the untouched
 * default would be a harmless no-op filter, but omitting it keeps the query key
 * (and the request) identical to before a member ever touches the slider.
 *
 * Sort is server-side in live mode, so it belongs in the query key: changing it
 * refetches. Demo mode sorts the whole mock list in the browser and must NOT
 * put sort in the key, or every sort change would refetch and flash the
 * skeleton.
 *
 * The NAME SEARCH lives here too, state and all, so the page component stays
 * inside the 200-line rule. It is forwarded as `GET /members?query=`, a
 * weighted full-text match the endpoint has accepted all along
 * (`ListMembersQuery.query` over first name, last name, slug, tagline and
 * bio). The directory was the one browse surface with no caller for it, so
 * "find the person I met last night" meant leaving for global search. Live
 * mode sends the debounced term, so the match runs across the WHOLE directory
 * rather than the pages the browser happened to load, and it rides in the
 * query key: without that a new search would render the previous term's cached
 * page. Demo mode keeps it out of the key for the same reason it keeps `sort`
 * out (there is no request to make) and narrows the mock list here instead,
 * over the same fields the server matches: name, slug and the card's role
 * line, the fixture's stand-in for a tagline.
 *
 * Narrowing the demo list HERE rather than in the page also keeps the sidebar
 * honest: it counts demo facets off the list it is handed, and live facets
 * already come back counted under the search term, so both modes report
 * availability within the current search.
 */
export function useMemberDirectoryQuery(
  filters: FilterState,
  sort: SortKey,
  demoMode: boolean,
): MemberDirectoryResult {
  const [searchInput, setSearchInput] = useState("");
  const searchTerm = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS);
  const hoods = filters.hoods.filter((hood) => hood !== ALL_OF_LISBON);
  const result = useMembers({
    query: demoMode ? undefined : searchTerm || undefined,
    identities: filters.identities,
    openTo: filters.openTo,
    hoods,
    disciplines: filters.disciplines,
    professions: filters.professions,
    languages: filters.languages,
    yearsFrom:
      filters.yearsFrom !== EMPTY_FILTERS.yearsFrom
        ? filters.yearsFrom
        : undefined,
    yearsTo:
      filters.yearsTo !== EMPTY_FILTERS.yearsTo ? filters.yearsTo : undefined,
    sort: demoMode ? undefined : SORT_PARAM[sort],
  });

  const items = useMemo(() => {
    if (!demoMode || searchTerm === "") return result.items;
    const needle = searchTerm.toLowerCase();
    return result.items.filter((member) => {
      const name = member.firstName
        ? `${member.firstName} ${member.lastName ?? ""}`
        : memberName(member.slug);
      return `${name} ${member.slug} ${member.role}`
        .toLowerCase()
        .includes(needle);
    });
  }, [demoMode, searchTerm, result.items]);

  return {
    ...result,
    items,
    search: {
      input: searchInput,
      term: searchTerm,
      onChange: setSearchInput,
    },
  };
}
