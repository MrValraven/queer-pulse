import { apiDelete, apiGet, apiPost } from "../../../shared/api/client";
import type { HousingListingFilters } from "./housingListing.api";

/** The stored filter set behind a saved search — the browse filters minus the
 * pagination cursor. Mirrors the backend `HousingSavedSearchCriteria`. */
export type HousingSavedSearchCriteria = Omit<HousingListingFilters, "page">;

export interface HousingSavedSearchDTO {
  id: string;
  name: string;
  criteria: HousingSavedSearchCriteria;
  alertsEnabled: boolean;
  createdAt: string;
}

export interface CreateHousingSavedSearchBody {
  name: string;
  criteria: HousingSavedSearchCriteria;
  alertsEnabled?: boolean;
}

export const getHousingSavedSearches = () =>
  apiGet<HousingSavedSearchDTO[]>("/housing-saved-searches");

export const createHousingSavedSearch = (body: CreateHousingSavedSearchBody) =>
  apiPost<HousingSavedSearchDTO>("/housing-saved-searches", body);

export const deleteHousingSavedSearch = (id: string) =>
  apiDelete<void>(`/housing-saved-searches/${id}`);
