import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_FORMAT_LABEL_KEY } from "./api/studio.adapters";
import type { StudioFormat } from "./api/studio.types";
import { useStudioShownFormats } from "./StudioFormatShown";
import { StudioChipRow } from "./StudioGenreChips";
import styles from "./StudioFormats.module.css";

/** All, then each format with published content (spec 5.1), as links into
 *  `?format=`, on one line that scrolls sideways. It grows in once two
 *  formats have content. A chosen format keeps the row open with its own
 *  chip, so All stays in reach while the list loads, after a failure, or
 *  with a single format. */
export function StudioFormatChips({
  activeFormat,
  hrefOf,
  caption,
}: {
  activeFormat: StudioFormat | null;
  hrefOf: (format: StudioFormat | null) => string;
  /** The visible row name on Browse ("Format"). */
  caption?: string;
}) {
  const { t } = useTranslation();
  const { shownFormats, isOpen } = useStudioShownFormats(activeFormat);
  const chips = [null, ...shownFormats].map((format) => ({
    key: format ?? "all",
    label: t(format ? STUDIO_FORMAT_LABEL_KEY[format] : "studio:format.all"),
    href: hrefOf(format),
    isCurrent: format === activeFormat,
  }));
  return (
    <Collapse isOpen={isOpen}>
      <StudioChipRow
        label={t("studio:format.listLabel")}
        caption={caption}
        chips={chips}
        className={styles.formats}
      />
    </Collapse>
  );
}
