import { useEffect, useMemo, useState } from "react";
import {
  CROP_CONFIG,
  getMinOutput,
} from "../../../features/members/api/uploadProcessing";
import type { UploadKind } from "../../../features/members/api/uploads.api";
import { useTranslation } from "../../i18n/useTranslation";
import { Button } from "./Button";
import { type CropRect, IDENTITY_CROP } from "./cropGeometry";
import ImageReframer from "./ImageReframer";
import { Modal } from "./Modal";

/** The photo to reframe: a freshly picked `File`, or the URL of an upload
 *  that is already stored (repositioning a past upload). */
type ReframeSource =
  { file: File; src?: never } | { src: string; file?: never };

export type PhotoReframeModalProps = ReframeSource & {
  kind: UploadKind;
  initialCrop?: CropRect;
  /** One line under the title, e.g. where else an in-use photo appears. */
  note?: string;
  onCancel: () => void;
  onConfirm: (crop: CropRect) => void;
};

/**
 * Modal wrapper around `ImageReframer` for one picked `File` or stored image
 * `src`: builds an object URL for a file (revoked on unmount/file change to
 * avoid leaking it), reads the per-`UploadKind` crop config
 * (`CROP_CONFIG`/`getMinOutput`), and confirms with the reframed `CropRect`
 * (falling back to `IDENTITY_CROP` in the unreachable case Save fires before
 * the image has produced a first rect).
 */
export default function PhotoReframeModal({
  file,
  src,
  kind,
  initialCrop,
  note,
  onCancel,
  onConfirm,
}: PhotoReframeModalProps) {
  const { t } = useTranslation();
  const objectUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => {
    if (!objectUrl) return;
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);
  const imageSrc = objectUrl ?? src ?? "";

  const [rect, setRect] = useState<CropRect | undefined>(initialCrop);

  const { aspect, aspectLabel, allowFreeform } = CROP_CONFIG[kind];
  const minOutput = getMinOutput(kind);

  return (
    <Modal
      wide
      title={t("shared:reframe.title")}
      sub={note}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {t("shared:reframe.cancel")}
          </Button>
          <Button
            onClick={() => onConfirm(rect ?? IDENTITY_CROP)}
            disabled={!rect}
          >
            {t("shared:reframe.save")}
          </Button>
        </>
      }
    >
      <ImageReframer
        key={imageSrc}
        src={imageSrc}
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
