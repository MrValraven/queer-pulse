import { useCallback, useMemo, useState } from "react";
import { useLocalStorage, useMediaQuery } from "../../hooks";
import { mediaMax } from "../../theme/breakpoints";

interface FilterPageStateOptions<SectionKey extends string> {
  /** localStorage key for the desktop "show filters" choice, such as
   *  `qp.members.filtersPanelOpen`. Stored as a boolean. Register it in
   *  `shared/consent/storageInventory.ts` (the `panelLayout` entry). */
  panelStorageKey: string;
  /** localStorage key for which sections are open, such as
   *  `qp.members.filterSections`. Stored as `{ [sectionKey]: boolean }`;
   *  register it alongside the panel key. */
  sectionsStorageKey: string;
  /** Every section key on the page. A stored map missing any of them, or
   *  holding a non-boolean, is discarded for the all-collapsed default, so
   *  adding a section later resets the map cleanly. Pass a module constant. */
  sectionKeys: readonly SectionKey[];
}

export interface FilterPageState<SectionKey extends string> {
  /** Below the mobile cutover: filters live in the sheet. */
  isMobile: boolean;
  /** The desktop sidebar is shown. Persisted; starts shown. */
  isPanelOpen: boolean;
  togglePanel: () => void;
  /** Which sections are open. Persisted; every section starts collapsed. */
  sectionsOpen: Record<SectionKey, boolean>;
  toggleSection: (key: SectionKey) => void;
  /** The mobile filters sheet is open. Kept in memory only. */
  isSheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
}

/** The filter page's view state: the mobile cutover, the persisted sidebar
 *  and section open states, and the mobile sheet. It is view-only and never
 *  holds a filter value, so hiding the panel never clears a selection. A
 *  page calls it once (high enough that switching tabs keeps it) and hands
 *  the pieces to `FilterPageLayout`, `FilterSection`, `FiltersToggleButton`
 *  and `FiltersSheet`. */
export function useFilterPageState<SectionKey extends string>({
  panelStorageKey,
  sectionsStorageKey,
  sectionKeys,
}: FilterPageStateOptions<SectionKey>): FilterPageState<SectionKey> {
  // Below the grid's single-column breakpoint the filter sidebar would stack as
  // a tall wall above the results, so there it folds into a bottom sheet
  // opened from the Filters button. Matches the 860px grid breakpoint.
  const isMobile = useMediaQuery(mediaMax("mobile"));
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [isPanelOpen, setIsPanelOpen] = useLocalStorage<boolean>(
    panelStorageKey,
    true,
    (value): value is boolean => typeof value === "boolean",
  );

  const { allCollapsed, isSectionOpenMap } = useMemo(() => {
    const collapsed = Object.fromEntries(
      sectionKeys.map((key) => [key, false]),
    ) as Record<SectionKey, boolean>;
    const guard = (value: unknown): value is Record<SectionKey, boolean> => {
      if (typeof value !== "object" || value === null) return false;
      const record = value as Record<string, unknown>;
      return sectionKeys.every((key) => typeof record[key] === "boolean");
    };
    return { allCollapsed: collapsed, isSectionOpenMap: guard };
  }, [sectionKeys]);

  const [sectionsOpen, setSectionsOpen] = useLocalStorage<
    Record<SectionKey, boolean>
  >(sectionsStorageKey, allCollapsed, isSectionOpenMap);

  const togglePanel = useCallback(
    () => setIsPanelOpen((previous) => !previous),
    [setIsPanelOpen],
  );
  const toggleSection = useCallback(
    (key: SectionKey) =>
      setSectionsOpen((previous) => ({ ...previous, [key]: !previous[key] })),
    [setSectionsOpen],
  );
  const openSheet = useCallback(() => setIsSheetOpen(true), []);
  const closeSheet = useCallback(() => setIsSheetOpen(false), []);

  return {
    isMobile,
    isPanelOpen,
    togglePanel,
    sectionsOpen,
    toggleSection,
    isSheetOpen,
    openSheet,
    closeSheet,
  };
}
