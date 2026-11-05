import { useMemo, useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { ListingType } from "./flatmates.data";
import type { FlatmateFilters } from "./api/flatmateProfile.api";
import { useFlatmateProfiles } from "./api/useFlatmateProfiles";
import {
  budgetCeilingFor,
  flatmatesOptionCounts,
  matchesFlatmateFilters,
} from "./flatmatesFacets";

/** Every filter on the flatmates board. `"all"` means the group is not
 *  narrowing anything. */
export interface FlatmatesFilterState {
  type: ListingType | "all";
  neighbourhood: string;
  budget: string;
  moveIn: string;
  tags: string[];
}

/** The setters the sidebar and the applied chips call. */
export interface FlatmatesFilterActions {
  setType: (type: ListingType | "all") => void;
  setNeighbourhood: (neighbourhood: string) => void;
  setBudget: (budget: string) => void;
  setMoveIn: (moveIn: string) => void;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;
}

/** The flatmates board's filter state, the profiles query it drives, and the
 *  profiles that pass every filter. Moved out of `FlatmatesBoard` unchanged
 *  so the board stays under the 200-line rule. */
export function useFlatmatesFilters() {
  const { demoMode } = useDemoMode();
  const [type, setType] = useState<ListingType | "all">("all");
  const [neighbourhood, setNeighbourhood] = useState("all");
  const [budget, setBudget] = useState("all");
  const [moveIn, setMoveIn] = useState("all");
  const [tags, setTags] = useState<string[]>([]);

  // Send every filter to the server, so live results are filtered and
  // match-ranked across the whole board, page one already holds the best
  // matches, and the facets count the same predicates. The band's ceiling
  // travels as `budgetMax` too, so a server that predates `budgetBand` still
  // narrows. The lifestyle chips have always meant "every tag I picked",
  // hence `tagMatch: "all"`.
  const serverFilters = useMemo<FlatmateFilters>(
    () => ({
      type: type === "all" ? undefined : type,
      neighbourhood: neighbourhood === "all" ? undefined : neighbourhood,
      budgetBand: budget === "all" ? undefined : budget,
      budgetMax: budgetCeilingFor(budget),
      moveIn: moveIn === "all" ? undefined : moveIn,
      tags: tags.length > 0 ? tags : undefined,
      tagMatch: tags.length > 0 ? "all" : undefined,
    }),
    [type, neighbourhood, budget, moveIn, tags],
  );
  const profilesQuery = useFlatmateProfiles(serverFilters);
  const { profiles: source, facets } = profilesQuery;
  const optionCounts = useMemo(() => flatmatesOptionCounts(facets), [facets]);

  const isAnyFilterActive =
    type !== "all" ||
    neighbourhood !== "all" ||
    budget !== "all" ||
    moveIn !== "all" ||
    tags.length > 0;

  // A live server that sends facets has applied every filter itself, so its
  // pages are the answer as they stand. The demo page is the whole mock, and
  // a server that predates the new params ignores some of them, so those two
  // narrow here with the server's own predicates.
  const isServerFiltered = !demoMode && facets !== undefined;
  const filtered = isServerFiltered
    ? source
    : source.filter((profile) =>
        matchesFlatmateFilters(profile, serverFilters),
      );

  const toggleTag = (tag: string) =>
    setTags((previous) =>
      previous.includes(tag)
        ? previous.filter((existing) => existing !== tag)
        : [...previous, tag],
    );

  const clearFilters = () => {
    setType("all");
    setNeighbourhood("all");
    setBudget("all");
    setMoveIn("all");
    setTags([]);
  };

  const filters: FlatmatesFilterState = {
    type,
    neighbourhood,
    budget,
    moveIn,
    tags,
  };
  const actions: FlatmatesFilterActions = {
    setType,
    setNeighbourhood,
    setBudget,
    setMoveIn,
    toggleTag,
    clearFilters,
  };

  return {
    filters,
    actions,
    // Changes whenever any filter does, so the discovery deck restarts from
    // its first card on a new search.
    filterKey: [type, neighbourhood, budget, moveIn, tags.join(",")].join("|"),
    isAnyFilterActive,
    source,
    filtered,
    profilesQuery,
    optionCounts,
  };
}
