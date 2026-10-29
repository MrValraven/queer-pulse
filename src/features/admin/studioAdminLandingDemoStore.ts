import { foldForSearch } from "../../shared/lib/foldForSearch";
import type {
  AdminStudioLandingDTO,
  AdminStudioLandingPersonaOptionDTO,
  AdminStudioLandingPreviewDTO,
  AdminStudioLandingTrackOptionDTO,
} from "./api/studioLandingAdmin.api";
import { isSameIdSet, orderedByIds } from "./studioAdmin.model";
import {
  LIMITS,
  SEARCH_MAX,
  demoRefusal,
  INELIGIBLE_PERSONA_IDS,
  DEMO_PERSONAS,
  trackEntries,
  isOpen,
  flagged,
  previewOf,
} from "./studioAdminLandingDemoBase";
import { seedLanding } from "./StudioAdminLandingSeed.data";

// The Studio page console's in-memory demo store, its searches and the
// preview writes. Every write throws the contract's coded refusal.

let store: AdminStudioLandingDTO | null = null;
let idCounter = 0;
export const nextId = (prefix: string) =>
  `${prefix}-${Date.now()}-${(idCounter += 1)}`;
export const current = (): AdminStudioLandingDTO => (store ??= seedLanding());
export const commit = (next: AdminStudioLandingDTO) => {
  store = next;
};

/** Tests call it so one test's writes never reach the next. */
export function resetDemoAdminStudioLanding(): void {
  store = null;
}

export const demoAdminStudioLanding = (): AdminStudioLandingDTO => current();

function matches(query: string, ...fields: string[]): boolean {
  const folded = foldForSearch(query);
  return fields.some((field) => foldForSearch(field).includes(folded));
}

export function demoLandingTrackSearch(
  query: string,
): AdminStudioLandingTrackOptionDTO[] {
  const openTrackIds = new Set(
    current()
      .previews.filter(isOpen)
      .map((preview) => preview.track.id),
  );
  return trackEntries()
    .filter((entry) =>
      matches(query, entry.track.title, entry.release.title, entry.artist.name),
    )
    .slice(0, SEARCH_MAX)
    .map((entry) => ({
      ...entry,
      hasOpenPreview: openTrackIds.has(entry.track.id),
    }));
}

export function demoLandingPersonaSearch(
  query: string,
): AdminStudioLandingPersonaOptionDTO[] {
  const { artistCards, foundingArtists } = current();
  return DEMO_PERSONAS.filter((artist) =>
    matches(query, artist.name, artist.handle),
  )
    .slice(0, SEARCH_MAX)
    .map((artist) => ({
      artist,
      isEligible: !INELIGIBLE_PERSONA_IDS.has(artist.id),
      hasCard: artistCards.some((card) => card.artist.id === artist.id),
      isFoundingArtist: foundingArtists.some(
        (listed) => listed.artist.id === artist.id,
      ),
    }));
}
function withOpenPreviews(open: AdminStudioLandingPreviewDTO[]) {
  const landing = current();
  commit({
    ...landing,
    previews: [
      ...flagged(open),
      ...landing.previews.filter((preview) => !isOpen(preview)),
    ],
  });
  return flagged(open);
}
const openPreviews = () => current().previews.filter(isOpen);

export function demoRequestPreview(trackId: string) {
  const entry = trackEntries().find((item) => item.track.id === trackId);
  if (!entry || entry.ineligibleReason)
    throw demoRefusal("studio_landing_preview_track_not_eligible", 422, {
      ineligibleReason: entry?.ineligibleReason ?? "not_playable",
    });
  const open = openPreviews();
  if (open.some((preview) => preview.track.id === trackId))
    throw demoRefusal("studio_landing_preview_exists", 409);
  if (open.length >= LIMITS.openPreviews)
    throw demoRefusal("studio_landing_previews_full", 409);
  const row = {
    ...previewOf(entry, "pending", new Date().toISOString()),
    id: nextId("demo-landing-preview"),
  };
  const saved = withOpenPreviews([...open, row]);
  return saved[saved.length - 1] ?? row;
}

export function demoRemovePreview(previewId: string): void {
  const landing = current();
  const preview = landing.previews.find((item) => item.id === previewId);
  if (!preview) throw demoRefusal("studio_landing_preview_not_found", 404);
  commit({
    ...landing,
    previews: landing.previews.filter((item) => item.id !== previewId),
  });
  withOpenPreviews(openPreviews());
}

export function demoReorderPreviews(previewIds: string[]) {
  const open = openPreviews();
  if (!isSameIdSet(previewIds, open))
    throw demoRefusal("studio_landing_order_mismatch", 409);
  return withOpenPreviews(orderedByIds(open, previewIds));
}
export function personaOf(subprofileId: string) {
  return DEMO_PERSONAS.find((persona) => persona.id === subprofileId) ?? null;
}
