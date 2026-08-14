import { useEffect, useMemo, useState } from "react";
import { CROP_CONFIG, getMinOutput } from "../../../features/members/api/uploadProcessing";
import type { UploadKind } from "../../../features/members/api/uploads.api";
import { useTranslation } from "../../i18n/useTranslation";
import { Button } from "./Button";
import { type CropRect, IDENTITY_CROP } from "./cropGeometry";
import ImageReframer from "./ImageReframer";
import { Modal } from "./Modal";

export interface PhotoReframeModalProps {
  file: File;
  kind: UploadKind;
  initialCrop?: CropRect;
  onCancel: () => void;
  onConfirm: (crop: CropRect) => void;
}

/**
 * Modal wrapper around `ImageReframer` for one picked `File`: builds an object
 * URL for the file (revoked on unmount/file change to avoid leaking it), reads
 * the per-`UploadKind` crop config (`CROP_CONFIG`/`getMinOutput`), and confirms
 * with the reframed `CropRect` (falling back to `IDENTITY_CROP` in the
 * unreachable case Save fires before the image has produced a first rect).
 */
export default function PhotoReframeModal({
  file,
  kind,
  initialCrop,
  onCancel,
  onConfirm,
}: PhotoReframeModalProps) {
  const { t } = useTranslation();
  const objectUrl = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => {
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  const [rect, setRect] = useState<CropRect | undefined>(initialCrop);

  const { aspect, aspectLabel, allowFreeform } = CROP_CONFIG[kind];
  const minOutput = getMinOutput(kind);

  return (
    <Modal
      wide
      title={t("shared:reframe.title")}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {t("shared:reframe.cancel")}
          </Button>
          <Button onClick={() => onConfirm(rect ?? IDENTITY_CROP)} disabled={!rect}>
            {t("shared:reframe.save")}
          </Button>
        </>
      }
    >
      <ImageReframer
        key={objectUrl}
        src={objectUrl}
        aspect={aspect}
        aspectLabel={aspectLabel}
        allowFreeform={allowFreeform}
        minOutput={minOutput}
        value={initialCrop}
        onChange={setRect}
      />
    </Modal>
  );
}
