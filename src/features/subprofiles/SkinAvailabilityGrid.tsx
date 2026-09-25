import { DatePicker, FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { deriveCalendar } from "./skins/practiceAvailability";
import { useWeekdayLetters } from "./useWeekdayLetters";
import type { PracticeAvailState } from "./api/subprofiles.api";
import styles from "./SubprofileEditor.module.css";

const AVAIL_CYCLE: PracticeAvailState[] = ["off", "open", "full"];

/** The Practice skin's 4×7 availability calendar: a start date + slot time
 *  plus 28 tap-to-cycle day cells (free → full → no sessions). */
export function SkinAvailabilityGrid({
  control,
  editor,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
}) {
  const { t } = useTranslation();
  const weekdayLetters = useWeekdayLetters();
  const raw = editor.getValue(control.path);
  const availability = (raw && typeof raw === "object" ? raw : {}) as {
    startDate?: string;
    slotTime?: string;
    cells?: PracticeAvailState[];
  };
  const startDate = availability.startDate ?? "";
  const slotTime = availability.slotTime ?? "";
  const cells: PracticeAvailState[] =
    Array.isArray(availability.cells) && availability.cells.length === 28
      ? availability.cells
      : Array.from({ length: 28 }, () => "off");

  const commit = (next: {
    startDate: string;
    slotTime: string;
    cells: PracticeAvailState[];
  }) => editor.setValue(control.path, next);

  const cal = deriveCalendar({ startDate, slotTime, cells }); // null when startDate blank/invalid
  const stateLabel = (state: PracticeAvailState) =>
    t(`subprofiles:skinBlock.practice.availability.state_${state}`);

  return (
    <div className={styles.availEditor}>
      <h3 className={styles.cardTitle}>{t(control.labelKey)}</h3>
      <FormField
        label={t("subprofiles:skinBlock.practice.availability.startDate")}
      >
        <DatePicker
          mode="date"
          label={t("subprofiles:skinBlock.practice.availability.startDate")}
          value={startDate || null}
          onChange={(value) =>
            commit({ startDate: value ?? "", slotTime, cells })
          }
        />
      </FormField>
      <FormField
        label={t("subprofiles:skinBlock.practice.availability.slotTime")}
      >
        <input
          value={slotTime}
          placeholder="18:00"
          onChange={(event) =>
            commit({ startDate, slotTime: event.target.value, cells })
          }
        />
      </FormField>
      <p className={styles.availHelp}>
        {t("subprofiles:skinBlock.practice.availability.help")}
      </p>
      <div className={styles.availHead} aria-hidden="true">
        {weekdayLetters.map((letter, index) => (
          <span key={index}>{letter}</span>
        ))}
      </div>
      <div className={styles.availGrid}>
        {cells.map((state, index) => {
          const dayNumber = cal?.weeks[Math.floor(index / 7)]?.[index % 7]?.day;
          const next =
            AVAIL_CYCLE[(AVAIL_CYCLE.indexOf(state) + 1) % AVAIL_CYCLE.length]!;
          return (
            <button
              type="button"
              key={index}
              className={`${styles.availCell} ${styles[`avail_${state}`] ?? ""}`}
              aria-label={t(
                "subprofiles:skinBlock.practice.availability.cellLabel",
                {
                  slot: index + 1,
                  state: stateLabel(state),
                },
              )}
              onClick={() =>
                commit({
                  startDate,
                  slotTime,
                  cells: cells.map((cellState, cellIndex) =>
                    cellIndex === index ? next : cellState,
                  ),
                })
              }
            >
              {dayNumber ?? ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
