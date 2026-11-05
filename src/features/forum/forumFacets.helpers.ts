import { type Thread } from "./forum.data";
import { type ForumSort, type ForumThreadCounts } from "./api/forum.api";
import {
  FUNDING_CATEGORY_ID,
  FUNDING_ELIGIBILITIES,
  FUNDING_LIST_VIEWS,
  FUNDING_SCOPES,
} from "./funding/funding.data";
import type { ForumFundingFacets } from "./funding/funding.types";
import {
  filterAndSortThreads,
  type FundingListFilter,
} from "./forumPageState.helpers";

/**
 * DEMO ONLY: the sidebar's per-category counts, the mirror of `GET
 * /forum/threads/counts?q&tag`. Each thread is narrowed by the same tag and
 * title search the demo list applies (`filterAndSortThreads`), then tallied
 * under its category; `all` is the distinct total. A category nobody posted
 * in is left out, as the server leaves it out.
 */
export function countDemoThreadsByCategory(
  threads: Thread[],
  q: string | undefined,
  tag: string | undefined,
): ForumThreadCounts {
  const matching = filterAndSortThreads(threads, {
    demoMode: true,
    cat: "all",
    tag,
    q: q ?? "",
    sort: "new",
  });
  return matching.reduce<ForumThreadCounts>(
    (counts, thread) => {
      counts.all += 1;
      counts[thread.category] = (counts[thread.category] ?? 0) + 1;
      return counts;
    },
    { all: 0 },
  );
}

interface DemoFundingQuery {
  tag: string | undefined;
  q: string;
  sort: ForumSort;
  funding: FundingListFilter;
}

/**
 * DEMO ONLY: the mirror of the server's `fundingFacets`. Every count is the
 * length of the list the demo would draw with that one chip picked, run
 * through the same `filterAndSortThreads` the list itself uses, so a number
 * can never promise rows the list does not show. Each row lifts its own
 * filter and keeps the others; eligibility and scope are counted on a call
 * view only, as the chips only show there.
 */
export function countDemoFundingFacets(
  visibleThreads: Thread[],
  { tag, q, sort, funding }: DemoFundingQuery,
): ForumFundingFacets {
  const countWith = (filter: FundingListFilter) =>
    filterAndSortThreads(visibleThreads, {
      demoMode: true,
      cat: FUNDING_CATEGORY_ID,
      tag,
      q,
      sort,
      funding: filter,
    }).length;
  const view = Object.fromEntries(
    FUNDING_LIST_VIEWS.map((option) => [
      option,
      countWith({ ...funding, view: option }),
    ]),
  );
  const isCallView = funding.view === "open" || funding.view === "closing";
  if (!isCallView) return { view, eligibility: null, scope: null };
  const eligibility = Object.fromEntries(
    FUNDING_ELIGIBILITIES.map((option) => [
      option,
      countWith({ ...funding, eligibility: [option] }),
    ]),
  );
  const scope = {
    any: countWith({ ...funding, scope: null }),
    ...Object.fromEntries(
      FUNDING_SCOPES.map((option) => [
        option,
        countWith({ ...funding, scope: option }),
      ]),
    ),
  };
  return { view, eligibility, scope };
}
