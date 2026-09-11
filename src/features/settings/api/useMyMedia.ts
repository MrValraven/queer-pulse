import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  isIdentityCrop,
  type CropRect,
} from "../../../shared/components/ui/cropGeometry";
import { saveCrop } from "../../members/api/uploads.api";
import {
  deleteMyMedia,
  getMyMedia,
  type MyMediaListResult,
} from "./myMedia.api";
import {
  getDemoMyMedia,
  removeDemoMedia,
  setDemoMediaCrop,
} from "./myMedia.demo";

export const MY_MEDIA_KEY = "my-media";

/** The signed-in member's own uploaded images. Live mode hits GET /me/media;
 *  demo mode reads the mutable demo store so deletes persist for the session
 *  without a real bucket. `isDemo` lets consumers (e.g. `MyUploadsPane`)
 *  short-circuit on demo instead of rendering the stand-in data. */
export function useMyMedia() {
  const { demoMode } = useDemoMode();
  const query = useQuery<MyMediaListResult>({
    // Keyed on the mode like every sibling hook: one shared key meant that
    // after a demo/live switch the pane served the other mode's cached list
    // until it happened to refetch.
    queryKey: [MY_MEDIA_KEY, demoMode],
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
      queryClient.setQueryData<MyMediaListResult>(
        [MY_MEDIA_KEY, demoMode],
        (current) =>
          current
            ? {
                ...current,
                items: current.items.filter((item) => item.key !== key),
              }
            : current,
      );
    },
  });
}

/** Saves a new reframe crop on one of the member's own uploads. The crop is
 *  keyed by the photo itself, so it applies everywhere the photo is used.
 *  Live mode reuses POST /uploads/crop; demo mode updates the demo store. */
export function useSaveMyMediaCrop() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, crop }: { key: string; crop: CropRect }) => {
      if (demoMode) {
        setDemoMediaCrop(key, isIdentityCrop(crop) ? null : crop);
        return;
      }
      await saveCrop(key, crop);
    },
    onSuccess: (_result, { key, crop }) => {
      // The server deletes the row for an identity crop, so mirror it as null.
      const savedCrop = isIdentityCrop(crop) ? null : crop;
      queryClient.setQueryData<MyMediaListResult>(
        [MY_MEDIA_KEY, demoMode],
        (current) =>
          current
            ? {
                ...current,
                items: current.items.map((item) =>
                  item.key === key ? { ...item, crop: savedCrop } : item,
                ),
              }
            : current,
      );
    },
  });
}
