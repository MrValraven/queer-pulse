import type { Landlord, Recommendation } from "../landlords";
import type {
  LandlordCardDTO,
  LandlordDetailDTO,
  RecommendationDTO,
} from "./landlord.api";
import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";

/** The board section only renders identity + stars + note. */
export type LandlordCard = Pick<
  Landlord,
  "slug" | "name" | "initials" | "tint" | "photo" | "hood" | "stars" | "note"
>;

function starsFromRating(rating: { score: string }): number {
  return Math.round(Number(rating.score)) || 0;
}

export function cardDtoToLandlordCard(dto: LandlordCardDTO): LandlordCard {
  return {
    slug: dto.slug,
    name: dto.name,
    initials: dto.initials,
    tint: dto.tint,
    photo: dto.photo ?? "",
    hood: dto.hood,
    stars: starsFromRating(dto.rating),
    note: dto.note,
  };
}

/**
 * i18n: the "Recommended …" line is chrome wrapped around a date, so the
 * phrase resolves through `t` and the date through `fmt` (the old version
 * pinned the month name to `en` regardless of the reader's language).
 */
function recDtoToRecommendation(
  rec: RecommendationDTO,
  t: TFunction,
  fmt: Formatters,
  mySlug: string | undefined,
): Recommendation {
  return {
    // The handle the per-recommendation report control is addressed by.
    id: rec.id,
    initials: rec.initials, // server-computed from the DTO's own member ref
    name: rec.name,
    tint: rec.tint,
    stars: rec.stars,
    text: rec.text,
    when: t("economy:landlord.recommendation.when", {
      date: formatMonthYear(rec.createdAt, fmt),
    }),
    // Ownership comes from the DTO's own member ref against the live session,
    // so the withdraw control only appears on the reader's own rating. A DTO
    // with no member ref (a deleted account) belongs to nobody.
    isMine: Boolean(mySlug && rec.member?.slug === mySlug),
    // `landlord_recommendations.author_user_id` is `ON DELETE SET NULL`, so a
    // warning outlives its author and comes back with no member ref. That is
    // the same shape a missing profile row produces, and it reads the same way
    // on the page, so one flag covers both.
    isAuthorRemoved: rec.member === null,
  };
}

function formatMonthYear(iso: string, fmt: Formatters): string {
  return fmt.date(new Date(iso), { month: "short", year: "numeric" });
}

export function landlordDetailToLandlord(
  dto: LandlordDetailDTO,
  t: TFunction,
  fmt: Formatters,
  mySlug?: string,
): Landlord {
  return {
    slug: dto.slug,
    name: dto.name,
    initials: dto.initials,
    tint: dto.tint,
    photo: dto.photo ?? "",
    hood: dto.hood,
    stars: starsFromRating(dto.rating),
    note: dto.note,
    tagline: dto.tagline,
    about: dto.about,
    areas: dto.areas,
    stats: dto.stats,
    recommendations: dto.recommendations.map((rec) =>
      recDtoToRecommendation(rec, t, fmt, mySlug),
    ),
    rentingNote: dto.rentingNote,
  };
}
