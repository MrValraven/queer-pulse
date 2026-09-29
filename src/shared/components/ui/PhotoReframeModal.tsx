import { useEffect, useState } from "react";
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
 * `src`: creates an object URL for a file inside an effect and revokes it in
 * that effect's cleanup (on unmount or file change, so it never leaks). The
 * create and revoke pair lives in one effect so StrictMode's dev-only
 * unmount and remount revokes the first URL and then makes a fresh one. The
 * reframer mounts once that URL exists, so a picked file never renders a
 * broken image first. It also reads the per-`UploadKind` crop config
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
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  // With no file the modal shows `src` and ignores `objectUrl`, so a stale
  // value left from an earlier file is never rendered.
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    // The URL is an external resource created and revoked here; state only
    // hands it to render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const imageSrc = (file ? objectUrl : src) ?? "";

  const [rect, setRect] = useState<CropRect | undefined>(initialCrop);

  const { aspect, aspectLabel, allowFreeform } = CROP_CONFIG[kind];
  const minOutput = getMinOutput(kind);
  // Locked 1:1 kinds (member, group and community avatars) paint as a circle
  // or a rounded square, so the reframer previews both shapes for them.
  const shouldShowShapePreview = aspect === 1 && !allowFreeform;

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
      {imageSrc !== "" && (
        <ImageReframer
          key={imageSrc}
          src={imageSrc}
          aspect={aspect}
          aspectLabel={aspectLabel}
          allowFreeform={allowFreeform}
          minOutput={minOutput}
          value={initialCrop}
          onChange={setRect}
          shouldShowShapePreview={shouldShowShapePreview}
        />
      )}
    </Modal>
  );
}
