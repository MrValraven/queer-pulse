import { useState, type ReactNode } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import {
  RefinePanel,
  RefineSplit,
  RefineToggle,
} from "../../shared/components/ui";
import { useRefineDrawer } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LocalAccessFilter } from "./LocalAccessFilter";
import { LocalCategoryFilter } from "./LocalCategoryFilter";
import { LocalQuickFilters } from "./LocalQuickFilters";
import { LocalSortFilter } from "./LocalSortFilter";
import { LocalVibeFilter } from "./LocalVibeFilter";
import type { LocalSort } from "./localPlaces";
import type { AccessibilitySlug } from "./listBusiness/listingAccessibility.data";
import s from "./LocalFilterBar.module.css";

export interface LocalFilterFieldsProps {
  /** The chosen place types (`?cat=`), in chip order. Empty means every type. */
  categories: string[];
  onToggleCategory: (categoryId: string) => void;
  onClearCategories: () => void;
  /** Live count per category id (+ "all"), reflecting the other active filters. */
  categoryCounts: Record<string, number>;
  query: string;
  onQueryChange: (value: string) => void;
  vibes: string[];
  onToggleVibe: (vibe: string) => void;
  /** Whether the "Verified safe spaces" filter (`?safe=verified`) is active. */
  safeOnly: boolean;
  onToggleSafeOnly: () => void;
  /** Whether the "Open now" filter (`?open=now`) is active. */
  openNow: boolean;
  onToggleOpenNow: () => void;
  /** Accessibility needs currently filtered on (`?access=`), all of which a
   *  place must meet to appear. */
  access: AccessibilitySlug[];
  onToggleAccess: (slug: AccessibilitySlug) => void;
  /** How the results are ordered. Sorting is a refinement, so the control lives
   *  inside the drawer with the filters rather than out on the results header,
   *  which leaves that header to say what it found. */
  sort: LocalSort;
  onSortChange: (next: string) => void;
  /** True while "use my location" is on. The sort control needs it because a
   *  known position changes what some sorts mean (see `LocalSortFilter`), and
   *  never because it overrides them. */
  isLocationOn: boolean;
  /** The "use my location" control, which rides the search row between the
   *  field and "Refine" — ordering the results is a refinement, and that row is
   *  where the other two live. Rendered by the `"bar"` and `"overlay"`
   *  variants: the mobile sheet is itself behind a tap, and distance is too
   *  central to bury there, so on phones the Local page keeps it in the
   *  results header instead. */
  nearMeSlot?: ReactNode;
  /** The List/Map switcher, which rides the far end of the search row so every
   *  control that shapes the results sits on one line. Rendered by the `"bar"`
   *  variant only: on phones the switcher lives in the sticky toolbar, where it
   *  stays reachable while scrolled deep into the list. */
  viewSlot?: ReactNode;
}

interface LocalFilterFieldsVariantProps extends LocalFilterFieldsProps {
  /**
   * Where this set is rendered. `"bar"` (default) is the desktop sticky bar,
   * where every filter collapses behind the "Refine" toggle so the bar stays
   * one row tall. `"sheet"` is the mobile Filters sheet, which is itself
   * already a collapsed surface — nesting a second drawer inside it would put
   * the place types two taps deep, so there the groups render flat.
   * `"overlay"` is the floating card inside the desktop full screen map: the
   * bar's row minus the List/Map switcher, with a drawer state of its own.
   */
  variant?: "bar" | "sheet" | "overlay";
  /** The active-filter chips and "Clear filters", placed straight under the
   *  search row and above the drawer, so they stay in view while the drawer is
   *  open. The full screen map card passes them; the page bar renders its own
   *  chips after the whole set. */
  activeFiltersSlot?: ReactNode;
}

/**
 * The filter set itself: search, then the groups. Place type, the two one-tap
 * narrowings (open now, verified safe spaces), access needs, and (demo-only)
 * vibe. Rendered inline in the desktop bar behind the "Refine" toggle, or flat
 * inside the mobile "Filters" sheet; one markup source so the two layouts never
 * diverge in behaviour.
 */
