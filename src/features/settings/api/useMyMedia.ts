import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  deleteMyMedia,
  getMyMedia,
  type MyMediaListResult,
} from "./myMedia.api";
import { getDemoMyMedia, removeDemoMedia } from "./myMedia.demo";

export const MY_MEDIA_KEY = "my-media";

/** The signed-in member's own uploaded images. Live mode hits GET /me/media;
 *  demo mode reads the mutable demo store so deletes persist for the session
 *  without a real bucket. `isDemo` lets consumers (e.g. `MyUploadsPane`)
 *  short-circuit on demo instead of rendering the stand-in data. */
export function useMyMedia() {
  const { demoMode } = useDemoMode();
  const query = useQuery<MyMediaListResult>({
    queryKey: [MY_MEDIA_KEY],
    enabled: true,
    queryFn: () =>
      demoMode
        ? // Demo data is fully known, so its reference checks never fail.
          Promise.resolve({ items: getDemoMyMedia(), degraded: false })
        : getMyMedia(),
  });
  return {
    ...query,
    items: query.data?.items ?? [],
    degraded: query.data?.degraded ?? false,
    isDemo: demoMode,
  };
}

export function useDeleteMyMedia() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (key: string) => {
      if (demoMode) {
        removeDemoMedia(key);
        return;
      }
      await deleteMyMedia(key);
    },
    onSuccess: (_result, key) => {
      queryClient.setQueryData<MyMediaListResult>([MY_MEDIA_KEY], (current) =>
        current
          ? { ...current, items: current.items.filter((item) => item.key !== key) }
          : current,
      );
    },
  });
}
