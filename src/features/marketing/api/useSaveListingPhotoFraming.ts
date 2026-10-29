import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { DirectoryGalleryPhoto, DirectoryPlace } from "../directoryPlaces";
import { placeWithPhotoFraming } from "../listingPhotoFramingCache";
import { recordDemoPhotoFraming } from "../listingPhotoFramingDemoOverlay";
import { galleryPhotosFromView } from "./directory.adapters";
import type { UpdateListingPhotoFramingDto } from "./directory.api";
import { DIRECTORY_KEY } from "./directoryQueryKey";
import {
  updateAdminListingPhotoFraming,
  updateListingPhotoFraming,
} from "./listingPhotoFraming.api";

export interface SaveListingPhotoFramingOptions {
  /** The listing ref the routes address; null only for fixture places in demo. */
  ref: string | null;
  slug: string;
  asAdmin: boolean;
}

export interface SaveFramingContext {
  snapshot: Array<[QueryKey, DirectoryPlace | null | undefined]>;
}

/**
 * Saves the repositioned photos of one listing. The detail cache takes the new
 * framing before the request resolves and is restored when the save fails. In
 * demo mode the save lands in the session overlay and no request goes out.
 */
export function useSaveListingPhotoFraming(
  options: SaveListingPhotoFramingOptions,
): UseMutationResult<
  DirectoryGalleryPhoto[] | null,
  Error,
  UpdateListingPhotoFramingDto,
  SaveFramingContext
> {
  const { ref, slug, asAdmin } = options;
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();
  const detailKey = [DIRECTORY_KEY, "detail", slug];

  return useMutation<
    DirectoryGalleryPhoto[] | null,
    Error,
    UpdateListingPhotoFramingDto,
    SaveFramingContext
  >({
    // The edit toolbar names the failure reason itself.
    meta: { silentError: true },
    mutationFn: async (body) => {
      if (demoMode) {
        recordDemoPhotoFraming(slug, body.photos);
        return null;
      }
      if (ref === null) {
        throw new Error(
          `Cannot save photo framing for "${slug}": the listing has no ref outside demo mode.`,
        );
      }
      const save = asAdmin
        ? updateAdminListingPhotoFraming
        : updateListingPhotoFraming;
      const response = await save(ref, body);
      return galleryPhotosFromView(response.photoGallery);
    },
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const snapshot = queryClient.getQueriesData<DirectoryPlace | null>({
        queryKey: detailKey,
      });
      queryClient.setQueriesData<DirectoryPlace | null>(
        { queryKey: detailKey },
        (place) => (place ? placeWithPhotoFraming(place, body.photos) : place),
      );
      return { snapshot };
    },
    // A 200 for an unchanged save carries the current gallery, so no special case.
    onSuccess: (gallery) => {
      if (!gallery) return;
      queryClient.setQueriesData<DirectoryPlace | null>(
        { queryKey: detailKey },
        (place) => (place ? { ...place, galleryPhotos: gallery } : place),
      );
    },
    onError: (_error, _body, context) => {
      context?.snapshot.forEach(([key, place]) =>
        queryClient.setQueryData(key, place),
      );
    },
    // No invalidateQueries: the cache already holds the server gallery, and a
    // refetch would re-run the detail read for data the response just supplied.
  });
}
