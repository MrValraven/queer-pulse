import { useMemo, useState } from "react";
import type { CommunityType } from "../../communities/api/communities.api";
import type { CommunitySpotlightView } from "./communitySpotlightView";

/**
 * Live analog of `useCommunityFilters`: same search/category/open/sort shape,
 * narrowed to fields the real `/landing/features` DTO actually carries. No
 * language or neighbourhood filter — real communities don't have that data —
 * and "Most active"/"Nearest" sorts are dropped for the same reason. "Open to
 * join" is approximated as `accessTier === "public"`.
 */
export type LiveSortKey = "size" | "new";

export interface LiveCommunityFilterState {
  q: string;
  cat: CommunityType | "all";
  open: boolean;
  sort: LiveSortKey;
}

const INITIAL: LiveCommunityFilterState = {
  q: "",
  cat: "all",
  open: false,
  sort: "size",
};

function matches(
  view: CommunitySpotlightView,
  state: LiveCommunityFilterState,
): boolean {
  if (state.cat !== "all" && view.category !== state.cat) return false;
  if (state.open && view.accessTier !== "public") return false;
  const q = state.q.trim().toLowerCase();
  if (q) {
    const haystack = `${view.name} ${view.blurb ?? ""}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

function compare(
  a: CommunitySpotlightView,
  b: CommunitySpotlightView,
  sort: LiveSortKey,
) {
  if (sort === "new") return b.foundedYear - a.foundedYear;
  return b.memberCount - a.memberCount; // "size"
}

export function useLiveCommunityFilters(views: CommunitySpotlightView[]) {
  const [state, setState] = useState<LiveCommunityFilterState>(INITIAL);

  const patch = (next: Partial<LiveCommunityFilterState>) =>
    setState((prev) => ({ ...prev, ...next }));

  const clear = () => setState((prev) => ({ ...INITIAL, sort: prev.sort }));

  const visible = useMemo(
    () =>
      views
        .filter((view) => matches(view, state))
        .sort((a, b) => compare(a, b, state.sort)),
    [views, state],
  );

  return { state, patch, clear, visible, total: views.length };
}
