import type { AdminStudioLandingPreviewDTO } from "./api/studioLandingAdmin.api";
import { StudioAdminLandingPreviewRow } from "./StudioAdminLandingPreviewRow";
import { useStudioAdminReorderRow } from "./useStudioAdminReorderRow";

/** The id a dragged preview carries, kept apart from anything else dropped. */
const PREVIEW_DRAG_TYPE = "application/x-studio-admin-landing-preview";

/** An open row wired to the reorder hook, which cannot run inside the
 *  list's loop. */
export function StudioAdminLandingOpenPreviewRow({
  preview,
  index,
  count,
  isBusy,
  onMove,
  onDropAt,
  onRemove,
}: {
  preview: AdminStudioLandingPreviewDTO;
  index: number;
  count: number;
  isBusy: boolean;
  onMove: (targetIndex: number) => void;
  onDropAt: (draggedPreviewId: string) => void;
  onRemove: () => void;
}) {
  const reorder = useStudioAdminReorderRow({
    dragType: PREVIEW_DRAG_TYPE,
    itemId: preview.id,
    index,
    count,
    isBusy,
    onMove,
    onDropAt,
  });
  return (
    <StudioAdminLandingPreviewRow
      preview={preview}
      reorder={reorder}
      isBusy={isBusy}
      onRemove={onRemove}
    />
  );
}
