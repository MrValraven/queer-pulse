import { isSameIdSet, orderedByIds, renumbered } from "../studioAdmin.model";
import {
  withNewStars,
  withoutSpotlightArtist,
} from "../studioAdminSpotlight.model";
import {
  STUDIO_ADMIN_SILENT_META,
  studioAdminDemoRefusal,
} from "../studioAdminDemoErrors";
import { useDemoAwareMutation } from "./demoAwareMutation";
import { useAdminStudioSpotlightCache } from "./StudioAdminSpotlightHooks";
import { refetchWhenStale } from "./StudioAdminSpotlightMutations";
import {
  removeAdminStudioSpotlightArtist,
  reorderAdminStudioNewStars,
  type AdminStudioSpotlightArtistDTO,
  type AdminStudioSpotlightDTO,
} from "./studioSpotlightAdmin.api";

// The Artists tab's list writes: remove a row from either slot, and reorder
// New stars. Each one patches the console cache in both modes; a live write
// also refreshes Studio home, which reads the same rows.

/** DELETE /admin/studio/spotlight/:id; New stars closes the gap. */
export function useRemoveAdminStudioSpotlightArtist() {
  const { demoMode, read, write, refetchRead, refreshMemberCuration } =
    useAdminStudioSpotlightCache();
  return useDemoAwareMutation<
    void,
    Error,
    { spotlightArtist: AdminStudioSpotlightArtistDTO }
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: STUDIO_ADMIN_SILENT_META,
    demoResult: () => undefined,
    live: ({ spotlightArtist }) =>
      removeAdminStudioSpotlightArtist(spotlightArtist.id),
    onSuccess: (_result, { spotlightArtist }) =>
      write(withoutSpotlightArtist(read(), spotlightArtist.id)),
    onLiveSuccess: refreshMemberCuration,
    onLiveError: refetchWhenStale(refetchRead),
  });
}

/** New stars moves at once and rolls back when the server refuses the
 *  order (`studio_spotlight_order_mismatch`). */
export function useReorderAdminStudioNewStars() {
  const {
    demoMode,
    read,
    write,
    cancelRead,
    refetchRead,
    refreshMemberCuration,
  } = useAdminStudioSpotlightCache();
  return useDemoAwareMutation<
    AdminStudioSpotlightArtistDTO[],
    Error,
    { spotlightIds: string[] },
    { previous: AdminStudioSpotlightDTO }
  >({
    demoMode,
    demoLatencyMs: 0,
    meta: STUDIO_ADMIN_SILENT_META,
    demoResult: ({ spotlightIds }) =>
      renumbered(orderedByIds(read().newStars, spotlightIds)),
    live: ({ spotlightIds }) => reorderAdminStudioNewStars({ spotlightIds }),
    onMutate: async ({ spotlightIds }) => {
      await cancelRead();
      const previous = read();
      // The server refuses a list that misses or repeats a row; the demo
      // answers the same 409 before the list moves.
      if (demoMode && !isSameIdSet(spotlightIds, previous.newStars))
        throw studioAdminDemoRefusal("studio_spotlight_order_mismatch");
      write(
        withNewStars(previous, orderedByIds(previous.newStars, spotlightIds)),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context) write(context.previous);
    },
    onLiveError: refetchRead,
    onSuccess: (saved) => write(withNewStars(read(), saved)),
    onLiveSuccess: refreshMemberCuration,
  });
}
