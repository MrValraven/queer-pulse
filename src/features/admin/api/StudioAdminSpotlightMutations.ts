import { studioErrorCodeOf } from "../../studio/api/studio.api";
import type { StudioErrorCode } from "../../studio/api/studio.types";
import {
  isNewStarsFull,
  newStarArtistIds,
  withSavedSpotlightArtist,
} from "../studioAdminSpotlight.model";
import {
  STUDIO_ADMIN_SILENT_META,
  studioAdminDemoRefusal,
} from "../studioAdminDemoErrors";
import { useDemoAwareMutation } from "./demoAwareMutation";
import { useAdminStudioSpotlightCache } from "./StudioAdminSpotlightHooks";
import {
  addAdminStudioNewStar,
  clearAdminStudioArtistOfTheMonth,
  putAdminStudioArtistOfTheMonth,
  updateAdminStudioSpotlightNote,
  type AdminStudioSpotlightArtistDTO,
  type AdminStudioSpotlightArtistOptionDTO,
} from "./studioSpotlightAdmin.api";

// The Artists tab's slot writes: set the month, clear it, add a New star and
// edit a note. Remove and reorder live in StudioAdminSpotlightListMutations.
// Each one patches the console cache in both modes; a live write also
// refreshes Studio home, which reads the same rows.

export interface SpotlightArtistChoice {
  option: AdminStudioSpotlightArtistOptionDTO;
  note: string | null;
}

/** Refusals that mean this console's copy is out of date: a row another
 *  console removed, a New stars list another console filled, or an artist
 *  another console already added. */
const STALE_SPOTLIGHT_CODES: ReadonlySet<StudioErrorCode> = new Set([
  "studio_spotlight_not_found",
  "studio_spotlight_slot_full",
  "studio_spotlight_already_in_slot",
]);

/** After a stale refusal the read is fetched again, so the console shows
 *  what the server holds. */
export function refetchWhenStale(refetchRead: () => void) {
  return (error: Error) => {
    const code = studioErrorCodeOf(error);
    if (code !== null && STALE_SPOTLIGHT_CODES.has(code)) refetchRead();
  };
}

/** PUT /admin/studio/spotlight/artist-of-the-month: a fresh row replaces
 *  the current one, and the old note goes with it. */
export function useSetAdminStudioArtistOfTheMonth() {
  const { demoMode, read, write, refreshMemberCuration } =
    useAdminStudioSpotlightCache();
  return useDemoAwareMutation<
    AdminStudioSpotlightArtistDTO,
    Error,
    SpotlightArtistChoice
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: STUDIO_ADMIN_SILENT_META,
    demoResult: ({ option, note }) => {
      if (option.latestReleaseTitle === null)
        throw studioAdminDemoRefusal("studio_spotlight_no_release", 422);
      return {
        id: `demo-spotlight-month-${option.artist.id}-${Date.now()}`,
        slot: "artist_of_the_month",
        position: 1,
        note,
        createdAt: new Date().toISOString(),
        isListenable: true,
        artist: option.artist,
      };
    },
    live: ({ option, note }) =>
      putAdminStudioArtistOfTheMonth({ subprofileId: option.artist.id, note }),
    onSuccess: (saved) => write(withSavedSpotlightArtist(read(), saved)),
    onLiveSuccess: refreshMemberCuration,
  });
}

/** DELETE /admin/studio/spotlight/artist-of-the-month. */
export function useClearAdminStudioArtistOfTheMonth() {
  const { demoMode, read, write, refreshMemberCuration } =
    useAdminStudioSpotlightCache();
  return useDemoAwareMutation<void, Error, void>({
    demoMode,
    demoLatencyMs: 0,
    meta: STUDIO_ADMIN_SILENT_META,
    demoResult: () => undefined,
    live: () => clearAdminStudioArtistOfTheMonth(),
    onSuccess: () => write({ ...read(), artistOfTheMonth: null }),
    onLiveSuccess: refreshMemberCuration,
  });
}

/** POST /admin/studio/spotlight/new-stars: the artist joins the end. */
export function useAddAdminStudioNewStar() {
  const { demoMode, read, write, refetchRead, refreshMemberCuration } =
    useAdminStudioSpotlightCache();
  return useDemoAwareMutation<
    AdminStudioSpotlightArtistDTO,
    Error,
    SpotlightArtistChoice
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: STUDIO_ADMIN_SILENT_META,
    demoResult: ({ option, note }) => {
      const spotlight = read();
      if (newStarArtistIds(spotlight).has(option.artist.id))
        throw studioAdminDemoRefusal("studio_spotlight_already_in_slot");
      if (isNewStarsFull(spotlight.newStars))
        throw studioAdminDemoRefusal("studio_spotlight_slot_full");
      if (option.latestReleaseTitle === null)
        throw studioAdminDemoRefusal("studio_spotlight_no_release", 422);
      return {
        id: `demo-spotlight-star-${option.artist.id}-${Date.now()}`,
        slot: "new_stars",
        position: spotlight.newStars.length + 1,
        note,
        createdAt: new Date().toISOString(),
        isListenable: true,
        artist: option.artist,
      };
    },
    live: ({ option, note }) =>
      addAdminStudioNewStar({ subprofileId: option.artist.id, note }),
    onSuccess: (saved) => write(withSavedSpotlightArtist(read(), saved)),
    onLiveSuccess: refreshMemberCuration,
    onLiveError: refetchWhenStale(refetchRead),
  });
}

export interface UpdateAdminStudioSpotlightNoteVariables {
  spotlightArtist: AdminStudioSpotlightArtistDTO;
  note: string | null;
}

/** PATCH /admin/studio/spotlight/:id; a null note clears it. */
export function useUpdateAdminStudioSpotlightNote() {
  const { demoMode, read, write, refetchRead, refreshMemberCuration } =
    useAdminStudioSpotlightCache();
  return useDemoAwareMutation<
    AdminStudioSpotlightArtistDTO,
    Error,
    UpdateAdminStudioSpotlightNoteVariables
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: STUDIO_ADMIN_SILENT_META,
    demoResult: ({ spotlightArtist, note }) => ({ ...spotlightArtist, note }),
    live: ({ spotlightArtist, note }) =>
      updateAdminStudioSpotlightNote(spotlightArtist.id, { note }),
    onSuccess: (saved) => write(withSavedSpotlightArtist(read(), saved)),
    onLiveSuccess: refreshMemberCuration,
    onLiveError: refetchWhenStale(refetchRead),
  });
}
