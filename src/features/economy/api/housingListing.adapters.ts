import type { AvatarTint } from "../../../shared/components/ui/Avatar";
import type { HousingListing, Poster, Tint } from "../housingListings";
import type { HousingListingDTO } from "./housingListing.api";

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

function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

function posterFrom(lister: HousingListingDTO["lister"]): Poster {
  if (!lister) {
    return {
      initials: "", name: "A member", fullName: "A member",
      tint: "coral", memberSince: "", responseTime: "within a day", bio: "",
    };
  }
  const full = `${lister.firstName} ${lister.lastName}`.trim();
  return {
    initials: initials(lister.firstName, lister.lastName),
    name: `${lister.firstName} ${lister.lastName.charAt(0)}.`.trim(),
    fullName: full,
    tint: "coral" as AvatarTint,
    memberSince: "",
    responseTime: "within a day",
    bio: "",
  };
}

export function listingDtoToHousingListing(dto: HousingListingDTO): HousingListing {
  const style = TYPE_STYLE[dto.type] ?? TYPE_STYLE.sublet;
  const facts: { label: string; value: string }[] = [
    { label: "Rent", value: `€${dto.rentEuros.toLocaleString()} / month` },
    { label: "Area", value: dto.area || dto.city },
    { label: "Available", value: dto.availableFrom ?? "Now" },
  ];
  if (dto.minStayMonths) {
    facts.push({ label: "Minimum stay", value: `${dto.minStayMonths} months` });
  }
  facts.push({ label: "Bills", value: dto.billsIncluded ? "Included" : "Not included" });
  if (dto.lgbtqFriendly) facts.push({ label: "LGBTQ+ friendly", value: "Yes" });

  return {
    slug: dto.slug,
    type: dto.type,
    typeColor: style.typeColor,
    typeText: style.typeText,
    tint: style.tint,
    title: dto.title,
    hood: dto.area || dto.city,
    beds: "", // backend has no `beds` field — rendered minimally (documented gap)
    avail: dto.availableFrom ?? "Available now",
    desc: dto.blurb,
    price: `€${dto.rentEuros.toLocaleString()}`,
    period: "month",
    image: dto.gallery[0],
    poster: posterFrom(dto.lister),
    gallery: dto.gallery,
    longDesc: dto.description ? [dto.description] : [],
    features: dto.features,
    facts,
    idealFor: dto.idealFor,
  };
}
