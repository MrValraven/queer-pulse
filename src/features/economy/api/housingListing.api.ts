import { apiGet, apiPost } from "../../../shared/api/client";
import { toItemsPage, type ItemsPage } from "../../../shared/api/pagination";
import type { MemberRefDTO } from "../../../shared/api/refs";

export interface HousingListingDTO {
  ref: string;
  slug: string;
  status: "review" | "question" | "live";
  lister: MemberRefDTO | null;
  createdAt: string;
  type: "sublet" | "room" | "short" | "studio";
  title: string;
  blurb: string;
  city: string;
  area: string;
  rentEuros: number;
  billsIncluded: boolean;
  lgbtqFriendly: boolean;
  availableFrom: string | null;
  minStayMonths: number | null;
  description: string;
  features: string[];
  idealFor: string[];
  gallery: string[];
}

export interface HousingListingFilters {
  type?: string;
  page?: number;
}

export interface CreateHousingListingBody {
  type: HousingListingDTO["type"];
  title: string;
  city: string;
  area?: string;
  rentEuros: number;
  blurb?: string;
  description?: string;
  billsIncluded?: boolean;
  lgbtqFriendly?: boolean;
}

export async function getHousingListings(
  filters: HousingListingFilters = {},
): Promise<ItemsPage<HousingListingDTO>> {
  const query = new URLSearchParams();
  if (filters.type && filters.type !== "all") query.set("type", filters.type);
  if (filters.page) query.set("page", String(filters.page));
  const qs = query.toString();
  const res = await apiGet<HousingListingDTO[] | ItemsPage<HousingListingDTO>>(
    `/housing-directory${qs ? `?${qs}` : ""}`,
  );
  return toItemsPage(res);
}

export const getHousingListing = (slug: string) =>
  apiGet<HousingListingDTO>(`/housing-directory/${slug}`);

export const createHousingListing = (body: CreateHousingListingBody) =>
  apiPost<HousingListingDTO>("/housing-listings", body);

export const sendHousingEnquiry = (ref: string, body: { body: string }) =>
  apiPost<{ conversationId: string }>(
    `/housing-listings/${ref}/enquiries`,
    body,
  );
