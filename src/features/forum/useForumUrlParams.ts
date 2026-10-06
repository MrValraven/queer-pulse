import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { type ForumSort } from "./api/forum.api";
import {
  CALL_LIST_VIEWS,
  FUNDING_CATEGORY_ID,
  parseEligibility,
  parseFundingListView,
  parseScope,
} from "./funding/funding.data";
import type {
  FundingEligibility,
  FundingListView,
  FundingScope,
} from "./funding/funding.types";
import {
  DEFAULT_FORUM_SORT as DEFAULT_SORT,
  isForumSort,
} from "./forumPageState.helpers";

/** Meaningful only inside Funding & Grants. */
const FUNDING_PARAMS = ["fundingView", "eligibility", "scope"] as const;

/**
 * Owns the URL-backed forum filter/sort state (`tag`, `q`, `category`, `sort`)
 * so a refresh or shared link preserves them instead of silently resetting.
 * "all"/"active" are each param's default, so they're omitted from the URL
 * entirely (never `?category=all`): `setCat`/`setSort` null the param out at
 * their default so the default round-trips. Lifted out of `useForumPageState`.
 *
 * It also owns the Funding & Grants filters (`fundingView`, `eligibility`,
 * `scope`): all `replace`, all dropped outside Funding & Grants, and
 * eligibility and scope are dropped again when the view stops listing calls.
 *
 * PRD-161: the sort default is `active`, matching the SERVER default. It used
 * to be `top`, which on a young forum ranked a page of zero-vote threads in an
 * order that never moved as people posted, so a fresh question was buried under
 * anything that had ever collected a single vote. `active` puts the threads
 * people are actually talking in on top, and a brand-new thread starts there.
 */
export function useForumUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tag = searchParams.get("tag") ?? undefined;
  const q = searchParams.get("q") ?? "";
  const setParam = useCallback(
    (key: string, value: string | null) =>
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set(key, value);
          else next.delete(key);
          return next;
        },
        { replace: true },
      ),
    [setSearchParams],
  );
  const setQ = useCallback(
    (next: string) => setParam("q", next.trim() || null),
    [setParam],
  );
  const setTag = useCallback(
    (next: string | null) => setParam("tag", next),
    [setParam],
  );

  const catParam = searchParams.get("category");
  const cat = catParam ?? "all";
  const setCat = useCallback(
    (next: string) =>
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next === "all") params.delete("category");
          else params.set("category", next);
          // A stale `fundingView=open` would narrow the next category to
          // nothing, so leaving Funding & Grants clears all three.
          if (next !== FUNDING_CATEGORY_ID) {
            for (const key of FUNDING_PARAMS) params.delete(key);
          }
          return params;
        },
        { replace: true },
      ),
    [setSearchParams],
  );
  const sortParam = searchParams.get("sort");
  const sort: ForumSort = isForumSort(sortParam) ? sortParam : DEFAULT_SORT;
  const setSort = useCallback(
    (next: ForumSort) => setParam("sort", next === DEFAULT_SORT ? null : next),
    [setParam],
  );

  const isFundingCategory = cat === FUNDING_CATEGORY_ID;
  const fundingView: FundingListView = isFundingCategory
    ? parseFundingListView(searchParams.get("fundingView"))
    : "all";
  const isCallView = CALL_LIST_VIEWS.includes(fundingView);
  const eligibilityParam = isCallView
    ? searchParams.getAll("eligibility").join(",")
    : "";
  const eligibility = useMemo(
    () =>
      eligibilityParam ? parseEligibility(eligibilityParam.split(",")) : [],
    [eligibilityParam],
  );
  const scope = isCallView ? parseScope(searchParams.get("scope")) : null;

  const setFundingView = useCallback(
    (next: FundingListView) =>
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next === "all") params.delete("fundingView");
          else params.set("fundingView", next);
          if (!CALL_LIST_VIEWS.includes(next)) {
            params.delete("eligibility");
            params.delete("scope");
          }
          return params;
        },
        { replace: true },
      ),
    [setSearchParams],
  );

  const toggleEligibility = useCallback(
    (value: FundingEligibility) =>
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          const current = parseEligibility(params.getAll("eligibility"));
          const next = current.includes(value)
            ? current.filter((entry) => entry !== value)
            : [...current, value];
          params.delete("eligibility");
          for (const entry of parseEligibility(next))
            params.append("eligibility", entry);
          return params;
        },
        { replace: true },
      ),
    [setSearchParams],
  );

  const setScope = useCallback(
    (next: FundingScope | null) => setParam("scope", next),
    [setParam],
  );

  const clearFundingFilters = useCallback(
    () =>
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          params.delete("eligibility");
          params.delete("scope");
          return params;
        },
        { replace: true },
      ),
    [setSearchParams],
  );

  return {
    searchParams,
    setSearchParams,
    tag,
    setTag,
    q,
    setQ,
    cat,
    setCat,
    sort,
    setSort,
    fundingView,
    setFundingView,
    eligibility,
    toggleEligibility,
    scope,
    setScope,
    clearFundingFilters,
  };
}
