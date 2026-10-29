import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useUnsavedChangesGuard } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ListingPhotoFraming } from "./api/directory.api";
import {
  listingPhotoFramingErrorOf,
  type ListingPhotoFramingError,
} from "./api/listingPhotoFraming.api";
import { useSaveListingPhotoFraming } from "./api/useSaveListingPhotoFraming";
import type { GalleryShot } from "./directoryGalleryShots";
import type { GalleryPreviewViewport } from "./GalleryRepositionControls";
import {
  clampPhotoFraming,
  framingForSave,
  isSamePhotoFraming,
  resolveShotFraming,
} from "./photoFramingGeometry";
import type { ListingPhotoRepositionAccess } from "./useListingPhotoRepositionAccess";

export interface GalleryRepositionState {
  isEditing: boolean;
  isSaving: boolean;
  isDirty: boolean;
  viewport: GalleryPreviewViewport;
  setViewport: (viewport: GalleryPreviewViewport) => void;
  error: ListingPhotoFramingError | null;
  isDiscardConfirmOpen: boolean;
  framingFor: (shot: GalleryShot) => ListingPhotoFraming;
  setFraming: (url: string, framing: ListingPhotoFraming) => void;
  startEditing: () => void;
  requestCancel: () => void;
  confirmDiscard: () => void;
  keepEditing: () => void;
  save: () => void;
}

type FramingDraft = Record<string, ListingPhotoFraming>;

/**
 * Edit-mode state for repositioning a listing's photos. The draft is captured
 * once when editing starts; the baseline is always read live from `shots`, so
 * the optimistic cache patch clears `isDirty` during a save and a rollback
 * sets it again.
 */
export function useGalleryReposition(options: {
  shots: GalleryShot[];
  access: ListingPhotoRepositionAccess;
}): GalleryRepositionState {
  const { shots, access } = options;
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { mutate, isPending } = useSaveListingPhotoFraming({
    ref: access.ref,
    slug: access.slug,
    asAdmin: access.asAdmin,
  });
  const [draft, setDraft] = useState<FramingDraft | null>(null);
  const [viewport, setViewport] = useState<GalleryPreviewViewport>("desktop");
  const [error, setError] = useState<ListingPhotoFramingError | null>(null);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);

  const isEditing = draft !== null;

  const draftFramingFor = (shot: GalleryShot): ListingPhotoFraming =>
    draft?.[shot.url] ?? resolveShotFraming(shot);

  const changedShots = isEditing
    ? shots.filter(
        (shot) =>
          !isSamePhotoFraming(draftFramingFor(shot), resolveShotFraming(shot)),
      )
    : [];
  const isDirty = changedShots.length > 0;

  const leaveEditing = () => {
    setDraft(null);
    setViewport("desktop");
    setIsDiscardConfirmOpen(false);
  };

  const discard = () => {
    setError(null);
    leaveEditing();
  };

  useUnsavedChangesGuard({
    active: isEditing && isDirty,
    confirmMessage: t("marketing:directory.detail.reposition.leaveConfirm"),
    onConfirmLeave: discard,
    guardBackButton: true,
  });

  const startEditing = () => {
    setError(null);
    setDraft(
      Object.fromEntries(
        shots.map((shot) => [shot.url, resolveShotFraming(shot)]),
      ),
    );
  };

  const setFraming = (url: string, framing: ListingPhotoFraming) => {
    setDraft((current) =>
      current ? { ...current, [url]: clampPhotoFraming(framing) } : current,
    );
  };

  const requestCancel = () => {
    if (isDirty) setIsDiscardConfirmOpen(true);
    else leaveEditing();
  };

  const save = () => {
    setError(null);
    if (changedShots.length === 0) {
      leaveEditing();
      return;
    }
    const photos = changedShots.map((shot) => ({
      image: shot.url,
      framing: framingForSave(draftFramingFor(shot), shot.crop !== undefined),
    }));
    mutate(
      { photos },
      {
        onSuccess: () => {
          leaveEditing();
          showToast(
            t("marketing:directory.detail.reposition.saved"),
            "success",
          );
        },
        onError: (saveError) => {
          setError(
            listingPhotoFramingErrorOf(saveError, { asAdmin: access.asAdmin }),
          );
        },
      },
    );
  };

  return {
    isEditing,
    isSaving: isPending,
    isDirty,
    viewport,
    setViewport,
    error,
    isDiscardConfirmOpen,
    framingFor: (shot) =>
      isEditing
        ? clampPhotoFraming(draftFramingFor(shot))
        : resolveShotFraming(shot),
    setFraming,
    startEditing,
    requestCancel,
    confirmDiscard: discard,
    keepEditing: () => setIsDiscardConfirmOpen(false),
    save,
  };
}
