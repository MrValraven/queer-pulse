import { FiTrash2 } from "react-icons/fi";
import { DatePicker, Toggle } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  HOURS_EXCEPTION_NOTE_MAX,
  type HoursException,
  type HoursExceptionProblem,
  type HoursInterval,
} from "./listBusiness.data";
import { ListingHoursIntervalRows } from "./ListingHoursIntervalRows";
import styles from "./ListingHoursExceptions.module.css";

/** Every callback one dated override needs, so the row itself stays presentational. */
export interface HoursExceptionRowHandlers {
  onChangeDate: (date: string) => void;
  onChangeOpen: (open: boolean) => void;
  onChangeNote: (note: string) => void;
  onChangeInterval: (index: number, patch: Partial<HoursInterval>) => void;
  onAddInterval: () => void;
  onRemoveInterval: (index: number) => void;
  onRemove: () => void;
}

/**
 * One dated override of the weekly grid: which date, whether the place opens
 * at all that day, the windows if it does, and a short label.
 *
 * The header line holds the date, the same open switch the weekly card uses
 * (a `role="switch"` named "Open on <date>", with a static "Open" beside it
 * that dims when the date is closed), a "Past" tag once the date has gone by,
 * and the remove button pinned to its end. On a narrow card the first three
 * wrap among themselves while the remove button keeps its corner.
 *
 * The opening windows are the very same `ListingHoursIntervalRows` the weekly
 * grid uses, so an owner meets one time control across the whole hours section.
 * `problem` is the client-side mirror of the server's rules, resolved by the
 * parent and rendered here beside the field it belongs to.
 */
export function ListingHoursExceptionRow({
  entry,
  problem,
  isPast,
  handlers,
}: {
  entry: HoursException;
  problem: HoursExceptionProblem | null;
  /** The date has already passed. Rendered quieter and kept until the owner clears it. */
  isPast: boolean;
  handlers: HoursExceptionRowHandlers;
}) {
  const { t } = useTranslation();
  const rowLabel =
    entry.date || t("marketing:listBusiness.hoursExceptions.untitledDate");
  const isOpen = entry.open;

  return (
    <li
      className={[styles.row, isPast && styles.rowPast]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.rowHead}>
        <div className={styles.rowHeadMain}>
          <DatePicker
            mode="date"
            size="sm"
            label={t("marketing:listBusiness.hoursExceptions.dateLabel")}
            value={entry.date || null}
            onChange={(value) => handlers.onChangeDate(value ?? "")}
          />
          <span className={styles.openControl}>
            <Toggle
              checked={isOpen}
              onChange={handlers.onChangeOpen}
              label={t("marketing:listBusiness.step3.dayOpenAria", {
                day: rowLabel,
              })}
            />
            <span
              className={[styles.openText, !isOpen && styles.openTextOff]
                .filter(Boolean)
                .join(" ")}
              aria-hidden
            >
              {t("marketing:listBusiness.step3.open")}
            </span>
          </span>
          {isPast && (
            <span className={styles.pastTag}>
              {t("marketing:listBusiness.hoursExceptions.pastTag")}
            </span>
          )}
        </div>
        <button
          type="button"
          className={styles.remove}
          aria-label={t("marketing:listBusiness.hoursExceptions.removeAria", {
            date: rowLabel,
          })}
          onClick={handlers.onRemove}
        >
          <FiTrash2 aria-hidden />
        </button>
      </div>

      {isOpen && (
        <ListingHoursIntervalRows
          intervals={entry.intervals}
          rowLabel={rowLabel}
          isInvalid={problem === "intervals"}
          onChangeInterval={handlers.onChangeInterval}
          onAddInterval={handlers.onAddInterval}
          onRemoveInterval={handlers.onRemoveInterval}
        />
      )}

      <input
        type="text"
        className={styles.note}
        maxLength={HOURS_EXCEPTION_NOTE_MAX}
        aria-label={t("marketing:listBusiness.hoursExceptions.noteAria", {
          date: rowLabel,
        })}
        placeholder={t(
          "marketing:listBusiness.hoursExceptions.notePlaceholder",
        )}
        value={entry.note}
        onChange={(event) => handlers.onChangeNote(event.target.value)}
      />

      {problem && problem !== "intervals" && (
        <p role="status" className={styles.problem}>
          {t(`marketing:listBusiness.hoursExceptions.problem.${problem}`)}
        </p>
      )}
    </li>
  );
}
