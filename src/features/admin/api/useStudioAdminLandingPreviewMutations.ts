import { isSameIdSet, orderedByIds, renumbered } from "../studioAdmin.model";
import {
  removeAdminStudioLandingPreview,
  reorderAdminStudioLandingPreviews,
  requestAdminStudioLandingPreview,
  type AdminStudioLandingDTO,
  type AdminStudioLandingPreviewDTO,
} from "./studioLandingAdmin.api";
import { useLandingMutation } from "./useStudioAdminLandingWrite";

// Preview writes of the Studio page console.

const isOpenPreview = (preview: AdminStudioLandingPreviewDTO) =>
  preview.status === "pending" || preview.status === "approved";
const openPreviewsOf = (landing: AdminStudioLandingDTO) =>
  landing.previews.filter(isOpenPreview);

/** The open rows replaced (renumbered 1..n), decided history kept. */
function withOpenPreviews(
  landing: AdminStudioLandingDTO,
  open: AdminStudioLandingPreviewDTO[],
): AdminStudioLandingDTO {
  return {
    ...landing,
    previews: [
      ...renumbered(open),
      ...landing.previews.filter((preview) => !isOpenPreview(preview)),
    ],
  };
}

// Previews.

/** POST /admin/studio/landing/previews. The artist is asked to approve. */
export function useRequestLandingPreview() {
  return useLandingMutation<AdminStudioLandingPreviewDTO, { trackId: string }>({
    live: ({ trackId }) => requestAdminStudioLandingPreview({ trackId }),
    demo: (data, { trackId }) => data.demoRequestPreview(trackId),
    patch: (landing, row) =>
      withOpenPreviews(landing, [...openPreviewsOf(landing), row]),
    shouldRefreshStaffRead: true,
  });
}

/** DELETE .../previews/:previewId, whatever the status. */
export function useRemoveLandingPreview() {
  return useLandingMutation<void, { previewId: string }>({
    live: ({ previewId }) => removeAdminStudioLandingPreview(previewId),
    demo: (data, { previewId }) => data.demoRemovePreview(previewId),
    patch: (landing, _result, { previewId }) => {
      const kept = {
        ...landing,
        previews: landing.previews.filter((row) => row.id !== previewId),
      };
      return withOpenPreviews(kept, openPreviewsOf(kept));
    },
    shouldRefreshStaffRead: true,
  });
}

/** The open rows move at once and roll back on
 *  `studio_landing_order_mismatch`. */
export function useReorderLandingPreviews() {
  return useLandingMutation<
    AdminStudioLandingPreviewDTO[],
    { previewIds: string[] }
  >({
    live: ({ previewIds }) => reorderAdminStudioLandingPreviews({ previewIds }),
    demo: (data, { previewIds }) => data.demoReorderPreviews(previewIds),
    patch: (landing, open) => withOpenPreviews(landing, open),
    optimistic: (landing, { previewIds }) =>
      withOpenPreviews(
        landing,
        orderedByIds(openPreviewsOf(landing), previewIds),
      ),
    isOrderValid: (landing, { previewIds }) =>
      isSameIdSet(previewIds, openPreviewsOf(landing)),
  });
}
