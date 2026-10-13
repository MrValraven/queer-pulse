import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { ImageUploadField } from "../subprofiles/ImageUploadField";
import s from "./creator.module.css";

/**
 * Cover art through the existing image upload and crop flow (`work-image`,
 * the persona section image kind). The key goes to PATCH as `coverKey`; the
 * server re-homes it under the persona, so no key carries the uploader's id.
 * v1 has no "remove the cover" on the wire, so the field offers Change alone.
 */
export function CoverArt({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={s.uploaded}>
      <h4>
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
        kind="work-image"
        size={160}
        isSquare
        placeholder={t("studio:uploadFlow.cover.placeholder")}
        isRemovable={false}
      />
      <p className={s.fileMeta}>{t("studio:uploadFlow.cover.hint")}</p>
    </div>
  );
}
