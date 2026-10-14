import { Link } from "react-router-dom";
import { Collapse } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_FORMAT_LABEL_KEY } from "./api/studio.adapters";
import { STUDIO_FORMATS, type StudioFormat } from "./api/studio.types";
import { useStudioFormats } from "./api/useStudioFormats";
import css from "./StudioBrowse.module.css";
import styles from "./StudioFormats.module.css";

/** At least two formats with content before the row means anything. */
const MIN_FORMATS_SHOWN = 2;

/** All, then each format with published content (spec 5.1), as links into
 *  `?format=`. It grows in once two formats have content. A chosen format
 *  keeps the row open with its own chip, so All stays in reach while the
 *  list loads, after a failure, or with a single format. */
export function StudioFormatChips({
  activeFormat,
  hrefOf,
}: {
  activeFormat: StudioFormat | null;
  hrefOf: (format: StudioFormat | null) => string;
}) {
  const { t } = useTranslation();
  const { formats } = useStudioFormats();
  const shownFormats = STUDIO_FORMATS.filter(
    (format) => format === activeFormat || formats.includes(format),
  );
  const chips: (StudioFormat | null)[] = [null, ...shownFormats];
  const isOpen = formats.length >= MIN_FORMATS_SHOWN || activeFormat !== null;
  return (
    <Collapse isOpen={isOpen}>
      <nav aria-label={t("studio:format.listLabel")} className={styles.formats}>
        <ul className={css.chips}>
          {chips.map((format) => (
            <li key={format ?? "all"}>
              <Link
                to={hrefOf(format)}
                className={css.chip}
                aria-current={format === activeFormat ? "page" : undefined}
              >
                {t(
                  format
                    ? STUDIO_FORMAT_LABEL_KEY[format]
                    : "studio:format.all",
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Collapse>
  );
}
