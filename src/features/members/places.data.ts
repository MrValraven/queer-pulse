import { DIRECTORY_PLACES } from "../marketing/directoryPlaces";
import type { ListingStatus } from "../marketing/listBusiness/listBusiness.data";

/** One place on a profile, from either source, flattened for rendering. */
export interface MemberPlace {
  /** Stable react key — the registry slug or the submission ref. */
  key: string;
  name: string;
  slug: string;
  status: ListingStatus;
  /** "Café · Arroios" — category and neighbourhood. */
  meta: string;
  blurb?: string;
  /** Submission reference, shown only to the owner. */
  ref?: string;
}

/** The live places a member runs, from the static registry. `DirectoryPlace`
 *  already carries `member` (a member slug) — the profile just never read it. */
export function registryPlacesForMember(memberSlug: string): MemberPlace[] {
  return DIRECTORY_PLACES.filter((place) => place.member === memberSlug).map(
    (place) => ({
      key: place.slug,
      name: place.name,
      slug: place.slug,
      status: "live" as const,
      meta: [place.cat, place.hood].filter(Boolean).join(" · "),
      blurb: place.desc,
    }),
  );
}

/**
 * Registry places plus this session's submissions. Visitors see live only;
 * the owner also sees anything still in review. A submission already present in
 * the registry (same slug) is dropped so an approved listing shows once.
 */
export function mergePlaces(
  registry: MemberPlace[],
  submitted: MemberPlace[],
  isSelf: boolean,
): MemberPlace[] {
  const seenSlugs = new Set(registry.map((place) => place.slug));
  const extraPlaces = submitted.filter((place) => {
    if (seenSlugs.has(place.slug)) return false;
    return isSelf || place.status === "live";
  });
  return [...registry, ...extraPlaces];
}
