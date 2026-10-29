import { useEffect, useRef, type RefObject } from "react";
import { AnimatePresence } from "motion/react";
import { ConfirmDialog } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { mediaMax } from "../../shared/theme/breakpoints";
import type { GalleryShot } from "./directoryGalleryShots";
import { DirectoryPhotoGrid } from "./DirectoryPhotoGrid";
import {
  GalleryRepositionControls,
  type GalleryPreviewViewport,
} from "./GalleryRepositionControls";
import { useGalleryReposition } from "./useGalleryReposition";
import type { ListingPhotoRepositionAccess } from "./useListingPhotoRepositionAccess";

/**
 * The Desktop/Phone toggle hides below the --md breakpoint, so a window that
 * narrows past it while the Phone preview is on would leave the manager stuck
 * there. The preview goes back to Desktop as soon as that query starts to
 * match.
 */
function useDesktopViewportOnNarrowWindow(
  setViewport: (viewport: GalleryPreviewViewport) => void,
) {
  useEffect(() => {
    const narrowWindowQuery = window.matchMedia(mediaMax("md"));
    const handleWindowChange = () => {
      if (narrowWindowQuery.matches) setViewport("desktop");
    };
    narrowWindowQuery.addEventListener("change", handleWindowChange);
    return () =>
      narrowWindowQuery.removeEventListener("change", handleWindowChange);
  }, [setViewport]);
}

/**
 * Escape inside the gallery region (toolbar and frames) asks to leave edit
 * mode, the same as Cancel. The listener sits on the region's own DOM node,
 * so keys pressed elsewhere on the page pass through untouched, and the
 * portalled discard dialog keeps its own Escape. The handled Escape stops
 * here: the dialog it opens mounts its document listener before the same
 * event would reach document, and would close again on that one keypress.
 */
function useEscapeToCancelEditing(
  regionRef: RefObject<HTMLDivElement | null>,
  isActive: boolean,
  onEscape: () => void,
) {
  const onEscapeRef = useRef(onEscape);
  useEffect(() => {
    onEscapeRef.current = onEscape;
  });
  useEffect(() => {
    const region = regionRef.current;
    if (!isActive || !region) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      event.stopPropagation();
      onEscapeRef.current();
    };
    region.addEventListener("keydown", handleKeyDown);
    return () => region.removeEventListener("keydown", handleKeyDown);
  }, [regionRef, isActive]);
}

/**
 * The listing gallery as its manager sees it: the "Reposition photos" control
 * above the photo grid, edit mode with its Desktop/Phone preview, and a
 * confirm step before moved photos are discarded.
 */
export function DirectoryGalleryRepositionable({
  placeName,
  shots,
  access,
  onOpenShot,
}: {
  placeName: string;
  shots: GalleryShot[];
  access: ListingPhotoRepositionAccess;
  onOpenShot: (index: number) => void;
}) {
  const { t } = useTranslation();
  const state = useGalleryReposition({ shots, access });
  useDesktopViewportOnNarrowWindow(state.setViewport);
  const regionRef = useRef<HTMLDivElement>(null);
  useEscapeToCancelEditing(
    regionRef,
    state.isEditing && !state.isSaving && !state.isDiscardConfirmOpen,
    state.requestCancel,
  );

  return (
    <>
      <div ref={regionRef}>
        <GalleryRepositionControls
          isEditing={state.isEditing}
          viewport={state.viewport}
          onViewportChange={state.setViewport}
          isDirty={state.isDirty}
          isSaving={state.isSaving}
          error={state.error}
          onStart={state.startEditing}
          onSave={state.save}
          onCancel={state.requestCancel}
        />
        <DirectoryPhotoGrid
          placeName={placeName}
          shots={shots}
          framingFor={state.framingFor}
          isEditing={state.isEditing}
          isLocked={state.isSaving}
          viewport={state.viewport}
          onOpenShot={onOpenShot}
          onFramingChange={state.setFraming}
        />
      </div>
      <AnimatePresence>
        {state.isDiscardConfirmOpen && (
          <ConfirmDialog
            open
            onClose={state.keepEditing}
            onConfirm={state.confirmDiscard}
            title={t("marketing:directory.detail.reposition.discard.title")}
            description={t(
              "marketing:directory.detail.reposition.discard.body",
            )}
            confirmLabel={t(
              "marketing:directory.detail.reposition.discard.confirm",
            )}
            cancelLabel={t(
              "marketing:directory.detail.reposition.discard.keep",
            )}
            tone="destructive"
            initialFocus="cancel"
          />
        )}
      </AnimatePresence>
    </>
  );
}
