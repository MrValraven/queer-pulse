import { useEffect, useState } from "react";
import type { CropRect } from "../../shared/components/ui/cropGeometry";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { ImageUploadField } from "../subprofiles/ImageUploadField";
import { RELEASE_FIELD_IDS } from "./studioUpload.data";
import s from "./creator.module.css";
import fieldStyles from "./StudioTrackFields.module.css";

/** Streaming services ask for a 1400 px square at least; smaller covers
 *  turn soft on the Now playing screen. */
const COVER_MIN_PIXELS = 1400;

interface MeasuredCover {
  src: string;
  width: number;
  height: number;
}

/** A value the browser can load (the saved cover's address or a picked
 *  file's preview); an upload key alone is not one. */
const isLoadableSource = (value: string) =>
  /^(https?:|blob:|data:|\/)/.test(value);

/** The natural size of the cover on show, measured once per source. */
function useCoverSize(source: string | null): MeasuredCover | null {
  const [measured, setMeasured] = useState<MeasuredCover | null>(null);
  useEffect(() => {
    if (!source || !isLoadableSource(source)) return;
    let isCurrent = true;
    const image = new Image();
    image.onload = () => {
      if (isCurrent)
        setMeasured({
          src: source,
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
    };
    image.src = source;
    return () => {
      isCurrent = false;
    };
  }, [source]);
  return measured && measured.src === source ? measured : null;
}

/**
 * Cover art through the existing image upload and crop flow (`work-image`,
 * the persona section image kind). The key goes to PATCH as `coverKey`; the
 * server re-homes it under the persona, so no key carries the uploader's id.
 * v1 has no "remove the cover" on the wire, so the field offers Change alone.
 * A cover under 1400 px on either side keeps a warning beside it.
 */
export function CoverArt({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState<{
    url: string;
    crop: CropRect | undefined;
  } | null>(null);
  const source = useCoverSize(preview?.url ?? (value || null));
  // The cover that ships is the cropped area, so that is what is measured.
  const crop =
    preview && source?.src === preview.url ? preview.crop : undefined;
  const measured = source && {
    width: Math.round(source.width * (crop?.width ?? 1)),
    height: Math.round(source.height * (crop?.height ?? 1)),
  };
  const isTooSmall =
    measured !== null &&
    (measured.width < COVER_MIN_PIXELS || measured.height < COVER_MIN_PIXELS);
  return (
    <div className={s.uploaded}>
      <h4 id={RELEASE_FIELD_IDS.cover} className={s.coverLabel} tabIndex={-1}>
        <Translation
          i18nKey="studio:uploadFlow.cover.heading"
          components={{ em: <em /> }}
        />
      </h4>
      <ImageUploadField
        value={value}
        onChange={(key) => {
          if (key) onChange(key);
        }}
        onPreviewChange={(url, pickedCrop) =>
          setPreview(url ? { url, crop: pickedCrop } : null)
        }
        addLabel={t("studio:uploadFlow.cover.addCta")}
        changeLabel={t("studio:uploadFlow.cover.changeCta")}
        kind="work-image"
        size={160}
        isSquare
        placeholder={t("studio:uploadFlow.cover.placeholder")}
        isRemovable={false}
      />
      <p className={s.fileMeta}>{t("studio:uploadFlow.cover.hint")}</p>
      <div role="status">
        <Collapse isOpen={isTooSmall}>
          <p className={fieldStyles.error}>
            {measured
              ? t("studio:uploadFlow.cover.tooSmall", {
                  width: measured.width,
                  height: measured.height,
                  min: COVER_MIN_PIXELS,
                })
              : null}
          </p>
        </Collapse>
      </div>
    </div>
  );
}
