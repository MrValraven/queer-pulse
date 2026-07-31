import { apiGet, apiPost, apiPut } from "../../../shared/api/client";
import { toItemsPage, type ItemsPage } from "../../../shared/api/pagination";
import type { MemberRefDTO } from "../../../shared/api/refs";

export interface FlatmateProfileDTO {
  slug: string;
  type: "seeking" | "offering";
  member: MemberRefDTO | null;
  pronouns: string;
  neighbourhood: string;
  budgetEuros: number;
  moveInFrom: string | null;
  flexibleTiming: boolean;
  about: string;
  lifestyleTags: string[];
  createdAt: string;
  matchScore: number | null;
}

export interface FlatmateFilters {
  type?: string;
  neighbourhood?: string;
  budgetMax?: number;
  moveInBy?: string;
  tags?: string[];
  page?: number;
}

export interface UpsertFlatmateProfileBody {
  type: FlatmateProfileDTO["type"];
  budgetEuros: number;
  pronouns?: string;
  neighbourhood?: string;
  moveInFrom?: string;
  flexibleTiming?: boolean;
  about?: string;
  lifestyleTags?: string[];
}

export async function getFlatmateProfiles(
  filters: FlatmateFilters = {},
): Promise<ItemsPage<FlatmateProfileDTO>> {
  const query = new URLSearchParams();
  if (filters.type && filters.type !== "all") query.set("type", filters.type);
  if (filters.neighbourhood) query.set("neighbourhood", filters.neighbourhood);
  if (filters.budgetMax) query.set("budgetMax", String(filters.budgetMax));
  if (filters.moveInBy) query.set("moveInBy", filters.moveInBy);
  for (const tag of filters.tags ?? []) query.append("tags", tag);
  if (filters.page) query.set("page", String(filters.page));
  const qs = query.toString();
  const res = await apiGet<FlatmateProfileDTO[] | ItemsPage<FlatmateProfileDTO>>(
    `/flatmate-directory${qs ? `?${qs}` : ""}`,
  );
  return toItemsPage(res);
}

export const getMyFlatmateProfile = () =>
  apiGet<FlatmateProfileDTO | null>("/flatmate-profiles/mine");

export const upsertFlatmateProfile = (body: UpsertFlatmateProfileBody) =>
  apiPut<FlatmateProfileDTO>("/flatmate-profiles/mine", body);

export const sayHello = (slug: string, body: { body?: string }) =>
  apiPost<{ conversationId: string }>(
    `/flatmate-profiles/${slug}/hello`,
    body,
  );
