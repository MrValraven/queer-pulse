import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
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

/** Lower cases, strips accents (NFD, then combining marks), and trims, so a
 *  search folds "Saúde" and "saude" to the same text. Applied to both the
 *  query and each option's text before comparing. */
function foldForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Text the typeahead filter matches against, per option: the visible label
 *  (when it is a plain string) plus any extra `keywords`, so a caller adding
 *  keywords widens what matches while keeping the label itself searchable. */
function optionText(option: SelectOption): string {
  const labelText = typeof option.label === "string" ? option.label : "";
  return [labelText, option.keywords].filter(Boolean).join(" ");
}

function filterOptions(
  options: readonly SelectOption[],
  query: string,
): readonly SelectOption[] {
  const normalized = foldForSearch(query);
  if (!normalized) return options;
  return options.filter((option) =>
    foldForSearch(optionText(option)).includes(normalized),
  );
}

/** A row's option plus its absolute index into the filtered list, which is
 *  what `optionId` keys off, so it has to survive grouping. */
interface OptionRow {
  option: SelectOption;
  index: number;
}

/** A consecutive stretch of same-group rows. `group` is undefined for a run
 *  of ungrouped rows, which render with no heading and no wrapping element. */
interface OptionRun {
  group: string | undefined;
  items: OptionRow[];
}

/** Splits the filtered list into consecutive same-group runs, so each group's
 *  rows can be wrapped in one `role="group"` element together with their
 *  heading. Relies on `SelectOption.group`'s own contract ("first-seen order
 *  wins"): a field is expected to stay together in one contiguous stretch. */
function buildOptionRuns(options: readonly SelectOption[]): OptionRun[] {
  const runs: OptionRun[] = [];
  options.forEach((option, index) => {
    const previousRun = runs[runs.length - 1];
    if (previousRun && previousRun.group === option.group) {
      previousRun.items.push({ option, index });
    } else {
      runs.push({ group: option.group, items: [{ option, index }] });
    }
  });
  return runs;
}

interface SelectOptionListProps {
  listRef: RefObject<HTMLDivElement | null>;
  listboxId: string;
  listboxLabel: string;
  baseId: string;
  multiple: boolean;
  searchable: boolean;
  optionRuns: readonly OptionRun[];
  activeIndex: number;
  hasOptions: boolean;
  optionId: (index: number) => string;
  selected: ReadonlySet<string>;
  renderOption?: (option: SelectOption, state: SelectOptionState) => ReactNode;
  onSelect: (value: string) => void;
  onActivate: (value: string) => void;
  onKeyDown: (event: KeyboardEvent) => void;
}

/** The `role="listbox"` itself: an ungrouped run's rows sit directly under it,
 *  a grouped run's rows sit inside a `role="group"` named by its heading. */
function SelectOptionList({
  listRef,
  listboxId,
  listboxLabel,
  baseId,
  multiple,
  searchable,
  optionRuns,
  activeIndex,
  hasOptions,
  optionId,
  selected,
  renderOption,
  onSelect,
  onActivate,
  onKeyDown,
}: SelectOptionListProps) {
  // An option button that stays out of the tab order: the combobox keeps
  // focus on the input and drives selection via aria-activedescendant, so
  // each option carries tabIndex=-1 and is reached by pointer or the input's
  // key handler.
  const renderOptionRow = (option: SelectOption, index: number) => {
    const isSelected = selected.has(option.value);
    const isActive = index === activeIndex;
    return (
      <button
        key={option.value}
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
        onMouseMove={() => onActivate(option.value)}
      >
        {renderOption ? (
          renderOption(option, { selected: isSelected, active: isActive })
        ) : (
          <>
            <span className={styles.optionLabel}>{option.label}</span>
            {isSelected && <FiCheck className={styles.check} aria-hidden />}
          </>
        )}
      </button>
    );
  };

  return (
    <div
      ref={listRef}
      id={listboxId}
      role="listbox"
      aria-label={listboxLabel}
      aria-multiselectable={multiple || undefined}
      aria-activedescendant={hasOptions ? optionId(activeIndex) : undefined}
      tabIndex={searchable ? -1 : 0}
      className={styles.list}
      onKeyDown={searchable ? undefined : onKeyDown}
    >
      {optionRuns.map((run, runIndex) => {
        // An ungrouped run (option.group is unset) renders its rows directly
        // as listbox children, with no wrapping element and no heading.
        if (run.group == null) {
          return (
            <Fragment key={`run-${runIndex}`}>
              {run.items.map(({ option, index }) =>
                renderOptionRow(option, index),
              )}
            </Fragment>
          );
        }
        // A grouped run wraps its rows in role="group" named by its heading,
        // so listbox > group > option stays valid ARIA and a screen reader
        // announces each option's group name alongside its label.
        const headingId = `${baseId}-group-${runIndex}`;
        return (
          <div key={`run-${runIndex}`} role="group" aria-labelledby={headingId}>
            <div
              role="presentation"
              id={headingId}
              className={styles.groupLabel}
            >
              {run.group}
            </div>
            {run.items.map(({ option, index }) =>
              renderOptionRow(option, index),
            )}
          </div>
        );
      })}
    </div>
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
  const panelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => filterOptions(options, query),
    [options, query],
  );
  const optionRuns = useMemo(() => buildOptionRuns(filtered), [filtered]);

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

  // A trigger near the bottom of a short viewport (a phone's tab bar, an
  // embedded webview) can open a panel that renders partly off screen.
  // `{ block: "nearest" }` only scrolls the minimum needed to bring it fully
  // into view, and never smooth-scrolls (the browser default is instant), so
  // there is nothing extra to gate behind prefers-reduced-motion. Runs once,
  // since SelectPanel only mounts while open.
  //
  // Waits for the panel's own entrance animation (`qpMenuIn`, translateY +
  // scale) to finish first: measuring mid-animation reads a box that is still
  // short of its settled size, so a panel that only just fits ends up
  // scrolled short by that same amount. Under reduced motion the animation is
  // `none`, `getAnimations()` returns an empty list, and the scroll runs on
  // the next tick. `getAnimations` is itself optional-called for a host that
  // lacks it (jsdom), and the panel is checked for `isConnected` after the
  // wait, since the trigger can unmount it (a fast Escape, a fast selection)
  // before its animation settles.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const animations = panel.getAnimations?.() ?? [];
    Promise.all(animations.map((animation) => animation.finished))
      .catch(() => {})
      .finally(() => {
        if (panel.isConnected) panel.scrollIntoView?.({ block: "nearest" });
      });
  }, []);

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
    <SelectOptionList
      listRef={listRef}
      listboxId={listboxId}
      listboxLabel={listboxLabel}
      baseId={baseId}
      multiple={multiple}
      searchable={searchable}
      optionRuns={optionRuns}
      activeIndex={activeIndex}
      hasOptions={filtered.length > 0}
      optionId={optionId}
      selected={selected}
      renderOption={renderOption}
      onSelect={onSelect}
      onActivate={setActiveValue}
      onKeyDown={onKeyDown}
    />
  );

  return (
    <div ref={panelRef} className={styles.panel}>
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
