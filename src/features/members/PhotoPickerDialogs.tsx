import { ConfirmDialog, PhotoReframeModal } from "../../shared/components/ui";
import type { CropRect } from "../../shared/components/ui/cropGeometry";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { mediaReferenceLabelKey } from "../../shared/media/mediaReferences";
import {
  resolveMyMediaUrl,
  type MyMediaItem,
} from "../settings/api/myMedia.api";
import { CROP_CONFIG } from "./api/uploadProcessing";
import type { UploadKind } from "./api/useUploadImage";

/** Every place an upload is referenced, as one translated, comma-joined list. */
function useUsedAsLabel() {
  const { t } = useTranslation();
  return (item: MyMediaItem) =>
    item.references
      .map((reference) => t(mediaReferenceLabelKey(reference.type)))
      .join(", ");
}

/**
 * The saved crop to open the reframer on, when it was framed at the shape this
 * slot opens with. A crop saved at another shape (a square avatar crop reopened
 * in a 2:1 cover slot) would seed a mismatched zoom, so the editor starts
 * centred instead. A freeform kind with no numeric aspect opens on "Original".
 */
function seedCropFor(
  item: MyMediaItem,
  kind: UploadKind,
): CropRect | undefined {
  if (!item.crop) return undefined;
  const { aspect, aspectLabel, allowFreeform } = CROP_CONFIG[kind];
  const openingLabel =
    allowFreeform && typeof aspect !== "number" ? "original" : aspectLabel;
  return item.crop.aspect === openingLabel ? item.crop : undefined;
}

interface PastUploadReframeModalProps {
  item: MyMediaItem;
  kind: UploadKind;
  onCancel: () => void;
  onConfirm: (crop: CropRect) => void;
}

/**
 * Repositions one of the member's past uploads. Its crop is shared by every
 * place the photo is used, so an in-use photo names where else the new framing
 * will show.
 */
export function PastUploadReframeModal({
  item,
  kind,
  onCancel,
  onConfirm,
}: PastUploadReframeModalProps) {
  const { t } = useTranslation();
  const usedAsLabel = useUsedAsLabel();

  return (
    <PhotoReframeModal
      src={resolveMyMediaUrl(item.fileUrl)}
      kind={kind}
      initialCrop={seedCropFor(item, kind)}
      note={
        item.references.length > 0
          ? t("members:avatar.picker.editInUse", {
              usedAs: usedAsLabel(item),
            })
          : undefined
      }
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

interface PastUploadDeleteDialogProps {
  item: MyMediaItem;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Confirms deleting a past upload, naming every place it is still used. */
export function PastUploadDeleteDialog({
  item,
  isDeleting,
  onClose,
  onConfirm,
}: PastUploadDeleteDialogProps) {
  const { t } = useTranslation();
  const usedAsLabel = useUsedAsLabel();

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={onConfirm}
      title={t("members:avatar.picker.deleteConfirmTitle")}
      description={
        item.references.length > 0
          ? t("members:avatar.picker.deleteConfirmBodyInUse", {
              usedAs: usedAsLabel(item),
            })
          : t("members:avatar.picker.deleteConfirmBody")
      }
      confirmLabel={t("members:avatar.picker.deleteConfirmCta")}
      tone="destructive"
      loading={isDeleting}
    />
  );
}
