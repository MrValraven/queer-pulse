import type { Formatters } from "../../../shared/i18n/format";
import type { DirectoryPlace } from "../directoryPlaces";
import type { DirectoryCardDTO, DirectoryDetailDTO } from "./directory.api";

/**
 * Map a public `DirectoryCardDTO` onto the `DirectoryPlace` view model the grid
 * renders. The grid reads only card-level fields (name, cat, hood, desc, tint,
 * av, owned, member); the detail-only fields are filled with empty defaults
 * here because the detail page fetches its own richer payload via
 * `useDirectoryPlace` — these placeholder values are never rendered.
 */
export function cardDtoToPlace(dto: DirectoryCardDTO): DirectoryPlace {
  return {
    // card fields
    slug: dto.slug,
    name: dto.name,
    cat: dto.cat,
    hood: dto.hood,
    owned: dto.owned,
    member: dto.memberFirst ?? undefined,
    av: dto.av,
    tint: dto.tint,
    desc: dto.blurb,
    // detail-only fields — unused by the grid, filled by the detail fetch
    tagline: "",
    pills: [],
    rating: { score: "0", count: 0 },
    gallery: [],
    whatItIs: [],
    goodFor: [],
    hoursType: "appointment",
    hoursNote: "",
    owner: {
      name: "",
      initials: dto.av,
      tint: dto.tint,
      role: "",
      bio: "",
      inQueerPulse: dto.memberFirst !== null,
      first: dto.memberFirst ?? "",
    },
    social: {},
    address: "",
    reviews: [],
  };
}

/**
 * Map the full `DirectoryDetailDTO` onto `DirectoryPlace` for the detail page.
 * `fmt` composes each upcoming event's localized "Sat 21 Jun · 20:00" line from
 * the DTO's ISO `startAt` (the server emits the primitive; the client formats).
 */
export function detailDtoToPlace(
  dto: DirectoryDetailDTO,
  fmt: Formatters,
): DirectoryPlace {
  return {
    slug: dto.slug,
    name: dto.name,
    cat: dto.cat,
    hood: dto.hood,
    owned: dto.owned,
    member: dto.memberFirst ?? undefined,
    av: dto.av,
    tint: dto.tint,
    desc: dto.blurb,
    tagline: dto.tagline,
    pills: dto.pills,
    rating: dto.rating,
    gallery: dto.gallery,
    whatItIs: dto.whatItIs,
    goodFor: dto.goodFor,
    hoursType: dto.hoursType,
    hoursNote: dto.hoursNote,
    owner: dto.owner,
    social: dto.social,
    address: dto.address,
    reviews: dto.reviews,
    upcoming: dto.upcoming.map((event) => {
      const startAt = new Date(event.startAt);
      return {
        when: `${fmt.date(startAt, {
          weekday: "short",
          day: "numeric",
          month: "short",
        })} · ${fmt.time(startAt, { hour: "2-digit", minute: "2-digit" })}`,
        title: event.title,
      };
    }),
  };
}
