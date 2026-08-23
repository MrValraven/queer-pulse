import { DIRECTORY_PLACES, type DirectoryPlace } from "../marketing/directoryPlaces";
import type { ListingStatus } from "../marketing/listBusiness/listBusiness.data";

/**
 * One place on a profile. The card visuals come from the same
 * `DirectoryPlace` view model the `/local/directory` grid renders, so the
 * profile grid and the directory grid can never drift apart; the fields
 * around it are the profile's own owner-facing chrome.
 */
export interface MemberPlace {
  /** Stable react key — the registry slug or the submission ref. */
  key: string;
  status: ListingStatus;
  /** Submission reference, shown only to the owner. */
  ref?: string;
  /** What the card renders — see `LocalBusinessCardBody`. */
  place: DirectoryPlace;
}

/** The live places a member runs, from the static registry. `DirectoryPlace`
 *  already carries `member` (a member slug) — the profile just never read it. */
export function registryPlacesForMember(memberSlug: string): MemberPlace[] {
  return DIRECTORY_PLACES.filter((place) => place.member === memberSlug).map(
    (place) => ({
      key: place.slug,
      status: "live" as const,
      place,
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
  const seenSlugs = new Set(registry.map((entry) => entry.place.slug));
  const extraPlaces = submitted.filter((entry) => {
    if (seenSlugs.has(entry.place.slug)) return false;
    return isSelf || entry.status === "live";
  });
  return [...registry, ...extraPlaces];
}
