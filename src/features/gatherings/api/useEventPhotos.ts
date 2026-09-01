import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  attachEventPhoto,
  getEventPhotos,
  removeEventPhoto,
  type EventPhotoDTO,
} from "./events.api";
import { demoEventPhotos } from "./eventPhotos.mock";

/** The one cache key the album reads and both album mutations patch. */
function eventPhotosKey(demoMode: boolean, slug: string) {
  return ["event-photos", demoMode, slug];
}

/**
 * Event photo album for `/gatherings/:slug/photos`. Demo mode returns the
 * page's own mock (network-free); live mode calls GET /events/:slug/photos,
 * which the backend gates to participants (host/cohosts/going).
 */
export function useEventPhotos(slug: string) {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: eventPhotosKey(demoMode, slug),
    enabled: demoMode || slug !== "",
    queryFn: async (): Promise<EventPhotoDTO[]> => {
      // The fixture is reachable ONLY through demoMode. A live album with no
      // slug yet never runs this (`enabled` is false above) and must never
      // fall back to the mock: its ids are `demo-photo-0`, not uuids, so a
      // report or a delete raised against one could not work.
      if (demoMode) return demoEventPhotos();
      const { photos } = await getEventPhotos(slug);
      return photos;
    },
  });
  return {
    photos: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}

/** Attach an uploaded photo (organizers only, enforced server-side). */
export function useAttachEventPhoto(slug: string) {
  const client = useQueryClient();
  return useMutation({
    // GatheringPhotosLive toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: (body: { key: string; caption?: string }) =>
      attachEventPhoto(slug, body),
    onSuccess: () => client.invalidateQueries({ queryKey: ["event-photos"] }),
  });
}

/**
 * Take one photo out of the album. The backend allows the photo's uploader or
 * an organizer (host or co-host); the caller decides who sees the control, and
 * the server is the authority.
 *
 * These are photographs of people at a queer gathering, so the removal is
 * optimistic: the tile goes the instant the member confirms, rather than after
 * a round trip. `onMutate` cancels any in-flight album fetch (which would
 * otherwise land afterwards and paint the photo back) and snapshots the list;
 * `onError` restores that snapshot, so a failed delete visibly returns the
 * photo instead of leaving a hole that a later refetch quietly refills. The
 * caller pairs that rollback with an error toast. `meta.silentError` keeps the
 * global mutation toast from doubling it.
 *
 * Demo mode drops the tile from the cache and never calls the network: the
 * album fixture is not persisted, so a live DELETE has nothing to act on.
 */
export function useRemoveEventPhoto(slug: string) {
  const { demoMode } = useDemoMode();
  const client = useQueryClient();
  const queryKey = eventPhotosKey(demoMode, slug);

  return useMutation<
    void,
    unknown,
    { photoId: string },
    { previousPhotos: EventPhotoDTO[] | undefined }
  >({
    meta: { silentError: true },
    mutationFn: async ({ photoId }) => {
      if (demoMode) return;
      await removeEventPhoto(slug, photoId);
    },
    onMutate: async ({ photoId }) => {
      await client.cancelQueries({ queryKey });
      const previousPhotos = client.getQueryData<EventPhotoDTO[]>(queryKey);
      client.setQueryData<EventPhotoDTO[]>(queryKey, (current) =>
        current?.filter((photo) => photo.id !== photoId),
      );
      return { previousPhotos };
    },
    onError: (_error, _variables, context) => {
      if (context) client.setQueryData(queryKey, context.previousPhotos);
    },
    onSettled: () => {
      // Demo mode would refetch the fixture and undo the optimistic removal.
      if (demoMode) return;
      void client.invalidateQueries({ queryKey });
    },
  });
}
