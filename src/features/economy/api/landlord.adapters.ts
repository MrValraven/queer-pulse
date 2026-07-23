import type { Landlord, Recommendation } from "../landlords";
import type {
  LandlordCardDTO,
  LandlordDetailDTO,
  RecommendationDTO,
} from "./landlord.api";

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

function recDtoToRecommendation(rec: RecommendationDTO): Recommendation {
  return {
    initials: rec.initials, // server-computed from the DTO's own member ref
    name: rec.name,
    tint: rec.tint,
    stars: rec.stars,
    text: rec.text,
    when: `Recommended ${formatMonthYear(rec.createdAt)}`,
  };
}

function formatMonthYear(iso: string): string {
  const date = new Date(iso);
  return `${date.toLocaleString("en", { month: "short" })} ${date.getFullYear()}`;
}

export function landlordDetailToLandlord(dto: LandlordDetailDTO): Landlord {
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
    recommendations: dto.recommendations.map(recDtoToRecommendation),
    rentingNote: dto.rentingNote,
  };
}
