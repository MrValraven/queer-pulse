import type { AnySpace, RemovedSpace, VerifiedSpace } from "../safeSpaces";
import type {
  AnySafeSpaceDetailDTO,
  RemovedSpaceCardDTO,
  RemovedSpaceDetailDTO,
  SafeSpaceCardDTO,
  SafeSpaceDetailDTO,
  SafeSpaceListDTO,
} from "./safeSpaces.api";

/**
 * Map a public `SafeSpaceCardDTO` onto the `VerifiedSpace` view model the
 * safe-spaces grid renders. The grid (`SafeSpaceCard`) reads only card-level
 * fields (slug, category, typeLabel, name, neighbourhood, description, tags, rating, reviews);
 * detail-only fields are filled with empty defaults here because the detail
 * page fetches its own richer payload via `useSafeSpace` — these placeholder
 * values are never rendered by the grid.
 */
export function verifiedCardDtoToSpace(dto: SafeSpaceCardDTO): VerifiedSpace {
  return {
    status: "verified",
    slug: dto.slug,
    category: dto.cat,
    typeLabel: dto.typeLabel,
    name: dto.name,
    neighbourhood: dto.hood,
    description: dto.desc,
    tags: dto.tags,
    rating: dto.rating,
    reviews: `${dto.reviews} reviews`,
    tier: dto.tier ?? 0,
    // Whether the badge currently SPEAKS, which `status` cannot say: it stays
    // "verified" through a suspension because it is the discriminant against
    // a removed space. Anything rendering the badge reads these two.
    isBadgeSuspended: dto.isBadgeSuspended ?? false,
    isBadgeDueForReReview: dto.isBadgeDueForReReview ?? false,
    // detail-only fields — unused by the grid, filled by the detail fetch
    eyebrow: "",
    sub: "",
    metaPills: [],
    reVerified: "",
    verifier: "",
    promises: [],
    vouches: [],
    glance: [],
    address: "",
  };
}

/**
 * Map a public `RemovedSpaceCardDTO` onto the `RemovedSpace` view model the
 * removed-spaces grid renders (`SafeSpacesSections`). The grid reads only
 * slug, category, typeLabel, name, neighbourhood, reason, removedDate; detail-only fields
 * are filled with empty defaults, populated by the detail fetch instead.
 */
export function removedCardDtoToSpace(dto: RemovedSpaceCardDTO): RemovedSpace {
  return {
    status: "removed",
    slug: dto.slug,
    category: dto.cat,
    typeLabel: dto.typeLabel,
    name: dto.name,
    neighbourhood: dto.hood,
    reason: dto.reason,
    removedDate: dto.removedDate,
    listedSince: dto.listedSince,
    flags: dto.flags,
    // detail-only fields — unused by the grid, filled by the detail fetch
    reasonLong: [],
    timeline: [],
    whatNow: "",
  };
}

/**
 * Map the full `SafeSpaceListDTO` onto the shape `useSafeSpaces` returns:
 * both grids' view models plus the directory-header stats, unchanged.
 */
export function safeSpaceListToView(dto: SafeSpaceListDTO): {
  verified: VerifiedSpace[];
  removed: RemovedSpace[];
  stats: {
    verified: number;
    reviews: number;
    removed: number;
    lastReVerifiedAt: string | null;
  };
} {
  return {
    verified: dto.verified.map(verifiedCardDtoToSpace),
    removed: dto.removed.map(removedCardDtoToSpace),
    stats: {
      verified: dto.stats.verified,
      reviews: dto.stats.reviews,
      removed: dto.stats.removed,
      // Normalized to null rather than left undefined, so the hub has one
      // "there is no date to show" case instead of two.
      lastReVerifiedAt: dto.stats.lastReVerifiedAt ?? null,
    },
  };
}

function verifiedDetailDtoToSpace(dto: SafeSpaceDetailDTO): VerifiedSpace {
  return {
    status: "verified",
    slug: dto.slug,
    category: dto.cat,
    typeLabel: dto.typeLabel,
    name: dto.name,
    neighbourhood: dto.hood,
    description: dto.desc,
    tags: dto.tags,
    rating: dto.rating,
    reviews: `${dto.reviews} reviews`,
    tier: dto.tier ?? 0,
    isBadgeSuspended: dto.isBadgeSuspended ?? false,
    isBadgeDueForReReview: dto.isBadgeDueForReReview ?? false,
    eyebrow: dto.eyebrow,
    sub: dto.sub,
    metaPills: dto.metaPills,
    reVerified: dto.reVerified,
    verifier: dto.verifier,
    promises: dto.promises,
    vouches: dto.vouches,
    glance: dto.glance,
    address: dto.address,
  };
}

function removedDetailDtoToSpace(dto: RemovedSpaceDetailDTO): RemovedSpace {
  return {
    status: "removed",
    slug: dto.slug,
    category: dto.cat,
    typeLabel: dto.typeLabel,
    name: dto.name,
    neighbourhood: dto.hood,
    reason: dto.reason,
    removedDate: dto.removedDate,
    listedSince: dto.listedSince,
    flags: dto.flags,
    reasonLong: dto.reasonLong,
    timeline: dto.timeline,
    whatNow: dto.whatNow,
  };
}

/**
 * Map the `GET /directory/safe-spaces/:slug` discriminated-union DTO onto
 * `AnySpace` for the detail page, dispatching on `status` the same way the
 * demo-mode `getSpace` lookup does.
 */
export function safeSpaceDetailDtoToSpace(
  dto: AnySafeSpaceDetailDTO,
): AnySpace {
  if (dto.status === "verified") {
    return { kind: "verified", data: verifiedDetailDtoToSpace(dto) };
  }
  return { kind: "removed", data: removedDetailDtoToSpace(dto) };
}
