import { useMembers, type MembersResult } from "./api/useMembers";
import {
  ALL_OF_LISBON,
  EMPTY_FILTERS,
  SORT_PARAM,
  type FilterState,
  type SortKey,
} from "./memberDirectoryFilter.data";

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
 */
export function useMemberDirectoryQuery(
  filters: FilterState,
  sort: SortKey,
  demoMode: boolean,
): MembersResult {
  const hoods = filters.hoods.filter((hood) => hood !== ALL_OF_LISBON);
  return useMembers({
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
}
