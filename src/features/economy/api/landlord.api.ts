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
  rating: LandlordRatingDTO;
  /**
   * PRD-249. Always `true`, served on every card and every detail read.
   *
   * It is a constant on the wire rather than a rule each surface has to
   * remember: this whole directory rates real third parties who have no account
   * here, from claims nothing can check, so the score may never be rendered as
   * a bare number. Reading this field is what keeps a new card honest.
   */
  isRatingSelfReported: true;
}

/**
 * The headline rating and what it is made of. `attestedCount` is how many of
 * the `count` recommendations carry an author attestation that they rented from
 * this landlord: always `<= count`, and lower on any landlord with
 * recommendations written before the attestation was asked for.
 */
export interface LandlordRatingDTO {
  score: string;
  count: number;
  attestedCount: number;
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
  /**
   * PRD-249. Always `true`, on every recommendation. Nothing on the platform
   * has checked any of this: a landlord is not a member, there is no lease on
   * file, and no interaction gate was possible (almost every tenancy worth
   * writing about started off-platform). What varies row to row is
   * `attestation`; what never varies is that it is unverified.
   */
  isSelfAttested: true;
  /** The author's own claim that they rented from this landlord, and roughly
   *  when. `null` on a recommendation written before the platform asked. */
  attestation: RecommendationAttestationDTO | null;
  /** The named landlord's answer, published by staff on their behalf because
   *  they have no account here. `null` when there is none. */
  landlordReply: LandlordReplyDTO | null;
}

/** Month precision (`YYYY-MM`) on purpose: people remember the season, not the
 *  day, and a date input would print a precision the author never had. */
export interface RecommendationAttestationDTO {
  tenancyStartedOn: string;
  /** `null` when the author says they still rent from this landlord. */
  tenancyEndedOn: string | null;
  attestedAt: string;
}

/** `publishedByStaff` is always `true` and must be rendered: these words
 *  reached the page through a staff member, since the landlord holds no
 *  account to post them from. */
export interface LandlordReplyDTO {
  text: string;
  publishedAt: string;
  publishedByStaff: true;
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
  /**
   * PRD-249. Must be `true`; the backend refuses anything else. Only somebody
   * who rented from this landlord may rate them, and this is the author saying
   * so. It is an attestation, never a verification.
   */
  hasRentedFromThisLandlord: true;
  /** `YYYY-MM`. Required alongside the attestation. */
  tenancyStartedOn: string;
  /** `YYYY-MM`, or omitted when the author still rents from them. */
  tenancyEndedOn?: string;
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
