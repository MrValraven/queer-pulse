import { useCommunities } from "./api/useCommunities";
import type { CommunityType } from "../homepage/data/types";
import type { CommunitiesScope } from "./communitiesDiscover.data";

/** The chip label → how many communities carry that type. `null` for a chip
 *  whose count hasn't arrived yet, so the UI shows the label alone rather than
 *  a wrong number. */
export type DiscoverCategoryCounts = Record<
  "all" | CommunityType,
  number | null
>;

/**
 * Category-chip counts for the communities grid, in either scope — the whole
 * discover pool, or just the communities the viewer belongs to.
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
export function useDiscoverCategoryCounts(
  scope: CommunitiesScope = "discover",
): DiscoverCategoryCounts {
  // On the "My communities" tab the chips count the viewer's own memberships,
  // not the whole platform — same seven bounded reads, scoped by `filter`.
  // Passing `undefined` for discover keeps that scope's query keys (and so its
  // cache entries) byte-for-byte what they were before the tab existed.
  const filter = scope === "mine" ? ("mine" as const) : undefined;
  // One fixed hook call per known type, in a stable order — never a loop over
  // a runtime list, so the hook order can't shift between renders.
  const all = useCommunities({ filter });
  const social = useCommunities({ filter, type: "social" });
  const arts = useCommunities({ filter, type: "arts" });
  const activism = useCommunities({ filter, type: "activism" });
  const support = useCommunities({ filter, type: "support" });
  const sports = useCommunities({ filter, type: "sports" });
  const professional = useCommunities({ filter, type: "professional" });

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
