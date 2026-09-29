import { DeskToneDot } from "./DeskToneDot";
import { CALENDAR_LEGEND_TONES } from "./piecesCalendarLegend.data";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./PiecesCalendar.module.css";

/**
 * What each dot colour on the calendar grid means, in the same tones the
 * table's own "Waiting on" column already uses (the grid had dots
 * and nothing explaining them). Split out of `PiecesCalendar.tsx` to keep
 * that file under the 200-line rule; its rows live
 * in `piecesCalendarLegend.data.ts`.
 */
export function PiecesCalendarLegend() {
  const { t } = useTranslation();
  return (
    <ul
      className={styles.legend}
      aria-label={t("magazine:desk.calendar.legendLabel")}
    >
      {CALENDAR_LEGEND_TONES.map(({ tone, labelKey }) => (
        <li key={tone} className={styles.legendItem}>
          <DeskToneDot tone={tone} />
          <span>{t(labelKey)}</span>
        </li>
      ))}
    </ul>
  );
}
