import type { HousingListing, Poster, Tint } from "../housingListings";
import type { MyHousingListingRow } from "../myHousingListings.data";
import type { HousingListingDTO } from "./housingListing.api";
import { initialsFromParts } from "../../../shared/lib/initials";
import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";

// Values copied verbatim from the housingListings.ts fixture (per type).
const TYPE_STYLE: Record<
  HousingListingDTO["type"],
  { tint: Tint; typeColor: string; typeText: string }
> = {
  sublet: { tint: "coral", typeColor: "rgba(var(--accent-rgb),.1)", typeText: "var(--accent-ink)" },
  room: { tint: "jade", typeColor: "rgba(var(--jade-rgb),.1)", typeText: "var(--jade)" },
  short: { tint: "plum", typeColor: "rgba(var(--plum-rgb),.08)", typeText: "var(--plum)" },
  studio: { tint: "plum", typeColor: "rgba(var(--violet-rgb),.1)", typeText: "var(--violet)" },
};

/**
 * `HousingListingDTO.lister` carries no join date and no response metric, so
 * `memberSince` stays empty and `responseTime` is left undefined. The detail
 * page and the message-sent confirmation both omit their line rather than
 * promise a reply speed for a lister who may never have answered anyone.
 */
function posterFrom(
  lister: HousingListingDTO["lister"],
  verificationLevel: HousingListingDTO["listerVerificationLevel"],
  t: TFunction,
): Poster {
  if (!lister) {
    const fallbackName = t("economy:member.fallbackName");
    return {
      initials: "", name: fallbackName, fullName: fallbackName,
      tint: "coral", memberSince: "", bio: "",
      verificationLevel,
    };
  }
  const full = `${lister.firstName} ${lister.lastName}`.trim();
  return {
    initials: initialsFromParts(lister.firstName, lister.lastName),
    name: `${lister.firstName} ${lister.lastName.charAt(0)}.`.trim(),
    fullName: full,
    tint: "coral",
    memberSince: "",
    bio: "",
    verificationLevel,
  };
}

/** "Studio" for 0 beds, else "N bed"/"N beds" — the compact `beds` chip text. */
function bedroomsLabel(bedrooms: number, t: TFunction): string {
  if (bedrooms === 0) return t("economy:housing.filterBar.bedsStudio");
  return t("economy:housing.beds.count", { count: bedrooms });
}

/**
 * Map a live listing DTO to the board's `HousingListing` view-model.
 *
 * i18n: the fact labels, the beds chip and the "available now" fallback are
 * chrome composed here in source, so they resolve through `t` rather than
 * shipping English into live mode; `fmt` renders the rent per the reader's
 * locale (pt-PT suffixes the symbol with a space, "1 100 €", so a hand-rolled
 * `€` prefix is always wrong there). Everything the lister typed
 * (`title`, `blurb`, `availableFrom`, `features`) passes through untouched.
 */
export function listingDtoToHousingListing(
  dto: HousingListingDTO,
  t: TFunction,
  fmt: Formatters,
): HousingListing {
  const style = TYPE_STYLE[dto.type] ?? TYPE_STYLE.sublet;
  const rent = fmt.currency(dto.rentEuros, "EUR", { maximumFractionDigits: 0 });
  const facts: { label: string; value: string }[] = [
    {
      label: t("economy:housing.fact.rent"),
      value: t("economy:housing.fact.rentPerMonth", { amount: rent }),
    },
    { label: t("economy:housing.fact.area"), value: dto.area || dto.city },
    {
      label: t("economy:housing.fact.available"),
      value: dto.availableFrom ?? t("economy:housing.fact.availableNow"),
    },
  ];
  if (dto.bedrooms !== null) {
    facts.push({
      label: t("economy:housing.filterBar.beds"),
      value: bedroomsLabel(dto.bedrooms, t),
    });
  }
  if (dto.minStayMonths) {
    facts.push({
      label: t("economy:housing.fact.minimumStay"),
      value: t("economy:housing.fact.minimumStayMonths", {
        count: dto.minStayMonths,
      }),
    });
  }
  facts.push({
    label: t("economy:housing.fact.bills"),
    value: t(
      dto.billsIncluded
        ? "economy:housing.fact.billsIncluded"
        : "economy:housing.fact.billsNotIncluded",
    ),
  });
  // `lgbtqFriendly` is intentionally NOT surfaced as a per-listing fact anymore:
  // being LGBTQ+ affirming is the mandatory universal baseline for every home
  // here, not a variable attribute. It shows as a norm badge instead (see
  // AffirmingBaselineBadge), so it never reads as something a listing could lack.

  return {
    slug: dto.slug,
    type: dto.type,
    typeColor: style.typeColor,
    typeText: style.typeText,
    tint: style.tint,
    title: dto.title,
    hood: dto.area || dto.city,
    beds: dto.bedrooms !== null ? bedroomsLabel(dto.bedrooms, t) : "",
    // Matches the demo fixture's own short "Now": `avail` is interpolated into
    // "Available from {date}", so it has to stay a short date-shaped phrase.
    avail: dto.availableFrom ?? t("economy:housing.fact.availableNow"),
    description: dto.blurb,
    price: rent,
    period: t("economy:housing.period.month"),
    image: dto.gallery[0],
    poster: posterFrom(dto.lister, dto.listerVerificationLevel, t),
    gallery: dto.gallery,
    longDesc: dto.description ? [dto.description] : [],
    features: dto.features,
    facts,
    idealFor: dto.idealFor,
    accessibilityInfo: dto.accessibilityInfo || undefined,
    billsIncluded: dto.billsIncluded,
    listerKind: dto.listerKind,
    verified: dto.listingVerified,
    verifiedReason: dto.listingVerifiedReason,
    bedrooms: dto.bedrooms ?? undefined,
    virtualTourUrl: dto.virtualTourUrl ?? undefined,
    location: {
      approxLatitude: dto.approxLatitude,
      approxLongitude: dto.approxLongitude,
      preciseLatitude: dto.preciseLatitude,
      preciseLongitude: dto.preciseLongitude,
      addressLine: dto.addressLine,
      precision: dto.locationPrecision,
    },
  };
}

/** The owner's "My Listings" row — see `MyHousingListingRow`'s doc comment for
 * why this is a distinct shape from `listingDtoToHousingListing`. */
export function dtoToMyHousingListingRow(
  dto: HousingListingDTO,
): MyHousingListingRow {
  return {
    ref: dto.ref,
    slug: dto.slug,
    status: dto.status,
    filledAt: dto.filledAt,
    expiresAt: dto.expiresAt,
    expired: dto.expired,
    createdAt: dto.createdAt,
    type: dto.type,
    title: dto.title,
    city: dto.city,
    area: dto.area,
    rentEuros: dto.rentEuros,
    bedrooms: dto.bedrooms ?? undefined,
    billsIncluded: dto.billsIncluded,
    accessibilityInfo: dto.accessibilityInfo,
    listerKind: dto.listerKind,
    virtualTourUrl: dto.virtualTourUrl ?? undefined,
  };
}
