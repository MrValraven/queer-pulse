import { apiGet, apiPost } from "../../../shared/api/client";
import { toItemsPage, type ItemsPage } from "../../../shared/api/pagination";
import type { MemberRefDTO } from "../../../shared/api/refs";

export interface LandlordCardDTO {
  slug: string;
  name: string;
  initials: string;
  tint: "coral" | "jade" | "plum";
  photo: string | null;
  hood: string;
  note: string;
  tagline: string;
  rating: { score: string; count: number };
}

export interface RecommendationDTO {
  name: string;
  initials: string;
  tint: "coral" | "jade" | "plum";
  member: MemberRefDTO | null;
  stars: number;
  text: string;
  createdAt: string;
}

export interface LandlordDetailDTO extends LandlordCardDTO {
  about: string[];
  areas: string[];
  rentingNote: string;
  stats: { value: string; label: string }[];
  recommendations: RecommendationDTO[];
}

export interface CreateLandlordBody {
  name: string;
  hood?: string;
  tagline?: string;
  note?: string;
  about?: string[];
  areas?: string[];
  rentingNote?: string;
}

export interface RecommendBody {
  stars: number;
  text: string;
}
export interface IntroRequestBody {
  name: string;
  note?: string;
  contactEmail?: string;
}

export async function getLandlords(
  filters: { hood?: string; page?: number } = {},
): Promise<ItemsPage<LandlordCardDTO>> {
  const query = new URLSearchParams();
  if (filters.hood) query.set("hood", filters.hood);
  if (filters.page) query.set("page", String(filters.page));
  const qs = query.toString();
  const res = await apiGet<LandlordCardDTO[] | ItemsPage<LandlordCardDTO>>(
    `/landlords${qs ? `?${qs}` : ""}`,
  );
  return toItemsPage(res);
}

export const getLandlord = (slug: string) =>
  apiGet<LandlordDetailDTO>(`/landlords/${slug}`);

export const createLandlord = (body: CreateLandlordBody) =>
  apiPost<LandlordDetailDTO>("/landlords", body);

export const recommendLandlord = (slug: string, body: RecommendBody) =>
  apiPost<RecommendationDTO>(`/landlords/${slug}/recommendations`, body);

export const requestIntro = (slug: string, body: IntroRequestBody) =>
  apiPost<{ id: string; status: string }>(
    `/landlords/${slug}/intro-requests`,
    body,
  );
