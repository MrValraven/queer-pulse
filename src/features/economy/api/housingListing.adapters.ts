import type { HousingListing, Poster, Tint } from "../housingListings";
import type { HousingListingDTO } from "./housingListing.api";
import { initialsFromParts } from "../../../shared/lib/initials";

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

function posterFrom(
  lister: HousingListingDTO["lister"],
  verificationLevel: HousingListingDTO["listerVerificationLevel"],
): Poster {
  if (!lister) {
    return {
      initials: "", name: "A member", fullName: "A member",
      tint: "coral", memberSince: "", responseTime: "within a day", bio: "",
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
    responseTime: "within a day",
    bio: "",
    verificationLevel,
  };
}

/** "Studio" for 0 beds, else "N bed"/"N beds" — the compact `beds` chip text. */
function bedroomsLabel(bedrooms: number): string {
  if (bedrooms === 0) return "Studio";
  return `${bedrooms} ${bedrooms === 1 ? "bed" : "beds"}`;
}

export function listingDtoToHousingListing(dto: HousingListingDTO): HousingListing {
  const style = TYPE_STYLE[dto.type] ?? TYPE_STYLE.sublet;
  const facts: { label: string; value: string }[] = [
    { label: "Rent", value: `€${dto.rentEuros.toLocaleString()} / month` },
    { label: "Area", value: dto.area || dto.city },
    { label: "Available", value: dto.availableFrom ?? "Now" },
  ];
  if (dto.bedrooms !== null) {
    facts.push({ label: "Bedrooms", value: bedroomsLabel(dto.bedrooms) });
  }
  if (dto.minStayMonths) {
    facts.push({ label: "Minimum stay", value: `${dto.minStayMonths} months` });
  }
  facts.push({ label: "Bills", value: dto.billsIncluded ? "Included" : "Not included" });
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
    beds: dto.bedrooms !== null ? bedroomsLabel(dto.bedrooms) : "",
    avail: dto.availableFrom ?? "Available now",
    description: dto.blurb,
    price: `€${dto.rentEuros.toLocaleString()}`,
    period: "month",
    image: dto.gallery[0],
    poster: posterFrom(dto.lister, dto.listerVerificationLevel),
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
