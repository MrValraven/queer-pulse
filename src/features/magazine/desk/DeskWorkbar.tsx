import { useCallback, useRef, type ReactNode, type RefObject } from "react";
import { FiHelpCircle } from "react-icons/fi";
import {
  IconButton,
  SearchInput,
  SegmentedControl,
  Tooltip,
} from "../../../shared/components/ui";
import { cx } from "../../../shared/lib/cx";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { DeskActiveFilters } from "./DeskActiveFilters";
import { DeskFilterMenu, type DeskFilterMenuProps } from "./DeskFilterMenu";
import { DeskLayoutMenu } from "./DeskLayoutMenu";
import { DeskSortMenu, type DeskSortMenuProps } from "./DeskSortMenu";
import {
  deskLayoutChoices,
  DESK_SEARCH_PLACEHOLDER_KEYS,
} from "./deskWorkbar.data";
import { useDeskWorkbarFit } from "./useDeskWorkbarFit";
import styles from "./DeskWorkbar.module.css";

/** The layouts the work area can render in. Calendar is offered only while
 *  `isCalendarAvailable` is true. */
export type DeskLayoutOption = "list" | "board" | "plan" | "calendar";

export interface DeskWorkbarProps
  extends DeskFilterMenuProps, DeskSortMenuProps {
  query: string;
  onQuery: (value: string) => void;
  layout: DeskLayoutOption;
  onLayout: (layout: DeskLayoutOption) => void;
  /** False until the calendar layout ships; hides its segment. */
  isCalendarAvailable: boolean;
  /** Opens the keyboard shortcuts sheet. */
  onShortcuts: () => void;
  /** The search field, so the desk's "/" shortcut can focus it. */
  searchInputRef?: RefObject<HTMLInputElement | null>;
  /** The saved views menu (`DeskViewsMenu`), placed before Filter. The page
   *  owns the views data, so it arrives ready-made. */
  viewsMenu?: ReactNode;
  /** Whether the editor directory (`editors`) is still loading, passed
   *  straight through to `DeskActiveFilters`. */
  isEditorDirectoryLoading?: boolean;
}

/**
 * The desk's one toolbar band: search, the layout switch, Filter, Sort and
 * keyboard help, with the active filters spelled out underneath. Saved views,
 * when the page passes them, sit just before Filter.
 *
 * It replaces the old toolbar and the layout switch that sat in the header, so
 * everything that changes which pieces show, and how, lives in one row above
 * the table. Filter and Sort are menus to keep that row to one line at
 * 1280px; the tokens below make the Filter menu's state visible without
 * opening it. Everything here is ghost or outline, so the shell's Write stays
 * the page's one filled button.
 *
 * A narrower workbar keeps the one row: once the labelled layout switch
 * would squeeze search under its minimum (measured, so longer Portuguese
 * labels fold sooner than English ones: `useDeskWorkbarFit`), the switch
 * folds into `DeskLayoutMenu`; at phone width Views, Filter and Sort drop to
 * 44px icon buttons, so the first piece row still lands on the first screen.
 * The search placeholder is the longest form the field can show whole.
 */
export function DeskWorkbar({
  query,
  onQuery,
  layout,
  onLayout,
  isCalendarAvailable,
  onShortcuts,
  searchInputRef,
  viewsMenu,
  isEditorDirectoryLoading = false,
  sort,
  onSort,
  groupBy,
  onGroupBy,
  density,
  onDensity,
  ...filterProps
}: DeskWorkbarProps) {
  const { t, language } = useTranslation();
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { sections, stages, ...activeFilterProps } = filterProps;
  const placeholders = DESK_SEARCH_PLACEHOLDER_KEYS.map((key) => t(key));
  const layoutChoices = deskLayoutChoices(isCalendarAvailable);
  // The switch's own labels, so any change to them re-measures the fold.
  const layoutLabelsKey = [
    language,
    ...layoutChoices.map((choice) => t(choice.labelKey)),
  ].join("|");
  const { isLayoutFolded, placeholderIndex } = useDeskWorkbarFit(
    { rowRef, controlsRef, inputRef },
    placeholders,
    layoutLabelsKey,
  );
  // The desk's "/" shortcut focuses the field through `searchInputRef`; the
  // fit hook measures it through its own ref.
  const attachInput = useCallback(
    (input: HTMLInputElement | null) => {
      inputRef.current = input;
      if (searchInputRef) searchInputRef.current = input;
    },
    [searchInputRef],
  );

  const layoutOptions = layoutChoices.map((choice) => ({
    value: choice.value,
    label: <span className={styles.segmentLabel}>{t(choice.labelKey)}</span>,
    icon: <choice.icon aria-hidden />,
  }));
  const shortcutsLabel = t("magazine:desk.workbar.shortcutsAria");

  return (
    <div className={cx(styles.workbar, isLayoutFolded && styles.layoutFolded)}>
      <div ref={rowRef} className={styles.row}>
        <SearchInput
          value={query}
          onChange={onQuery}
          placeholder={placeholders[placeholderIndex]}
          ariaLabel={t("magazine:desk.toolbar.searchAria")}
          inputRef={attachInput}
          className={styles.search}
        />
        <div ref={controlsRef} className={styles.controls}>
          <SegmentedControl
            label={t("magazine:desk.header.layoutAria")}
            value={layout}
            onChange={(value) => onLayout(value as DeskLayoutOption)}
            options={layoutOptions}
            className={styles.layoutSwitch}
          />
          <DeskLayoutMenu
            layout={layout}
            onLayout={onLayout}
            isCalendarAvailable={isCalendarAvailable}
          />
          {viewsMenu}
          <DeskFilterMenu
            {...activeFilterProps}
            sections={sections}
            stages={stages}
            triggerRef={filterTriggerRef}
          />
          <DeskSortMenu
            sort={sort}
            onSort={onSort}
            groupBy={groupBy}
            onGroupBy={onGroupBy}
            density={density}
            onDensity={onDensity}
          />
          <span className={styles.help}>
            {/* Help is the row's last control, so a centred bubble would run
                past the workbar's right edge; end-aligning meets that edge
                instead. */}
            <Tooltip label={shortcutsLabel} align="end">
              <IconButton
                size="sm"
                aria-label={shortcutsLabel}
                onClick={onShortcuts}
              >
                <FiHelpCircle aria-hidden />
              </IconButton>
            </Tooltip>
          </span>
        </div>
      </div>
      <DeskActiveFilters
        {...activeFilterProps}
        isEditorDirectoryLoading={isEditorDirectoryLoading}
        onFocusLost={() => filterTriggerRef.current?.focus()}
      />
    </div>
  );
}
