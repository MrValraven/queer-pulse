import { useTranslation } from "../../shared/i18n/useTranslation";
import { PRESS_CHIPS } from "./pressArchive.data";
import styles from "./PressArchivePage.module.css";

export interface PressArchiveFiltersProps {
  /** Free-text query, matched against outlet / kind / source. */
  query: string;
  onQueryChange: (query: string) => void;
  /** Index into `PRESS_CHIPS` of the active category chip. */
  chipIndex: number;
  onChipIndexChange: (chipIndex: number) => void;
}

/** Search box + category chips sitting above the coverage archive. */
export function PressArchiveFilters({
  query,
  onQueryChange,
  chipIndex,
  onChipIndexChange,
}: PressArchiveFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.controls}>
      <div className={styles.search}>
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t("marketing:pressArchive.search.placeholder")}
          aria-label={t("marketing:pressArchive.search.placeholder")}
        />
      </div>
      {PRESS_CHIPS.map((chip, index) => (
        <button
          key={chip.labelKey}
          type="button"
          className={[styles.chip, chipIndex === index && styles.chipActive]
            .filter(Boolean)
            .join(" ")}
          aria-pressed={chipIndex === index}
          onClick={() => onChipIndexChange(index)}
        >
          {t(chip.labelKey, { count: chip.count })}
        </button>
      ))}
    </div>
  );
}
