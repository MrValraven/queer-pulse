import { useMemo, useState } from "react";
import {
  spotlightCommunities,
  type CommunityCategory,
  type SpotlightCommunity,
} from "./Communities.data";

export type SortKey = "active" | "size" | "new" | "near";

export interface CommunityFilterState {
  q: string;
  cat: CommunityCategory | "all";
  lang: string;
  hood: string;
  open: boolean;
  sort: SortKey;
}

const INITIAL: CommunityFilterState = {
  q: "",
  cat: "all",
  lang: "all",
  hood: "all",
  open: false,
  sort: "active",
};

function matches(d: SpotlightCommunity, s: CommunityFilterState): boolean {
  if (s.cat !== "all" && d.category !== s.cat) return false;
  if (s.lang !== "all" && !d.langsArr.includes(s.lang)) return false;
  if (s.hood !== "all" && d.hood !== s.hood) return false;
  if (s.open && d.access !== "open") return false;
  const q = s.q.trim().toLowerCase();
  if (q) {
    const hay = `${d.railName} ${d.name} ${d.sub} ${d.desc}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function compare(a: SpotlightCommunity, b: SpotlightCommunity, sort: SortKey) {
  // Quiet / private communities always sink to the bottom.
  const aq = a.quiet ? 1 : 0;
  const bq = b.quiet ? 1 : 0;
  if (aq !== bq) return aq - bq;
  if (sort === "size") return b.members - a.members;
  if (sort === "new") return b.founded - a.founded;
  if (sort === "near") return a.hood.localeCompare(b.hood);
  return b.activity - a.activity; // "active"
}

export function useCommunityFilters() {
  const [state, setState] = useState<CommunityFilterState>(INITIAL);

  const patch = (next: Partial<CommunityFilterState>) =>
    setState((prev) => ({ ...prev, ...next }));

  const langOptions = useMemo(() => {
    const seen: string[] = [];
    for (const d of spotlightCommunities) {
      for (const l of d.langsArr) if (!seen.includes(l)) seen.push(l);
    }
    return seen;
  }, []);

  const hoodOptions = useMemo(() => {
    const seen: string[] = [];
    for (const d of spotlightCommunities) {
      if (!seen.includes(d.hood)) seen.push(d.hood);
    }
    return seen.sort((a, b) => a.localeCompare(b));
  }, []);

  const visible = useMemo(() => {
    return spotlightCommunities
      .filter((d) => matches(d, state))
      .sort((a, b) => compare(a, b, state.sort));
  }, [state]);

  const clear = () => setState((prev) => ({ ...INITIAL, sort: prev.sort }));

  return {
    state,
    patch,
    clear,
    visible,
    total: spotlightCommunities.length,
    langOptions,
    hoodOptions,
  };
}

export const LANG_LABEL: Record<string, string> = {
  PT: "Português",
  EN: "English",
  BR: "Brasileiro",
  FR: "Français",
  ES: "Español",
};
