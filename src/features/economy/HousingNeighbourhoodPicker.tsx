import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { ChipSelect } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LISBON_HOUSING_NEIGHBOURHOODS } from "./housingNeighbourhoods";
import styles from "./HousingNeighbourhoodPicker.module.css";

const OPTIONS = LISBON_HOUSING_NEIGHBOURHOODS.map((entry) => entry.name);

/** Filter-bar dropdown that multi-selects Lisbon housing neighbourhoods. The
 * trigger shows the count; the panel is a tick-able ChipSelect. Selection is a
 * plain string[] of names, matched against a listing's `hood`. */
export function HousingNeighbourhoodPicker({
  id,
  labelledBy,
  selected,
  onChange,
}: {
  id: string;
  /** Id of the heading naming this control, when it sits under one (a
   *  `RefineGroup` label rather than a `<label htmlFor>`). The trigger names
   *  itself alongside it, so the accessible name stays "Neighbourhood" plus
   *  whatever is currently chosen. */
  labelledBy?: string;
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedSet = new Set(selected);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (name: string) => {
    const next = new Set(selectedSet);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    onChange([...next]);
  };

  const selectedCount = selected.length;
  // Two or more areas read as a count, which rolls as areas are ticked.
  const rollingCount = (
    <RollingNumber
      value={fmt.number(selectedCount)}
      numericValue={selectedCount}
    />
  );
  const triggerLabel =
    selectedCount === 0 ? (
      t("economy:housing.filterBar.areaAny")
    ) : selectedCount === 1 ? (
      selected[0]
    ) : (
      <Translation
        i18nKey="economy:housing.filterBar.areaSelected"
        values={{ count: selectedCount }}
        slots={{ count: rollingCount }}
      />
    );

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-labelledby={labelledBy ? `${labelledBy} ${id}` : undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span
          className={[styles.label, selected.length === 0 && styles.placeholder]
            .filter(Boolean)
            .join(" ")}
        >
          {triggerLabel}
        </span>
        {selected.length > 1 && (
          <span className={styles.count}>{rollingCount}</span>
        )}
        <FiChevronDown
          className={[styles.chev, open && styles.chevOpen]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        />
      </button>

      {open && (
        <div
          className={styles.panel}
          role="dialog"
          aria-label={t("economy:housing.filterBar.area")}
        >
          <ChipSelect
            options={OPTIONS}
            selected={selectedSet}
            onToggle={toggle}
            label={t("economy:housing.filterBar.area")}
          />
          <div className={styles.panelFoot}>
            <button
              type="button"
              className={styles.clear}
              disabled={selected.length === 0}
              onClick={() => onChange([])}
            >
              {t("economy:housing.filterBar.areaClear")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
