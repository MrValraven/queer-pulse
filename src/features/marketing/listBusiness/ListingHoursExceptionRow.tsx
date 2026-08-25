import { FiTrash2 } from "react-icons/fi";
import { DatePicker } from "../../../shared/components/ui";
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
 * The opening windows are the very same `ListingHoursIntervalRows` the weekly
 * grid uses, so an owner meets one time control on this panel rather than two.
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
  /** The date has already passed. Rendered quieter, never removed for them. */
  isPast: boolean;
  handlers: HoursExceptionRowHandlers;
}) {
  const { t } = useTranslation();
  const rowLabel =
    entry.date || t("marketing:listBusiness.hoursExceptions.untitledDate");

  return (
    <li
      className={[styles.row, isPast && styles.rowPast]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.rowHead}>
        <DatePicker
          mode="date"
          size="sm"
          label={t("marketing:listBusiness.hoursExceptions.dateLabel")}
          value={entry.date || null}
          onChange={(value) => handlers.onChangeDate(value ?? "")}
        />
        <button
          type="button"
          aria-pressed={entry.open}
          className={[styles.toggle, entry.open && styles.toggleOpen]
            .filter(Boolean)
            .join(" ")}
          onClick={() => handlers.onChangeOpen(!entry.open)}
        >
          {entry.open
            ? t("marketing:listBusiness.step3.open")
            : t("marketing:listBusiness.step3.closed")}
        </button>
        {isPast && (
          <span className={styles.pastTag}>
            {t("marketing:listBusiness.hoursExceptions.pastTag")}
          </span>
        )}
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

      {entry.open && (
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
