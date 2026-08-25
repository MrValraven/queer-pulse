import {
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
  type RefObject,
} from "react";
import { FiSearch } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { DirectoryPlace } from "../marketing/directoryPlaces";
import styles from "./VenuePicker.module.css";

/**
 * The directory-search half of `VenuePicker`: the combobox input, its
 * results listbox, and the "enter manually" escape hatch. Split out purely
 * to keep `VenuePicker` under the line limit — all the search state
 * (`query`/`open`/`activeIndex`) still lives in the parent, which owns
 * `useOutsideDismiss` against `containerRef`.
 */
export function VenuePickerSearch({
  id,
  labelledBy,
  baseId,
  containerRef,
  query,
  setQuery,
  open,
  setOpen,
  activeIndex,
  setActiveIndex,
  results,
  onKeyDown,
  onSelectPlace,
  onSwitchToFreeText,
}: {
  id?: string;
  labelledBy?: string;
  baseId: string;
  containerRef: RefObject<HTMLDivElement | null>;
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  activeIndex: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  results: DirectoryPlace[];
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSelectPlace: (place: DirectoryPlace) => void;
  onSwitchToFreeText: () => void;
}) {
  const { t } = useTranslation();
  const listboxId = `${baseId}-listbox`;
  const optionId = (index: number) => `${baseId}-opt-${index}`;

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.searchRow}>
        <FiSearch aria-hidden className={styles.searchIcon} />
        <input
          id={id}
          aria-labelledby={labelledBy}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && results[activeIndex] ? optionId(activeIndex) : undefined
          }
          type="text"
          className={styles.searchInput}
          placeholder={t("gatherings:venuePicker.searchPlaceholder")}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </div>
      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={t("gatherings:venuePicker.searchPlaceholder")}
          className={styles.panel}
        >
          {results.length === 0 ? (
            <div className={styles.empty}>
              {t("gatherings:venuePicker.noResults")}
            </div>
          ) : (
            results.map((place, index) => (
              <button
                key={place.slug}
                type="button"
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                data-active={index === activeIndex}
                className={styles.option}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => onSelectPlace(place)}
              >
                <span className={styles.optionName}>{place.name}</span>
                <span className={styles.optionMeta}>{place.hood}</span>
              </button>
            ))
          )}
        </div>
      )}
      <button
        type="button"
        className={styles.toggleLink}
        onClick={onSwitchToFreeText}
      >
        {t("gatherings:venuePicker.enterManually")}
      </button>
    </div>
  );
}
