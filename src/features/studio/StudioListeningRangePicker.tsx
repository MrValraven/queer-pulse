import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  STUDIO_LISTENING_RANGES,
  type StudioListeningRange,
} from "./api/studioListening.types";
import styles from "./StudioListeningSummary.module.css";

/** Three equal segments in one pill track, the pressed one inverted: the
 *  range the lists below cover. */
export function StudioListeningRangePicker({
  range,
  onChange,
}: {
  range: StudioListeningRange;
  onChange: (range: StudioListeningRange) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={styles.rangeGroup}
      role="group"
      aria-label={t("studio:listening.range.label")}
    >
      {STUDIO_LISTENING_RANGES.map((option) => (
        <Button
          key={option}
          type="button"
          variant="quiet"
          size="sm"
          className={styles.rangeButton}
          aria-pressed={option === range}
          onClick={() => onChange(option)}
        >
          {t(`studio:listening.range.${option}`)}
        </Button>
      ))}
    </div>
  );
}
