import {
  useCallback,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  housingFiltersFromSearchParams,
  housingFiltersToSearchParams,
  type HousingFilters,
} from "./housingFilters";

/** Query params the housing page owns for other reasons and this hook must
 * carry through untouched when it rewrites the filters (`tab` switches between
 * the Housing and Flatmates boards). */
const PRESERVED_PARAM_KEYS = ["tab"];

/**
 * The housing board's filters, held in the URL instead of component state, with
 * the same `useState` signature so callers read as before.
 *
 * The URL is the source of truth: a filtered board is linkable, survives a
 * reload, and comes back intact when a member opens a listing and presses Back.
 * Writes use `replace` so toggling chips doesn't bury the page the member
 * arrived from under a stack of history entries; navigating away to a listing
 * and back is a real entry, so the filtered URL is what Back returns to.
 */
export function useHousingFilterParams(): [
  HousingFilters,
  Dispatch<SetStateAction<HousingFilters>>,
] {
  const [searchParams, setSearchParams] = useSearchParams();
  // `searchParams` is memoised by the router per location, so this only rebuilds
  // when the query string actually changes.
  const filters = useMemo(
    () => housingFiltersFromSearchParams(searchParams),
    [searchParams],
  );

  const setFilters = useCallback<Dispatch<SetStateAction<HousingFilters>>>(
    (update) => {
      setSearchParams(
        (previous) => {
          const current = housingFiltersFromSearchParams(previous);
          const next = typeof update === "function" ? update(current) : update;
          const params = housingFiltersToSearchParams(next);
          for (const key of PRESERVED_PARAM_KEYS) {
            const value = previous.get(key);
            if (value !== null) params.set(key, value);
          }
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return [filters, setFilters];
}
