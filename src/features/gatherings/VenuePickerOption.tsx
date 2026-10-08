import type { ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./VenuePickerInline.module.css";

/**
 * One row of the inline venue list: a directory place, or the closing
 * "Use what I typed" row. Focus stays in the search field the whole time
 * (the field owns `aria-activedescendant`), so the row is out of the tab
 * order and a press on it keeps focus where it was. `aria-selected` follows
 * the active row, as the combobox pattern expects; the venue already chosen
 * is marked with a check and a "Selected" that only screen readers hear.
 */
export function VenuePickerOption({
  id,
  tile,
  name,
  meta,
  isActive,
  isSelected,
  onActivate,
  onSelect,
}: {
  id: string;
  tile: ReactNode;
  name: ReactNode;
  meta?: ReactNode;
  isActive: boolean;
  isSelected: boolean;
  onActivate: () => void;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      id={id}
      role="option"
      tabIndex={-1}
      aria-selected={isActive}
      data-active={isActive}
      data-selected={isSelected}
      className={styles.option}
      onMouseDown={(event) => event.preventDefault()}
      onMouseMove={() => {
        if (!isActive) onActivate();
      }}
      onClick={onSelect}
    >
      {tile}
      <span className={styles.optionText}>
        <span className={styles.optionName}>{name}</span>
        {meta && <span className={styles.optionMeta}>{meta}</span>}
      </span>
      {isSelected && (
        <>
          <FiCheck aria-hidden className={styles.optionCheck} />
          <span className="visuallyHidden">
            {t("gatherings:venuePicker.selectedOption")}
          </span>
        </>
      )}
    </button>
  );
}
