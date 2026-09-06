import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { DEMO_SAVED_SEARCHES } from "../housingSavedSearches.data";
import { EMPTY_HOUSING_FILTERS, type HousingFilters } from "../housingFilters";
import {
  createHousingSavedSearch,
  deleteHousingSavedSearch,
  getHousingSavedSearches,
  type CreateHousingSavedSearchBody,
  type HousingSavedSearchCriteria,
  type HousingSavedSearchDTO,
} from "./housingSavedSearches.api";

const SAVED_SEARCHES_KEY = "housing-saved-searches";

// In-session demo store — a mutable copy of the seed, so create/delete work in
// demo mode without ever touching the network (reset on full reload).
let demoStore: HousingSavedSearchDTO[] = [...DEMO_SAVED_SEARCHES];

/** Board filters → the stored criteria: drop the "all" type sentinel, the page
 * cursor, and any falsy/undefined knob so a saved search holds only what
 * narrows. */
export function filtersToCriteria(
  filters: HousingFilters,
): HousingSavedSearchCriteria {
  const criteria: HousingSavedSearchCriteria = {};
  if (filters.type && filters.type !== "all") criteria.type = filters.type;
  if (filters.area) criteria.area = filters.area;
  if (filters.areas?.length) criteria.areas = filters.areas;
  if (filters.priceMin !== undefined) criteria.priceMin = filters.priceMin;
  if (filters.priceMax !== undefined) criteria.priceMax = filters.priceMax;
  if (filters.bedroomsMin !== undefined)
    criteria.bedroomsMin = filters.bedroomsMin;
  if (filters.billsIncluded) criteria.billsIncluded = true;
  if (filters.hasAccessibilityInfo) criteria.hasAccessibilityInfo = true;
  if (filters.furnished) criteria.furnished = true;
  if (filters.petsWelcome) criteria.petsWelcome = true;
  if (filters.verifiedOnly) criteria.verifiedOnly = true;
  if (filters.depositMax !== undefined)
    criteria.depositMax = filters.depositMax;
  if (filters.availableBy) criteria.availableBy = filters.availableBy;
  return criteria;
}

/** Stored criteria → board filters, restoring the "all" type default so the
 * type chips reflect a re-run search. */
export function criteriaToFilters(
  criteria: HousingSavedSearchCriteria,
): HousingFilters {
  return { ...EMPTY_HOUSING_FILTERS, ...criteria };
}

export function useHousingSavedSearches() {
  const { demoMode } = useDemoMode();
  return useQuery<HousingSavedSearchDTO[]>({
    queryKey: [SAVED_SEARCHES_KEY, demoMode],
    queryFn: () =>
      demoMode ? Promise.resolve([...demoStore]) : getHousingSavedSearches(),
    initialData: demoMode ? [...demoStore] : undefined,
  });
}

export function useCreateHousingSavedSearch() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateHousingSavedSearchBody) => {
      if (demoMode) {
        const created: HousingSavedSearchDTO = {
          id: `demo-saved-${Date.now()}`,
          name: body.name,
          criteria: body.criteria,
          alertsEnabled: body.alertsEnabled ?? true,
          createdAt: new Date().toISOString(),
        };
        demoStore = [created, ...demoStore];
        return created;
      }
      return createHousingSavedSearch(body);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [SAVED_SEARCHES_KEY, demoMode],
      }),
  });
}

export function useDeleteHousingSavedSearch() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (demoMode) {
        demoStore = demoStore.filter((search) => search.id !== id);
        return;
      }
      await deleteHousingSavedSearch(id);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [SAVED_SEARCHES_KEY, demoMode],
      }),
  });
}