export function LocalFilterFields({
  categories,
  onToggleCategory,
  onClearCategories,
  categoryCounts,
  query,
  onQueryChange,
  vibes,
  onToggleVibe,
  safeOnly,
  onToggleSafeOnly,
  openNow,
  onToggleOpenNow,
  access,
  onToggleAccess,
  sort,
  onSortChange,
  isLocationOn,
  nearMeSlot,
  viewSlot,
  variant = "bar",
  activeFiltersSlot,
}: LocalFilterFieldsVariantProps) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  // Every filter collapses behind one toggle so the bar stays a single row;
  // the visitor's open/closed choice sticks per device. The map card keeps its
  // own key, so entering full screen opens on a shut drawer and the map stays
  // in view whatever the page's drawer was left at.
  const isOverlay = variant === "overlay";
  const refine = useRefineDrawer(
    isOverlay ? "qp.local.mapRefineOpen" : "qp.local.refineOpen",
  );
  // Vibe (Cozy/Loud/Chill) only ever has data on demo-only venues (`map.data`'s
  // `VENUES.vibe`) — a real business has no vibe-tag field at all (its
  // `photos.vibe` is an unrelated photo-caption slot, not a mood tag), so the
  // chips would silently do nothing to a real listing. Gated to demo mode only
  // (gap-audit HSG-8), matching this folder's existing `useDemoMode` gates
  // (`DirectoryAsideExtras`, `DirectoryAsideFooter`) until/unless a real
  // vibe-tag field exists on live businesses.
  const showVibeFilter = demoMode;
  // Surfaced on the collapsed toggle so hidden-but-active filters still read.
  // Every chosen place type counts as one filter, the same way each vibe and
  // each access need does, so the badge matches the chips applied.
  const activeRefineCount =
    vibes.length +
    access.length +
    categories.length +
    (safeOnly ? 1 : 0) +
    (openNow ? 1 : 0);
  // The field holds its own text. `query` lives in the URL, and the router
  // commits a URL change inside a transition, so a field bound straight to it
  // was reset to a stale value between fast keystrokes and dropped letters.
  // A change made elsewhere ("Clear filters", a removed chip) still reaches
  // the field: it is adopted during render, React's pattern for state that
  // follows a prop (see `AdminCommunityDetail`).
  const [searchText, setSearchText] = useState(query);
  const [previousQuery, setPreviousQuery] = useState(query);
  if (query !== previousQuery) {
    setPreviousQuery(query);
    setSearchText(query);
  }
  const changeSearchText = (next: string) => {
    setSearchText(next);
    onQueryChange(next);
  };

  const search = (
    <div className={s.search}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx={11} cy={11} r={7} />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="text"
        aria-label={t("marketing:local.filter.searchPlaceholder")}
        placeholder={t("marketing:local.filter.searchPlaceholder")}
        value={searchText}
        onChange={(event) => changeSearchText(event.target.value)}
        // Escape empties a filled field first. Claiming the key keeps the full
        // screen map open (useMapFullscreen leaves on any Escape left
        // unclaimed), so only an Escape in an empty field closes it.
        onKeyDown={(event) => {
          if (event.key !== "Escape" || searchText === "") return;
          event.preventDefault();
          changeSearchText("");
        }}
      />
    </div>
  );

  // The groups, in one place: the bar renders them inside the refine drawer,
  // the sheet renders them straight into its body. Each one is a band with the
  // same uppercase label, so the drawer reads as a stack of named sections
  // instead of loose chips.
  const groups = (
    <>
      <LocalCategoryFilter
        categories={categories}
        onToggleCategory={onToggleCategory}
        onClearCategories={onClearCategories}
        categoryCounts={categoryCounts}
      />
      {/* Ordering and the two one-tap narrowings share a band: all three are
          short controls, and side by side they fill a line the place-type chips
          have already made wide. */}
      <RefineSplit>
        <LocalSortFilter
          sort={sort}
          onSortChange={onSortChange}
          isLocationOn={isLocationOn}
        />
        <LocalQuickFilters
          openNow={openNow}
          onToggleOpenNow={onToggleOpenNow}
          safeOnly={safeOnly}
          onToggleSafeOnly={onToggleSafeOnly}
        />
      </RefineSplit>
      <LocalAccessFilter access={access} onToggleAccess={onToggleAccess} />
      {showVibeFilter && (
        <LocalVibeFilter vibes={vibes} onToggleVibe={onToggleVibe} />
      )}
    </>
  );

  if (variant === "sheet") {
    return (
      <>
        {search}
        {groups}
      </>
    );
  }

  return (
    <>
      <div className={isOverlay ? `${s.barRow} ${s.barRowOverlay}` : s.barRow}>
        {search}
        {nearMeSlot}
        <RefineToggle {...refine.toggleProps} activeCount={activeRefineCount} />
        {viewSlot && !isOverlay && <div className={s.viewSlot}>{viewSlot}</div>}
      </div>
      {activeFiltersSlot}
      {/* Inside the map's card the drawer sheds its own card, which would
          double the border and narrow the bands. */}
      <RefinePanel {...refine.panelProps} isFlat={isOverlay}>
        {groups}
      </RefinePanel>
    </>
  );
}
