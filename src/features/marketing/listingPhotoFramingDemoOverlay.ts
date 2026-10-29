import type { ListingPhotoFramingEntry } from "./api/directory.api";
import type { DirectoryPlace } from "./directoryPlaces";
import { placeWithPhotoFraming } from "./listingPhotoFramingCache";

/** Saved demo framings by listing slug; lives for the tab's session, like the other demo overlays. */
const framingsBySlug = new Map<string, ListingPhotoFramingEntry[]>();

/** Remembers a demo save; a later save for the same slug layers over the earlier ones. */
export function recordDemoPhotoFraming(
  slug: string,
  photos: ListingPhotoFramingEntry[],
): void {
  framingsBySlug.set(slug, [...(framingsBySlug.get(slug) ?? []), ...photos]);
}

/** The fixture with its recorded framings; the same object when nothing was saved for its slug. */
export function applyDemoPhotoFraming(place: DirectoryPlace): DirectoryPlace {
  const entries = framingsBySlug.get(place.slug);
  return entries?.length ? placeWithPhotoFraming(place, entries) : place;
}

export function resetDemoPhotoFraming(): void {
  framingsBySlug.clear();
}
