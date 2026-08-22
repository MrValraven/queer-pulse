import { useCommunities } from "./api/useCommunities";
import type { CommunityType } from "../homepage/data/types";

/** The chip label → how many communities carry that type. `null` for a chip
 *  whose count hasn't arrived yet, so the UI shows the label alone rather than
 *  a wrong number. */
export type DiscoverCategoryCounts = Record<
  "all" | CommunityType,
  number | null
>;

/**
 * Category-chip counts for the Discover page.
 *
 * These used to be produced by mounting a SECOND unfiltered `useCommunities({})`
 * and then paging through the ENTIRE directory in an effect, one request after
 * another, purely to label six chips — O(total / pageSize) sequential requests
 * on every visit, growing with the platform, and no number shown until the
 * whole drain finished.
 *
 * Each count is really just one server total, so ask for exactly that: a single
 * bounded page per type, read `total`, throw the items away. Seven small
 * parallel requests instead of an unbounded serial crawl, and each chip lights
 * up as its own answer lands. react-query caches them, so moving between
 * chips, searching, or coming back to the page costs nothing more.
 *
 * The one call that would collapse this to a single request is a
 * `GET /communities/counts` (group by type) endpoint; it does not exist yet.
 * When it does, replace the body of this hook and nothing else changes.
 */
export function useDiscoverCategoryCounts(): DiscoverCategoryCounts {
  // One fixed hook call per known type, in a stable order — never a loop over
  // a runtime list, so the hook order can't shift between renders.
  const all = useCommunities({});
  const social = useCommunities({ type: "social" });
  const arts = useCommunities({ type: "arts" });
  const activism = useCommunities({ type: "activism" });
  const support = useCommunities({ type: "support" });
  const sports = useCommunities({ type: "sports" });
  const professional = useCommunities({ type: "professional" });

  const countOf = (result: { total: number; isLoading: boolean }) =>
    result.isLoading ? null : result.total;

  return {
    all: countOf(all),
    social: countOf(social),
    arts: countOf(arts),
    activism: countOf(activism),
    support: countOf(support),
    sports: countOf(sports),
    professional: countOf(professional),
  };
}
