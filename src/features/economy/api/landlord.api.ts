import { apiDelete, apiGet, apiPost } from "../../../shared/api/client";
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
  /**
   * The recommendation's own uuid, and the handle a member's report is
   * addressed by (`subjectType: "landlord_recommendation"`). Withheld from this
   * DTO until the report path existed, which is exactly why no complaint could
   * reach a single recommendation: the only control on the page named the whole
   * directory entry, so acting on it took down every other tenant's warning
   * about that landlord too.
   */
  id: string;
  /** Empty when the author has erased their account, alongside a `null`
   * `member`. Render a placeholder; never assume a byline. */
  name: string;
  initials: string;
  tint: "coral" | "jade" | "plum";
  /** `null` once the author erased their account
   * (`landlord_recommendations.author_user_id` is `ON DELETE SET NULL`), and
   * for a missing profile row. Both read the same way: the warning stands, the
   * byline is gone. */
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

/**
 * DELETE /landlords/:slug/recommendations/mine — the author takes their own
 * public rating of a named real person down. Idempotent server-side (204 even
 * when there was nothing to withdraw) and 404 only when the landlord entry
 * itself is gone, so the caller treats a resolved promise as "it is down".
 */
export const withdrawMyRecommendation = (slug: string) =>
  apiDelete<void>(`/landlords/${slug}/recommendations/mine`);

export const requestIntro = (slug: string, body: IntroRequestBody) =>
  apiPost<{ id: string; status: string }>(
    `/landlords/${slug}/intro-requests`,
    body,
  );
