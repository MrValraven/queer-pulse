import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebouncedValue } from "../../../shared/hooks/useDebouncedValue";
import {
  LEAD_SEARCH_QUERY_MAX,
  isLeadStage,
  isLeadType,
  type LeadListFilters,
  type LeadStage,
  type LeadType,
} from "./api/leads.types";
import {
  DUE_ONLY_PARAM_VALUE,
  LEAD_LIST_PARAM,
  LEAD_SEARCH_DEBOUNCE_MS,
} from "./leadsList.data";

export interface LeadListControls {
  filters: LeadListFilters;
  /** What the search field shows, as typed. */
  searchText: string;
  setSearchText: (text: string) => void;
  setStage: (stage: LeadStage | null) => void;
  setType: (type: LeadType | null) => void;
  setIsDueOnly: (isDueOnly: boolean) => void;
  clearFilters: () => void;
  hasFilters: boolean;
}

/** Search text as sent: trimmed and cut to the longest search, in code
 *  points. */
function searchQueryOf(text: string): string {
  return Array.from(text.trim()).slice(0, LEAD_SEARCH_QUERY_MAX).join("");
}

/** A copy of `params` with `name` set to `value`, or removed when null. */
function withParam(
  params: URLSearchParams,
  name: string,
  value: string | null,
): URLSearchParams {
  const nextParams = new URLSearchParams(params);
  if (value === null || value === "") nextParams.delete(name);
  else nextParams.set(name, value);
  return nextParams;
}

/**
 * The leads list filters, kept in the URL (`q`, `stage`, `type`, `due=1`) so
 * a link lands on the same view; every write replaces the history entry. The
 * search field keeps its own text and reaches the list and `q` after a 250ms
 * pause; a cleared field skips the pause. An unknown stage or type in the
 * URL reads as no filter.
 */
export function useLeadListFilters(): LeadListControls {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get(LEAD_LIST_PARAM.query) ?? "";
  const [searchText, setSearchText] = useState(urlQuery);
  const typedQuery = searchQueryOf(searchText);
  const debouncedQuery = useDebouncedValue(typedQuery, LEAD_SEARCH_DEBOUNCE_MS);
  const query = typedQuery === "" ? "" : debouncedQuery;
  // A `q` that changes from outside (the Leads nav link, a pasted address)
  // without a remount is adopted once into the field. The hook's own write
  // already equals `query`, so it is never adopted back.
  const [previousUrlQuery, setPreviousUrlQuery] = useState(urlQuery);
  if (urlQuery !== previousUrlQuery) {
    setPreviousUrlQuery(urlQuery);
    if (urlQuery !== query) setSearchText(urlQuery);
  }

  const stageParam = searchParams.get(LEAD_LIST_PARAM.stage);
  const typeParam = searchParams.get(LEAD_LIST_PARAM.type);
  const stage = isLeadStage(stageParam) ? stageParam : null;
  const type = isLeadType(typeParam) ? typeParam : null;
  const isDueOnly =
    searchParams.get(LEAD_LIST_PARAM.isDueOnly) === DUE_ONLY_PARAM_VALUE;

  // The settled search is mirrored into `q`, so the address always names
  // the list on screen. While the pause runs (after typing, or after an
  // adopted `q`), `query` is still the old text, so nothing is written. It
  // writes only when the search itself changed since the address last took
  // it: a router navigation lands as a transition, so `urlQuery` can lag a
  // render behind a press (Clear filters), and a write built on those stale
  // params would bring the cleared stage and type back.
  const isSettled = query === typedQuery;
  const copiedQueryRef = useRef(urlQuery);
  useEffect(() => {
    if (!isSettled || query === copiedQueryRef.current) return;
    copiedQueryRef.current = query;
    if (urlQuery === query) return;
    setSearchParams(
      (previousParams) =>
        withParam(previousParams, LEAD_LIST_PARAM.query, query),
      { replace: true },
    );
  }, [isSettled, query, urlQuery, setSearchParams]);

  const setParam = (name: string, value: string | null) => {
    setSearchParams(
      (previousParams) => withParam(previousParams, name, value),
      { replace: true },
    );
  };

  return {
    filters: { q: query, stage, type, isDueOnly },
    searchText,
    setSearchText,
    setStage: (nextStage) => setParam(LEAD_LIST_PARAM.stage, nextStage),
    setType: (nextType) => setParam(LEAD_LIST_PARAM.type, nextType),
    setIsDueOnly: (nextIsDueOnly) =>
      setParam(
        LEAD_LIST_PARAM.isDueOnly,
        nextIsDueOnly ? DUE_ONLY_PARAM_VALUE : null,
      ),
    clearFilters: () => {
      // The address takes the cleared search here, so the copy above has
      // nothing left to write.
      copiedQueryRef.current = "";
      setSearchText("");
      setSearchParams(
        (previousParams) => {
          const nextParams = new URLSearchParams(previousParams);
          Object.values(LEAD_LIST_PARAM).forEach((name) =>
            nextParams.delete(name),
          );
          return nextParams;
        },
        { replace: true },
      );
    },
    hasFilters: query !== "" || stage !== null || type !== null || isDueOnly,
  };
}
