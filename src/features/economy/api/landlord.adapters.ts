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
/**
 * PRD-249. A `YYYY-MM` tenancy month in the reader's language ("Mar 2024").
 *
 * The day is INVENTED here and nowhere else: `new Date("2024-03-01")` exists
 * only so `Intl` has something to format, and the format options ask for month
 * and year alone, so the 1st never reaches the page. The stored value carries
 * no day precisely because the author never had it.
 */
function formatTenancyMonth(month: string, fmt: Formatters): string {
  return fmt.date(new Date(`${month}-01T00:00:00Z`), {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * The one line under a recommendation that says what the author actually
 * claimed: the tenancy window, or that it is still running.
 */
function tenancyLabelFrom(
  attestation: NonNullable<RecommendationDTO["attestation"]>,
  t: TFunction,
  fmt: Formatters,
): string {
  const from = formatTenancyMonth(attestation.tenancyStartedOn, fmt);
  return attestation.tenancyEndedOn
    ? t("economy:landlord.recommendation.tenancy.range", {
        from,
        to: formatTenancyMonth(attestation.tenancyEndedOn, fmt),
      })
    : t("economy:landlord.recommendation.tenancy.ongoing", { from });
}

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
    // PRD-249. Absent on a recommendation written before the platform asked
    // the author to attest, which the card says out loud rather than hiding.
    attestation: rec.attestation
      ? { tenancyLabel: tenancyLabelFrom(rec.attestation, t, fmt) }
      : undefined,
    // The landlord's own answer, transcribed and published by staff. The
    // "published by the team" half of the label is not decoration: a landlord
    // here has no account, so words on this page arriving in their name got
    // here through a person, and a reader has to be able to tell.
    landlordReply: rec.landlordReply
      ? {
          text: rec.landlordReply.text,
          publishedLabel: t("economy:landlord.recommendation.reply.published", {
            date: formatMonthYear(rec.landlordReply.publishedAt, fmt),
          }),
        }
      : undefined,
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
    // PRD-249. The counts the star row is shown WITH, never without. They come
    // from the DTO's aggregate rather than from `recommendations.length`,
    // because the list is capped server-side and the score is not: counting the
    // page would understate a landlord with a long history.
    ratingCount: dto.rating.count,
    ratingAttestedCount: dto.rating.attestedCount,
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
