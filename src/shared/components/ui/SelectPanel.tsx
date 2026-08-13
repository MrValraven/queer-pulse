import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { FiCheck } from "react-icons/fi";
import { Spinner } from "./Spinner";
import type { SelectOption, SelectOptionState } from "./Select";
import styles from "./Select.module.css";

interface SelectPanelProps {
  baseId: string;
  listboxId: string;
  options: readonly SelectOption[];
  selected: ReadonlySet<string>;
  multiple: boolean;
  searchable: boolean;
  loading: boolean;
  emptyText: ReactNode;
  searchPlaceholder: string;
  loadingText: string;
  listboxLabel: string;
  renderOption?: (option: SelectOption, state: SelectOptionState) => ReactNode;
  /** Toggle (multi) or pick (single) an option value. */
  onSelect: (value: string) => void;
  /** Escape / dismiss — closes the panel and returns focus to the trigger. */
  onClose: () => void;
}

/** Text the typeahead filter matches against, per option. */
function optionText(option: SelectOption): string {
  if (option.keywords) return option.keywords;
  return typeof option.label === "string" ? option.label : "";
}

function filterOptions(
  options: readonly SelectOption[],
  query: string,
): readonly SelectOption[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return options;
  return options.filter((option) =>
    optionText(option).toLowerCase().includes(normalized),
  );
}

/**
 * The floating panel: an optional typeahead field plus a `role="listbox"` of
 * options, following the APG combobox pattern — focus stays on the search input
 * (or the listbox when not searchable) and the active option is tracked with
 * `aria-activedescendant`, so arrow keys move a visual highlight without moving
 * DOM focus. Only mounted while open, so its query/active state resets per open.
 */
export function SelectPanel({
  baseId,
  listboxId,
  options,
  selected,
  multiple,
  searchable,
  loading,
  emptyText,
  searchPlaceholder,
  loadingText,
  listboxLabel,
  renderOption,
  onSelect,
  onClose,
}: SelectPanelProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => filterOptions(options, query),
    [options, query],
  );

  // Active row starts on the first selected option, else the first row. Held as
  // a value so it survives re-filtering; clamped to the filtered list on read.
  const firstSelected = filtered.find((option) => selected.has(option.value));
  const [activeValue, setActiveValue] = useState(
    () => firstSelected?.value ?? filtered[0]?.value ?? null,
  );
  const activeIndex = Math.max(
    0,
    filtered.findIndex((option) => option.value === activeValue),
  );
  const optionId = (index: number) => `${baseId}-opt-${index}`;

  // Focus the search input (or the listbox, when not searchable) on open.
  useEffect(() => {
    (searchable ? inputRef.current : listRef.current)?.focus();
  }, [searchable]);

  // Keep the active row scrolled into view as it moves. `scrollIntoView` is
  // optional-called: not every host (jsdom, older embedded webviews) implements
  // it, and a missing scroll must never break selection.
  useEffect(() => {
    const activeRow = document.getElementById(optionId(activeIndex));
    activeRow?.scrollIntoView?.({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const moveActive = (delta: number) => {
    if (filtered.length === 0) return;
    const next = (activeIndex + delta + filtered.length) % filtered.length;
    const nextOption = filtered[next];
    if (nextOption) setActiveValue(nextOption.value);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
        break;
      case "Home": {
        event.preventDefault();
        const first = filtered[0];
        if (first) setActiveValue(first.value);
        break;
      }
      case "End": {
        event.preventDefault();
        const last = filtered[filtered.length - 1];
        if (last) setActiveValue(last.value);
        break;
      }
      case "Enter": {
        event.preventDefault();
        const target = filtered[activeIndex];
        if (target && !target.disabled) onSelect(target.value);
        break;
      }
      case "Escape":
        event.preventDefault();
        onClose();
        break;
      default:
        break;
    }
  };

  const listbox = (
    <div
      ref={listRef}
      id={listboxId}
      role="listbox"
      aria-label={listboxLabel}
      aria-multiselectable={multiple || undefined}
      aria-activedescendant={
        filtered.length > 0 ? optionId(activeIndex) : undefined
      }
      tabIndex={searchable ? -1 : 0}
      className={styles.list}
      onKeyDown={searchable ? undefined : onKeyDown}
    >
      {filtered.map((option, index) => {
        const isSelected = selected.has(option.value);
        const isActive = index === activeIndex;
        // A group heading precedes the first option of each new group.
        const startsGroup =
          option.group != null && option.group !== filtered[index - 1]?.group;
        return (
          <Fragment key={option.value}>
            {startsGroup && (
              <div role="presentation" className={styles.groupLabel}>
                {option.group}
              </div>
            )}
            {/* An option button (not a focusable tab stop): the combobox keeps
                focus on the input and drives selection via aria-activedescendant,
                so each option carries tabIndex=-1 and is reached by pointer or
                the input's key handler. Mirrors MemberPicker's role="option". */}
            <button
              type="button"
              id={optionId(index)}
              role="option"
              tabIndex={-1}
              aria-selected={isSelected}
              disabled={option.disabled}
              data-active={isActive}
              className={[styles.option, isSelected && styles.optionSelected]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelect(option.value)}
              onMouseMove={() => setActiveValue(option.value)}
            >
              {renderOption ? (
                renderOption(option, { selected: isSelected, active: isActive })
              ) : (
                <>
                  <span className={styles.optionLabel}>{option.label}</span>
                  {isSelected && (
                    <FiCheck className={styles.check} aria-hidden />
                  )}
                </>
              )}
            </button>
          </Fragment>
        );
      })}
    </div>
  );

  return (
    <div className={styles.panel}>
      {searchable && (
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          className={styles.search}
          value={query}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          aria-expanded
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            filtered.length > 0 ? optionId(activeIndex) : undefined
          }
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
        />
      )}
      {loading ? (
        <div className={styles.status}>
          <Spinner /> {loadingText}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.status}>{emptyText}</div>
      ) : (
        listbox
      )}
    </div>
  );
}
