import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  attachEventPhoto,
  getEventPhotos,
  type EventPhotoDTO,
} from "./events.api";
import { demoEventPhotos } from "./eventPhotos.mock";

/**
 * Event photo album for `/gatherings/:slug/photos`. Demo mode returns the
 * page's own mock (network-free); live mode calls GET /events/:slug/photos,
 * which the backend gates to participants (host/cohosts/going).
 */
export function useEventPhotos(slug: string) {
  const { demoMode } = useDemoMode();
  const query = useQuery({
    queryKey: ["event-photos", demoMode, slug],
    enabled: demoMode || slug !== "",
    queryFn: async (): Promise<EventPhotoDTO[]> => {
      if (demoMode || !slug) return demoEventPhotos();
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
