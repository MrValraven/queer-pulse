import { SegmentedControl } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { FilmFormatId } from "./marketingVideos.data";
import styles from "./MarketingVideos.module.css";

/** Picks the shape a film plays in: 16:9 or the 4:5 Instagram post. */
export function FilmFormatSwitch({
  formats,
  value,
  onChange,
}: {
  formats: readonly FilmFormatId[];
  value: FilmFormatId;
  onChange: (format: FilmFormatId) => void;
}) {
  const { t } = useTranslation();
  return (
    <SegmentedControl
      className={styles.previewFormats}
      label={t("admin:marketingVideos.preview.format")}
      options={formats.map((format) => ({
        value: format,
        label: t(`admin:marketingVideos.format.${format}.ratio`),
      }))}
      value={value}
      onChange={(picked) => {
        const format = formats.find((option) => option === picked);
        if (format) onChange(format);
      }}
    />
  );
}
